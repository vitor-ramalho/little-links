import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { User, UserPlan } from '../users/entities/user.entity';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-05-28.basil',
    });
  }

  async createCheckoutSession(userId: string, priceId: string, plan: UserPlan) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
      });
      customerId = customer.id;
      await this.userRepository.update(userId, {
        stripeCustomerId: customerId,
      });
    }

    return this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${this.configService.get('FRONTEND_URL')}/success`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/pricing`,
      metadata: { userId: userId.toString(), plan },
    });
  }

  async createPortalSession(customerId: string) {
    return this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${this.configService.get('FRONTEND_URL')}/dashboard`,
    });
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }

    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionCanceled(event.data.object);
        break;
    }
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (!session.metadata?.userId || !session.metadata.plan) {
      throw new Error('Missing metadata in checkout session');
    }

    const userId = parseInt(session.metadata.userId);
    const plan = session.metadata.plan as UserPlan;

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    await this.userRepository.update(userId, {
      plan,
      stripeSubscriptionId: subscription.id,
    });
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const user = await this.userRepository.findOne({
      where: { stripeSubscriptionId: subscription.id },
    });

    if (user) {
      await this.userRepository.update(user.id, {
        plan: UserPlan.FREE,
        stripeSubscriptionId: undefined,
      });
    }
  }
}

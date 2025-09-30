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
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2024-06-20',
        });
    }

    async createCheckoutSession(userId: string, priceId: string, plan: UserPlan) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if(!user) {
            throw new Error('User not found');
        }
        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: user.email,
                name: user.name,
            });
            customerId = customer.id;
            await this.userRepository.update(userId, { stripeCustomerId: customerId });
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
        const event = this.stripe.webhooks.constructEvent(
            payload,
            signature,
            this.configService.get('STRIPE_WEBHOOK_SECRET'),
        );

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionCanceled(event.data.object as Stripe.Subscription);
                break;
        }
    }

    private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
        const userId = parseInt(session.metadata.userId);
        const plan = session.metadata.plan as UserPlan;

        const subscription = await this.stripe.subscriptions.retrieve(session.subscription as string);

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
                stripeSubscriptionId: null,
            });
        }
    }
}
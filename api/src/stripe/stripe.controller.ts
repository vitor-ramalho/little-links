import {
  Body,
  Controller,
  Headers,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserPlan } from '../users/entities/user.entity';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @GetUser() user: User,
    @Body() { priceId, plan }: { priceId: string; plan: UserPlan },
  ) {
    const session = await this.stripeService.createCheckoutSession(
      user.id,
      priceId,
      plan,
    );
    return { url: session.url };
  }

  @Post('portal')
  @UseGuards(JwtAuthGuard)
  async createPortal(@GetUser() user: User) {
    if (!user.stripeCustomerId) {
      throw new Error('No Stripe customer found');
    }
    const session = await this.stripeService.createPortalSession(
      user.stripeCustomerId,
    );
    return { url: session.url };
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) {
      throw new Error('Raw body is required for Stripe webhook');
    }

    await this.stripeService.handleWebhook(signature, req.rawBody);
    return { received: true };
  }
}

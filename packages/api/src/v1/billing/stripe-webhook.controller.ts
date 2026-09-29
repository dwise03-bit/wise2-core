import { BadRequestException, Controller, Headers, HttpCode, Post, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeWebhookHandler } from './stripe.webhook';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly handler: StripeWebhookHandler) {}

  @Post()
  @HttpCode(200)
  async receive(@Req() request: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    if (!signature) throw new BadRequestException('Missing stripe-signature header');
    if (!request.rawBody) throw new BadRequestException('Missing request body');
    const event = this.handler.verifyWebhookSignature(request.rawBody, signature);
    await this.handler.handleEvent(event);
    return { received: true };
  }
}

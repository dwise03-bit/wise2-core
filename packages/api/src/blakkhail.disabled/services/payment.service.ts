import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class BlakkhailPaymentService {
  private stripe: Stripe;

  constructor(private prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2024-06-20',
    });
  }

  async createPaymentIntent(orderId: string, amount: number, email: string) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: { orderId },
      receipt_email: email,
    });

    await this.prisma.blakkhailPayment.create({
      data: {
        orderId,
        stripePaymentIntentId: intent.id,
        amount: intent.amount / 100,
        currency: intent.currency,
        status: 'PENDING',
        paymentMethod: 'card',
      },
    });

    return {
      clientSecret: intent.client_secret,
      publishableKey: process.env.STRIPE_PUBLIC_KEY,
    };
  }

  async confirmPayment(orderId: string, paymentIntentId: string) {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (intent.status === 'succeeded') {
        await this.prisma.blakkhailPayment.update({
          where: { orderId },
          data: { status: 'SUCCEEDED' },
        });

        await this.prisma.blakkhailOrder.update({
          where: { id: orderId },
          data: { paymentStatus: 'PAID', status: 'PAID' },
        });

        return { success: true, status: 'succeeded' };
      }

      return { success: false, status: intent.status };
    } catch (error) {
      await this.prisma.blakkhailPayment.update({
        where: { orderId },
        data: {
          status: 'FAILED',
          errorMessage: error.message,
        },
      });

      throw error;
    }
  }

  async refundOrder(orderId: string, amount: number) {
    const payment = await this.prisma.blakkhailPayment.findUnique({
      where: { orderId },
    });

    if (!payment) throw new Error('Payment not found');

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(amount * 100),
    });

    await this.prisma.blakkhailPayment.update({
      where: { orderId },
      data: { status: 'REFUNDED' },
    });

    await this.prisma.blakkhailOrder.update({
      where: { id: orderId },
      data: { paymentStatus: 'REFUNDED', status: 'CANCELLED' },
    });

    return refund;
  }

  async getPaymentStatus(paymentIntentId: string) {
    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return intent.status;
  }
}

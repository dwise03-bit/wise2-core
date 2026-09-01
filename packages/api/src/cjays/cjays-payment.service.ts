import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';

export interface CjaysPaymentStatus {
  status: string;
  paidAmount: string;
  paymentMethod: string;
  receiptUrl: string;
  invoiceNumber: string;
}

export function cjaysPriceToCents(value: string): number {
  const normalized = value.replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new BadRequestException('Enter a valid job price');
  const cents = Math.round(Number(normalized) * 100);
  if (cents < 50 || cents > 99_999_999) throw new BadRequestException('Job price must be between $0.50 and $999,999.99');
  return cents;
}

@Injectable()
export class CjaysPaymentService {
  private readonly stripe: Stripe | null;

  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.STRIPE_SECRET_KEY;
    this.stripe = secret ? new Stripe(secret, { apiVersion: '2023-10-16' }) : null;
  }

  private requireStripe(): Stripe {
    if (!this.stripe) throw new ServiceUnavailableException('Stripe payments are not configured');
    return this.stripe;
  }

  async createCheckout(tenantId: string, jobClientId: string) {
    const stripe = this.requireStripe();
    const job = await this.prisma.cjaysJob.findUnique({ where: { tenantId_clientId: { tenantId, clientId: jobClientId } } });
    if (!job) throw new NotFoundException('CJAYS job not found');
    if (job.paymentStatus === 'paid') return { alreadyPaid: true, ...(await this.reconcile(tenantId, jobClientId)) };

    if (job.stripeCheckoutSessionId) {
      const existing = await stripe.checkout.sessions.retrieve(job.stripeCheckoutSessionId);
      if (existing.status === 'open' && existing.url) return { checkoutUrl: existing.url, sessionId: existing.id, alreadyPaid: false };
      if (existing.payment_status === 'paid') return { alreadyPaid: true, ...(await this.reconcile(tenantId, jobClientId)) };
    }

    const vehicle = await this.prisma.cjaysVehicle.findUnique({ where: { tenantId_clientId: { tenantId, clientId: job.vehicleClientId } } });
    const customer = vehicle?.customerClientId
      ? await this.prisma.cjaysCustomer.findUnique({ where: { tenantId_clientId: { tenantId, clientId: vehicle.customerClientId } } })
      : null;
    const amount = cjaysPriceToCents(job.price);
    const returnBase = (process.env.CJAYS_PAYMENT_RETURN_URL || 'https://wise2.net/cjay/payment').replace(/\/$/, '');
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: customer?.email || undefined,
      client_reference_id: `${tenantId}:${job.clientId}`,
      invoice_creation: { enabled: true },
      line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: amount, product_data: { name: `CJAYS — ${job.service}`, description: vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model} · VIN …${vehicle.vin.slice(-6)}` : `Job ${job.clientId}` } } }],
      metadata: { source: 'cjays', tenantId, jobClientId: job.clientId },
      payment_intent_data: { metadata: { source: 'cjays', tenantId, jobClientId: job.clientId } },
      success_url: `${returnBase}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnBase}?payment=cancelled`,
    }, { idempotencyKey: `cjays:${tenantId}:${job.clientId}:${amount}:${new Date().toISOString().slice(0, 10)}` });

    await this.prisma.cjaysJob.update({ where: { id: job.id }, data: { stripeCheckoutSessionId: session.id, paymentStatus: 'pending', paymentMethod: 'Stripe' } });
    return { checkoutUrl: session.url, sessionId: session.id, alreadyPaid: false };
  }

  async reconcile(tenantId: string, jobClientId: string): Promise<CjaysPaymentStatus> {
    const stripe = this.requireStripe();
    const job = await this.prisma.cjaysJob.findUnique({ where: { tenantId_clientId: { tenantId, clientId: jobClientId } } });
    if (!job) throw new NotFoundException('CJAYS job not found');
    if (!job.stripeCheckoutSessionId) return { status: job.paymentStatus, paidAmount: job.paidAmount, paymentMethod: job.paymentMethod, receiptUrl: job.receiptUrl, invoiceNumber: job.invoiceNumber };

    const session = await stripe.checkout.sessions.retrieve(job.stripeCheckoutSessionId, { expand: ['invoice', 'payment_intent.latest_charge'] });
    const paid = session.payment_status === 'paid';
    const intent = typeof session.payment_intent === 'object' ? session.payment_intent : null;
    const charge = intent && typeof intent.latest_charge === 'object' ? intent.latest_charge : null;
    const invoice = typeof session.invoice === 'object' ? session.invoice : null;
    const paidAmount = paid && session.amount_total != null ? (session.amount_total / 100).toFixed(2) : job.paidAmount;
    const receiptUrl = charge?.receipt_url || invoice?.hosted_invoice_url || job.receiptUrl;
    const invoiceNumber = invoice?.number || job.invoiceNumber;
    const status = paid ? 'paid' : session.status === 'expired' ? 'expired' : session.payment_status;
    await this.prisma.cjaysJob.update({ where: { id: job.id }, data: { paymentStatus: status, paidAmount, paymentMethod: paid ? 'Stripe' : job.paymentMethod, stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id, receiptUrl, invoiceNumber } });
    return { status, paidAmount, paymentMethod: paid ? 'Stripe' : job.paymentMethod, receiptUrl, invoiceNumber };
  }
}

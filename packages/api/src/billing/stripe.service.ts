import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface StripeCustomer {
  id: string
  email: string
  name?: string
  metadata?: Record<string, string>
}

export interface StripeSubscription {
  id: string
  customerId: string
  priceId: string
  status: 'active' | 'past_due' | 'unpaid' | 'canceled'
  currentPeriodStart: Date
  currentPeriodEnd: Date
}

export interface StripeInvoice {
  id: string
  customerId: string
  subscriptionId?: string
  amount: number
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  pdfUrl?: string
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger('StripeService')
  private stripeApiKey: string
  private readonly apiUrl = 'https://api.stripe.com/v1'

  constructor(private configService: ConfigService) {
    this.stripeApiKey = this.configService.get('STRIPE_SECRET_KEY') || ''
    if (this.stripeApiKey) {
      this.logger.log('💳 Stripe service initialized')
    } else {
      this.logger.warn('⚠️  STRIPE_SECRET_KEY not configured - payment features disabled')
    }
  }

  /**
   * Create a Stripe customer
   */
  async createCustomer(userId: string, email: string, name?: string): Promise<StripeCustomer> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured')
    }

    try {
      const response = await this.post('/customers', {
        email,
        name,
        metadata: { userId },
      })

      this.logger.log(`✅ Created Stripe customer for ${email}`)
      return {
        id: response.id,
        email: response.email,
        name: response.name,
        metadata: response.metadata,
      }
    } catch (error) {
      this.logger.error(`Failed to create customer: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Get a Stripe customer by ID
   */
  async getCustomer(customerId: string): Promise<StripeCustomer> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured')
    }

    try {
      const response = await this.get(`/customers/${customerId}`)
      return {
        id: response.id,
        email: response.email,
        name: response.name,
        metadata: response.metadata,
      }
    } catch (error) {
      this.logger.error(`Failed to get customer: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Create a subscription for a customer
   */
  async createSubscription(customerId: string, priceId: string, trialDays?: number): Promise<StripeSubscription> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured')
    }

    try {
      const params: Record<string, any> = {
        customer: customerId,
        items: [{ price: priceId }],
      }

      if (trialDays) {
        params.trial_period_days = trialDays
      }

      const response = await this.post('/subscriptions', params)

      this.logger.log(`✅ Created subscription for customer ${customerId}`)
      return {
        id: response.id,
        customerId: response.customer,
        priceId: response.items.data[0].price.id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start * 1000),
        currentPeriodEnd: new Date(response.current_period_end * 1000),
      }
    } catch (error) {
      this.logger.error(`Failed to create subscription: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Get subscription by ID
   */
  async getSubscription(subscriptionId: string): Promise<StripeSubscription> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured')
    }

    try {
      const response = await this.get(`/subscriptions/${subscriptionId}`)
      return {
        id: response.id,
        customerId: response.customer,
        priceId: response.items.data[0].price.id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start * 1000),
        currentPeriodEnd: new Date(response.current_period_end * 1000),
      }
    } catch (error) {
      this.logger.error(`Failed to get subscription: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Update a subscription (e.g., change plan)
   */
  async updateSubscription(subscriptionId: string, newPriceId: string): Promise<StripeSubscription> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured')
    }

    try {
      const subscription = await this.get(`/subscriptions/${subscriptionId}`)

      const response = await this.post(`/subscriptions/${subscriptionId}`, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'create_prorations',
      })

      this.logger.log(`✅ Updated subscription ${subscriptionId}`)
      return {
        id: response.id,
        customerId: response.customer,
        priceId: response.items.data[0].price.id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start * 1000),
        currentPeriodEnd: new Date(response.current_period_end * 1000),
      }
    } catch (error) {
      this.logger.error(`Failed to update subscription: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured')
    }

    try {
      const response = await this.delete(`/subscriptions/${subscriptionId}`)

      this.logger.log(`✅ Cancelled subscription ${subscriptionId}`)
      return {
        id: response.id,
        customerId: response.customer,
        priceId: response.items.data[0].price.id,
        status: response.status,
        currentPeriodStart: new Date(response.current_period_start * 1000),
        currentPeriodEnd: new Date(response.current_period_end * 1000),
      }
    } catch (error) {
      this.logger.error(`Failed to cancel subscription: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Get invoices for a customer
   */
  async getInvoices(customerId: string, limit: number = 10): Promise<StripeInvoice[]> {
    if (!this.stripeApiKey) {
      throw new BadRequestException('Stripe is not configured')
    }

    try {
      const response = await this.get('/invoices', { customer: customerId, limit })

      return response.data.map((invoice: any) => ({
        id: invoice.id,
        customerId: invoice.customer,
        subscriptionId: invoice.subscription,
        amount: invoice.amount_due,
        status: invoice.status,
        pdfUrl: invoice.invoice_pdf,
      }))
    } catch (error) {
      this.logger.error(`Failed to get invoices: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Handle Stripe webhook event
   */
  async handleWebhookEvent(event: any): Promise<void> {
    try {
      switch (event.type) {
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object)
          break
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object)
          break
        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event.data.object)
          break
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object)
          break
        default:
          this.logger.debug(`Unhandled Stripe event type: ${event.type}`)
      }
    } catch (error) {
      this.logger.error(`Failed to handle webhook: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.stripeApiKey) {
      return false
    }

    try {
      const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET')
      if (!webhookSecret) {
        this.logger.warn('STRIPE_WEBHOOK_SECRET not configured')
        return false
      }

      // In production, use crypto.timingSafeEqual for signature verification
      // This is a simplified version
      const crypto = require('crypto')
      const hash = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex')
      const signature_hash = signature.split(',')[1]?.split('=')[1]

      return hash === signature_hash
    } catch (error) {
      this.logger.error(`Failed to verify webhook signature: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  /**
   * Private helper methods
   */

  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    this.logger.log(`📢 Subscription updated: ${subscription.id}`)
    // TODO: Update database record
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    this.logger.log(`📢 Subscription deleted: ${subscription.id}`)
    // TODO: Update database record
  }

  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    this.logger.log(`💰 Invoice payment succeeded: ${invoice.id}`)
    // TODO: Update database record, send receipt email
  }

  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    this.logger.warn(`❌ Invoice payment failed: ${invoice.id}`)
    // TODO: Update database record, send retry email
  }

  private async post(path: string, data: Record<string, any>): Promise<any> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.stripeApiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(this.flattenObject(data)).toString(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Stripe error: ${error.error?.message || error.message}`)
    }

    return response.json()
  }

  private async get(path: string, params?: Record<string, any>): Promise<any> {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''

    const response = await fetch(`${this.apiUrl}${path}${query}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.stripeApiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Stripe error: ${error.error?.message || error.message}`)
    }

    return response.json()
  }

  private async delete(path: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.stripeApiKey}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Stripe error: ${error.error?.message || error.message}`)
    }

    return response.json()
  }

  private flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
    const result: Record<string, string> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        const newKey = prefix ? `${prefix}[${key}]` : key

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          Object.assign(result, this.flattenObject(value, newKey))
        } else if (Array.isArray(value)) {
          value.forEach((item, index) => {
            result[`${newKey}[${index}]`] = String(item)
          })
        } else {
          result[newKey] = String(value)
        }
      }
    }

    return result
  }

  /**
   * Check if Stripe is properly configured
   */
  getStatus(): {
    configured: boolean
    publishableKey?: string
  } {
    return {
      configured: !!this.stripeApiKey,
      publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
    }
  }
}

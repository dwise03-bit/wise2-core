import { Injectable } from '@nestjs/common'

@Injectable()
export class BillingService {
  async createSubscription(userId: string, planId: string, stripeToken: string) {
    return {
      success: true,
      subscription_id: 'sub_123',
      plan_id: planId,
      status: 'active',
    }
  }

  async getSubscription(userId: string) {
    return { plan_id: 'pro', status: 'active' }
  }

  async updateSubscription(userId: string, planId: string) {
    return { success: true, plan_id: planId }
  }

  async cancelSubscription(userId: string) {
    return { success: true }
  }

  async getInvoices(userId: string) {
    return []
  }
}

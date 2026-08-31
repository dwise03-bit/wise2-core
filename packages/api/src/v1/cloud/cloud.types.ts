export type CloudSubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'cancel_pending'
  | 'paused'
  | 'unpaid';

export type CloudPlanId = 'starter' | 'business' | 'pro';

export type CloudOrderState =
  | 'pending_payment'
  | 'paid'
  | 'queued'
  | 'provisioning'
  | 'active'
  | 'failed'
  | 'cancelled';

export interface CloudOrder {
  id: string;
  planId: CloudPlanId;
  email: string;
  domainName: string;
  state: CloudOrderState;
  stripeSessionId?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  stripePriceId?: string;
  subscriptionStatus?: CloudSubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  externalServiceId?: string;
  failureReason?: string;
  welcomeEmailSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CloudPlan {
  id: CloudPlanId;
  name: string;
  priceMonthly: number;
  twentyIPackageTypeId: string;
  twentyIPackageLabel: string;
  stripePriceId?: string;
  features: string[];
  highlight?: boolean;
}

export function isCloudSubscriptionActive(order: Pick<CloudOrder, 'subscriptionStatus' | 'state'>): boolean {
  if (order.state === 'active') {
    return true;
  }
  return order.subscriptionStatus === 'active' || order.subscriptionStatus === 'trialing';
}

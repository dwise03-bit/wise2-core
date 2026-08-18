import Stripe from "stripe";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export class StripeBillingService {
  constructor({ repository, secretKey, webhookSecret, priceId, appUrl, stripeClient } = {}) {
    this.repository = repository;
    this.webhookSecret = webhookSecret;
    this.priceId = priceId;
    this.appUrl = String(appUrl || "").replace(/\/$/, "");
    this.stripe = stripeClient || (secretKey ? new Stripe(secretKey) : null);
  }
  isConfigured() { return Boolean(this.stripe && this.webhookSecret && this.priceId && this.appUrl); }
  async createCheckout(user) {
    if (!this.isConfigured()) throw Object.assign(new Error("Pro subscription checkout is not configured yet."), { status:503, code:"BILLING_NOT_CONFIGURED" });
    const entitlement = await this.repository.getImageEntitlement(user.id);
    const session = await this.stripe.checkout.sessions.create({
      mode:"subscription", line_items:[{ price:this.priceId, quantity:1 }],
      ...(entitlement.stripeCustomerId ? { customer:entitlement.stripeCustomerId } : { customer_email:user.email }),
      client_reference_id:user.id, metadata:{ userId:user.id, plan:"pro" }, subscription_data:{ metadata:{ userId:user.id, plan:"pro" } },
      success_url:`${this.appUrl}/image-studio?checkout=success`, cancel_url:`${this.appUrl}/image-studio?checkout=cancelled`
    });
    return session.url;
  }
  async createPortal(userId) {
    if (!this.isConfigured()) throw Object.assign(new Error("Billing management is not configured yet."), { status:503, code:"BILLING_NOT_CONFIGURED" });
    const entitlement = await this.repository.getImageEntitlement(userId);
    if (!entitlement.stripeCustomerId) throw Object.assign(new Error("No billing account is connected to this user."), { status:404, code:"BILLING_ACCOUNT_NOT_FOUND" });
    return (await this.stripe.billingPortal.sessions.create({ customer:entitlement.stripeCustomerId, return_url:`${this.appUrl}/image-studio` })).url;
  }
  constructEvent(body, signature) { return this.stripe.webhooks.constructEvent(body, signature, this.webhookSecret); }
  async handleEvent(event) {
    const object = event.data.object;
    if (event.type === "checkout.session.completed" && object.mode === "subscription") {
      const userId = object.client_reference_id || object.metadata?.userId;
      if (userId) await this.repository.setImageEntitlement(userId, { plan:"pro", active:true, stripeCustomerId:String(object.customer), stripeSubscriptionId:String(object.subscription), stripeStatus:"active" });
    } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const userId = await this.repository.findUserIdByStripeCustomer(String(object.customer));
      if (userId) await this.repository.setImageEntitlement(userId, { plan:"pro", active:event.type === "invoice.paid", stripeCustomerId:String(object.customer), stripeStatus:event.type === "invoice.paid" ? "active" : "past_due" });
    } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const userId = object.metadata?.userId || await this.repository.findUserIdByStripeCustomer(String(object.customer));
      if (userId) await this.repository.setImageEntitlement(userId, { plan:"pro", active:event.type !== "customer.subscription.deleted" && ACTIVE_STATUSES.has(object.status), activeUntil:object.current_period_end ? new Date(object.current_period_end * 1000).toISOString() : null, stripeCustomerId:String(object.customer), stripeSubscriptionId:String(object.id), stripeStatus:object.status });
    }
  }
}

export function createStripeBillingService(repository, env = process.env, stripeClient) {
  return new StripeBillingService({ repository, secretKey:env.STRIPE_SECRET_KEY, webhookSecret:env.STRIPE_WEBHOOK_SECRET, priceId:env.STRIPE_PRO_PRICE_ID, appUrl:env.APP_URL, stripeClient });
}

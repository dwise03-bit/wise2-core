import Stripe from 'stripe';
export declare class BillingService {
    private stripe;
    constructor();
    /**
     * Create a Stripe checkout session for subscription
     */
    createCheckoutSession(userId: string, planId: string, email: string): Promise<{
        url: string | null;
        sessionId: string;
    }>;
    /**
     * Fulfill subscription after successful payment
     */
    fulfillSubscription(sessionId: string): Promise<{
        userId: string | undefined;
        stripeSubscriptionId: string;
        stripeCustomerId: string | Stripe.Customer | Stripe.DeletedCustomer;
        planId: string | undefined;
        status: Stripe.Subscription.Status;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
    }>;
    /**
     * Get subscription details
     */
    getSubscription(userId: string): Promise<{
        id: string;
        plan: string;
        status: string;
        currentPeriodStart: Date;
        currentPeriodEnd: Date;
        cancelAtPeriodEnd: boolean;
        priceMonthly: number;
    }>;
    /**
     * Upgrade or downgrade subscription
     */
    updateSubscription(userId: string, newPlanId: string): Promise<{
        success: boolean;
    }>;
    /**
     * Cancel subscription
     */
    cancelSubscription(userId: string, reason?: string): Promise<{
        success: boolean;
    }>;
    /**
     * Get invoices
     */
    getInvoices(userId: string, limit?: number): Promise<{
        id: string;
        amount: number;
        status: string;
        date: Date;
        pdfUrl: string;
    }[]>;
    /**
     * Webhook handler for Stripe events
     */
    handleWebhook(event: Stripe.Event): Promise<void>;
    private onSubscriptionCreated;
    private onSubscriptionUpdated;
    private onSubscriptionCanceled;
    private onInvoicePaid;
    private onInvoiceFailed;
}
//# sourceMappingURL=billing.service.d.ts.map
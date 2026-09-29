import { ConfigService } from '@nestjs/config';
export interface AnalyticsEvent {
    event: string;
    userId?: string;
    timestamp: Date;
    properties?: Record<string, any>;
    sessionId?: string;
}
export declare class EventsService {
    private configService;
    private readonly logger;
    private posthogEnabled;
    private eventBuffer;
    constructor(configService: ConfigService);
    /**
     * Track a user event
     */
    trackEvent(event: AnalyticsEvent): Promise<void>;
    /**
     * Track user registration
     */
    trackUserRegistered(userId: string, email: string, firstName: string): Promise<void>;
    /**
     * Track user login
     */
    trackUserLoggedIn(userId: string, provider?: string): Promise<void>;
    /**
     * Track OAuth login
     */
    trackOAuthLogin(userId: string, provider: 'google' | 'github'): Promise<void>;
    /**
     * Track subscription created
     */
    trackSubscriptionCreated(userId: string, plan: string, price: number): Promise<void>;
    /**
     * Track subscription updated
     */
    trackSubscriptionUpdated(userId: string, oldPlan: string, newPlan: string): Promise<void>;
    /**
     * Track subscription cancelled
     */
    trackSubscriptionCancelled(userId: string, plan: string, reason?: string): Promise<void>;
    /**
     * Track payment succeeded
     */
    trackPaymentSucceeded(userId: string, amount: number, invoiceId: string): Promise<void>;
    /**
     * Track payment failed
     */
    trackPaymentFailed(userId: string, amount: number, reason: string): Promise<void>;
    /**
     * Track project created
     */
    trackProjectCreated(userId: string, projectId: string, projectName: string): Promise<void>;
    /**
     * Track API call
     */
    trackApiCall(userId: string, endpoint: string, method: string, statusCode: number, duration: number): Promise<void>;
    /**
     * Get event buffer (for batch processing)
     */
    getEventBuffer(): AnalyticsEvent[];
    /**
     * Clear event buffer (after batch upload)
     */
    clearEventBuffer(): void;
    /**
     * Send event to PostHog
     */
    private sendToPostHog;
}
//# sourceMappingURL=events.service.d.ts.map
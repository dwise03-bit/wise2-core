import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AnalyticsEvent {
  event: string
  userId?: string
  timestamp: Date
  properties?: Record<string, any>
  sessionId?: string
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger('EventsService');
  private posthogEnabled: boolean;
  private eventBuffer: AnalyticsEvent[] = [];

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('POSTHOG_API_KEY');
    this.posthogEnabled = !!apiKey;
    if (this.posthogEnabled) {
      this.logger.log('📊 PostHog analytics enabled');
    } else {
      this.logger.log('📊 Analytics in mock mode (not sending to PostHog)');
    }
  }

  /**
   * Track a user event
   */
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // Add to buffer
      this.eventBuffer.push(event);

      if (this.posthogEnabled) {
        // Send to PostHog in production
        await this.sendToPostHog(event);
      } else {
        // Mock: just log it
        this.logger.debug(`📍 Event: ${event.event} | User: ${event.userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to track event: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Track user registration
   */
  async trackUserRegistered(userId: string, email: string, firstName: string): Promise<void> {
    await this.trackEvent({
      event: 'user_registered',
      userId,
      timestamp: new Date(),
      properties: { email, firstName },
    });
  }

  /**
   * Track user login
   */
  async trackUserLoggedIn(userId: string, provider?: string): Promise<void> {
    await this.trackEvent({
      event: 'user_logged_in',
      userId,
      timestamp: new Date(),
      properties: { provider: provider || 'email' },
    });
  }

  /**
   * Track OAuth login
   */
  async trackOAuthLogin(userId: string, provider: 'google' | 'github'): Promise<void> {
    await this.trackEvent({
      event: 'user_logged_in',
      userId,
      timestamp: new Date(),
      properties: { provider, method: 'oauth' },
    });
  }

  /**
   * Track subscription created
   */
  async trackSubscriptionCreated(userId: string, plan: string, price: number): Promise<void> {
    await this.trackEvent({
      event: 'subscription_created',
      userId,
      timestamp: new Date(),
      properties: { plan, price },
    });
  }

  /**
   * Track subscription updated
   */
  async trackSubscriptionUpdated(userId: string, oldPlan: string, newPlan: string): Promise<void> {
    await this.trackEvent({
      event: 'subscription_updated',
      userId,
      timestamp: new Date(),
      properties: { oldPlan, newPlan },
    });
  }

  /**
   * Track subscription cancelled
   */
  async trackSubscriptionCancelled(userId: string, plan: string, reason?: string): Promise<void> {
    await this.trackEvent({
      event: 'subscription_cancelled',
      userId,
      timestamp: new Date(),
      properties: { plan, reason },
    });
  }

  /**
   * Track payment succeeded
   */
  async trackPaymentSucceeded(userId: string, amount: number, invoiceId: string): Promise<void> {
    await this.trackEvent({
      event: 'payment_succeeded',
      userId,
      timestamp: new Date(),
      properties: { amount, invoiceId },
    });
  }

  /**
   * Track payment failed
   */
  async trackPaymentFailed(userId: string, amount: number, reason: string): Promise<void> {
    await this.trackEvent({
      event: 'payment_failed',
      userId,
      timestamp: new Date(),
      properties: { amount, reason },
    });
  }

  /**
   * Track project created
   */
  async trackProjectCreated(userId: string, projectId: string, projectName: string): Promise<void> {
    await this.trackEvent({
      event: 'project_created',
      userId,
      timestamp: new Date(),
      properties: { projectId, projectName },
    });
  }

  /**
   * Track API call
   */
  async trackApiCall(userId: string, endpoint: string, method: string, statusCode: number, duration: number): Promise<void> {
    await this.trackEvent({
      event: 'api_call',
      userId,
      timestamp: new Date(),
      properties: { endpoint, method, statusCode, duration },
    });
  }

  /**
   * Get event buffer (for batch processing)
   */
  getEventBuffer(): AnalyticsEvent[] {
    return [...this.eventBuffer];
  }

  /**
   * Clear event buffer (after batch upload)
   */
  clearEventBuffer(): void {
    this.eventBuffer = [];
  }

  /**
   * Send event to PostHog
   */
  private async sendToPostHog(event: AnalyticsEvent): Promise<void> {
    try {
      const apiKey = this.configService.get('POSTHOG_API_KEY');
      const apiUrl = this.configService.get('POSTHOG_API_URL', 'https://app.posthog.com');

      if (!apiKey) {
        return;
      }

      const response = await fetch(`${apiUrl}/engage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          event: event.event,
          distinct_id: event.userId,
          timestamp: event.timestamp.toISOString(),
          properties: event.properties,
        }),
      });

      if (!response.ok) {
        this.logger.warn(`PostHog API error: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send to PostHog: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

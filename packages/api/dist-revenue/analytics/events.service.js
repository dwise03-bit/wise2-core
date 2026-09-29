"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let EventsService = class EventsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger('EventsService');
        this.eventBuffer = [];
        const apiKey = this.configService.get('POSTHOG_API_KEY');
        this.posthogEnabled = !!apiKey;
        if (this.posthogEnabled) {
            this.logger.log('📊 PostHog analytics enabled');
        }
        else {
            this.logger.log('📊 Analytics in mock mode (not sending to PostHog)');
        }
    }
    /**
     * Track a user event
     */
    async trackEvent(event) {
        try {
            // Add to buffer
            this.eventBuffer.push(event);
            if (this.posthogEnabled) {
                // Send to PostHog in production
                await this.sendToPostHog(event);
            }
            else {
                // Mock: just log it
                this.logger.debug(`📍 Event: ${event.event} | User: ${event.userId}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to track event: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Track user registration
     */
    async trackUserRegistered(userId, email, firstName) {
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
    async trackUserLoggedIn(userId, provider) {
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
    async trackOAuthLogin(userId, provider) {
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
    async trackSubscriptionCreated(userId, plan, price) {
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
    async trackSubscriptionUpdated(userId, oldPlan, newPlan) {
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
    async trackSubscriptionCancelled(userId, plan, reason) {
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
    async trackPaymentSucceeded(userId, amount, invoiceId) {
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
    async trackPaymentFailed(userId, amount, reason) {
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
    async trackProjectCreated(userId, projectId, projectName) {
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
    async trackApiCall(userId, endpoint, method, statusCode, duration) {
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
    getEventBuffer() {
        return [...this.eventBuffer];
    }
    /**
     * Clear event buffer (after batch upload)
     */
    clearEventBuffer() {
        this.eventBuffer = [];
    }
    /**
     * Send event to PostHog
     */
    async sendToPostHog(event) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send to PostHog: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EventsService);
//# sourceMappingURL=events.service.js.map
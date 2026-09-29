export declare class AnalyticsService {
    /**
     * Track a user action in their journey
     */
    trackEvent(data: {
        userId?: string;
        workspaceId?: string;
        eventType: string;
        journeyStep?: string;
        metadata?: Record<string, any>;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<{
        success: boolean;
    }>;
    /**
     * Get user's journey steps
     */
    getUserJourney(userId: string): Promise<{
        userId: string;
        steps: {
            event: string;
            timestamp: Date;
        }[];
    }>;
    /**
     * Get workspace usage metrics
     */
    getWorkspaceUsage(workspaceId: string): Promise<{
        workspaceId: string;
        membersCount: number;
        membersLimit: number;
        memberPercentage: number;
        projectsCount: number;
        projectsLimit: number;
        projectsPercentage: number;
        activeUsers: number;
        lastActivityAt: Date;
    }>;
    /**
     * Get subscription analytics
     */
    getSubscriptionAnalytics(subscriptionId: string): Promise<{
        subscriptionId: string;
        daysActive: number;
        activityScore: number;
        lastActiveAt: Date;
        riskOfChurn: string;
        recommendedAction: string;
    }>;
    /**
     * Calculate churn risk and recommend actions
     */
    calculateChurnRisk(userId: string): Promise<{
        userId: string;
        riskScore: number;
        riskLevel: string;
        interventions: string[];
    }>;
    /**
     * Get recommended interventions for churn risk
     */
    private getInterventions;
    /**
     * Get company-wide dashboard metrics
     */
    getDashboardMetrics(): Promise<{
        totalUsers: number;
        activeSubscriptions: number;
        monthlyRecurringRevenue: number;
        churnRate: number;
        trialToPayRate: number;
        avgCustomerLifetimeValue: number;
        topPlans: {
            STARTER: number;
            PRO: number;
            ENTERPRISE: number;
        };
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map
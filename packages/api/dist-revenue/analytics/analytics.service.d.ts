export declare class AnalyticsService {
    trackEvent(userId: string, eventType: string, eventData: any): Promise<{
        success: boolean;
        event_id: string;
    }>;
    getUserAnalytics(userId: string, startDate: Date, endDate: Date): Promise<{
        total_projects: number;
        total_tracks: number;
        total_exports: number;
        active_days: number;
        average_session_duration: number;
    }>;
    getProjectAnalytics(projectId: string): Promise<{
        created_at: Date;
        last_edited: Date;
        collaborators: number;
        versions: number;
        exports: number;
    }>;
    getDashboardMetrics(): Promise<{
        total_users: number;
        active_users: number;
        total_projects: number;
        total_exports: number;
        mrr: number;
        churn_rate: number;
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map
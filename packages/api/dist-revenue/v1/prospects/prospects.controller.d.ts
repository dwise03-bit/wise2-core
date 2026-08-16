import { ProspectsService } from './prospects.service';
export declare class ProspectsController {
    private prospectsService;
    constructor(prospectsService: ProspectsService);
    /**
     * POST /v1/prospects
     * Create a new prospect from intake form
     */
    createProspect(body: {
        businessName: string;
        contactName: string;
        email: string;
        phone?: string;
        website?: string;
        industry?: string;
        primaryProblem: string;
        leadSource?: string;
        estimatedOpportunity?: number;
        notes?: string;
        tags?: string[];
    }): Promise<{
        email: string;
        id: string;
        status: import("@prisma/client").$Enums.ProspectStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        phone: string | null;
        businessName: string;
        contactName: string;
        website: string | null;
        industry: string | null;
        primaryProblem: string;
        leadSource: string;
        estimatedOpportunity: number;
        auditScheduledAt: Date | null;
        auditCompletedAt: Date | null;
        proposalSentAt: Date | null;
        wonAt: Date | null;
        lostAt: Date | null;
        lostReason: string | null;
    }>;
    /**
     * GET /v1/prospects
     * Get all prospects with optional filtering and search
     * Query params: status, search, sortBy, sortOrder, limit, offset
     */
    getProspects(status?: string, search?: string, sortBy?: string, sortOrder?: 'asc' | 'desc', limit?: string, offset?: string): Promise<{
        prospects: {
            email: string;
            id: string;
            status: import("@prisma/client").$Enums.ProspectStatus;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            phone: string | null;
            businessName: string;
            contactName: string;
            website: string | null;
            industry: string | null;
            primaryProblem: string;
            leadSource: string;
            estimatedOpportunity: number;
            auditScheduledAt: Date | null;
            auditCompletedAt: Date | null;
            proposalSentAt: Date | null;
            wonAt: Date | null;
            lostAt: Date | null;
            lostReason: string | null;
        }[];
        total: number;
        limit: number;
        offset: number;
    }>;
    /**
     * GET /v1/prospects/:id
     * Get a specific prospect
     */
    getProspect(id: string): Promise<{
        email: string;
        id: string;
        status: import("@prisma/client").$Enums.ProspectStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        phone: string | null;
        businessName: string;
        contactName: string;
        website: string | null;
        industry: string | null;
        primaryProblem: string;
        leadSource: string;
        estimatedOpportunity: number;
        auditScheduledAt: Date | null;
        auditCompletedAt: Date | null;
        proposalSentAt: Date | null;
        wonAt: Date | null;
        lostAt: Date | null;
        lostReason: string | null;
    } | null>;
    /**
     * PATCH /v1/prospects/:id
     * Update prospect information
     */
    updateProspect(id: string, body: {
        status?: string;
        notes?: string;
        estimatedOpportunity?: number;
        tags?: string[];
        auditScheduledAt?: Date;
        auditCompletedAt?: Date;
        proposalSentAt?: Date;
        wonAt?: Date;
        lostAt?: Date;
        lostReason?: string;
    }): Promise<{
        email: string;
        id: string;
        status: import("@prisma/client").$Enums.ProspectStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        phone: string | null;
        businessName: string;
        contactName: string;
        website: string | null;
        industry: string | null;
        primaryProblem: string;
        leadSource: string;
        estimatedOpportunity: number;
        auditScheduledAt: Date | null;
        auditCompletedAt: Date | null;
        proposalSentAt: Date | null;
        wonAt: Date | null;
        lostAt: Date | null;
        lostReason: string | null;
    }>;
    /**
     * PATCH /v1/prospects/:id/status
     * Change prospect status (with additional data like lost reason)
     */
    updateProspectStatus(id: string, body: {
        status: string;
        reason?: string;
    }): Promise<{
        email: string;
        id: string;
        status: import("@prisma/client").$Enums.ProspectStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        phone: string | null;
        businessName: string;
        contactName: string;
        website: string | null;
        industry: string | null;
        primaryProblem: string;
        leadSource: string;
        estimatedOpportunity: number;
        auditScheduledAt: Date | null;
        auditCompletedAt: Date | null;
        proposalSentAt: Date | null;
        wonAt: Date | null;
        lostAt: Date | null;
        lostReason: string | null;
    }>;
    /**
     * DELETE /v1/prospects/:id
     * Archive/delete a prospect
     */
    deleteProspect(id: string): Promise<{
        email: string;
        id: string;
        status: import("@prisma/client").$Enums.ProspectStatus;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        phone: string | null;
        businessName: string;
        contactName: string;
        website: string | null;
        industry: string | null;
        primaryProblem: string;
        leadSource: string;
        estimatedOpportunity: number;
        auditScheduledAt: Date | null;
        auditCompletedAt: Date | null;
        proposalSentAt: Date | null;
        wonAt: Date | null;
        lostAt: Date | null;
        lostReason: string | null;
    }>;
    /**
     * GET /v1/prospects/stats/pipeline
     * Get pipeline statistics by stage and total opportunity value
     */
    getPipelineStats(): Promise<{
        byStatus: {
            NEW: number;
            CONTACTED: number;
            QUALIFIED: number;
            AUDIT_SCHEDULED: number;
            AUDIT_COMPLETE: number;
            PROPOSAL_SENT: number;
            WON: number;
            LOST: number;
        };
        totalProspects: number;
        totalOpportunity: number;
        closedOpportunity: number;
        wonOpportunity: number;
        conversionRate: number;
    }>;
    /**
     * GET /v1/prospects/stats/lead-source
     * Get prospects grouped by lead source
     */
    getProspectsByLeadSource(): Promise<Record<string, any>>;
}
//# sourceMappingURL=prospects.controller.d.ts.map
import { ProspectStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class ProspectsService {
    private prisma;
    constructor(prisma: PrismaService);
    /**
     * Create a new prospect
     */
    createProspect(data: {
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
     * Get all prospects with optional filtering
     */
    getProspects(filters?: {
        status?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
        limit?: number;
        offset?: number;
    }): Promise<{
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
     * Get a single prospect by ID
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
     * Update prospect details
     */
    updateProspect(id: string, data: Partial<{
        status: ProspectStatus | string;
        notes: string;
        estimatedOpportunity: number;
        tags: string[];
        auditScheduledAt: Date;
        auditCompletedAt: Date;
        proposalSentAt: Date;
        wonAt: Date;
        lostAt: Date;
        lostReason: string;
    }>): Promise<{
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
     * Change prospect status
     */
    updateProspectStatus(id: string, status: string, additionalData?: any): Promise<{
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
     * Delete/archive prospect
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
     * Get prospect pipeline statistics
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
     * Get prospects by lead source
     */
    getProspectsByLeadSource(): Promise<Record<string, any>>;
}
//# sourceMappingURL=prospects.service.d.ts.map
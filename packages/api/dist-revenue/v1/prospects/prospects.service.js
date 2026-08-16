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
exports.ProspectsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProspectsService = class ProspectsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Create a new prospect
     */
    async createProspect(data) {
        return this.prisma.prospect.create({
            data: {
                businessName: data.businessName,
                contactName: data.contactName,
                email: data.email,
                phone: data.phone,
                website: data.website,
                industry: data.industry,
                primaryProblem: data.primaryProblem,
                leadSource: data.leadSource || 'DIRECT',
                estimatedOpportunity: data.estimatedOpportunity || 0,
                notes: data.notes,
                tags: data.tags || [],
            },
        });
    }
    /**
     * Get all prospects with optional filtering
     */
    async getProspects(filters) {
        const { status, search, sortBy = 'createdAt', sortOrder = 'desc', limit = 50, offset = 0 } = filters || {};
        const where = {};
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { businessName: { contains: search, mode: 'insensitive' } },
                { contactName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [prospects, total] = await Promise.all([
            this.prisma.prospect.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                take: limit,
                skip: offset,
            }),
            this.prisma.prospect.count({ where }),
        ]);
        return {
            prospects,
            total,
            limit,
            offset,
        };
    }
    /**
     * Get a single prospect by ID
     */
    async getProspect(id) {
        return this.prisma.prospect.findUnique({
            where: { id },
        });
    }
    /**
     * Update prospect details
     */
    async updateProspect(id, data) {
        const { status, ...rest } = data;
        const updateData = rest;
        if (status && Object.values(client_1.ProspectStatus).includes(status)) {
            updateData.status = status;
        }
        return this.prisma.prospect.update({
            where: { id },
            data: updateData,
        });
    }
    /**
     * Change prospect status
     */
    async updateProspectStatus(id, status, additionalData) {
        const updateData = { status };
        // Update timestamps based on status
        if (status === 'CONTACTED') {
            // Could set a timestamp here if needed
        }
        else if (status === 'AUDIT_SCHEDULED') {
            updateData.auditScheduledAt = new Date();
        }
        else if (status === 'AUDIT_COMPLETE') {
            updateData.auditCompletedAt = new Date();
        }
        else if (status === 'PROPOSAL_SENT') {
            updateData.proposalSentAt = new Date();
        }
        else if (status === 'WON') {
            updateData.wonAt = new Date();
        }
        else if (status === 'LOST') {
            updateData.lostAt = new Date();
            if (additionalData?.reason) {
                updateData.lostReason = additionalData.reason;
            }
        }
        return this.prisma.prospect.update({
            where: { id },
            data: updateData,
        });
    }
    /**
     * Delete/archive prospect
     */
    async deleteProspect(id) {
        return this.prisma.prospect.delete({
            where: { id },
        });
    }
    /**
     * Get prospect pipeline statistics
     */
    async getPipelineStats() {
        const prospects = await this.prisma.prospect.findMany();
        const statsByStatus = {
            NEW: 0,
            CONTACTED: 0,
            QUALIFIED: 0,
            AUDIT_SCHEDULED: 0,
            AUDIT_COMPLETE: 0,
            PROPOSAL_SENT: 0,
            WON: 0,
            LOST: 0,
        };
        let totalOpportunity = 0;
        let closedOpportunity = 0;
        let wonOpportunity = 0;
        prospects.forEach((prospect) => {
            statsByStatus[prospect.status]++;
            totalOpportunity += prospect.estimatedOpportunity;
            if (prospect.status === 'WON' || prospect.status === 'LOST') {
                closedOpportunity += prospect.estimatedOpportunity;
            }
            if (prospect.status === 'WON') {
                wonOpportunity += prospect.estimatedOpportunity;
            }
        });
        return {
            byStatus: statsByStatus,
            totalProspects: prospects.length,
            totalOpportunity,
            closedOpportunity,
            wonOpportunity,
            conversionRate: prospects.length > 0 ? (statsByStatus.WON / prospects.length) * 100 : 0,
        };
    }
    /**
     * Get prospects by lead source
     */
    async getProspectsByLeadSource() {
        const prospects = await this.prisma.prospect.findMany();
        const bySource = {};
        prospects.forEach((prospect) => {
            if (!bySource[prospect.leadSource]) {
                bySource[prospect.leadSource] = {
                    count: 0,
                    opportunity: 0,
                };
            }
            bySource[prospect.leadSource].count++;
            bySource[prospect.leadSource].opportunity += prospect.estimatedOpportunity;
        });
        return bySource;
    }
};
exports.ProspectsService = ProspectsService;
exports.ProspectsService = ProspectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProspectsService);
//# sourceMappingURL=prospects.service.js.map
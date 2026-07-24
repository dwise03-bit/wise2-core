import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import {
  AuditSession,
  Finding,
  Proposal,
  ProposalLineItem,
  ServiceCatalogItem,
} from '@wise2/db';

@Injectable()
export class AuditsService {
  constructor(private prisma: PrismaService) {}

  // ========== AUDIT SESSION ==========

  async createAuditSession(prospectId: string, data?: any): Promise<AuditSession> {
    return this.prisma.auditSession.create({
      data: {
        prospectId,
        status: 'SCHEDULED',
        ...data,
      },
      include: {
        prospect: true,
        findings: true,
      },
    });
  }

  async getAuditSession(sessionId: string): Promise<AuditSession | null> {
    return this.prisma.auditSession.findUnique({
      where: { id: sessionId },
      include: {
        prospect: true,
        findings: true,
        proposals: true,
      },
    });
  }

  async getAuditSessionByProspect(prospectId: string): Promise<AuditSession | null> {
    return this.prisma.auditSession.findUnique({
      where: { prospectId },
      include: {
        prospect: true,
        findings: true,
        proposals: true,
      },
    });
  }

  async updateAuditSession(sessionId: string, data: any): Promise<AuditSession> {
    return this.prisma.auditSession.update({
      where: { id: sessionId },
      data,
      include: {
        prospect: true,
        findings: true,
      },
    });
  }

  // ========== FINDINGS ==========

  async getFindings(auditSessionId: string): Promise<Finding[]> {
    return this.prisma.finding.findMany({
      where: { auditSessionId },
      orderBy: { severity: 'asc' },
    });
  }

  async getFinding(findingId: string): Promise<Finding | null> {
    return this.prisma.finding.findUnique({
      where: { id: findingId },
    });
  }

  async createFinding(auditSessionId: string, data: any): Promise<Finding> {
    return this.prisma.finding.create({
      data: {
        auditSessionId,
        ...data,
      },
    });
  }

  async updateFinding(findingId: string, data: any): Promise<Finding> {
    return this.prisma.finding.update({
      where: { id: findingId },
      data,
    });
  }

  async deleteFinding(findingId: string): Promise<Finding> {
    return this.prisma.finding.delete({
      where: { id: findingId },
    });
  }

  async toggleFindingHidden(findingId: string): Promise<Finding> {
    const finding = await this.prisma.finding.findUnique({
      where: { id: findingId },
    });
    return this.prisma.finding.update({
      where: { id: findingId },
      data: { isHidden: !finding?.isHidden },
    });
  }

  // ========== PROPOSALS ==========

  async createProposal(prospectId: string, data: any): Promise<Proposal> {
    return this.prisma.proposal.create({
      data: {
        prospectId,
        ...data,
      },
      include: {
        prospect: true,
        auditSession: true,
        lineItems: true,
      },
    });
  }

  async getProposals(prospectId: string): Promise<Proposal[]> {
    return this.prisma.proposal.findMany({
      where: { prospectId },
      include: {
        lineItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProposal(proposalId: string): Promise<Proposal | null> {
    return this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        prospect: true,
        auditSession: true,
        lineItems: true,
      },
    });
  }

  async updateProposal(proposalId: string, data: any): Promise<Proposal> {
    return this.prisma.proposal.update({
      where: { id: proposalId },
      data,
      include: {
        prospect: true,
        auditSession: true,
        lineItems: true,
      },
    });
  }

  async updateProposalStatus(
    proposalId: string,
    status: string,
  ): Promise<Proposal> {
    const updateData: any = { status };

    if (status === 'SENT') {
      updateData.sentAt = new Date();
    } else if (status === 'VIEWED') {
      updateData.viewedAt = new Date();
    } else if (status === 'ACCEPTED') {
      updateData.acceptedAt = new Date();
    } else if (status === 'DECLINED') {
      updateData.declinedAt = new Date();
    }

    return this.prisma.proposal.update({
      where: { id: proposalId },
      data: updateData,
      include: {
        prospect: true,
        auditSession: true,
        lineItems: true,
      },
    });
  }

  // ========== PROPOSAL LINE ITEMS ==========

  async addProposalLineItem(proposalId: string, data: any): Promise<ProposalLineItem> {
    return this.prisma.proposalLineItem.create({
      data: {
        proposalId,
        ...data,
      },
    });
  }

  async removeProposalLineItem(lineItemId: string): Promise<ProposalLineItem> {
    return this.prisma.proposalLineItem.delete({
      where: { id: lineItemId },
    });
  }

  async updateProposalLineItem(lineItemId: string, data: any): Promise<ProposalLineItem> {
    return this.prisma.proposalLineItem.update({
      where: { id: lineItemId },
      data,
    });
  }

  // ========== SERVICE CATALOG ==========

  async getServiceCatalog(): Promise<ServiceCatalogItem[]> {
    return this.prisma.serviceCatalogItem.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getServiceCatalogItem(itemId: string): Promise<ServiceCatalogItem | null> {
    return this.prisma.serviceCatalogItem.findUnique({
      where: { id: itemId },
    });
  }

  async createServiceCatalogItem(data: any): Promise<ServiceCatalogItem> {
    return this.prisma.serviceCatalogItem.create({ data });
  }

  async updateServiceCatalogItem(
    itemId: string,
    data: any,
  ): Promise<ServiceCatalogItem> {
    return this.prisma.serviceCatalogItem.update({
      where: { id: itemId },
      data,
    });
  }

  // ========== AI ANALYSIS ==========

  /**
   * Stub for AI analysis - will be implemented with Claude API
   * Analyzes audit transcript and generates findings
   */
  async analyzeAuditSession(sessionId: string): Promise<void> {
    const session = await this.getAuditSession(sessionId);
    if (!session || !session.transcript) {
      throw new Error('No transcript available for analysis');
    }

    try {
      // Update status to ANALYZING
      await this.updateAuditSession(sessionId, {
        analysisStatus: 'ANALYZING',
      });

      // TODO: Call Claude API to analyze transcript
      // const findings = await this.analyzeWithClaude(session.transcript);

      // For now, generate stub findings
      const stubFindings = this.generateStubFindings();

      // Create findings in database
      for (const finding of stubFindings) {
        await this.createFinding(sessionId, finding);
      }

      // Calculate summary metrics
      const findings = await this.getFindings(sessionId);
      const totalMoneyLeaks = findings.reduce((sum, f) => sum + (f.estimatedAnnualImpact || 0), 0);
      const estimatedROI = totalMoneyLeaks * 3; // Rough estimate

      // Update audit session with results
      await this.updateAuditSession(sessionId, {
        analysisStatus: 'COMPLETED',
        analyzedAt: new Date(),
        aiReadinessScore: 65, // Stub score
        scoreDetails: {
          techStack: 45,
          processAutomation: 62,
          aiAdoption: 55,
          dataQuality: 78,
        },
        totalMoneyLeaks,
        estimatedROI,
      });
    } catch (error) {
      await this.updateAuditSession(sessionId, {
        analysisStatus: 'FAILED',
        analysisErrorMsg: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private generateStubFindings(): any[] {
    return [
      {
        title: 'Manual Email Reconciliation Process',
        description:
          'Your accounting team manually reconciles supplier invoices against purchase orders in spreadsheets. This could be automated with AI.',
        category: 'AUTOMATION_OPPORTUNITY',
        severity: 'HIGH',
        evidenceSnippet:
          'We spend about 20 hours per week manually matching invoices to POs in Excel',
        recommendedAction:
          'Implement AI-powered invoice processing and auto-reconciliation system',
        estimatedAnnualImpact: 52000,
        implementationDays: 14,
      },
      {
        title: 'Duplicate SaaS Subscriptions',
        description:
          'Multiple teams have separate subscriptions for project management tools when consolidation is possible.',
        category: 'COST_LEAK',
        severity: 'MEDIUM',
        evidenceSnippet:
          'We have Asana, Monday.com, and Jira - paying for overlapping functionality',
        recommendedAction: 'Conduct SaaS audit and consolidate redundant tools',
        estimatedAnnualImpact: 18000,
        implementationDays: 5,
      },
      {
        title: 'Manual Customer Onboarding Delays',
        description:
          'New customer setup requires 4-5 manual back-and-forth emails and document processing.',
        category: 'PROCESS_GAP',
        severity: 'HIGH',
        evidenceSnippet:
          'Our average onboarding takes 10 business days due to manual document collection and verification',
        recommendedAction:
          'Deploy AI-powered customer onboarding portal with automated document processing',
        estimatedAnnualImpact: 35000,
        implementationDays: 21,
      },
    ];
  }
}

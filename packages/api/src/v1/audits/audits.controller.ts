import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuditsService } from './audits.service';

@Controller('api/v1/audits')
export class AuditsController {
  constructor(private auditsService: AuditsService) {}

  // ========== AUDIT SESSIONS ==========

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  async createAuditSession(@Body() body: { prospectId: string; transcript?: string }) {
    return this.auditsService.createAuditSession(body.prospectId, {
      transcript: body.transcript,
    });
  }

  @Get('sessions/:sessionId')
  async getAuditSession(@Param('sessionId') sessionId: string) {
    return this.auditsService.getAuditSession(sessionId);
  }

  @Get('prospects/:prospectId/session')
  async getAuditSessionByProspect(@Param('prospectId') prospectId: string) {
    return this.auditsService.getAuditSessionByProspect(prospectId);
  }

  @Put('sessions/:sessionId')
  async updateAuditSession(
    @Param('sessionId') sessionId: string,
    @Body() body: any,
  ) {
    return this.auditsService.updateAuditSession(sessionId, body);
  }

  // ========== FINDINGS ==========

  @Get('sessions/:sessionId/findings')
  async getFindings(@Param('sessionId') sessionId: string) {
    return this.auditsService.getFindings(sessionId);
  }

  @Get('findings/:findingId')
  async getFinding(@Param('findingId') findingId: string) {
    return this.auditsService.getFinding(findingId);
  }

  @Post('sessions/:sessionId/findings')
  @HttpCode(HttpStatus.CREATED)
  async createFinding(
    @Param('sessionId') sessionId: string,
    @Body() body: any,
  ) {
    return this.auditsService.createFinding(sessionId, body);
  }

  @Put('findings/:findingId')
  async updateFinding(
    @Param('findingId') findingId: string,
    @Body() body: any,
  ) {
    return this.auditsService.updateFinding(findingId, body);
  }

  @Delete('findings/:findingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFinding(@Param('findingId') findingId: string) {
    await this.auditsService.deleteFinding(findingId);
  }

  @Put('findings/:findingId/toggle-hidden')
  async toggleFindingHidden(@Param('findingId') findingId: string) {
    return this.auditsService.toggleFindingHidden(findingId);
  }

  // ========== AI ANALYSIS ==========

  @Post('sessions/:sessionId/analyze')
  @HttpCode(HttpStatus.ACCEPTED)
  async analyzeAuditSession(@Param('sessionId') sessionId: string) {
    // Start analysis asynchronously
    this.auditsService.analyzeAuditSession(sessionId).catch(console.error);
    return { message: 'Analysis started', sessionId };
  }

  // ========== PROPOSALS ==========

  @Post('proposals')
  @HttpCode(HttpStatus.CREATED)
  async createProposal(
    @Body() body: {
      prospectId: string;
      auditSessionId?: string;
      title: string;
      summary: string;
      problemStatement: string;
      proposedSolution: string;
    },
  ) {
    return this.auditsService.createProposal(body.prospectId, body);
  }

  @Get('prospects/:prospectId/proposals')
  async getProposals(@Param('prospectId') prospectId: string) {
    return this.auditsService.getProposals(prospectId);
  }

  @Get('proposals/:proposalId')
  async getProposal(@Param('proposalId') proposalId: string) {
    return this.auditsService.getProposal(proposalId);
  }

  @Put('proposals/:proposalId')
  async updateProposal(
    @Param('proposalId') proposalId: string,
    @Body() body: any,
  ) {
    return this.auditsService.updateProposal(proposalId, body);
  }

  @Put('proposals/:proposalId/status')
  async updateProposalStatus(
    @Param('proposalId') proposalId: string,
    @Body() body: { status: string },
  ) {
    return this.auditsService.updateProposalStatus(proposalId, body.status);
  }

  // ========== PROPOSAL LINE ITEMS ==========

  @Post('proposals/:proposalId/line-items')
  @HttpCode(HttpStatus.CREATED)
  async addProposalLineItem(
    @Param('proposalId') proposalId: string,
    @Body() body: any,
  ) {
    return this.auditsService.addProposalLineItem(proposalId, body);
  }

  @Delete('line-items/:lineItemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeProposalLineItem(@Param('lineItemId') lineItemId: string) {
    await this.auditsService.removeProposalLineItem(lineItemId);
  }

  @Put('line-items/:lineItemId')
  async updateProposalLineItem(
    @Param('lineItemId') lineItemId: string,
    @Body() body: any,
  ) {
    return this.auditsService.updateProposalLineItem(lineItemId, body);
  }

  // ========== SERVICE CATALOG ==========

  @Get('services')
  async getServiceCatalog() {
    return this.auditsService.getServiceCatalog();
  }

  @Get('services/:serviceId')
  async getServiceCatalogItem(@Param('serviceId') serviceId: string) {
    return this.auditsService.getServiceCatalogItem(serviceId);
  }

  @Post('services')
  @HttpCode(HttpStatus.CREATED)
  async createServiceCatalogItem(@Body() body: any) {
    return this.auditsService.createServiceCatalogItem(body);
  }

  @Put('services/:serviceId')
  async updateServiceCatalogItem(
    @Param('serviceId') serviceId: string,
    @Body() body: any,
  ) {
    return this.auditsService.updateServiceCatalogItem(serviceId, body);
  }
}

import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ConsultingAuditService } from './consulting-audit.service';

@Controller('consulting')
export class ConsultingAuditController {
  constructor(private readonly consultingService: ConsultingAuditService) {}

  // ===== CLIENTS =====
  @Post('clients')
  async createClient(@Body() data: any) {
    return this.consultingService.createClient(data);
  }

  @Get('clients/:clientId')
  async getClient(@Param('clientId') clientId: string) {
    return this.consultingService.getClient(clientId);
  }

  @Get('workspaces/:workspaceId/clients')
  async listClients(@Param('workspaceId') workspaceId: string) {
    return this.consultingService.listClients(workspaceId);
  }

  @Patch('clients/:clientId')
  async updateClient(@Param('clientId') clientId: string, @Body() data: any) {
    return this.consultingService.updateClient(clientId, data);
  }

  @Patch('clients/:clientId/audit-score')
  async updateAuditScore(@Param('clientId') clientId: string, @Body() body: { score: number }) {
    return this.consultingService.updateAuditScore(clientId, body.score);
  }

  @Patch('clients/:clientId/status')
  async updateClientStatus(@Param('clientId') clientId: string, @Body() body: { status: string }) {
    return this.consultingService.updateClientStatus(clientId, body.status);
  }

  // ===== INTAKE =====
  @Post('clients/:clientId/intake')
  async submitIntakeResponse(@Param('clientId') clientId: string, @Body() body: { responses: Record<string, any> }) {
    return this.consultingService.submitIntakeResponse({ clientId, responses: body.responses });
  }

  @Get('clients/:clientId/intake')
  async getIntakeResponses(@Param('clientId') clientId: string) {
    const prisma = (this.consultingService as any).prisma;
    return prisma.consultingIntakeResponse.findMany({ where: { clientId } });
  }

  // ===== SESSIONS =====
  @Post('clients/:clientId/sessions')
  async createSession(@Param('clientId') clientId: string, @Body() body: any) {
    return this.consultingService.createSession({ clientId, ...body });
  }

  @Get('sessions/:sessionId')
  async getSession(@Param('sessionId') sessionId: string) {
    return this.consultingService.getSession(sessionId);
  }

  @Post('sessions/:sessionId/start')
  async startSession(@Param('sessionId') sessionId: string) {
    return this.consultingService.startSession(sessionId);
  }

  @Post('sessions/:sessionId/end')
  async endSession(@Param('sessionId') sessionId: string) {
    return this.consultingService.endSession(sessionId);
  }

  // ===== RECORDINGS =====
  @Post('sessions/:sessionId/recordings')
  async createRecording(@Param('sessionId') sessionId: string, @Body() body: any) {
    return this.consultingService.createRecording({ sessionId, ...body });
  }

  @Get('sessions/:sessionId/recordings')
  async getSessionRecordings(@Param('sessionId') sessionId: string) {
    return this.consultingService.getSessionRecordings(sessionId);
  }

  @Patch('recordings/:recordingId/transcript')
  async updateTranscript(@Param('recordingId') recordingId: string, @Body() body: { transcript: string }) {
    return this.consultingService.updateRecordingTranscription(recordingId, body.transcript);
  }

  // ===== FINDINGS =====
  @Post('clients/:clientId/findings')
  async createFinding(@Param('clientId') clientId: string, @Body() body: any) {
    return this.consultingService.createFinding({ clientId, ...body });
  }

  @Get('clients/:clientId/findings')
  async getFindings(@Param('clientId') clientId: string) {
    return this.consultingService.getClientFindings(clientId);
  }

  @Post('findings/:findingId/approve')
  async approveFinding(@Param('findingId') findingId: string, @Body() body: { approvedBy: string }) {
    return this.consultingService.approveFinding(findingId, body.approvedBy);
  }

  // ===== TASKS =====
  @Post('clients/:clientId/tasks')
  async createTask(@Param('clientId') clientId: string, @Body() body: any) {
    return this.consultingService.createTask({ clientId, ...body });
  }

  @Get('clients/:clientId/tasks')
  async getTasks(@Param('clientId') clientId: string) {
    return this.consultingService.getClientTasks(clientId);
  }

  @Patch('tasks/:taskId/status')
  async updateTaskStatus(@Param('taskId') taskId: string, @Body() body: { status: string }) {
    return this.consultingService.updateTaskStatus(taskId, body.status);
  }

  // ===== RESEARCH =====
  @Post('clients/:clientId/research')
  async createResearch(@Param('clientId') clientId: string, @Body() body: any) {
    return this.consultingService.createResearchItem({ clientId, ...body });
  }

  @Get('clients/:clientId/research')
  async getResearch(@Param('clientId') clientId: string) {
    return this.consultingService.getClientResearch(clientId);
  }

  // ===== IMPLEMENTATION PLAN =====
  @Post('clients/:clientId/plan')
  async createPlan(@Param('clientId') clientId: string, @Body() body: any) {
    return this.consultingService.createImplementationPlan({ clientId, ...body });
  }

  @Get('clients/:clientId/plan')
  async getPlan(@Param('clientId') clientId: string) {
    return this.consultingService.getClientPlan(clientId);
  }

  @Post('plans/:planId/approve')
  async approvePlan(@Param('planId') planId: string, @Body() body: { approvedBy: string }) {
    return this.consultingService.approvePlan(planId, body.approvedBy);
  }

  // ===== SESSION SUMMARY =====
  @Patch('sessions/:sessionId/summary')
  async updateSessionSummary(@Param('sessionId') sessionId: string, @Body() body: any) {
    return this.consultingService.updateSessionSummary(sessionId, body);
  }

  @Post('sessions/:sessionId/approve-summary')
  async approveSummary(@Param('sessionId') sessionId: string, @Body() body: { approvedBy: string }) {
    return this.consultingService.approveSummary(sessionId, body.approvedBy);
  }

  // ===== TIMELINE =====
  @Get('clients/:clientId/timeline')
  async getTimeline(@Param('clientId') clientId: string) {
    return this.consultingService.getClientTimeline(clientId);
  }
}

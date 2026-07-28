import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/services/prisma.service';
import {
  ConsultingClient,
  ConsultingContact,
  ConsultingFinding,
  ConsultingTask,
  ConsultingResearchItem,
  ConsultingImplementationPlan,
  ConsultingIntakeResponse,
  ConsultingAuditSession,
  ConsultingRecording,
} from '@prisma/client';

@Injectable()
export class ConsultingAuditService {
  constructor(private prisma: PrismaService) {}

  // ===== CLIENT MANAGEMENT =====

  async createClient(data: {
    workspaceId: string;
    companyName: string;
    industry?: string;
    employees?: number;
    revenue?: string;
    website?: string;
    primaryContact?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
  }): Promise<ConsultingClient> {
    return this.prisma.consultingClient.create({
      data: {
        workspaceId: data.workspaceId,
        companyName: data.companyName,
        industry: data.industry,
        employees: data.employees,
        revenue: data.revenue,
        website: data.website,
        primaryContact: data.primaryContact,
        primaryContactEmail: data.primaryContactEmail,
        primaryContactPhone: data.primaryContactPhone,
        status: 'INTAKE',
        auditScore: 0,
      },
      include: {
        contacts: true,
        sessions: { include: { recordings: true } },
        consultingFindings: true,
        tasks: true,
      },
    });
  }

  async getClient(clientId: string): Promise<ConsultingClient | null> {
    return this.prisma.consultingClient.findUnique({
      where: { id: clientId },
      include: {
        contacts: true,
        sessions: { include: { recordings: true } },
        consultingFindings: true,
        tasks: true,
        research: true,
        plan: { include: { phases: true } },
      },
    });
  }

  async listClients(workspaceId: string): Promise<ConsultingClient[]> {
    return this.prisma.consultingClient.findMany({
      where: { workspaceId },
      include: {
        contacts: true,
        sessions: true,
        consultingFindings: true,
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateClient(clientId: string, data: Partial<ConsultingClient>): Promise<ConsultingClient> {
    return this.prisma.consultingClient.update({
      where: { id: clientId },
      data,
    });
  }

  async updateAuditScore(clientId: string, score: number): Promise<ConsultingClient> {
    return this.prisma.consultingClient.update({
      where: { id: clientId },
      data: { auditScore: Math.min(100, Math.max(0, score)) },
    });
  }

  async updateClientStatus(clientId: string, status: string): Promise<ConsultingClient> {
    return this.prisma.consultingClient.update({
      where: { id: clientId },
      data: { status },
    });
  }

  // ===== INTAKE MANAGEMENT =====

  async submitIntakeResponse(data: {
    clientId: string;
    responses: Record<string, any>;
  }): Promise<ConsultingIntakeResponse> {
    return this.prisma.consultingIntakeResponse.create({
      data: {
        clientId: data.clientId,
        responses: data.responses,
        submittedAt: new Date(),
      },
    });
  }

  async getClientIntakeResponses(clientId: string): Promise<ConsultingIntakeResponse[]> {
    return this.prisma.consultingIntakeResponse.findMany({
      where: { clientId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // ===== MEETING / SESSION MANAGEMENT =====

  async createSession(data: {
    clientId: string;
    bookingId: string;
    clientName: string;
    auditTopic: string;
  }): Promise<ConsultingAuditSession> {
    return this.prisma.consultingAuditSession.create({
      data: {
        bookingId: data.bookingId,
        clientId: data.clientId,
        clientName: data.clientName,
        auditTopic: data.auditTopic,
        status: 'SCHEDULED',
      },
      include: { recordings: true },
    });
  }

  async getSession(sessionId: string): Promise<ConsultingAuditSession | null> {
    return this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        recordings: { orderBy: { recordedAt: 'desc' } },
        booking: true,
        client: true,
      },
    });
  }

  async updateSessionStatus(sessionId: string, status: string): Promise<ConsultingAuditSession> {
    return this.prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: { status },
    });
  }

  async startSession(sessionId: string): Promise<ConsultingAuditSession> {
    return this.prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  async endSession(sessionId: string): Promise<ConsultingAuditSession> {
    return this.prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  // ===== RECORDING MANAGEMENT =====

  async createRecording(data: {
    sessionId: string;
    filename: string;
    type: 'AUDIO' | 'VIDEO';
    duration?: number;
    fileSize?: number;
    s3Url?: string;
    s3Key?: string;
  }): Promise<ConsultingRecording> {
    return this.prisma.consultingRecording.create({
      data: {
        sessionId: data.sessionId,
        filename: data.filename,
        type: data.type,
        duration: data.duration,
        fileSize: data.fileSize,
        s3Url: data.s3Url,
        s3Key: data.s3Key,
        uploadStatus: 'COMPLETED',
        transcriptionStatus: 'PENDING',
      },
    });
  }

  async updateRecordingTranscription(recordingId: string, transcript: string): Promise<ConsultingRecording> {
    return this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        transcript,
        transcriptionStatus: 'COMPLETED',
        transcribedAt: new Date(),
      },
    });
  }

  async getSessionRecordings(sessionId: string): Promise<ConsultingRecording[]> {
    return this.prisma.consultingRecording.findMany({
      where: { sessionId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  // ===== FINDINGS MANAGEMENT =====

  async createFinding(data: {
    clientId: string;
    title: string;
    description: string;
    category: string;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    source: string;
    confidence?: number;
    estimatedValue?: number;
  }): Promise<ConsultingFinding> {
    return this.prisma.consultingFinding.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        source: data.source,
        confidence: data.confidence || 100,
        estimatedValue: data.estimatedValue,
        status: 'PENDING_APPROVAL',
      },
    });
  }

  async approveFinding(findingId: string, approvedBy: string): Promise<ConsultingFinding> {
    return this.prisma.consultingFinding.update({
      where: { id: findingId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  async getClientFindings(clientId: string): Promise<ConsultingFinding[]> {
    return this.prisma.consultingFinding.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ===== TASK MANAGEMENT =====

  async createTask(data: {
    clientId: string;
    title: string;
    description?: string;
    findingId?: string;
    owner: 'CLIENT' | 'CONSULTANT' | 'VENDOR';
    priority?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    estimatedHours?: number;
    estimatedCost?: number;
    dueDate?: Date;
  }): Promise<ConsultingTask> {
    return this.prisma.consultingTask.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        findingId: data.findingId,
        owner: data.owner,
        priority: data.priority || 'MEDIUM',
        status: 'TODO',
        estimatedHours: data.estimatedHours,
        estimatedCost: data.estimatedCost,
        dueDate: data.dueDate,
      },
    });
  }

  async updateTaskStatus(taskId: string, status: string): Promise<ConsultingTask> {
    return this.prisma.consultingTask.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });
  }

  async getClientTasks(clientId: string): Promise<ConsultingTask[]> {
    return this.prisma.consultingTask.findMany({
      where: { clientId },
      orderBy: { dueDate: 'asc' },
    });
  }

  // ===== RESEARCH MANAGEMENT =====

  async createResearchItem(data: {
    clientId: string;
    title: string;
    content: string;
    category: string;
    source?: string;
    relevance?: number;
    confidence?: number;
    suggestedAction?: string;
  }): Promise<ConsultingResearchItem> {
    return this.prisma.consultingResearchItem.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        content: data.content,
        category: data.category,
        source: data.source,
        relevance: data.relevance || 100,
        confidence: data.confidence || 100,
        suggestedAction: data.suggestedAction,
        accessedAt: new Date(),
      },
    });
  }

  async getClientResearch(clientId: string): Promise<ConsultingResearchItem[]> {
    return this.prisma.consultingResearchItem.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ===== IMPLEMENTATION PLAN MANAGEMENT =====

  async createImplementationPlan(data: {
    clientId: string;
    title: string;
    description?: string;
    startDate: Date;
    targetDate?: Date;
    totalEstimatedCost?: number;
    estimatedROI?: number;
    paybackPeriod?: number;
  }): Promise<ConsultingImplementationPlan> {
    return this.prisma.consultingImplementationPlan.create({
      data: {
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        startDate: data.startDate,
        targetDate: data.targetDate,
        totalEstimatedCost: data.totalEstimatedCost,
        estimatedROI: data.estimatedROI,
        paybackPeriod: data.paybackPeriod,
        status: 'DRAFT',
      },
    });
  }

  async approvePlan(planId: string, approvedBy: string): Promise<ConsultingImplementationPlan> {
    return this.prisma.consultingImplementationPlan.update({
      where: { id: planId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
      },
    });
  }

  async getClientPlan(clientId: string): Promise<ConsultingImplementationPlan | null> {
    return this.prisma.consultingImplementationPlan.findUnique({
      where: { clientId },
      include: { phases: { orderBy: { order: 'asc' } } },
    });
  }

  // ===== SESSION SUMMARY MANAGEMENT =====

  async updateSessionSummary(sessionId: string, data: {
    summary: string;
    status: string;
  }): Promise<ConsultingAuditSession> {
    return this.prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: {
        summary: data.summary,
        summaryStatus: data.status,
      },
    });
  }

  async approveSummary(sessionId: string, approvedBy: string): Promise<ConsultingAuditSession> {
    return this.prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data: {
        summaryStatus: 'APPROVED',
        summaryApprovedBy: approvedBy,
        summaryApprovedAt: new Date(),
      },
    });
  }

  // ===== AUDIT TIMELINE =====

  async getClientTimeline(clientId: string): Promise<any[]> {
    const client = await this.prisma.consultingClient.findUnique({
      where: { id: clientId },
      include: {
        contacts: true,
        intakeResponses: true,
        sessions: { include: { recordings: true } },
        consultingFindings: true,
        tasks: true,
        research: true,
        plan: { include: { phases: true } },
      },
    });

    if (!client) return [];

    // Compile timeline from all activities
    const timeline: any[] = [];

    // Intake
    client.intakeResponses.forEach((intake) => {
      timeline.push({
        type: 'INTAKE_SUBMITTED',
        timestamp: intake.submittedAt || intake.createdAt,
        data: intake,
      });
    });

    // Research
    client.research.forEach((item) => {
      timeline.push({
        type: 'RESEARCH_ADDED',
        timestamp: item.createdAt,
        data: item,
      });
    });

    // Sessions & Recordings
    client.sessions.forEach((session) => {
      timeline.push({
        type: 'MEETING_SCHEDULED',
        timestamp: session.createdAt,
        data: session,
      });

      if (session.startedAt) {
        timeline.push({
          type: 'MEETING_STARTED',
          timestamp: session.startedAt,
          data: session,
        });
      }

      if (session.completedAt) {
        timeline.push({
          type: 'MEETING_COMPLETED',
          timestamp: session.completedAt,
          data: session,
        });
      }

      session.recordings.forEach((recording) => {
        timeline.push({
          type: `RECORDING_${recording.type}`,
          timestamp: recording.recordedAt || recording.createdAt,
          data: recording,
        });
      });

      if (session.summaryApprovedAt) {
        timeline.push({
          type: 'SUMMARY_APPROVED',
          timestamp: session.summaryApprovedAt,
          data: { sessionId: session.id, summary: session.summary },
        });
      }
    });

    // Findings
    client.consultingFindings.forEach((finding) => {
      timeline.push({
        type: 'FINDING_CREATED',
        timestamp: finding.createdAt,
        data: finding,
      });

      if (finding.approvedAt) {
        timeline.push({
          type: 'FINDING_APPROVED',
          timestamp: finding.approvedAt,
          data: finding,
        });
      }
    });

    // Tasks
    client.tasks.forEach((task) => {
      timeline.push({
        type: 'TASK_CREATED',
        timestamp: task.createdAt,
        data: task,
      });

      if (task.completedAt) {
        timeline.push({
          type: 'TASK_COMPLETED',
          timestamp: task.completedAt,
          data: task,
        });
      }
    });

    // Plan
    if (client.plan) {
      timeline.push({
        type: 'PLAN_GENERATED',
        timestamp: client.plan.createdAt,
        data: client.plan,
      });

      if (client.plan.approvedAt) {
        timeline.push({
          type: 'PLAN_APPROVED',
          timestamp: client.plan.approvedAt,
          data: client.plan,
        });
      }
    }

    return timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

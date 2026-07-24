import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get presigned S3 URL for recording upload
   */
  async getPresignedUploadUrl(
    userId: string,
    sessionId: string,
    filename: string,
    recordingType: 'audio' | 'video',
  ) {
    // Verify session exists and user has access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audit session');
    }

    // Generate S3 key
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const s3Key = `audit-evidence/${sessionId}/${timestamp}-${filename}`;

    // Get presigned URL from S3 (Phase 2: S3 integration pending)
    // TODO: Integrate with AWS S3 service for presigned URLs
    const presignedUrl = `https://wise2-audit-evidence.s3.amazonaws.com/${s3Key}?presigned=mock-phase2`;

    // Create recording record in database (PENDING status)
    const recording = await this.prisma.consultingRecording.create({
      data: {
        sessionId,
        filename,
        type: recordingType === 'audio' ? 'AUDIO' : 'VIDEO',
        s3Key,
        uploadStatus: 'PENDING',
      },
    });

    return {
      recordingId: recording.id,
      presignedUrl,
      s3Key,
      uploadEndpoint: presignedUrl,
    };
  }

  /**
   * Confirm recording upload and update database
   */
  async confirmRecordingUpload(
    userId: string,
    sessionId: string,
    recordingId: string,
    s3Key: string,
    duration?: number,
    fileSize?: number,
  ) {
    // Verify session exists and user has access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audit session');
    }

    // Verify recording belongs to this session
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Update recording with upload confirmation
    const updatedRecording = await this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        uploadStatus: 'COMPLETED',
        uploadProgress: 100,
        uploadedAt: new Date(),
        s3Url: `https://wise2-audit-evidence.s3.amazonaws.com/${s3Key}`,
        duration: duration || null,
        fileSize: fileSize || null,
      },
    });

    // Update session status if this is the first recording
    if (session.status === 'SCHEDULED') {
      await this.prisma.consultingAuditSession.update({
        where: { id: sessionId },
        data: {
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      });
    }

    return updatedRecording;
  }

  /**
   * Get all recordings for an audit session
   */
  async getSessionRecordings(
    userId: string,
    sessionId: string,
    skip: number,
    take: number,
  ) {
    // Verify session exists and user has access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audit session');
    }

    const recordings = await this.prisma.consultingRecording.findMany({
      where: { sessionId },
      include: {
        moments: {
          orderBy: { timestampMs: 'asc' },
        },
      },
      orderBy: { recordedAt: 'desc' },
      skip,
      take,
    });

    const total = await this.prisma.consultingRecording.count({
      where: { sessionId },
    });

    return {
      recordings,
      total,
      skip,
      take,
    };
  }

  /**
   * Get a specific recording
   */
  async getRecording(userId: string, sessionId: string, recordingId: string) {
    // Verify session exists and user has access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized to access this audit session');
    }

    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
      include: {
        moments: {
          orderBy: { timestampMs: 'asc' },
        },
      },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    return recording;
  }

  /**
   * Add a marked moment to a recording
   */
  async addRecordingMoment(
    userId: string,
    sessionId: string,
    recordingId: string,
    label: string,
    description?: string,
    timestampMs?: number,
    category?: string,
    severity?: string,
  ) {
    // Verify recording exists and belongs to session
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const moment = await this.prisma.consultingAuditMoment.create({
      data: {
        recordingId,
        label,
        description: description || null,
        timestampMs: timestampMs || 0,
        category: category || null,
        severity: severity || null,
      },
    });

    return moment;
  }

  /**
   * Update a marked moment
   */
  async updateRecordingMoment(
    userId: string,
    sessionId: string,
    recordingId: string,
    momentId: string,
    updates: any,
  ) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Verify moment exists
    const moment = await this.prisma.consultingAuditMoment.findUnique({
      where: { id: momentId },
    });

    if (!moment || moment.recordingId !== recordingId) {
      throw new NotFoundException('Moment not found');
    }

    const updated = await this.prisma.consultingAuditMoment.update({
      where: { id: momentId },
      data: updates,
    });

    return updated;
  }

  /**
   * Delete a marked moment
   */
  async deleteRecordingMoment(
    userId: string,
    sessionId: string,
    recordingId: string,
    momentId: string,
  ) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Verify moment exists
    const moment = await this.prisma.consultingAuditMoment.findUnique({
      where: { id: momentId },
    });

    if (!moment || moment.recordingId !== recordingId) {
      throw new NotFoundException('Moment not found');
    }

    await this.prisma.consultingAuditMoment.delete({
      where: { id: momentId },
    });

    return { success: true };
  }

  /**
   * Delete/archive a recording
   */
  async deleteRecording(userId: string, sessionId: string, recordingId: string) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Archive recording instead of hard delete
    const archived = await this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        archivedAt: new Date(),
      },
    });

    return archived;
  }

  /**
   * Start transcription for a recording
   */
  async startTranscription(userId: string, sessionId: string, recordingId: string) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Update recording status to QUEUED
    const updated = await this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        transcriptionStatus: 'QUEUED',
        transcriptionJobId: `job-${Date.now()}`, // Placeholder for real transcription service
      },
    });

    // TODO: Queue transcription job with DeepGram, Rev, or mock service
    // This is stubbed for Phase 2

    return {
      success: true,
      transcriptionJobId: updated.transcriptionJobId,
      message: 'Transcription queued (Phase 2: integration pending)',
    };
  }

  /**
   * Update recording notes
   */
  async updateRecordingNotes(userId: string, sessionId: string, recordingId: string, notes: string) {
    // Verify recording exists
    const recording = await this.prisma.consultingRecording.findUnique({
      where: { id: recordingId },
    });

    if (!recording || recording.sessionId !== sessionId) {
      throw new NotFoundException('Recording not found');
    }

    // Verify session access
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        booking: {
          include: { user: true },
        },
      },
    });

    if (session.booking.userId !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const updated = await this.prisma.consultingRecording.update({
      where: { id: recordingId },
      data: {
        userNotes: notes,
      },
    });

    return updated;
  }

  /**
   * Create a new audit session for a prospect
   */
  async createAuditSession(prospectId: string, data?: { transcript?: string }) {
    const prospect = await this.prisma.prospect.findUnique({
      where: { id: prospectId },
    });

    if (!prospect) {
      throw new NotFoundException('Prospect not found');
    }

    const session = await this.prisma.consultingAuditSession.create({
      data: {
        prospectId,
        status: 'INITIATED',
        transcript: data?.transcript,
      },
    });

    return session;
  }

  /**
   * Get audit session by ID
   */
  async getAuditSession(sessionId: string) {
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        recordings: true,
        findings: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    return session;
  }

  /**
   * Get audit session by prospect ID
   */
  async getAuditSessionByProspect(prospectId: string) {
    const session = await this.prisma.consultingAuditSession.findFirst({
      where: { prospectId },
      include: {
        recordings: true,
        findings: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return session || null;
  }

  /**
   * Update audit session
   */
  async updateAuditSession(sessionId: string, data: Partial<{
    status: string;
    transcript: string;
  }>) {
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    const updated = await this.prisma.consultingAuditSession.update({
      where: { id: sessionId },
      data,
    });

    return updated;
  }

  /**
   * Get findings for an audit session
   */
  async getFindings(sessionId: string) {
    const findings = await this.prisma.auditFinding.findMany({
      where: { auditSessionId: sessionId },
      orderBy: { createdAt: 'desc' },
    });

    return findings;
  }

  /**
   * Add a finding to an audit session
   */
  async addFinding(sessionId: string, data: {
    category: string;
    severity: string;
    title: string;
    description: string;
    recommendation?: string;
  }) {
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    const finding = await this.prisma.auditFinding.create({
      data: {
        auditSessionId: sessionId,
        category: data.category,
        severity: data.severity,
        title: data.title,
        description: data.description,
        recommendation: data.recommendation,
      },
    });

    return finding;
  }

  /**
   * Generate proposal from audit findings
   */
  async generateProposal(sessionId: string, data: {
    title: string;
    description: string;
    totalAmount: number;
    items: Array<{
      description: string;
      amount: number;
    }>;
  }) {
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: { prospect: true },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    const proposal = await this.prisma.proposal.create({
      data: {
        prospectId: session.prospectId,
        title: data.title,
        description: data.description,
        totalAmount: data.totalAmount,
        status: 'DRAFT',
        lineItems: {
          create: data.items.map(item => ({
            description: item.description,
            amount: item.amount,
          })),
        },
      },
      include: {
        lineItems: true,
      },
    });

    return proposal;
  }
}

  /**
   * Get a specific finding by ID
   */
  async getFinding(findingId: string) {
    const finding = await this.prisma.auditFinding.findUnique({
      where: { id: findingId },
    });

    if (!finding) {
      throw new NotFoundException('Finding not found');
    }

    return finding;
  }

  /**
   * Create finding (alias for addFinding)
   */
  async createFinding(sessionId: string, data: any) {
    return this.addFinding(sessionId, data);
  }

  /**
   * Update a finding
   */
  async updateFinding(findingId: string, data: Partial<any>) {
    const finding = await this.prisma.auditFinding.findUnique({
      where: { id: findingId },
    });

    if (!finding) {
      throw new NotFoundException('Finding not found');
    }

    const updated = await this.prisma.auditFinding.update({
      where: { id: findingId },
      data,
    });

    return updated;
  }

  /**
   * Delete a finding
   */
  async deleteFinding(findingId: string) {
    const finding = await this.prisma.auditFinding.findUnique({
      where: { id: findingId },
    });

    if (!finding) {
      throw new NotFoundException('Finding not found');
    }

    await this.prisma.auditFinding.delete({
      where: { id: findingId },
    });
  }

  /**
   * Toggle finding hidden status
   */
  async toggleFindingHidden(findingId: string) {
    const finding = await this.prisma.auditFinding.findUnique({
      where: { id: findingId },
    });

    if (!finding) {
      throw new NotFoundException('Finding not found');
    }

    const updated = await this.prisma.auditFinding.update({
      where: { id: findingId },
      data: {
        isHidden: !finding.isHidden,
      },
    });

    return updated;
  }

  /**
   * Analyze audit session with AI
   */
  async analyzeAuditSession(sessionId: string) {
    const session = await this.prisma.consultingAuditSession.findUnique({
      where: { id: sessionId },
      include: {
        recordings: true,
        findings: true,
      },
    });

    if (!session) {
      throw new NotFoundException('Audit session not found');
    }

    // Phase 2: Integrate with Claude API for AI analysis
    // For now, return mock response
    return {
      sessionId,
      status: 'ANALYZED',
      message: 'Analysis queued (Phase 2: Claude API integration pending)',
      findingsCount: session.findings.length,
    };
  }

  /**
   * Create proposal (alias for generateProposal)
   */
  async createProposal(data: any) {
    if (!data.prospectId) {
      throw new BadRequestException('prospectId is required');
    }

    const proposal = await this.prisma.proposal.create({
      data: {
        prospectId: data.prospectId,
        title: data.title,
        description: data.description,
        totalAmount: data.totalAmount || 0,
        status: 'DRAFT',
        lineItems: data.items ? {
          create: data.items.map((item: any) => ({
            description: item.description,
            amount: item.amount,
          })),
        } : undefined,
      },
      include: {
        lineItems: true,
      },
    });

    return proposal;
  }

  /**
   * Get proposals for a prospect
   */
  async getProposals(prospectId: string) {
    const proposals = await this.prisma.proposal.findMany({
      where: { prospectId },
      include: {
        lineItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return proposals;
  }

  /**
   * Get a specific proposal
   */
  async getProposal(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        lineItems: true,
      },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return proposal;
  }

  /**
   * Update proposal
   */
  async updateProposal(proposalId: string, data: Partial<any>) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const updated = await this.prisma.proposal.update({
      where: { id: proposalId },
      data,
      include: {
        lineItems: true,
      },
    });

    return updated;
  }

  /**
   * Send proposal (update status to sent)
   */
  async sendProposal(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    const updated = await this.prisma.proposal.update({
      where: { id: proposalId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });

    return updated;
  }

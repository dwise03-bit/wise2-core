import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { EntitlementsService } from '../billing/entitlements.service';
import { GalleryService, UploadedFileData } from '../gallery/gallery.service';
import { CreateProjectDto, UpdateProjectDto, GenerateMusicDto } from './dto';
import { generateMusic, fetchMusicGenAudio, MusicGenServiceError } from './musicgen-client';

@Injectable()
export class SoundLabsService {
  constructor(
    private prisma: PrismaService,
    private entitlementsService: EntitlementsService,
    private galleryService: GalleryService,
  ) {}

  /**
   * Get all projects for authenticated user
   * SECURITY: Only returns user's own projects
   */
  async getUserProjects(userId: string) {
    return this.prisma.soundLabsProject.findMany({
      where: { userId },
      include: {
        recordings: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get single project with ownership verification
   * SECURITY: Must verify userId matches authenticated user
   */
  async getUserProject(projectId: string, userId: string) {
    const project = await this.prisma.soundLabsProject.findFirst({
      where: {
        id: projectId,
        userId, // CRITICAL: Verify ownership
      },
      include: {
        recordings: true,
      },
    });

    if (!project) {
      throw new ForbiddenException(
        'Project not found or you do not have permission to access it',
      );
    }

    return project;
  }

  /**
   * Create a new project for authenticated user
   * SECURITY: userId always comes from authenticated context
   */
  async createProject(userId: string, dto: CreateProjectDto) {
    // Verify user has Sound Labs access
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new ForbiddenException('No subscription found');
    }

    const entitlements = this.entitlementsService.getEntitlements(subscription.plan);

    if (!entitlements.canAccessSoundLabs) {
      throw new ForbiddenException(
        'Sound Labs is not available for your plan. Upgrade to Starter or higher.',
      );
    }

    // Check project limit
    const projectCount = await this.prisma.soundLabsProject.count({
      where: { userId },
    });

    if (
      entitlements.projectLimit !== null &&
      projectCount >= entitlements.projectLimit
    ) {
      throw new BadRequestException(
        `Project limit (${entitlements.projectLimit}) reached for your plan`,
      );
    }

    return this.prisma.soundLabsProject.create({
      data: {
        userId, // CRITICAL: Always set to authenticated user
        name: dto.name,
        description: dto.description,
        mixerState: {},
      },
    });
  }

  /**
   * Update project with ownership verification
   * SECURITY: Only owner can update
   */
  async updateProject(
    projectId: string,
    userId: string,
    dto: UpdateProjectDto,
  ) {
    // Verify ownership first
    const project = await this.getUserProject(projectId, userId);

    return this.prisma.soundLabsProject.update({
      where: { id: projectId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.mixerState && { mixerState: dto.mixerState }),
        ...(dto.lyrics !== undefined && { lyrics: dto.lyrics }),
        ...(dto.lyricsTitle !== undefined && { lyricsTitle: dto.lyricsTitle }),
      },
      include: {
        recordings: true,
      },
    });
  }

  /**
   * Delete project with ownership verification
   * SECURITY: Only owner can delete
   */
  async deleteProject(projectId: string, userId: string) {
    // Verify ownership first
    await this.getUserProject(projectId, userId);

    return this.prisma.soundLabsProject.delete({
      where: { id: projectId },
    });
  }

  /**
   * Check if user can generate music based on entitlements and usage
   */
  async canGenerate(userId: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      return { allowed: false, reason: 'No subscription found' };
    }

    const entitlements = this.entitlementsService.getEntitlements(subscription.plan);

    if (!entitlements.canGenerateMusic) {
      return {
        allowed: false,
        reason: 'Music generation not available for your plan',
      };
    }

    // Check monthly generation limit
    if (entitlements.monthlyGenerations !== null) {
      const hasReachedLimit = this.entitlementsService.hasReachedGenerationLimit(
        subscription.plan,
        subscription.generationsThisMonth,
      );

      if (hasReachedLimit) {
        return {
          allowed: false,
          reason: `Generation limit (${entitlements.monthlyGenerations}/month) reached for your plan`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Record a generation usage event
   * SECURITY: Only server can call this
   */
  async recordGeneration(userId: string, projectId: string) {
    // Verify user owns the project
    await this.getUserProject(projectId, userId);

    // Record usage
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    // Increment generation counter
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        generationsThisMonth: {
          increment: 1,
        },
      },
    });

    // Create usage log
    return this.prisma.usageLog.create({
      data: {
        subscriptionId: subscription.id,
        generationType: 'music_generation',
        creditsUsed: 1,
        metadata: {
          projectId,
          userId,
          timestamp: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Generate music for a project via the WISE² MusicGen service.
   * SECURITY: ownership + entitlements verified before calling out.
   * Synchronous: musicgen-service generates inline, so this resolves once
   * audio is ready (or throws) rather than returning a pollable job id.
   */
  async generate(projectId: string, userId: string, dto: GenerateMusicDto) {
    await this.getUserProject(projectId, userId);

    const eligibility = await this.canGenerate(userId);
    if (!eligibility.allowed) {
      throw new ForbiddenException(eligibility.reason);
    }

    await this.prisma.soundLabsProject.update({
      where: { id: projectId },
      data: {
        generationEngine: 'musicgen',
        generationStatus: 'processing',
      },
    });

    let result;
    try {
      result = await generateMusic({
        prompt: dto.prompt,
        duration: dto.duration,
        genre: dto.genre,
        mood: dto.mood,
        tempo: dto.tempo,
        temperature: dto.temperature,
        seed: dto.seed,
      });
    } catch (err) {
      const message =
        err instanceof MusicGenServiceError ? err.message : 'Music generation failed unexpectedly';
      await this.prisma.soundLabsProject.update({
        where: { id: projectId },
        data: { generationStatus: 'failed' },
      });
      throw new BadRequestException(message);
    }

    const audioUrl = `/api/v1/sound-labs/audio/${result.generationId}`;

    await this.prisma.soundLabsProject.update({
      where: { id: projectId },
      data: {
        generationJobId: result.generationId,
        generationStatus: 'completed',
        generatedAudioUrl: audioUrl,
        generationMetadata: { ...result } as any,
        generatedAt: new Date(),
      },
    });

    await this.prisma.soundLabsRecording.create({
      data: {
        projectId,
        name: dto.prompt.slice(0, 100),
        s3Url: audioUrl,
        s3Key: result.generationId,
        fileSize: 0,
        duration: result.duration,
        uploadStatus: 'COMPLETED',
        uploadProgress: 100,
      },
    });

    await this.recordGeneration(userId, projectId);

    return this.getUserProject(projectId, userId);
  }

  private static readonly AUDIO_MIMES = new Set([
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'audio/mp4',
    'audio/aac',
    'audio/x-m4a',
  ]);

  async uploadRecording(
    projectId: string,
    userId: string,
    file: UploadedFileData,
    name?: string,
  ) {
    await this.getUserProject(projectId, userId);
    if (!SoundLabsService.AUDIO_MIMES.has(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported audio type: ${file.mimetype}. Use WAV, MP3, OGG, WebM, or FLAC.`,
      );
    }

    const asset = await this.galleryService.upload(
      file,
      userId,
      'sound-lab',
      projectId,
      { kind: 'recording', originalName: file.originalname },
    );

    const recording = await this.prisma.soundLabsRecording.create({
      data: {
        projectId,
        name: (name || file.originalname || 'Recording').slice(0, 120),
        s3Url: asset.url || `/api/v1/gallery/file/${asset.filename}`,
        s3Key: asset.filename,
        fileSize: file.size,
        duration: null,
        uploadStatus: 'COMPLETED',
        uploadProgress: 100,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action: 'recording_uploaded',
        entityType: 'recording',
        entityId: recording.id,
        details: { galleryAssetId: asset.id, mimeType: file.mimetype },
      },
    });

    return { recording, asset };
  }

  async attachGalleryAsset(
    projectId: string,
    userId: string,
    galleryAssetId: string,
    name?: string,
  ) {
    await this.getUserProject(projectId, userId);
    const asset = await this.galleryService.findOne(galleryAssetId);
    if (asset.userId !== userId) {
      throw new ForbiddenException('You do not own that gallery asset');
    }
    if (asset.assetType !== 'AUDIO' && !asset.mimeType.startsWith('audio/')) {
      throw new BadRequestException('Only audio gallery assets can be attached to a Sound Lab project');
    }

    const recording = await this.prisma.soundLabsRecording.create({
      data: {
        projectId,
        name: (name || asset.originalName || 'Imported audio').slice(0, 120),
        s3Url: asset.url || `/api/v1/gallery/file/${asset.filename}`,
        s3Key: asset.filename,
        fileSize: asset.size,
        uploadStatus: 'COMPLETED',
        uploadProgress: 100,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action: 'gallery_asset_attached',
        entityType: 'recording',
        entityId: recording.id,
        details: { galleryAssetId: asset.id },
      },
    });

    return { recording, asset };
  }

  async createVersion(
    projectId: string,
    userId: string,
    label?: string,
    changeLog?: string,
  ) {
    const project = await this.getUserProject(projectId, userId);
    return this.prisma.versionHistory.create({
      data: {
        projectId,
        userId,
        snapshot: {
          mixerState: project.mixerState,
          lyrics: project.lyrics,
          lyricsTitle: project.lyricsTitle,
          generatedAudioUrl: project.generatedAudioUrl,
          generationStatus: project.generationStatus,
        } as any,
        label: label || `Snapshot ${new Date().toISOString()}`,
        changeLog: changeLog || null,
      },
    });
  }

  async listVersions(projectId: string, userId: string) {
    await this.getUserProject(projectId, userId);
    return this.prisma.versionHistory.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        label: true,
        changeLog: true,
        createdAt: true,
        userId: true,
      },
    });
  }

  async restoreVersion(projectId: string, userId: string, versionId: string) {
    await this.getUserProject(projectId, userId);
    const version = await this.prisma.versionHistory.findFirst({
      where: { id: versionId, projectId },
    });
    if (!version) throw new NotFoundException('Version not found');
    const snapshot = (version.snapshot || {}) as Record<string, unknown>;
    await this.prisma.soundLabsProject.update({
      where: { id: projectId },
      data: {
        mixerState: (snapshot.mixerState as any) || {},
        lyrics: (snapshot.lyrics as string) ?? undefined,
        lyricsTitle: (snapshot.lyricsTitle as string) ?? undefined,
      },
    });
    await this.prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action: 'version_restored',
        entityType: 'version',
        entityId: versionId,
        details: { label: version.label },
      },
    });
    return this.getUserProject(projectId, userId);
  }

  async addComment(
    projectId: string,
    userId: string,
    content: string,
    timestamp?: number,
    trackId?: string,
  ) {
    await this.getUserProject(projectId, userId);
    return this.prisma.projectComment.create({
      data: {
        projectId,
        userId,
        content,
        timestamp: timestamp ?? null,
        trackId: trackId || null,
      },
    });
  }

  async listComments(projectId: string, userId: string) {
    await this.getUserProject(projectId, userId);
    return this.prisma.projectComment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async setApproval(
    projectId: string,
    userId: string,
    status: 'pending' | 'approved' | 'revision',
    note?: string,
  ) {
    const project = await this.getUserProject(projectId, userId);
    const mixerState = {
      ...((project.mixerState as Record<string, unknown>) || {}),
      approval: {
        status,
        note: note || null,
        by: userId,
        at: new Date().toISOString(),
      },
    };
    await this.prisma.soundLabsProject.update({
      where: { id: projectId },
      data: { mixerState: mixerState as any },
    });
    await this.prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action: `approval_${status}`,
        entityType: 'approval',
        details: { note: note || null },
      },
    });
    return this.getUserProject(projectId, userId);
  }

  async getOwnedGenerationAudio(generationId: string, userId: string) {
    const project = await this.prisma.soundLabsProject.findFirst({
      where: { generationJobId: generationId, userId },
    });
    if (!project) {
      throw new ForbiddenException('Generated audio not found or not owned by you');
    }
    return fetchMusicGenAudio(generationId);
  }

  private static readonly CLIENT_REVIEW_EMAIL = 'client-review@share.wise2';

  private async resolveReviewInvite(token: string) {
    const invite = await this.prisma.projectInvite.findUnique({
      where: { token },
      include: {
        project: { include: { recordings: true } },
      },
    });
    if (!invite) {
      throw new NotFoundException('Review link invalid or expired');
    }
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new ForbiddenException('Review link expired');
    }
    return invite;
  }

  async createReviewLink(projectId: string, userId: string) {
    await this.getUserProject(projectId, userId);
    const existing = await this.prisma.projectInvite.findFirst({
      where: {
        projectId,
        invitedBy: userId,
        role: 'VIEWER',
        invitedEmail: SoundLabsService.CLIENT_REVIEW_EMAIL,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    });
    if (existing) {
      return {
        token: existing.token,
        expiresAt: existing.expiresAt,
        path: `/sound-lab/share/${existing.token}`,
      };
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const invite = await this.prisma.projectInvite.create({
      data: {
        projectId,
        invitedBy: userId,
        invitedEmail: SoundLabsService.CLIENT_REVIEW_EMAIL,
        token,
        role: 'VIEWER',
        expiresAt,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        projectId,
        userId,
        action: 'review_link_created',
        entityType: 'invite',
        entityId: invite.id,
        details: { expiresAt: expiresAt.toISOString() },
      },
    });

    return {
      token: invite.token,
      expiresAt: invite.expiresAt,
      path: `/sound-lab/share/${invite.token}`,
    };
  }

  async getProjectForReview(token: string) {
    const invite = await this.resolveReviewInvite(token);
    const project = invite.project;
    const mixerState = (project.mixerState as Record<string, unknown>) || {};
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      mixerState: project.mixerState,
      recordings: (project.recordings || []).map((r) => ({
        id: r.id,
        name: r.name,
        s3Url: r.s3Url,
        duration: r.duration,
        fileSize: r.fileSize,
      })),
      approval: mixerState.approval || { status: 'draft' },
    };
  }

  async listReviewComments(token: string) {
    const invite = await this.resolveReviewInvite(token);
    return this.prisma.projectComment.findMany({
      where: { projectId: invite.projectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addClientReviewComment(
    token: string,
    content: string,
    authorName?: string,
    timestamp?: number,
  ) {
    const invite = await this.resolveReviewInvite(token);
    const body = authorName ? `[${authorName}] ${content}` : `[Client] ${content}`;
    const comment = await this.prisma.projectComment.create({
      data: {
        projectId: invite.projectId,
        userId: invite.project.userId,
        content: body,
        timestamp: timestamp ?? null,
      },
    });
    await this.prisma.activityLog.create({
      data: {
        projectId: invite.projectId,
        userId: invite.project.userId,
        action: 'client_comment_added',
        entityType: 'comment',
        entityId: comment.id,
        details: { authorName: authorName || 'Client' },
      },
    });
    return comment;
  }

  async setClientReviewApproval(
    token: string,
    status: 'approved' | 'revision',
    note?: string,
    authorName?: string,
  ) {
    const invite = await this.resolveReviewInvite(token);
    const project = invite.project;
    const mixerState = {
      ...((project.mixerState as Record<string, unknown>) || {}),
      approval: {
        status,
        note: note || null,
        by: authorName ? `client:${authorName}` : 'client',
        at: new Date().toISOString(),
      },
    };
    await this.prisma.soundLabsProject.update({
      where: { id: project.id },
      data: { mixerState: mixerState as any },
    });
    await this.prisma.activityLog.create({
      data: {
        projectId: project.id,
        userId: project.userId,
        action: `client_approval_${status}`,
        entityType: 'approval',
        details: { note: note || null, authorName: authorName || 'Client' },
      },
    });
    return this.getProjectForReview(token);
  }

  async streamReviewRecording(
    token: string,
    recordingId: string,
  ): Promise<{ buffer: Buffer; mimeType: string }> {
    const invite = await this.resolveReviewInvite(token);
    const recording = invite.project.recordings.find((r) => r.id === recordingId);
    if (!recording) {
      throw new NotFoundException('Recording not found on this project');
    }

    if (recording.s3Url?.includes('/sound-labs/audio/')) {
      const generationId = recording.s3Key || recording.s3Url.split('/').pop();
      if (!generationId) throw new NotFoundException('Generated audio unavailable');
      const upstream = await fetchMusicGenAudio(generationId);
      if (!upstream?.body) throw new NotFoundException('Generated audio unavailable');
      return {
        buffer: Buffer.from(await upstream.arrayBuffer()),
        mimeType: upstream.headers.get('content-type') || 'audio/wav',
      };
    }

    const filename = recording.s3Key || recording.s3Url?.split('/').pop();
    if (!filename) throw new NotFoundException('Recording file missing');
    const { buffer, mimeType } = await this.galleryService.getFileBuffer(filename);
    return { buffer, mimeType };
  }
}

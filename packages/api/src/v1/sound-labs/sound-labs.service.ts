import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EntitlementsService } from '../billing/entitlements.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class SoundLabsService {
  constructor(
    private prisma: PrismaService,
    private entitlementsService: EntitlementsService,
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
}

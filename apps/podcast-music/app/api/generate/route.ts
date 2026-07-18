import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateAudioSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  extractUserFromHeaders,
  ApiError,
} from '@/lib/utils';

async function submitJobToQueue(jobData: any): Promise<string> {
  // TODO: Integrate with your AI service (OpenAI, Suno, or custom service)
  // This is a placeholder that simulates job submission
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // In production, you would:
  // 1. Submit to OpenAI API or your AI service
  // 2. Get back a job ID
  // 3. Set up a webhook to track completion
  // 4. Return the job ID

  console.log('Submitted job to queue:', jobId, jobData);

  return jobId;
}

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const body = await request.json();

    // Validate input
    const validationResult = generateAudioSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    const { podcastProjectId, prompt, aiModel, seed } = validationResult.data;

    // Verify project exists and belongs to user
    const project = await prisma.podcastProject.findUnique({
      where: { id: podcastProjectId },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    if (project.userId !== user.userId) {
      throw new ApiError(
        403,
        'You do not have access to this project',
        'FORBIDDEN'
      );
    }

    // Check subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.userId },
    });

    if (!subscription) {
      throw new ApiError(
        403,
        'No active subscription found',
        'NO_SUBSCRIPTION'
      );
    }

    if (subscription.status === 'CANCELED') {
      throw new ApiError(
        403,
        'Subscription is cancelled',
        'SUBSCRIPTION_CANCELLED'
      );
    }

    // Check usage limits based on plan
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyUsage = await prisma.usageRecord.count({
      where: {
        userId: user.userId,
        type: 'AUDIO_GENERATION',
        createdAt: {
          gte: monthStart,
        },
      },
    });

    const planLimits: Record<string, number> = {
      STARTER: 10,
      PRO: 100,
      ENTERPRISE: -1, // unlimited
    };

    const limit = planLimits[subscription.plan];
    if (limit !== -1 && monthlyUsage >= limit) {
      throw new ApiError(
        429,
        `Monthly generation limit of ${limit} exceeded`,
        'LIMIT_EXCEEDED'
      );
    }

    // Submit job to AI queue
    const jobId = await submitJobToQueue({
      userId: user.userId,
      projectId: podcastProjectId,
      prompt,
      aiModel,
      seed,
    });

    // Create audio generation record
    const audioGeneration = await prisma.audioGeneration.create({
      data: {
        podcastProjectId,
        jobId,
        prompt,
        aiModel,
        seed: seed || undefined,
        status: 'QUEUED',
        progress: 0,
      },
    });

    // Log usage
    await prisma.usageRecord.create({
      data: {
        userId: user.userId,
        type: 'AUDIO_GENERATION',
        amount: 1,
        costInCents: 10, // $0.10 per generation
        podcastProjectId,
        audioGenerationId: audioGeneration.id,
      },
    });

    // Update project status
    await prisma.podcastProject.update({
      where: { id: podcastProjectId },
      data: { status: 'GENERATING' },
    });

    return successResponse(
      {
        audioGeneration,
        message: 'Audio generation job submitted successfully',
      },
      202 // 202 Accepted
    );
  } catch (error) {
    console.error('Generate audio error:', error);
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const searchParams = new URL(request.url).searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      throw new ApiError(400, 'jobId query parameter is required', 'MISSING_PARAM');
    }

    // Find audio generation by job ID
    const audioGeneration = await prisma.audioGeneration.findUnique({
      where: { jobId },
      include: {
        podcastProject: true,
      },
    });

    if (!audioGeneration) {
      throw new ApiError(404, 'Job not found', 'JOB_NOT_FOUND');
    }

    // Verify ownership
    if (audioGeneration.podcastProject.userId !== user.userId) {
      throw new ApiError(
        403,
        'You do not have access to this job',
        'FORBIDDEN'
      );
    }

    return successResponse(audioGeneration);
  } catch (error) {
    console.error('Get job status error:', error);
    return errorResponse(error);
  }
}

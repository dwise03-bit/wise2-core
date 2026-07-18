import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createPodcastProjectSchema,
  listPodcastProjectsSchema,
} from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  extractUserFromHeaders,
  ApiError,
} from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const body = await request.json();

    // Validate input
    const validationResult = createPodcastProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
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

    // Create project
    const project = await prisma.podcastProject.create({
      data: {
        userId: user.userId,
        ...validationResult.data,
        status: 'DRAFT',
      },
    });

    return successResponse(project, 201);
  } catch (error) {
    console.error('Create project error:', error);
    return errorResponse(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);

    // Parse query parameters
    const searchParams = new URL(request.url).searchParams;
    const queryValidation = listPodcastProjectsSchema.safeParse({
      limit: searchParams.get('limit')
        ? parseInt(searchParams.get('limit')!, 10)
        : 10,
      offset: searchParams.get('offset')
        ? parseInt(searchParams.get('offset')!, 10)
        : 0,
      status: searchParams.get('status') || undefined,
    });

    if (!queryValidation.success) {
      return errorResponse(queryValidation.error, 400);
    }

    const { limit, offset, status } = queryValidation.data;

    // Build query filter
    const where: any = {
      userId: user.userId,
    };

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.podcastProject.count({ where });

    // Get projects
    const projects = await prisma.podcastProject.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        musicGenerations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return successResponse({
      projects,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('List projects error:', error);
    return errorResponse(error);
  }
}

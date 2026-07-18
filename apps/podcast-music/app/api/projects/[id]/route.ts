import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updatePodcastProjectSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  extractUserFromHeaders,
  ApiError,
} from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const { id } = params;

    const project = await prisma.podcastProject.findUnique({
      where: { id },
      include: {
        musicGenerations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    }

    // Verify ownership
    if (project.userId !== user.userId) {
      throw new ApiError(
        403,
        'You do not have access to this project',
        'FORBIDDEN'
      );
    }

    return successResponse(project);
  } catch (error) {
    console.error('Get project error:', error);
    return errorResponse(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const { id } = params;

    // Check project ownership
    const project = await prisma.podcastProject.findUnique({
      where: { id },
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

    // Validate input
    const body = await request.json();
    const validationResult = updatePodcastProjectSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Update project
    const updatedProject = await prisma.podcastProject.update({
      where: { id },
      data: validationResult.data,
    });

    return successResponse(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const { id } = params;

    // Check project ownership
    const project = await prisma.podcastProject.findUnique({
      where: { id },
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

    // Delete project (cascading deletes will handle musicGenerations)
    await prisma.podcastProject.delete({
      where: { id },
    });

    return successResponse({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return errorResponse(error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { downloadAudioSchema } from '@/lib/validations';
import {
  errorResponse,
  extractUserFromHeaders,
  ApiError,
} from '@/lib/utils';

// For a real implementation, you would:
// 1. Fetch the file from S3/cloud storage
// 2. Stream it to the client
// 3. Track the download in usage

async function downloadFileFromStorage(_fileUrl: string): Promise<Buffer> {
  // TODO: Implement actual file download from S3 or your storage service
  // Placeholder for now
  throw new Error('File storage download not implemented');
}

export async function GET(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const searchParams = new URL(request.url).searchParams;
    const audioGenerationId = searchParams.get('audioGenerationId');

    if (!audioGenerationId) {
      throw new ApiError(
        400,
        'audioGenerationId query parameter is required',
        'MISSING_PARAM'
      );
    }

    // Validate input
    const validationResult = downloadAudioSchema.safeParse({
      audioGenerationId,
    });

    if (!validationResult.success) {
      return errorResponse(validationResult.error, 400);
    }

    // Find audio generation
    const audioGeneration = await prisma.audioGeneration.findUnique({
      where: { id: audioGenerationId },
      include: {
        podcastProject: true,
      },
    });

    if (!audioGeneration) {
      throw new ApiError(
        404,
        'Audio file not found',
        'AUDIO_NOT_FOUND'
      );
    }

    // Verify ownership
    if (audioGeneration.podcastProject.userId !== user.userId) {
      throw new ApiError(
        403,
        'You do not have access to this file',
        'FORBIDDEN'
      );
    }

    // Check if generation is complete
    if (audioGeneration.status !== 'COMPLETED') {
      throw new ApiError(
        400,
        `Audio generation is ${audioGeneration.status.toLowerCase()}, not ready for download`,
        'NOT_READY'
      );
    }

    if (!audioGeneration.audioUrl) {
      throw new ApiError(
        404,
        'Audio file URL not found',
        'FILE_NOT_FOUND'
      );
    }

    // Download file from storage
    const fileBuffer = await downloadFileFromStorage(audioGeneration.audioUrl);

    // Log download usage
    await prisma.usageRecord.create({
      data: {
        userId: user.userId,
        type: 'STORAGE',
        amount: audioGeneration.audioFileSize || 0,
        costInCents: 0, // Storage downloads are free
        audioGenerationId: audioGeneration.id,
      },
    });

    // Return file as download
    const filename = `${audioGeneration.podcastProject.podcastName}_${audioGeneration.id}.mp3`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Download audio error:', error);
    return errorResponse(error);
  }
}

export async function HEAD(request: NextRequest) {
  try {
    const user = extractUserFromHeaders(request.headers);
    const searchParams = new URL(request.url).searchParams;
    const audioGenerationId = searchParams.get('audioGenerationId');

    if (!audioGenerationId) {
      throw new ApiError(
        400,
        'audioGenerationId query parameter is required',
        'MISSING_PARAM'
      );
    }

    // Find audio generation
    const audioGeneration = await prisma.audioGeneration.findUnique({
      where: { id: audioGenerationId },
      include: {
        podcastProject: true,
      },
    });

    if (!audioGeneration) {
      throw new ApiError(
        404,
        'Audio file not found',
        'AUDIO_NOT_FOUND'
      );
    }

    // Verify ownership
    if (audioGeneration.podcastProject.userId !== user.userId) {
      throw new ApiError(
        403,
        'You do not have access to this file',
        'FORBIDDEN'
      );
    }

    // Return file metadata
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': (audioGeneration.audioFileSize || 0).toString(),
        'X-Audio-Duration': (audioGeneration.duration || 0).toString(),
        'X-Audio-Status': audioGeneration.status,
      },
    });
  } catch (error) {
    console.error('Head audio error:', error);
    return errorResponse(error);
  }
}

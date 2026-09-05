/**
 * Recording System API Handlers
 *
 * Endpoints:
 * - POST /api/obs/recordings/upload - Upload recording file
 * - POST /api/obs/recordings/metadata - Save metadata
 * - PATCH /api/obs/recordings/metadata/:id - Update metadata
 * - GET /api/obs/recordings - List all recordings
 * - GET /api/obs/recordings/:id - Get recording details
 * - DELETE /api/obs/recordings/:id - Delete recording
 * - POST /api/obs/recordings/:id/download - Download recording
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink } from 'fs/promises';
import { mkdir } from 'fs/promises';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const RECORDINGS_DIR = path.join(process.cwd(), 'public', 'recordings');

/**
 * Upload recording file
 */
export async function handleUploadRecording(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filePath = formData.get('path') as string;
    const recordingId = formData.get('recordingId') as string;

    if (!file || !filePath) {
      return NextResponse.json(
        { error: 'Missing file or path' },
        { status: 400 }
      );
    }

    // Ensure directory exists
    const dir = path.dirname(filePath.replace(/^\//, ''));
    await mkdir(path.join(RECORDINGS_DIR, dir), { recursive: true });

    // Write file
    const buffer = await file.arrayBuffer();
    const fullPath = path.join(RECORDINGS_DIR, filePath.replace(/^\//, ''));
    await writeFile(fullPath, Buffer.from(buffer));

    return NextResponse.json({
      success: true,
      path: filePath,
      size: file.size,
      recordingId,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

/**
 * Save recording metadata
 */
export async function handleSaveMetadata(req: NextRequest): Promise<NextResponse> {
  try {
    const metadata = await req.json();

    const recording = await prisma.localStreamRecording.create({
      data: {
        id: metadata.id,
        title: metadata.title,
        description: metadata.description,
        filePath: metadata.filePath,
        fileSize: metadata.fileSize,
        duration: metadata.duration,
        format: metadata.format,
        platform: metadata.platform,
        streamTitle: metadata.streamTitle,
        videoTrackPath: metadata.videoTrackPath,
        audioTrackPath: metadata.audioTrackPath,
        audioTracks: metadata.audioTracks,
        isSplit: metadata.isSplit,
        splitParts: metadata.splitParts,
        status: metadata.status,
        quality: metadata.quality,
        bitrate: metadata.bitrate,
        startedAt: new Date(metadata.startedAt),
        userId: metadata.userId,
      },
    });

    return NextResponse.json({ success: true, recording });
  } catch (error) {
    console.error('Metadata save error:', error);
    return NextResponse.json(
      { error: 'Failed to save metadata' },
      { status: 500 }
    );
  }
}

/**
 * Update recording metadata
 */
export async function handleUpdateMetadata(
  req: NextRequest,
  params: { id: string }
): Promise<NextResponse> {
  try {
    const metadata = await req.json();

    const recording = await prisma.localStreamRecording.update({
      where: { id: params.id },
      data: {
        title: metadata.title,
        description: metadata.description,
        duration: metadata.duration,
        fileSize: metadata.fileSize,
        status: metadata.status,
        isSplit: metadata.isSplit,
        splitParts: metadata.splitParts,
        stoppedAt: metadata.stoppedAt ? new Date(metadata.stoppedAt) : null,
      },
    });

    return NextResponse.json({ success: true, recording });
  } catch (error) {
    console.error('Metadata update error:', error);
    return NextResponse.json(
      { error: 'Failed to update metadata' },
      { status: 500 }
    );
  }
}

/**
 * List all recordings
 */
export async function handleListRecordings(req: NextRequest): Promise<NextResponse> {
  try {
    const { platform, userId } = Object.fromEntries(req.nextUrl.searchParams.entries());

    const where: any = {};
    if (platform) where.platform = platform;
    if (userId) where.userId = userId;

    const recordings = await prisma.localStreamRecording.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, recordings });
  } catch (error) {
    console.error('List error:', error);
    return NextResponse.json(
      { error: 'Failed to list recordings' },
      { status: 500 }
    );
  }
}

/**
 * Get recording details
 */
export async function handleGetRecording(
  req: NextRequest,
  params: { id: string }
): Promise<NextResponse> {
  try {
    const recording = await prisma.localStreamRecording.findUnique({
      where: { id: params.id },
    });

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, recording });
  } catch (error) {
    console.error('Get error:', error);
    return NextResponse.json(
      { error: 'Failed to get recording' },
      { status: 500 }
    );
  }
}

/**
 * Delete recording
 */
export async function handleDeleteRecording(
  req: NextRequest,
  params: { id: string }
): Promise<NextResponse> {
  try {
    const recording = await prisma.localStreamRecording.findUnique({
      where: { id: params.id },
    });

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    // Delete files
    try {
      await unlink(path.join(RECORDINGS_DIR, recording.filePath.replace(/^\//, '')));

      if (recording.videoTrackPath) {
        await unlink(path.join(RECORDINGS_DIR, recording.videoTrackPath.replace(/^\//, '')));
      }

      if (recording.audioTrackPath) {
        await unlink(path.join(RECORDINGS_DIR, recording.audioTrackPath.replace(/^\//, '')));
      }
    } catch (e) {
      console.warn('File deletion failed:', e);
    }

    // Delete from database
    await prisma.localStreamRecording.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete recording' },
      { status: 500 }
    );
  }
}

/**
 * Download recording
 */
export async function handleDownloadRecording(
  req: NextRequest,
  params: { id: string }
): Promise<NextResponse> {
  try {
    const recording = await prisma.localStreamRecording.findUnique({
      where: { id: params.id },
    });

    if (!recording) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    const filePath = path.join(RECORDINGS_DIR, recording.filePath.replace(/^\//, ''));
    const fileContent = await readFile(filePath);

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${recording.title}.${recording.format.toLowerCase()}"`,
        'Content-Length': fileContent.length.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download recording' },
      { status: 500 }
    );
  }
}

/**
 * Archive recording
 */
export async function handleArchiveRecording(
  req: NextRequest,
  params: { id: string }
): Promise<NextResponse> {
  try {
    // Read first: the archive path is derived from the existing row, so it
    // cannot be referenced from inside the update() that defines `recording`.
    const existing = await prisma.localStreamRecording.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Recording not found' },
        { status: 404 }
      );
    }

    const recording = await prisma.localStreamRecording.update({
      where: { id: params.id },
      data: {
        filePath: `/archive/${existing.title}/${existing.id}`,
      },
    });

    return NextResponse.json({ success: true, recording });
  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: 'Failed to archive recording' },
      { status: 500 }
    );
  }
}

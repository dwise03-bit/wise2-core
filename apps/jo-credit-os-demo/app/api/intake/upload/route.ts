import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/intake/upload
 * Handle file uploads from forms with metadata extraction
 *
 * For photos: Supports JPG, PNG
 * For videos: Supports MP4, WebM, MKV with metadata extraction
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileType = file.type.startsWith('image') ? 'photo' : 'video';

    // Prepare file data with metadata
    const fileData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: fileType,
      mimeType: file.type,
      uploadedAt: new Date().toISOString(),
      url: `/uploads/${file.name}`, // Placeholder - would be actual storage URL
      metadata: {
        // For videos, metadata would be extracted from video stream
        // For now, we store placeholders
        ...(fileType === 'video' && {
          duration: 0, // Would be extracted from video stream
          width: 0,
          height: 0,
        }),
        ...(fileType === 'photo' && {
          width: 0, // Would be extracted from image metadata
          height: 0,
        }),
      },
    };

    console.log('File uploaded:', fileData);

    // TODO: Implement actual file storage (S3, Supabase, etc.)
    // TODO: Extract video metadata (duration, dimensions)
    // TODO: Generate thumbnails for videos
    // TODO: Store metadata in database

    return NextResponse.json({
      success: true,
      file: fileData,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const message = error instanceof Error ? error.message : 'Failed to upload file';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

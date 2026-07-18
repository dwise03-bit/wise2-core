import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/intake/upload
 * Handle file uploads from forms
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

    const fileData = {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    };

    console.log('File uploaded:', fileData);

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

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve } from 'path';

// Configuration constants
const UPLOAD_DIR = 'public/uploads/intake';
const MAX_FILES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
];

/**
 * Sanitize filename by replacing non-alphanumeric characters (except . and -)
 * with underscores
 */
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * POST handler for file uploads
 * Validates and stores files to /public/uploads/intake/
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    // Validate file count
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    // Validate each file before saving any
    const fileObjects: Array<{
      file: File;
      sanitizedName: string;
      timestamp: number;
    }> = [];

    for (const fileItem of files) {
      if (!(fileItem instanceof File)) {
        return NextResponse.json(
          { error: 'Invalid file format' },
          { status: 400 }
        );
      }

      // Validate file size
      if (fileItem.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: `File "${fileItem.name}" exceeds maximum size of 5MB`,
          },
          { status: 400 }
        );
      }

      // Validate file type
      if (!ALLOWED_TYPES.includes(fileItem.type)) {
        return NextResponse.json(
          {
            error: `File type "${fileItem.type}" not allowed for "${fileItem.name}". Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF`,
          },
          { status: 400 }
        );
      }

      // Store validated file info
      fileObjects.push({
        file: fileItem,
        sanitizedName: sanitizeFilename(fileItem.name),
        timestamp: Date.now(),
      });
    }

    // Ensure upload directory exists
    const uploadDirPath = resolve(process.cwd(), UPLOAD_DIR);
    await mkdir(uploadDirPath, { recursive: true });

    // Save all validated files
    const urls: string[] = [];

    for (const { file, sanitizedName, timestamp } of fileObjects) {
      const buffer = await file.arrayBuffer();
      const filename = `${timestamp}-${sanitizedName}`;
      const filepath = join(uploadDirPath, filename);

      await writeFile(filepath, Buffer.from(buffer));
      urls.push(`/uploads/intake/${filename}`);
    }

    return NextResponse.json(
      {
        success: true,
        urls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to process upload',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_EXTENSIONS = [
  'stl', '3mf', 'obj', 'step', 'stp', 'scad', 'fcstd',
  'zip', 'pdf', 'png', 'jpg', 'jpeg', 'svg', 'dxf',
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const MIME_ALLOWLIST: Record<string, string[]> = {
  'model/stl': ['stl'],
  'application/sla': ['stl'],
  'application/octet-stream': ['stl', '3mf', 'obj', 'step', 'stp', 'scad', 'fcstd'],
  'model/obj': ['obj'],
  'model/step': ['step', 'stp'],
  'model/3mf': ['3mf'],
  'application/zip': ['zip', '3mf'],
  'application/pdf': ['pdf'],
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/svg+xml': ['svg'],
  'image/vnd.dxf': ['dxf'],
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const orderId = formData.get('orderId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    const originalFilename = file.name;
    const ext = originalFilename.split('.').pop()?.toLowerCase() || '';

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `File type .${ext} not supported. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` },
        { status: 400 },
      );
    }

    const sanitizedName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storedFilename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${sanitizedName}`;
    const s3Key = `printshop/uploads/${new Date().toISOString().slice(0, 10)}/${storedFilename}`;

    const fileRecord = {
      id: `file-${Date.now()}`,
      orderId: orderId || null,
      originalFilename,
      storedFilename,
      s3Key,
      s3Url: `https://${process.env.AWS_S3_BUCKET || 'wise2-prod-bucket'}.s3.amazonaws.com/${s3Key}`,
      mimeType: file.type,
      fileExtension: ext,
      fileSizeBytes: file.size,
      status: 'UPLOADED',
      preflightResult: null,
      preflightErrors: [],
      preflightWarnings: [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ file: fileRecord }, { status: 201 });
  } catch (error) {
    console.error('PrintShop file upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');

    return NextResponse.json({
      files: [],
      filters: { orderId, status },
      allowedExtensions: ALLOWED_EXTENSIONS,
      maxFileSize: MAX_FILE_SIZE,
    });
  } catch (error) {
    console.error('PrintShop files GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}

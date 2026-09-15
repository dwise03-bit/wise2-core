import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = await params;
  let fileName = slug.join('/');

  // Serve index.html for directory requests (empty slug or trailing slash)
  if (!fileName || fileName === '') {
    fileName = 'index.html';
  }

  if (fileName.endsWith('.html')) {
    const publicPath = path.join(process.cwd(), 'public', 'sales-academy', fileName);
    try {
      const content = fs.readFileSync(publicPath, 'utf-8');
      return new NextResponse(content, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      return new NextResponse('Not found', { status: 404 });
    }
  }

  return new NextResponse('Not found', { status: 404 });
}

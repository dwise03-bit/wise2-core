import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const slug = await params;
  const fileName = slug.join('/');

  // Serve HTML files from public/sales-academy directory
  if (fileName.endsWith('.html')) {
    const publicPath = path.join(process.cwd(), 'public', 'sales-academy', fileName);

    try {
      const content = fs.readFileSync(publicPath, 'utf-8');
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

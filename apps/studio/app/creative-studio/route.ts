import { readFileSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const filePath = join(process.cwd(), 'public', 'wise2-creative-studio.html');
    const fileContent = readFileSync(filePath, 'utf-8');

    return new NextResponse(fileContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to load creative studio:', error);
    return new NextResponse('404 - Creative Studio not found', { status: 404 });
  }
}

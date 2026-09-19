import { NextRequest, NextResponse } from 'next/server';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010')
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rayban/captures/${params.id}/approve`, {
      method: 'PATCH',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: await req.text(),
    });
    const body = await response.text();
    return new NextResponse(body, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    });
  } catch {
    return NextResponse.json({ error: 'Capture service unavailable' }, { status: 502 });
  }
}

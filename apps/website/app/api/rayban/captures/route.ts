import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010').replace(/\/$/, '');
const CAPTURES_URL = `${API_BASE_URL}/api/rayban/captures`;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.search;
  const response = await fetch(`${CAPTURES_URL}${query}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const response = await fetch(CAPTURES_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: await req.text(),
  });

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
  });
}

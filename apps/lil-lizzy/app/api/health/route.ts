import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'lil-lizzy',
    timestamp: new Date().toISOString(),
  });
}

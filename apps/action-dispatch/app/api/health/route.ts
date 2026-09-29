import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'action-dispatch',
    mode: 'simulation',
    timestamp: new Date().toISOString(),
  });
}

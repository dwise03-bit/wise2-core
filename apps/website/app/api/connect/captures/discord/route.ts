import { NextRequest, NextResponse } from 'next/server';
import { notifyConnectCapture } from '@/lib/discord';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    if (!['audio', 'video'].includes(payload.type) || typeof payload.duration !== 'number' || typeof payload.createdAt !== 'string') {
      return NextResponse.json({ error: 'Invalid capture metadata' }, { status: 400 });
    }
    const sent = await notifyConnectCapture({ type: payload.type, duration: payload.duration, createdAt: payload.createdAt, status: payload.status === 'SYNC' ? 'SYNC' : 'LOCAL' });
    return NextResponse.json({ sent, configured: Boolean(process.env.DISCORD_WEBHOOK_URL) });
  } catch {
    return NextResponse.json({ error: 'Discord notification failed' }, { status: 502 });
  }
}

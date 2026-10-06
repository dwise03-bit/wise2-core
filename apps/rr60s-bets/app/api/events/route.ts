import { NextResponse } from 'next/server';
import { loadEventFeed } from '../../../lib/odds';

export const dynamic = 'force-dynamic';

export async function GET() {
  const feed = await loadEventFeed();
  return NextResponse.json(feed, {
    headers: { 'Cache-Control': 'no-store' }
  });
}

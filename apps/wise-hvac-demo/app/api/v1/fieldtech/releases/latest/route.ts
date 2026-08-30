import { NextResponse } from 'next/server';
import { wise2ApiBaseUrl } from '@/lib/wise2-api';

export async function GET() {
  try {
    const response = await fetch(`${wise2ApiBaseUrl()}/v1/fieldtech/releases/latest`, {
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('Release proxy error:', error);
    return NextResponse.json({ error: 'Release lookup failed' }, { status: 502 });
  }
}

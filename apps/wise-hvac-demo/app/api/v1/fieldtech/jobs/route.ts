import { NextResponse } from 'next/server';
import { getWise2AccessToken } from '@/lib/session';
import { getApiBaseUrl } from '@/lib/oauth';
import { listJobsForSession } from '@/lib/field-jobs-server';

export async function GET() {
  const result = await listJobsForSession();
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json(result.jobs);
}

export async function POST(req: Request) {
  const accessToken = await getWise2AccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const response = await fetch(`${getApiBaseUrl()}/v1/fieldtech/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const payload = await response.json().catch(() => ({}));
    return NextResponse.json(payload, { status: response.status });
  } catch (error) {
    console.error('Create job proxy error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}

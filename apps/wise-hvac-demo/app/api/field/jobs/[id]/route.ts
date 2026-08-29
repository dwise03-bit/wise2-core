import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { JobStatus, updateFieldJob } from '@/lib/field-data';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (process.env.WISE_HVAC_DEMO_MODE === 'false') {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { status?: JobStatus; notes?: string };
    if (body.status && !['DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'COMPLETED'].includes(body.status)) {
      return NextResponse.json({ error: 'Invalid job status' }, { status: 400 });
    }
    if (typeof body.notes === 'string' && body.notes.length > 2000) {
      return NextResponse.json({ error: 'Notes must be under 2,000 characters' }, { status: 400 });
    }

    const job = updateFieldJob(params.id, body);
    return job
      ? NextResponse.json(job)
      : NextResponse.json({ error: 'Job not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

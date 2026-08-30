import { NextRequest, NextResponse } from 'next/server';
import { JobStatus } from '@/lib/field-data';
import { patchJobForSession } from '@/lib/field-jobs-server';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as { status?: JobStatus; notes?: string };
    if (
      body.status &&
      !['DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'COMPLETED'].includes(
        body.status,
      )
    ) {
      return NextResponse.json({ error: 'Invalid job status' }, { status: 400 });
    }
    if (typeof body.notes === 'string' && body.notes.length > 2000) {
      return NextResponse.json({ error: 'Notes must be under 2,000 characters' }, { status: 400 });
    }

    const result = await patchJobForSession(params.id, body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.job);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

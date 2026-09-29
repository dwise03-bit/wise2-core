import { NextResponse } from 'next/server';
import { listJobsForSession } from '@/lib/field-jobs-server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/field/jobs
 * List jobs assigned to the authenticated technician from WISE² Fieldtech API.
 */
export async function GET() {
  try {
    const result = await listJobsForSession();
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.jobs);
  } catch (error) {
    console.error('Field jobs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

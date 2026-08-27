import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { listFieldJobs } from '@/lib/field-data';

export const dynamic = 'force-dynamic';

/**
 * GET /api/field/jobs
 * List jobs assigned to the authenticated technician
 * TODO: Add proper authentication when NextAuth is configured
 */
export async function GET() {
  try {
    if (process.env.WISE_HVAC_DEMO_MODE === 'false') {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    return NextResponse.json(listFieldJobs());
  } catch (error) {
    console.error('Field jobs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

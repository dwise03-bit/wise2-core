import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

interface LeadData {
  name: string;
  email: string;
  phone?: string;
  source?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authToken = request.cookies.get('authToken')?.value;
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: LeadData = await request.json();

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Lead name and email are required' },
        { status: 400 }
      );
    }

    // Queue the lead capture automation
    const jobId = `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const job = {
      id: jobId,
      type: 'lead_capture',
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        source: body.source || 'api',
        message: body.message || null,
      },
      status: 'queued',
      createdAt: new Date().toISOString(),
    };

    // Push to Redis job queue
    await redis.lpush('jobs:lead_capture', JSON.stringify(job));

    // Publish event for real-time updates
    await redis.publish('automation:events', JSON.stringify({
      type: 'lead_capture_queued',
      jobId,
      leadEmail: body.email,
      timestamp: new Date().toISOString(),
    }));

    return NextResponse.json(
      {
        success: true,
        jobId,
        message: 'Lead capture automation queued',
        status: 'queued',
      },
      { status: 202 }
    );

  } catch (error) {
    console.error('Lead capture error:', error);
    return NextResponse.json(
      { error: 'Failed to queue lead capture automation' },
      { status: 500 }
    );
  }
}

/**
 * GET: Check automation status
 */
export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId query parameter required' },
        { status: 400 }
      );
    }

    // TODO: Implement job status lookup from database
    // For now, return pending status
    return NextResponse.json({
      jobId,
      status: 'pending',
      message: 'Job status tracking coming soon',
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check automation status' },
      { status: 500 }
    );
  }
}

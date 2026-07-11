import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { platforms, content, media_url, schedule_time } = body;

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Platforms array is required' },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Store post in database (can be scheduled or immediate)
    const posts = [];
    for (const platform of platforms) {
      const result = await query(
        `INSERT INTO social_media_posts (platform, content, media_url, status, posted_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, platform, status, posted_at`,
        [
          platform,
          content,
          media_url || null,
          schedule_time ? 'scheduled' : 'posted',
          schedule_time ? new Date(schedule_time) : new Date(),
        ]
      );

      posts.push(result.rows[0]);
    }

    return NextResponse.json(
      {
        success: true,
        message: `Posted to ${platforms.length} platform(s)`,
        posts,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Social post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'posted';

    const result = await query(
      `SELECT id, platform, content, media_url, status, posted_at, likes, shares
       FROM social_media_posts
       WHERE status = $1
       ORDER BY posted_at DESC
       LIMIT $2`,
      [status, limit]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

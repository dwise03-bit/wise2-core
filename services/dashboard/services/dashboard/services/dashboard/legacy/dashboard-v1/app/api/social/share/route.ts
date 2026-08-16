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
    const { platform, title, text, url } = body;

    if (!platform || !title || !text) {
      return NextResponse.json(
        { error: 'Platform, title, and text are required' },
        { status: 400 }
      );
    }

    // Log social share event to database
    const result = await query(
      `INSERT INTO social_media_shares (user_id, platform, title, text, url, shared_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, platform, shared_at`,
      [payload.userId, platform, title, text, url || null]
    );

    return NextResponse.json(
      {
        success: true,
        message: `Shared to ${platform}`,
        share: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Social share error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const platform = searchParams.get('platform');

    let sql = `SELECT id, platform, title, text, shared_at
               FROM social_media_shares
               WHERE user_id = $1`;
    const params: (string | number)[] = [payload.userId];

    if (platform) {
      sql += ` AND platform = $${params.length + 1}`;
      params.push(platform);
    }

    sql += ` ORDER BY shared_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Get shares error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    let sql = `SELECT id, title, description, type, difficulty_level, duration_minutes,
                      video_url, instructions, created_at
               FROM content_drills
               WHERE is_active = true`;
    const params: any[] = [];

    if (type) {
      sql += ` AND type = $${params.length + 1}`;
      params.push(type);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Get drills error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Check if user is instructor (for now, just check if token is valid)
    const body = await request.json();
    const { title, description, type, difficulty_level, duration_minutes, video_url, instructions } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO content_drills (title, description, type, difficulty_level, duration_minutes, video_url, instructions, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING id, title, description, type, difficulty_level, duration_minutes, video_url, instructions, created_at`,
      [title, description, type, difficulty_level, duration_minutes, video_url, instructions]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Create drill error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

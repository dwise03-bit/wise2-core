import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('thread_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!threadId) {
      return NextResponse.json(
        { error: 'thread_id parameter is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT cp.id, cp.thread_id, cp.creator_id, cp.content, cp.created_at, cp.updated_at,
              u.email, u.first_name, u.last_name
       FROM community_posts cp
       JOIN users u ON cp.creator_id = u.id
       WHERE cp.thread_id = $1
       ORDER BY cp.created_at ASC
       LIMIT $2 OFFSET $3`,
      [threadId, limit, offset]
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
    const { threadId, content } = body;

    if (!threadId || !content) {
      return NextResponse.json(
        { error: 'Thread ID and content are required' },
        { status: 400 }
      );
    }

    // Verify thread exists
    const threadCheck = await query(
      'SELECT id FROM community_threads WHERE id = $1',
      [threadId]
    );

    if (threadCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO community_posts (thread_id, creator_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, thread_id, creator_id, content, created_at, updated_at`,
      [threadId, payload.userId, content]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

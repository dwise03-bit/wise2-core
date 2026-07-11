import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

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
    const drillId = searchParams.get('drill_id');

    let sql = `SELECT id, user_id, drill_id, completion_date, notes, score
               FROM student_progress
               WHERE user_id = $1`;
    const params = [payload.userId];

    if (drillId) {
      sql += ` AND drill_id = $2`;
      params.push(parseInt(drillId));
    }

    sql += ` ORDER BY completion_date DESC`;

    const result = await query(sql, params);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Get progress error:', error);
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
    const { drill_id, score, notes } = body;

    if (!drill_id) {
      return NextResponse.json(
        { error: 'Drill ID is required' },
        { status: 400 }
      );
    }

    // Check if drill exists
    const drillCheck = await query(
      'SELECT id FROM content_drills WHERE id = $1',
      [drill_id]
    );

    if (drillCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Drill not found' },
        { status: 404 }
      );
    }

    const result = await query(
      `INSERT INTO student_progress (user_id, drill_id, score, notes, completion_date)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING id, user_id, drill_id, completion_date, score, notes`,
      [payload.userId, drill_id, score || 0, notes || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Record progress error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'secure_postgres_admin_2026',
  max: 10,
  idleTimeoutMillis: 10000,
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-2026-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { action, entityType, entityId, oldValues, newValues } = await request.json();

    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        decoded.userId,
        action,
        entityType,
        entityId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        request.ip || 'unknown',
        request.headers.get('user-agent') || 'unknown',
      ]
    );

    return NextResponse.json({ message: 'Audit logged' });
  } catch (error) {
    console.error('Audit logging error:', error);
    return NextResponse.json({ error: 'Audit logging failed' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const limit = request.nextUrl.searchParams.get('limit') || '50';
    const offset = request.nextUrl.searchParams.get('offset') || '0';

    const result = await pool.query(
      `SELECT id, user_id, action, entity_type, entity_id, created_at FROM audit_logs
       ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Audit retrieval error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit logs' }, { status: 500 });
  }
}

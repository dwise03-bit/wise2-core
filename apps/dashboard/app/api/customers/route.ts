import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'secure_postgres_admin_2026',
  max: 10,
  idleTimeoutMillis: 10000,
});

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(
      'SELECT id, name, email, industry, employees, mrr, status, created_at FROM customers WHERE status = $1 ORDER BY created_at DESC LIMIT 100',
      ['active']
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

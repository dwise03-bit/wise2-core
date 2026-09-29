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
    const result = await pool.query(`
      SELECT
        p.id, p.name, p.description, p.status,
        p.start_date, p.end_date, p.budget, p.spent,
        p.progress_percent,
        c.name as customer_name
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE p.status = $1
      ORDER BY p.created_at DESC
      LIMIT 50
    `, ['active']);
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

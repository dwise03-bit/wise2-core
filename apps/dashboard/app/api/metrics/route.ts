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
    const stats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM customers WHERE status = 'active')::int as customers,
        (SELECT SUM(mrr) FROM customers WHERE status = 'active')::float as mrr,
        (SELECT SUM(value) FROM opportunities)::float as pipeline,
        (SELECT SUM(total) FROM invoices WHERE status = 'paid')::float as revenue,
        (SELECT COUNT(*) FROM invoices WHERE status = 'paid')::int as invoices,
        99.98::float as uptime,
        847293::int as ai_usage
    `);

    const row = stats.rows[0];
    return NextResponse.json({
      customers: row.customers || 0,
      mrr: parseFloat(row.mrr) || 0,
      pipeline: parseFloat(row.pipeline) || 0,
      revenue: parseFloat(row.revenue) || 0,
      invoices: row.invoices || 0,
      uptime: row.uptime,
      aiUsage: row.ai_usage,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}

// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.slice(7);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total users
    const usersResult = await query(`SELECT COUNT(*) as count FROM users`);
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Active users (booked session in last 30 days)
    const activeResult = await query(
      `SELECT COUNT(DISTINCT user_id) as count FROM student_progress WHERE completion_date > NOW() - INTERVAL '30 days'`
    );
    const activeUsers = parseInt(activeResult.rows[0].count);

    // Revenue
    const revenueResult = await query(
      `SELECT
        SUM(price_cents) as total,
        SUM(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN price_cents ELSE 0 END) as mrr
       FROM memberships WHERE tier != 'free'`
    );
    const totalRevenue = parseInt(revenueResult.rows[0].total) || 0;
    const mrr = parseInt(revenueResult.rows[0].mrr) || 0;

    // Conversion rate
    const freeCount = await query(`SELECT COUNT(*) as count FROM memberships WHERE tier = 'free'`);
    const paidCount = await query(`SELECT COUNT(*) as count FROM memberships WHERE tier != 'free'`);
    const freeUsers = parseInt(freeCount.rows[0].count);
    const paidUsers = parseInt(paidCount.rows[0].count);
    const conversionRate = freeUsers > 0 ? paidUsers / (freeUsers + paidUsers) : 0;

    // Top students
    const topStudentsResult = await query(
      `SELECT u.first_name, u.last_name, m.tier, COUNT(DISTINCT s.id) as sessions, AVG(sp.score) as avg_score
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       LEFT JOIN sessions s ON u.id = ANY(s.student_ids) AND s.status = 'completed'
       LEFT JOIN student_progress sp ON u.id = sp.user_id
       GROUP BY u.id, m.tier
       ORDER BY COUNT(sp.id) DESC, AVG(sp.score) DESC
       LIMIT 10`
    );

    const topStudents = topStudentsResult.rows.map((row: any) => ({
      name: `${row.first_name} ${row.last_name}`,
      tier: row.tier || 'free',
      sessions: row.sessions,
      avgScore: Math.round(row.avg_score || 0)
    }));

    // Revenue by tier
    const tierRevenueResult = await query(
      `SELECT tier, SUM(price_cents) as revenue, COUNT(*) as count
       FROM memberships
       WHERE tier != 'free'
       GROUP BY tier
       ORDER BY revenue DESC`
    );

    const totalTierRevenue = tierRevenueResult.rows.reduce((sum, row) => sum + parseInt(row.revenue || 0), 0);
    const revenueByTier = tierRevenueResult.rows.map(row => ({
      name: row.tier,
      revenue: parseInt(row.revenue || 0),
      percentage: totalTierRevenue > 0 ? (parseInt(row.revenue || 0) / totalTierRevenue * 100) : 0,
      count: row.count
    }));

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalRevenue,
      mrr,
      conversionRate,
      avgSessionsPerUser: totalUsers > 0 ? activeUsers / totalUsers : 0,
      topStudents,
      revenueByTier
    }, { status: 200 });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeframe = searchParams.get('timeframe') || 'all_time'; // all_time, monthly, weekly
    const limit = parseInt(searchParams.get('limit') || '100');

    let dateFilter = '';
    if (timeframe === 'weekly') {
      dateFilter = "AND sp.completion_date > NOW() - INTERVAL '7 days'";
    } else if (timeframe === 'monthly') {
      dateFilter = "AND sp.completion_date > NOW() - INTERVAL '30 days'";
    }

    const result = await query(
      `SELECT
        u.id, u.first_name, u.last_name, u.avatar_url,
        m.tier,
        COUNT(DISTINCT s.id) as sessions_completed,
        COUNT(DISTINCT sp.id) as drills_completed,
        AVG(sp.score) as avg_score,
        SUM(sp.score) as total_score,
        MAX(sp.completion_date) as last_active,
        ROW_NUMBER() OVER (ORDER BY SUM(sp.score) DESC) as rank
      FROM users u
      LEFT JOIN memberships m ON u.id = m.user_id
      LEFT JOIN sessions s ON u.id = ANY(s.student_ids) AND s.status = 'completed'
      LEFT JOIN student_progress sp ON u.id = sp.user_id ${dateFilter}
      GROUP BY u.id, m.tier
      ORDER BY total_score DESC
      LIMIT $1`,
      [limit]
    );

    const leaderboard = result.rows.map((row) => ({
      rank: row.rank,
      name: `${row.first_name} ${row.last_name}`,
      tier: row.tier || 'free',
      sessionsCompleted: row.sessions_completed,
      drillsCompleted: row.drills_completed,
      avgScore: Math.round(row.avg_score || 0),
      totalScore: Math.round(row.total_score || 0),
      lastActive: row.last_active
    }));

    return NextResponse.json({ leaderboard, timeframe }, { status: 200 });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

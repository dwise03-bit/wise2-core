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

    // Drill completion heatmap
    const drillHeatmap = await query(
      `SELECT c.id, c.title, COUNT(sp.id) as completions, AVG(sp.score) as avg_score
       FROM content c
       LEFT JOIN student_progress sp ON c.id = sp.drill_id
       GROUP BY c.id, c.title
       ORDER BY completions DESC`
    );

    // Page engagement heatmap (from analytics table if exists)
    const pageHeatmap = await query(
      `SELECT
        'homepage' as page, COUNT(*) as views, 0 as engagement_time
       FROM analytics WHERE page = 'homepage'
       UNION ALL
       SELECT
        'pricing', COUNT(*), 0
       FROM analytics WHERE page = 'pricing'
       UNION ALL
       SELECT
        'booking', COUNT(*), 0
       FROM analytics WHERE page = 'booking'
       UNION ALL
       SELECT
        'dashboard', COUNT(*), 0
       FROM analytics WHERE page = 'dashboard'`
    );

    // Cohort analysis (when did they join vs when do they engage)
    const cohortAnalysis = await query(
      `SELECT
        DATE_TRUNC('month', u.created_at)::date as cohort_month,
        COUNT(*) as size,
        SUM(CASE WHEN m.status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN m.tier != 'free' THEN 1 ELSE 0 END) as converted
       FROM users u
       LEFT JOIN memberships m ON u.id = m.user_id
       GROUP BY cohort_month
       ORDER BY cohort_month DESC`
    );

    return NextResponse.json({
      drillHeatmap: drillHeatmap.rows,
      pageHeatmap: pageHeatmap.rows,
      cohortAnalysis: cohortAnalysis.rows
    }, { status: 200 });
  } catch (error) {
    console.error('Heatmap error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

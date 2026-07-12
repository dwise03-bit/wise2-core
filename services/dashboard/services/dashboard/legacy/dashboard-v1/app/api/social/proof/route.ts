import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT
        u.first_name,
        CASE
          WHEN sp.id IS NOT NULL THEN CONCAT(u.first_name, ' completed ', c.title)
          WHEN s.id IS NOT NULL THEN CONCAT(u.first_name, ' booked a session')
          WHEN r.id IS NOT NULL THEN CONCAT(u.first_name, ' joined as ', m.tier)
          WHEN ss.id IS NOT NULL THEN CONCAT(u.first_name, ' shared on social media')
          ELSE CONCAT(u.first_name, ' is training')
        END as action,
        GREATEST(sp.completion_date, s.scheduled_time, u.created_at, ss.created_at) as event_time
       FROM users u
       LEFT JOIN student_progress sp ON u.id = sp.user_id AND sp.completion_date > NOW() - INTERVAL '1 hour'
       LEFT JOIN sessions s ON u.id = ANY(s.student_ids) AND s.scheduled_time > NOW() - INTERVAL '1 hour'
       LEFT JOIN memberships m ON u.id = m.user_id
       LEFT JOIN referrals r ON u.id = r.referrer_id AND r.created_at > NOW() - INTERVAL '1 hour'
       LEFT JOIN social_media_shares ss ON u.id = ss.user_id AND ss.created_at > NOW() - INTERVAL '1 hour'
       LEFT JOIN content c ON sp.drill_id = c.id
       WHERE sp.id IS NOT NULL OR s.id IS NOT NULL OR r.id IS NOT NULL OR ss.id IS NOT NULL
       ORDER BY event_time DESC
       LIMIT 5`
    );

    const recentEvents = result.rows.map((row) => ({
      userName: row.first_name,
      action: row.action,
      timestamp: new Date(row.event_time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })
    }));

    return NextResponse.json({ recentEvents }, { status: 200 });
  } catch (error) {
    console.error('Social proof error:', error);
    return NextResponse.json({ recentEvents: [] }, { status: 200 });
  }
}

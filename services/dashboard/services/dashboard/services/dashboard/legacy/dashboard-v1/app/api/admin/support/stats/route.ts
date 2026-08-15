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

    // Get open tickets
    const ticketsResult = await query(
      `SELECT * FROM support_tickets WHERE status = $1 ORDER BY priority DESC, created_at ASC LIMIT 10`,
      ['open']
    );

    // Get ticket stats
    const statsResult = await query(
      `SELECT
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_tickets,
        COUNT(*) as total_conversations,
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_response_time,
        (COUNT(CASE WHEN status = 'escalated' THEN 1 END)::float / COUNT(*) * 100) as escalation_rate
       FROM conversations
       WHERE created_at > NOW() - INTERVAL '30 days'`
    );

    // Get recent conversations
    const convsResult = await query(
      `SELECT
        c.id,
        c.user_id,
        c.channel,
        c.status,
        c.created_at,
        COUNT(m.id) as message_count
       FROM conversations c
       LEFT JOIN conversation_messages m ON c.id = m.conversation_id
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT 10`
    );

    // Get average rating
    const ratingResult = await query(
      `SELECT AVG(rating) as avg_rating FROM chat_feedback WHERE rating IS NOT NULL`
    );

    const stats = statsResult.rows[0] || {};
    const avgRating = ratingResult.rows[0]?.avg_rating || 0;

    return NextResponse.json({
      success: true,
      stats: {
        openTickets: parseInt(stats.open_tickets) || 0,
        totalConversations: parseInt(stats.total_conversations) || 0,
        avgResponseTime: parseInt(stats.avg_response_time) || 0,
        escalationRate: parseFloat(stats.escalation_rate) || 0,
        averageRating: parseFloat(avgRating) || 5.0
      },
      tickets: ticketsResult.rows,
      conversations: convsResult.rows
    }, { status: 200 });
  } catch (error) {
    console.error('Support stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

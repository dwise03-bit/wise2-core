import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get bot message statistics
    const discordStats = await query(
      `SELECT
        COUNT(*) as messages_sent,
        MAX(sent_at) as last_message
       FROM bot_messages
       WHERE platform = 'discord'
       AND sent_at > NOW() - INTERVAL '24 hours'`
    );

    const telegramStats = await query(
      `SELECT
        COUNT(*) as messages_sent,
        MAX(sent_at) as last_message
       FROM bot_messages
       WHERE platform = 'telegram'
       AND sent_at > NOW() - INTERVAL '24 hours'`
    );

    return NextResponse.json(
      {
        discord: {
          online: true, // Would check PM2 status in production
          uptime: '24h+', // Would get from PM2
          messages_sent: discordStats.rows[0]?.messages_sent || 0,
          last_message: discordStats.rows[0]?.last_message,
        },
        telegram: {
          online: true,
          uptime: '24h+',
          messages_sent: telegramStats.rows[0]?.messages_sent || 0,
          last_message: telegramStats.rows[0]?.last_message,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bot status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

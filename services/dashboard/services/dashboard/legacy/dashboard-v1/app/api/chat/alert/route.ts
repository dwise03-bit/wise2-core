// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

/**
 * Discord Alert Endpoint
 * Receives alerts from frontend (quick replies, etc) and sends to Discord
 */

async function sendDiscordAlert(type: string, data: any) {
  try {
    const webhookUrl = process.env.DISCORD_ALERTS_WEBHOOK_URL || process.env.DISCORD_NEWS_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('[ALERT] No Discord webhook configured');
      return false;
    }

    let embed: any = {};

    if (type === 'quick_reply') {
      const actionEmoji: any = {
        booking: '📅',
        pricing: '💰',
        courses: '📖',
        contact: '☎️',
        escalate: '👤',
        reset: '🔄',
      };

      embed = {
        title: `${actionEmoji[data.action] || '⚡'} Quick Reply Action`,
        description: `User clicked: ${data.label}`,
        color: 15105570, // Orange
        fields: [
          { name: 'Action', value: data.action, inline: true },
          { name: 'Button', value: data.label, inline: true },
          { name: 'Conversation ID', value: data.conversationId || 'N/A', inline: false },
          { name: 'Time', value: new Date().toLocaleTimeString(), inline: false },
        ],
        thumbnail: {
          url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=100&h=100&fit=crop',
        },
      };
    }

    if (!embed.title) {
      console.log('[ALERT] Unknown alert type:', type);
      return false;
    }

    embed.timestamp = new Date().toISOString();
    embed.footer = { text: 'Wise Defense Chat Bot' };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    });

    if (response.ok) {
      console.log(`[ALERT] ${type} alert sent to Discord`);
      return true;
    } else {
      console.error(`[ALERT] Failed to send to Discord:`, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('[ALERT] Error sending Discord alert:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, action, label, conversationId } = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Alert type required' }, { status: 400 });
    }

    const success = await sendDiscordAlert(type, {
      action,
      label,
      conversationId,
    });

    return NextResponse.json({
      success,
      message: success ? 'Alert sent to Discord' : 'Failed to send alert',
    });
  } catch (error) {
    console.error('[ALERT] Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process alert' },
      { status: 500 }
    );
  }
}

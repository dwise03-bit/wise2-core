import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const WEBHOOK_URLS = {
  builds: process.env.DISCORD_WEBHOOK_BUILDS,
  deployments: process.env.DISCORD_WEBHOOK_DEPLOYMENTS,
  alerts: process.env.DISCORD_WEBHOOK_ALERTS,
  decisions: process.env.DISCORD_WEBHOOK_DECISIONS,
};

type DiscordChannel = keyof typeof WEBHOOK_URLS;

function getWebhookUrl(channel: DiscordChannel) {
  return WEBHOOK_URLS[channel] || process.env.DISCORD_WEBHOOK_URL;
}

function buildStatus() {
  return {
    configured: Boolean(
      WEBHOOK_URLS.alerts ||
      WEBHOOK_URLS.builds ||
      WEBHOOK_URLS.deployments ||
      WEBHOOK_URLS.decisions ||
      process.env.DISCORD_WEBHOOK_URL
    ),
    channels: {
      alerts: Boolean(WEBHOOK_URLS.alerts || process.env.DISCORD_WEBHOOK_URL),
      builds: Boolean(WEBHOOK_URLS.builds),
      deployments: Boolean(WEBHOOK_URLS.deployments),
      decisions: Boolean(WEBHOOK_URLS.decisions),
    },
  };
}

async function sendDiscordMessage(webhookUrl: string, payload: Record<string, unknown>) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Discord webhook failed (${response.status}): ${body || 'no response body'}`);
  }
}

export async function GET() {
  return NextResponse.json(buildStatus());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const channel = ((body.channel as DiscordChannel) || 'alerts') as DiscordChannel;
    const webhookUrl = getWebhookUrl(channel);

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'No Discord webhook configured', ...buildStatus() },
        { status: 503 },
      );
    }

    const severity = body.severity === 'warning' || body.severity === 'critical' ? body.severity : 'info';
    const colorMap = {
      info: 0x0094ff,
      warning: 0xffb020,
      critical: 0xff4d4f,
    };

    const title = typeof body.title === 'string' && body.title.trim()
      ? body.title.trim()
      : 'WISE2 Discord Alert Test';
    const description = typeof body.description === 'string' && body.description.trim()
      ? body.description.trim()
      : 'Command-center test alert from the Wise2 dashboard.';

    const fields = Array.isArray(body.fields)
      ? body.fields
          .filter((field: any) => field && typeof field.name === 'string' && typeof field.value === 'string')
          .slice(0, 8)
          .map((field: any) => ({
            name: field.name,
            value: field.value,
            inline: Boolean(field.inline),
          }))
      : [];

    await sendDiscordMessage(webhookUrl, {
      username: 'WISE2 Command Center',
      embeds: [
        {
          title,
          description,
          color: colorMap[severity],
          fields: [
            ...fields,
            {
              name: 'Channel',
              value: channel,
              inline: true,
            },
            {
              name: 'Timestamp',
              value: new Date().toISOString(),
              inline: true,
            },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return NextResponse.json({
      sent: true,
      channel,
      ...buildStatus(),
    });
  } catch (error) {
    console.error('Discord integration error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send Discord message',
        ...buildStatus(),
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;

const ALERT_CHANNEL_NAMES = [
  'alerts',
  'deployments',
  'builds',
  'decisions',
  'status',
  'revenue',
  'moderator-only',
];

async function fetchDiscord(endpoint: string, method = 'GET', body?: any) {
  const response = await fetch(`https://discord.com/api/v10${endpoint}`, {
    method,
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Discord API error ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function grantMemberPermissions(userId: string, role = 'Secretary') {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    throw new Error('Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID');
  }

  // Get or create Secretary role
  const roles = await fetchDiscord(`/guilds/${DISCORD_GUILD_ID}/roles`);
  let secretaryRole = roles.find((r: any) => r.name === role);

  if (!secretaryRole) {
    secretaryRole = await fetchDiscord(`/guilds/${DISCORD_GUILD_ID}/roles`, 'POST', {
      name: role,
      color: 0x00d9ff, // WISE² cyan
      permissions: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
    });
  }

  // Add role to user
  await fetchDiscord(
    `/guilds/${DISCORD_GUILD_ID}/members/${userId}/roles/${secretaryRole.id}`,
    'PUT'
  );

  // Get all channels and grant permissions
  const channels = await fetchDiscord(`/guilds/${DISCORD_GUILD_ID}/channels`);

  const alertChannels = channels.filter((ch: any) =>
    ALERT_CHANNEL_NAMES.some(name => ch.name.includes(name))
  );

  const results = [];

  for (const channel of alertChannels) {
    try {
      // Grant role permissions
      await fetchDiscord(
        `/channels/${channel.id}/permissions/${secretaryRole.id}`,
        'PUT',
        {
          type: 'role',
          allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
          deny: ['SEND_MESSAGES', 'CREATE_INSTANT_INVITE'],
        }
      );

      // Grant user permissions (override)
      await fetchDiscord(
        `/channels/${channel.id}/permissions/${userId}`,
        'PUT',
        {
          type: 'member',
          allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
          deny: ['SEND_MESSAGES', 'CREATE_INSTANT_INVITE'],
        }
      );

      results.push({
        channel: channel.name,
        id: channel.id,
        status: 'granted',
      });
    } catch (error) {
      results.push({
        channel: channel.name,
        id: channel.id,
        status: 'error',
        error: (error as Error).message,
      });
    }
  }

  return { role: secretaryRole, channels: results };
}

async function sendTestAlert(message: string) {
  const channels = await fetchDiscord(`/guilds/${DISCORD_GUILD_ID}/channels`);
  const alertChannel = channels.find((ch: any) => ch.name === 'alerts');

  if (!alertChannel) {
    throw new Error('Alert channel not found');
  }

  await fetchDiscord(`/channels/${alertChannel.id}/messages`, 'POST', {
    embeds: [
      {
        title: '✅ Secretary Alert Access Configured',
        description: message,
        color: 0x00d9ff,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  return alertChannel;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'grant';
    const userId = body.userId || '1539066029823623230'; // paige
    const role = body.role || 'Secretary';

    if (action === 'grant') {
      const result = await grantMemberPermissions(userId, role);

      // Send test alert
      await sendTestAlert(
        `Granted ${role} role access to all alert channels. Permissions active.`
      );

      return NextResponse.json({
        success: true,
        message: `Permissions granted to ${userId}`,
        role: result.role,
        channels: result.channels,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
      return NextResponse.json(
        { configured: false, error: 'Missing Discord env vars' },
        { status: 503 }
      );
    }

    const channels = await fetchDiscord(`/guilds/${DISCORD_GUILD_ID}/channels`);
    const alertChannels = channels.filter((ch: any) =>
      ALERT_CHANNEL_NAMES.some(name => ch.name.includes(name))
    );

    return NextResponse.json({
      configured: true,
      guildId: DISCORD_GUILD_ID,
      alertChannels: alertChannels.map((ch: any) => ({
        id: ch.id,
        name: ch.name,
        type: ch.type,
      })),
      totalChannels: channels.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY || '';

/**
 * Discord Interaction Handler
 * Responds to slash commands and interactions from Discord
 *
 * Required env vars:
 * - DISCORD_PUBLIC_KEY: From Discord Developer Portal
 */

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature-ed25519');
  const timestamp = request.headers.get('x-signature-timestamp');
  const body = await request.text();

  // Verify request is from Discord
  if (!signature || !timestamp || !verifyKey(body, signature, timestamp, PUBLIC_KEY)) {
    return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 });
  }

  const interaction = JSON.parse(body);

  // Handle PING from Discord
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // Handle slash commands
  if (interaction.type === 2) {
    const { data } = interaction;

    // /contractor command
    if (data.name === 'contractor') {
      const section = data.options?.[0]?.value || 'overview';
      const urls = {
        overview: 'https://wise2.net/contractor',
        features: 'https://wise2.net/contractor#features',
        trades: 'https://wise2.net/contractor#trades',
        pricing: 'https://wise2.net/contractor#pricing',
        demo: 'https://wise2.net/contractor#demo',
      };

      return NextResponse.json({
        type: 4,
        data: {
          content: `🚀 **WISE² Contractor OS**\n\nOne login. One system. Total control.\n\n👉 **[Open Contractor OS →](${urls[section as keyof typeof urls] || urls.overview})**`,
          flags: 64, // Ephemeral (only visible to command user)
        },
      });
    }

    // /contractor-features command
    if (data.name === 'contractor-features') {
      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: '📊 Contractor OS Features',
              description: 'Everything you need to run your business',
              color: 0xf2b632,
              fields: [
                {
                  name: '🎯 Core Modules',
                  value:
                    '• CRM & Leads — Capture, track, follow up\n' +
                    '• Jobs & Dispatch — Schedule crews, track in real-time\n' +
                    '• Estimates — Professional proposals with e-signatures\n' +
                    '• Invoices & Payments — Send, automate, collect',
                  inline: false,
                },
                {
                  name: '🤖 AI & Automation',
                  value:
                    '• AI Operator — Ask anything, get recommendations\n' +
                    '• Storm Intel — Detect opportunities, act first\n' +
                    '• Automation — Workflows, triggers, AI actions',
                  inline: false,
                },
                {
                  name: '🔗 Built-in Integrations',
                  value:
                    'Stripe, Twilio, ServiceTitan, Jobber, QuickBooks, Google Workspace, Slack, and more',
                  inline: false,
                },
              ],
              footer: {
                text: 'Replaces 7+ separate apps',
                icon_url: 'https://wise2.net/favicon.ico',
              },
            },
          ],
          components: [
            {
              type: 1,
              components: [
                {
                  type: 2,
                  label: 'View Full Features',
                  style: 5,
                  url: 'https://wise2.net/contractor',
                },
              ],
            },
          ],
        },
      });
    }

    // /contractor-demo command
    if (data.name === 'contractor-demo') {
      return NextResponse.json({
        type: 4,
        data: {
          content:
            '📅 **Request a Demo**\n\n' +
            'Ready to see Contractor OS in action?\n\n' +
            '👉 **[Schedule a Demo →](https://wise2.net/contractor#demo)**\n\n' +
            'Or ask me anything about:\n' +
            '• How it works\n' +
            '• Pricing & plans\n' +
            '• Industry-specific setups\n' +
            '• Integration possibilities',
          flags: 64,
        },
      });
    }

    // /contractor-help command
    if (data.name === 'contractor-help') {
      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: '❓ Contractor OS Help',
              description: 'Common questions and getting started',
              color: 0x22c55e,
              fields: [
                {
                  name: '🚀 Getting Started',
                  value: '👉 [View the Contractor OS →](https://wise2.net/contractor)',
                },
                {
                  name: '📚 Documentation',
                  value: '👉 [Browse guides & tutorials →](https://wise2.net/docs)',
                },
                {
                  name: '💬 Need Support?',
                  value: 'DM @WISE² team or reply to this message',
                },
              ],
              footer: {
                text: 'More help on https://wise2.net',
              },
            },
          ],
        },
      });
    }

    // Default response
    return NextResponse.json({
      type: 4,
      data: {
        content: '❓ Unknown command. Try `/contractor` to view Contractor OS.',
        flags: 64,
      },
    });
  }

  return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
}

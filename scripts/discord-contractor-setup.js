#!/usr/bin/env node

/**
 * Discord Contractor OS Integration Setup
 * - Posts announcement to #contractor-os channel
 * - Creates rich embed with page preview
 * - Sets up webhook for future updates
 */

const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

if (!webhookUrl) {
  console.error('❌ DISCORD_WEBHOOK_URL not set');
  process.exit(1);
}

const contractorOsEmbed = {
  title: '🚀 WISE² Contractor OS — Live',
  description: 'One Login. One System. Total Control.',
  url: 'https://wise2.net/contractor',
  color: 0xf2b632, // WISE² gold
  thumbnail: {
    url: 'https://wise2.net/favicon.ico',
    height: 200,
    width: 200,
  },
  fields: [
    {
      name: '📊 What\'s Included',
      value:
        '• **CRM & Leads** — Capture, track, follow up\n' +
        '• **Jobs & Dispatch** — Schedule crews, track in real-time\n' +
        '• **Estimates** — Professional proposals with e-signatures\n' +
        '• **Invoices & Payments** — Send, automate, collect\n' +
        '• **Team Chat** — Channels, messages, job-linked rooms\n' +
        '• **AI Operator** — Ask anything, get recommendations\n' +
        '• **Storm Intel** — Detect opportunities, act first\n' +
        '• **Automation** — Workflows, triggers, AI actions',
      inline: false,
    },
    {
      name: '🏗️ For Which Trades?',
      value:
        'HVAC • Roofing • Pressure Washing • Detailing • Construction ' +
        '• Plumbing • Electrical • Landscaping • Pest Control • Painting',
      inline: false,
    },
    {
      name: '🎯 Key Features',
      value:
        '**AI-Powered** — Operates while you focus\n' +
        '**Built for Trades** — Industry-specific templates\n' +
        '**Proven Results** — More cash. More jobs. More profit.\n' +
        '**Secure & Reliable** — Bank-level security, US-based support',
      inline: true,
    },
    {
      name: '🔗 Replaces',
      value: 'CRM • Estimating • Scheduling • Team Chat • Marketing • Accounting • Reporting',
      inline: true,
    },
  ],
  image: {
    url: 'https://wise2.net/contractor-og.png',
  },
  footer: {
    text: 'WISE² Contractor OS v1.0 | One Login. One System. Total Control.',
    icon_url: 'https://wise2.net/favicon.ico',
  },
  timestamp: new Date().toISOString(),
};

const payload = {
  username: 'WISE² Bot',
  avatar_url: 'https://wise2.net/favicon.ico',
  content:
    '🎉 **WISE² Contractor OS is LIVE!**\n' +
    'The all-in-one platform for contractors is now available. ' +
    'One login, one system, total control.\n\n' +
    '👉 **[View the Contractor OS →](https://wise2.net/contractor)**',
  embeds: [contractorOsEmbed],
};

async function postAnnouncement() {
  try {
    console.log('📤 Posting announcement to Discord...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
    }

    console.log('✅ Announcement posted successfully!');
    console.log('📍 Channel: #contractor-os or #announcements');
    console.log('🔗 Page: https://wise2.net/contractor');
  } catch (error) {
    console.error('❌ Failed to post announcement:', error.message);
    process.exit(1);
  }
}

postAnnouncement();

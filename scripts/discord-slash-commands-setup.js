#!/usr/bin/env node

/**
 * Discord Slash Commands Setup
 * Creates and registers slash commands for Contractor OS integration
 *
 * Requires:
 * - DISCORD_BOT_TOKEN: Bot token from Discord Developer Portal
 * - DISCORD_APPLICATION_ID: Bot's application ID
 */

const botToken = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_APPLICATION_ID;

if (!botToken || !appId) {
  console.error('❌ DISCORD_BOT_TOKEN and DISCORD_APPLICATION_ID required');
  console.error('   Set them in .env.local or pass as environment variables');
  process.exit(1);
}

const commands = [
  {
    name: 'contractor',
    description: '🚀 View WISE² Contractor OS — CRM, jobs, estimates, crews, and AI in one system',
    options: [
      {
        name: 'section',
        description: 'Which section to view',
        type: 3, // STRING
        required: false,
        choices: [
          { name: 'Overview', value: 'overview' },
          { name: 'Features', value: 'features' },
          { name: 'Trades', value: 'trades' },
          { name: 'Pricing', value: 'pricing' },
          { name: 'Demo', value: 'demo' },
        ],
      },
    ],
  },
  {
    name: 'contractor-features',
    description: '📊 View Contractor OS features in detail',
  },
  {
    name: 'contractor-demo',
    description: '🎬 Request a demo of Contractor OS',
  },
  {
    name: 'contractor-help',
    description: '❓ Get help with Contractor OS',
  },
];

async function registerCommands() {
  try {
    console.log('🔐 Registering Discord slash commands...');

    for (const command of commands) {
      const url = `https://discord.com/api/v10/applications/${appId}/commands`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Failed to register /${command.name}:`, error);
        continue;
      }

      console.log(`✅ Registered /${command.name}`);
    }

    console.log('\n✅ All commands registered successfully!');
    console.log(
      '\n📝 Next steps:\n' +
        '1. In Discord, type "/" to see the new commands\n' +
        '2. Each command links to https://wise2.net/contractor\n' +
        '3. Set up interactions endpoint in Discord Developer Portal\n' +
        '4. Point to: https://wise2.net/api/discord/interactions\n'
    );
  } catch (error) {
    console.error('❌ Failed to register commands:', error.message);
    process.exit(1);
  }
}

registerCommands();

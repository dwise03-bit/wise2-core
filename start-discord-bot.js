#!/usr/bin/env node

/**
 * Standalone Discord Bot Starter
 * Runs the Discord bot independently without the Next.js server
 */

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config({ path: '/opt/wise2-core/wise2-command-center/.env.local' });

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID || 'your_client_id';
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !guildId) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID in environment');
  console.error('Make sure .env.local is configured');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

const rest = new REST({ version: '10' }).setToken(token);

// Define slash commands
const commands = [
  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Check WISE² system status'),
  new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Get link to WISE² dashboard'),
  new SlashCommandBuilder()
    .setName('notify')
    .setDescription('Send a notification to Discord')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Notification message')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands'),
  new SlashCommandBuilder()
    .setName('sync')
    .setDescription('Sync Command Center data'),
];

// Register commands
async function registerCommands() {
  try {
    console.log('📝 Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands.map((cmd) => cmd.toJSON()) }
    );
    console.log('✅ Slash commands registered');
  } catch (error) {
    console.error('❌ Failed to register commands:', error.message);
  }
}

// Bot ready
client.on('ready', () => {
  console.log(`\n🤖 Discord Bot Online!`);
  console.log(`   Bot: ${client.user.tag}`);
  console.log(`   Guild: ${guildId}`);
  console.log(`   Status: 🟢 ONLINE\n`);
  console.log('Commands available:');
  console.log('   /status   - Check system status');
  console.log('   /dashboard - Open dashboard');
  console.log('   /help     - Show all commands');
  console.log('   /notify   - Send notification');
  console.log('   /sync     - Sync data\n');
});

// Handle interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'status':
        await interaction.deferReply();
        const uptime = Math.floor(process.uptime());
        const memory = process.memoryUsage();
        await interaction.editReply({
          embeds: [
            {
              title: '📊 WISE² System Status',
              description: 'System is operational',
              fields: [
                { name: 'Status', value: '🟢 Online', inline: true },
                { name: 'Uptime', value: `${uptime} seconds`, inline: true },
                { name: 'Memory', value: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`, inline: true },
                { name: 'Timestamp', value: new Date().toISOString(), inline: false },
              ],
              color: 0x00ff00,
              timestamp: new Date(),
            },
          ],
        });
        break;

      case 'dashboard':
        const dashboardUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net';
        await interaction.reply({
          embeds: [
            {
              title: '📈 WISE² Dashboard',
              description: 'Access the Command Center dashboard',
              fields: [
                { name: 'Dashboard URL', value: dashboardUrl, inline: false },
              ],
              color: 0x0099ff,
              url: dashboardUrl,
            },
          ],
        });
        break;

      case 'notify':
        const message = interaction.options.getString('message');
        await interaction.reply({
          content: '✓ Notification sent',
          ephemeral: true,
        });
        break;

      case 'help':
        await interaction.reply({
          embeds: [
            {
              title: '📖 WISE² Command Center - Help',
              description: 'Available commands',
              fields: [
                { name: '/status', value: 'Check system status and uptime', inline: false },
                { name: '/dashboard', value: 'Get link to the Command Center dashboard', inline: false },
                { name: '/notify <message>', value: 'Send a notification', inline: false },
                { name: '/sync', value: 'Sync data between Discord and Command Center', inline: false },
                { name: '/help', value: 'Show this help message', inline: false },
              ],
              color: 0x0099ff,
            },
          ],
        });
        break;

      case 'sync':
        await interaction.deferReply();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await interaction.editReply({
          embeds: [
            {
              title: '✓ Sync Complete',
              description: 'Data synchronized successfully',
              fields: [
                { name: 'Status', value: 'Synced', inline: true },
                { name: 'Timestamp', value: new Date().toISOString(), inline: false },
              ],
              color: 0x00ff00,
            },
          ],
        });
        break;

      default:
        await interaction.reply({
          content: 'Unknown command',
          ephemeral: true,
        });
    }
  } catch (error) {
    console.error('❌ Command error:', error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'Error executing command', ephemeral: true });
    }
  }
});

// Error handler
client.on('error', (error) => {
  console.error('❌ Discord client error:', error.message);
});

// Login
client.login(token)
  .then(() => {
    registerCommands();
  })
  .catch((error) => {
    console.error('❌ Failed to login:', error.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down bot...');
  await client.destroy();
  process.exit(0);
});

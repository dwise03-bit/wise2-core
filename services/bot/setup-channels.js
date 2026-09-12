#!/usr/bin/env node

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('./load-env');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const GUILD_ID = process.env.DISCORD_GUILD_ID || '1512093487145680926';

const channels = [
  // Contractor OS Category
  { name: '🏗-contractor-os', type: ChannelType.GuildCategory },
  { name: '🏗-contractor-info', type: ChannelType.GuildText, parent: '🏗-contractor-os', topic: 'Product info, pricing, features' },
  { name: '📋-contractor-support', type: ChannelType.GuildText, parent: '🏗-contractor-os', topic: 'Help and support' },
  { name: '🎬-contractor-demos', type: ChannelType.GuildText, parent: '🏗-contractor-os', topic: 'Schedule a demo' },

  // Academy Category
  { name: '🎓-academy', type: ChannelType.GuildCategory },
  { name: '📚-courses', type: ChannelType.GuildText, parent: '🎓-academy', topic: 'Courses & training' },
  { name: '📚-resources', type: ChannelType.GuildText, parent: '🎓-academy', topic: 'Videos, templates, guides' },
  { name: '🏆-certification', type: ChannelType.GuildText, parent: '🎓-academy', topic: 'Official certification' },

  // Sales Category
  { name: '💼-sales', type: ChannelType.GuildCategory },
  { name: '💼-sales-system', type: ChannelType.GuildText, parent: '💼-sales', topic: 'Sales strategies' },
  { name: '📊-training', type: ChannelType.GuildText, parent: '💼-sales', topic: 'Sales training' },
  { name: '📈-metrics', type: ChannelType.GuildText, parent: '💼-sales', topic: 'KPIs & analytics' },

  // Admin Category
  { name: '⚙-administration', type: ChannelType.GuildCategory },
  { name: '🎛-control', type: ChannelType.GuildText, parent: '⚙-administration', topic: 'Platform control' },
  { name: '🔧-settings', type: ChannelType.GuildText, parent: '⚙-administration', topic: 'Configuration' },
  { name: '👥-team', type: ChannelType.GuildText, parent: '⚙-administration', topic: 'Team management' },
  { name: '🟢-status', type: ChannelType.GuildText, parent: '⚙-administration', topic: 'System health' },

  // General
  { name: '📢-announcements', type: ChannelType.GuildText, topic: 'WISE² news & updates' },
  { name: '🔗-integrations', type: ChannelType.GuildText, topic: 'API & integrations' },
  { name: '🆘-help', type: ChannelType.GuildText, topic: 'Help & support' },
];

client.once('ready', async () => {
  console.log('✅ Logged in as', client.user.tag);
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error('❌ Guild not found');
    process.exit(1);
  }

  console.log(`🔨 Creating ${channels.length} channels in ${guild.name}...\n`);

  const categoryMap = {};
  let created = 0;
  let errors = 0;

  // Create categories first
  for (const ch of channels.filter(c => c.type === ChannelType.GuildCategory)) {
    try {
      const existing = guild.channels.cache.find(c => c.name === ch.name && c.isCategory());
      if (existing) {
        console.log(`⏭  Already exists: #${ch.name}`);
        categoryMap[ch.name] = existing.id;
        continue;
      }

      const channel = await guild.channels.create({
        name: ch.name,
        type: ChannelType.GuildCategory,
        reason: 'WISE² Discord setup',
      });
      categoryMap[ch.name] = channel.id;
      console.log(`✅ Created category: #${ch.name}`);
      created++;
    } catch (err) {
      console.error(`❌ Error creating ${ch.name}:`, err.message);
      errors++;
    }
  }

  // Create text channels
  for (const ch of channels.filter(c => c.type === ChannelType.GuildText)) {
    try {
      const existing = guild.channels.cache.find(c => c.name === ch.name && c.isTextBased());
      if (existing) {
        console.log(`⏭  Already exists: #${ch.name}`);
        continue;
      }

      const createData = {
        name: ch.name,
        type: ChannelType.GuildText,
        reason: 'WISE² Discord setup',
      };

      if (ch.parent && categoryMap[ch.parent]) {
        createData.parent = categoryMap[ch.parent];
      }

      if (ch.topic) {
        createData.topic = ch.topic;
      }

      const channel = await guild.channels.create(createData);
      console.log(`✅ Created channel: #${ch.name}`);
      created++;
    } catch (err) {
      console.error(`❌ Error creating ${ch.name}:`, err.message);
      errors++;
    }
  }

  console.log('\n' + '─'.repeat(70));
  console.log(`📊 Results: ${created} new channels created, ${errors} errors`);
  console.log('─'.repeat(70) + '\n');

  if (errors === 0) {
    console.log('✅ All channels set up successfully!');
    console.log('🎉 Discord server is ready for WISE² ecosystem.\n');
  }

  process.exit(errors > 0 ? 1 : 0);
});

client.login(process.env.DISCORD_BOT_TOKEN);

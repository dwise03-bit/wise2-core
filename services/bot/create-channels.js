#!/usr/bin/env node

const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('./load-env');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const GUILD_ID = process.env.DISCORD_GUILD_ID || '1512093487145680926';

if (!BOT_TOKEN) {
  console.error('❌ DISCORD_BOT_TOKEN not set');
  process.exit(1);
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

const channels = [
  // Contractor OS Category
  { name: '🏗-contractor-os', type: 'category' },
  { name: '🏗-info', type: 'text', parent: '🏗-contractor-os', topic: 'Product info, pricing, features' },
  { name: '📋-support', type: 'text', parent: '🏗-contractor-os', topic: 'Help and support' },
  { name: '🎬-demos', type: 'text', parent: '🏗-contractor-os', topic: 'Schedule a demo' },

  // Academy Category
  { name: '🎓-academy', type: 'category' },
  { name: '📚-courses', type: 'text', parent: '🎓-academy', topic: 'Courses & training' },
  { name: '📚-resources', type: 'text', parent: '🎓-academy', topic: 'Videos, templates, guides' },
  { name: '🏆-certification', type: 'text', parent: '🎓-academy', topic: 'Official certification' },

  // Sales Category
  { name: '💼-sales', type: 'category' },
  { name: '💼-system', type: 'text', parent: '💼-sales', topic: 'Sales strategies' },
  { name: '📊-training', type: 'text', parent: '💼-sales', topic: 'Sales training' },
  { name: '📈-metrics', type: 'text', parent: '💼-sales', topic: 'KPIs & analytics' },

  // Admin Category
  { name: '⚙-administration', type: 'category' },
  { name: '🎛-control', type: 'text', parent: '⚙-administration', topic: 'Platform control' },
  { name: '🔧-settings', type: 'text', parent: '⚙-administration', topic: 'Configuration' },
  { name: '👥-team', type: 'text', parent: '⚙-administration', topic: 'Team management' },
  { name: '🟢-status', type: 'text', parent: '⚙-administration', topic: 'System health' },

  // General
  { name: '📢-announcements', type: 'text', topic: 'WISE² news & updates' },
  { name: '🔗-integrations', type: 'text', topic: 'API & integrations' },
  { name: '🆘-help', type: 'text', topic: 'Help & support' },
];

client.once('ready', async () => {
  console.log('✅ Logged in as', client.user.tag, '\n');
  
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.error('❌ Guild not found');
    process.exit(1);
  }

  console.log(`🔨 Creating ${channels.length} channels in "${guild.name}"...\n`);

  const categoryMap = {};
  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Create categories first
  for (const ch of channels.filter(c => c.type === 'category')) {
    try {
      const existing = guild.channels.cache.find(
        c => c.name.toLowerCase() === ch.name.toLowerCase() && c.isCategory()
      );
      
      if (existing) {
        console.log(`⏭️  Already exists: #${ch.name}`);
        categoryMap[ch.name] = existing.id;
        skipped++;
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
  for (const ch of channels.filter(c => c.type === 'text')) {
    try {
      const existing = guild.channels.cache.find(
        c => c.name.toLowerCase() === ch.name.toLowerCase() && c.isTextBased()
      );
      
      if (existing) {
        console.log(`⏭️  Already exists: #${ch.name}`);
        skipped++;
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
  console.log(`📊 Results: ${created} created, ${skipped} already exist, ${errors} errors`);
  console.log('─'.repeat(70) + '\n');

  if (errors === 0) {
    console.log('✅ All channels set up successfully!');
    console.log('🎉 Discord server is now organized and ready.\n');
  }

  process.exit(errors > 0 ? 1 : 0);
});

client.on('error', err => {
  console.error('Client error:', err.message);
  process.exit(1);
});

client.login(BOT_TOKEN);

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Timeout: bot did not connect within 30 seconds');
  process.exit(1);
}, 30000);

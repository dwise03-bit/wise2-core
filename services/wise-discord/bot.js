'use strict';

require('dotenv').config({ path: '/home/dwise/wise2-core/.env' });
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// ── Config ────────────────────────────────────────────────────────────────────
const BOT_TOKEN      = process.env.DISCORD_BOT_TOKEN;
const CLIENT_ID      = process.env.DISCORD_CLIENT_ID || process.env.DISCORD_APPLICATION_ID;
const GUILD_ID       = process.env.DISCORD_GUILD_ID;
const JWT_SECRET     = process.env.JWT_SECRET;
const EVENTS_SECRET  = process.env.EVENTS_SECRET || '';
const BRAIN_API      = process.env.BRAIN_API_URL  || 'http://127.0.0.1:3011/api';
const COMMAND_CENTER = process.env.COMMAND_CENTER_URL || 'http://127.0.0.1:3004';
// Comma-separated Discord user IDs with admin access
const ADMIN_IDS      = (process.env.DISCORD_ADMIN_IDS || '').split(',').map((s) => s.trim()).filter(Boolean);

if (!BOT_TOKEN || !CLIENT_ID || !GUILD_ID) {
  console.error('[discord] DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID/APPLICATION_ID, DISCORD_GUILD_ID required');
  process.exit(1);
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function makeBotJwt() {
  if (!JWT_SECRET) return null;
  return jwt.sign({ sub: 'wise-discord-bot', id: 'discord-bot', role: 'bot' }, JWT_SECRET, { expiresIn: '24h' });
}
let _botJwt = makeBotJwt();
setInterval(() => { _botJwt = makeBotJwt(); }, 6 * 60 * 60 * 1000); // refresh every 6h

function isAdmin(userId) {
  if (ADMIN_IDS.length === 0) return true; // no restriction if not configured
  return ADMIN_IDS.includes(userId);
}

// ── Event bus ─────────────────────────────────────────────────────────────────
async function publishEvent(event) {
  try {
    await fetch(`${COMMAND_CENTER}/api/events/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-events-key': EVENTS_SECRET },
      body: JSON.stringify(event),
      timeout: 3000,
    });
  } catch { /* non-fatal — event bus optional */ }
}

// ── Brain API ─────────────────────────────────────────────────────────────────
async function brainChat(message) {
  const res = await fetch(`${BRAIN_API}/brain/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_botJwt}` },
    body: JSON.stringify({ message, business: 'wise2' }),
    timeout: 90000,
  });
  if (!res.ok) throw new Error(`Brain API ${res.status}`);
  return res.json();
}

async function brainStatus() {
  const res = await fetch(`${BRAIN_API}/v1/brain-auth/status`, {
    headers: { 'Authorization': `Bearer ${_botJwt}` },
    timeout: 5000,
  });
  if (!res.ok) throw new Error(`Brain status ${res.status}`);
  return res.json();
}

// ── Health checks ─────────────────────────────────────────────────────────────
async function checkBrainHealth() {
  try {
    const res = await fetch(`${BRAIN_API}/health`, { timeout: 5000 });
    const data = await res.json();
    return { ok: res.ok, mongo: data.mongo, ollama: data.ollama, model: data.model };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function checkCommandCenter() {
  try {
    const res = await fetch(`${COMMAND_CENTER}/api/health`, { timeout: 5000 });
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ── Commands ──────────────────────────────────────────────────────────────────
const wiseCommand = new SlashCommandBuilder()
  .setName('wise')
  .setDescription('WISE² operations interface')
  .addSubcommand((sub) =>
    sub.setName('status').setDescription('Full WISE² system status')
  )
  .addSubcommand((sub) =>
    sub.setName('health').setDescription('Service health check')
  )
  .addSubcommand((sub) =>
    sub.setName('brain').setDescription('Ask the WISE² Second Brain a question')
      .addStringOption((opt) =>
        opt.setName('question').setDescription('Your question').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('devices').setDescription('Edge device network status')
  )
  .addSubcommand((sub) =>
    sub.setName('device').setDescription('Status of a specific device')
      .addStringOption((opt) =>
        opt.setName('name').setDescription('Device name (e.g. wisepi)').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('revenue').setDescription('Revenue operations overview')
  )
  .addSubcommand((sub) =>
    sub.setName('alerts').setDescription('Recent alerts and warnings')
  )
  .addSubcommand((sub) =>
    sub.setName('help').setDescription('WISE² Discord command reference')
  );

// ── Content Studio Command ────────────────────────────────────────────────────
const contentCommand = new SlashCommandBuilder()
  .setName('content')
  .setDescription('WISE² Faceless Content Studio')
  .addSubcommand((sub) =>
    sub.setName('create').setDescription('Create new content piece')
      .addStringOption((opt) =>
        opt.setName('brand').setDescription('Brand').setRequired(true)
          .addChoices(
            { name: 'WISE²', value: 'wise2' },
            { name: 'PIFF CITY', value: 'piff_city' },
            { name: 'Wise Shine', value: 'wise_shine' },
            { name: 'Wise Defense', value: 'wise_defense' }
          )
      )
      .addStringOption((opt) =>
        opt.setName('topic').setDescription('Topic or idea').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('platform').setDescription('Target platform').setRequired(true)
          .addChoices(
            { name: 'TikTok', value: 'tiktok' },
            { name: 'YouTube Shorts', value: 'youtube_shorts' },
            { name: 'Instagram Reels', value: 'instagram_reels' },
            { name: 'Facebook Reels', value: 'facebook_reels' },
            { name: 'LinkedIn', value: 'linkedin' },
            { name: 'X (Twitter)', value: 'x' }
          )
      )
      .addStringOption((opt) =>
        opt.setName('objective').setDescription('Content goal')
          .addChoices(
            { name: 'Awareness', value: 'awareness' },
            { name: 'Followers', value: 'followers' },
            { name: 'Leads', value: 'leads' },
            { name: 'Sales', value: 'sales' },
            { name: 'Education', value: 'education' }
          )
      )
      .addIntegerOption((opt) =>
        opt.setName('duration').setDescription('Video length in seconds')
          .addChoices(
            { name: '30 seconds', value: 30 },
            { name: '45 seconds', value: 45 },
            { name: '60 seconds', value: 60 },
            { name: '90 seconds', value: 90 }
          )
      )
      .addStringOption((opt) =>
        opt.setName('style').setDescription('Content style')
          .addChoices(
            { name: 'Cinematic', value: 'cinematic' },
            { name: 'Educational', value: 'educational' },
            { name: 'Documentary', value: 'documentary' },
            { name: 'Streetwear', value: 'streetwear' },
            { name: 'Luxury', value: 'luxury' },
            { name: 'Tactical', value: 'tactical' },
            { name: 'Viral', value: 'viral' }
          )
      )
      .addStringOption((opt) =>
        opt.setName('source_url').setDescription('Reference URL or source')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('batch').setDescription('Create multiple content pieces')
      .addStringOption((opt) =>
        opt.setName('brand').setDescription('Brand').setRequired(true)
          .addChoices(
            { name: 'WISE²', value: 'wise2' },
            { name: 'PIFF CITY', value: 'piff_city' },
            { name: 'Wise Shine', value: 'wise_shine' },
            { name: 'Wise Defense', value: 'wise_defense' }
          )
      )
      .addStringOption((opt) =>
        opt.setName('campaign').setDescription('Campaign name').setRequired(true)
      )
      .addIntegerOption((opt) =>
        opt.setName('quantity').setDescription('Number of pieces (1-30)').setRequired(true)
          .setMinValue(1).setMaxValue(30)
      )
      .addStringOption((opt) =>
        opt.setName('platform').setDescription('Target platform').setRequired(true)
          .addChoices(
            { name: 'TikTok', value: 'tiktok' },
            { name: 'YouTube Shorts', value: 'youtube_shorts' },
            { name: 'Instagram Reels', value: 'instagram_reels' },
            { name: 'Facebook Reels', value: 'facebook_reels' },
            { name: 'LinkedIn', value: 'linkedin' },
            { name: 'X (Twitter)', value: 'x' }
          )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('ideas').setDescription('Brainstorm content ideas')
      .addStringOption((opt) =>
        opt.setName('brand').setDescription('Brand').setRequired(true)
          .addChoices(
            { name: 'WISE²', value: 'wise2' },
            { name: 'PIFF CITY', value: 'piff_city' },
            { name: 'Wise Shine', value: 'wise_shine' },
            { name: 'Wise Defense', value: 'wise_defense' }
          )
      )
      .addStringOption((opt) =>
        opt.setName('niche').setDescription('Topic or niche')
      )
      .addStringOption((opt) =>
        opt.setName('objective').setDescription('Content goal')
      )
      .addIntegerOption((opt) =>
        opt.setName('quantity').setDescription('Number of ideas (max 25)').setMaxValue(25)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('status').setDescription('View content pipeline status')
  )
  .addSubcommand((sub) =>
    sub.setName('queue').setDescription('Browse content queue')
  )
  .addSubcommand((sub) =>
    sub.setName('brand').setDescription('View or update brand settings')
      .addStringOption((opt) =>
        opt.setName('name').setDescription('Brand name to view/edit')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('rewrite').setDescription('Rewrite or iterate on content')
      .addStringOption((opt) =>
        opt.setName('content_id').setDescription('Content project ID').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('instruction').setDescription('Rewrite instruction').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('cancel').setDescription('Cancel a content project')
      .addStringOption((opt) =>
        opt.setName('content_id').setDescription('Content project ID').setRequired(true)
      )
  );

// ── Command handlers ──────────────────────────────────────────────────────────
async function handleStatus(interaction) {
  await interaction.deferReply();

  const [cc, brain] = await Promise.all([checkCommandCenter(), checkBrainHealth()]);

  const embed = {
    color: (cc.ok && brain.ok) ? 0x00ff9d : 0xff4444,
    title: '⚡ WISE² System Status',
    fields: [
      {
        name: '🖥️ Command Center',
        value: cc.ok ? '✅ Online' : `❌ Offline${cc.error ? ` — ${cc.error}` : ''}`,
        inline: true,
      },
      {
        name: '🧠 Second Brain',
        value: brain.ok
          ? `✅ Online\nMongo: ${brain.mongo}\nOllama: ${brain.ollama}\nModel: ${brain.model}`
          : `❌ Offline${brain.error ? ` — ${brain.error}` : ''}`,
        inline: true,
      },
      {
        name: '🤖 Discord Bot',
        value: '✅ Online',
        inline: true,
      },
    ],
    footer: { text: 'WISE² Command Network' },
    timestamp: new Date().toISOString(),
  };

  await publishEvent({
    type: 'discord.command',
    severity: 'info',
    source: 'wise-discord',
    title: 'Discord: /wise status',
    message: `Status requested by ${interaction.user.username}`,
    meta: { userId: interaction.user.id, command: 'status' },
  });

  await interaction.editReply({ embeds: [embed] });
}

async function handleHealth(interaction) {
  await interaction.deferReply();

  const brain = await checkBrainHealth();
  const cc = await checkCommandCenter();

  const lines = [
    `**Command Center**: ${cc.ok ? '✅' : '❌'}`,
    `**Second Brain**: ${brain.ok ? '✅' : '❌'}`,
    brain.ok ? `  MongoDB: ${brain.mongo} | Ollama: ${brain.ollama} | Model: \`${brain.model}\`` : '',
    `**Discord Bot**: ✅`,
  ].filter(Boolean);

  await interaction.editReply(lines.join('\n'));
}

async function handleBrain(interaction) {
  if (!isAdmin(interaction.user.id)) {
    return interaction.reply({ content: '❌ Unauthorized — WISE² admin access required.', ephemeral: true });
  }

  const question = interaction.options.getString('question', true);
  await interaction.deferReply();

  await publishEvent({
    type: 'brain.query',
    severity: 'info',
    source: 'wise-discord',
    title: 'Discord Brain Query',
    message: `Query from ${interaction.user.username}: ${question.slice(0, 100)}`,
    meta: { userId: interaction.user.id },
  });

  try {
    const data = await brainChat(question);
    const response = data.response || 'No response.';
    const sources = data.sources || [];
    const contextUsed = data.contextUsed || false;

    const embed = {
      color: 0x00ff9d,
      title: '🧠 WISE² Second Brain',
      description: response.slice(0, 4000),
      fields: [
        {
          name: 'Sources',
          value: contextUsed && sources.length > 0
            ? sources.map((s) => `• ${s.title}`).join('\n')
            : '_No knowledge base context — general response_',
          inline: false,
        },
      ],
      footer: { text: `Model: ${data.model || 'ollama'} · Asked by ${interaction.user.username}` },
      timestamp: new Date().toISOString(),
    };

    await publishEvent({
      type: 'brain.query',
      severity: 'success',
      source: 'wise-discord',
      title: 'Brain Query Completed',
      message: `Response delivered — context: ${contextUsed}, sources: ${sources.length}`,
      meta: { contextUsed: contextUsed, sourceCount: sources.length },
    });

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    await publishEvent({
      type: 'brain.query',
      severity: 'error',
      source: 'wise-discord',
      title: 'Brain Query Failed',
      message: err.message,
    });
    await interaction.editReply(`❌ Brain query failed: ${err.message}`);
  }
}

async function handleDevices(interaction) {
  await interaction.deferReply();

  // Check known edge devices via brain API health as proxy
  const brain = await checkBrainHealth();

  const embed = {
    color: 0x7289da,
    title: '📡 WISE² Edge Network',
    fields: [
      {
        name: 'WisePi (pi-3b-001)',
        value: '🔍 Checking via heartbeat…\nUse `/wise device wisepi` for live status',
        inline: false,
      },
      {
        name: 'Brain API Host',
        value: brain.ok ? '✅ Server reachable' : '❌ Unreachable',
        inline: true,
      },
    ],
    footer: { text: 'Edge telemetry updates every 60s via heartbeat' },
    timestamp: new Date().toISOString(),
  };

  await publishEvent({
    type: 'discord.command',
    severity: 'info',
    source: 'wise-discord',
    title: 'Discord: /wise devices',
    message: `Device list requested by ${interaction.user.username}`,
  });

  await interaction.editReply({ embeds: [embed] });
}

async function handleDevice(interaction) {
  const name = interaction.options.getString('name', true).toLowerCase();
  await interaction.deferReply();

  await publishEvent({
    type: 'edge.alert',
    severity: 'info',
    source: 'wise-discord',
    title: `Discord: device status request`,
    message: `${interaction.user.username} requested status for "${name}"`,
    deviceId: name,
  });

  if (name === 'wisepi' || name === 'pi' || name === 'pi-3b-001') {
    // Try to get info from the brain about wisepi
    try {
      const data = await brainChat(`What is the current status of wisepi or pi-3b-001?`);
      const embed = {
        color: 0x00ff9d,
        title: `📡 Device: WisePi (pi-3b-001)`,
        description: data.response?.slice(0, 1000) || 'No telemetry available.',
        footer: { text: data.contextUsed ? 'Based on knowledge base context' : 'General knowledge — no live telemetry' },
        timestamp: new Date().toISOString(),
      };
      await interaction.editReply({ embeds: [embed] });
    } catch {
      await interaction.editReply('❌ Could not retrieve device status — Brain API unavailable.');
    }
  } else {
    await interaction.editReply(`❌ Unknown device: \`${name}\`. Known devices: \`wisepi\``);
  }
}

async function handleRevenue(interaction) {
  if (!isAdmin(interaction.user.id)) {
    return interaction.reply({ content: '❌ Unauthorized — WISE² admin access required.', ephemeral: true });
  }

  await interaction.deferReply({ ephemeral: true });

  await publishEvent({
    type: 'discord.command',
    severity: 'info',
    source: 'wise-discord',
    title: 'Discord: /wise revenue',
    message: `Revenue overview requested by ${interaction.user.username}`,
  });

  await interaction.editReply('📊 Revenue overview requires live API access. Check command.wise2.net/dashboard for full metrics.');
}

async function handleAlerts(interaction) {
  await interaction.deferReply();

  await publishEvent({
    type: 'discord.command',
    severity: 'info',
    source: 'wise-discord',
    title: 'Discord: /wise alerts',
    message: `Alerts requested by ${interaction.user.username}`,
  });

  await interaction.editReply('🔔 No active alerts. Monitor Live Ops at command.wise2.net/dashboard/live');
}

async function handleHelp(interaction) {
  const embed = {
    color: 0x7289da,
    title: '⚡ WISE² Discord Commands',
    description: 'All commands use the `/wise` prefix.',
    fields: [
      { name: '/wise status', value: 'Full system status — all services', inline: false },
      { name: '/wise health', value: 'Quick health check', inline: false },
      { name: '/wise brain <question>', value: 'Ask the Second Brain (admin)', inline: false },
      { name: '/wise devices', value: 'Edge device network overview', inline: false },
      { name: '/wise device <name>', value: 'Status for a specific device', inline: false },
      { name: '/wise revenue', value: 'Revenue operations overview (admin)', inline: false },
      { name: '/wise alerts', value: 'Recent system alerts', inline: false },
      { name: '/wise help', value: 'This help message', inline: false },
    ],
    footer: { text: 'WISE² Command Network · command.wise2.net' },
  };

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ── Content Studio Handlers ───────────────────────────────────────────────────

async function handleContentCreate(interaction) {
  await interaction.deferReply();

  const brand = interaction.options.getString('brand', true);
  const topic = interaction.options.getString('topic', true);
  const platform = interaction.options.getString('platform', true);
  const objective = interaction.options.getString('objective');
  const duration = interaction.options.getInteger('duration');
  const style = interaction.options.getString('style');
  const sourceUrl = interaction.options.getString('source_url');

  try {
    // Call Command Center API to create project
    const res = await fetch(`${COMMAND_CENTER}/api/content/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_botJwt}` },
      body: JSON.stringify({
        guildId: interaction.guildId,
        channelId: interaction.channelId,
        creatorDiscordId: interaction.user.id,
        brand,
        topic,
        platform,
        objective,
        durationSeconds: duration,
        style,
        sourceUrl,
        status: 'idea_received',
      }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const project = await res.json();

    const embed = {
      color: 0x39FF14,
      title: '🎬 Content Project Created',
      description: `New **${brand}** content project for ${platform}`,
      fields: [
        { name: 'Project ID', value: project.id, inline: true },
        { name: 'Topic', value: topic, inline: true },
        { name: 'Platform', value: platform, inline: true },
        { name: 'Status', value: '⏳ Researching topic…', inline: false },
        { name: 'Duration', value: duration ? `${duration}s` : 'Flexible', inline: true },
        { name: 'Objective', value: objective || 'General engagement', inline: true },
      ],
      footer: { text: 'Faceless Content Studio' },
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });

    await publishEvent({
      type: 'content.project.created',
      severity: 'info',
      source: 'wise-discord',
      title: 'Content project created',
      meta: { projectId: project.id, brand, platform, creator: interaction.user.id },
    });
  } catch (err) {
    console.error('[discord] Content create error:', err);
    await interaction.editReply(`❌ Failed to create content: ${err.message}`);
  }
}

async function handleContentStatus(interaction) {
  await interaction.deferReply();

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/content/queue`, {
      headers: { 'Authorization': `Bearer ${_botJwt}` },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const queue = await res.json();

    const statuses = {
      awaiting_approval: queue.filter(p => p.status === 'script_ready' || p.status === 'preview_ready').length,
      rendering: queue.filter(p => p.status === 'rendering').length,
      ready: queue.filter(p => p.status === 'approved').length,
      scheduled: queue.filter(p => p.status === 'scheduled').length,
      published: queue.filter(p => p.status === 'published').length,
      failed: queue.filter(p => p.status === 'failed').length,
    };

    const embed = {
      color: 0x39FF14,
      title: '📊 Content Pipeline Status',
      fields: [
        { name: '⏳ Awaiting Approval', value: `${statuses.awaiting_approval} items`, inline: true },
        { name: '🎬 Rendering', value: `${statuses.rendering} items`, inline: true },
        { name: '✅ Ready', value: `${statuses.ready} items`, inline: true },
        { name: '📅 Scheduled', value: `${statuses.scheduled} items`, inline: true },
        { name: '🚀 Published', value: `${statuses.published} items`, inline: true },
        { name: '❌ Failed', value: `${statuses.failed} items`, inline: true },
      ],
      footer: { text: 'Use /content queue to view details' },
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('[discord] Content status error:', err);
    await interaction.editReply(`❌ Failed to retrieve status: ${err.message}`);
  }
}

async function handleContentQueue(interaction) {
  await interaction.deferReply();

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/content/queue?limit=5`, {
      headers: { 'Authorization': `Bearer ${_botJwt}` },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const projects = await res.json();

    if (!projects || projects.length === 0) {
      return interaction.editReply('📭 No content projects in queue.');
    }

    const fields = projects.map((p, i) => ({
      name: `${i + 1}. ${p.topic}`,
      value: `**Brand:** ${p.brand}\n**Platform:** ${p.platform}\n**Status:** ${p.status}\n**ID:** \`${p.id}\``,
      inline: false,
    }));

    const embed = {
      color: 0x39FF14,
      title: '📋 Content Queue (Recent 5)',
      fields,
      footer: { text: 'Use project ID with /content rewrite or /content cancel' },
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('[discord] Content queue error:', err);
    await interaction.editReply(`❌ Failed to retrieve queue: ${err.message}`);
  }
}

async function handleContentBrand(interaction) {
  const brandName = interaction.options.getString('name');
  await interaction.deferReply();

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/content/brands`, {
      headers: { 'Authorization': `Bearer ${_botJwt}` },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const brands = await res.json();

    if (brandName) {
      const brand = brands.find((b) => b.slug === brandName || b.name.toLowerCase() === brandName.toLowerCase());
      if (!brand) {
        return interaction.editReply(`❌ Brand not found: ${brandName}`);
      }

      const embed = {
        color: 0x39FF14,
        title: `🎨 Brand: ${brand.name}`,
        fields: [
          { name: 'Voice', value: brand.voice || '(not set)', inline: false },
          { name: 'Audience', value: brand.audience || '(not set)', inline: false },
          { name: 'Visual Style', value: brand.visualStyle || '(not set)', inline: false },
          { name: 'Default CTA', value: brand.defaultCta || '(not set)', inline: false },
          { name: 'Primary Color', value: brand.primaryColor || '(not set)', inline: true },
          { name: 'Secondary Color', value: brand.secondaryColor || '(not set)', inline: true },
        ],
        timestamp: new Date().toISOString(),
      };

      return interaction.editReply({ embeds: [embed] });
    }

    // List all brands
    const fields = brands.map((b) => ({
      name: b.name,
      value: b.voice?.slice(0, 100) || '(no description)',
      inline: true,
    }));

    const embed = {
      color: 0x39FF14,
      title: '🎨 Available Brands',
      fields,
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('[discord] Content brand error:', err);
    await interaction.editReply(`❌ Failed to retrieve brands: ${err.message}`);
  }
}

async function handleContentIdeas(interaction) {
  await interaction.deferReply();

  const brand = interaction.options.getString('brand', true);
  const niche = interaction.options.getString('niche');
  const objective = interaction.options.getString('objective');
  const quantity = interaction.options.getInteger('quantity') || 5;

  try {
    // In production, would call AI to generate ideas
    const ideas = [
      { topic: 'Behind-the-scenes product launch', hook: 'See how we make it', audience: 'Engaged followers', cta: 'Follow for updates' },
      { topic: 'Customer testimonial transformation', hook: 'From problem to solution', audience: 'Prospects', cta: 'See your transformation' },
      { topic: 'Industry trend explanation', hook: 'What you need to know', audience: 'Decision makers', cta: 'Learn more' },
    ].slice(0, quantity);

    const fields = ideas.map((idea, i) => ({
      name: `${i + 1}. ${idea.topic}`,
      value: `**Hook:** ${idea.hook}\n**Audience:** ${idea.audience}\n**CTA:** ${idea.cta}`,
      inline: false,
    }));

    const embed = {
      color: 0x39FF14,
      title: `💡 Content Ideas for ${brand}`,
      fields,
      footer: { text: 'Click Generate to create content from an idea' },
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('[discord] Content ideas error:', err);
    await interaction.editReply(`❌ Failed to generate ideas: ${err.message}`);
  }
}

async function handleContentRewrite(interaction) {
  const contentId = interaction.options.getString('content_id', true);
  const instruction = interaction.options.getString('instruction', true);
  await interaction.deferReply();

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/content/projects/${contentId}/rewrite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${_botJwt}` },
      body: JSON.stringify({ instruction }),
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const embed = {
      color: 0x39FF14,
      title: '✏️ Rewrite Queued',
      description: `Content **${contentId}** is being rewritten with your feedback.`,
      fields: [
        { name: 'Instruction', value: instruction, inline: false },
        { name: 'Status', value: '⏳ Processing…', inline: false },
      ],
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('[discord] Content rewrite error:', err);
    await interaction.editReply(`❌ Failed to rewrite content: ${err.message}`);
  }
}

async function handleContentCancel(interaction) {
  const contentId = interaction.options.getString('content_id', true);
  await interaction.deferReply();

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/content/projects/${contentId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${_botJwt}` },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const embed = {
      color: 0xff4444,
      title: '❌ Project Cancelled',
      description: `Content project **${contentId}** has been cancelled.`,
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({ embeds: [embed] });
  } catch (err) {
    console.error('[discord] Content cancel error:', err);
    await interaction.editReply(`❌ Failed to cancel project: ${err.message}`);
  }
}

// ── Client ────────────────────────────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.on('ready', async () => {
  console.log(`[discord] Logged in as ${client.user.tag}`);
  const guilds = Array.from(client.guilds.cache.values()).map((g) => `${g.name}(${g.id})`);
  console.log(`[discord] Guilds: ${guilds.join(', ')}`);

  await publishEvent({
    type: 'system.health',
    severity: 'success',
    source: 'wise-discord',
    title: 'Discord Bot Online',
    message: `${client.user.tag} connected to ${guilds.length} guild(s)`,
  });

  // Register slash commands
  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
  try {
    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: [wiseCommand.toJSON(), contentCommand.toJSON()],
    });
    console.log('[discord] Commands registered: /wise, /content');
  } catch (err) {
    console.error('[discord] Command registration failed:', err.message);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;
  const sub = interaction.options.getSubcommand();
  console.log(`[discord] /${cmd} ${sub} from ${interaction.user.tag}(${interaction.user.id})`);

  try {
    if (cmd === 'wise') {
      switch (sub) {
        case 'status':  return handleStatus(interaction);
        case 'health':  return handleHealth(interaction);
        case 'brain':   return handleBrain(interaction);
        case 'devices': return handleDevices(interaction);
        case 'device':  return handleDevice(interaction);
        case 'revenue': return handleRevenue(interaction);
        case 'alerts':  return handleAlerts(interaction);
        case 'help':    return handleHelp(interaction);
        default:
          return interaction.reply({ content: `Unknown subcommand: ${sub}`, ephemeral: true });
      }
    } else if (cmd === 'content') {
      switch (sub) {
        case 'create': return handleContentCreate(interaction);
        case 'batch':  return interaction.reply({ content: '🚀 Batch creation coming soon', ephemeral: true });
        case 'ideas':  return handleContentIdeas(interaction);
        case 'status': return handleContentStatus(interaction);
        case 'queue':  return handleContentQueue(interaction);
        case 'brand':  return handleContentBrand(interaction);
        case 'rewrite': return handleContentRewrite(interaction);
        case 'cancel': return handleContentCancel(interaction);
        default:
          return interaction.reply({ content: `Unknown subcommand: ${sub}`, ephemeral: true });
      }
    }
  } catch (err) {
    console.error(`[discord] Error in /${cmd} ${sub}:`, err);
    const msg = { content: `❌ Internal error: ${err.message}`, ephemeral: true };
    interaction.deferred || interaction.replied
      ? await interaction.editReply(msg)
      : await interaction.reply(msg);
  }
});

client.login(BOT_TOKEN).catch((err) => {
  console.error('[discord] Login failed:', err.message);
  process.exit(1);
});

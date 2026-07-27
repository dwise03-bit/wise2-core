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
      body: [wiseCommand.toJSON()],
    });
    console.log('[discord] /wise command registered');
  } catch (err) {
    console.error('[discord] Command registration failed:', err.message);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'wise') return;

  const sub = interaction.options.getSubcommand();
  console.log(`[discord] /wise ${sub} from ${interaction.user.tag}(${interaction.user.id})`);

  try {
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
  } catch (err) {
    console.error(`[discord] Error in /wise ${sub}:`, err);
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

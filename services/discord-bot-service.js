#!/usr/bin/env node

/**
 * WISE² Discord Bot Service
 * Integrates Discord with WISE² IMP Intent Management Platform
 * Routes Discord commands through risk-based authorization
 */

const Discord = require('discord.js');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  port: 9003,
  impServiceUrl: 'http://localhost:9002',
  logDir: path.join(__dirname, '../data/logs'),
  memoryDir: path.join(__dirname, '../data/memory'),
};

// Ensure directories exist
[CONFIG.logDir, CONFIG.memoryDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.MessageContent,
  ],
});

// Pending confirmations: confirmationId -> { userId, intent, metadata }
const pendingConfirmations = new Map();

/**
 * Call WISE² IMP service
 */
async function callWise2Imp(endpoint, method = 'POST', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.impServiceUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { 'Content-Type': 'application/json' },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Classify Discord message as intent
 */
async function classifyIntent(input, userId) {
  try {
    const result = await callWise2Imp('/classify', 'POST', {
      input,
      userId,
      source: 'discord',
    });
    return result;
  } catch (error) {
    console.error('Intent classification error:', error);
    return { intent: 'unknown', confidence: 0, error: error.message };
  }
}

/**
 * Route intent through WISE² IMP
 */
async function routeIntent(intent, userId, metadata = {}) {
  try {
    const result = await callWise2Imp('/route', 'POST', {
      intent,
      userId,
      source: 'discord',
      metadata: {
        ...metadata,
        discordUserId: userId,
        timestamp: new Date().toISOString(),
      },
    });
    return result;
  } catch (error) {
    console.error('Intent routing error:', error);
    return { error: error.message, status: 'failed' };
  }
}

/**
 * Get confirmation status
 */
async function getConfirmation(confirmationId) {
  try {
    const result = await callWise2Imp(`/confirmations/${confirmationId}`, 'GET');
    return result;
  } catch (error) {
    console.error('Confirmation fetch error:', error);
    return { error: error.message };
  }
}

/**
 * Respond to confirmation
 */
async function respondToConfirmation(confirmationId, userId, approved, token) {
  try {
    const result = await callWise2Imp(`/confirmations/${confirmationId}`, 'POST', {
      userId,
      approved,
      token,
      source: 'discord',
    });
    return result;
  } catch (error) {
    console.error('Confirmation response error:', error);
    return { error: error.message };
  }
}

/**
 * Create rich embed for intent result
 */
function createResultEmbed(result) {
  const embed = new Discord.EmbedBuilder()
    .setColor(result.status === 'success' ? '#00FF14' : '#FF0000')
    .setTitle(result.intent || 'Operation')
    .setDescription(result.message || result.description || 'No description');

  if (result.data) {
    Object.entries(result.data).slice(0, 5).forEach(([key, value]) => {
      embed.addFields({ name: key, value: String(value).slice(0, 100), inline: true });
    });
  }

  if (result.confirmationId) {
    embed.addFields({
      name: '⚠️ Confirmation Required',
      value: `ID: \`${result.confirmationId}\`\nUse buttons below to approve or deny.`,
    });
  }

  embed.setFooter({ text: `Status: ${result.status || 'pending'}` });
  embed.setTimestamp();

  return embed;
}

/**
 * Create action row with approval buttons
 */
function createConfirmationButtons(confirmationId) {
  return new Discord.ActionRowBuilder()
    .addComponents(
      new Discord.ButtonBuilder()
        .setCustomId(`approve_${confirmationId}`)
        .setLabel('✓ Approve')
        .setStyle(Discord.ButtonStyle.Success),
      new Discord.ButtonBuilder()
        .setCustomId(`deny_${confirmationId}`)
        .setLabel('✗ Deny')
        .setStyle(Discord.ButtonStyle.Danger),
    );
}

/**
 * Handle slash command
 */
async function handleSlashCommand(interaction) {
  const command = interaction.commandName;
  const userId = interaction.user.id;

  await interaction.deferReply();

  try {
    if (command === 'intent') {
      const input = interaction.options.getString('description');
      const role = interaction.options.getString('role') || 'viewer';

      // Classify the input
      const classification = await classifyIntent(input, userId);
      if (classification.error || classification.confidence < 0.6) {
        return interaction.editReply({
          embeds: [
            new Discord.EmbedBuilder()
              .setColor('#FF6B00')
              .setTitle('Intent Classification Failed')
              .setDescription(`Could not classify: "${input}"\nConfidence: ${classification.confidence || 0}%`),
          ],
        });
      }

      // Route the intent
      const result = await routeIntent(classification.intent, userId, {
        role,
        originalInput: input,
      });

      const embed = createResultEmbed(result);

      if (result.confirmationId) {
        return interaction.editReply({
          embeds: [embed],
          components: [createConfirmationButtons(result.confirmationId)],
        });
      }

      return interaction.editReply({ embeds: [embed] });
    }

    if (command === 'status') {
      const result = await callWise2Imp('/status', 'GET');
      const embed = new Discord.EmbedBuilder()
        .setColor('#00FF14')
        .setTitle('WISE² IMP Status')
        .addFields(
          { name: 'Service', value: result.service || 'Online', inline: true },
          { name: 'Uptime', value: result.uptime || 'N/A', inline: true },
          { name: 'Intents Processed', value: String(result.totalIntents || 0), inline: true },
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('Command error:', error);
    return interaction.editReply({
      embeds: [
        new Discord.EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Error')
          .setDescription(`Failed to process command: ${error.message}`),
      ],
    });
  }
}

/**
 * Handle button interactions (approve/deny)
 */
async function handleButtonInteraction(interaction) {
  const [action, confirmationId] = interaction.customId.split('_');
  const userId = interaction.user.id;

  await interaction.deferUpdate();

  try {
    const approved = action === 'approve';
    const response = await respondToConfirmation(confirmationId, userId, approved, '');

    if (response.error) {
      return interaction.followUp({
        embeds: [
          new Discord.EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Confirmation Error')
            .setDescription(response.error),
        ],
        ephemeral: true,
      });
    }

    const embed = createResultEmbed(response);
    await interaction.message.edit({ embeds: [embed], components: [] });

    return interaction.followUp({
      content: `✓ Confirmation ${approved ? 'approved' : 'denied'} by ${interaction.user.username}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error('Button handler error:', error);
    return interaction.followUp({
      embeds: [
        new Discord.EmbedBuilder()
          .setColor('#FF0000')
          .setTitle('Error')
          .setDescription(`Failed to process confirmation: ${error.message}`),
      ],
      ephemeral: true,
    });
  }
}

/**
 * Discord bot ready
 */
client.once('ready', async () => {
  console.log(`[${new Date().toISOString()}] Discord bot ready as ${client.user.tag}`);

  // Register slash commands
  const commands = [
    {
      name: 'intent',
      description: 'Submit a task or query to WISE² IMP',
      options: [
        {
          name: 'description',
          description: 'What do you want WISE² to do?',
          type: 3, // STRING
          required: true,
        },
        {
          name: 'role',
          description: 'Your access level',
          type: 3,
          required: false,
          choices: [
            { name: 'viewer', value: 'viewer' },
            { name: 'operator', value: 'operator' },
            { name: 'owner', value: 'owner' },
          ],
        },
      ],
    },
    {
      name: 'status',
      description: 'Check WISE² IMP service status',
    },
  ];

  try {
    await client.application.commands.set(commands);
    console.log('[Discord] Slash commands registered');
  } catch (error) {
    console.error('[Discord] Failed to register commands:', error);
  }
});

/**
 * Handle interactions
 */
client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isCommand()) {
      await handleSlashCommand(interaction);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction);
    }
  } catch (error) {
    console.error('[Discord] Interaction error:', error);
    try {
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    } catch (e) {
      console.error('Failed to reply to interaction:', e);
    }
  }
});

/**
 * Handle messages (prefix commands fallback)
 */
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.content.startsWith('!wise2')) return;

  const args = message.content.slice(6).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'intent') {
    const input = args.join(' ');
    if (!input) return message.reply('Please provide a description.');

    const classification = await classifyIntent(input, message.author.id);
    const result = await routeIntent(classification.intent, message.author.id);

    const embed = createResultEmbed(result);
    return message.reply({ embeds: [embed] });
  }

  if (command === 'status') {
    const result = await callWise2Imp('/status', 'GET');
    const embed = new Discord.EmbedBuilder()
      .setColor('#00FF14')
      .setTitle('WISE² IMP Status')
      .addFields(
        { name: 'Service', value: result.service || 'Online' },
        { name: 'Uptime', value: result.uptime || 'N/A' },
      );
    return message.reply({ embeds: [embed] });
  }
});

/**
 * Logging endpoint for testing
 */
const logServer = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/log') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] ${body}\n`;
      fs.appendFileSync(path.join(CONFIG.logDir, 'discord-bot.log'), logEntry);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'logged' }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

/**
 * Start services
 */
function start() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    console.error('❌ DISCORD_BOT_TOKEN not set');
    process.exit(1);
  }

  client.login(token);
  logServer.listen(CONFIG.port, () => {
    console.log(`[${new Date().toISOString()}] Discord bot logging on port ${CONFIG.port}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = { client, classifyIntent, routeIntent, respondToConfirmation };

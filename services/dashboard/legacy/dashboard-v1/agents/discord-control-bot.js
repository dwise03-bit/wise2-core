/**
 * Discord Bot Control System
 *
 * Provides Discord commands to monitor and control the agent fleet:
 * - /bots status - Show all bot status
 * - /bots restart - Restart all or specific bot
 * - /bots start - Start all or specific bot
 * - /bots stop - Stop all or specific bot
 * - /health - Show system health report
 * - /logs <agent> - Show recent agent logs
 *
 * Environment variables required:
 * - DISCORD_TOKEN: Bot token from Discord Developer Portal
 * - DISCORD_GUILD_ID: Guild ID where bot commands are registered
 */

const { Client, IntentsBitField, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { execSync } = require('child_process');
const pg = require('pg');

const client = new Client({ intents: [IntentsBitField.Flags.Guilds] });

// Initialize database pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

/**
 * Query helper
 */
async function query(text, params = []) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('[DISCORD-CONTROL] Query error:', error.message);
    throw error;
  }
}

/**
 * Get PM2 process status
 */
function getPM2Status() {
  try {
    const output = execSync('pm2 list --format json --no-autosave', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const processes = JSON.parse(output);

    return processes.map(p => ({
      id: p.pm2_env.pm_id,
      name: p.name,
      status: p.pm2_env.status,
      pid: p.pid || null,
      memory: Math.round(p.monit.memory / 1024 / 1024),
      cpu: Math.round(p.monit.cpu || 0),
      uptime: p.pm2_env.pm_uptime,
      restarts: p.pm2_env.restart_time,
    }));
  } catch (error) {
    console.error('[DISCORD-CONTROL] Failed to get PM2 status:', error.message);
    return [];
  }
}

/**
 * Execute PM2 command
 */
function executePM2Command(action, botId) {
  try {
    let command = '';

    if (action === 'start') {
      command = botId ? `pm2 start ${botId} --no-autosave` : 'pm2 start ecosystem.config.js --no-autosave';
    } else if (action === 'stop') {
      command = botId ? `pm2 stop ${botId} --no-autosave` : 'pm2 stop all --no-autosave';
    } else if (action === 'restart') {
      command = botId ? `pm2 restart ${botId} --no-autosave` : 'pm2 restart all --no-autosave';
    } else if (action === 'logs') {
      command = botId ? `pm2 logs ${botId} --lines 20 --nostream` : 'pm2 logs';
    }

    if (command) {
      execSync(command, { stdio: 'ignore' });
      return true;
    }
    return false;
  } catch (error) {
    console.error(`[DISCORD-CONTROL] Failed to execute ${action}:`, error.message);
    return false;
  }
}

/**
 * Get recent logs for an agent
 */
function getAgentLogs(botId) {
  try {
    const output = execSync(`pm2 logs ${botId} --lines 10 --nostream`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    return output.split('\n').filter(line => line.trim()).slice(-10).join('\n') || 'No logs available';
  } catch (error) {
    return 'Failed to retrieve logs';
  }
}

/**
 * Create status embed
 */
function createStatusEmbed(bots) {
  const embed = new EmbedBuilder()
    .setColor('#ff1744')
    .setTitle('🤖 Agent Fleet Status')
    .setTimestamp();

  if (bots.length === 0) {
    embed.setDescription('No agents running');
    return embed;
  }

  const summary = {
    total: bots.length,
    online: bots.filter(b => b.status === 'online').length,
    errored: bots.filter(b => b.status === 'errored').length,
    stopped: bots.filter(b => b.status === 'stopped').length,
  };

  embed.addFields(
    {
      name: '📊 Summary',
      value: `Total: ${summary.total} | Online: ${summary.online} | Errored: ${summary.errored} | Stopped: ${summary.stopped}`,
      inline: false
    }
  );

  // Add bot details
  const botFields = bots.map(bot => {
    const statusEmoji = bot.status === 'online' ? '✅' : bot.status === 'errored' ? '❌' : '⏸️';
    return {
      name: `${statusEmoji} ${bot.name} (ID: ${bot.id})`,
      value: `Status: **${bot.status}** | Memory: ${bot.memory}MB | CPU: ${bot.cpu}% | Uptime: ${bot.uptime || 'N/A'} | Restarts: ${bot.restarts}`,
      inline: false
    };
  });

  embed.addFields(...botFields);

  return embed;
}

/**
 * Create health embed
 */
async function createHealthEmbed() {
  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('🏥 System Health Report')
    .setTimestamp();

  try {
    const result = await query(
      `SELECT * FROM health_reports ORDER BY created_at DESC LIMIT 1`
    );

    if (result.rows.length > 0) {
      const report = result.rows[0].report_json;
      const dbStatus = report.database?.status || 'unknown';
      const agentsOnline = report.agents?.online || 0;
      const agentsTotal = report.agents?.total || 0;

      embed.addFields(
        {
          name: '🗄️ Database',
          value: `Status: **${dbStatus}**`,
          inline: true
        },
        {
          name: '🤖 Agents',
          value: `${agentsOnline}/${agentsTotal} online`,
          inline: true
        },
        {
          name: '⚙️ System',
          value: report.summary?.systemHealthy ? '✅ Healthy' : '⚠️ Issues detected',
          inline: true
        }
      );
    } else {
      embed.setDescription('No health reports available yet');
    }
  } catch (error) {
    embed.setDescription('Failed to retrieve health data');
  }

  return embed;
}

/**
 * Handle slash commands
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options } = interaction;

  try {
    await interaction.deferReply({ ephemeral: true });

    if (commandName === 'bots') {
      const subcommand = options.getSubcommand();
      const botName = options.getString('bot');

      let bots = getPM2Status();
      let botId = null;

      if (botName) {
        const bot = bots.find(b => b.name === botName || b.id === parseInt(botName));
        if (!bot) {
          return interaction.editReply(`❌ Bot "${botName}" not found`);
        }
        botId = bot.id;
      }

      switch (subcommand) {
        case 'status': {
          const embed = createStatusEmbed(bots);
          const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId('refresh_status')
              .setLabel('🔄 Refresh')
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('restart_all')
              .setLabel('Restart All')
              .setStyle(ButtonStyle.Danger)
          );
          return interaction.editReply({ embeds: [embed], components: [row] });
        }

        case 'restart': {
          const success = executePM2Command('restart', botId);
          if (success) {
            const target = botName ? `"${botName}"` : 'all agents';
            const newBots = getPM2Status();
            const embed = createStatusEmbed(newBots);
            embed.addFields({
              name: '✅ Action',
              value: `Restarted ${target}`,
              inline: false
            });
            return interaction.editReply({ embeds: [embed] });
          }
          return interaction.editReply('❌ Failed to restart agent(s)');
        }

        case 'start': {
          const success = executePM2Command('start', botId);
          if (success) {
            const target = botName ? `"${botName}"` : 'all agents';
            const newBots = getPM2Status();
            const embed = createStatusEmbed(newBots);
            embed.addFields({
              name: '✅ Action',
              value: `Started ${target}`,
              inline: false
            });
            return interaction.editReply({ embeds: [embed] });
          }
          return interaction.editReply('❌ Failed to start agent(s)');
        }

        case 'stop': {
          const success = executePM2Command('stop', botId);
          if (success) {
            const target = botName ? `"${botName}"` : 'all agents';
            const newBots = getPM2Status();
            const embed = createStatusEmbed(newBots);
            embed.addFields({
              name: '⏸️ Action',
              value: `Stopped ${target}`,
              inline: false
            });
            return interaction.editReply({ embeds: [embed] });
          }
          return interaction.editReply('❌ Failed to stop agent(s)');
        }

        case 'logs': {
          if (!botName) {
            return interaction.editReply('❌ Please specify a bot name');
          }
          const logs = getAgentLogs(botId);
          const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`📋 ${botName} Logs`)
            .setDescription(`\`\`\`\n${logs}\n\`\`\``)
            .setTimestamp();
          return interaction.editReply({ embeds: [embed] });
        }
      }
    }

    if (commandName === 'health') {
      const embed = await createHealthEmbed();
      return interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('[DISCORD-CONTROL] Error handling command:', error);
    interaction.editReply('❌ An error occurred while processing your command');
  }
});

/**
 * Handle button interactions
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;

  try {
    await interaction.deferReply({ ephemeral: true });

    if (interaction.customId === 'refresh_status') {
      const bots = getPM2Status();
      const embed = createStatusEmbed(bots);
      return interaction.editReply({ embeds: [embed] });
    }

    if (interaction.customId === 'restart_all') {
      executePM2Command('restart', null);
      const bots = getPM2Status();
      const embed = createStatusEmbed(bots);
      embed.addFields({
        name: '✅ Action',
        value: 'Restarted all agents',
        inline: false
      });
      return interaction.editReply({ embeds: [embed] });
    }
  } catch (error) {
    console.error('[DISCORD-CONTROL] Error handling button:', error);
    interaction.editReply('❌ An error occurred');
  }
});

/**
 * Register slash commands
 */
client.on('ready', async () => {
  console.log(`[DISCORD-CONTROL] Bot logged in as ${client.user.tag}`);

  const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
  if (!guild) {
    console.error('[DISCORD-CONTROL] Guild not found');
    return;
  }

  const commands = [
    new SlashCommandBuilder()
      .setName('bots')
      .setDescription('Control agent fleet')
      .addSubcommand(sub =>
        sub.setName('status')
          .setDescription('Show all agent status')
      )
      .addSubcommand(sub =>
        sub.setName('restart')
          .setDescription('Restart agent(s)')
          .addStringOption(opt =>
            opt.setName('bot')
              .setDescription('Bot name or ID (optional)')
              .setRequired(false)
          )
      )
      .addSubcommand(sub =>
        sub.setName('start')
          .setDescription('Start agent(s)')
          .addStringOption(opt =>
            opt.setName('bot')
              .setDescription('Bot name or ID (optional)')
              .setRequired(false)
          )
      )
      .addSubcommand(sub =>
        sub.setName('stop')
          .setDescription('Stop agent(s)')
          .addStringOption(opt =>
            opt.setName('bot')
              .setDescription('Bot name or ID (optional)')
              .setRequired(false)
          )
      )
      .addSubcommand(sub =>
        sub.setName('logs')
          .setDescription('Show agent logs')
          .addStringOption(opt =>
            opt.setName('bot')
              .setDescription('Bot name or ID')
              .setRequired(true)
          )
      ),
    new SlashCommandBuilder()
      .setName('health')
      .setDescription('Show system health report'),
  ];

  try {
    await guild.commands.set(commands);
    console.log('[DISCORD-CONTROL] Slash commands registered');
  } catch (error) {
    console.error('[DISCORD-CONTROL] Failed to register commands:', error);
  }
});

/**
 * Handle errors
 */
client.on('error', error => {
  console.error('[DISCORD-CONTROL] Discord error:', error);
});

process.on('uncaughtException', error => {
  console.error('[DISCORD-CONTROL] Uncaught exception:', error);
});

/**
 * Graceful shutdown
 */
async function shutdown() {
  console.log('[DISCORD-CONTROL] Shutting down gracefully...');
  try {
    await pool.end();
    await client.destroy();
    console.log('[DISCORD-CONTROL] Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('[DISCORD-CONTROL] Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Connect to Discord
 */
client.login(process.env.DISCORD_TOKEN || process.env.DISCORD_CONTROL_BOT_TOKEN);

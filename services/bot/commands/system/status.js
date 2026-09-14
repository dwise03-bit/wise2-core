/**
 * /status command
 * Display overall WISE² system status
 */

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const axios = require('axios');

const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Display WISE² system status')
  .addStringOption(option =>
    option
      .setName('format')
      .setDescription('Output format')
      .setChoices(
        { name: 'Detailed', value: 'detailed' },
        { name: 'Summary', value: 'summary' },
      )
  );

async function execute(interaction) {
  const startTime = Date.now();
  const format = interaction.options.getString('format') || 'summary';

  await interaction.deferReply();

  try {
    const services = await checkAllServices();
    const duration = Date.now() - startTime;

    const embed = buildStatusEmbed(services, format);
    embed.setFooter({
      text: `Status check completed in ${duration}ms`,
    });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('status_refresh')
        .setLabel('Refresh')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('status_detailed')
        .setLabel('Details')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  } catch (error) {
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Status Check Failed')
          .setDescription(error.message)
          .setTimestamp(),
      ],
    });
  }
}

/**
 * Check status of all WISE² services
 * @returns {Promise<Object>} Service statuses
 */
async function checkAllServices() {
  const services = {
    website: { name: 'wise2.net', url: 'https://wise2.net', status: 'UNKNOWN' },
    api: { name: 'API', url: 'http://localhost:3010/health', status: 'UNKNOWN' },
    postgres: { name: 'PostgreSQL', url: 'http://localhost:5432', status: 'UNKNOWN' },
    redis: { name: 'Redis', url: 'http://localhost:6379', status: 'UNKNOWN' },
    dashboard: { name: 'Dashboard', url: 'http://localhost:3000', status: 'UNKNOWN' },
    ollama: { name: 'Ollama', url: 'http://localhost:11434/api/health', status: 'UNKNOWN' },
  };

  const checks = Object.keys(services).map(async (key) => {
    const service = services[key];
    try {
      const response = await axios.get(service.url, {
        timeout: 5000,
      });
      service.status = response.status === 200 ? 'ONLINE' : 'DEGRADED';
      service.statusCode = response.status;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        service.status = 'OFFLINE';
      } else if (error.response) {
        service.status = 'DEGRADED';
        service.statusCode = error.response.status;
      } else {
        service.status = 'UNREACHABLE';
      }
    }
  });

  await Promise.allSettled(checks);
  return services;
}

/**
 * Build status embed
 * @param {Object} services - Service status object
 * @param {string} format - Display format
 * @returns {EmbedBuilder} Status embed
 */
function buildStatusEmbed(services, format) {
  const embed = new EmbedBuilder()
    .setColor(getHealthColor(services))
    .setTitle('🔵 WISE² System Status')
    .setTimestamp();

  if (format === 'summary') {
    const statusCounts = {
      ONLINE: 0,
      DEGRADED: 0,
      OFFLINE: 0,
      UNREACHABLE: 0,
    };

    for (const key in services) {
      statusCounts[services[key].status]++;
    }

    embed.addFields(
      {
        name: '✅ Online',
        value: `${statusCounts.ONLINE} services`,
        inline: true,
      },
      {
        name: '⚠️ Degraded',
        value: `${statusCounts.DEGRADED} services`,
        inline: true,
      },
      {
        name: '❌ Offline',
        value: `${statusCounts.OFFLINE} services`,
        inline: true,
      },
    );
  } else {
    // Detailed format
    const fields = Object.keys(services)
      .map(key => ({
        name: services[key].name,
        value: `${getStatusEmoji(services[key].status)} ${services[key].status}`,
        inline: true,
      }));

    embed.addFields(fields);
  }

  return embed;
}

/**
 * Get health color for embed
 * @param {Object} services - Services object
 * @returns {number} Color code
 */
function getHealthColor(services) {
  let online = 0;
  let total = Object.keys(services).length;

  for (const key in services) {
    if (services[key].status === 'ONLINE') online++;
  }

  if (online === total) return 0x00ff00; // Green - all healthy
  if (online >= total * 0.75) return 0xffff00; // Yellow - mostly healthy
  return 0xff0000; // Red - critical
}

/**
 * Get status emoji
 * @param {string} status - Status value
 * @returns {string} Emoji
 */
function getStatusEmoji(status) {
  const emojis = {
    ONLINE: '✅',
    DEGRADED: '⚠️',
    OFFLINE: '❌',
    UNREACHABLE: '❓',
  };
  return emojis[status] || '❓';
}

module.exports = {
  data,
  execute,
  checkAllServices,
};

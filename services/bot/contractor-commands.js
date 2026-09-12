/**
 * WISE² Contractor OS Discord Commands
 * Slash commands for Contractor OS product
 * Integrated with existing WISE² Discord bot
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Command definitions
const commands = [
  new SlashCommandBuilder()
    .setName('contractor')
    .setDescription('🚀 View WISE² Contractor OS — CRM, jobs, estimates, crews, and AI in one system')
    .addStringOption((option) =>
      option
        .setName('section')
        .setDescription('Which section to view')
        .setRequired(false)
        .addChoices(
          { name: 'Overview', value: 'overview' },
          { name: 'Features', value: 'features' },
          { name: 'Trades', value: 'trades' },
          { name: 'Pricing', value: 'pricing' },
          { name: 'Demo', value: 'demo' }
        )
    ),

  new SlashCommandBuilder()
    .setName('contractor-features')
    .setDescription('📊 View Contractor OS features in detail'),

  new SlashCommandBuilder()
    .setName('contractor-demo')
    .setDescription('🎬 Request a demo of Contractor OS'),

  new SlashCommandBuilder()
    .setName('contractor-help')
    .setDescription('❓ Get help with Contractor OS'),
];

// Handler functions
const handlers = {
  async contractor(interaction) {
    const section = interaction.options.getString('section') || 'overview';
    const sectionUrls = {
      overview: 'https://wise2.net/contractor',
      features: 'https://wise2.net/contractor#features',
      trades: 'https://wise2.net/contractor#trades',
      pricing: 'https://wise2.net/contractor#pricing',
      demo: 'https://wise2.net/contractor#demo',
    };

    const url = sectionUrls[section] || sectionUrls.overview;

    const embed = new EmbedBuilder()
      .setTitle('🚀 WISE² Contractor OS')
      .setDescription('One login. One system. Total control.')
      .setColor(0xf2b632) // WISE² gold
      .setURL(url)
      .addFields(
        {
          name: '📍 Section',
          value: section.charAt(0).toUpperCase() + section.slice(1),
          inline: true,
        },
        {
          name: '🔗 View Page',
          value: `[Open ${section.charAt(0).toUpperCase() + section.slice(1)} →](${url})`,
          inline: true,
        }
      )
      .setFooter({ text: 'WISE² Contractor OS v1.0' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Contractor OS')
        .setURL(url)
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorFeatures(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📊 Contractor OS Features')
      .setDescription('Everything you need to run your business')
      .setColor(0xf2b632)
      .setURL('https://wise2.net/contractor#features')
      .addFields(
        {
          name: '💼 CRM & Leads',
          value: 'Capture, track, and follow up on every lead automatically',
          inline: true,
        },
        {
          name: '📋 Jobs & Dispatch',
          value: 'Schedule crews and track progress in real-time',
          inline: true,
        },
        {
          name: '📑 Estimates',
          value: 'Professional proposals with e-signatures',
          inline: true,
        },
        {
          name: '💰 Invoices & Payments',
          value: 'Send, automate, and collect payments',
          inline: true,
        },
        {
          name: '💬 Team Chat',
          value: 'Built-in messaging for instant crew coordination',
          inline: true,
        },
        {
          name: '🤖 AI Operator',
          value: 'Ask anything and get business recommendations',
          inline: true,
        },
        {
          name: '⛈️ Storm Intel',
          value: 'Detect job opportunities before competitors',
          inline: true,
        },
        {
          name: '⚡ Automation',
          value: 'Workflows, triggers, and AI actions',
          inline: true,
        }
      )
      .setFooter({ text: 'Replaces 7+ separate apps' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Full Features')
        .setURL('https://wise2.net/contractor#features')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorDemo(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📅 Schedule a Demo')
      .setDescription('Ready to see Contractor OS in action?')
      .setColor(0x22c55e) // Green
      .setURL('https://wise2.net/contractor#demo')
      .addFields(
        {
          name: '🎯 Demo Includes',
          value:
            '• Live product walkthrough\n' +
            '• Industry-specific setup\n' +
            '• Integration possibilities\n' +
            '• Pricing & plans Q&A',
        },
        {
          name: '⏱️ Duration',
          value: '30 minutes (no pressure, no sales call)',
        }
      )
      .setFooter({ text: 'WISE² Contractor OS' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Schedule Demo')
        .setURL('https://wise2.net/contractor#demo')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Learn More')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },

  async contractorHelp(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('❓ Contractor OS Help')
      .setDescription('Common questions and getting started')
      .setColor(0x3b82f6) // Blue
      .addFields(
        {
          name: '🚀 Getting Started',
          value: '[View the Contractor OS →](https://wise2.net/contractor)',
        },
        {
          name: '📚 Documentation',
          value: '[Browse guides & tutorials →](https://wise2.net/docs)',
        },
        {
          name: '📞 Need Support?',
          value: 'Reply to this message or visit wise2.net/support',
        },
        {
          name: '🏗️ For Which Trades?',
          value:
            'HVAC • Roofing • Pressure Washing • Construction • Plumbing • Electrical • Landscaping • Pest Control • Painting • Detailing',
          inline: false,
        }
      )
      .setFooter({ text: 'More help at https://wise2.net' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('View Contractor OS')
        .setURL('https://wise2.net/contractor')
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('Request Demo')
        .setURL('https://wise2.net/contractor#demo')
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: false,
    });
  },
};

module.exports = {
  commands,
  handlers,
};

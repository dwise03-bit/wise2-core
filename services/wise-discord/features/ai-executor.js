'use strict';

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const BRAIN_API = process.env.BRAIN_API_URL || 'http://127.0.0.1:3011/api';

const aiCommand = new SlashCommandBuilder()
  .setName('ai')
  .setDescription('WISE² AI Command Executor')
  .addSubcommand((sub) =>
    sub.setName('ask')
      .setDescription('Ask WISE² AI a question')
      .addStringOption((opt) =>
        opt.setName('query').setDescription('Your question or task').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('context').setDescription('Additional context (optional)')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('code-review')
      .setDescription('AI code review')
      .addStringOption((opt) =>
        opt.setName('pr_url').setDescription('GitHub PR URL').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('focus').setDescription('Focus area (bugs, performance, security, style)')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('brief')
      .setDescription('AI-generated content brief')
      .addStringOption((opt) =>
        opt.setName('topic').setDescription('Topic or product').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('audience').setDescription('Target audience').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('format').setDescription('Brief format').addChoices(
          { name: 'Social Post', value: 'social' },
          { name: 'Email Copy', value: 'email' },
          { name: 'Landing Page', value: 'landing' },
          { name: 'Ad Copy', value: 'ad' },
          { name: 'Product Description', value: 'product' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('analyze')
      .setDescription('Analyze text, data, or code')
      .addStringOption((opt) =>
        opt.setName('input').setDescription('Text to analyze').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('type').setDescription('Analysis type').addChoices(
          { name: 'Sentiment', value: 'sentiment' },
          { name: 'Summary', value: 'summary' },
          { name: 'Extract Keywords', value: 'keywords' },
          { name: 'Identify Issues', value: 'issues' },
          { name: 'Structure & Format', value: 'structure' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('research')
      .setDescription('Research a topic with AI')
      .addStringOption((opt) =>
        opt.setName('topic').setDescription('What to research').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('depth').setDescription('Research depth').addChoices(
          { name: 'Quick Overview', value: 'quick' },
          { name: 'Comprehensive', value: 'deep' },
          { name: 'Competitive Analysis', value: 'competitive' }
        )
      )
  );

async function handleAiCommand(interaction, jwtToken) {
  await interaction.deferReply();

  try {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'ask':
        return handleAiAsk(interaction, jwtToken);
      case 'code-review':
        return handleCodeReview(interaction, jwtToken);
      case 'brief':
        return handleContentBrief(interaction, jwtToken);
      case 'analyze':
        return handleAnalyze(interaction, jwtToken);
      case 'research':
        return handleResearch(interaction, jwtToken);
      default:
        return interaction.editReply('Unknown subcommand');
    }
  } catch (error) {
    console.error('[ai-executor] Error:', error);
    return interaction.editReply(`❌ Error: ${error.message}`);
  }
}

async function handleAiAsk(interaction, jwtToken) {
  const query = interaction.options.getString('query');
  const context = interaction.options.getString('context') || '';

  try {
    const res = await fetch(`${BRAIN_API}/brain/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        message: context ? `${query}\n\nContext: ${context}` : query,
        business: 'wise2',
      }),
      timeout: 90000,
    });

    if (!res.ok) throw new Error(`Brain API ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('🤖 WISE² AI Response')
      .setDescription(data.response || data.message)
      .setFooter({ text: 'Powered by WISE² Second Brain' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleCodeReview(interaction, jwtToken) {
  const prUrl = interaction.options.getString('pr_url');
  const focus = interaction.options.getString('focus') || 'bugs';

  try {
    const res = await fetch(`${BRAIN_API}/brain/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        message: `Review this GitHub PR for ${focus} issues: ${prUrl}. Provide actionable feedback and severity levels.`,
        business: 'wise2',
      }),
      timeout: 120000,
    });

    if (!res.ok) throw new Error(`Brain API ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xff9d00)
      .setTitle('🔍 Code Review Analysis')
      .setDescription(data.response || data.message)
      .addFields({ name: 'PR URL', value: prUrl })
      .addFields({ name: 'Focus Area', value: focus })
      .setFooter({ text: 'AI-assisted code review' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleContentBrief(interaction, jwtToken) {
  const topic = interaction.options.getString('topic');
  const audience = interaction.options.getString('audience');
  const format = interaction.options.getString('format') || 'social';

  try {
    const res = await fetch(`${BRAIN_API}/brain/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        message: `Create a ${format} brief for topic: "${topic}" targeting: "${audience}". Include key points, tone, and CTA.`,
        business: 'wise2',
      }),
      timeout: 60000,
    });

    if (!res.ok) throw new Error(`Brain API ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('📝 Content Brief')
      .setDescription(data.response || data.message)
      .addFields([
        { name: 'Topic', value: topic },
        { name: 'Audience', value: audience },
        { name: 'Format', value: format },
      ])
      .setFooter({ text: 'AI-generated brief' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleAnalyze(interaction, jwtToken) {
  const input = interaction.options.getString('input');
  const type = interaction.options.getString('type') || 'summary';

  try {
    const res = await fetch(`${BRAIN_API}/brain/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        message: `Perform ${type} analysis on: ${input}`,
        business: 'wise2',
      }),
      timeout: 60000,
    });

    if (!res.ok) throw new Error(`Brain API ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xc4a369)
      .setTitle(`📊 ${type.charAt(0).toUpperCase() + type.slice(1)} Analysis`)
      .setDescription(data.response || data.message)
      .setFooter({ text: 'AI analysis' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleResearch(interaction, jwtToken) {
  const topic = interaction.options.getString('topic');
  const depth = interaction.options.getString('depth') || 'deep';

  try {
    const res = await fetch(`${BRAIN_API}/brain/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        message: `Perform ${depth} research on: ${topic}. Include findings, trends, and recommendations.`,
        business: 'wise2',
      }),
      timeout: 120000,
    });

    if (!res.ok) throw new Error(`Brain API ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('🔬 Research Report')
      .setDescription(data.response || data.message)
      .addFields([
        { name: 'Topic', value: topic },
        { name: 'Depth', value: depth },
      ])
      .setFooter({ text: 'AI-powered research' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  aiCommand,
  handleAiCommand,
};

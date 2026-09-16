'use strict';

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

const COMMAND_CENTER = process.env.COMMAND_CENTER_URL || 'http://127.0.0.1:3004';

const deployCommand = new SlashCommandBuilder()
  .setName('deploy')
  .setDescription('WISE² Deployment & CI/CD')
  .addSubcommand((sub) =>
    sub.setName('service')
      .setDescription('Deploy a service')
      .addStringOption((opt) =>
        opt.setName('service').setDescription('Service to deploy').setRequired(true)
          .addChoices(
            { name: 'Website', value: 'website' },
            { name: 'API', value: 'api' },
            { name: 'Dashboard', value: 'dashboard' },
            { name: 'Discord Bot', value: 'discord' },
            { name: 'Second Brain', value: 'brain' },
            { name: 'Revenue CC', value: 'revenue' }
          )
      )
      .addStringOption((opt) =>
        opt.setName('version').setDescription('Version (latest or tag)').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('status')
      .setDescription('Deployment status & logs')
      .addStringOption((opt) =>
        opt.setName('service').setDescription('Service name').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('rollback')
      .setDescription('Rollback to previous version')
      .addStringOption((opt) =>
        opt.setName('service').setDescription('Service to rollback').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('version').setDescription('Version to rollback to').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('pipeline')
      .setDescription('View CI/CD pipeline status')
      .addStringOption((opt) =>
        opt.setName('branch').setDescription('Branch (main, staging, etc)').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('test')
      .setDescription('Run test suite')
      .addStringOption((opt) =>
        opt.setName('suite').setDescription('Test suite to run').addChoices(
          { name: 'Unit Tests', value: 'unit' },
          { name: 'Integration Tests', value: 'integration' },
          { name: 'E2E Tests', value: 'e2e' },
          { name: 'All Tests', value: 'all' }
        ).setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('build')
      .setDescription('Trigger build')
      .addStringOption((opt) =>
        opt.setName('service').setDescription('Service to build').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('branch').setDescription('Source branch').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('logs')
      .setDescription('View deployment logs')
      .addStringOption((opt) =>
        opt.setName('service').setDescription('Service name').setRequired(true)
      )
      .addIntegerOption((opt) =>
        opt.setName('lines').setDescription('Number of lines (max 50)').setMaxValue(50)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('check')
      .setDescription('Health check all services')
  );

async function handleDeployCommand(interaction, jwtToken) {
  await interaction.deferReply();

  try {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'service':
        return handleServiceDeploy(interaction, jwtToken);
      case 'status':
        return handleDeployStatus(interaction, jwtToken);
      case 'rollback':
        return handleRollback(interaction, jwtToken);
      case 'pipeline':
        return handlePipeline(interaction, jwtToken);
      case 'test':
        return handleTestRun(interaction, jwtToken);
      case 'build':
        return handleBuild(interaction, jwtToken);
      case 'logs':
        return handleLogs(interaction, jwtToken);
      case 'check':
        return handleHealthCheck(interaction, jwtToken);
      default:
        return interaction.editReply('Unknown subcommand');
    }
  } catch (error) {
    console.error('[deploy-ops] Error:', error);
    return interaction.editReply(`❌ Error: ${error.message}`);
  }
}

async function handleServiceDeploy(interaction, jwtToken) {
  const service = interaction.options.getString('service');
  const version = interaction.options.getString('version');

  await interaction.editReply(`🚀 Deploying ${service} to ${version}...\n⏳ This may take 5-10 minutes`);

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/deploy/service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ service, version, triggeredBy: interaction.user.username }),
      timeout: 600000,
    });

    if (!res.ok) throw new Error(`Deployment failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(data.status === 'success' ? 0x00ff7f : 0xff4444)
      .setTitle(`${data.status === 'success' ? '✅' : '❌'} ${service} Deployed`)
      .addFields([
        { name: 'Version', value: version },
        { name: 'Status', value: data.status },
        { name: 'Duration', value: data.duration || 'N/A' },
        { name: 'Deployment ID', value: data.deploymentId },
      ])
      .setFooter({ text: 'CI/CD Pipeline' })
      .setTimestamp();

    if (data.status !== 'success') {
      embed.addFields({ name: 'Error', value: data.error || 'Unknown error' });
    }

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleDeployStatus(interaction, jwtToken) {
  const service = interaction.options.getString('service');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/deploy/${service}/status`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
    const data = await res.json();

    const statusColor =
      data.status === 'online' ? 0x00ff7f :
      data.status === 'deploying' ? 0xff9d00 :
      0xff4444;

    const embed = new EmbedBuilder()
      .setColor(statusColor)
      .setTitle(`📊 ${service} Status`)
      .addFields([
        { name: 'Status', value: data.status, inline: true },
        { name: 'Version', value: data.version || 'N/A', inline: true },
        { name: 'Uptime', value: data.uptime || 'N/A', inline: true },
        { name: 'Last Deploy', value: data.lastDeploy || 'Never' },
        { name: 'Health Check', value: data.health || 'Checking...' },
      ])
      .setFooter({ text: 'Deployment Status' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleRollback(interaction, jwtToken) {
  const service = interaction.options.getString('service');
  const version = interaction.options.getString('version');

  await interaction.editReply(`⏮️ Rolling back ${service} to ${version}...\n⏳ Please wait`);

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/deploy/rollback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ service, version, triggeredBy: interaction.user.username }),
      timeout: 300000,
    });

    if (!res.ok) throw new Error(`Rollback failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(data.status === 'success' ? 0x00ff7f : 0xff4444)
      .setTitle(`${data.status === 'success' ? '✅' : '❌'} Rollback ${service}`)
      .addFields([
        { name: 'Previous Version', value: version },
        { name: 'Status', value: data.status },
        { name: 'Duration', value: data.duration || 'N/A' },
      ])
      .setFooter({ text: 'Rollback Operation' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handlePipeline(interaction, jwtToken) {
  const branch = interaction.options.getString('branch');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/deploy/pipeline/${branch}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Pipeline fetch failed: ${res.status}`);
    const data = await res.json();

    const stageList = (data.stages || [])
      .map((s) => `• **${s.name}** — ${s.status === 'success' ? '✅' : s.status === 'running' ? '⏳' : '❌'} (${s.duration || 'N/A'})`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(data.overallStatus === 'success' ? 0x00ff7f : data.overallStatus === 'running' ? 0xff9d00 : 0xff4444)
      .setTitle(`🔄 Pipeline — ${branch}`)
      .setDescription(stageList || 'No stages')
      .addFields([
        { name: 'Overall Status', value: data.overallStatus },
        { name: 'Commit', value: data.commit?.slice(0, 8) || 'N/A' },
      ])
      .setFooter({ text: 'CI/CD Pipeline' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleTestRun(interaction, jwtToken) {
  const suite = interaction.options.getString('suite');

  await interaction.editReply(`🧪 Running ${suite} tests...\n⏳ This may take 5-15 minutes`);

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/deploy/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ suite, triggeredBy: interaction.user.username }),
      timeout: 900000,
    });

    if (!res.ok) throw new Error(`Test run failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(data.passed ? 0x00ff7f : 0xff4444)
      .setTitle(`${data.passed ? '✅' : '❌'} Test Results — ${suite}`)
      .addFields([
        { name: 'Total Tests', value: String(data.total || 0), inline: true },
        { name: 'Passed', value: String(data.passed || 0), inline: true },
        { name: 'Failed', value: String(data.failed || 0), inline: true },
        { name: 'Skipped', value: String(data.skipped || 0), inline: true },
        { name: 'Coverage', value: `${data.coverage || 0}%`, inline: true },
        { name: 'Duration', value: data.duration || 'N/A', inline: true },
      ])
      .setFooter({ text: 'Test Report' })
      .setTimestamp();

    if (data.failed > 0) {
      embed.addFields({
        name: 'Failed Tests',
        value: (data.failedTests || []).slice(0, 5).join('\n') || 'See full report'
      });
    }

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Full Report')
          .setURL(`${COMMAND_CENTER}/deploy/test-results/${data.runId}`)
          .setStyle(ButtonStyle.Link)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleBuild(interaction, jwtToken) {
  const service = interaction.options.getString('service');
  const branch = interaction.options.getString('branch');

  await interaction.editReply(`🔨 Building ${service} from ${branch}...\n⏳ Please wait`);

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/deploy/build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ service, branch, triggeredBy: interaction.user.username }),
      timeout: 600000,
    });

    if (!res.ok) throw new Error(`Build failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(data.status === 'success' ? 0x00ff7f : 0xff4444)
      .setTitle(`${data.status === 'success' ? '✅' : '❌'} Build ${service}`)
      .addFields([
        { name: 'Branch', value: branch },
        { name: 'Status', value: data.status },
        { name: 'Build ID', value: data.buildId },
        { name: 'Duration', value: data.duration || 'N/A' },
      ])
      .setFooter({ text: 'Build Pipeline' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleLogs(interaction, jwtToken) {
  const service = interaction.options.getString('service');
  const lines = interaction.options.getInteger('lines') || 20;

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/deploy/${service}/logs?lines=${lines}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Logs fetch failed: ${res.status}`);
    const data = await res.json();

    const logText = (data.logs || []).join('\n').slice(0, 1900) || 'No logs available';

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`📋 ${service} Logs`)
      .setDescription(`\`\`\`\n${logText}\n\`\`\``)
      .addFields({ name: 'Lines Shown', value: String(lines) })
      .setFooter({ text: 'Deployment Logs' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleHealthCheck(interaction, jwtToken) {
  try {
    const res = await fetch(`${COMMAND_CENTER}/api/deploy/health`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 30000,
    });

    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    const data = await res.json();

    const serviceList = (data.services || [])
      .map((s) => `• **${s.name}** — ${s.status === 'online' ? '🟢' : '🔴'} | ${s.version}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(data.allHealthy ? 0x00ff7f : 0xff4444)
      .setTitle('🏥 Services Health Check')
      .setDescription(serviceList || 'No services')
      .addFields([
        { name: 'Healthy Services', value: String(data.healthy || 0), inline: true },
        { name: 'Total Services', value: String(data.total || 0), inline: true },
      ])
      .setFooter({ text: 'Health Check Report' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  deployCommand,
  handleDeployCommand,
};

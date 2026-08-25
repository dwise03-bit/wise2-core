import { SlashCommandBuilder } from 'discord.js';

export interface DiscordCommandContext {
  getStatus(): any;
  getSummary(): Promise<any>;
  askHermes(query: string): Promise<{ ok: boolean; response?: string; reason?: string }>;
  sendDeploymentNotification(status: string, details: any): Promise<void>;
  generateImageFromDiscord(instruction: string, aspectRatio?: string): Promise<{ ok: boolean; result?: any; error?: string }>;
  sendImageResult(result: any, channel?: string): Promise<void>;
}

export type DiscordCommandHandler = (
  interaction: any,
  context: DiscordCommandContext,
) => Promise<void>;

export const commands = [
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show available commands and help'),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show live WISE2 system and Discord status'),

  new SlashCommandBuilder()
    .setName('health')
    .setDescription('Check Hermes, process, and webhook health'),

  new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Show bot and API uptime'),

  new SlashCommandBuilder()
    .setName('ask')
    .setDescription('Ask Hermes from Discord')
    .addStringOption((option) =>
      option.setName('query').setDescription('Your question').setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName('sales')
    .setDescription('Show live revenue pipeline summary'),

  new SlashCommandBuilder()
    .setName('metrics')
    .setDescription('Show live business metrics'),

  new SlashCommandBuilder()
    .setName('alerts')
    .setDescription('Show live Revenue OS alert counts'),

  new SlashCommandBuilder()
    .setName('dispatch')
    .setDescription("Show today's dispatch snapshot"),

  new SlashCommandBuilder()
    .setName('discord')
    .setDescription('Show Discord bot and webhook configuration status'),

  new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Send a deployment notification to Discord')
    .addStringOption((option) =>
      option
        .setName('environment')
        .setDescription('Environment label for the notification')
        .addChoices(
          { name: 'Production', value: 'production' },
          { name: 'Staging', value: 'staging' },
        )
        .setRequired(true),
    ),

  new SlashCommandBuilder()
    .setName('image')
    .setDescription('Generate an image using Hermes image orchestration')
    .addStringOption((option) =>
      option
        .setName('instruction')
        .setDescription('Image generation instruction (what you want in the image)')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('aspect-ratio')
        .setDescription('Aspect ratio for the generated image')
        .addChoices(
          { name: '16:9 (Widescreen)', value: '16:9' },
          { name: '9:16 (Portrait)', value: '9:16' },
          { name: '1:1 (Square)', value: '1:1' },
          { name: '4:3 (Classic)', value: '4:3' },
          { name: '3:4 (Classic Portrait)', value: '3:4' },
        )
        .setRequired(false),
    ),
];

export const commandHandlers: Record<string, DiscordCommandHandler> = {
  help: handleHelp,
  status: handleStatus,
  health: handleHealth,
  uptime: handleUptime,
  ask: handleAsk,
  sales: handleSales,
  metrics: handleMetrics,
  alerts: handleAlerts,
  dispatch: handleDispatch,
  discord: handleDiscord,
  deploy: handleDeploy,
  image: handleImage,
};

async function handleHelp(interaction: any) {
  const embed = {
    title: 'WISE2 Discord Commands',
    description: 'Live system, Hermes, and Revenue OS controls from Discord.',
    fields: [
      {
        name: 'System',
        value: '`/status` `/health` `/uptime` `/discord`',
        inline: true,
      },
      {
        name: 'Hermes',
        value: '`/ask`',
        inline: true,
      },
      {
        name: 'Revenue',
        value: '`/sales` `/metrics` `/alerts` `/dispatch`',
        inline: true,
      },
      {
        name: 'Ops',
        value: '`/deploy`',
        inline: true,
      },
    ],
    color: 0x0094ff,
  };

  await interaction.reply({ embeds: [embed] });
}

async function handleStatus(interaction: any, context: DiscordCommandContext) {
  await interaction.deferReply();
  const summary = await context.getSummary();

  const embed = {
    title: 'WISE2 Live Status',
    color: summary.hermes.status === 'online' ? 0x22c55e : 0xffb020,
    fields: [
      {
        name: 'Discord Bot',
        value: summary.discord.connected ? 'Connected' : 'Offline',
        inline: true,
      },
      {
        name: 'Hermes',
        value: `${summary.hermes.status} · ${summary.hermes.model || 'unknown model'}`,
        inline: true,
      },
      {
        name: 'Revenue Context',
        value: summary.revenue.available ? 'Configured' : 'Missing',
        inline: true,
      },
      {
        name: 'Webhooks',
        value: `${summary.discord.webhookChannelsConfigured} configured`,
        inline: true,
      },
      {
        name: 'Pipeline',
        value: summary.revenue.available
          ? `$${Math.round((summary.revenue.pipeline?.totalPipelineValue || 0) / 1000)}k`
          : 'Unavailable',
        inline: true,
      },
      {
        name: 'Appointments',
        value: summary.revenue.available
          ? String(summary.revenue.kpis?.todaysAppointments?.count || 0)
          : 'Unavailable',
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  await interaction.editReply({ embeds: [embed] });
}

async function handleHealth(interaction: any, context: DiscordCommandContext) {
  await interaction.deferReply();
  const summary = await context.getSummary();

  const embed = {
    title: 'WISE2 Health Check',
    color: summary.hermes.status === 'online' ? 0x22c55e : 0xff4d4f,
    fields: [
      {
        name: 'Bot Session',
        value: summary.discord.connected ? 'Healthy' : 'Disconnected',
        inline: true,
      },
      {
        name: 'Hermes',
        value: summary.hermes.status,
        inline: true,
      },
      {
        name: 'Inference Endpoint',
        value: summary.hermes.endpoint || 'unknown',
        inline: false,
      },
      {
        name: 'Webhook Alerts',
        value: summary.discord.channels.alerts ? 'Configured' : 'Missing',
        inline: true,
      },
      {
        name: 'Webhook Deployments',
        value: summary.discord.channels.deployments ? 'Configured' : 'Missing',
        inline: true,
      },
      {
        name: 'Uptime',
        value: summary.process.uptimeHuman,
        inline: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };

  await interaction.editReply({ embeds: [embed] });
}

async function handleUptime(interaction: any, context: DiscordCommandContext) {
  const status = context.getStatus();
  const uptimeSeconds = Math.floor(process.uptime());
  const embed = {
    title: 'WISE2 Uptime',
    color: 0x22c55e,
    fields: [
      { name: 'API Process', value: formatDuration(uptimeSeconds), inline: true },
      { name: 'Bot Connected', value: status.connected ? 'Yes' : 'No', inline: true },
      { name: 'Guild ID', value: status.guildId || 'Not configured', inline: true },
    ],
    timestamp: new Date().toISOString(),
  };

  await interaction.reply({ embeds: [embed] });
}

async function handleAsk(interaction: any, context: DiscordCommandContext) {
  const query = interaction.options.getString('query');
  await interaction.deferReply();

  const result = await context.askHermes(query);
  if (!result.ok) {
    await interaction.editReply({
      embeds: [
        {
          title: 'Hermes Unavailable',
          description: result.reason || 'Hermes is not configured for Discord chat yet.',
          color: 0xffb020,
        },
      ],
    });
    return;
  }

  await interaction.editReply({
    embeds: [
      {
        title: 'Hermes Response',
        description: truncate(result.response || '', 3800),
        color: 0x0094ff,
      },
    ],
  });
}

async function handleSales(interaction: any, context: DiscordCommandContext) {
  await interaction.deferReply();
  const summary = await context.getSummary();

  if (!summary.revenue.available) {
    await interaction.editReply({ embeds: [buildRevenueUnavailableEmbed()] });
    return;
  }

  await interaction.editReply({
    embeds: [
      {
        title: 'Revenue Pipeline',
        color: 0x22c55e,
        fields: [
          {
            name: 'Pipeline Value',
            value: `$${Math.round((summary.revenue.pipeline.totalPipelineValue || 0) / 1000)}k`,
            inline: true,
          },
          {
            name: 'Conversion Rate',
            value: `${summary.revenue.pipeline.conversionRate || 0}%`,
            inline: true,
          },
          {
            name: 'Open Stages',
            value: String((summary.revenue.pipeline.stages || []).filter((stage: any) => stage.count > 0).length),
            inline: true,
          },
        ],
      },
    ],
  });
}

async function handleMetrics(interaction: any, context: DiscordCommandContext) {
  await interaction.deferReply();
  const summary = await context.getSummary();

  if (!summary.revenue.available) {
    await interaction.editReply({ embeds: [buildRevenueUnavailableEmbed()] });
    return;
  }

  const kpis = summary.revenue.kpis;
  await interaction.editReply({
    embeds: [
      {
        title: 'Business Metrics',
        color: 0x0094ff,
        fields: [
          { name: 'New Leads', value: String(kpis.newLeads?.count || 0), inline: true },
          { name: 'Sold This Week', value: `$${Math.round((kpis.soldThisWeek?.amount || 0) / 1000)}k`, inline: true },
          { name: 'Jobs Completed', value: String(kpis.jobsCompleted?.count || 0), inline: true },
          { name: 'Today Appointments', value: String(kpis.todaysAppointments?.count || 0), inline: true },
        ],
      },
    ],
  });
}

async function handleAlerts(interaction: any, context: DiscordCommandContext) {
  await interaction.deferReply();
  const summary = await context.getSummary();

  if (!summary.revenue.available) {
    await interaction.editReply({ embeds: [buildRevenueUnavailableEmbed()] });
    return;
  }

  const alerts = summary.revenue.alerts;
  await interaction.editReply({
    embeds: [
      {
        title: 'Revenue Alerts',
        color: 0xffb020,
        fields: [
          { name: 'Unsold Estimates', value: String(alerts.unsoldEstimates || 0), inline: true },
          { name: 'Customers Waiting', value: String(alerts.customersWaiting || 0), inline: true },
          { name: 'Maintenance Due', value: String(alerts.maintenanceDue || 0), inline: true },
          { name: 'Overdue Follow-ups', value: String(alerts.overdueFollowUps || 0), inline: true },
        ],
      },
    ],
  });
}

async function handleDispatch(interaction: any, context: DiscordCommandContext) {
  await interaction.deferReply();
  const summary = await context.getSummary();

  if (!summary.revenue.available) {
    await interaction.editReply({ embeds: [buildRevenueUnavailableEmbed()] });
    return;
  }

  const dispatch = summary.revenue.dispatch;
  const nextJobs = (dispatch.todaysJobs || [])
    .slice(0, 3)
    .map((job: any) => {
      const customer = [job.customer?.firstName, job.customer?.lastName].filter(Boolean).join(' ') || 'Unknown customer';
      return `${formatClock(job.scheduledStart)} · ${customer} · ${job.status}`;
    })
    .join('\n') || 'No jobs scheduled';

  await interaction.editReply({
    embeds: [
      {
        title: "Today's Dispatch",
        color: 0xffb020,
        fields: [
          { name: 'Total Jobs', value: String(dispatch.totalJobs || 0), inline: true },
          { name: 'Completed', value: String(dispatch.statusCounts?.completed || 0), inline: true },
          { name: 'Dispatched', value: String(dispatch.statusCounts?.dispatched || 0), inline: true },
          { name: 'Upcoming', value: nextJobs, inline: false },
        ],
      },
    ],
  });
}

async function handleDiscord(interaction: any, context: DiscordCommandContext) {
  const status = context.getStatus();
  await interaction.reply({
    embeds: [
      {
        title: 'Discord Integration',
        color: status.connected ? 0x22c55e : 0xffb020,
        fields: [
          { name: 'Connected', value: status.connected ? 'Yes' : 'No', inline: true },
          { name: 'Commands', value: String(status.commandsCount || 0), inline: true },
          { name: 'Guild', value: status.guildId || 'Not configured', inline: true },
          { name: 'Webhook Channels', value: String(status.webhookChannelsConfigured || 0), inline: true },
          { name: 'Default Tenant', value: status.defaultTenantId || 'Missing', inline: true },
          { name: 'Hermes User', value: status.defaultHermesUserId || 'Missing', inline: true },
        ],
      },
    ],
  });
}

async function handleDeploy(interaction: any, context: DiscordCommandContext) {
  const environment = interaction.options.getString('environment');
  await interaction.deferReply();

  await context.sendDeploymentNotification('Deployment requested from Discord', {
    environment,
    duration: 'pending',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT || 'manual',
  });

  await interaction.editReply({
    embeds: [
      {
        title: 'Deployment Notification Sent',
        description: `A deployment event was posted for ${environment}.`,
        color: 0x22c55e,
      },
    ],
  });
}

async function handleImage(interaction: any, context: DiscordCommandContext) {
  const instruction = interaction.options.getString('instruction');
  const aspectRatio = interaction.options.getString('aspect-ratio');
  await interaction.deferReply();

  const result = await context.generateImageFromDiscord(instruction, aspectRatio || undefined);
  if (!result.ok) {
    await interaction.editReply({
      embeds: [
        {
          title: 'Image Generation Failed',
          description: result.error || 'Image generation is not configured or failed.',
          color: 0xff4d4f,
        },
      ],
    });
    return;
  }

  await context.sendImageResult(result.result, 'images');

  await interaction.editReply({
    embeds: [
      {
        title: 'Image Generation Started',
        description: `Processing: ${instruction}`,
        fields: [
          { name: 'Job ID', value: result.result?.jobId || 'unknown', inline: true },
          { name: 'Status', value: result.result?.status || 'pending', inline: true },
          { name: 'Aspect Ratio', value: aspectRatio || '16:9', inline: true },
        ],
        color: result.result?.status === 'completed' ? 0x22c55e : 0xffb020,
      },
    ],
  });
}

function buildRevenueUnavailableEmbed() {
  return {
    title: 'Revenue Context Unavailable',
    description: 'Set `DISCORD_DEFAULT_TENANT_ID` so Discord can read live Revenue OS metrics.',
    color: 0xffb020,
  };
}

function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}

function formatClock(value?: string) {
  if (!value) return 'Unknown time';
  try {
    return new Date(value).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
}

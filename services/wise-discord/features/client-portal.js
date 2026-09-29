'use strict';

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

const COMMAND_CENTER = process.env.COMMAND_CENTER_URL || 'http://127.0.0.1:3004';

const clientCommand = new SlashCommandBuilder()
  .setName('client')
  .setDescription('WISE² Client Portal & Dashboard')
  .addSubcommand((sub) =>
    sub.setName('login')
      .setDescription('Get dashboard access link')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('status')
      .setDescription('View workspace status & KPIs')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('invoice')
      .setDescription('Generate & view invoices')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('month').setDescription('Month (YYYY-MM format)')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('billing')
      .setDescription('View billing & subscription info')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('support')
      .setDescription('Create support ticket')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('issue').setDescription('Issue description').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('priority').setDescription('Priority level').addChoices(
          { name: 'Low', value: 'low' },
          { name: 'Medium', value: 'medium' },
          { name: 'High', value: 'high' },
          { name: 'Critical', value: 'critical' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('usage')
      .setDescription('View usage analytics')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('team')
      .setDescription('Manage team members')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
  );

async function handleClientCommand(interaction, jwtToken) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'login':
        return handleClientLogin(interaction);
      case 'status':
        return handleClientStatus(interaction, jwtToken);
      case 'invoice':
        return handleInvoice(interaction, jwtToken);
      case 'billing':
        return handleBilling(interaction, jwtToken);
      case 'support':
        return handleSupport(interaction, jwtToken);
      case 'usage':
        return handleUsage(interaction, jwtToken);
      case 'team':
        return handleTeam(interaction, jwtToken);
      default:
        return interaction.editReply('Unknown subcommand');
    }
  } catch (error) {
    console.error('[client-portal] Error:', error);
    return interaction.editReply(`❌ Error: ${error.message}`);
  }
}

async function handleClientLogin(interaction) {
  const workspace = interaction.options.getString('workspace');
  const userId = interaction.user.id;

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/client/oauth/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace, discordUserId: userId }),
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`OAuth init failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('🔐 Dashboard Access')
      .setDescription(`Click the button below to access your ${workspace} dashboard.`)
      .setFooter({ text: 'Secure OAuth login' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Open Dashboard')
          .setURL(data.loginUrl || `${COMMAND_CENTER}/client/${workspace}/dashboard`)
          .setStyle(ButtonStyle.Link)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleClientStatus(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/client/${workspace}/status`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Status fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle(`📊 ${workspace} Status`)
      .addFields([
        { name: 'Status', value: data.status || 'Active', inline: true },
        { name: 'Uptime', value: data.uptime || '99.9%', inline: true },
        { name: 'Users', value: String(data.userCount || 0), inline: true },
        { name: 'API Calls (24h)', value: String(data.apiCalls || 0), inline: true },
        { name: 'Storage Used', value: data.storageUsed || '0 GB', inline: true },
        { name: 'Last Update', value: new Date().toLocaleString(), inline: true },
      ])
      .setFooter({ text: 'Real-time workspace metrics' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleInvoice(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');
  const month = interaction.options.getString('month') || new Date().toISOString().slice(0, 7);

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/client/${workspace}/invoice?month=${month}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Invoice fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xc4a369)
      .setTitle(`📄 Invoice — ${month}`)
      .addFields([
        { name: 'Amount Due', value: `$${data.total || '0.00'}`, inline: true },
        { name: 'Status', value: data.status || 'Unpaid', inline: true },
        { name: 'Due Date', value: data.dueDate || 'N/A', inline: true },
        { name: 'Items', value: `${data.lineItems?.length || 0} line items` },
      ])
      .setFooter({ text: `Invoice ID: ${data.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('View Full Invoice')
          .setURL(data.pdfUrl || `${COMMAND_CENTER}/client/${workspace}/invoices/${data.id}`)
          .setStyle(ButtonStyle.Link),
        new ButtonBuilder()
          .setLabel('Pay Now')
          .setURL(data.paymentUrl || `${COMMAND_CENTER}/client/${workspace}/pay`)
          .setStyle(ButtonStyle.Link)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleBilling(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/client/${workspace}/billing`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Billing fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`💳 Billing & Subscription`)
      .addFields([
        { name: 'Plan', value: data.plan || 'Growth', inline: true },
        { name: 'Monthly Cost', value: `$${data.monthlyPrice || '0.00'}`, inline: true },
        { name: 'Renewal Date', value: data.renewalDate || 'N/A', inline: true },
        { name: 'Payment Method', value: data.paymentMethod || 'Not configured', inline: true },
        { name: 'Billing Cycle', value: data.billingCycle || 'Monthly', inline: true },
      ])
      .setFooter({ text: 'Subscription management' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Manage Subscription')
          .setURL(`${COMMAND_CENTER}/client/${workspace}/billing`)
          .setStyle(ButtonStyle.Link)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleSupport(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');
  const issue = interaction.options.getString('issue');
  const priority = interaction.options.getString('priority') || 'medium';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/client/${workspace}/support/ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        issue,
        priority,
        discordUserId: interaction.user.id,
        discordUsername: interaction.user.username,
      }),
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Support ticket creation failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('🎫 Support Ticket Created')
      .addFields([
        { name: 'Ticket ID', value: data.ticketId || 'N/A' },
        { name: 'Priority', value: priority },
        { name: 'Status', value: 'Open' },
        { name: 'Expected Response', value: priority === 'critical' ? '< 1 hour' : '< 4 hours' },
      ])
      .setFooter({ text: 'You will receive updates via Discord' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleUsage(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/client/${workspace}/usage`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Usage fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xc4a369)
      .setTitle(`📈 Usage Analytics`)
      .addFields([
        { name: 'API Requests (30d)', value: String(data.apiRequests30d || 0), inline: true },
        { name: 'Active Users', value: String(data.activeUsers || 0), inline: true },
        { name: 'Bandwidth Used', value: data.bandwidthUsed || '0 GB', inline: true },
        { name: 'Database Queries', value: String(data.dbQueries || 0), inline: true },
        { name: 'Storage Used', value: data.storageUsed || '0 GB', inline: true },
        { name: 'CPU Time', value: data.cpuTime || '0 hrs', inline: true },
      ])
      .setFooter({ text: 'Last 30 days' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleTeam(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/client/${workspace}/team`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Team fetch failed: ${res.status}`);
    const data = await res.json();

    const teamList = (data.members || [])
      .map((m) => `• ${m.name} (${m.email}) - ${m.role}`)
      .join('\n') || 'No team members';

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`👥 Team Members`)
      .setDescription(teamList)
      .addFields([
        { name: 'Total Members', value: String(data.members?.length || 0) },
      ])
      .setFooter({ text: 'Manage team in dashboard' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Manage Team')
          .setURL(`${COMMAND_CENTER}/client/${workspace}/team`)
          .setStyle(ButtonStyle.Link)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  clientCommand,
  handleClientCommand,
};

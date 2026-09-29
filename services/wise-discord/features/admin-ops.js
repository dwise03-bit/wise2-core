'use strict';

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

const COMMAND_CENTER = process.env.COMMAND_CENTER_URL || 'http://127.0.0.1:3004';

const adminCommand = new SlashCommandBuilder()
  .setName('admin')
  .setDescription('WISE² Admin & Workspace Management')
  .addSubcommand((sub) =>
    sub.setName('workspace')
      .setDescription('Workspace management')
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'Create', value: 'create' },
          { name: 'List', value: 'list' },
          { name: 'Status', value: 'status' },
          { name: 'Delete', value: 'delete' }
        ).setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('name').setDescription('Workspace name')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('invite')
      .setDescription('Invite team member to workspace')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('email').setDescription('Email address').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('role').setDescription('Role').addChoices(
          { name: 'Admin', value: 'admin' },
          { name: 'Editor', value: 'editor' },
          { name: 'Viewer', value: 'viewer' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('member')
      .setDescription('Manage workspace members')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'List', value: 'list' },
          { name: 'Update Role', value: 'update' },
          { name: 'Remove', value: 'remove' },
          { name: 'Permissions', value: 'permissions' }
        ).setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('billing')
      .setDescription('Workspace billing management')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'View', value: 'view' },
          { name: 'Change Plan', value: 'upgrade' },
          { name: 'Invoices', value: 'invoices' },
          { name: 'Payment Method', value: 'payment' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('settings')
      .setDescription('Workspace settings')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('setting').setDescription('Setting to configure').addChoices(
          { name: 'Name', value: 'name' },
          { name: 'Domain', value: 'domain' },
          { name: 'Logo', value: 'logo' },
          { name: 'SSO', value: 'sso' },
          { name: 'API Key', value: 'api_key' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('audit')
      .setDescription('Audit logs & activity')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('event_type').setDescription('Event type filter').addChoices(
          { name: 'Login', value: 'login' },
          { name: 'Changes', value: 'changes' },
          { name: 'Deletions', value: 'deletions' },
          { name: 'Exports', value: 'exports' },
          { name: 'API Access', value: 'api' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('health')
      .setDescription('Workspace health & metrics')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName('backup')
      .setDescription('Backup & restore operations')
      .addStringOption((opt) =>
        opt.setName('workspace').setDescription('Workspace name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'Create Backup', value: 'create' },
          { name: 'List Backups', value: 'list' },
          { name: 'Restore', value: 'restore' }
        )
      )
  );

async function handleAdminCommand(interaction, jwtToken) {
  await interaction.deferReply({ ephemeral: true });

  try {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'workspace':
        return handleWorkspaceManagement(interaction, jwtToken);
      case 'invite':
        return handleInvite(interaction, jwtToken);
      case 'member':
        return handleMember(interaction, jwtToken);
      case 'billing':
        return handleBilling(interaction, jwtToken);
      case 'settings':
        return handleSettings(interaction, jwtToken);
      case 'audit':
        return handleAudit(interaction, jwtToken);
      case 'health':
        return handleHealth(interaction, jwtToken);
      case 'backup':
        return handleBackup(interaction, jwtToken);
      default:
        return interaction.editReply('Unknown subcommand');
    }
  } catch (error) {
    console.error('[admin-ops] Error:', error);
    return interaction.editReply(`❌ Error: ${error.message}`);
  }
}

async function handleWorkspaceManagement(interaction, jwtToken) {
  const action = interaction.options.getString('action');
  const name = interaction.options.getString('name') || '';

  try {
    const endpoint = action === 'list'
      ? `${COMMAND_CENTER}/api/admin/workspaces`
      : `${COMMAND_CENTER}/api/admin/workspace/${name}/${action}`;

    const method = (action === 'create' || action === 'delete') ? 'POST' : 'GET';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 15000,
    });

    if (!res.ok) throw new Error(`Workspace operation failed: ${res.status}`);
    const data = await res.json();

    if (action === 'list') {
      const workspaceList = (data.workspaces || [])
        .map((w) => `• **${w.name}** — ${w.status} | ${w.memberCount} members`)
        .join('\n') || 'No workspaces';

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle('🏢 Workspaces')
        .setDescription(workspaceList)
        .addFields([
          { name: 'Total', value: String(data.total || 0) },
          { name: 'Active', value: String(data.active || 0) },
        ])
        .setFooter({ text: 'Admin Panel' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(action === 'create' ? 0x00ff7f : 0xff4444)
      .setTitle(`${action === 'create' ? '✅' : '⚠️'} Workspace ${action}`)
      .addFields([
        { name: 'Workspace', value: name },
        { name: 'Status', value: data.status || 'OK' },
      ])
      .setFooter({ text: 'Admin Operations' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleInvite(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');
  const email = interaction.options.getString('email');
  const role = interaction.options.getString('role') || 'editor';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/admin/workspace/${workspace}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ email, role }),
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Invite failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('📧 Invitation Sent')
      .addFields([
        { name: 'Workspace', value: workspace },
        { name: 'Email', value: email },
        { name: 'Role', value: role },
        { name: 'Status', value: 'Pending' },
      ])
      .setFooter({ text: 'Invite ID: ' + data.inviteId })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleMember(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');
  const action = interaction.options.getString('action');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/admin/workspace/${workspace}/members?action=${action}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Member operation failed: ${res.status}`);
    const data = await res.json();

    const memberList = (data.members || [])
      .map((m) => `• **${m.name}** (${m.email}) — **${m.role}** (${m.status})`)
      .join('\n') || 'No members';

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`👥 Members — ${workspace}`)
      .setDescription(memberList)
      .addFields([
        { name: 'Total Members', value: String(data.total || 0) },
      ])
      .setFooter({ text: 'Workspace Members' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleBilling(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');
  const action = interaction.options.getString('action') || 'view';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/admin/workspace/${workspace}/billing?action=${action}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Billing fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xc4a369)
      .setTitle(`💳 Billing — ${workspace}`)
      .addFields([
        { name: 'Plan', value: data.plan || 'Pro' },
        { name: 'Monthly Cost', value: `$${data.monthlyPrice || '0'}`, inline: true },
        { name: 'Billing Cycle', value: data.billingCycle || 'Monthly', inline: true },
        { name: 'Status', value: data.billingStatus || 'Active', inline: true },
      ])
      .setFooter({ text: 'Billing Information' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleSettings(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');
  const setting = interaction.options.getString('setting') || 'name';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/admin/workspace/${workspace}/settings?setting=${setting}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Settings fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`⚙️ Settings — ${workspace}`)
      .addFields([
        { name: 'Setting', value: setting },
        { name: 'Current Value', value: data.value || 'Not set' },
      ])
      .setFooter({ text: 'Workspace Settings' })
      .setTimestamp();

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('Edit Settings')
          .setURL(`${COMMAND_CENTER}/admin/workspace/${workspace}/settings`)
          .setStyle(ButtonStyle.Link)
      );

    return interaction.editReply({ embeds: [embed], components: [row] });
  } catch (error) {
    throw error;
  }
}

async function handleAudit(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');
  const eventType = interaction.options.getString('event_type') || 'all';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/admin/workspace/${workspace}/audit?type=${eventType}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Audit logs fetch failed: ${res.status}`);
    const data = await res.json();

    const logList = (data.logs || [])
      .slice(0, 8)
      .map((l) => `• **${l.timestamp}** — ${l.user} — ${l.action}`)
      .join('\n') || 'No logs';

    const embed = new EmbedBuilder()
      .setColor(0xff9d00)
      .setTitle(`📋 Audit Log — ${workspace}`)
      .setDescription(logList)
      .addFields([
        { name: 'Total Events (30d)', value: String(data.total || 0) },
      ])
      .setFooter({ text: 'Audit & Compliance' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleHealth(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/admin/workspace/${workspace}/health`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(data.status === 'healthy' ? 0x00ff7f : 0xff4444)
      .setTitle(`🏥 Workspace Health — ${workspace}`)
      .addFields([
        { name: 'Status', value: data.status || 'Unknown', inline: true },
        { name: 'Uptime', value: data.uptime || '99.9%', inline: true },
        { name: 'API Response', value: data.apiLatency || '< 100ms', inline: true },
        { name: 'Database', value: data.database || 'OK', inline: true },
        { name: 'Storage', value: data.storage || 'Healthy', inline: true },
      ])
      .setFooter({ text: 'System Health' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleBackup(interaction, jwtToken) {
  const workspace = interaction.options.getString('workspace');
  const action = interaction.options.getString('action') || 'list';

  try {
    const method = action === 'create' ? 'POST' : 'GET';

    const res = await fetch(`${COMMAND_CENTER}/api/admin/workspace/${workspace}/backup?action=${action}`, {
      method,
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 30000,
    });

    if (!res.ok) throw new Error(`Backup operation failed: ${res.status}`);
    const data = await res.json();

    if (action === 'create') {
      const embed = new EmbedBuilder()
        .setColor(0x00ff7f)
        .setTitle('💾 Backup Created')
        .addFields([
          { name: 'Backup ID', value: data.backupId },
          { name: 'Size', value: data.size || 'Calculating...' },
          { name: 'Timestamp', value: new Date().toLocaleString() },
        ])
        .setFooter({ text: 'Backup & Recovery' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    const backupList = (data.backups || [])
      .slice(0, 5)
      .map((b) => `• **${b.timestamp}** — ${b.size}`)
      .join('\n') || 'No backups';

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle(`💾 Backups — ${workspace}`)
      .setDescription(backupList)
      .addFields([
        { name: 'Total Backups', value: String(data.total || 0) },
      ])
      .setFooter({ text: 'Backup Management' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  adminCommand,
  handleAdminCommand,
};

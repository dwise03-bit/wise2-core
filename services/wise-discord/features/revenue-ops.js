'use strict';

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fetch = require('node-fetch');

const COMMAND_CENTER = process.env.COMMAND_CENTER_URL || 'http://127.0.0.1:3004';
const REVENUE_API = process.env.REVENUE_API_URL || 'http://127.0.0.1:3000';

const revenueCommand = new SlashCommandBuilder()
  .setName('revenue')
  .setDescription('Revenue Command Center')
  .addSubcommand((sub) =>
    sub.setName('dashboard')
      .setDescription('Revenue operations dashboard')
  )
  .addSubcommand((sub) =>
    sub.setName('crm')
      .setDescription('CRM operations')
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'Lookup Contact', value: 'lookup' },
          { name: 'Recent Contacts', value: 'recent' },
          { name: 'Add Contact', value: 'add' },
          { name: 'Call History', value: 'history' }
        )
      )
      .addStringOption((opt) =>
        opt.setName('contact').setDescription('Contact name or ID')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('deal')
      .setDescription('Deal pipeline management')
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'View Pipeline', value: 'pipeline' },
          { name: 'Update Stage', value: 'update' },
          { name: 'Close Deal', value: 'close' },
          { name: 'Create Deal', value: 'create' },
          { name: 'View Details', value: 'details' }
        )
      )
      .addStringOption((opt) =>
        opt.setName('deal_id').setDescription('Deal ID')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('call')
      .setDescription('Phone call operations')
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'Start Call', value: 'start' },
          { name: 'Call History', value: 'history' },
          { name: 'Recording', value: 'recording' },
          { name: 'Transcript', value: 'transcript' },
          { name: 'Schedule Callback', value: 'callback' }
        )
      )
      .addStringOption((opt) =>
        opt.setName('call_id').setDescription('Call ID')
      )
  )
  .addSubcommand((sub) =>
    sub.setName('lead')
      .setDescription('Lead scoring & management')
      .addStringOption((opt) =>
        opt.setName('action').setDescription('Action').addChoices(
          { name: 'New Leads', value: 'new' },
          { name: 'Hot Leads', value: 'hot' },
          { name: 'Score Lead', value: 'score' },
          { name: 'Assign Lead', value: 'assign' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('forecast')
      .setDescription('Revenue forecast')
      .addStringOption((opt) =>
        opt.setName('period').setDescription('Forecast period').addChoices(
          { name: 'This Month', value: 'month' },
          { name: 'This Quarter', value: 'quarter' },
          { name: 'This Year', value: 'year' }
        )
      )
  )
  .addSubcommand((sub) =>
    sub.setName('appointment')
      .setDescription('Schedule appointment')
      .addStringOption((opt) =>
        opt.setName('contact').setDescription('Contact name').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('time').setDescription('Time (HH:MM)').setRequired(true)
      )
      .addStringOption((opt) =>
        opt.setName('type').setDescription('Appointment type').addChoices(
          { name: 'Demo', value: 'demo' },
          { name: 'Discovery Call', value: 'discovery' },
          { name: 'Proposal Review', value: 'proposal' },
          { name: 'Negotiation', value: 'negotiation' },
          { name: 'Closing', value: 'closing' }
        )
      )
  );

async function handleRevenueCommand(interaction, jwtToken) {
  await interaction.deferReply();

  try {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      case 'dashboard':
        return handleRevenueDashboard(interaction, jwtToken);
      case 'crm':
        return handleCRM(interaction, jwtToken);
      case 'deal':
        return handleDeal(interaction, jwtToken);
      case 'call':
        return handleCall(interaction, jwtToken);
      case 'lead':
        return handleLead(interaction, jwtToken);
      case 'forecast':
        return handleForecast(interaction, jwtToken);
      case 'appointment':
        return handleAppointment(interaction, jwtToken);
      default:
        return interaction.editReply('Unknown subcommand');
    }
  } catch (error) {
    console.error('[revenue-ops] Error:', error);
    return interaction.editReply(`❌ Error: ${error.message}`);
  }
}

async function handleRevenueDashboard(interaction, jwtToken) {
  try {
    const res = await fetch(`${REVENUE_API}/api/revenue/dashboard`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 15000,
    });

    if (!res.ok) throw new Error(`Dashboard fetch failed: ${res.status}`);
    const apiResponse = await res.json();
    const data = apiResponse.data?.kpis || {};

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('💰 Revenue Dashboard — Live Data')
      .addFields([
        { name: 'Total Revenue', value: `$${data.totalRevenue || '0'}`, inline: true },
        { name: 'Pipeline Value', value: `$${data.pipelineValue || '0'}`, inline: true },
        { name: 'Conversion Rate', value: `${data.conversionRate || '0'}%`, inline: true },
        { name: 'Total Deals', value: String(data.totalDeals || 0), inline: true },
        { name: 'Won Deals', value: String(data.wonDeals || 0), inline: true },
        { name: 'Hot Leads', value: String(data.hotLeads || 0), inline: true },
      ])
      .setFooter({ text: `Last updated: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'N/A'}` })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleCRM(interaction, jwtToken) {
  const action = interaction.options.getString('action') || 'recent';
  const contact = interaction.options.getString('contact') || '';

  try {
    const res = await fetch(`${REVENUE_API}/api/revenue/leads?limit=50`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`CRM operation failed: ${res.status}`);
    const apiResponse = await res.json();
    const data = apiResponse.data || {};

    if (action === 'history' && data.calls) {
      const callList = data.calls
        .slice(0, 5)
        .map((c) => `• **${c.date}** — ${c.duration}m (${c.status})`)
        .join('\n') || 'No calls';

      const embed = new EmbedBuilder()
        .setColor(0x00d9ff)
        .setTitle(`📞 Call History — ${contact}`)
        .setDescription(callList)
        .setFooter({ text: 'CRM System' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    const contactList = (data.contacts || [])
      .slice(0, 10)
      .map((c) => `• **${c.name}** — ${c.company} | ${c.status}`)
      .join('\n') || 'No contacts';

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('👥 CRM — Recent Contacts')
      .setDescription(contactList)
      .addFields({ name: 'Total', value: String(data.total || 0) })
      .setFooter({ text: 'CRM System' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleDeal(interaction, jwtToken) {
  const action = interaction.options.getString('action') || 'pipeline';
  const dealId = interaction.options.getString('deal_id') || '';

  try {
    const res = await fetch(`${REVENUE_API}/api/revenue/deals?limit=50`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Deal operation failed: ${res.status}`);
    const apiResponse = await res.json();
    const data = apiResponse.data || {};

    if (action === 'pipeline') {
      const stages = data.stages || [];
      const stageStr = stages
        .map((s) => `**${s.name}** — $${s.value} (${s.count} deals)`)
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor(0x00ff7f)
        .setTitle('📈 Deal Pipeline')
        .setDescription(stageStr || 'No deals')
        .addFields([
          { name: 'Total Pipeline', value: `$${data.total || '0'}` },
          { name: 'Average Deal Size', value: `$${data.avgDealSize || '0'}` },
        ])
        .setFooter({ text: 'Deal Pipeline' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    const embed = new EmbedBuilder()
      .setColor(0xc4a369)
      .setTitle(`📊 Deal — ${data.name}`)
      .addFields([
        { name: 'Value', value: `$${data.value}`, inline: true },
        { name: 'Stage', value: data.stage, inline: true },
        { name: 'Owner', value: data.owner, inline: true },
        { name: 'Expected Close', value: data.expectedClose, inline: true },
      ])
      .setFooter({ text: 'Deal Details' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleCall(interaction, jwtToken) {
  const action = interaction.options.getString('action') || 'history';
  const callId = interaction.options.getString('call_id') || '';

  try {
    const endpoint = action === 'transcript' || action === 'recording'
      ? `${COMMAND_CENTER}/api/revenue/call/${callId}/${action}`
      : `${COMMAND_CENTER}/api/revenue/call/${action}`;

    const res = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 15000,
    });

    if (!res.ok) throw new Error(`Call operation failed: ${res.status}`);
    const data = await res.json();

    if (action === 'transcript' && data.transcript) {
      const embed = new EmbedBuilder()
        .setColor(0xff9d00)
        .setTitle('📝 Call Transcript')
        .setDescription(data.transcript.slice(0, 2000))
        .addFields([
          { name: 'Duration', value: data.duration },
          { name: 'Date', value: data.date },
        ])
        .setFooter({ text: 'AI Transcription' })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    }

    const callList = (data.calls || [])
      .slice(0, 5)
      .map((c) => `• **${c.date}** — ${c.contact} (${c.duration}m) — **${c.outcome}**`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('📞 Call History')
      .setDescription(callList || 'No calls')
      .addFields([
        { name: 'Total Calls (30d)', value: String(data.totalCalls || 0) },
        { name: 'Avg Call Duration', value: data.avgDuration || 'N/A' },
      ])
      .setFooter({ text: 'Phone Operations' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleLead(interaction, jwtToken) {
  const action = interaction.options.getString('action') || 'new';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/revenue/lead/${action}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Lead operation failed: ${res.status}`);
    const data = await res.json();

    const leadList = (data.leads || [])
      .slice(0, 8)
      .map((l) => `• **${l.name}** — Score: ${l.score}/100 | ${l.source}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle(`🎯 ${action === 'hot' ? 'Hot' : 'New'} Leads`)
      .setDescription(leadList || 'No leads')
      .addFields([
        { name: 'Count', value: String(data.total || 0), inline: true },
        { name: 'Avg Score', value: String(data.avgScore || 0), inline: true },
      ])
      .setFooter({ text: 'Lead Management' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleForecast(interaction, jwtToken) {
  const period = interaction.options.getString('period') || 'month';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/revenue/forecast?period=${period}`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` },
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Forecast fetch failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0xc4a369)
      .setTitle(`📊 Revenue Forecast — ${period}`)
      .addFields([
        { name: 'Conservative', value: `$${data.conservative}`, inline: true },
        { name: 'Expected', value: `$${data.expected}`, inline: true },
        { name: 'Optimistic', value: `$${data.optimistic}`, inline: true },
        { name: 'Confidence', value: `${data.confidence}%` },
      ])
      .setFooter({ text: 'AI Revenue Forecast' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

async function handleAppointment(interaction, jwtToken) {
  const contact = interaction.options.getString('contact');
  const time = interaction.options.getString('time');
  const type = interaction.options.getString('type') || 'demo';

  try {
    const res = await fetch(`${COMMAND_CENTER}/api/revenue/appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({
        contact,
        time,
        type,
        createdBy: interaction.user.username,
      }),
      timeout: 10000,
    });

    if (!res.ok) throw new Error(`Appointment creation failed: ${res.status}`);
    const data = await res.json();

    const embed = new EmbedBuilder()
      .setColor(0x00ff7f)
      .setTitle('📅 Appointment Scheduled')
      .addFields([
        { name: 'Contact', value: contact },
        { name: 'Time', value: time },
        { name: 'Type', value: type },
        { name: 'Calendar Link', value: data.calendarUrl || 'Check your calendar' },
      ])
      .setFooter({ text: 'Appointment scheduled' })
      .setTimestamp();

    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  revenueCommand,
  handleRevenueCommand,
};

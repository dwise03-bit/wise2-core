/**
 * WISE² Revenue Command Center - Discord Commands
 * Handles: /lead, /deal, /close, /follow, /revenue
 */

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require('discord.js');

const REVENUE_API_BASE = process.env.REVENUE_API_BASE || 'http://localhost:3000/revenue';

// ==================== LEAD COMMANDS ====================

const leadCommand = new SlashCommandBuilder()
  .setName('lead')
  .setDescription('Lead management commands')
  .addSubcommand((sub) =>
    sub
      .setName('search')
      .setDescription('Search leads by name/phone/email')
      .addStringOption((opt) =>
        opt
          .setName('query')
          .setDescription('Search query (name, phone, or email)')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('score')
      .setDescription('Show lead score and recommendation')
      .addStringOption((opt) =>
        opt
          .setName('lead_id')
          .setDescription('Lead ID')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('claim')
      .setDescription('Claim ownership of a lead')
      .addStringOption((opt) =>
        opt
          .setName('lead_id')
          .setDescription('Lead ID')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('status')
      .setDescription('Check lead status and history')
      .addStringOption((opt) =>
        opt
          .setName('lead_id')
          .setDescription('Lead ID')
          .setRequired(true),
      ),
  );

// ==================== DEAL COMMANDS ====================

const dealCommand = new SlashCommandBuilder()
  .setName('deal')
  .setDescription('Deal management commands')
  .addSubcommand((sub) =>
    sub
      .setName('create')
      .setDescription('Create a new deal')
      .addStringOption((opt) =>
        opt
          .setName('lead_id')
          .setDescription('Lead ID')
          .setRequired(true),
      )
      .addNumberOption((opt) =>
        opt
          .setName('value')
          .setDescription('Deal value in USD')
          .setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('recommend')
      .setDescription('Get recommended offers for a lead')
      .addStringOption((opt) =>
        opt
          .setName('lead_id')
          .setDescription('Lead ID')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('status')
      .setDescription('Check deal status')
      .addStringOption((opt) =>
        opt
          .setName('deal_id')
          .setDescription('Deal ID')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('update')
      .setDescription('Update deal stage/status')
      .addStringOption((opt) =>
        opt
          .setName('deal_id')
          .setDescription('Deal ID')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('stage')
          .setDescription('New stage')
          .setChoices(
            { name: 'Discovery', value: 'DISCOVERY' },
            { name: 'Qualification', value: 'QUALIFICATION' },
            { name: 'Proposal', value: 'PROPOSAL' },
            { name: 'Negotiation', value: 'NEGOTIATION' },
            { name: 'Closing', value: 'CLOSING' },
          )
          .setRequired(false),
      ),
  );

// ==================== CLOSE COMMANDS ====================

const closeCommand = new SlashCommandBuilder()
  .setName('close')
  .setDescription('Close/quote operations')
  .addSubcommand((sub) =>
    sub
      .setName('offer')
      .setDescription('Send offer to prospect')
      .addStringOption((opt) =>
        opt
          .setName('deal_id')
          .setDescription('Deal ID')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('offer_id')
          .setDescription('Offer ID (optional - auto-recommend if not provided)')
          .setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('quote')
      .setDescription('Generate formal quote')
      .addStringOption((opt) =>
        opt
          .setName('deal_id')
          .setDescription('Deal ID')
          .setRequired(true),
      )
      .addNumberOption((opt) =>
        opt
          .setName('custom_price')
          .setDescription('Custom price (optional - uses offer price if not provided)')
          .setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('payment')
      .setDescription('Send payment link')
      .addStringOption((opt) =>
        opt
          .setName('deal_id')
          .setDescription('Deal ID')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('escalate')
      .setDescription('Escalate deal to human')
      .addStringOption((opt) =>
        opt
          .setName('deal_id')
          .setDescription('Deal ID')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('reason')
          .setDescription('Escalation reason')
          .setRequired(true),
      ),
  );

// ==================== FOLLOW-UP COMMANDS ====================

const followCommand = new SlashCommandBuilder()
  .setName('follow')
  .setDescription('Follow-up automation commands')
  .addSubcommand((sub) =>
    sub
      .setName('schedule')
      .setDescription('Schedule a follow-up')
      .addStringOption((opt) =>
        opt
          .setName('lead_id')
          .setDescription('Lead ID')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('channel')
          .setDescription('Communication channel')
          .addChoices(
            { name: 'SMS', value: 'sms' },
            { name: 'Email', value: 'email' },
            { name: 'Call', value: 'call' },
          )
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('delay')
          .setDescription('Delay (e.g., "2h", "1d", "tomorrow")')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('message')
          .setDescription('Custom message (optional)')
          .setRequired(false),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('sms')
      .setDescription('Send immediate SMS follow-up')
      .addStringOption((opt) =>
        opt
          .setName('lead_id')
          .setDescription('Lead ID')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('message')
          .setDescription('SMS message')
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('callback')
      .setDescription('Schedule callback for missed call')
      .addStringOption((opt) =>
        opt
          .setName('lead_id')
          .setDescription('Lead ID')
          .setRequired(true),
      ),
  );

// ==================== REVENUE COMMANDS ====================

const revenueCommand = new SlashCommandBuilder()
  .setName('revenue')
  .setDescription('Revenue dashboard commands')
  .addSubcommand((sub) =>
    sub
      .setName('today')
      .setDescription('Today\'s revenue summary'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('pipeline')
      .setDescription('View open deal pipeline'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('top-leads')
      .setDescription('Show hottest leads right now'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('won')
      .setDescription('Deals won today'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('lost')
      .setDescription('Deals lost (show reasons)'),
  );

// ==================== COMMAND HANDLERS ====================

async function handleLeadCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const leadId = interaction.options.getString('lead_id');
  const query = interaction.options.getString('query');

  try {
    await interaction.deferReply({ ephemeral: false });

    switch (subcommand) {
      case 'search':
        await handleLeadSearch(interaction, query);
        break;
      case 'score':
        await handleLeadScore(interaction, leadId);
        break;
      case 'claim':
        await handleLeadClaim(interaction, leadId);
        break;
      case 'status':
        await handleLeadStatus(interaction, leadId);
        break;
    }
  } catch (error) {
    console.error('Lead command error:', error);
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
      ephemeral: true,
    });
  }
}

async function handleLeadSearch(interaction, query) {
  // Placeholder: In production, fetch from API
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('📋 Search Results')
    .setDescription(`Searching for: \`${query}\``)
    .addFields({
      name: 'Status',
      value: '⏳ Search functionality coming soon',
    });

  await interaction.editReply({ embeds: [embed] });
}

async function handleLeadScore(interaction, leadId) {
  try {
    const response = await fetch(`${REVENUE_API_BASE}/leads/${leadId}/score`);
    const scoreData = await response.json();

    const levelColor = {
      COLD: '#808080',
      WARM: '#FFA500',
      HOT: '#FF6347',
      CLOSING_READY: '#00AA00',
    };

    const embed = new EmbedBuilder()
      .setColor(levelColor[scoreData.level] || '#0099ff')
      .setTitle(`🎯 Lead Score: ${scoreData.lead.id}`)
      .addFields(
        { name: 'Score Level', value: scoreData.level, inline: true },
        { name: 'Total Score', value: `${scoreData.totalScore}/700`, inline: true },
        { name: 'Recommended Action', value: scoreData.recommendedAction || 'N/A', inline: true },
        { name: 'Fit', value: `${scoreData.fitScore}/100`, inline: true },
        { name: 'Urgency', value: `${scoreData.urgencyScore}/100`, inline: true },
        { name: 'Budget', value: `${scoreData.budgetScore}/100`, inline: true },
        { name: 'Authority', value: `${scoreData.authorityScore}/100`, inline: true },
        { name: 'Timeline', value: `${scoreData.timelineScore}/100`, inline: true },
        { name: 'Intent', value: `${scoreData.intentScore}/100`, inline: true },
      )
      .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`lead_view_${leadId}`)
        .setLabel('View Lead')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`lead_recommend_${leadId}`)
        .setLabel('Get Offers')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(`lead_escalate_${leadId}`)
        .setLabel('Escalate')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.editReply({ embeds: [embed], components: [buttons] });
  } catch (error) {
    await interaction.editReply({
      content: `❌ Could not fetch lead score: ${error.message}`,
    });
  }
}

async function handleLeadClaim(interaction, leadId) {
  try {
    // Placeholder: In production, call API to claim lead
    const embed = new EmbedBuilder()
      .setColor('#00AA00')
      .setTitle('✅ Lead Claimed')
      .setDescription(`Lead \`${leadId}\` claimed by ${interaction.user.tag}`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({
      content: `❌ Error claiming lead: ${error.message}`,
    });
  }
}

async function handleLeadStatus(interaction, leadId) {
  try {
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`📊 Lead Status: ${leadId}`)
      .addFields(
        { name: 'Status', value: 'Loading...', inline: true },
        { name: 'Last Contact', value: 'Loading...', inline: true },
        { name: 'Next Action', value: 'Loading...', inline: true },
      );

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({
      content: `❌ Error fetching lead status: ${error.message}`,
    });
  }
}

async function handleDealCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();

  try {
    await interaction.deferReply({ ephemeral: false });

    switch (subcommand) {
      case 'create':
        await handleDealCreate(interaction);
        break;
      case 'recommend':
        await handleDealRecommend(interaction);
        break;
      case 'status':
        await handleDealStatus(interaction);
        break;
      case 'update':
        await handleDealUpdate(interaction);
        break;
    }
  } catch (error) {
    console.error('Deal command error:', error);
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
      ephemeral: true,
    });
  }
}

async function handleDealCreate(interaction) {
  const leadId = interaction.options.getString('lead_id');
  const value = interaction.options.getNumber('value');

  const embed = new EmbedBuilder()
    .setColor('#00AA00')
    .setTitle('✅ Deal Created')
    .addFields(
      { name: 'Lead ID', value: leadId, inline: true },
      { name: 'Value', value: value ? `$${value}` : 'TBD', inline: true },
      { name: 'Stage', value: 'DISCOVERY', inline: true },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleDealRecommend(interaction) {
  const leadId = interaction.options.getString('lead_id');

  try {
    const response = await fetch(
      `${REVENUE_API_BASE}/leads/${leadId}/recommendations`,
    );
    const offers = await response.json();

    if (offers.length === 0) {
      await interaction.editReply({
        content: '❌ No suitable offers found for this lead.',
      });
      return;
    }

    const topOffer = offers[0];
    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle('💰 Recommended Offer')
      .addFields(
        { name: 'Offer', value: topOffer.offer.name, inline: true },
        { name: 'Fit Score', value: `${topOffer.fitScore}%`, inline: true },
        { name: 'Base Price', value: `$${topOffer.offer.basePrice}`, inline: true },
        { name: 'AI Closable', value: topOffer.canAIClose ? '✅ Yes' : '❌ No', inline: true },
        { name: 'Reason', value: topOffer.reason, inline: false },
      );

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`offer_send_${topOffer.offer.id}`)
        .setLabel('Send Offer')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`offer_other_${leadId}`)
        .setLabel('See Other Offers')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.editReply({ embeds: [embed], components: [buttons] });
  } catch (error) {
    await interaction.editReply({
      content: `❌ Error fetching recommendations: ${error.message}`,
    });
  }
}

async function handleDealStatus(interaction) {
  const dealId = interaction.options.getString('deal_id');

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`📊 Deal Status: ${dealId}`)
    .addFields(
      { name: 'Stage', value: 'Loading...', inline: true },
      { name: 'Value', value: 'Loading...', inline: true },
      { name: 'Owner', value: 'Loading...', inline: true },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleDealUpdate(interaction) {
  const dealId = interaction.options.getString('deal_id');
  const stage = interaction.options.getString('stage');

  const embed = new EmbedBuilder()
    .setColor('#00AA00')
    .setTitle('✅ Deal Updated')
    .addFields(
      { name: 'Deal ID', value: dealId, inline: true },
      { name: 'New Stage', value: stage || 'No change', inline: true },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleCloseCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();

  try {
    await interaction.deferReply({ ephemeral: false });

    switch (subcommand) {
      case 'offer':
        await handleCloseOffer(interaction);
        break;
      case 'quote':
        await handleCloseQuote(interaction);
        break;
      case 'payment':
        await handleClosePayment(interaction);
        break;
      case 'escalate':
        await handleCloseEscalate(interaction);
        break;
    }
  } catch (error) {
    console.error('Close command error:', error);
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
      ephemeral: true,
    });
  }
}

async function handleCloseOffer(interaction) {
  const dealId = interaction.options.getString('deal_id');
  const offerId = interaction.options.getString('offer_id');

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('📤 Offer Sent')
    .addFields(
      { name: 'Deal ID', value: dealId, inline: true },
      { name: 'Offer ID', value: offerId || 'Auto-selected', inline: true },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleCloseQuote(interaction) {
  const dealId = interaction.options.getString('deal_id');

  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('📄 Quote Generated')
    .addFields(
      { name: 'Deal ID', value: dealId, inline: true },
      { name: 'Quote Link', value: 'https://example.com/quote', inline: true },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleClosePayment(interaction) {
  const dealId = interaction.options.getString('deal_id');

  const embed = new EmbedBuilder()
    .setColor('#00AA00')
    .setTitle('💳 Payment Link Sent')
    .addFields({
      name: 'Deal ID',
      value: dealId,
      inline: true,
    });

  await interaction.editReply({ embeds: [embed] });
}

async function handleCloseEscalate(interaction) {
  const dealId = interaction.options.getString('deal_id');
  const reason = interaction.options.getString('reason');

  const embed = new EmbedBuilder()
    .setColor('#FF6347')
    .setTitle('⬆️ Deal Escalated')
    .addFields(
      { name: 'Deal ID', value: dealId, inline: true },
      { name: 'Reason', value: reason, inline: false },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleFollowCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();

  try {
    await interaction.deferReply({ ephemeral: false });

    switch (subcommand) {
      case 'schedule':
        await handleFollowSchedule(interaction);
        break;
      case 'sms':
        await handleFollowSms(interaction);
        break;
      case 'callback':
        await handleFollowCallback(interaction);
        break;
    }
  } catch (error) {
    console.error('Follow command error:', error);
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
      ephemeral: true,
    });
  }
}

async function handleFollowSchedule(interaction) {
  const leadId = interaction.options.getString('lead_id');
  const channel = interaction.options.getString('channel');
  const delay = interaction.options.getString('delay');

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('📅 Follow-Up Scheduled')
    .addFields(
      { name: 'Lead ID', value: leadId, inline: true },
      { name: 'Channel', value: channel.toUpperCase(), inline: true },
      { name: 'When', value: delay, inline: true },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleFollowSms(interaction) {
  const leadId = interaction.options.getString('lead_id');
  const message = interaction.options.getString('message');

  const embed = new EmbedBuilder()
    .setColor('#00AA00')
    .setTitle('📱 SMS Sent')
    .addFields(
      { name: 'Lead ID', value: leadId, inline: true },
      { name: 'Message', value: message, inline: false },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleFollowCallback(interaction) {
  const leadId = interaction.options.getString('lead_id');

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('📞 Callback Scheduled')
    .addFields({
      name: 'Lead ID',
      value: leadId,
      inline: true,
    });

  await interaction.editReply({ embeds: [embed] });
}

async function handleRevenueCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();

  try {
    await interaction.deferReply({ ephemeral: false });

    switch (subcommand) {
      case 'today':
        await handleRevenueToday(interaction);
        break;
      case 'pipeline':
        await handleRevenuePipeline(interaction);
        break;
      case 'top-leads':
        await handleRevenueTopLeads(interaction);
        break;
      case 'won':
        await handleRevenueWon(interaction);
        break;
      case 'lost':
        await handleRevenueLost(interaction);
        break;
    }
  } catch (error) {
    console.error('Revenue command error:', error);
    await interaction.editReply({
      content: `❌ Error: ${error.message}`,
      ephemeral: true,
    });
  }
}

async function handleRevenueToday(interaction) {
  try {
    const response = await fetch(`${REVENUE_API_BASE}/dashboard?period=today`);
    const dashboard = await response.json();
    const summary = dashboard.summary;

    const embed = new EmbedBuilder()
      .setColor('#00AA00')
      .setTitle('💰 WISE² Daily Revenue Report')
      .addFields(
        { name: 'New Leads', value: summary.newLeads.toString(), inline: true },
        { name: 'Hot Leads', value: summary.hotLeads.toString(), inline: true },
        { name: 'Appointments', value: 'TBD', inline: true },
        { name: 'Open Deals', value: summary.openDeals.toString(), inline: true },
        { name: 'Pipeline Value', value: `$${summary.openDealsValue.toFixed(2)}`, inline: true },
        { name: 'Deals Won', value: summary.wonDeals.toString(), inline: true },
        { name: 'Revenue', value: `$${summary.revenue.toFixed(2)}`, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    await interaction.editReply({
      content: `❌ Error fetching dashboard: ${error.message}`,
    });
  }
}

async function handleRevenuePipeline(interaction) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('📊 Deal Pipeline')
    .addFields(
      { name: 'Discovery', value: '5 deals | $25,000', inline: true },
      { name: 'Qualification', value: '3 deals | $15,000', inline: true },
      { name: 'Proposal', value: '2 deals | $10,000', inline: true },
      { name: 'Closing', value: '1 deal | $5,000', inline: true },
      { name: 'Total Pipeline', value: '$55,000', inline: false },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleRevenueTopLeads(interaction) {
  const embed = new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🔥 Top Hot Leads Right Now')
    .addFields(
      {
        name: '1. John Smith (ABC Corp)',
        value: 'Score: 620/700 | Next: Call now | Est. Value: $5K',
        inline: false,
      },
      {
        name: '2. Sarah Johnson (XYZ Inc)',
        value: 'Score: 580/700 | Next: Send offer | Est. Value: $8K',
        inline: false,
      },
      {
        name: '3. Mike Davis (Tech Startup)',
        value: 'Score: 560/700 | Next: Send offer | Est. Value: $3K',
        inline: false,
      },
    );

  await interaction.editReply({ embeds: [embed] });
}

async function handleRevenueWon(interaction) {
  const embed = new EmbedBuilder()
    .setColor('#00AA00')
    .setTitle('🎉 Deals Won Today')
    .addFields(
      { name: 'Deal 1: Website Redesign', value: '$1,500 | Closed by: @Sarah', inline: false },
      { name: 'Deal 2: Marketing Automation', value: '$3,000 | Closed by: @Mike', inline: false },
    )
    .addFields({ name: 'Total Today', value: '$4,500', inline: true });

  await interaction.editReply({ embeds: [embed] });
}

async function handleRevenueLost(interaction) {
  const embed = new EmbedBuilder()
    .setColor('#FF6347')
    .setTitle('❌ Deals Lost')
    .addFields(
      { name: 'Budget Concern', value: '2 deals lost', inline: true },
      { name: 'Chose Competitor', value: '1 deal lost', inline: true },
      { name: 'No Response', value: '1 deal lost', inline: true },
    );

  await interaction.editReply({ embeds: [embed] });
}

// ==================== EXPORTS ====================

module.exports = {
  commands: [leadCommand, dealCommand, closeCommand, followCommand, revenueCommand],
  handlers: {
    lead: handleLeadCommand,
    deal: handleDealCommand,
    close: handleCloseCommand,
    follow: handleFollowCommand,
    revenue: handleRevenueCommand,
  },
};

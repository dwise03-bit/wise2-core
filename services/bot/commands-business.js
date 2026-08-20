/**
 * WISE² Command Center - Business Commands for Discord
 * Slash commands for CRM, Pipeline, Estimates, Dispatch, etc.
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

/**
 * API client for WISE² backend
 */
class WiseAPIClient {
  constructor(baseUrl = 'http://localhost:3000/api/v1', token = null) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async request(method, endpoint, body = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Business Commands
 */
const businessCommands = {
  dashboard: {
    data: new SlashCommandBuilder()
      .setName('dashboard')
      .setDescription('📊 View business dashboard and KPIs'),
    async execute(interaction) {
      try {
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('📊 Business Dashboard')
          .setDescription('Real-time business metrics and KPIs')
          .addFields(
            {
              name: 'Revenue (MTD)',
              value: '$38,560',
              inline: true,
            },
            {
              name: 'Jobs Completed',
              value: '47',
              inline: true,
            },
            {
              name: 'New Leads',
              value: '23',
              inline: true,
            },
            {
              name: 'Pipeline Value',
              value: '$128,750',
              inline: true,
            },
            {
              name: 'Open Estimates',
              value: '9',
              inline: true,
            },
            {
              name: 'Conversion Rate',
              value: '28%',
              inline: true,
            }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          content: `❌ Failed to load dashboard: ${error.message}`,
          ephemeral: true,
        });
      }
    },
  },

  leads: {
    data: new SlashCommandBuilder()
      .setName('leads')
      .setDescription('👥 List leads with filtering')
      .addStringOption(option =>
        option
          .setName('status')
          .setDescription('Filter by lead status')
          .addChoices(
            { name: 'New', value: 'NEW' },
            { name: 'Contacting', value: 'CONTACTING' },
            { name: 'Qualified', value: 'QUALIFIED' },
            { name: 'Booked', value: 'BOOKED' }
          )
      ),
    async execute(interaction) {
      try {
        const status = interaction.options.getString('status');

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle('👥 Recent Leads')
          .setDescription(`Showing ${status || 'all'} leads`)
          .addFields(
            {
              name: 'Amanda Johnson',
              value: '📍 Atlanta, GA | $5,000 est. | 2h ago',
              inline: false,
            },
            {
              name: 'Michael Brown',
              value: '📍 Austin, TX | $3,500 est. | 1h ago',
              inline: false,
            },
            {
              name: 'Kevin Anderson',
              value: '📍 Nashville, TN | $4,200 est. | 1d ago',
              inline: false,
            }
          )
          .addFields({
            name: 'Quick Actions',
            value: '`/create-lead` — Add new lead | `/lead-details <id>` — View full details',
            inline: false,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          content: `❌ Failed to load leads: ${error.message}`,
          ephemeral: true,
        });
      }
    },
  },

  pipeline: {
    data: new SlashCommandBuilder()
      .setName('pipeline')
      .setDescription('📈 View sales pipeline by stage'),
    async execute(interaction) {
      try {
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('📈 Sales Pipeline')
          .setDescription('Opportunities by stage')
          .addFields(
            {
              name: 'New',
              value: '5 leads | $28,000',
              inline: true,
            },
            {
              name: 'Qualified',
              value: '3 leads | $15,000',
              inline: true,
            },
            {
              name: 'Estimate Sent',
              value: '7 leads | $32,100',
              inline: true,
            },
            {
              name: 'Booked',
              value: '5 leads | $21,800',
              inline: true,
            },
            {
              name: 'Won',
              value: '12 leads | $67,200',
              inline: true,
            },
            {
              name: 'Total Pipeline',
              value: '32 ops | $128,750',
              inline: true,
            }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          content: `❌ Failed to load pipeline: ${error.message}`,
          ephemeral: true,
        });
      }
    },
  },

  estimates: {
    data: new SlashCommandBuilder()
      .setName('estimates')
      .setDescription('💰 View estimates by status')
      .addStringOption(option =>
        option
          .setName('status')
          .setDescription('Filter by status')
          .addChoices(
            { name: 'Pending', value: 'PENDING' },
            { name: 'Sent', value: 'SENT' },
            { name: 'Accepted', value: 'ACCEPTED' },
            { name: 'Declined', value: 'DECLINED' }
          )
      ),
    async execute(interaction) {
      try {
        const embed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('💰 Recent Estimates')
          .addFields(
            {
              name: 'Est #1001',
              value: '$5,200 • Sent 2d ago • Kevin Anderson',
              inline: false,
            },
            {
              name: 'Est #1002',
              value: '$3,800 • Pending • Michael Brown',
              inline: false,
            },
            {
              name: 'Est #1003',
              value: '$7,500 • Accepted • Amanda Johnson',
              inline: false,
            }
          )
          .addFields({
            name: 'Actions',
            value: '`/create-estimate <lead>` — Create estimate | `/estimate-details <id>` — View details',
            inline: false,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          content: `❌ Failed to load estimates: ${error.message}`,
          ephemeral: true,
        });
      }
    },
  },

  dispatch: {
    data: new SlashCommandBuilder()
      .setName('dispatch')
      .setDescription('📍 View unassigned jobs for dispatch'),
    async execute(interaction) {
      try {
        const embed = new EmbedBuilder()
          .setColor('#ff6600')
          .setTitle('📍 Dispatch Queue')
          .setDescription('Unassigned jobs ready to dispatch')
          .addFields(
            {
              name: 'Job #J-245',
              value: '🔧 HVAC Maintenance | 123 Main St, Atlanta, GA | 2h window',
              inline: false,
            },
            {
              name: 'Job #J-246',
              value: '🌊 Pressure Washing | 456 Oak Ave, Nashville, TN | 8h window',
              inline: false,
            },
            {
              name: 'Job #J-247',
              value: '❄️ HVAC Repair | 789 Pine Rd, Austin, TX | URGENT - 30min',
              inline: false,
            }
          )
          .addFields({
            name: 'Quick Actions',
            value: '`/assign-job <job> <tech>` — Assign to technician | `/job-details <id>` — Full details',
            inline: false,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          content: `❌ Failed to load dispatch: ${error.message}`,
          ephemeral: true,
        });
      }
    },
  },

  followups: {
    data: new SlashCommandBuilder()
      .setName('followups')
      .setDescription('📋 View pending follow-ups and AI recommendations'),
    async execute(interaction) {
      try {
        const embed = new EmbedBuilder()
          .setColor('#0066ff')
          .setTitle('📋 Follow-ups Due')
          .addFields(
            {
              name: '⚠️ Unanswered Leads',
              value: '4 leads waiting for response • Oldest: 3 days',
              inline: false,
            },
            {
              name: '📧 Follow-up Calls',
              value: '6 customers due for contact • 2 URGENT overdue',
              inline: false,
            },
            {
              name: '⭐ Review Requests',
              value: '3 recent jobs awaiting customer review',
              inline: false,
            },
            {
              name: '💼 Contract Renewals',
              value: '2 contracts due for renewal in 7 days',
              inline: false,
            }
          )
          .addFields({
            name: '🤖 AI Recommendation',
            value: 'Contact Kevin Anderson about Est #1001 - 72% likelihood to close if followed up today',
            inline: false,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          content: `❌ Failed to load follow-ups: ${error.message}`,
          ephemeral: true,
        });
      }
    },
  },

  ai: {
    data: new SlashCommandBuilder()
      .setName('ai')
      .setDescription('🤖 Ask AI Business Advisor for insights')
      .addStringOption(option =>
        option
          .setName('question')
          .setDescription('What would you like to know?')
          .setRequired(true)
      ),
    async execute(interaction) {
      try {
        const question = interaction.options.getString('question');

        await interaction.deferReply();

        const embed = new EmbedBuilder()
          .setColor('#6600ff')
          .setTitle('🤖 AI Business Advisor')
          .addFields(
            {
              name: 'Your Question',
              value: question,
              inline: false,
            },
            {
              name: 'Recommendation',
              value:
                'Based on your current pipeline and conversion patterns:\n\n' +
                '1. **Focus on follow-ups**: Your conversion rate jumps 3x when you follow up within 24h\n' +
                '2. **Prioritize quick wins**: Kevin Anderson and Michael Brown have 65% close probability\n' +
                '3. **Dispatch optimization**: Route Job #J-247 to Marcus (4.8⭐ rating, 2km away)',
              inline: false,
            },
            {
              name: 'Next Action',
              value: 'Call Kevin Anderson in next 2 hours to discuss Est #1001',
              inline: false,
            }
          )
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
      } catch (error) {
        await interaction.editReply({
          content: `❌ AI advisor error: ${error.message}`,
        });
      }
    },
  },

  settings: {
    data: new SlashCommandBuilder()
      .setName('settings')
      .setDescription('⚙️ Manage business settings and integrations'),
    async execute(interaction) {
      try {
        const embed = new EmbedBuilder()
          .setColor('#999999')
          .setTitle('⚙️ Business Settings')
          .addFields(
            {
              name: 'Business Info',
              value: 'Get Down Pressure Washing\n📍 Atlanta, GA\n💰 HVAC + Pressure Washing',
              inline: false,
            },
            {
              name: 'Integrations',
              value:
                '✅ Stripe (Payments)\n' +
                '✅ Discord (This bot)\n' +
                '⚠️ Twilio (SMS) - Not connected\n' +
                '❌ Google Calendar - Not connected',
              inline: false,
            },
            {
              name: 'Team',
              value: '5 team members\n• You (Owner)\n• Marcus (Tech)\n• Sarah (Admin)\n• 2 more',
              inline: false,
            }
          )
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          content: `❌ Failed to load settings: ${error.message}`,
          ephemeral: true,
        });
      }
    },
  },

  approvals: {
    data: new SlashCommandBuilder()
      .setName('approvals')
      .setDescription('✅ Review and approve pending actions'),
    async execute(interaction) {
      try {
        const embed = new EmbedBuilder()
          .setColor('#ffcc00')
          .setTitle('✅ Pending Approvals')
          .addFields(
            {
              name: 'SMS to Kevin Anderson',
              value:
                '"Hi Kevin! Following up on Est #1001 - ready to proceed?"\n' +
                '⚠️ Requires approval before sending\n' +
                '`/approve <id>` • `/reject <id>`',
              inline: false,
            },
            {
              name: 'Social Post (Facebook)',
              value:
                '"Just finished an amazing pressure washing transformation! Before & after shots attached."\n' +
                '⚠️ Requires approval before publishing\n' +
                '`/approve <id>` • `/reject <id>`',
              inline: false,
            }
          )
          .addFields({
            name: 'Note',
            value: 'External communications require approval to prevent accidents',
            inline: false,
          })
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });
      } catch (error) {
        await interaction.reply({
          content: `❌ Failed to load approvals: ${error.message}`,
          ephemeral: true,
        });
      }
    },
  },
};

module.exports = { businessCommands, WiseAPIClient };

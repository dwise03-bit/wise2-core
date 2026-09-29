/** WISE² customer-care commands and ticket intake for Discord. */
import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { BotFramework } from '../BotFramework';
import { BotConfig } from '../types';

type TicketKind = 'support' | 'bug' | 'feature';

export class CustomerCareBot extends BotFramework {
  private tickets: Array<{ id: string; kind: TicketKind; user: string; text: string; createdAt: number }> = [];

  constructor(config: BotConfig) {
    super(config);
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('support-ticket').setDescription('Open a WISE² customer-support ticket')
        .addStringOption(o => o.setName('issue').setDescription('What do you need help with?').setRequired(true)),
      execute: i => this.createTicket(i, 'support'),
    });
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('report-bug').setDescription('Report a WISE² bug')
        .addStringOption(o => o.setName('details').setDescription('What went wrong?').setRequired(true)),
      execute: i => this.createTicket(i, 'bug'),
    });
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('feature-request').setDescription('Suggest a WISE² feature')
        .addStringOption(o => o.setName('request').setDescription('What should WISE² add?').setRequired(true)),
      execute: i => this.createTicket(i, 'feature'),
    });
    this.registerCommand({
      data: new SlashCommandBuilder().setName('customer-help').setDescription('Show WISE² customer-care options'),
      execute: async i => { await i.reply({ ephemeral: true, embeds: [this.createEmbed({
        title: 'WISE² Customer Care', color: 0x0055ff,
        description: 'I can help you get unstuck. Use `/support-ticket`, `/report-bug`, or `/feature-request`.',
        fields: [
          { name: 'Urgent', value: 'Account access, billing, security — target response under 1 hour' },
          { name: 'High', value: 'Broken feature or outage — target response under 4 hours' },
          { name: 'Standard', value: 'Questions and how-to help — target response under 24 hours' },
        ], footer: 'WISE² support intake',
      })] }); },
    });
    this.registerCommand({
      data: new SlashCommandBuilder().setName('faq').setDescription('Show frequently asked WISE² questions'),
      execute: async i => { await i.reply({ ephemeral: true, content: 'WISE² FAQ: Start at the dashboard, use `/customer-help` for support, and open a ticket for account or billing issues.' }); },
    });
    this.registerCommand({
      data: new SlashCommandBuilder().setName('billing-help').setDescription('Get billing-support guidance'),
      execute: async i => { await i.reply({ ephemeral: true, content: 'For billing help, open `/support-ticket` and include the account email and invoice question. Never post payment details in Discord.' }); },
    });
    this.registerCommand({
      data: new SlashCommandBuilder().setName('onboard-customer').setDescription('Show the WISE² customer onboarding checklist'),
      execute: async i => { await i.reply({ ephemeral: true, content: 'WISE² onboarding: verify email → complete profile → choose a plan → create a project → review the knowledge base.' }); },
    });
    this.registerCommand({
      data: new SlashCommandBuilder().setName('account-status').setDescription('Show the account-status support path'),
      execute: async i => { await i.reply({ ephemeral: true, content: 'Account-status lookup is connected to the customer-care intake. Open `/support-ticket` if access, plan, usage, or invoice information is incorrect.' }); },
    });
  }

  private async createTicket(interaction: ChatInputCommandInteraction, kind: TicketKind): Promise<void> {
    const text = interaction.options.getString(kind === 'feature' ? 'request' : kind === 'bug' ? 'details' : 'issue', true).trim();
    const prefix = kind === 'support' ? 'WISE2' : kind === 'bug' ? 'BUG' : 'FEAT';
    const id = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    this.tickets.push({ id, kind, user: interaction.user.tag, text, createdAt: Date.now() });
    const channelId = process.env[`DISCORD_${kind.toUpperCase()}_CHANNEL_ID`];
    if (channelId) await this.sendMessage(channelId, `**${id}** · ${interaction.user.tag}\n${text}`);
    await interaction.reply({ ephemeral: true, embeds: [this.createEmbed({
      title: '✅ Request received', color: 0x2cd588,
      description: `Your ${kind} request is **${id}**. The WISE² team has the details.`,
      footer: 'Please keep this ID for follow-up',
    })] });
  }
}

export default CustomerCareBot;

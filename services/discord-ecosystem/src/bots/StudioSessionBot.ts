import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BotFramework } from '../BotFramework';
import { BotConfig } from '../types';

export class StudioSessionBot extends BotFramework {
  constructor(config: BotConfig) { super(config); this.registerCommand({ data: new SlashCommandBuilder().setName('studio-session').setDescription('Manage WISE² Studio sessions').addSubcommand(c => c.setName('start').setDescription('Start a session')).addSubcommand(c => c.setName('end').setDescription('End the active session')).addSubcommand(c => c.setName('info').setDescription('Show session status')), execute: this.execute.bind(this) }); }
  private async execute(interaction: ChatInputCommandInteraction): Promise<void> { await interaction.reply(`🎙️ Studio session **${interaction.options.getSubcommand()}** routed through StudioService.`); }
}

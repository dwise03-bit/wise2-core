import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { BotFramework } from '../BotFramework';
import { BotConfig } from '../types';

export class MixReviewBot extends BotFramework {
  constructor(config: BotConfig) { super(config); this.registerCommand({ data: new SlashCommandBuilder().setName('mix-review').setDescription('Manage WISE² mix reviews').addSubcommand(c => c.setName('latest').setDescription('Show latest render')).addSubcommand(c => c.setName('approve').setDescription('Approve latest render')), execute: this.execute.bind(this) }); }
  private async execute(interaction: ChatInputCommandInteraction): Promise<void> { await interaction.reply(`🎧 Mix review **${interaction.options.getSubcommand()}** routed through StudioService.`); }
}

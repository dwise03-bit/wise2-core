import { BotBase } from '../BotBase.js';
import pino from 'pino';

const logger = pino();

export class ModerationBot extends BotBase {
  private warnings: Map<string, number> = new Map();

  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
  }

  getBotName(): string {
    return 'ModerationBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'mute',
      description: 'Mute a user',
      usage: '!mute <@user>',
      execute: async (args, context) => {
        const member = context.message.mentions.members?.first();
        if (!member) {
          await context.message.reply('❌ Please mention a user to mute');
          return;
        }

        try {
          await member.timeout(60 * 60 * 1000, 'Muted by moderator');
          await context.message.reply(`✅ ${member.user.tag} has been muted for 1 hour`);
          logger.info(`Muted ${member.user.tag}`);
        } catch (error) {
          await context.message.reply(`❌ Failed to mute user: ${error}`);
        }
      },
    });

    this.registerCommand({
      name: 'warn',
      description: 'Warn a user',
      usage: '!warn <@user>',
      execute: async (args, context) => {
        const member = context.message.mentions.members?.first();
        if (!member) {
          await context.message.reply('❌ Please mention a user to warn');
          return;
        }

        const currentWarnings = this.warnings.get(member.id) || 0;
        const newCount = currentWarnings + 1;
        this.warnings.set(member.id, newCount);

        await context.message.reply(
          `⚠️ ${member.user.tag} has been warned (${newCount}/3)`,
        );

        if (newCount >= 3) {
          try {
            await member.ban({ reason: 'Reached 3 warnings' });
            await context.message.reply(
              `🚫 ${member.user.tag} has been banned (3 warnings)`,
            );
          } catch (error) {
            logger.error(`Failed to ban user: ${error}`);
          }
        }

        logger.info(`Warned ${member.user.tag} (${newCount}/3)`);
      },
    });

    this.registerCommand({
      name: 'kick',
      description: 'Remove a user',
      usage: '!kick <@user>',
      execute: async (args, context) => {
        const member = context.message.mentions.members?.first();
        if (!member) {
          await context.message.reply('❌ Please mention a user to kick');
          return;
        }

        try {
          await member.kick('Kicked by moderator');
          await context.message.reply(`✅ ${member.user.tag} has been removed`);
          logger.info(`Kicked ${member.user.tag}`);
        } catch (error) {
          await context.message.reply(`❌ Failed to kick user: ${error}`);
        }
      },
    });

    this.registerCommand({
      name: 'ban',
      description: 'Ban a user',
      usage: '!ban <@user>',
      execute: async (args, context) => {
        const member = context.message.mentions.members?.first();
        if (!member) {
          await context.message.reply('❌ Please mention a user to ban');
          return;
        }

        try {
          await member.ban({ reason: 'Banned by moderator' });
          await context.message.reply(`🚫 ${member.user.tag} has been banned`);
          logger.info(`Banned ${member.user.tag}`);
        } catch (error) {
          await context.message.reply(`❌ Failed to ban user: ${error}`);
        }
      },
    });

    this.setupAutoModeration();
  }

  private setupAutoModeration(): void {
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      // Check for spam
      if (this.isSpam(message.content)) {
        await message.delete();
        await message.author.send(
          '❌ Your message was deleted for violating spam rules',
        );
        logger.warn(`Deleted spam from ${message.author.tag}`);
      }

      // Check for profanity
      if (this.hasProfanity(message.content)) {
        await message.delete();
        const warn = this.warnings.get(message.author.id) || 0;
        this.warnings.set(message.author.id, warn + 1);
        await message.author.send(
          `⚠️ Your message was deleted for profanity (${warn + 1}/3 warnings)`,
        );
        logger.warn(`Deleted profanity from ${message.author.tag}`);
      }
    });
  }

  private isSpam(content: string): boolean {
    // Check for excessive special characters
    const specialChars = (content.match(/[!@#$%^&*]/g) || []).length;
    if (specialChars > 20) return true;

    // Check for repeated characters
    if (/(.)\1{9,}/.test(content)) return true;

    return false;
  }

  private hasProfanity(content: string): boolean {
    const bannedWords = ['badword1', 'badword2']; // Placeholder
    return bannedWords.some((word) => content.toLowerCase().includes(word));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new ModerationBot();
  bot.connect();
}

export default ModerationBot;

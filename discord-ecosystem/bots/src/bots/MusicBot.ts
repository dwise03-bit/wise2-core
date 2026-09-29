import { BotBase } from '../BotBase.js';
import { EmbedBuilder } from 'discord.js';
import pino from 'pino';

const logger = pino();

interface QueueItem {
  title: string;
  artist: string;
  duration: number;
}

export class MusicBot extends BotBase {
  private queue: QueueItem[] = [];
  private isPlaying = false;
  private currentSong?: QueueItem;
  private volume = 50;

  constructor() {
    super(
      process.env.DISCORD_BOT_TOKEN || '',
      process.env.DISCORD_CLIENT_ID || '',
      process.env.DISCORD_GUILD_ID || '',
    );

    this.registerCommands();
  }

  getBotName(): string {
    return 'MusicBot';
  }

  private registerCommands(): void {
    this.registerCommand({
      name: 'play',
      description: 'Queue song',
      usage: '!play <song>',
      execute: async (args, context) => {
        const song = args.join(' ');
        if (!song) {
          await context.message.reply('❌ Usage: `!play <song>`');
          return;
        }
        await this.playSong(song, context.message);
      },
    });

    this.registerCommand({
      name: 'queue',
      description: 'Show queue',
      usage: '!queue',
      execute: async (args, context) => {
        await this.showQueue(context.message);
      },
    });

    this.registerCommand({
      name: 'stop',
      description: 'Stop playback',
      usage: '!stop',
      execute: async (args, context) => {
        await this.stopPlayback(context.message);
      },
    });

    this.registerCommand({
      name: 'volume',
      description: 'Set volume',
      usage: '!volume <0-100>',
      execute: async (args, context) => {
        const vol = parseInt(args[0]);
        if (isNaN(vol) || vol < 0 || vol > 100) {
          await context.message.reply('❌ Volume must be 0-100');
          return;
        }
        await this.setVolume(vol, context.message);
      },
    });
  }

  private async playSong(song: string, message: any): Promise<void> {
    const item: QueueItem = {
      title: song,
      artist: 'Unknown',
      duration: Math.floor(Math.random() * 300) + 180,
    };

    this.queue.push(item);

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.currentSong = this.queue.shift();
    }

    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle('🎵 Song Queued')
      .addFields(
        {
          name: 'Title',
          value: item.title,
          inline: true,
        },
        {
          name: 'Queue Position',
          value: `${this.queue.length + 1}`,
          inline: true,
        },
      );

    await message.reply({ embeds: [embed] });
    logger.info(`Queued song: ${song}`);
  }

  private async showQueue(message: any): Promise<void> {
    if (this.queue.length === 0) {
      await message.reply('🎵 Queue is empty');
      return;
    }

    const fields = this.queue.slice(0, 10).map((item, index) => ({
      name: `${index + 1}. ${item.title}`,
      value: `${item.artist} • ${this.formatDuration(item.duration)}`,
      inline: false,
    }));

    const embed = new EmbedBuilder()
      .setColor(0x00d9ff)
      .setTitle('🎵 Queue')
      .addFields(...fields)
      .setFooter({ text: `${this.queue.length} songs in queue` });

    await message.reply({ embeds: [embed] });
  }

  private async stopPlayback(message: any): Promise<void> {
    this.isPlaying = false;
    this.queue = [];
    this.currentSong = undefined;

    await message.reply('⏹️ Playback stopped');
    logger.info('Playback stopped');
  }

  private async setVolume(volume: number, message: any): Promise<void> {
    this.volume = volume;

    const embed = new EmbedBuilder()
      .setColor(0x39ff14)
      .setTitle('🔊 Volume Updated')
      .addFields({
        name: 'Volume',
        value: `${this.volume}%`,
        inline: true,
      });

    await message.reply({ embeds: [embed] });
  }

  private formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new MusicBot();
  bot.connect();
}

export default MusicBot;

import { Client, ChannelType, EmbedBuilder } from 'discord.js';
import pino from 'pino';

const logger = pino();

export class DiscordIntegration {
  private client: Client | null = null;
  private connected = false;
  private token: string;

  constructor(token: string) {
    this.token = token;
    if (token) {
      this.initialize();
    } else {
      logger.warn('No Discord bot token provided');
    }
  }

  private async initialize(): Promise<void> {
    try {
      this.client = new Client({ intents: ['Guilds', 'GuildMessages', 'DirectMessages'] });

      this.client.on('ready', () => {
        this.connected = true;
        logger.info(`Connected to Discord as ${this.client?.user?.tag}`);
      });

      this.client.on('error', (error) => {
        logger.error(`Discord error: ${error}`);
        this.connected = false;
      });

      await this.client.login(this.token);
    } catch (error) {
      logger.error(`Failed to connect to Discord: ${error}`);
      this.connected = false;
    }
  }

  /**
   * Send message to channel
   */
  async sendMessage(channelId: string, content: string): Promise<any> {
    if (!this.client || !this.connected) {
      logger.warn('Discord not connected');
      return null;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.type === ChannelType.GuildText) {
        const message = await (channel as any).send(content);
        logger.info(`Sent Discord message to ${channelId}`);
        return message;
      }
    } catch (error) {
      logger.error(`Failed to send Discord message: ${error}`);
    }
    return null;
  }

  /**
   * Send embed message
   */
  async sendEmbed(channelId: string, embed: any): Promise<any> {
    if (!this.client || !this.connected) {
      logger.warn('Discord not connected');
      return null;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.type === ChannelType.GuildText) {
        const embedBuilder = new EmbedBuilder()
          .setTitle(embed.title)
          .setDescription(embed.description)
          .setColor(embed.color || 0x39ff14)
          .setTimestamp();

        if (embed.fields) {
          embed.fields.forEach((field: any) => {
            embedBuilder.addFields(field);
          });
        }

        const message = await (channel as any).send({ embeds: [embedBuilder] });
        logger.info(`Sent Discord embed to ${channelId}`);
        return message;
      }
    } catch (error) {
      logger.error(`Failed to send Discord embed: ${error}`);
    }
    return null;
  }

  /**
   * Send DM to user
   */
  async sendDM(userId: string, content: string): Promise<any> {
    if (!this.client || !this.connected) {
      logger.warn('Discord not connected');
      return null;
    }

    try {
      const user = await this.client.users.fetch(userId);
      const dm = await user.createDM();
      const message = await dm.send(content);
      logger.info(`Sent Discord DM to ${userId}`);
      return message;
    } catch (error) {
      logger.error(`Failed to send Discord DM: ${error}`);
    }
    return null;
  }

  /**
   * Get guild members
   */
  async getGuildMembers(guildId: string): Promise<any[]> {
    if (!this.client || !this.connected) {
      logger.warn('Discord not connected');
      return [];
    }

    try {
      const guild = await this.client.guilds.fetch(guildId);
      const members = await guild.members.fetch();

      return Array.from(members.values()).map((member) => ({
        id: member.id,
        username: member.user.username,
        roles: member.roles.cache.map((r) => r.name),
        joinedAt: member.joinedAt,
      }));
    } catch (error) {
      logger.error(`Failed to get guild members: ${error}`);
      return [];
    }
  }

  /**
   * Get guild channels
   */
  async getGuildChannels(guildId: string): Promise<any[]> {
    if (!this.client || !this.connected) {
      logger.warn('Discord not connected');
      return [];
    }

    try {
      const guild = await this.client.guilds.fetch(guildId);
      const channels = await guild.channels.fetch();

      return Array.from(channels.values()).map((channel) => ({
        id: channel?.id,
        name: channel?.name,
        type: channel?.type,
        topic: (channel as any)?.topic,
      }));
    } catch (error) {
      logger.error(`Failed to get guild channels: ${error}`);
      return [];
    }
  }

  /**
   * Create channel
   */
  async createChannel(guildId: string, name: string, type?: string): Promise<any> {
    if (!this.client || !this.connected) {
      logger.warn('Discord not connected');
      return null;
    }

    try {
      const guild = await this.client.guilds.fetch(guildId);
      const channel = await guild.channels.create({
        name,
        type: type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText,
      });

      logger.info(`Created Discord channel: ${name}`);
      return { id: channel.id, name: channel.name };
    } catch (error) {
      logger.error(`Failed to create channel: ${error}`);
      return null;
    }
  }

  /**
   * Add reaction to message
   */
  async addReaction(channelId: string, messageId: string, emoji: string): Promise<boolean> {
    if (!this.client || !this.connected) {
      logger.warn('Discord not connected');
      return false;
    }

    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.type === ChannelType.GuildText) {
        const message = await (channel as any).messages.fetch(messageId);
        await message.react(emoji);
        return true;
      }
    } catch (error) {
      logger.error(`Failed to add reaction: ${error}`);
    }
    return false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

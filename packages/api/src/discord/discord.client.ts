import { Client, GatewayIntentBits, Collection, ChannelType } from 'discord.js';

export class DiscordClient {
  private client: Client;
  private commands: Collection<string, any> = new Collection();
  private token: string;
  private guildId: string;

  constructor(token: string, guildId: string) {
    this.token = token;
    this.guildId = guildId;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
      ],
    });
  }

  async connect() {
    if (!this.token) {
      console.error('❌ Discord bot token not configured');
      return false;
    }

    try {
      await this.client.login(this.token);
      console.log('✅ Discord bot connected');
      return true;
    } catch (err) {
      console.error('❌ Failed to connect Discord bot:', err);
      return false;
    }
  }

  async registerCommands(commands: any[]) {
    try {
      const guild = await this.client.guilds.fetch(this.guildId);
      await guild.commands.set(commands);
      console.log(`✅ Registered ${commands.length} commands`);
    } catch (err) {
      console.error('Failed to register commands:', err);
    }
  }

  onReady(callback: () => void) {
    this.client.on('ready', callback);
  }

  onInteraction(callback: (interaction: any) => void) {
    this.client.on('interactionCreate', callback);
  }

  onMessage(callback: (message: any) => void) {
    this.client.on('messageCreate', callback);
  }

  async sendMessage(channelId: string, content: string | { embeds?: any[]; content?: string }) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        return await (channel as any).send(content);
      }
    } catch (err) {
      console.error('Failed to send Discord message:', err);
    }
  }

  async createChannels(guildId: string, channels: { name: string; type: ChannelType }[]) {
    try {
      const guild = await this.client.guilds.fetch(guildId);
      for (const channelConfig of channels) {
        const existing = guild.channels.cache.find((c) => c.name === channelConfig.name);
        if (!existing) {
          await guild.channels.create({
            name: channelConfig.name,
            type: channelConfig.type,
          });
          console.log(`✅ Created channel: ${channelConfig.name}`);
        }
      }
    } catch (err) {
      console.error('Failed to create channels:', err);
    }
  }

  async createRoles(guildId: string, roles: string[]) {
    try {
      const guild = await this.client.guilds.fetch(guildId);
      for (const roleName of roles) {
        const existing = guild.roles.cache.find((r) => r.name === roleName);
        if (!existing) {
          await guild.roles.create({ name: roleName });
          console.log(`✅ Created role: ${roleName}`);
        }
      }
    } catch (err) {
      console.error('Failed to create roles:', err);
    }
  }

  getClient() {
    return this.client;
  }

  isReady() {
    return this.client.isReady();
  }
}

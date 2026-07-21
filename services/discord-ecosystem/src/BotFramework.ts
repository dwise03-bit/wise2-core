/**
 * WISE² Discord Ecosystem - Bot Framework
 * Base infrastructure for all Discord bots with extensible features
 */

import {
  Client,
  GatewayIntentBits,
  Collection,
  CommandInteraction,
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
  REST,
  Routes,
  TextChannel,
  EmbedBuilder,
} from 'discord.js';
import { BotConfig, CommandHandler, EventHandler, PermissionContext, BotError } from './types';
import Logger from './utils/Logger';
import RateLimiter from './utils/RateLimiter';
import { Cache } from './utils/Cache';
import { MessageQueue } from './queues/MessageQueue';
import { AuditLogger } from './middleware/AuditLogger';

export abstract class BotFramework {
  protected client: Client;
  protected config: BotConfig;
  protected commands: Collection<string, CommandHandler>;
  protected eventHandlers: Map<string, EventHandler>;
  protected logger: typeof Logger;
  protected rateLimiter: RateLimiter;
  protected cache: Cache<any>;
  protected messageQueue: MessageQueue;
  protected auditLogger: AuditLogger;
  protected permissionLevels: Map<string, number> = new Map();

  constructor(config: BotConfig) {
    this.config = config;
    this.logger = Logger;
    this.rateLimiter = new RateLimiter();
    this.cache = new Cache({ ttl: 60000, maxSize: 1000, strategy: 'lru' });
    this.messageQueue = new MessageQueue();
    this.auditLogger = new AuditLogger({ enabled: true });

    this.client = new Client({
      intents: this.parseIntents(config.intents),
    });

    this.commands = new Collection();
    this.eventHandlers = new Map();

    this.setupDefaultHandlers();
  }

  private parseIntents(intents: number[]): number {
    return intents.reduce((acc, intent) => acc | intent, 0);
  }

  private setupDefaultHandlers(): void {
    this.on('ready', this.onReady.bind(this));
    this.on('interactionCreate', this.onInteractionCreate.bind(this));
    this.on('error', this.onError.bind(this));
    this.on('warn', this.onWarn.bind(this));
  }

  private async onReady(): Promise<void> {
    this.logger.info(this.config.name, 'Ready', `Bot is online as ${this.client.user?.tag}`);
    this.auditLogger.setClient(this.client);
  }

  private async onInteractionCreate(interaction: CommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands.get(interaction.commandName);
    if (!command) {
      this.logger.warn(this.config.name, 'Command', `Unknown command: ${interaction.commandName}`);
      return;
    }

    try {
      // Check rate limits
      if (!this.rateLimiter.isAllowed('command', interaction.user.id, interaction.commandName)) {
        const remaining = this.rateLimiter.getResetTime('command', interaction.user.id, interaction.commandName);
        await interaction.reply({
          content: `⏱️ You're being rate limited. Try again in ${Math.ceil(remaining / 1000)} seconds.`,
          ephemeral: true,
        });

        this.auditLogger.log({
          userId: interaction.user.id,
          userName: interaction.user.username,
          guildId: interaction.guildId || 'DM',
          command: interaction.commandName,
          action: 'rate_limit_exceeded',
          status: 'failure',
        });

        return;
      }

      // Check permissions
      if (command.requiredPermissions || command.requiresAdmin) {
        const hasPermission = await this.checkPermissions(interaction);
        if (!hasPermission) {
          await interaction.reply({
            content: '❌ You do not have permission to use this command.',
            ephemeral: true,
          });

          this.auditLogger.log({
            userId: interaction.user.id,
            userName: interaction.user.username,
            guildId: interaction.guildId || 'DM',
            command: interaction.commandName,
            action: 'permission_denied',
            status: 'failure',
          });

          return;
        }
      }

      // Execute command
      await command.execute(interaction);

      this.auditLogger.log({
        userId: interaction.user.id,
        userName: interaction.user.username,
        guildId: interaction.guildId || 'DM',
        command: interaction.commandName,
        action: 'executed',
        status: 'success',
      });
    } catch (error) {
      this.logger.error(
        this.config.name,
        'Command',
        `Error executing ${interaction.commandName}`,
        error as Error,
        { userId: interaction.user.id }
      );

      this.auditLogger.log({
        userId: interaction.user.id,
        userName: interaction.user.username,
        guildId: interaction.guildId || 'DM',
        command: interaction.commandName,
        action: 'executed',
        status: 'failure',
        error: (error as Error).message,
      });

      await this.replyWithError(interaction, error as Error);
    }
  }

  private async onError(error: Error): Promise<void> {
    this.logger.error(this.config.name, 'Client', 'Client error', error);
  }

  private async onWarn(warning: string): Promise<void> {
    this.logger.warn(this.config.name, 'Client', warning);
  }

  protected registerCommand(command: CommandHandler): void {
    const commandName = command.data.toJSON().name || 'unknown';
    this.commands.set(commandName, command);
    this.logger.debug(this.config.name, 'Command', `Registered command: ${commandName}`);
  }

  protected on(event: string, listener: (...args: any[]) => Promise<void>): void {
    const handler: EventHandler = { name: event, execute: listener };
    this.eventHandlers.set(event, handler);
    this.client.on(event, (...args) => listener(...args));
  }

  protected once(event: string, listener: (...args: any[]) => Promise<void>): void {
    const handler: EventHandler = { name: event, once: true, execute: listener };
    this.eventHandlers.set(`${event}_once`, handler);
    this.client.once(event, (...args) => listener(...args));
  }

  public async connect(): Promise<void> {
    try {
      await this.client.login(this.config.token);
      this.logger.info(this.config.name, 'Connect', 'Connected to Discord');
    } catch (error) {
      this.logger.error(this.config.name, 'Connect', 'Failed to connect to Discord', error as Error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    this.client.destroy();
    this.logger.info(this.config.name, 'Disconnect', 'Disconnected from Discord');
  }

  public async registerCommands(): Promise<void> {
    try {
      const commands = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());

      const rest = new REST().setToken(this.config.token);

      let route;
      if (this.config.guildId) {
        route = Routes.applicationGuildCommands(this.config.clientId, this.config.guildId);
      } else {
        route = Routes.applicationCommands(this.config.clientId);
      }

      await rest.put(route, { body: commands });
      this.logger.info(this.config.name, 'Register', `Registered ${commands.length} commands`);
    } catch (error) {
      this.logger.error(this.config.name, 'Register', 'Failed to register commands', error as Error);
      throw error;
    }
  }

  protected async checkPermissions(interaction: CommandInteraction): Promise<boolean> {
    if (!interaction.inGuild()) return true; // DMs allowed

    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (!member) return false;

    if (member.permissions.has('Administrator')) {
      return true;
    }

    return true; // Default to allowed
  }

  protected async sendMessage(
    channelId: string,
    content: string,
    options?: { embeds?: any[]; components?: any[]; ephemeral?: boolean }
  ): Promise<boolean> {
    try {
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased()) {
        this.logger.error(this.config.name, 'Send', 'Invalid channel', undefined, { channelId });
        return false;
      }

      const textChannel = channel as TextChannel;
      await textChannel.send({
        content,
        embeds: options?.embeds,
        components: options?.components,
      });

      return true;
    } catch (error) {
      this.logger.warn(this.config.name, 'Send', 'Failed to send message', {
        channelId,
        error: (error as Error).message,
      });

      return false;
    }
  }

  protected async queueMessage(
    channelId: string,
    guildId: string,
    userId: string,
    content: string,
    options?: { embeds?: any[]; components?: any[]; ephemeral?: boolean }
  ): Promise<void> {
    this.messageQueue.enqueue({
      channelId,
      guildId,
      userId,
      content,
      embeds: options?.embeds,
      components: options?.components,
      ephemeral: options?.ephemeral,
    });
  }

  protected async replyWithError(interaction: CommandInteraction, error: Error): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ Error')
      .setDescription(error.message || 'An unknown error occurred')
      .setTimestamp();

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
    } catch (err) {
      this.logger.error(this.config.name, 'Error', 'Failed to send error message', err as Error);
    }
  }

  protected createEmbed(options: {
    title?: string;
    description?: string;
    color?: number;
    fields?: { name: string; value: string; inline?: boolean }[];
    thumbnail?: string;
    image?: string;
    footer?: string;
  }): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setColor(parseInt(this.config.color.replace('#', ''), 16) || 0x3498db)
      .setTimestamp();

    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.footer) embed.setFooter({ text: options.footer });

    if (options.fields) {
      for (const field of options.fields) {
        embed.addFields({ name: field.name, value: field.value, inline: field.inline });
      }
    }

    return embed;
  }

  public getClient(): Client {
    return this.client;
  }

  public getConfig(): BotConfig {
    return this.config;
  }

  public getCommands(): Collection<string, CommandHandler> {
    return this.commands;
  }

  public getStats(): {
    botName: string;
    uptime: number;
    servers: number;
    users: number;
    commands: number;
    cacheStats: any;
    queueStats: any;
    auditStats: any;
  } {
    return {
      botName: this.config.name,
      uptime: this.client.uptime || 0,
      servers: this.client.guilds.cache.size,
      users: this.client.users.cache.size,
      commands: this.commands.size,
      cacheStats: this.cache.getStats(),
      queueStats: this.messageQueue.getStats(),
      auditStats: this.auditLogger.getStats(),
    };
  }
}

export default BotFramework;

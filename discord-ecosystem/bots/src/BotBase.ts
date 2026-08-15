import { Client, Collection, REST, Routes, ChannelType } from 'discord.js';
import pino from 'pino';

const logger = pino();

export interface BotCommand {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[], context: any) => Promise<void>;
}

export abstract class BotBase {
  protected client: Client;
  protected commands: Collection<string, BotCommand> = new Collection();
  protected botToken: string;
  protected clientId: string;
  protected guildId: string;

  constructor(token: string, clientId: string, guildId: string) {
    this.botToken = token;
    this.clientId = clientId;
    this.guildId = guildId;

    this.client = new Client({
      intents: [
        'Guilds',
        'GuildMessages',
        'DirectMessages',
        'MessageContent',
        'GuildMembers',
      ],
    });

    this.setupEventHandlers();
  }

  protected setupEventHandlers(): void {
    this.client.on('ready', () => {
      logger.info(`${this.getBotName()} is ready!`);
    });

    this.client.on('messageCreate', (message) => {
      if (message.author.bot) return;
      this.handleMessage(message);
    });

    this.client.on('interactionCreate', (interaction) => {
      this.handleInteraction(interaction);
    });

    this.client.on('error', (error) => {
      logger.error(`Discord error: ${error}`);
    });
  }

  protected async handleMessage(message: any): Promise<void> {
    if (!message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = this.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(args, { message, client: this.client });
    } catch (error) {
      logger.error(`Error executing command ${commandName}: ${error}`);
      message.reply({
        content: `❌ Error executing command: ${error}`,
        ephemeral: true,
      });
    }
  }

  protected async handleInteraction(interaction: any): Promise<void> {
    if (!interaction.isCommand()) return;

    const command = this.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute([], { interaction, client: this.client });
    } catch (error) {
      logger.error(`Error executing interaction: ${error}`);
      interaction.reply({
        content: `❌ Error: ${error}`,
        ephemeral: true,
      });
    }
  }

  async registerCommands(): Promise<void> {
    if (this.commands.size === 0) {
      logger.warn(`${this.getBotName()} has no commands to register`);
      return;
    }

    try {
      const rest = new REST({ version: '10' }).setToken(this.botToken);

      const commands = Array.from(this.commands.values()).map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
      }));

      logger.info(`Registering ${commands.length} commands for ${this.getBotName()}`);

      await rest.put(Routes.applicationGuildCommands(this.clientId, this.guildId), {
        body: commands,
      });

      logger.info(`Commands registered for ${this.getBotName()}`);
    } catch (error) {
      logger.error(`Failed to register commands: ${error}`);
    }
  }

  async connect(): Promise<void> {
    try {
      await this.client.login(this.botToken);
      logger.info(`${this.getBotName()} connected to Discord`);
    } catch (error) {
      logger.error(`Failed to connect ${this.getBotName()}: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.destroy();
    logger.info(`${this.getBotName()} disconnected`);
  }

  protected registerCommand(command: BotCommand): void {
    this.commands.set(command.name, command);
  }

  protected async sendMessage(channelId: string, content: string): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.type === ChannelType.GuildText) {
        await (channel as any).send(content);
      }
    } catch (error) {
      logger.error(`Failed to send message: ${error}`);
    }
  }

  protected async sendEmbed(channelId: string, embed: any): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.type === ChannelType.GuildText) {
        await (channel as any).send({ embeds: [embed] });
      }
    } catch (error) {
      logger.error(`Failed to send embed: ${error}`);
    }
  }

  abstract getBotName(): string;
}

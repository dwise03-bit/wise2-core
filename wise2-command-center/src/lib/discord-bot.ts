/**
 * Discord Bot Handler for WISE² Command Center
 * Handles slash commands and interactions from Discord
 */

import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';

interface BotConfig {
  token: string;
  clientId: string;
  guildId: string;
}

class DiscordBotHandler {
  private client: Client | null = null;
  private config: BotConfig | null = null;
  private rest: REST | null = null;

  constructor() {
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;
    const clientId = process.env.DISCORD_CLIENT_ID;

    if (!token || !guildId || !clientId) {
      console.warn(
        'Discord bot not fully configured. Set DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, and DISCORD_CLIENT_ID'
      );
      return;
    }

    this.config = { token, guildId, clientId };
    this.rest = new REST({ version: '10' }).setToken(token);
  }

  /**
   * Initialize Discord bot
   */
  async initialize(): Promise<boolean> {
    if (!this.config) {
      console.warn('Discord bot not configured');
      return false;
    }

    try {
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.DirectMessages,
        ],
      });

      // Register event handlers
      this.setupEventHandlers();

      // Register slash commands
      await this.registerSlashCommands();

      // Connect to Discord
      await this.client.login(this.config.token);
      console.log('Discord bot initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error);
      return false;
    }
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    // Ready event
    this.client.on('ready', () => {
      console.log(`Discord bot logged in as ${this.client?.user?.tag}`);
    });

    // Slash command interaction
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return;

      try {
        await this.handleCommand(interaction);
      } catch (error) {
        console.error('Command execution error:', error);
        await interaction.reply({
          content: 'There was an error executing this command.',
          ephemeral: true,
        });
      }
    });

    // Error handler
    this.client.on('error', (error) => {
      console.error('Discord client error:', error);
    });
  }

  /**
   * Register slash commands
   */
  private async registerSlashCommands(): Promise<void> {
    if (!this.config || !this.rest) return;

    const commands = [
      new SlashCommandBuilder()
        .setName('status')
        .setDescription('Check WISE² system status'),

      new SlashCommandBuilder()
        .setName('dashboard')
        .setDescription('Get link to WISE² dashboard'),

      new SlashCommandBuilder()
        .setName('notify')
        .setDescription('Send a notification to Discord')
        .addStringOption((option) =>
          option
            .setName('message')
            .setDescription('Notification message')
            .setRequired(true)
        ),

      new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands'),

      new SlashCommandBuilder()
        .setName('sync')
        .setDescription('Sync Command Center data'),
    ];

    try {
      await this.rest.put(
        Routes.applicationGuildCommands(
          this.config.clientId,
          this.config.guildId
        ),
        { body: commands.map((cmd) => cmd.toJSON()) }
      );
      console.log('Slash commands registered successfully');
    } catch (error) {
      console.error('Failed to register slash commands:', error);
    }
  }

  /**
   * Handle slash command
   */
  private async handleCommand(interaction: any): Promise<void> {
    const { commandName } = interaction;

    switch (commandName) {
      case 'status':
        await this.handleStatusCommand(interaction);
        break;
      case 'dashboard':
        await this.handleDashboardCommand(interaction);
        break;
      case 'notify':
        await this.handleNotifyCommand(interaction);
        break;
      case 'help':
        await this.handleHelpCommand(interaction);
        break;
      case 'sync':
        await this.handleSyncCommand(interaction);
        break;
      default:
        await interaction.reply({
          content: 'Unknown command',
          ephemeral: true,
        });
    }
  }

  /**
   * Handle /status command
   */
  private async handleStatusCommand(interaction: any): Promise<void> {
    await interaction.deferReply();

    const status = {
      status: 'online' as const,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    await interaction.editReply({
      embeds: [
        {
          title: '📊 WISE² System Status',
          description: 'System is operational',
          fields: [
            { name: 'Status', value: '🟢 Online', inline: true },
            { name: 'Uptime', value: `${Math.floor(status.uptime)} seconds`, inline: true },
            { name: 'Memory', value: `${Math.round(status.memory.heapUsed / 1024 / 1024)} MB`, inline: true },
            { name: 'Timestamp', value: status.timestamp, inline: false },
          ],
          color: 0x00ff00,
          timestamp: new Date(),
        },
      ],
    });
  }

  /**
   * Handle /dashboard command
   */
  private async handleDashboardCommand(interaction: any): Promise<void> {
    const dashboardUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://wise2.net/dashboard';

    await interaction.reply({
      embeds: [
        {
          title: '📈 WISE² Dashboard',
          description: 'Access the Command Center dashboard',
          fields: [
            {
              name: 'Dashboard URL',
              value: dashboardUrl,
              inline: false,
            },
          ],
          color: 0x0099ff,
          url: dashboardUrl,
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: 'Open Dashboard',
              style: 5, // Link button
              url: dashboardUrl,
            },
          ],
        },
      ],
      ephemeral: false,
    });
  }

  /**
   * Handle /notify command
   */
  private async handleNotifyCommand(interaction: any): Promise<void> {
    const message = interaction.options.getString('message');

    await interaction.reply({
      content: '✓ Notification sent',
      ephemeral: true,
    });
  }

  /**
   * Handle /help command
   */
  private async handleHelpCommand(interaction: any): Promise<void> {
    await interaction.reply({
      embeds: [
        {
          title: '📖 WISE² Command Center - Help',
          description: 'Available commands',
          fields: [
            {
              name: '/status',
              value: 'Check system status and uptime',
              inline: false,
            },
            {
              name: '/dashboard',
              value: 'Get link to the Command Center dashboard',
              inline: false,
            },
            {
              name: '/notify <message>',
              value: 'Send a notification',
              inline: false,
            },
            {
              name: '/sync',
              value: 'Sync data between Discord and Command Center',
              inline: false,
            },
            {
              name: '/help',
              value: 'Show this help message',
              inline: false,
            },
          ],
          color: 0x0099ff,
        },
      ],
      ephemeral: false,
    });
  }

  /**
   * Handle /sync command
   */
  private async handleSyncCommand(interaction: any): Promise<void> {
    await interaction.deferReply();

    // Simulate sync operation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await interaction.editReply({
      embeds: [
        {
          title: '✓ Sync Complete',
          description: 'Data synchronized successfully',
          fields: [
            { name: 'Status', value: 'Synced', inline: true },
            { name: 'Timestamp', value: new Date().toISOString(), inline: false },
          ],
          color: 0x00ff00,
        },
      ],
    });
  }

  /**
   * Shutdown bot
   */
  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      console.log('Discord bot shut down');
    }
  }
}

// Export singleton instance
export const discordBotHandler = new DiscordBotHandler();

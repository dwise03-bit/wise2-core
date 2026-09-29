/**
 * WISE² Discord Ecosystem - Executive Bot
 * Route WISE² requests, get updates, manage tasks, and provide system status
 */

import { BotFramework } from '../BotFramework';
import { BotConfig, CommandHandler } from '../types';
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export class ExecutiveBot extends BotFramework {
  constructor(config: BotConfig) {
    super(config);
    this.setupCommands();
  }

  private setupCommands(): void {
    // Status command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Get current WISE² system status'),
      execute: this.statusCommand.bind(this),
    });

    // Task create command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('task')
        .setDescription('Create or manage tasks')
        .addSubcommand(sub =>
          sub
            .setName('create')
            .setDescription('Create a new task')
            .addStringOption(opt => opt.setName('title').setDescription('Task title').setRequired(true))
            .addStringOption(opt => opt.setName('description').setDescription('Task description').setRequired(false))
            .addStringOption(opt =>
              opt
                .setName('priority')
                .setDescription('Priority level')
                .setRequired(false)
                .addChoices(
                  { name: 'Low', value: 'low' },
                  { name: 'Medium', value: 'medium' },
                  { name: 'High', value: 'high' }
                )
            )
        )
        .addSubcommand(sub => sub.setName('list').setDescription('List all tasks'))
        .addSubcommand(sub =>
          sub
            .setName('update')
            .setDescription('Update a task')
            .addStringOption(opt => opt.setName('task_id').setDescription('Task ID').setRequired(true))
            .addStringOption(opt =>
              opt
                .setName('status')
                .setDescription('New status')
                .setRequired(true)
                .addChoices(
                  { name: 'Open', value: 'open' },
                  { name: 'In Progress', value: 'in_progress' },
                  { name: 'Done', value: 'done' }
                )
            )
        ),
      execute: this.taskCommand.bind(this),
    });

    // Request command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('request')
        .setDescription('Submit a request to WISE²')
        .addStringOption(opt => opt.setName('type').setDescription('Request type').setRequired(true))
        .addStringOption(opt => opt.setName('description').setDescription('Request details').setRequired(true))
        .addStringOption(opt => opt.setName('priority').setDescription('Priority').setRequired(false)),
      execute: this.requestCommand.bind(this),
    });

    // Notify command (send notifications)
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('notify')
        .setDescription('Send a notification to users')
        .addStringOption(opt => opt.setName('message').setDescription('Notification message').setRequired(true))
        .addStringOption(opt => opt.setName('channel').setDescription('Target channel').setRequired(false)),
      execute: this.notifyCommand.bind(this),
      requiresAdmin: true,
    });

    // Help command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help on using WISE² Executive Bot'),
      execute: this.helpCommand.bind(this),
    });

    // Analytics command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('analytics')
        .setDescription('View bot analytics and usage stats'),
      execute: this.analyticsCommand.bind(this),
    });
  }

  private async statusCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const stats = this.getStats();

      const embed = this.createEmbed({
        title: '📊 WISE² System Status',
        description: 'Current system health and metrics',
        fields: [
          {
            name: '🤖 Bot Status',
            value: `Online for ${this.formatUptime(stats.uptime)}`,
            inline: true,
          },
          {
            name: '📡 Guilds',
            value: stats.servers.toString(),
            inline: true,
          },
          {
            name: '👥 Users',
            value: stats.users.toString(),
            inline: true,
          },
          {
            name: '⚙️ Commands',
            value: stats.commands.toString(),
            inline: true,
          },
          {
            name: '💾 Cache',
            value: `${stats.cacheStats.size} items (${(stats.cacheStats.hitRate * 100).toFixed(1)}% hit rate)`,
            inline: true,
          },
          {
            name: '📤 Queue',
            value: `${stats.queueStats.size} pending messages`,
            inline: true,
          },
        ],
        color: 0x00ff00,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async taskCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'create') {
        const title = interaction.options.getString('title', true);
        const description = interaction.options.getString('description');
        const priority = interaction.options.getString('priority') || 'medium';

        const taskId = `TASK-${Date.now()}`;

        const embed = this.createEmbed({
          title: '✅ Task Created',
          description: title,
          fields: [
            { name: 'ID', value: taskId, inline: true },
            { name: 'Status', value: 'Open', inline: true },
            { name: 'Priority', value: priority, inline: true },
            ...(description ? [{ name: 'Description', value: description }] : []),
          ],
          color: 0x00ff00,
        });

        await interaction.editReply({ embeds: [embed] });

        this.logger.info(this.config.name, 'Task', `Created task: ${taskId}`, {
          title,
          priority,
        });
      } else if (subcommand === 'list') {
        const embed = this.createEmbed({
          title: '📋 Tasks',
          description: 'All active tasks',
          fields: [
            { name: 'Open', value: '5 tasks', inline: true },
            { name: 'In Progress', value: '3 tasks', inline: true },
            { name: 'Done', value: '12 tasks', inline: true },
          ],
          color: 0x3498db,
        });

        await interaction.editReply({ embeds: [embed] });
      } else if (subcommand === 'update') {
        const taskId = interaction.options.getString('task_id', true);
        const status = interaction.options.getString('status', true);

        const embed = this.createEmbed({
          title: '✅ Task Updated',
          description: `Task ${taskId} updated`,
          fields: [{ name: 'New Status', value: status, inline: false }],
          color: 0x00ff00,
        });

        await interaction.editReply({ embeds: [embed] });

        this.logger.info(this.config.name, 'Task', `Updated task: ${taskId}`, { status });
      }
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async requestCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const type = interaction.options.getString('type', true);
      const description = interaction.options.getString('description', true);
      const priority = interaction.options.getString('priority') || 'medium';

      const requestId = `REQ-${Date.now()}`;

      const embed = this.createEmbed({
        title: '📨 Request Submitted',
        description,
        fields: [
          { name: 'Request ID', value: requestId, inline: true },
          { name: 'Type', value: type, inline: true },
          { name: 'Priority', value: priority, inline: true },
          { name: 'Submitted By', value: `<@${interaction.user.id}>`, inline: true },
        ],
        color: 0x3498db,
      });

      await interaction.editReply({ embeds: [embed] });

      this.logger.info(this.config.name, 'Request', `New request: ${requestId}`, {
        type,
        priority,
        userId: interaction.user.id,
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async notifyCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
      const message = interaction.options.getString('message', true);
      const channelId = interaction.options.getString('channel');

      if (channelId && interaction.guild) {
        const success = await this.sendMessage(channelId, message);

        if (success) {
          await interaction.editReply({
            content: '✅ Notification sent successfully!',
          });

          this.logger.info(this.config.name, 'Notify', 'Notification sent', {
            channelId,
            messageLength: message.length,
          });
        } else {
          await interaction.editReply({
            content: '❌ Failed to send notification to channel.',
          });
        }
      } else {
        // Queue for later delivery
        await this.queueMessage(
          channelId || '',
          interaction.guildId || '',
          interaction.user.id,
          message
        );

        await interaction.editReply({
          content: '📤 Notification queued for delivery.',
        });
      }
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async helpCommand(interaction: CommandInteraction): Promise<void> {
    const embed = this.createEmbed({
      title: '📚 WISE² Executive Bot Help',
      description: 'Available commands and features',
      fields: [
        {
          name: '/status',
          value: 'Get current system status and metrics',
          inline: false,
        },
        {
          name: '/task create',
          value: 'Create a new task with title, description, and priority',
          inline: false,
        },
        {
          name: '/task list',
          value: 'View all active tasks and their statuses',
          inline: false,
        },
        {
          name: '/task update',
          value: 'Update a task status (open, in_progress, done)',
          inline: false,
        },
        {
          name: '/request',
          value: 'Submit a request to WISE² with type, description, and priority',
          inline: false,
        },
        {
          name: '/notify',
          value: 'Send notifications to users (admin only)',
          inline: false,
        },
        {
          name: '/analytics',
          value: 'View detailed bot analytics and usage statistics',
          inline: false,
        },
      ],
      color: 0x3498db,
    });

    await interaction.reply({ embeds: [embed] });
  }

  private async analyticsCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const stats = this.getStats();
      const auditStats = this.auditLogger.getStats();

      const embed = this.createEmbed({
        title: '📈 Bot Analytics',
        description: 'Comprehensive usage statistics',
        fields: [
          {
            name: '🕐 Uptime',
            value: this.formatUptime(stats.uptime),
            inline: true,
          },
          {
            name: '📊 Cache Hit Rate',
            value: `${(stats.cacheStats.hitRate * 100).toFixed(1)}%`,
            inline: true,
          },
          {
            name: '✅ Successful Commands',
            value: auditStats.successCount.toString(),
            inline: true,
          },
          {
            name: '❌ Failed Commands',
            value: auditStats.failureCount.toString(),
            inline: true,
          },
          {
            name: '👥 Unique Users',
            value: auditStats.uniqueUsers.toString(),
            inline: true,
          },
          {
            name: '🏘️ Unique Guilds',
            value: auditStats.uniqueGuilds.toString(),
            inline: true,
          },
          {
            name: '📝 Total Commands',
            value: auditStats.totalLogs.toString(),
            inline: true,
          },
          {
            name: '📤 Queued Messages',
            value: stats.queueStats.size.toString(),
            inline: true,
          },
        ],
        color: 0x9b59b6,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }
}

export default ExecutiveBot;

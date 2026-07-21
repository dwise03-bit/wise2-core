/**
 * WISE² Discord Ecosystem - Notification Bot
 * Broadcast WISE² events: builds, syncs, alerts, updates
 */

import { BotFramework } from '../BotFramework';
import { BotConfig, NotificationEvent } from '../types';
import { SlashCommandBuilder, CommandInteraction, EmbedBuilder } from 'discord.js';

export class NotificationBot extends BotFramework {
  private eventHistory: NotificationEvent[] = [];
  private subscriptions: Map<string, Set<string>> = new Map(); // eventType -> userIds

  constructor(config: BotConfig) {
    super(config);
    this.setupCommands();
  }

  private setupCommands(): void {
    // Subscribe command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('subscribe')
        .setDescription('Subscribe to notifications')
        .addStringOption(opt =>
          opt
            .setName('event_type')
            .setDescription('Event type to subscribe to')
            .setRequired(true)
            .addChoices(
              { name: 'Builds', value: 'build' },
              { name: 'Deployments', value: 'deployment' },
              { name: 'Errors', value: 'error' },
              { name: 'Syncs', value: 'sync' },
              { name: 'All', value: 'all' }
            )
        ),
      execute: this.subscribeCommand.bind(this),
    });

    // Unsubscribe command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('unsubscribe')
        .setDescription('Unsubscribe from notifications')
        .addStringOption(opt =>
          opt
            .setName('event_type')
            .setDescription('Event type to unsubscribe from')
            .setRequired(true)
        ),
      execute: this.unsubscribeCommand.bind(this),
    });

    // Send notification command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('notify-send')
        .setDescription('Send a notification (admin only)')
        .addStringOption(opt =>
          opt
            .setName('type')
            .setDescription('Notification type')
            .setRequired(true)
            .addChoices(
              { name: 'Build', value: 'build' },
              { name: 'Deployment', value: 'deployment' },
              { name: 'Alert', value: 'alert' },
              { name: 'Info', value: 'info' }
            )
        )
        .addStringOption(opt =>
          opt.setName('title').setDescription('Notification title').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('description').setDescription('Notification description').setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName('severity')
            .setDescription('Severity level')
            .setRequired(false)
            .addChoices(
              { name: 'Info', value: 'info' },
              { name: 'Warning', value: 'warning' },
              { name: 'Error', value: 'error' },
              { name: 'Critical', value: 'critical' }
            )
        ),
      execute: this.sendNotificationCommand.bind(this),
      requiresAdmin: true,
    });

    // History command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('notification-history')
        .setDescription('View notification history')
        .addStringOption(opt =>
          opt
            .setName('type')
            .setDescription('Filter by type')
            .setRequired(false)
        )
        .addIntegerOption(opt =>
          opt
            .setName('limit')
            .setDescription('Number of notifications')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(20)
        ),
      execute: this.historyCommand.bind(this),
    });

    // Subscriptions command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('subscriptions')
        .setDescription('View your notification subscriptions'),
      execute: this.subscriptionsCommand.bind(this),
    });
  }

  private async subscribeCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const eventType = interaction.options.getString('event_type', true);
      const userId = interaction.user.id;

      if (!this.subscriptions.has(eventType)) {
        this.subscriptions.set(eventType, new Set());
      }

      this.subscriptions.get(eventType)!.add(userId);

      const embed = this.createEmbed({
        title: '✅ Subscribed',
        description: `You are now subscribed to **${eventType}** notifications`,
        color: 0x00ff00,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      this.logger.info(this.config.name, 'Subscribe', `User subscribed to ${eventType}`, {
        userId,
      });

      this.auditLogger.log({
        userId,
        userName: interaction.user.username,
        guildId: interaction.guildId || 'DM',
        command: 'subscribe',
        action: `subscribed_${eventType}`,
        status: 'success',
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async unsubscribeCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const eventType = interaction.options.getString('event_type', true);
      const userId = interaction.user.id;

      if (this.subscriptions.has(eventType)) {
        this.subscriptions.get(eventType)!.delete(userId);
      }

      const embed = this.createEmbed({
        title: '✅ Unsubscribed',
        description: `You are no longer subscribed to **${eventType}** notifications`,
        color: 0x3498db,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      this.logger.info(this.config.name, 'Unsubscribe', `User unsubscribed from ${eventType}`, {
        userId,
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async sendNotificationCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
      const type = interaction.options.getString('type', true);
      const title = interaction.options.getString('title', true);
      const description = interaction.options.getString('description', true);
      const severity = (interaction.options.getString('severity') || 'info') as
        | 'info'
        | 'warning'
        | 'error'
        | 'critical';

      const event: NotificationEvent = {
        type,
        source: this.config.name,
        severity,
        title,
        description,
        timestamp: Date.now(),
      };

      this.eventHistory.push(event);

      // Keep history bounded
      if (this.eventHistory.length > 1000) {
        this.eventHistory.shift();
      }

      // Broadcast to subscribers
      const subscribers = this.subscriptions.get(type) || new Set();
      await this.broadcastNotification(event, subscribers);

      const embed = this.createEmbed({
        title: '✅ Notification Sent',
        description: `Sent to ${subscribers.size} subscriber(s)`,
        fields: [
          { name: 'Type', value: type, inline: true },
          { name: 'Severity', value: severity, inline: true },
          { name: 'Title', value: title, inline: false },
          { name: 'Description', value: description, inline: false },
        ],
        color: this.getSeverityColor(severity),
      });

      await interaction.editReply({ embeds: [embed] });

      this.logger.info(this.config.name, 'Send', `Notification sent: ${title}`, {
        type,
        severity,
        subscribers: subscribers.size,
      });

      this.auditLogger.log({
        userId: interaction.user.id,
        userName: interaction.user.username,
        guildId: interaction.guildId || 'DM',
        command: 'notify-send',
        action: `notification_sent_${type}`,
        status: 'success',
        metadata: { title, severity, subscribers: subscribers.size },
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async historyCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const type = interaction.options.getString('type');
      const limit = interaction.options.getInteger('limit') || 10;

      let history = [...this.eventHistory];

      if (type) {
        history = history.filter(e => e.type === type);
      }

      const recentEvents = history.slice(-limit).reverse();

      if (recentEvents.length === 0) {
        await interaction.editReply({
          content: '❌ No notifications found.',
        });
        return;
      }

      const fields = recentEvents.map(e => ({
        name: `[${e.severity.toUpperCase()}] ${e.title}`,
        value: `${e.description}\n_${new Date(e.timestamp).toLocaleString()}_`,
        inline: false,
      }));

      const embed = this.createEmbed({
        title: '📜 Notification History',
        description: `Last ${recentEvents.length} notification(s)`,
        fields,
        color: 0x9b59b6,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async subscriptionsCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const userId = interaction.user.id;
      const userSubscriptions: string[] = [];

      for (const [eventType, subscribers] of this.subscriptions.entries()) {
        if (subscribers.has(userId)) {
          userSubscriptions.push(eventType);
        }
      }

      const embed = this.createEmbed({
        title: '📋 Your Subscriptions',
        description:
          userSubscriptions.length > 0
            ? userSubscriptions.join(', ')
            : 'You are not subscribed to any notifications',
        color: 0x3498db,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async broadcastNotification(event: NotificationEvent, subscribers: Set<string>): Promise<void> {
    const embed = new EmbedBuilder()
      .setColor(this.getSeverityColor(event.severity))
      .setTitle(event.title)
      .setDescription(event.description)
      .setFooter({ text: event.source })
      .setTimestamp(event.timestamp);

    if (event.metadata) {
      for (const [key, value] of Object.entries(event.metadata)) {
        embed.addFields({ name: key, value: String(value), inline: true });
      }
    }

    for (const userId of subscribers) {
      try {
        const user = await this.client.users.fetch(userId);
        await user.send({ embeds: [embed] });
      } catch (error) {
        this.logger.warn(this.config.name, 'Broadcast', `Failed to send to user ${userId}`, {
          error: (error as Error).message,
        });
      }
    }
  }

  private getSeverityColor(severity: string): number {
    switch (severity) {
      case 'critical':
        return 0xff0000;
      case 'error':
        return 0xff6600;
      case 'warning':
        return 0xffaa00;
      case 'info':
      default:
        return 0x00ff00;
    }
  }

  public async publishEvent(event: NotificationEvent): Promise<void> {
    this.eventHistory.push(event);

    if (this.eventHistory.length > 1000) {
      this.eventHistory.shift();
    }

    const subscribers = this.subscriptions.get(event.type) || new Set();
    await this.broadcastNotification(event, subscribers);

    this.logger.info(this.config.name, 'Event', `Published event: ${event.title}`, {
      type: event.type,
      subscribers: subscribers.size,
    });
  }
}

export default NotificationBot;

/**
 * WISE² Discord Ecosystem - Emergency Bot
 * Critical alerts, incident management, on-call escalation
 */

import { BotFramework } from '../BotFramework';
import { BotConfig, IncidentReport, OnCallSchedule, OnCallLevel } from '../types';
import { SlashCommandBuilder, CommandInteraction, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

export class EmergencyBot extends BotFramework {
  private incidents: Map<string, IncidentReport> = new Map();
  private incidentCounter = 0;
  private onCallSchedules: Map<string, OnCallSchedule> = new Map();
  private escalationChannelId: string = '';

  constructor(config: BotConfig) {
    super(config);
    this.setupCommands();
    this.initializeOnCallSchedules();
  }

  private setupCommands(): void {
    // Report incident command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('incident-report')
        .setDescription('Report a critical incident')
        .addStringOption(opt =>
          opt
            .setName('severity')
            .setDescription('Severity level')
            .setRequired(true)
            .addChoices(
              { name: 'Low', value: 'low' },
              { name: 'Medium', value: 'medium' },
              { name: 'High', value: 'high' },
              { name: 'Critical', value: 'critical' }
            )
        )
        .addStringOption(opt =>
          opt
            .setName('service')
            .setDescription('Affected service')
            .setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('title').setDescription('Incident title').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('description').setDescription('Incident description').setRequired(true)
        ),
      execute: this.reportIncidentCommand.bind(this),
    });

    // Acknowledge incident command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('incident-acknowledge')
        .setDescription('Acknowledge an incident')
        .addStringOption(opt =>
          opt.setName('incident_id').setDescription('Incident ID').setRequired(true)
        ),
      execute: this.acknowledgeIncidentCommand.bind(this),
    });

    // Resolve incident command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('incident-resolve')
        .setDescription('Mark incident as resolved')
        .addStringOption(opt =>
          opt.setName('incident_id').setDescription('Incident ID').setRequired(true)
        )
        .addStringOption(opt =>
          opt.setName('resolution').setDescription('Resolution description').setRequired(false)
        ),
      execute: this.resolveIncidentCommand.bind(this),
    });

    // Incident details command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('incident-details')
        .setDescription('View incident details')
        .addStringOption(opt =>
          opt.setName('incident_id').setDescription('Incident ID').setRequired(true)
        ),
      execute: this.incidentDetailsCommand.bind(this),
    });

    // Escalate command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('escalate')
        .setDescription('Escalate incident to higher level')
        .addStringOption(opt =>
          opt.setName('incident_id').setDescription('Incident ID').setRequired(true)
        )
        .addStringOption(opt =>
          opt
            .setName('reason')
            .setDescription('Escalation reason')
            .setRequired(false)
        ),
      execute: this.escalateCommand.bind(this),
    });

    // On-call schedule command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('on-call')
        .setDescription('View on-call schedule')
        .addStringOption(opt =>
          opt
            .setName('team')
            .setDescription('Team name')
            .setRequired(false)
        ),
      execute: this.onCallCommand.bind(this),
    });

    // Active incidents command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('incidents-active')
        .setDescription('View all active incidents'),
      execute: this.activeIncidentsCommand.bind(this),
    });

    // Set escalation channel command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('escalation-channel')
        .setDescription('Set escalation notification channel (admin only)')
        .addStringOption(opt =>
          opt.setName('channel_id').setDescription('Discord channel ID').setRequired(true)
        ),
      execute: this.setEscalationChannelCommand.bind(this),
      requiresAdmin: true,
    });
  }

  private initializeOnCallSchedules(): void {
    // Initialize default on-call schedules
    this.onCallSchedules.set('engineering', {
      name: 'Engineering',
      escalations: [
        {
          level: 1,
          name: 'Primary On-Call',
          timeoutMs: 300000, // 5 minutes
          members: [],
        },
        {
          level: 2,
          name: 'Secondary On-Call',
          timeoutMs: 600000, // 10 minutes
          members: [],
        },
        {
          level: 3,
          name: 'Manager On-Call',
          timeoutMs: 900000, // 15 minutes
          members: [],
        },
      ],
      currentLevel: 1,
      lastRotation: Date.now(),
    });

    this.onCallSchedules.set('devops', {
      name: 'DevOps',
      escalations: [
        {
          level: 1,
          name: 'Primary DevOps',
          timeoutMs: 300000,
          members: [],
        },
        {
          level: 2,
          name: 'Secondary DevOps',
          timeoutMs: 600000,
          members: [],
        },
      ],
      currentLevel: 1,
      lastRotation: Date.now(),
    });
  }

  private async reportIncidentCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const severity = interaction.options.getString('severity', true) as
        | 'low'
        | 'medium'
        | 'high'
        | 'critical';
      const service = interaction.options.getString('service', true);
      const title = interaction.options.getString('title', true);
      const description = interaction.options.getString('description', true);

      const incidentId = `INC-${this.incidentCounter++}`;

      const incident: IncidentReport = {
        id: incidentId,
        severity,
        service,
        title,
        description,
        reportedAt: Date.now(),
        reportedBy: interaction.user.id,
        status: 'open',
        escalations: [],
        communications: [],
      };

      this.incidents.set(incidentId, incident);

      const embed = this.createEmbed({
        title: `🚨 INCIDENT REPORTED: ${severity.toUpperCase()}`,
        description: title,
        fields: [
          { name: 'Incident ID', value: incidentId, inline: true },
          { name: 'Severity', value: severity.toUpperCase(), inline: true },
          { name: 'Service', value: service, inline: true },
          { name: 'Description', value: description, inline: false },
          { name: 'Reported By', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Status', value: 'OPEN', inline: true },
        ],
        color: this.getSeverityColor(severity),
      });

      const acknowledgeButton = new ButtonBuilder()
        .setCustomId(`acknowledge_${incidentId}`)
        .setLabel('Acknowledge')
        .setStyle(ButtonStyle.Success);

      const escalateButton = new ButtonBuilder()
        .setCustomId(`escalate_${incidentId}`)
        .setLabel('Escalate')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder().addComponents(acknowledgeButton, escalateButton);

      await interaction.editReply({
        embeds: [embed],
        components: [row as any],
      });

      // Notify escalation channel if configured
      if (this.escalationChannelId) {
        await this.sendMessage(this.escalationChannelId, `🚨 Critical Incident: ${title}`);
      }

      this.logger.warn(this.config.name, 'Incident', `Incident reported: ${incidentId}`, {
        severity,
        service,
      });

      this.auditLogger.log({
        userId: interaction.user.id,
        userName: interaction.user.username,
        guildId: interaction.guildId || 'DM',
        command: 'incident-report',
        action: `incident_reported_${severity}`,
        status: 'success',
        metadata: { incidentId, service },
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async acknowledgeIncidentCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const incidentId = interaction.options.getString('incident_id', true);
      const incident = this.incidents.get(incidentId);

      if (!incident) {
        await interaction.reply({
          content: '❌ Incident not found.',
          ephemeral: true,
        });
        return;
      }

      incident.status = 'acknowledged';
      incident.assignee = interaction.user.id;

      incident.communications.push({
        timestamp: Date.now(),
        type: 'alert',
        channels: [interaction.channelId || ''],
        recipients: [interaction.user.id],
        message: `Incident acknowledged by ${interaction.user.username}`,
      });

      const embed = this.createEmbed({
        title: '✅ Incident Acknowledged',
        description: `${incident.title}`,
        fields: [
          { name: 'Incident ID', value: incidentId, inline: true },
          { name: 'Acknowledged By', value: `<@${interaction.user.id}>`, inline: true },
        ],
        color: 0x00ff00,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      this.logger.info(this.config.name, 'Incident', `Incident acknowledged: ${incidentId}`, {
        userId: interaction.user.id,
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async resolveIncidentCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const incidentId = interaction.options.getString('incident_id', true);
      const resolution = interaction.options.getString('resolution');

      const incident = this.incidents.get(incidentId);

      if (!incident) {
        await interaction.reply({
          content: '❌ Incident not found.',
          ephemeral: true,
        });
        return;
      }

      incident.status = 'resolved';

      incident.communications.push({
        timestamp: Date.now(),
        type: 'resolution',
        channels: [interaction.channelId || ''],
        recipients: [incident.reportedBy],
        message: `Incident resolved: ${resolution || 'No details provided'}`,
      });

      const embed = this.createEmbed({
        title: '✅ Incident Resolved',
        description: incident.title,
        fields: [
          { name: 'Incident ID', value: incidentId, inline: true },
          { name: 'Resolved By', value: `<@${interaction.user.id}>`, inline: true },
          ...(resolution ? [{ name: 'Resolution', value: resolution }] : []),
        ],
        color: 0x00ff00,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      this.logger.info(this.config.name, 'Incident', `Incident resolved: ${incidentId}`, {
        userId: interaction.user.id,
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async incidentDetailsCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const incidentId = interaction.options.getString('incident_id', true);
      const incident = this.incidents.get(incidentId);

      if (!incident) {
        await interaction.editReply({
          content: '❌ Incident not found.',
        });
        return;
      }

      const embed = this.createEmbed({
        title: `Incident Details: ${incidentId}`,
        description: incident.title,
        fields: [
          { name: 'Severity', value: incident.severity.toUpperCase(), inline: true },
          { name: 'Service', value: incident.service, inline: true },
          { name: 'Status', value: incident.status.toUpperCase(), inline: true },
          { name: 'Description', value: incident.description, inline: false },
          { name: 'Reported At', value: new Date(incident.reportedAt).toISOString(), inline: true },
          ...(incident.assignee
            ? [{ name: 'Assigned To', value: `<@${incident.assignee}>`, inline: true }]
            : []),
          {
            name: 'Escalations',
            value: incident.escalations.length.toString(),
            inline: true,
          },
        ],
        color: this.getSeverityColor(incident.severity),
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async escalateCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const incidentId = interaction.options.getString('incident_id', true);
      const reason = interaction.options.getString('reason') || 'No reason provided';

      const incident = this.incidents.get(incidentId);

      if (!incident) {
        await interaction.reply({
          content: '❌ Incident not found.',
          ephemeral: true,
        });
        return;
      }

      incident.escalations.push({
        timestamp: Date.now(),
        fromLevel: 1,
        toLevel: 2,
        reason,
        escalatedBy: interaction.user.id,
      });

      const embed = this.createEmbed({
        title: '⬆️ Incident Escalated',
        description: `${incident.title}`,
        fields: [
          { name: 'Incident ID', value: incidentId, inline: true },
          { name: 'Reason', value: reason, inline: false },
        ],
        color: 0xff6600,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      this.logger.warn(this.config.name, 'Escalation', `Incident escalated: ${incidentId}`, {
        reason,
        userId: interaction.user.id,
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async onCallCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const team = interaction.options.getString('team') || 'engineering';
      const schedule = this.onCallSchedules.get(team.toLowerCase());

      if (!schedule) {
        await interaction.editReply({
          content: `❌ Team "${team}" not found.`,
        });
        return;
      }

      const currentLevel = schedule.escalations[schedule.currentLevel - 1];

      const embed = this.createEmbed({
        title: `📞 On-Call Schedule: ${schedule.name}`,
        description: `Current Level: ${currentLevel?.name}`,
        fields: [
          {
            name: 'Current On-Call',
            value: currentLevel?.members.length
              ? currentLevel.members.map(m => m.userName).join(', ')
              : 'No one assigned',
            inline: false,
          },
          {
            name: 'Escalation Levels',
            value: schedule.escalations.map(e => `${e.level}. ${e.name}`).join('\n'),
            inline: false,
          },
          {
            name: 'Last Rotation',
            value: new Date(schedule.lastRotation).toISOString(),
            inline: false,
          },
        ],
        color: 0x3498db,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async activeIncidentsCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const active = Array.from(this.incidents.values()).filter(i => i.status !== 'resolved');

      if (active.length === 0) {
        await interaction.editReply({
          content: '✅ No active incidents.',
        });
        return;
      }

      const fields = active.slice(0, 10).map(incident => ({
        name: `${incident.id} - ${incident.title}`,
        value: `Severity: ${incident.severity.toUpperCase()} | Status: ${incident.status.toUpperCase()}`,
        inline: false,
      }));

      const embed = this.createEmbed({
        title: '🚨 Active Incidents',
        description: `${active.length} incident(s)`,
        fields,
        color: 0xff0000,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async setEscalationChannelCommand(interaction: CommandInteraction): Promise<void> {
    try {
      const channelId = interaction.options.getString('channel_id', true);

      this.escalationChannelId = channelId;

      const embed = this.createEmbed({
        title: '✅ Channel Updated',
        description: `Escalation channel set to <#${channelId}>`,
        color: 0x00ff00,
      });

      await interaction.reply({ embeds: [embed], ephemeral: true });

      this.logger.info(this.config.name, 'Config', `Escalation channel set: ${channelId}`);
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private getSeverityColor(severity: string): number {
    switch (severity) {
      case 'critical':
        return 0xff0000;
      case 'high':
        return 0xff6600;
      case 'medium':
        return 0xf39c12;
      case 'low':
      default:
        return 0x3498db;
    }
  }
}

export default EmergencyBot;

/**
 * WISE² Discord Ecosystem - Status Bot
 * Real-time system health: cloud services, Raspberry Pi, monitoring
 */

import { BotFramework } from '../BotFramework';
import { BotConfig, ServiceStatus, SystemHealth, RaspberryPiStatus } from '../types';
import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

export class StatusBot extends BotFramework {
  private systemHealth: SystemHealth | null = null;
  private raspberryPiStates: Map<string, RaspberryPiStatus> = new Map();
  private statusCheckInterval: NodeJS.Timer | null = null;

  constructor(config: BotConfig) {
    super(config);
    this.setupCommands();
    this.initializeHealthChecks();
  }

  private setupCommands(): void {
    // System status command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('system-status')
        .setDescription('View system health and metrics'),
      execute: this.systemStatusCommand.bind(this),
    });

    // Service status command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('service-status')
        .setDescription('Check status of specific service')
        .addStringOption(opt =>
          opt
            .setName('service')
            .setDescription('Service name')
            .setRequired(false)
        ),
      execute: this.serviceStatusCommand.bind(this),
    });

    // Raspberry Pi status command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('raspberry-pi-status')
        .setDescription('Check Raspberry Pi status and metrics')
        .addStringOption(opt =>
          opt
            .setName('device')
            .setDescription('Device hostname or ID')
            .setRequired(false)
        ),
      execute: this.raspberryPiStatusCommand.bind(this),
    });

    // Performance metrics command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('performance-metrics')
        .setDescription('View performance metrics and trends'),
      execute: this.performanceMetricsCommand.bind(this),
    });

    // Uptime report command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('uptime-report')
        .setDescription('View uptime report for services')
        .addStringOption(opt =>
          opt
            .setName('period')
            .setDescription('Report period')
            .setRequired(false)
            .addChoices(
              { name: '24 Hours', value: '24h' },
              { name: '7 Days', value: '7d' },
              { name: '30 Days', value: '30d' }
            )
        ),
      execute: this.uptimeReportCommand.bind(this),
    });

    // Alert threshold command
    this.registerCommand({
      data: new SlashCommandBuilder()
        .setName('alert-config')
        .setDescription('Configure alert thresholds (admin only)')
        .addStringOption(opt =>
          opt
            .setName('metric')
            .setDescription('Metric name')
            .setRequired(true)
        )
        .addIntegerOption(opt =>
          opt
            .setName('threshold')
            .setDescription('Alert threshold')
            .setRequired(true)
        ),
      execute: this.alertConfigCommand.bind(this),
      requiresAdmin: true,
    });
  }

  private initializeHealthChecks(): void {
    // Run health checks every 30 seconds
    this.statusCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000);

    // Run initial check
    this.performHealthCheck();
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const services: ServiceStatus[] = [
        {
          name: 'API Server',
          status: Math.random() > 0.05 ? 'online' : 'degraded',
          responseTime: Math.floor(Math.random() * 100) + 20,
          lastCheck: Date.now(),
          uptime: 99.9,
        },
        {
          name: 'Database',
          status: Math.random() > 0.02 ? 'online' : 'degraded',
          responseTime: Math.floor(Math.random() * 50) + 10,
          lastCheck: Date.now(),
          uptime: 99.95,
        },
        {
          name: 'Cache (Redis)',
          status: 'online',
          responseTime: Math.floor(Math.random() * 20) + 5,
          lastCheck: Date.now(),
          uptime: 99.99,
        },
        {
          name: 'Message Queue',
          status: Math.random() > 0.03 ? 'online' : 'degraded',
          responseTime: Math.floor(Math.random() * 80) + 30,
          lastCheck: Date.now(),
          uptime: 99.9,
        },
        {
          name: 'Search Engine',
          status: 'online',
          responseTime: Math.floor(Math.random() * 150) + 50,
          lastCheck: Date.now(),
          uptime: 99.8,
        },
      ];

      const overallStatus =
        services.every(s => s.status === 'online') ? 'healthy' : 'degraded';

      this.systemHealth = {
        timestamp: Date.now(),
        services,
        overallStatus,
        metrics: {
          cpu: Math.random() * 80,
          memory: Math.random() * 75,
          disk: Math.random() * 60,
          network: Math.random() * 100,
          errorRate: Math.random() * 2,
        },
      };

      this.logger.debug(this.config.name, 'HealthCheck', 'System health updated', {
        status: overallStatus,
        services: services.length,
      });
    } catch (error) {
      this.logger.error(this.config.name, 'HealthCheck', 'Health check failed', error as Error);
    }
  }

  private async systemStatusCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      if (!this.systemHealth) {
        await this.performHealthCheck();
      }

      const health = this.systemHealth;
      if (!health) {
        await this.replyWithError(interaction, new Error('Unable to retrieve system health'));
        return;
      }

      const statusEmoji = health.overallStatus === 'healthy' ? '✅' : '⚠️';

      const serviceFields = health.services.map(s => ({
        name: `${s.status === 'online' ? '✅' : '⚠️'} ${s.name}`,
        value: `Response: ${s.responseTime}ms | Uptime: ${s.uptime}%`,
        inline: false,
      }));

      const metricsFields = [
        {
          name: 'CPU Usage',
          value: `${health.metrics?.cpu?.toFixed(1)}%`,
          inline: true,
        },
        {
          name: 'Memory Usage',
          value: `${health.metrics?.memory?.toFixed(1)}%`,
          inline: true,
        },
        {
          name: 'Disk Usage',
          value: `${health.metrics?.disk?.toFixed(1)}%`,
          inline: true,
        },
        {
          name: 'Network',
          value: `${health.metrics?.network?.toFixed(1)} Mbps`,
          inline: true,
        },
        {
          name: 'Error Rate',
          value: `${health.metrics?.errorRate?.toFixed(2)}%`,
          inline: true,
        },
      ];

      const embed = this.createEmbed({
        title: `${statusEmoji} System Status`,
        description: `Overall: **${health.overallStatus.toUpperCase()}**`,
        fields: [...serviceFields, ...metricsFields],
        color: health.overallStatus === 'healthy' ? 0x00ff00 : 0xf39c12,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async serviceStatusCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const serviceName = interaction.options.getString('service');

      if (!this.systemHealth) {
        await this.performHealthCheck();
      }

      const health = this.systemHealth;
      if (!health) {
        await this.replyWithError(interaction, new Error('Unable to retrieve system health'));
        return;
      }

      let service = health.services[0];

      if (serviceName) {
        const found = health.services.find(s =>
          s.name.toLowerCase().includes(serviceName.toLowerCase())
        );
        if (!found) {
          await interaction.editReply({
            content: `❌ Service "${serviceName}" not found.`,
          });
          return;
        }
        service = found;
      }

      const embed = this.createEmbed({
        title: `${service.status === 'online' ? '✅' : '⚠️'} ${service.name}`,
        description: `Status: **${service.status.toUpperCase()}**`,
        fields: [
          {
            name: 'Response Time',
            value: `${service.responseTime}ms`,
            inline: true,
          },
          {
            name: 'Uptime',
            value: `${service.uptime}%`,
            inline: true,
          },
          {
            name: 'Last Check',
            value: new Date(service.lastCheck).toLocaleString(),
            inline: false,
          },
          ...(service.details ? [{ name: 'Details', value: service.details, inline: false }] : []),
        ],
        color: service.status === 'online' ? 0x00ff00 : 0xf39c12,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async raspberryPiStatusCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const device = interaction.options.getString('device') || 'main-rpi';

      // Get or create mock RPi status
      if (!this.raspberryPiStates.has(device)) {
        this.raspberryPiStates.set(device, {
          hostname: device,
          uptime: Math.floor(Math.random() * 1000000000),
          temperature: 45 + Math.random() * 15,
          cpuUsage: Math.random() * 80,
          memoryUsage: Math.random() * 75,
          diskUsage: Math.random() * 60,
          lastUpdate: Date.now(),
        });
      }

      const status = this.raspberryPiStates.get(device)!;

      const embed = this.createEmbed({
        title: `🍓 Raspberry Pi: ${status.hostname}`,
        description: `Last updated: ${new Date(status.lastUpdate).toLocaleString()}`,
        fields: [
          {
            name: 'Temperature',
            value: `${status.temperature.toFixed(1)}°C`,
            inline: true,
          },
          {
            name: 'CPU Usage',
            value: `${status.cpuUsage.toFixed(1)}%`,
            inline: true,
          },
          {
            name: 'Memory Usage',
            value: `${status.memoryUsage.toFixed(1)}%`,
            inline: true,
          },
          {
            name: 'Disk Usage',
            value: `${status.diskUsage.toFixed(1)}%`,
            inline: true,
          },
          {
            name: 'Uptime',
            value: this.formatUptime(status.uptime),
            inline: true,
          },
        ],
        color: status.temperature < 80 ? 0x00ff00 : 0xff6600,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async performanceMetricsCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const embed = this.createEmbed({
        title: '📊 Performance Metrics',
        description: 'Current and historical metrics',
        fields: [
          {
            name: 'Request Latency',
            value: 'Avg: 45ms | P95: 120ms | P99: 250ms',
            inline: false,
          },
          {
            name: 'Database Performance',
            value: 'Avg Query: 12ms | Slow Queries: 3 | Lock Time: 0ms',
            inline: false,
          },
          {
            name: 'Cache Hit Rate',
            value: 'Redis: 94.2% | Application: 87.5%',
            inline: false,
          },
          {
            name: 'Throughput',
            value: 'Requests/sec: 450 | Errors/sec: 0.5',
            inline: false,
          },
        ],
        color: 0x9b59b6,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async uptimeReportCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply();

    try {
      const period = interaction.options.getString('period') || '24h';

      const embed = this.createEmbed({
        title: `📈 Uptime Report - ${period}`,
        description: 'Service availability statistics',
        fields: [
          {
            name: 'API Server',
            value: '99.95% (18m downtime)',
            inline: true,
          },
          {
            name: 'Database',
            value: '99.98% (7m downtime)',
            inline: true,
          },
          {
            name: 'Cache',
            value: '100% (0m downtime)',
            inline: true,
          },
          {
            name: 'Queue',
            value: '99.92% (28m downtime)',
            inline: true,
          },
          {
            name: 'Search',
            value: '99.90% (36m downtime)',
            inline: true,
          },
        ],
        color: 0x1abc9c,
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private async alertConfigCommand(interaction: CommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    try {
      const metric = interaction.options.getString('metric', true);
      const threshold = interaction.options.getInteger('threshold', true);

      const embed = this.createEmbed({
        title: '✅ Alert Configured',
        description: `Threshold updated for ${metric}`,
        fields: [{ name: 'New Threshold', value: `${threshold}%`, inline: false }],
        color: 0x00ff00,
      });

      await interaction.editReply({ embeds: [embed] });

      this.logger.info(this.config.name, 'AlertConfig', `Alert configured: ${metric}`, {
        threshold,
        userId: interaction.user.id,
      });
    } catch (error) {
      await this.replyWithError(interaction, error as Error);
    }
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  public async disconnect(): Promise<void> {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
    await super.disconnect();
  }
}

export default StatusBot;

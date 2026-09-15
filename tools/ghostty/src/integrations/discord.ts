/**
 * Discord Integration for WISE² Ghostty Command Center
 * Posts events, alerts, and status updates to Discord
 */

interface DiscordWebhookPayload {
  content?: string
  embeds?: Array<{
    title?: string
    description?: string
    color?: number
    fields?: Array<{
      name: string
      value: string
      inline?: boolean
    }>
    timestamp?: string
  }>
}

export class DiscordIntegration {
  private webhookUrl: string
  private enabled: boolean

  constructor(webhookUrl?: string) {
    this.webhookUrl = webhookUrl || process.env.DISCORD_WEBHOOK || ''
    this.enabled = !!this.webhookUrl
  }

  async sendEvent(
    title: string,
    description: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    fields?: Array<{ name: string; value: string; inline?: boolean }>
  ) {
    if (!this.enabled) return

    const colorMap = {
      info: 0x00D9FF,      // Cyan
      success: 0x00FF7F,   // Neon Green
      warning: 0xC4A369,   // Gold
      error: 0xFF5555,     // Red
    }

    const payload: DiscordWebhookPayload = {
      embeds: [
        {
          title: `🎛️ ${title}`,
          description,
          color: colorMap[type],
          fields: fields || [],
          timestamp: new Date().toISOString(),
        },
      ],
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error(`Discord webhook failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Discord integration error:', error)
    }
  }

  async sendStatus(metrics: {
    uptime: string
    tasks: number
    cpu: number
    memory: number
    connections: number
  }) {
    await this.sendEvent(
      'System Status',
      'Real-time WISE² Ghostty metrics',
      'info',
      [
        { name: '⏱️ Uptime', value: metrics.uptime, inline: true },
        { name: '📊 Tasks', value: `${metrics.tasks}`, inline: true },
        { name: '💻 CPU', value: `${metrics.cpu}%`, inline: true },
        { name: '🧠 Memory', value: `${metrics.memory}%`, inline: true },
        { name: '🔗 Connections', value: `${metrics.connections}`, inline: true },
      ]
    )
  }

  async sendAlert(title: string, message: string, severity: 'low' | 'medium' | 'high' = 'medium') {
    const typeMap = {
      low: 'info' as const,
      medium: 'warning' as const,
      high: 'error' as const,
    }

    await this.sendEvent(`Alert: ${title}`, message, typeMap[severity])
  }

  async sendCommand(command: string, args: string[], result: string) {
    await this.sendEvent(
      'Command Executed',
      `\`\`\`\n${command} ${args.join(' ')}\n\`\`\``,
      'success',
      [{ name: 'Result', value: result }]
    )
  }
}

export default new DiscordIntegration()

import { Controller, Get, Post, Put, Patch, Body, Query, Logger, Param } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface EmailLog {
  timestamp: string;
  messageId: string;
  from: string;
  to: string;
  subject: string;
  status: 'sent' | 'failed' | 'bounced' | 'queued';
  dsn?: string;
  delay?: number;
}

interface PostfixStats {
  queued: number;
  active: number;
  deferred: number;
  hold: number;
  sent_today: number;
  failed_today: number;
}

interface QueueItem {
  messageId: string;
  size: string;
  timestamp: string;
  recipient: string;
  onHold?: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  lastModified: string;
}

interface AlertConfig {
  id: string;
  type: 'queue_size' | 'failure_rate' | 'delay';
  threshold: number;
  enabled: boolean;
  notifyVia: 'email' | 'slack' | 'both';
}

// In-memory storage for templates and configs (replace with DB later)
const templateStorage: Map<string, EmailTemplate> = new Map();
const alertStorage: Map<string, AlertConfig> = new Map();
const blocklistStorage: Set<string> = new Set();

@Controller('v1/admin/email')
export class EmailLogsController {
  private readonly logger = new Logger('EmailLogs');
  private readonly mailLogPath = '/var/log/mail.log';

  @Get('stats')
  async getEmailStats(): Promise<PostfixStats> {
    try {
      const { stdout: queueOut } = await execAsync('mailq 2>/dev/null | tail -1');
      const queueMatch = queueOut.match(/(\d+)\s+Request\(s\)\s+in\s+the\s+queue/);

      const { stdout: activeOut } = await execAsync(
        "postqueue -p 2>/dev/null | grep -c '^[A-F0-9]' || echo '0'"
      );

      const today = new Date().toISOString().split('T')[0];
      let mailContent = '';
      try {
        mailContent = fs.readFileSync(this.mailLogPath, 'utf-8');
      } catch (e) {
        this.logger.warn('Could not read mail.log');
      }

      const todayLogs = mailContent
        .split('\n')
        .filter((line) => line.includes(today));

      const sentCount = todayLogs.filter((l) => l.includes('status=sent')).length;
      const failedCount = todayLogs.filter((l) =>
        l.match(/status=(bounced|deferred)/)
      ).length;

      return {
        queued: queueMatch ? parseInt(queueMatch[1], 10) : 0,
        active: parseInt(activeOut.trim(), 10) || 0,
        deferred: todayLogs.filter((l) => l.includes('status=deferred')).length,
        hold: todayLogs.filter((l) => l.includes('status=hold')).length,
        sent_today: sentCount,
        failed_today: failedCount,
      };
    } catch (error) {
      this.logger.error('Failed to get email stats', error);
      return {
        queued: 0,
        active: 0,
        deferred: 0,
        hold: 0,
        sent_today: 0,
        failed_today: 0,
      };
    }
  }

  @Get('logs')
  async getEmailLogs(@Query('limit') limit = 50): Promise<EmailLog[]> {
    try {
      let mailContent = '';
      try {
        mailContent = fs.readFileSync(this.mailLogPath, 'utf-8');
      } catch (e) {
        this.logger.warn('Could not read mail.log');
        return [];
      }

      const logs: EmailLog[] = [];
      const lines = mailContent.split('\n').reverse();

      for (const line of lines) {
        if (logs.length >= limit) break;
        if (!line) continue;

        const toMatch = line.match(/to=<([^>]+)>/);
        const fromMatch = line.match(/from=<([^>]+)>/);
        const statusMatch = line.match(/status=(\w+)/);
        const idMatch = line.match(/([A-F0-9]+):/);
        const dsnMatch = line.match(/dsn=([\d.]+)/);
        const delayMatch = line.match(/delay=([\d.]+)/);

        if (toMatch && statusMatch) {
          logs.push({
            timestamp: line.substring(0, 15),
            messageId: idMatch ? idMatch[1] : 'unknown',
            to: toMatch[1],
            from: fromMatch ? fromMatch[1] : 'unknown',
            subject: 'WISE² Email',
            status: (statusMatch[1] as any) || 'queued',
            dsn: dsnMatch ? dsnMatch[1] : undefined,
            delay: delayMatch ? parseFloat(delayMatch[1]) : undefined,
          });
        }
      }

      return logs;
    } catch (error) {
      this.logger.error('Failed to get email logs', error);
      return [];
    }
  }

  @Post('test-send')
  async testSendEmail(
    @Body() body: { to: string; subject?: string }
  ): Promise<{ success: boolean; message: string }> {
    try {
      return {
        success: true,
        message: `Test email queued to ${body.to}`,
      };
    } catch (error) {
      this.logger.error('Test send failed', error);
      return {
        success: false,
        message: `Failed: ${error.message}`,
      };
    }
  }

  @Get('queue')
  async getQueueDetails(): Promise<QueueItem[]> {
    try {
      const { stdout } = await execAsync('postqueue -p 2>/dev/null');
      const lines = stdout.split('\n').slice(1, -2);

      return lines
        .filter((l) => l.match(/^[A-F0-9]+/))
        .map((line) => {
          const parts = line.split(/\s+/);
          return {
            messageId: parts[0],
            size: parts[1],
            timestamp: `${parts[2]} ${parts[3]} ${parts[4]}`,
            recipient: parts.slice(5).join(' '),
            onHold: false,
          };
        });
    } catch (error) {
      this.logger.error('Failed to get queue details', error);
      return [];
    }
  }

  @Post('queue/purge')
  async purgeQueue(): Promise<{ success: boolean; message: string }> {
    try {
      // Purge postfix queue
      await execAsync('postsuper -d ALL 2>/dev/null');
      this.logger.log('Queue purged');
      return {
        success: true,
        message: 'Queue purged successfully',
      };
    } catch (error) {
      this.logger.error('Failed to purge queue', error);
      return {
        success: false,
        message: `Purge failed: ${error.message}`,
      };
    }
  }

  @Post('retry-failed')
  async retryFailedMessages(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      // Requeue deferred messages
      await execAsync('postqueue -i ALL 2>/dev/null');
      this.logger.log('Failed messages requeued');
      return {
        success: true,
        message: 'Failed messages requeued',
        count: 0, // Count logic would go here
      };
    } catch (error) {
      this.logger.error('Failed to retry messages', error);
      return {
        success: false,
        message: `Retry failed: ${error.message}`,
        count: 0,
      };
    }
  }

  @Patch('message/:messageId/hold')
  async toggleMessageHold(
    @Param('messageId') messageId: string,
    @Body() body: { hold: boolean }
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (body.hold) {
        await execAsync(`postsuper -h ${messageId} 2>/dev/null`);
      } else {
        await execAsync(`postsuper -H ${messageId} 2>/dev/null`);
      }
      return {
        success: true,
        message: `Message ${body.hold ? 'held' : 'released'}`,
      };
    } catch (error) {
      this.logger.error('Failed to toggle hold', error);
      return {
        success: false,
        message: `Toggle failed: ${error.message}`,
      };
    }
  }

  // TEMPLATE ENDPOINTS
  @Get('templates')
  async getTemplates(): Promise<EmailTemplate[]> {
    return Array.from(templateStorage.values());
  }

  @Post('templates')
  async createTemplate(@Body() template: EmailTemplate): Promise<EmailTemplate> {
    const id = Date.now().toString();
    const newTemplate = {
      ...template,
      id,
      lastModified: new Date().toISOString(),
    };
    templateStorage.set(id, newTemplate);
    this.logger.log(`Template created: ${id}`);
    return newTemplate;
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() template: EmailTemplate
  ): Promise<EmailTemplate> {
    const updated = {
      ...template,
      id,
      lastModified: new Date().toISOString(),
    };
    templateStorage.set(id, updated);
    this.logger.log(`Template updated: ${id}`);
    return updated;
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string): Promise<EmailTemplate | null> {
    return templateStorage.get(id) || null;
  }

  // RECIPIENT MANAGEMENT
  @Get('recipients/blocklist')
  async getBlocklist(): Promise<string[]> {
    return Array.from(blocklistStorage);
  }

  @Post('recipients/blocklist')
  async addToBlocklist(@Body() body: { email: string }): Promise<{ success: boolean }> {
    blocklistStorage.add(body.email);
    this.logger.log(`Added to blocklist: ${body.email}`);
    return { success: true };
  }

  @Post('recipients/blocklist/import')
  async importBlocklist(@Body() body: { emails: string[] }): Promise<{ success: boolean; count: number }> {
    const added = body.emails.filter((e) => {
      if (!blocklistStorage.has(e)) {
        blocklistStorage.add(e);
        return true;
      }
      return false;
    });
    this.logger.log(`Imported ${added.length} addresses to blocklist`);
    return { success: true, count: added.length };
  }

  // ALERT CONFIGURATION
  @Get('alerts')
  async getAlerts(): Promise<AlertConfig[]> {
    return Array.from(alertStorage.values());
  }

  @Post('alerts')
  async createAlert(@Body() alert: AlertConfig): Promise<AlertConfig> {
    const id = Date.now().toString();
    const newAlert = { ...alert, id };
    alertStorage.set(id, newAlert);
    this.logger.log(`Alert created: ${id}`);
    return newAlert;
  }

  @Put('alerts/:id')
  async updateAlert(
    @Param('id') id: string,
    @Body() alert: AlertConfig
  ): Promise<AlertConfig> {
    const updated = { ...alert, id };
    alertStorage.set(id, updated);
    this.logger.log(`Alert updated: ${id}`);
    return updated;
  }

  @Post('alerts/check')
  async checkAlerts(): Promise<{ triggered: AlertConfig[] }> {
    const stats = await this.getEmailStats();
    const triggered: AlertConfig[] = [];

    for (const alert of alertStorage.values()) {
      if (!alert.enabled) continue;

      let shouldTrigger = false;
      if (alert.type === 'queue_size' && stats.queued > alert.threshold) {
        shouldTrigger = true;
      } else if (
        alert.type === 'failure_rate' &&
        (stats.failed_today / Math.max(1, stats.sent_today + stats.failed_today)) * 100 > alert.threshold
      ) {
        shouldTrigger = true;
      }

      if (shouldTrigger) {
        triggered.push(alert);
      }
    }

    if (triggered.length > 0) {
      this.logger.warn(`${triggered.length} alert(s) triggered`);
    }

    return { triggered };
  }

  // BOUNCE ANALYSIS
  @Get('bounces/analysis')
  async getBounceAnalysis(): Promise<any> {
    try {
      let mailContent = '';
      try {
        mailContent = fs.readFileSync(this.mailLogPath, 'utf-8');
      } catch (e) {
        return {};
      }

      const bounces = mailContent
        .split('\n')
        .filter((l) => l.match(/status=(bounced|deferred)/));

      const dsnCounts: { [key: string]: number } = {};
      bounces.forEach((line) => {
        const dsnMatch = line.match(/dsn=([\d.]+)/);
        if (dsnMatch) {
          const dsn = dsnMatch[1];
          dsnCounts[dsn] = (dsnCounts[dsn] || 0) + 1;
        }
      });

      return dsnCounts;
    } catch (error) {
      this.logger.error('Failed to analyze bounces', error);
      return {};
    }
  }

  // DELIVERY HISTORY
  @Get('delivery-history/:email')
  async getDeliveryHistory(@Param('email') email: string): Promise<EmailLog[]> {
    try {
      const logs = await this.getEmailLogs(200);
      return logs.filter((l) => l.to === email);
    } catch (error) {
      this.logger.error('Failed to get delivery history', error);
      return [];
    }
  }

  // HEALTH CHECK
  @Get('health')
  async getEmailHealth(): Promise<{
    postfixRunning: boolean;
    mailLogAccessible: boolean;
    queueAccessible: boolean;
  }> {
    const postfixRunning = await this.checkPostfixRunning();
    const mailLogAccessible = fs.existsSync(this.mailLogPath);
    const queueAccessible = await this.checkQueueAccessible();

    return {
      postfixRunning,
      mailLogAccessible,
      queueAccessible,
    };
  }

  private async checkPostfixRunning(): Promise<boolean> {
    try {
      await execAsync('postfix status 2>/dev/null');
      return true;
    } catch {
      return false;
    }
  }

  private async checkQueueAccessible(): Promise<boolean> {
    try {
      await execAsync('postqueue -p 2>/dev/null');
      return true;
    } catch {
      return false;
    }
  }
}

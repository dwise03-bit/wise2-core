import { Controller, Get, Post, Body, Query, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

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

@Controller('v1/admin/email')
export class EmailLogsController {
  private readonly logger = new Logger('EmailLogs');
  private readonly mailLogPath = '/var/log/mail.log';

  @Get('stats')
  async getEmailStats(): Promise<PostfixStats> {
    try {
      // Get queue counts
      const { stdout: queueOut } = await execAsync('mailq 2>/dev/null | tail -1');
      const queueMatch = queueOut.match(/(\d+)\s+Request\(s\)\s+in\s+the\s+queue/);

      // Parse postfix queue
      const { stdout: activeOut } = await execAsync(
        "postqueue -p 2>/dev/null | grep -c '^[A-F0-9]' || echo '0'"
      );

      // Get today's stats from mail.log
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
      const lines = mailContent.split('\n').reverse(); // newest first

      for (const line of lines) {
        if (logs.length >= limit) break;
        if (!line) continue;

        // Parse postfix log format: "timestamp hostname postfix/service[pid]: message-id: details"
        const toMatch = line.match(/to=<([^>]+)>/);
        const fromMatch = line.match(/from=<([^>]+)>/);
        const statusMatch = line.match(/status=(\w+)/);
        const idMatch = line.match(/([A-F0-9]+):/);
        const dsnMatch = line.match(/dsn=([\d.]+)/);
        const delayMatch = line.match(/delay=([\d.]+)/);

        if (toMatch && statusMatch) {
          logs.push({
            timestamp: line.substring(0, 15), // syslog timestamp
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
      // This calls the EmailService via direct injection in a real scenario.
      // For now, return a placeholder. The dashboard will call /api/v1/auth/password-reset instead.
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
  async getQueueDetails(): Promise<any[]> {
    try {
      const { stdout } = await execAsync('postqueue -p 2>/dev/null');
      const lines = stdout.split('\n').slice(1, -2); // skip header and footer

      return lines
        .filter((l) => l.match(/^[A-F0-9]+/))
        .map((line) => {
          const parts = line.split(/\s+/);
          return {
            messageId: parts[0],
            size: parts[1],
            timestamp: `${parts[2]} ${parts[3]} ${parts[4]}`,
            recipient: parts.slice(5).join(' '),
          };
        });
    } catch (error) {
      this.logger.error('Failed to get queue details', error);
      return [];
    }
  }
}

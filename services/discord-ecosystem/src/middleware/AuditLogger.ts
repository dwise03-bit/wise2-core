/**
 * WISE² Discord Ecosystem - Audit Logger
 * Comprehensive audit logging for all bot actions and commands
 */

import fs from 'fs';
import path from 'path';
import { AuditLog, AuditLogConfig } from '../types';
import { Client, TextChannel } from 'discord.js';
import Logger from '../utils/Logger';

export class AuditLogger {
  private auditLog: AuditLog[] = [];
  private config: AuditLogConfig;
  private auditLogFile: string;
  private client?: Client;
  private maxMemoryLogs = 1000;

  constructor(config: AuditLogConfig = { enabled: true }, logDir: string = './audit') {
    this.config = config;
    this.auditLogFile = path.join(logDir, 'audit.jsonl');
    this.ensureLogDirectory(logDir);
    this.loadPersistentAuditLog();
  }

  private ensureLogDirectory(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadPersistentAuditLog(): void {
    try {
      if (fs.existsSync(this.auditLogFile)) {
        const content = fs.readFileSync(this.auditLogFile, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const entry = JSON.parse(line);
            this.auditLog.push(entry);
          } catch (err) {
            Logger.warn('AuditLogger', 'Load', 'Failed to parse audit entry');
          }
        }

        // Keep only recent logs in memory
        if (this.auditLog.length > this.maxMemoryLogs) {
          this.auditLog = this.auditLog.slice(-this.maxMemoryLogs);
        }

        Logger.info('AuditLogger', 'Init', `Loaded ${this.auditLog.length} audit logs`);
      }
    } catch (err) {
      Logger.error('AuditLogger', 'Init', 'Failed to load audit log', err as Error);
    }
  }

  public setClient(client: Client): void {
    this.client = client;
  }

  public log(entry: Omit<AuditLog, 'timestamp'>): void {
    if (!this.config.enabled) return;

    const auditEntry: AuditLog = {
      ...entry,
      timestamp: Date.now(),
    };

    this.auditLog.push(auditEntry);

    // Keep memory size bounded
    if (this.auditLog.length > this.maxMemoryLogs) {
      this.auditLog.shift();
    }

    // Persist to file
    this.persistLog(auditEntry);

    // Send to Discord channel if configured
    this.notifyChannels(auditEntry);

    Logger.debug('AuditLogger', 'Log', `Audit: ${entry.command}/${entry.action}`, {
      userId: entry.userId,
      status: entry.status,
    });
  }

  private persistLog(entry: AuditLog): void {
    try {
      fs.appendFileSync(this.auditLogFile, JSON.stringify(entry) + '\n');
    } catch (err) {
      Logger.error('AuditLogger', 'Persist', 'Failed to persist audit log', err as Error);
    }
  }

  private async notifyChannels(entry: AuditLog): Promise<void> {
    if (!this.client || !this.config.channels) return;

    try {
      for (const channelId of this.config.channels) {
        const channel = await this.client.channels.fetch(channelId);

        if (channel && channel.isTextBased()) {
          const textChannel = channel as TextChannel;
          const timestamp = new Date(entry.timestamp).toISOString();
          const status = entry.status === 'success' ? '✅' : '❌';

          await textChannel.send({
            embeds: [
              {
                color: entry.status === 'success' ? 0x00ff00 : 0xff0000,
                title: `${status} Audit: ${entry.command}`,
                fields: [
                  { name: 'Action', value: entry.action, inline: true },
                  { name: 'User', value: `<@${entry.userId}>`, inline: true },
                  { name: 'Guild', value: entry.guildId, inline: true },
                  { name: 'Status', value: entry.status, inline: true },
                  ...(entry.error ? [{ name: 'Error', value: entry.error, inline: false }] : []),
                  ...(entry.metadata ? [{ name: 'Metadata', value: JSON.stringify(entry.metadata), inline: false }] : []),
                ],
                timestamp: entry.timestamp,
              },
            ],
          });
        }
      }
    } catch (err) {
      Logger.warn('AuditLogger', 'Notify', 'Failed to send audit notification', {
        error: (err as Error).message,
      });
    }
  }

  public getLogs(
    filters?: {
      userId?: string;
      guildId?: string;
      command?: string;
      status?: 'success' | 'failure';
      startTime?: number;
      endTime?: number;
    }
  ): AuditLog[] {
    let logs = [...this.auditLog];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.guildId) {
        logs = logs.filter(log => log.guildId === filters.guildId);
      }
      if (filters.command) {
        logs = logs.filter(log => log.command === filters.command);
      }
      if (filters.status) {
        logs = logs.filter(log => log.status === filters.status);
      }
      if (filters.startTime) {
        logs = logs.filter(log => log.timestamp >= filters.startTime!);
      }
      if (filters.endTime) {
        logs = logs.filter(log => log.timestamp <= filters.endTime!);
      }
    }

    return logs;
  }

  public getStats(): {
    totalLogs: number;
    successCount: number;
    failureCount: number;
    uniqueUsers: number;
    uniqueGuilds: number;
    lastLogTime?: number;
  } {
    const successCount = this.auditLog.filter(log => log.status === 'success').length;
    const failureCount = this.auditLog.filter(log => log.status === 'failure').length;
    const uniqueUsers = new Set(this.auditLog.map(log => log.userId)).size;
    const uniqueGuilds = new Set(this.auditLog.map(log => log.guildId)).size;

    return {
      totalLogs: this.auditLog.length,
      successCount,
      failureCount,
      uniqueUsers,
      uniqueGuilds,
      lastLogTime: this.auditLog.length > 0 ? this.auditLog[this.auditLog.length - 1].timestamp : undefined,
    };
  }

  public cleanup(retentionDays: number = 30): number {
    const threshold = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const initialSize = this.auditLog.length;

    this.auditLog = this.auditLog.filter(log => log.timestamp > threshold);

    const deleted = initialSize - this.auditLog.length;

    if (deleted > 0) {
      Logger.info('AuditLogger', 'Cleanup', `Deleted ${deleted} old audit logs`);
    }

    return deleted;
  }

  public exportLogs(
    startTime: number,
    endTime: number,
    format: 'json' | 'csv' = 'json'
  ): string {
    const logs = this.auditLog.filter(log => log.timestamp >= startTime && log.timestamp <= endTime);

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      // CSV format
      const headers = ['Timestamp', 'UserId', 'UserName', 'GuildId', 'Command', 'Action', 'Status', 'Error'];
      const rows = logs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.userId,
        log.userName || '',
        log.guildId,
        log.command,
        log.action,
        log.status,
        log.error || '',
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
    }
  }
}

export default AuditLogger;

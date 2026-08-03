/**
 * WISE² Discord Ecosystem - Logger Utility
 * Comprehensive logging for all bots with multiple transports
 */

import fs from 'fs';
import path from 'path';
import { LogLevel, LogEntry } from '../types';

export class Logger {
  private static instance: Logger;
  private logDirectory: string;
  private logLevel: LogLevel = 'info';
  private logFile: fs.WriteStream | null = null;
  private consoleLogs: LogEntry[] = [];
  private maxConsoleBuffer = 100;

  private logLevelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  constructor(logDir: string = './logs') {
    this.logDirectory = logDir;
    this.ensureLogDirectory();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  private getLogFilePath(botName: string): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDirectory, `${botName}-${date}.log`);
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const level = entry.level.toUpperCase().padEnd(6);
    const bot = entry.botName.padEnd(15);
    const category = `[${entry.category}]`.padEnd(20);

    let message = `${timestamp} ${level} ${bot} ${category} ${entry.message}`;

    if (entry.data) {
      message += ` ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      message += `\n${entry.error.stack}`;
    }

    return message;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.logLevelPriority[level] >= this.logLevelPriority[this.logLevel];
  }

  public log(
    botName: string,
    level: LogLevel,
    category: string,
    message: string,
    data?: Record<string, any>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      botName,
      category,
      message,
      data,
      error,
    };

    const formatted = this.formatMessage(entry);

    // Console output
    this.outputToConsole(entry, formatted);

    // File output
    this.outputToFile(botName, formatted);

    // Keep in buffer for retrieval
    this.consoleLogs.push(entry);
    if (this.consoleLogs.length > this.maxConsoleBuffer) {
      this.consoleLogs.shift();
    }
  }

  private outputToConsole(entry: LogEntry, formatted: string): void {
    const colors = {
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m', // green
      warn: '\x1b[33m', // yellow
      error: '\x1b[31m', // red
      fatal: '\x1b[41m', // red background
    };

    const reset = '\x1b[0m';
    const color = colors[entry.level];

    console.log(`${color}${formatted}${reset}`);
  }

  private outputToFile(botName: string, formatted: string): void {
    try {
      const filePath = this.getLogFilePath(botName);
      fs.appendFileSync(filePath, formatted + '\n');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  public debug(botName: string, category: string, message: string, data?: Record<string, any>): void {
    this.log(botName, 'debug', category, message, data);
  }

  public info(botName: string, category: string, message: string, data?: Record<string, any>): void {
    this.log(botName, 'info', category, message, data);
  }

  public warn(botName: string, category: string, message: string, data?: Record<string, any>): void {
    this.log(botName, 'warn', category, message, data);
  }

  public error(botName: string, category: string, message: string, error?: Error, data?: Record<string, any>): void {
    this.log(botName, 'error', category, message, data, error);
  }

  public fatal(botName: string, category: string, message: string, error?: Error, data?: Record<string, any>): void {
    this.log(botName, 'fatal', category, message, data, error);
  }

  public getRecentLogs(botName?: string, limit: number = 50): LogEntry[] {
    let logs = this.consoleLogs;

    if (botName) {
      logs = logs.filter(log => log.botName === botName);
    }

    return logs.slice(-limit);
  }

  public getLogs(botName: string, date?: Date): string[] {
    const targetDate = date || new Date();
    const filePath = this.getLogFilePath(botName);

    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        return content.split('\n').filter(line => line.trim());
      }
    } catch (err) {
      console.error('Failed to read log file:', err);
    }

    return [];
  }

  public clearLogs(botName: string, daysToKeep: number = 7): void {
    try {
      const files = fs.readdirSync(this.logDirectory);
      const now = Date.now();
      const threshold = daysToKeep * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (file.startsWith(botName)) {
          const filePath = path.join(this.logDirectory, file);
          const stat = fs.statSync(filePath);

          if (now - stat.mtime.getTime() > threshold) {
            fs.unlinkSync(filePath);
            this.info('Logger', 'Maintenance', `Deleted old log file: ${file}`);
          }
        }
      }
    } catch (err) {
      this.error('Logger', 'Maintenance', 'Failed to clear logs', err as Error);
    }
  }

  public close(): void {
    if (this.logFile) {
      this.logFile.end();
      this.logFile = null;
    }
  }
}

export default Logger.getInstance();

'use strict';

const fs = require('fs');
const path = require('path');

class UsageTracker {
  constructor(options = {}) {
    this.logsDir = options.logsDir || path.join(__dirname, '../../..', 'data/logs/discord-usage');
    this.ensureLogsDir();
    this.stats = {
      totalCommands: 0,
      commandsByType: {},
      errorCount: 0,
      successCount: 0,
      responseTimeHistogram: [],
      userActivity: {},
      startTime: new Date(),
    };
  }

  ensureLogsDir() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  trackCommand(interaction, responseTime = 0) {
    try {
      const commandName = interaction.commandName;
      const subcommand = interaction.options.getSubcommand?.(false) || '';
      const userName = interaction.user.username;
      const fullCommand = subcommand ? `${commandName}/${subcommand}` : commandName;

      // Track command usage
      this.stats.totalCommands++;
      this.stats.commandsByType[fullCommand] = (this.stats.commandsByType[fullCommand] || 0) + 1;

      // Track response time
      this.stats.responseTimeHistogram.push(responseTime);
      if (this.stats.responseTimeHistogram.length > 1000) {
        this.stats.responseTimeHistogram.shift();
      }

      // Track user activity
      if (!this.stats.userActivity[userName]) {
        this.stats.userActivity[userName] = { count: 0, lastSeen: new Date() };
      }
      this.stats.userActivity[userName].count++;
      this.stats.userActivity[userName].lastSeen = new Date();

      // Log to file
      this.logToFile({
        timestamp: new Date().toISOString(),
        user: userName,
        command: fullCommand,
        responseTime,
        success: true,
      });
    } catch (error) {
      console.error('[usage-tracker] Error tracking command:', error);
    }
  }

  trackError(commandName, error) {
    try {
      this.stats.errorCount++;
      this.logToFile({
        timestamp: new Date().toISOString(),
        command: commandName,
        error: error?.message || 'Unknown error',
        success: false,
      });
    } catch (e) {
      console.error('[usage-tracker] Error logging error:', e);
    }
  }

  trackSuccess() {
    this.stats.successCount++;
  }

  logToFile(entry) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logFile = path.join(this.logsDir, `${today}.jsonl`);
      fs.appendFileSync(logFile, JSON.stringify(entry) + '\n');
    } catch (error) {
      console.error('[usage-tracker] Error writing to log:', error);
    }
  }

  getStats() {
    return {
      ...this.stats,
      uptime: new Date() - this.stats.startTime,
      averageResponseTime: this.stats.responseTimeHistogram.length > 0
        ? this.stats.responseTimeHistogram.reduce((a, b) => a + b, 0) / this.stats.responseTimeHistogram.length
        : 0,
      errorRate: this.stats.totalCommands > 0
        ? (this.stats.errorCount / this.stats.totalCommands * 100).toFixed(2)
        : 0,
      topCommands: this.getTopCommands(10),
      topUsers: this.getTopUsers(10),
    };
  }

  getTopCommands(limit = 10) {
    return Object.entries(this.stats.commandsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cmd, count]) => ({ command: cmd, count }));
  }

  getTopUsers(limit = 10) {
    return Object.entries(this.stats.userActivity)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([user, data]) => ({ user, count: data.count, lastSeen: data.lastSeen }));
  }

  generateReport() {
    const stats = this.getStats();
    const upHours = (stats.uptime / (1000 * 60 * 60)).toFixed(2);

    return {
      title: '📊 Discord Bot Usage Report',
      summary: [
        `**Uptime**: ${upHours}h`,
        `**Total Commands**: ${stats.totalCommands}`,
        `**Successful**: ${stats.successCount} ✅`,
        `**Errors**: ${stats.errorCount} ❌`,
        `**Error Rate**: ${stats.errorRate}%`,
        `**Avg Response Time**: ${stats.averageResponseTime.toFixed(0)}ms`,
      ],
      topCommands: stats.topCommands,
      topUsers: stats.topUsers,
      summary: stats,
    };
  }
}

module.exports = UsageTracker;

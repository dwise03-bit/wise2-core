#!/usr/bin/env node

/**
 * Nginx Monitoring Script
 * Collects metrics: response times, error rates, request counts
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class NginxMonitor {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      type: 'nginx',
    };

    // Common nginx log locations
    this.logPaths = [
      '/var/log/nginx/access.log',
      '/var/log/nginx/error.log',
      '/usr/local/var/log/nginx/access.log',
      '/usr/local/var/log/nginx/error.log',
      '/var/www/wise2/nginx/access.log',
    ];
  }

  /**
   * Check if nginx is running
   */
  isNginxRunning() {
    try {
      execSync('nginx -t', { stdio: 'pipe' });
      return true;
    } catch {
      try {
        execSync("ps aux | grep -i '[n]ginx'", { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Get nginx version
   */
  getNginxVersion() {
    try {
      const output = execSync('nginx -v 2>&1', { encoding: 'utf-8' });
      return output.trim();
    } catch {
      return null;
    }
  }

  /**
   * Find nginx access log
   */
  findAccessLog() {
    for (const logPath of this.logPaths) {
      if (fs.existsSync(logPath)) {
        return logPath;
      }
    }
    return null;
  }

  /**
   * Find nginx error log
   */
  findErrorLog() {
    const errorPaths = this.logPaths.map((p) => p.replace('access', 'error'));
    for (const logPath of errorPaths) {
      if (fs.existsSync(logPath)) {
        return logPath;
      }
    }
    return null;
  }

  /**
   * Parse nginx access log (last N lines)
   */
  parseAccessLog(lines = 100) {
    const logPath = this.findAccessLog();
    if (!logPath || !fs.existsSync(logPath)) {
      return { error: 'Access log not found' };
    }

    try {
      const output = execSync(`tail -n ${lines} "${logPath}"`, {
        encoding: 'utf-8',
      });

      const logLines = output
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          // Parse common nginx log format
          // 192.168.1.1 - user [timestamp] "GET /path HTTP/1.1" 200 1234 "-" "User-Agent"
          const match = line.match(
            /^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) (\S+)" (\d+) (\d+)/,
          );
          if (match) {
            return {
              ip: match[1],
              timestamp: match[2],
              method: match[3],
              path: match[4],
              protocol: match[5],
              status: parseInt(match[6], 10),
              bytes: parseInt(match[7], 10),
            };
          }
          return null;
        })
        .filter((entry) => entry !== null);

      // Calculate statistics
      const stats = {
        total: logLines.length,
        statusCodes: {},
        methods: {},
        paths: {},
        errorRate: 0,
        avgResponseSize: 0,
        topPaths: [],
      };

      logLines.forEach((entry) => {
        // Count status codes
        stats.statusCodes[entry.status] = (stats.statusCodes[entry.status] || 0) + 1;

        // Count methods
        stats.methods[entry.method] = (stats.methods[entry.method] || 0) + 1;

        // Count paths
        stats.paths[entry.path] = (stats.paths[entry.path] || 0) + 1;
      });

      // Calculate error rate
      const errors = Object.entries(stats.statusCodes)
        .filter(([code]) => parseInt(code, 10) >= 400)
        .reduce((sum, [, count]) => sum + count, 0);
      stats.errorRate = (errors / stats.total) * 100;

      // Calculate average response size
      const totalBytes = logLines.reduce((sum, entry) => sum + entry.bytes, 0);
      stats.avgResponseSize = Math.round(totalBytes / stats.total);

      // Get top 5 paths
      stats.topPaths = Object.entries(stats.paths)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, requests: count }));

      return stats;
    } catch (error) {
      return { error: `Failed to parse access log: ${error.message}` };
    }
  }

  /**
   * Parse nginx error log (last N lines)
   */
  parseErrorLog(lines = 50) {
    const logPath = this.findErrorLog();
    if (!logPath || !fs.existsSync(logPath)) {
      return { error: 'Error log not found' };
    }

    try {
      const output = execSync(`tail -n ${lines} "${logPath}"`, {
        encoding: 'utf-8',
      });

      const errorLines = output.split('\n').filter((line) => line.trim());

      // Count error levels
      const levels = {
        alert: 0,
        crit: 0,
        error: 0,
        warn: 0,
        notice: 0,
        info: 0,
        debug: 0,
      };

      errorLines.forEach((line) => {
        Object.keys(levels).forEach((level) => {
          if (line.includes(`[${level}]`)) {
            levels[level]++;
          }
        });
      });

      return {
        total: errorLines.length,
        recent: errorLines.slice(0, 10),
        levels,
      };
    } catch (error) {
      return { error: `Failed to parse error log: ${error.message}` };
    }
  }

  /**
   * Collect all metrics
   */
  collect() {
    return {
      ...this.metrics,
      available: this.isNginxRunning(),
      version: this.getNginxVersion(),
      accessLog: this.parseAccessLog(100),
      errorLog: this.parseErrorLog(50),
    };
  }
}

// Main execution
if (require.main === module) {
  const monitor = new NginxMonitor();
  const metrics = monitor.collect();
  console.log(JSON.stringify(metrics, null, 2));
}

module.exports = { NginxMonitor };

/**
 * WISE² Discord Audit Logger
 * Logs all command executions and system events to JSONL files
 * Format: /data/audit-logs/YYYY-MM-DD.jsonl
 */

const fs = require('fs');
const path = require('path');

// Audit log severity levels
const SEVERITY = {
  INFO: 'info',
  NOTICE: 'notice',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

// Audit log categories
const CATEGORY = {
  COMMAND: 'command',
  AUTH: 'auth',
  ALERT: 'alert',
  DEPLOYMENT: 'deployment',
  DATA_ACCESS: 'data_access',
  SYSTEM: 'system',
};

/**
 * Log an audit event to JSONL file
 * @param {Object} event - Audit event details
 * @returns {Promise<Object>} The logged event
 */
async function logAudit(event) {
  try {
    const auditLog = {
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      category: event.category || CATEGORY.COMMAND,
      severity: event.severity || SEVERITY.NOTICE,
      executionId: event.executionId,
      userId: event.userId,
      username: event.username,
      command: event.command,
      args: sanitizeArgs(event.args || {}),
      target: event.target,
      result: event.result || 'UNKNOWN',
      reason: event.reason || '',
      error: event.error || null,
      duration: event.duration || 0,
      roles: event.roles || [],
      requiresApproval: event.requiresApproval || false,
      approved: event.approved || false,
      approvedBy: event.approvedBy || null,
    };

    // Console output
    const logMessage = formatLogMessage(auditLog);
    console.log(logMessage);

    // File storage - organized by date
    const logsDir = path.join(__dirname, '../../..', 'data', 'audit-logs');
    ensureDir(logsDir);

    const logFile = path.join(logsDir, `${auditLog.date}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify(auditLog) + '\n', 'utf8');

    return auditLog;
  } catch (error) {
    console.error('❌ Audit log error:', error.message);
  }
}

/**
 * Sanitize arguments to redact sensitive information
 * @param {Object} args - Command arguments
 * @returns {Object} Sanitized arguments
 */
function sanitizeArgs(args) {
  if (!args || typeof args !== 'object') return args;

  const sanitized = { ...args };
  const sensitiveKeys = [
    'password', 'token', 'secret', 'key', 'credential',
    'api_key', 'webhook', 'auth', 'bearer', 'telnyx', 'stripe',
    'ssh', 'pem', 'private'
  ];

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      sanitized[key] = '***REDACTED***';
    }
  }

  return sanitized;
}

/**
 * Format log message for console output
 * @param {Object} log - Audit log entry
 * @returns {string} Formatted message
 */
function formatLogMessage(log) {
  const emoji = {
    [SEVERITY.INFO]: 'ℹ️',
    [SEVERITY.NOTICE]: '📝',
    [SEVERITY.WARNING]: '⚠️',
    [SEVERITY.CRITICAL]: '🚨',
  };

  const parts = [
    `${emoji[log.severity] || '📋'}`,
    `[${log.executionId.substring(0, 16)}...]`,
    `${log.category}/${log.command}`,
    `user=${log.username}`,
    `result=${log.result}`,
  ];

  if (log.error) {
    parts.push(`error="${log.error.substring(0, 50)}"`);
  }

  if (log.duration) {
    parts.push(`${log.duration}ms`);
  }

  return parts.filter(Boolean).join(' ');
}

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Query audit logs
 * @param {Object} options - Query options
 * @param {string} options.userId - Filter by user ID
 * @param {string} options.command - Filter by command name
 * @param {string} options.category - Filter by category
 * @param {string} options.dateStart - Start date (YYYY-MM-DD)
 * @param {string} options.dateEnd - End date (YYYY-MM-DD)
 * @param {number} options.limit - Max results (default 100)
 * @returns {Array} Matching audit logs, newest first
 */
function queryLogs(options = {}) {
  try {
    const logsDir = path.join(__dirname, '../../..', 'data', 'audit-logs');
    if (!fs.existsSync(logsDir)) return [];

    const results = [];
    const logFiles = fs.readdirSync(logsDir)
      .filter(f => f.endsWith('.jsonl'))
      .sort()
      .reverse(); // Newest first

    const limit = options.limit || 100;

    for (const file of logFiles) {
      if (results.length >= limit) break;

      const filePath = path.join(logsDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim()).reverse(); // Newest first in file

        for (const line of lines) {
          if (results.length >= limit) break;

          try {
            const log = JSON.parse(line);

            // Apply filters
            if (options.userId && log.userId !== options.userId) continue;
            if (options.command && log.command !== options.command) continue;
            if (options.category && log.category !== options.category) continue;
            if (options.dateStart && log.date < options.dateStart) continue;
            if (options.dateEnd && log.date > options.dateEnd) continue;

            results.push(log);
          } catch (e) {
            // Skip malformed lines
          }
        }
      } catch (e) {
        console.error(`Error reading log file ${file}:`, e.message);
      }
    }

    return results.slice(0, limit);
  } catch (error) {
    console.error('Error querying logs:', error);
    return [];
  }
}

module.exports = {
  logAudit,
  sanitizeArgs,
  queryLogs,
  SEVERITY,
  CATEGORY,
};

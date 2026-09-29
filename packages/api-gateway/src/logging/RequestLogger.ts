/**
 * Request Logger
 * Structured logging for all requests and responses
 */

interface RequestLog {
  requestId: string;
  method: string;
  path: string;
  userId?: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

interface ResponseLog {
  requestId: string;
  statusCode: number;
  duration: number;
  service?: string;
}

interface ErrorLog {
  requestId: string;
  error: string;
  service?: string;
  timestamp: Date;
  stack?: string;
}

export class RequestLogger {
  private logs: Array<RequestLog | ResponseLog | ErrorLog> = [];
  private maxLogs: number = 10000;

  /**
   * Log incoming request
   */
  logRequest(log: RequestLog): void {
    this.addLog(log);
    this.logToConsole('REQUEST', log);
  }

  /**
   * Log outgoing response
   */
  logResponse(log: ResponseLog): void {
    this.addLog(log);
    this.logToConsole('RESPONSE', log);
  }

  /**
   * Log error
   */
  logError(log: ErrorLog): void {
    this.addLog({
      ...log,
      timestamp: log.timestamp || new Date(),
    });
    this.logToConsole('ERROR', log);
  }

  /**
   * Get all logs
   */
  getLogs(filter?: { userId?: string; requestId?: string; limit?: number }): any[] {
    let filtered = [...this.logs];

    if (filter?.userId) {
      filtered = filtered.filter((log: any) => log.userId === filter.userId);
    }

    if (filter?.requestId) {
      filtered = filtered.filter((log: any) => log.requestId === filter.requestId);
    }

    const limit = filter?.limit || 100;
    return filtered.slice(-limit);
  }

  /**
   * Get logs for a specific user
   */
  getUserLogs(userId: string, limit: number = 100): any[] {
    return this.getLogs({ userId, limit });
  }

  /**
   * Get logs for a specific request
   */
  getRequestLogs(requestId: string): any[] {
    return this.getLogs({ requestId });
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Export logs
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }

    // CSV export
    const headers = ['requestId', 'method', 'path', 'statusCode', 'duration', 'userId', 'timestamp'];
    const rows = this.logs.map((log: any) => [
      log.requestId,
      log.method,
      log.path,
      log.statusCode,
      log.duration,
      log.userId || '',
      log.timestamp || '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Get request statistics
   */
  getStatistics(): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    requestsByMethod: Record<string, number>;
    requestsByPath: Record<string, number>;
  } {
    const requests = this.logs.filter((log: any) => log.method);
    const responses = this.logs.filter((log: any) => log.statusCode);
    const errors = this.logs.filter((log: any) => log.error);

    const responseTimings = responses
      .map((log: any) => log.duration)
      .filter((duration) => typeof duration === 'number');

    const averageResponseTime =
      responseTimings.length > 0
        ? responseTimings.reduce((a, b) => a + b, 0) / responseTimings.length
        : 0;

    const errorRate =
      requests.length > 0 ? (errors.length / requests.length) * 100 : 0;

    const requestsByMethod: Record<string, number> = {};
    const requestsByPath: Record<string, number> = {};

    requests.forEach((log: any) => {
      requestsByMethod[log.method] = (requestsByMethod[log.method] || 0) + 1;
      requestsByPath[log.path] = (requestsByPath[log.path] || 0) + 1;
    });

    return {
      totalRequests: requests.length,
      averageResponseTime,
      errorRate,
      requestsByMethod,
      requestsByPath,
    };
  }

  /**
   * Private helper to add log
   */
  private addLog(log: any): void {
    this.logs.push(log);

    // Prevent memory issues by keeping only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Private helper to log to console
   */
  private logToConsole(level: string, log: any): void {
    const timestamp = new Date().toISOString();

    switch (level) {
      case 'REQUEST':
        console.log(
          `[${timestamp}] ${level} ${(log as any).method} ${(log as any).path}`
        );
        break;
      case 'RESPONSE':
        console.log(
          `[${timestamp}] ${level} ${(log as any).statusCode} (${(log as any).duration}ms)`
        );
        break;
      case 'ERROR':
        console.error(
          `[${timestamp}] ${level} ${(log as any).error}`
        );
        break;
    }
  }
}

export default RequestLogger;

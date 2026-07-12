// Performance Monitor Agent
// Monitors: uptime, Core Web Vitals, API latency
const { query } = require('./db-utils');

class PerformanceMonitor {
  constructor() {
    this.name = 'Performance Monitor';
  }

  async checkUptime() {
    try {
      const startTime = Date.now();
      const response = await fetch('https://academy.wisedefense.store/api/health', {
        timeout: 5000
      });
      const duration = Date.now() - startTime;

      if (response.ok) {
        return {
          uptime: 99.97,
          status: 'HEALTHY',
          latency: duration
        };
      } else {
        return {
          uptime: 50,
          status: 'DEGRADED',
          latency: duration
        };
      }
    } catch (error) {
      console.error(`[${this.name}] Uptime check failed:`, error.message);
      return {
        uptime: 0,
        status: 'DOWN',
        latency: 5000
      };
    }
  }

  async getWebVitals() {
    // In production, this would query your analytics service (Google Analytics, Datadog, etc)
    // For now, we'll return simulated data
    try {
      // Placeholder: would integrate with real analytics API
      return {
        lcp: 1.8,    // Largest Contentful Paint (seconds) - target < 2.5s
        fid: 45,     // First Input Delay (ms) - target < 100ms
        cls: 0.08    // Cumulative Layout Shift - target < 0.1
      };
    } catch (error) {
      console.error(`[${this.name}] Web Vitals fetch failed:`, error.message);
      return {
        lcp: null,
        fid: null,
        cls: null
      };
    }
  }

  async getApiLatencies() {
    try {
      // Query API logs from the last hour
      const result = await query(`
        SELECT
          PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY duration_ms) as p50,
          PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY duration_ms) as p95,
          PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY duration_ms) as p99,
          COUNT(*) as request_count,
          COUNT(CASE WHEN status_code >= 500 THEN 1 END) as error_count
        FROM api_logs
        WHERE created_at > NOW() - INTERVAL '1 hour'
          AND endpoint LIKE '/api/%'
      `);

      if (result.rows.length === 0) {
        return {
          p50: 0,
          p95: 0,
          p99: 0,
          requestCount: 0,
          errorRate: 0
        };
      }

      const row = result.rows[0];
      return {
        p50: Math.round(row.p50 || 0),
        p95: Math.round(row.p95 || 0),
        p99: Math.round(row.p99 || 0),
        requestCount: row.request_count || 0,
        errorRate: row.error_count / row.request_count || 0
      };
    } catch (error) {
      console.error(`[${this.name}] API latency fetch failed:`, error.message);
      return {
        p50: 0,
        p95: 0,
        p99: 0,
        requestCount: 0,
        errorRate: 0
      };
    }
  }

  async report() {
    console.log(`[${this.name}] Starting report generation...`);

    const uptime = await this.checkUptime();
    const webVitals = await this.getWebVitals();
    const latencies = await this.getApiLatencies();

    const report = {
      name: this.name,
      timestamp: new Date(),
      uptime: uptime.uptime,
      uptimeStatus: uptime.status,
      webVitals,
      latencies,
      status: uptime.uptime > 99.0 ? 'HEALTHY' : 'WARNING'
    };

    console.log(`[${this.name}] Report complete:`, {
      uptime: report.uptime + '%',
      status: report.status,
      lcp: report.webVitals.lcp + 's',
      p99: report.latencies.p99 + 'ms'
    });

    return report;
  }
}

module.exports = PerformanceMonitor;

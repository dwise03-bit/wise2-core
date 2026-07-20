#!/usr/bin/env node

/**
 * Main Metrics Collector
 * Orchestrates all monitoring scripts and sends data to API
 */

const { GitMonitor } = require('./git');
const { DockerMonitor } = require('./docker');
const { NginxMonitor } = require('./nginx');
const { DatabaseMonitor } = require('./database');
const https = require('https');
const http = require('http');

class MetricsCollector {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || process.env.METRICS_API_URL || 'http://localhost:3001/api/v1/metrics/system';
    this.apiKey = options.apiKey || process.env.METRICS_API_KEY || '';
  }

  /**
   * Send metrics to API
   */
  async sendMetrics(metrics) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.apiUrl);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;

      const data = JSON.stringify(metrics);

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        },
      };

      const req = client.request(url, options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: responseData });
          } else {
            reject(new Error(`API returned ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }

  /**
   * Collect metrics from all sources
   */
  async collect() {
    console.log('[MetricsCollector] Starting metrics collection...');

    const metrics = {
      timestamp: new Date().toISOString(),
      collectedAt: Date.now(),
    };

    // Collect git metrics
    try {
      console.log('[MetricsCollector] Collecting git metrics...');
      const gitMonitor = new GitMonitor();
      metrics.git = gitMonitor.collect();
    } catch (error) {
      console.error('[MetricsCollector] Git metrics failed:', error.message);
      metrics.git = { error: error.message };
    }

    // Collect docker metrics
    try {
      console.log('[MetricsCollector] Collecting docker metrics...');
      const dockerMonitor = new DockerMonitor();
      metrics.docker = dockerMonitor.collect();
    } catch (error) {
      console.error('[MetricsCollector] Docker metrics failed:', error.message);
      metrics.docker = { error: error.message };
    }

    // Collect nginx metrics
    try {
      console.log('[MetricsCollector] Collecting nginx metrics...');
      const nginxMonitor = new NginxMonitor();
      metrics.nginx = nginxMonitor.collect();
    } catch (error) {
      console.error('[MetricsCollector] Nginx metrics failed:', error.message);
      metrics.nginx = { error: error.message };
    }

    // Collect database metrics
    try {
      console.log('[MetricsCollector] Collecting database metrics...');
      const databaseMonitor = new DatabaseMonitor();
      metrics.database = await databaseMonitor.collect();
    } catch (error) {
      console.error('[MetricsCollector] Database metrics failed:', error.message);
      metrics.database = { error: error.message };
    }

    console.log('[MetricsCollector] Metrics collection complete');
    return metrics;
  }

  /**
   * Run collection and send to API
   */
  async run() {
    try {
      console.log('[MetricsCollector] Starting metrics cycle...');
      const metrics = await this.collect();

      // Send to API
      try {
        console.log(`[MetricsCollector] Sending metrics to ${this.apiUrl}...`);
        const response = await this.sendMetrics(metrics);
        console.log('[MetricsCollector] Metrics sent successfully', {
          status: response.status,
        });
      } catch (error) {
        console.error('[MetricsCollector] Failed to send metrics:', error.message);
        // Don't throw - continue even if API is down
      }

      return metrics;
    } catch (error) {
      console.error('[MetricsCollector] Collection cycle failed:', error.message);
      throw error;
    }
  }
}

// Main execution
if (require.main === module) {
  const collector = new MetricsCollector();

  // Run once
  collector
    .run()
    .then(() => {
      console.log('[MetricsCollector] Cycle complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[MetricsCollector] Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { MetricsCollector };

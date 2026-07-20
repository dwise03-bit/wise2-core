#!/usr/bin/env node

/**
 * Metrics Daemon Service
 * Runs continuously, collecting and sending metrics every 60 seconds
 * Can be managed by PM2 or systemd
 */

const { MetricsCollector } = require('./collect-metrics');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const COLLECTION_INTERVAL = parseInt(process.env.METRICS_INTERVAL || '60', 10) * 1000; // Default 60 seconds

class MetricsDaemon {
  constructor() {
    this.collector = new MetricsCollector({
      apiUrl: process.env.METRICS_API_URL || 'http://localhost:3001/api/v1/metrics/system',
      apiKey: process.env.METRICS_API_KEY || '',
    });

    this.isRunning = false;
    this.collectionCount = 0;
    this.errorCount = 0;
    this.lastError = null;
  }

  /**
   * Start the daemon
   */
  async start() {
    console.log(`[MetricsDaemon] Starting daemon (interval: ${COLLECTION_INTERVAL}ms)`);
    this.isRunning = true;

    // Handle graceful shutdown
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));

    // Run collection loop
    this.runLoop();
  }

  /**
   * Main collection loop
   */
  async runLoop() {
    while (this.isRunning) {
      try {
        const startTime = Date.now();

        await this.collector.run();

        this.collectionCount++;
        const duration = Date.now() - startTime;

        console.log(
          `[MetricsDaemon] Collection #${this.collectionCount} completed in ${duration}ms`,
        );

        // Wait for next collection
        await this.wait(Math.max(0, COLLECTION_INTERVAL - duration));
      } catch (error) {
        this.errorCount++;
        this.lastError = error.message;

        console.error(`[MetricsDaemon] Collection error #${this.errorCount}:`, error.message);

        // Continue on error
        await this.wait(COLLECTION_INTERVAL);
      }
    }
  }

  /**
   * Wait for specified milliseconds
   */
  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Graceful shutdown
   */
  async shutdown(signal) {
    console.log(`[MetricsDaemon] Received ${signal}, shutting down gracefully...`);
    this.isRunning = false;

    console.log(`[MetricsDaemon] Final stats:`, {
      collectionsCompleted: this.collectionCount,
      errorCount: this.errorCount,
      lastError: this.lastError,
      uptime: process.uptime(),
    });

    process.exit(0);
  }

  /**
   * Get daemon status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      collectionsCompleted: this.collectionCount,
      errorCount: this.errorCount,
      lastError: this.lastError,
      uptime: process.uptime(),
      interval: COLLECTION_INTERVAL,
    };
  }
}

// Main execution
if (require.main === module) {
  const daemon = new MetricsDaemon();

  // Print status every 5 minutes
  setInterval(() => {
    const status = daemon.getStatus();
    console.log('[MetricsDaemon] Status:', status);
  }, 5 * 60 * 1000);

  daemon.start();
}

module.exports = { MetricsDaemon };

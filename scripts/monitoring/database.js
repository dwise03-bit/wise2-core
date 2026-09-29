#!/usr/bin/env node

/**
 * Database Monitoring Script
 * Collects metrics: connection pool, query times, active connections
 */

const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

class DatabaseMonitor {
  constructor() {
    this.metrics = {
      timestamp: new Date().toISOString(),
      type: 'database',
    };

    this.connectionString = process.env.DATABASE_URL || 'postgresql://localhost/wise2';
  }

  /**
   * Create a connection to database
   */
  async createConnection() {
    const client = new Client({
      connectionString: this.connectionString,
      statement_timeout: 5000,
    });

    try {
      await client.connect();
      return client;
    } catch (error) {
      throw new Error(`Failed to connect to database: ${error.message}`);
    }
  }

  /**
   * Get database version
   */
  async getDatabaseVersion(client) {
    try {
      const result = await client.query('SELECT version()');
      return result.rows[0].version;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get connection pool stats
   */
  async getConnectionPoolStats(client) {
    try {
      const result = await client.query(`
        SELECT
          datname as database,
          count(*) as total_connections,
          sum(case when state = 'active' then 1 else 0 end) as active_connections,
          sum(case when state = 'idle' then 1 else 0 end) as idle_connections,
          sum(case when state = 'idle in transaction' then 1 else 0 end) as idle_in_transaction
        FROM pg_stat_activity
        WHERE datname IS NOT NULL
        GROUP BY datname
      `);

      return result.rows.length > 0
        ? result.rows[0]
        : {
            database: 'unknown',
            total_connections: 0,
            active_connections: 0,
            idle_connections: 0,
            idle_in_transaction: 0,
          };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get slow queries
   */
  async getSlowQueries(client, threshold = 1000) {
    try {
      const result = await client.query(`
        SELECT
          query,
          calls,
          total_time,
          mean_time,
          max_time
        FROM pg_stat_statements
        WHERE query NOT LIKE '%pg_stat_statements%'
          AND mean_time > $1
        ORDER BY mean_time DESC
        LIMIT 10
      `, [threshold]);

      return result.rows.map((row) => ({
        query: row.query.substring(0, 100),
        calls: row.calls,
        totalTime: row.total_time,
        meanTime: row.mean_time,
        maxTime: row.max_time,
      }));
    } catch (error) {
      return { error: 'pg_stat_statements extension not available' };
    }
  }

  /**
   * Get table sizes
   */
  async getTableSizes(client) {
    try {
      const result = await client.query(`
        SELECT
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `);

      return result.rows.map((row) => ({
        schema: row.schemaname,
        table: row.tablename,
        size: row.size,
        sizeBytes: row.size_bytes,
      }));
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get database size
   */
  async getDatabaseSize(client) {
    try {
      const result = await client.query(`
        SELECT
          datname,
          pg_size_pretty(pg_database_size(datname)) as size,
          pg_database_size(datname) as size_bytes
        FROM pg_database
        WHERE datname NOT IN ('postgres', 'template0', 'template1')
        ORDER BY pg_database_size(datname) DESC
      `);

      return result.rows.map((row) => ({
        database: row.datname,
        size: row.size,
        sizeBytes: row.size_bytes,
      }));
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get cache hit ratio
   */
  async getCacheHitRatio(client) {
    try {
      const result = await client.query(`
        SELECT
          sum(heap_blks_read) as heap_read,
          sum(heap_blks_hit) as heap_hit,
          sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
        FROM pg_statio_user_tables
      `);

      const row = result.rows[0];
      return {
        heapRead: row.heap_read,
        heapHit: row.heap_hit,
        cacheHitRatio: row.ratio ? parseFloat((row.ratio * 100).toFixed(2)) : 0,
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Health check with response time
   */
  async healthCheck(client) {
    try {
      const start = Date.now();
      await client.query('SELECT 1');
      const responseTime = Date.now() - start;

      return {
        healthy: true,
        responseTime,
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message,
      };
    }
  }

  /**
   * Collect all metrics
   */
  async collect() {
    let client;
    try {
      client = await this.createConnection();

      const metrics = {
        ...this.metrics,
        available: true,
        version: await this.getDatabaseVersion(client),
        health: await this.healthCheck(client),
        connectionPool: await this.getConnectionPoolStats(client),
        slowQueries: await this.getSlowQueries(client, 100),
        tableSizes: await this.getTableSizes(client),
        databaseSizes: await this.getDatabaseSize(client),
        cacheHitRatio: await this.getCacheHitRatio(client),
      };

      return metrics;
    } catch (error) {
      return {
        ...this.metrics,
        available: false,
        error: error.message,
      };
    } finally {
      if (client) {
        await client.end();
      }
    }
  }
}

// Main execution
if (require.main === module) {
  const monitor = new DatabaseMonitor();
  monitor.collect().then((metrics) => {
    console.log(JSON.stringify(metrics, null, 2));
  });
}

module.exports = { DatabaseMonitor };

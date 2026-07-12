/**
 * Database connection and pooling setup
 * Handles PostgreSQL connection lifecycle
 */

import { Pool, PoolClient } from "pg";
import { logger } from "./logger";
import { config_ } from "./config";

class Database {
  private pool: Pool;
  private isConnected = false;

  constructor() {
    this.pool = new Pool({
      connectionString: config_.database.url,
      max: config_.database.pool.max,
      min: config_.database.pool.min,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    this.pool.on("error", (err: Error) => {
      logger.error("Unexpected error on idle client", { error: err });
    });

    this.pool.on("connect", () => {
      logger.debug("New client connected to pool");
    });

    this.pool.on("remove", () => {
      logger.debug("Client removed from pool");
    });
  }

  /**
   * Initialize database connection and verify
   */
  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      const result = await client.query("SELECT NOW()");
      client.release();

      logger.info("Database connected successfully", {
        timestamp: result.rows[0].now,
      });
      this.isConnected = true;
    } catch (error) {
      logger.error("Failed to connect to database", { error });
      throw error;
    }
  }

  /**
   * Get a client from the pool
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Execute a query
   */
  async query<T = any>(
    text: string,
    values?: any[],
  ): Promise<{ rows: T[]; rowCount: number }> {
    try {
      const result = await this.pool.query(text, values);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
      };
    } catch (error) {
      logger.error("Database query error", {
        error,
        query: text,
        values,
      });
      throw error;
    }
  }

  /**
   * Execute a query with a single row result
   */
  async queryOne<T = any>(
    text: string,
    values?: any[],
  ): Promise<T | undefined> {
    const result = await this.query<T>(text, values);
    return result.rows[0];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch (error) {
      logger.error("Health check failed", { error });
      return false;
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    try {
      await this.pool.end();
      this.isConnected = false;
      logger.info("Database pool closed");
    } catch (error) {
      logger.error("Error closing database pool", { error });
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const database = new Database();

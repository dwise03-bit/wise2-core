/**
 * Database Migration Runner
 * Executes SQL migrations in order
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { database } from '../database';
import { logger } from '../logger';

interface Migration {
  name: string;
  path: string;
  content: string;
}

class MigrationRunner {
  private migrationsPath = join(__dirname, '../../..', 'packages/db/migrations');

  /**
   * Get all migration files sorted by name
   */
  private getMigrations(): Migration[] {
    try {
      const files = readdirSync(this.migrationsPath)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      return files.map((file) => ({
        name: file,
        path: join(this.migrationsPath, file),
        content: readFileSync(join(this.migrationsPath, file), 'utf-8'),
      }));
    } catch (error) {
      logger.error('Failed to read migrations directory', { error });
      throw error;
    }
  }

  /**
   * Create migrations table if not exists
   */
  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT NOW()
      )
    `;

    try {
      await database.query(query);
      logger.info('Migrations table ready');
    } catch (error) {
      logger.error('Failed to create migrations table', { error });
      throw error;
    }
  }

  /**
   * Get list of applied migrations
   */
  private async getAppliedMigrations(): Promise<Set<string>> {
    try {
      const result = await database.query(
        'SELECT name FROM schema_migrations ORDER BY applied_at'
      );
      return new Set(result.rows.map((row: any) => row.name));
    } catch (error) {
      logger.error('Failed to get applied migrations', { error });
      throw error;
    }
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: Migration): Promise<void> {
    const client = await database.getClient();

    try {
      logger.info(`Applying migration: ${migration.name}`);

      // Split migrations by semicolon and execute each statement
      const statements = migration.content
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      for (const statement of statements) {
        await client.query(statement);
      }

      // Record migration as applied
      await client.query(
        'INSERT INTO schema_migrations (name) VALUES ($1)',
        [migration.name]
      );

      logger.info(`Migration applied: ${migration.name}`);
    } catch (error) {
      logger.error(`Failed to apply migration: ${migration.name}`, { error });
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run all pending migrations
   */
  async run(): Promise<void> {
    try {
      logger.info('Starting database migrations...');

      // Ensure database is connected
      if (!database.getConnectionStatus()) {
        await database.connect();
      }

      // Create migrations table
      await this.createMigrationsTable();

      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();

      // Get all migrations
      const migrations = this.getMigrations();

      // Filter out already applied migrations
      const pendingMigrations = migrations.filter(
        (m) => !appliedMigrations.has(m.name)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      // Apply pending migrations
      for (const migration of pendingMigrations) {
        await this.applyMigration(migration);
      }

      logger.info('All migrations applied successfully');
    } catch (error) {
      logger.error('Migration failed', { error });
      throw error;
    }
  }
}

export const migrationRunner = new MigrationRunner();

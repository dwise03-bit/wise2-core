/**
 * Database Migration Runner
 * Executes SQL migration files in order
 * Tracks migration history in database
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

interface Migration {
  version: string;
  name: string;
  timestamp: number;
}

class MigrationRunner {
  private pool: Pool;
  private migrationsDir: string;

  constructor(pool: Pool, migrationsDir: string = './migrations') {
    this.pool = pool;
    this.migrationsDir = migrationsDir;
  }

  /**
   * Initialize migrations table
   */
  private async initializeMigrationsTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(): Promise<Migration[]> {
    const result = await this.pool.query(
      'SELECT version, name, EXTRACT(EPOCH FROM executed_at)::int as timestamp FROM schema_migrations ORDER BY version ASC',
    );
    return result.rows;
  }

  /**
   * Get list of migration files
   */
  private async getMigrationFiles(): Promise<string[]> {
    if (!fs.existsSync(this.migrationsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.migrationsDir);
    return files
      .filter((f) => f.endsWith('.sql'))
      .sort();
  }

  /**
   * Run a single migration file
   */
  private async runMigration(
    version: string,
    filename: string,
    sql: string,
  ): Promise<void> {
    const client = await this.pool.connect();

    try {
      // Start transaction
      await client.query('BEGIN');

      // Execute migration SQL
      await client.query(sql);

      // Record migration
      await client.query(
        'INSERT INTO schema_migrations (version, name) VALUES ($1, $2)',
        [version, filename],
      );

      // Commit transaction
      await client.query('COMMIT');

      console.log(`✓ Migration ${version}: ${filename}`);
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error(`✗ Migration ${version} failed: ${error}`);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Run all pending migrations
   */
  async runPendingMigrations(): Promise<void> {
    console.log('Starting database migrations...\n');

    try {
      // Initialize migrations table
      await this.initializeMigrationsTable();

      // Get executed and available migrations
      const executed = await this.getExecutedMigrations();
      const executedVersions = new Set(executed.map((m) => m.version));

      const files = await this.getMigrationFiles();
      const pending = files.filter((f) => !executedVersions.has(f));

      if (pending.length === 0) {
        console.log('No pending migrations');
        return;
      }

      console.log(`Found ${pending.length} pending migration(s):\n`);

      // Run each pending migration
      for (const file of pending) {
        const version = file.replace(/\.sql$/, '');
        const filepath = path.join(this.migrationsDir, file);
        const sql = fs.readFileSync(filepath, 'utf-8');

        await this.runMigration(version, file, sql);
      }

      console.log(
        `\n✓ All ${pending.length} migration(s) completed successfully`,
      );
    } catch (error) {
      console.error('\n✗ Migration process failed');
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    executed: Migration[];
    pending: string[];
  }> {
    await this.initializeMigrationsTable();

    const executed = await this.getExecutedMigrations();
    const executedVersions = new Set(executed.map((m) => m.version));

    const files = await this.getMigrationFiles();
    const pending = files.filter((f) => !executedVersions.has(f));

    return {
      executed,
      pending,
    };
  }

  /**
   * Rollback last migration
   */
  async rollbackLastMigration(): Promise<void> {
    const status = await this.getMigrationStatus();

    if (status.executed.length === 0) {
      console.log('No migrations to rollback');
      return;
    }

    const lastMigration = status.executed[status.executed.length - 1];
    console.log(`Rolling back migration: ${lastMigration.name}`);

    await this.pool.query(
      'DELETE FROM schema_migrations WHERE version = $1',
      [lastMigration.version],
    );

    console.log(`✓ Rollback completed`);
  }
}

// Usage: Run from command line
async function main(): Promise<void> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const runner = new MigrationRunner(
    pool,
    path.join(__dirname, 'migrations'),
  );

  const command = process.argv[2];

  try {
    switch (command) {
      case 'status':
        const status = await runner.getMigrationStatus();
        console.log('Executed migrations:');
        status.executed.forEach((m) => console.log(`  ✓ ${m.version}`));
        console.log('\nPending migrations:');
        status.pending.forEach((m) => console.log(`  ⏳ ${m}`));
        break;

      case 'rollback':
        await runner.rollbackLastMigration();
        break;

      case 'run':
      default:
        await runner.runPendingMigrations();
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

export { MigrationRunner };

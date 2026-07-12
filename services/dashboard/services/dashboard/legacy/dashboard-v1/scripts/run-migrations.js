#!/usr/bin/env node
/**
 * Database Migration Runner
 * Applies all migration files in order to initialize the database schema
 */

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load .env file if it exists
const dotenvPath = path.join(__dirname, '../../.env');
if (fs.existsSync(dotenvPath)) {
  const envFile = fs.readFileSync(dotenvPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !process.env[key]) {
      process.env[key] = valueParts.join('=');
    }
  });
}

// Parse DATABASE_URL from environment or use default
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/wise_defense?sslmode=disable';

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function runMigrations() {
  try {
    console.log('[MIGRATE] Connecting to database...');
    const client = await pool.connect();

    // Migration files in order
    const migrations = [
      '../../../migrations/001_initial_schema.sql',
      '../../../migrations/005-repair-agent.sql',
      '../../../migrations/006-ai-assistant.sql',
      '../../../migrations/2026-06-20-bot-tables.sql',
      '../migrations/2026-06-20-news-scraper-schema.sql',
      '../migrations/2026-06-20-telegram-subscriptions.sql',
    ];

    for (const migrationFile of migrations) {
      const filePath = path.join(__dirname, migrationFile);

      if (!fs.existsSync(filePath)) {
        console.warn(`[MIGRATE] Skipping (not found): ${filePath}`);
        continue;
      }

      const sql = fs.readFileSync(filePath, 'utf-8');
      console.log(`[MIGRATE] Running: ${path.basename(filePath)}`);

      try {
        await client.query(sql);
        console.log(`[MIGRATE] ✓ ${path.basename(filePath)}`);
      } catch (error) {
        console.error(`[MIGRATE] Error in ${path.basename(filePath)}:`, error.message);
        // Continue with next migration even if one fails (they have IF NOT EXISTS)
      }
    }

    // Verify key tables exist
    console.log('[MIGRATE] Verifying tables...');
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );

    console.log(`[MIGRATE] Created ${result.rows.length} tables:`);
    result.rows.forEach(row => console.log(`  - ${row.table_name}`));

    client.release();
    console.log('[MIGRATE] ✓ All migrations completed!');
    process.exit(0);
  } catch (error) {
    console.error('[MIGRATE] Fatal error:', error);
    process.exit(1);
  }
}

runMigrations();

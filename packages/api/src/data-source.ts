import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';

/**
 * Standalone TypeORM DataSource for the TypeORM CLI (migration:generate / run / revert).
 *
 * The NestJS app configures TypeORM inside app.module.ts via TypeOrmModule.forRootAsync,
 * but the CLI needs its own DataSource. This file mirrors that same configuration so
 * migrations run against the identical schema the app expects.
 *
 * Usage (from packages/api):
 *   npm run migration:run      # apply pending migrations
 *   npm run migration:revert   # roll back the last migration
 *   npm run migration:generate -- src/migrations/<Name>
 *
 * Env: reads DATABASE_URL if present, otherwise falls back to DB_* variables.
 * In production these are injected by docker-compose / the container runtime.
 */

function buildOptions(): DataSourceOptions {
  const databaseUrl = process.env.DATABASE_URL;

  let connection: Partial<DataSourceOptions>;

  if (databaseUrl) {
    // Parse DATABASE_URL format: postgresql://user:password@host:port/database
    const url = new URL(databaseUrl);
    connection = {
      type: 'postgres',
      host: url.hostname,
      port: url.port ? parseInt(url.port, 10) : 5432,
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace('/', ''),
    };
  } else {
    connection = {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
      username:
        process.env.DB_USERNAME || process.env.DB_USER || 'wise2',
      password: process.env.DB_PASSWORD || 'wise2dev',
      database: process.env.DB_NAME || 'wise2',
    };
  }

  return {
    ...(connection as DataSourceOptions),
    // __dirname resolves to dist/ at runtime, src/ under ts-node — the globs
    // cover both .ts (CLI via ts-node) and .js (compiled) extensions.
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    // The CLI never auto-syncs or auto-runs; migrations are explicit.
    synchronize: false,
    migrationsRun: false,
    logging: process.env.NODE_ENV !== 'production',
  };
}

// NOTE: exactly ONE export of a DataSource instance — the TypeORM CLI rejects a
// file that exports the same DataSource twice ("must contain only one export").
export const AppDataSource = new DataSource(buildOptions());

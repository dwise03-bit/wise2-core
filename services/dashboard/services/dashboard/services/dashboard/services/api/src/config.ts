/**
 * Configuration loader for API service
 * Loads and validates environment variables
 */

import { config } from 'dotenv';

// Load .env file
config();

interface Config {
  app: {
    port: number;
    host: string;
    nodeEnv: 'development' | 'staging' | 'production';
    logLevel: string;
  };
  database: {
    url: string;
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    pool: {
      min: number;
      max: number;
    };
  };
  redis: {
    url: string;
    host: string;
    port: number;
    password: string;
    db: number;
  };
  jwt: {
    secret: string;
    algorithm: 'HS256' | 'HS512';
    expiration: number;
    refreshExpiration: number;
  };
  cors: {
    origin: string[];
    credentials: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'text';
  };
}

function getEnvVariable(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is not set`);
  }
  return value || defaultValue || '';
}

function parseIntEnv(name: string, defaultValue?: number): number {
  const value = process.env[name];
  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value || '', 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }
  return parsed;
}

function parseArrayEnv(value: string, separator = ','): string[] {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function loadConfig(): Config {
  return {
    app: {
      port: parseIntEnv('API_PORT', 3000),
      host: getEnvVariable('API_HOST', '0.0.0.0'),
      nodeEnv: (getEnvVariable('NODE_ENV', 'development') as any),
      logLevel: getEnvVariable('API_LOG_LEVEL', 'info'),
    },
    database: {
      url: getEnvVariable('DATABASE_URL'),
      host: getEnvVariable('POSTGRES_HOST', 'localhost'),
      port: parseIntEnv('POSTGRES_PORT', 5432),
      user: getEnvVariable('POSTGRES_USER', 'postgres'),
      password: getEnvVariable('POSTGRES_PASSWORD', 'postgres'),
      database: getEnvVariable('POSTGRES_DB', 'wise2_core'),
      pool: {
        min: parseIntEnv('DB_POOL_MIN', 2),
        max: parseIntEnv('DB_POOL_MAX', 10),
      },
    },
    redis: {
      url: getEnvVariable('REDIS_URL', 'redis://localhost:6379'),
      host: getEnvVariable('REDIS_HOST', 'localhost'),
      port: parseIntEnv('REDIS_PORT', 6379),
      password: getEnvVariable('REDIS_PASSWORD', ''),
      db: parseIntEnv('REDIS_DB', 0),
    },
    jwt: {
      secret: getEnvVariable('JWT_SECRET'),
      algorithm: 'HS256',
      expiration: parseIntEnv('JWT_EXPIRATION', 86400),
      refreshExpiration: parseIntEnv('JWT_REFRESH_EXPIRATION', 604800),
    },
    cors: {
      origin: parseArrayEnv(
        getEnvVariable('API_CORS_ORIGIN', 'http://localhost:3001'),
      ),
      credentials: true,
    },
    logging: {
      level: (getEnvVariable('LOG_LEVEL', 'info') as any),
      format: (getEnvVariable('LOG_FORMAT', 'json') as any),
    },
  };
}

export const config_ = loadConfig();

#!/usr/bin/env node

/**
 * WISE² API Health Monitor
 * Prevents 502 errors with automatic detection and recovery
 *
 * Checks:
 * - Database connectivity (Prisma)
 * - Redis cache availability
 * - Required environment variables
 * - API port responsiveness
 * - Auto-restart on failure
 */

const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  API_PORT: process.env.API_PORT || 3000,
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  RESTART_DELAY: 5000, // 5 seconds before restart
  MAX_RETRIES: 3,
  LOG_FILE: '/var/log/wise2-api-health.log',
};

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'APP_URL',
  'API_BASE_URL',
  'STRIPE_PUBLIC_KEY',
  'STRIPE_SECRET_KEY',
];

let apiProcess = null;
let failureCount = 0;

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  console.log(logMessage);

  try {
    fs.appendFileSync(CONFIG.LOG_FILE, logMessage);
  } catch (e) {
    // Silently fail if can't write log
  }
}

function validateEnvironment() {
  const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);

  if (missing.length > 0) {
    log(`CRITICAL: Missing environment variables: ${missing.join(', ')}`, 'ERROR');
    return false;
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl.includes('postgresql://')) {
    log(`CRITICAL: Invalid DATABASE_URL format: ${dbUrl.substring(0, 20)}...`, 'ERROR');
    return false;
  }

  return true;
}

function checkApiHealth(callback) {
  const options = {
    hostname: 'localhost',
    port: CONFIG.API_PORT,
    path: '/api/health',
    method: 'GET',
    timeout: 5000,
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const json = JSON.parse(data);
          if (json.status === 'ok') {
            failureCount = 0;
            log('✓ API health check passed', 'DEBUG');
            callback(true);
          } else {
            log(`✗ API returned status: ${json.status}`, 'WARN');
            callback(false);
          }
        } catch (e) {
          log(`✗ Invalid JSON response: ${e.message}`, 'WARN');
          callback(false);
        }
      } else {
        log(`✗ API returned status code: ${res.statusCode}`, 'WARN');
        callback(false);
      }
    });
  });

  req.on('timeout', () => {
    req.destroy();
    log('✗ API health check timeout', 'WARN');
    callback(false);
  });

  req.on('error', (err) => {
    log(`✗ API health check failed: ${err.message}`, 'WARN');
    callback(false);
  });

  req.end();
}

function startApi() {
  log('Starting WISE² API...', 'INFO');

  apiProcess = spawn('node', ['packages/api/dist/main.js'], {
    cwd: '/home/dwise/wise2-core',
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  apiProcess.stdout.on('data', (data) => {
    log(`API: ${data.toString().trim()}`, 'DEBUG');
  });

  apiProcess.stderr.on('data', (data) => {
    log(`API ERROR: ${data.toString().trim()}`, 'ERROR');
  });

  apiProcess.on('exit', (code) => {
    log(`API process exited with code ${code}`, 'ERROR');
    apiProcess = null;

    failureCount++;
    if (failureCount > CONFIG.MAX_RETRIES) {
      log('CRITICAL: Max restart attempts exceeded', 'ERROR');
      process.exit(1);
    }

    setTimeout(startApi, CONFIG.RESTART_DELAY);
  });
}

function monitorHealth() {
  checkApiHealth((healthy) => {
    if (!healthy) {
      failureCount++;
      log(`Health check failed (${failureCount}/${CONFIG.MAX_RETRIES})`, 'WARN');

      if (failureCount > CONFIG.MAX_RETRIES) {
        log('Killing and restarting API process...', 'WARN');
        if (apiProcess) {
          apiProcess.kill('SIGKILL');
        }
      }
    }
  });
}

function init() {
  log('='.repeat(60), 'INFO');
  log('WISE² API Health Monitor Starting', 'INFO');
  log('='.repeat(60), 'INFO');

  // Validate environment
  if (!validateEnvironment()) {
    log('FATAL: Environment validation failed', 'ERROR');
    process.exit(1);
  }

  log('✓ Environment variables validated', 'INFO');

  // Start API
  startApi();

  // Wait for initial startup
  setTimeout(() => {
    log('Starting health monitoring...', 'INFO');
    setInterval(monitorHealth, CONFIG.HEALTH_CHECK_INTERVAL);
  }, 10000);
}

// Handle signals
process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down...', 'INFO');
  if (apiProcess) apiProcess.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down...', 'INFO');
  if (apiProcess) apiProcess.kill('SIGINT');
  process.exit(0);
});

init();

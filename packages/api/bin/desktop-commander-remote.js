#!/usr/bin/env node
/**
 * WISE² Mac Remote Control Bridge
 * Permanent connection for Claude remote operations
 * 
 * Supervised by launchd (auto-restart on crash)
 * Logs: ~/.wise2/bridge.log
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const PORT = process.env.WISE2_BRIDGE_PORT || 9999;
const LOG_DIR = path.join(process.env.HOME || '/Users/danielwise', '.wise2');
const LOG_FILE = path.join(LOG_DIR, 'bridge.log');
const STATUS_FILE = path.join(LOG_DIR, 'bridge.status');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Logger
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  process.stdout.write(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage, { flag: 'a' });
}

// Status tracker
function updateStatus(status) {
  const statusData = {
    status,
    pid: process.pid,
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
  };
  fs.writeFileSync(STATUS_FILE, JSON.stringify(statusData, null, 2));
}

// Handle signals
process.on('SIGTERM', () => {
  log('Received SIGTERM, shutting down gracefully');
  updateStatus('stopping');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('Received SIGINT, shutting down gracefully');
  updateStatus('stopping');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`Uncaught exception: ${error.message}`, 'ERROR');
  log(error.stack, 'ERROR');
  updateStatus('crashed');
  process.exit(1);
});

// Create HTTP server for health checks & commands
const server = http.createServer(async (req, res) => {
  log(`${req.method} ${req.url}`);

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      pid: process.pid,
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    }));
    return;
  }

  // Status endpoint
  if (req.url === '/status') {
    try {
      const statusData = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf-8'));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(statusData));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  // Remote command execution
  if (req.url === '/exec' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { command } = JSON.parse(body);
        if (!command) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'No command provided' }));
          return;
        }

        log(`Executing command: ${command}`);
        const { stdout, stderr } = await execAsync(command);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          stdout,
          stderr,
          command,
        }));
      } catch (error) {
        log(`Command error: ${error.message}`, 'ERROR');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message,
        }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Start server
server.listen(PORT, 'localhost', () => {
  log(`✅ WISE² Mac Bridge listening on http://localhost:${PORT}`);
  log(`   Health: http://localhost:${PORT}/health`);
  log(`   Status: http://localhost:${PORT}/status`);
  log(`   Exec:   POST http://localhost:${PORT}/exec`);
  updateStatus('running');
});

server.on('error', (error) => {
  log(`Server error: ${error.message}`, 'ERROR');
  updateStatus('error');
  process.exit(1);
});

// Log startup
log('========================================');
log('WISE² Mac Remote Control Bridge');
log(`PID: ${process.pid}`);
log(`Port: ${PORT}`);
log(`Node: ${process.version}`);
log(`Home: ${process.env.HOME}`);
log('========================================');

// Keep process alive
setInterval(() => {
  updateStatus('running');
}, 30000);

log('✅ Bridge initialized and ready');

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import * as pty from 'node-pty';
import os from 'os';
import si from 'systeminformation';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbOps } from './database.js';
import { Tail } from 'tail';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3030;
const STATIC_DIR = path.join(__dirname, '../dist');
const WORKSPACE_DIR = process.env.WISE2_WORKSPACE || path.resolve(__dirname, '../..');

// Serve static files
app.use(express.static(STATIC_DIR));

// Terminal sessions storage
const sessions = new Map();
let sessionCounter = 0;

// System monitoring
const systemMetrics = {
  cpu: 0,
  memory: 0,
  disk: 0,
  services: {},
  recentCommands: [],
};

// Update system metrics every 2 seconds
async function updateSystemMetrics() {
  try {
    const cpuLoad = await si.currentLoad();
    const memInfo = await si.mem();
    const diskInfo = await si.fsSize();

    systemMetrics.cpu = Math.round(cpuLoad.currentLoad);
    systemMetrics.memory = Math.round((memInfo.used / memInfo.total) * 100);

    if (diskInfo.length > 0) {
      systemMetrics.disk = Math.round((diskInfo[0].used / diskInfo[0].size) * 100);
    }

    // Check service status
    await checkServices();
  } catch (err) {
    console.error('Error updating metrics:', err.message);
  }
}

async function checkServices() {
  const services = {
    'Ollama': 'http://localhost:11434/api/tags',
    'Command Center': 'http://localhost:3004',
    'Local AI Router': 'http://localhost:3004/api/local-ai/query',
  };

  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await fetch(url, { method: 'GET', timeout: 2000 }).catch(() => ({ ok: false }));
      systemMetrics.services[name] = response.ok ? 'online' : 'offline';
    } catch {
      systemMetrics.services[name] = 'offline';
    }
  }
}

setInterval(updateSystemMetrics, 2000);
updateSystemMetrics();

// WebSocket connection handler
wss.on('connection', (ws) => {
  const sessionId = ++sessionCounter;
  const session = {
    id: sessionId,
    shell: null,
    buffer: '',
  };

  sessions.set(sessionId, session);
  console.log(`[Terminal] Session ${sessionId} connected (total: ${sessions.size})`);

  // Send initial metrics
  ws.send(JSON.stringify({
    type: 'metrics',
    data: systemMetrics,
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'init':
          initializeShell(session, ws);
          break;

        case 'input':
          if (session.shell) {
            session.shell.write(data.data);
            recordCommand(data.data);
          }
          break;

        case 'resize':
          if (session.shell) {
            session.shell.resize(data.cols, data.rows);
          }
          break;

        case 'metric-request':
          ws.send(JSON.stringify({
            type: 'metrics',
            data: systemMetrics,
          }));
          break;
      }
    } catch (err) {
      console.error('WebSocket error:', err.message);
    }
  });

  ws.on('close', () => {
    if (session.shell) {
      session.shell.kill();
    }
    sessions.delete(sessionId);
    console.log(`[Terminal] Session ${sessionId} closed (total: ${sessions.size})`);
  });

  ws.on('error', (err) => {
    console.error(`WebSocket error (session ${sessionId}):`, err.message);
  });
});

function initializeShell(session, ws) {
  try {
    const shellPath = process.env.SHELL || '/bin/zsh';
    const ptyProcess = pty.spawn(shellPath, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: WORKSPACE_DIR,
      env: {
        ...process.env,
        TERM: 'xterm-256color',
        WISE2_CODE_MODEL: process.env.WISE2_CODE_MODEL || 'ollama/wise2-coder-m4-local',
        WISE2_WORKSPACE: WORKSPACE_DIR,
      },
    });

    session.shell = ptyProcess;

    ptyProcess.onData((data) => {
      try {
        ws.send(JSON.stringify({
          type: 'output',
          data: data,
        }));
      } catch (err) {
        console.error(`[Terminal] Failed to send output (session ${session.id}):`, err.message);
      }
    });

    ptyProcess.onExit(() => {
      session.shell = null;
      try {
        ws.send(JSON.stringify({
          type: 'exit',
          code: 0,
        }));
      } catch (err) {
        // WebSocket might be closed
      }
      console.log(`[Terminal] Shell exited for session ${session.id}`);
    });

    ws.send(JSON.stringify({
      type: 'shell-ready',
    }));
    console.log(`[Terminal] PTY shell initialized for session ${session.id} (${shellPath})`);
  } catch (err) {
    console.error(`[Terminal] Failed to initialize PTY shell (session ${session.id}):`, err.message);
    try {
      ws.send(JSON.stringify({
        type: 'error',
        message: `Failed to initialize shell: ${err.message}`,
      }));
    } catch (e) {
      // WebSocket might be closed
    }
  }
}

function recordCommand(input) {
  const cmd = input.trim();
  if (cmd && !cmd.startsWith(' ')) {
    systemMetrics.recentCommands.unshift({
      command: cmd.slice(0, 100),
      timestamp: new Date().toISOString(),
    });

    if (systemMetrics.recentCommands.length > 20) {
      systemMetrics.recentCommands.pop();
    }
  }
}

// Broadcast metrics to all connected clients
setInterval(() => {
  const message = JSON.stringify({
    type: 'metrics',
    data: systemMetrics,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}, 2000);

// API Routes
app.use(express.json());

// Processes API
app.get('/api/processes', async (req, res) => {
  try {
    const processes = await si.processes();
    const topProcesses = processes.list
      .sort((a, b) => (b.memVms || 0) - (a.memVms || 0))
      .slice(0, 50)
      .map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: parseFloat((p.pcpu || 0).toFixed(1)),
        memory: parseFloat((p.pmem || 0).toFixed(1)),
        cmd: p.command || '',
      }));

    // Store in database
    dbOps.storeProcesses(topProcesses);
    res.json(topProcesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kill process
app.delete('/api/process/:pid', async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    process.kill(pid, 'SIGTERM');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logs API
const systemLogFiles = [
  '/var/log/system.log',
  '/var/log/syslog',
  '/var/log/messages',
];

let logBuffer = [];
let tail = null;

function startLogTailing() {
  const logFile = systemLogFiles.find(f => {
    try { require('fs').accessSync(f); return true; } catch { return false; }
  }) || '/var/log/system.log';

  try {
    tail = new Tail(logFile);
    tail.on('line', (line) => {
      logBuffer.unshift({
        timestamp: new Date().toISOString(),
        level: line.includes('ERROR') ? 'error' : line.includes('WARN') ? 'warn' : 'info',
        message: line,
      });

      if (logBuffer.length > 1000) {
        logBuffer = logBuffer.slice(0, 1000);
      }

      // Broadcast to WebSocket clients
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify({
            type: 'log',
            data: logBuffer[0],
          }));
        }
      });
    });
  } catch (err) {
    console.log('[Logs] Could not open log file, using mock data');
  }
}

app.get('/api/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json(logBuffer.slice(0, limit));
});

startLogTailing();

// Metrics export API
app.get('/api/export/metrics.csv', (req, res) => {
  const csv = dbOps.exportMetricsCSV();
  res.header('Content-Type', 'text/csv');
  res.header('Content-Disposition', 'attachment; filename="metrics.csv"');
  res.send(csv);
});

// Store metrics periodically
setInterval(() => {
  try {
    dbOps.storeMetrics(systemMetrics.cpu, systemMetrics.memory, systemMetrics.disk);
    dbOps.cleanup();
  } catch (err) {
    console.error('[Database] Error storing metrics:', err.message);
  }
}, 30000); // Every 30 seconds

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`[WISE² Terminal Dashboard] Running on http://localhost:${PORT}`);
  console.log('✓ WebSocket server ready');
  console.log('✓ System monitoring active');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Shutdown] Closing WebSocket connections...');
  wss.clients.forEach((client) => {
    client.close();
  });
  server.close(() => {
    console.log('[Shutdown] Server stopped');
    process.exit(0);
  });
});

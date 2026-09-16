import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { spawn } from 'child_process';
import os from 'os';
import si from 'systeminformation';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3030;
const STATIC_DIR = path.join(__dirname, '../dist');

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
            session.shell.stdin.write(data.data);
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
    const shell = spawn('zsh', [], {
      cwd: process.env.HOME,
      env: { ...process.env, TERM: 'xterm-256color' },
    });

    session.shell = shell;

    shell.stdout.on('data', (data) => {
      ws.send(JSON.stringify({
        type: 'output',
        data: data.toString(),
      }));
    });

    shell.stderr.on('data', (data) => {
      ws.send(JSON.stringify({
        type: 'output',
        data: data.toString(),
      }));
    });

    shell.on('exit', () => {
      session.shell = null;
      ws.send(JSON.stringify({
        type: 'exit',
        code: 0,
      }));
    });

    ws.send(JSON.stringify({
      type: 'shell-ready',
    }));
  } catch (err) {
    ws.send(JSON.stringify({
      type: 'error',
      message: `Failed to initialize shell: ${err.message}`,
    }));
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

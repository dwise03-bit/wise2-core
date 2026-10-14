const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const Monitor = require('./monitoring');

const app = express();
const server = http.createServer(app);
const PORT = 8765;
const monitor = new Monitor();

app.use(express.static('.'));
app.use(express.json());

// WebSocket server for real-time updates
const wss = new WebSocket.Server({ server });

// Broadcast to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('✅ Client connected to Hive');

  // Send initial status
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to WISE² Ultimate Hub',
    timestamp: new Date().toISOString()
  }));

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch (e) {
      console.log('Message received:', msg);
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected from Hive');
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WISE² Ultimate Hub',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    clients_connected: wss.clients.size
  });
});

// Get system status with real-time metrics
app.get('/api/status', (req, res) => {
  const os = require('os');
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  res.json({
    platform: os.platform(),
    cpu_count: os.cpus().length,
    cpu_model: os.cpus()[0].model,
    memory: {
      total: Math.round(totalMem / 1024 / 1024 / 1024) + ' GB',
      free: Math.round(freeMem / 1024 / 1024 / 1024) + ' GB',
      used: Math.round(usedMem / 1024 / 1024 / 1024) + ' GB',
      usage_percent: Math.round((usedMem / totalMem) * 100)
    },
    load: {
      current: os.loadavg()[0].toFixed(2),
      average: os.loadavg()
    },
    uptime: Math.round(os.uptime() / 60 / 60) + ' hours',
    node_uptime: process.uptime().toFixed(1) + 's'
  });
});

// Get time with timezone
app.get('/api/time', (req, res) => {
  const now = new Date();
  res.json({
    iso: now.toISOString(),
    locale: now.toLocaleString(),
    unix: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
});

// AI Status endpoint
app.get('/api/ai', (req, res) => {
  res.json({
    jarvis: { status: 'initialized', ready: true },
    hermes: { status: 'ready', endpoint: 'http://localhost:3012' },
    models: { ollama: 'available', local_llm: 'ready' },
    capabilities: ['voice', 'context', 'memory', 'reasoning']
  });
});

// Command handler
app.post('/api/command', (req, res) => {
  const { action, params } = req.body;

  broadcast({
    type: 'command',
    action,
    params,
    timestamp: new Date().toISOString()
  });

  res.json({
    status: 'executed',
    action,
    broadcast: true
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 WISE² Ultimate Hub is LIVE`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}`);
  console.log(`🤖 AI Ready: /api/ai\n`);
});

// Advanced monitoring endpoints
app.get('/api/metrics', (req, res) => {
  monitor.updateSystemMetrics();
  res.json(monitor.getMetrics());
});

app.get('/api/health-score', (req, res) => {
  monitor.updateSystemMetrics();
  res.json({
    score: monitor.getHealthScore(),
    max: 100,
    status: monitor.getHealthScore() > 80 ? 'excellent' : 
           monitor.getHealthScore() > 60 ? 'good' : 
           monitor.getHealthScore() > 40 ? 'fair' : 'critical',
    scale_up_recommended: monitor.shouldScaleUp()
  });
});

app.get('/api/alerts', (req, res) => {
  res.json({
    alerts: monitor.metrics.alerts,
    critical: monitor.metrics.alerts.filter(a => a.severity === 'critical'),
    warning: monitor.metrics.alerts.filter(a => a.severity === 'warning')
  });
});

app.get('/api/performance', (req, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    connections: wss.clients.size,
    requests_handled: monitor.metrics.requests,
    errors: monitor.metrics.errors,
    avg_latency: monitor.getAverageLatency() + 'ms'
  });
});

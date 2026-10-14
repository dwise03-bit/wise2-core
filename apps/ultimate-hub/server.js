const express = require('express');
const path = require('path');

const app = express();
const PORT = 8765;

app.use(express.static('.'));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'WISE² Ultimate Hub',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Get system status
app.get('/api/status', (req, res) => {
  const os = require('os');
  res.json({
    platform: os.platform(),
    cpu_count: os.cpus().length,
    memory: {
      total: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
      free: Math.round(os.freemem() / 1024 / 1024 / 1024) + ' GB'
    },
    load: os.loadavg(),
    uptime: Math.round(os.uptime() / 60 / 60) + ' hours'
  });
});

// Get time
app.get('/api/time', (req, res) => {
  res.json({
    iso: new Date().toISOString(),
    locale: new Date().toLocaleString(),
    unix: Date.now()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 WISE² Ultimate Hub is LIVE`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health\n`);
});

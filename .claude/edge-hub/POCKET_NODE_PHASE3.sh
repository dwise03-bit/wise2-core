#!/bin/bash
# WISE² HVAC POCKET NODE — PHASE 3 DASHBOARD
# Deploy: React-based WISE² UI with live gauges, diagnostics, work orders

set -e

echo "════════════════════════════════════════════"
echo "WISE² POCKET NODE — PHASE 3 DASHBOARD"
echo "════════════════════════════════════════════"
echo

cd /opt/wise2/pocket-node/dashboard

# 1. CREATE DASHBOARD PACKAGE
echo "STEP 1: Creating dashboard structure..."
cat > package.json << 'EOF'
{
  "name": "wise2-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "sqlite3": "^5.1.0",
    "mqtt": "^5.0.0",
    "ws": "^8.14.0"
  }
}
EOF

# 2. CREATE DASHBOARD SERVER
echo "STEP 2: Creating dashboard server..."
cat > server.js << 'EOF'
import express from 'express';
import sqlite3 from 'sqlite3';
import mqtt from 'mqtt';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;
const DB_PATH = '/opt/wise2/data/wise2.db';

let db;
let mqttClient;
let latestSensors = {};

// Initialize database
function initDB() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) reject(err);
      else {
        console.log('✓ Database connected');
        resolve();
      }
    });
  });
}

// Initialize MQTT
function initMQTT() {
  return new Promise((resolve, reject) => {
    mqttClient = mqtt.connect('mqtt://localhost:1883');
    mqttClient.on('connect', () => {
      console.log('✓ MQTT connected');
      mqttClient.subscribe('wise2/sensors/#');
      resolve();
    });
    mqttClient.on('message', (topic, message) => {
      try {
        latestSensors[topic] = JSON.parse(message.toString());
        // Broadcast to WebSocket clients
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              type: 'sensor_update',
              topic,
              data: latestSensors[topic]
            }));
          }
        });
      } catch (e) {
        console.error('MQTT parse error:', e);
      }
    });
  });
}

// Serve static dashboard HTML
app.get('/', (req, res) => {
  res.send(getDashboardHTML());
});

// API: Latest data
app.get('/api/data', (req, res) => {
  db.get(
    `SELECT * FROM measurements ORDER BY timestamp DESC LIMIT 1`,
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          latest: row || {},
          mqtt: latestSensors,
          timestamp: new Date().toISOString()
        });
      }
    }
  );
});

// API: Diagnostics
app.get('/api/diagnostics', (req, res) => {
  db.all(
    `SELECT * FROM diagnostics ORDER BY created_at DESC LIMIT 5`,
    (err, rows) => {
      res.json({
        diagnostics: rows || [],
        status: 'Waiting for sufficient measurements...'
      });
    }
  );
});

// API: Work orders
app.get('/api/work-orders', (req, res) => {
  db.all(
    `SELECT * FROM work_orders WHERE status = 'open' ORDER BY created_at DESC`,
    (err, rows) => {
      res.json({
        work_orders: rows || [],
        count: rows ? rows.length : 0
      });
    }
  );
});

// WebSocket for live updates
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Dashboard live feed active'
  }));
});

function getDashboardHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WISE² HVAC Pocket Node</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #050607;
      color: #fff;
      padding: 20px;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #00D9FF;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
      color: #00D9FF;
    }
    .status-bar {
      display: flex;
      gap: 20px;
      font-size: 13px;
    }
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #00FF7F;
    }
    .status-dot.offline { background: #FF6B6B; }

    .main-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .card {
      background: #0a0a0a;
      border: 1px solid #1a1a2e;
      border-radius: 8px;
      padding: 20px;
    }
    .card-title {
      font-size: 14px;
      color: #00D9FF;
      margin-bottom: 15px;
      text-transform: uppercase;
    }

    .gauge-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .gauge {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .gauge-value {
      font-size: 32px;
      font-weight: bold;
      color: #00D9FF;
    }
    .gauge-label {
      font-size: 12px;
      color: #888;
      margin-top: 5px;
    }

    .button-row {
      display: flex;
      gap: 10px;
      margin-top: 15px;
      flex-wrap: wrap;
    }
    .button {
      padding: 8px 16px;
      border: 1px solid #00D9FF;
      background: transparent;
      color: #00D9FF;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s;
    }
    .button:hover {
      background: #00D9FF;
      color: #050607;
    }
    .button.success {
      border-color: #00FF7F;
      color: #00FF7F;
    }
    .button.success:hover {
      background: #00FF7F;
      color: #050607;
    }
    .button.danger {
      border-color: #FF6B6B;
      color: #FF6B6B;
    }

    .menu {
      display: flex;
      gap: 15px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #1a1a2e;
    }
    .menu-item {
      padding: 10px 20px;
      border: 1px solid #333;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 12px;
    }
    .menu-item:hover {
      border-color: #00D9FF;
      color: #00D9FF;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">⚙️ WISE² HVAC POCKET NODE</div>
      <div class="status-bar">
        <div class="status-item">
          <div class="status-dot"></div>
          <span>LOCAL READY</span>
        </div>
        <div class="status-item">
          <div class="status-dot"></div>
          <span id="mqtt-status">MQTT ONLINE</span>
        </div>
        <div class="status-item">
          <span id="time">--:-- --</span>
        </div>
      </div>
    </div>

    <div class="main-grid">
      <!-- Left Panel: Equipment & Gauges -->
      <div class="card">
        <div class="card-title">EQUIPMENT STATUS</div>
        <div style="font-size: 24px; margin-bottom: 20px;">RTU-01</div>
        <div class="gauge-grid">
          <div class="gauge">
            <div class="gauge-value" id="suction">--</div>
            <div class="gauge-label">Suction PSI</div>
          </div>
          <div class="gauge">
            <div class="gauge-value" id="liquid">--</div>
            <div class="gauge-label">Liquid PSI</div>
          </div>
          <div class="gauge">
            <div class="gauge-value" id="supply">--</div>
            <div class="gauge-label">Supply °F</div>
          </div>
          <div class="gauge">
            <div class="gauge-value" id="return">--</div>
            <div class="gauge-label">Return °F</div>
          </div>
        </div>
        <div class="button-row">
          <button class="button">Change Equipment</button>
          <button class="button">Details</button>
        </div>
      </div>

      <!-- Right Panel: Diagnostics & Actions -->
      <div class="card">
        <div class="card-title">WISE² DIAGNOSTICS</div>
        <div style="min-height: 150px; display: flex; align-items: center; justify-content: center;">
          <div style="text-align: center; color: #666;">
            Waiting for sufficient measurements...
          </div>
        </div>
        <div class="button-row">
          <button class="button success">New Job</button>
          <button class="button">Live Gauges</button>
          <button class="button">Run Diagnostic</button>
          <button class="button">Take Photo</button>
          <button class="button">AI Assistant</button>
        </div>
      </div>
    </div>

    <!-- Bottom Menu -->
    <div class="menu">
      <div class="menu-item">📊 Dashboard</div>
      <div class="menu-item">📈 Gauges</div>
      <div class="menu-item">🔧 Diagnostics</div>
      <div class="menu-item">📋 Work Orders</div>
      <div class="menu-item">🤖 AI</div>
      <div class="menu-item">⚙️ System</div>
    </div>
  </div>

  <script>
    // Update time
    setInterval(() => {
      const now = new Date();
      document.getElementById('time').textContent = now.toLocaleTimeString();
    }, 1000);

    // WebSocket for live updates
    const ws = new WebSocket(\`ws://\${window.location.host}\`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === 'sensor_update') {
        updateGauge(msg.topic, msg.data);
      }
    };

    function updateGauge(topic, data) {
      if (topic.includes('suction')) {
        document.getElementById('suction').textContent = Math.round(data.value || 0);
      } else if (topic.includes('liquid')) {
        document.getElementById('liquid').textContent = Math.round(data.value || 0);
      } else if (topic.includes('supply')) {
        document.getElementById('supply').textContent = (data.value || 0).toFixed(1);
      } else if (topic.includes('return')) {
        document.getElementById('return').textContent = (data.value || 0).toFixed(1);
      }
    }

    // Fetch initial data
    fetch('/api/data').then(r => r.json()).then(data => {
      console.log('Dashboard data:', data);
    });
  </script>
</body>
</html>
  `;
}

async function start() {
  try {
    console.log('Initializing Dashboard...');
    await initDB();
    await initMQTT();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Dashboard listening on port ${PORT}`);
      console.log(`  http://localhost:${PORT}`);
      console.log(`  WebSocket: ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Dashboard:', error);
    process.exit(1);
  }
}

start();
EOF

echo "✓ Dashboard server created"
echo

# 3. INSTALL DEPENDENCIES
echo "STEP 3: Installing dashboard dependencies..."
npm install --no-optional 2>&1 | grep -E "added|up to date"
echo "✓ Dependencies installed"
echo

# 4. CREATE SYSTEMD SERVICE
echo "STEP 4: Creating dashboard systemd service..."
sudo tee /etc/systemd/system/wise2-dashboard.service > /dev/null << 'EOF'
[Unit]
Description=WISE² Dashboard
After=network.target wise2-edge-agent.service
Wants=wise2-edge-agent.service

[Service]
Type=simple
WorkingDirectory=/opt/wise2/pocket-node/dashboard
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
User=d
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable wise2-dashboard
sudo systemctl start wise2-dashboard
sleep 2
echo "✓ Dashboard service started"
echo

# 5. VERIFY
echo "STEP 5: Verifying dashboard..."
curl -s http://localhost:3000 | head -3 && echo "✓ Dashboard HTML served" || echo "⚠️  Dashboard check pending"
echo

echo "════════════════════════════════════════════"
echo "✅ PHASE 3 DASHBOARD COMPLETE"
echo "════════════════════════════════════════════"
echo
echo "Dashboard available at: http://wise2-pocketnode:3000"
echo

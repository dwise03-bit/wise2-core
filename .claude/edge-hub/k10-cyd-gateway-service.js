#!/usr/bin/env node
/**
 * WISE² K10 + CYD 2.8" Gateway Service
 * Runs on wisepi to bridge K10 (voice) and CYD (display) devices
 *
 * Features:
 * - HTTP proxy for K10 and CYD REST APIs
 * - MQTT broker bridge for local device communication
 * - Data sync to Pocket Node (HVAC diagnostics)
 * - Device discovery and health monitoring
 * - Real-time data forwarding (voice → HVAC → display)
 *
 * Port: 8888 (HTTP)
 * MQTT: localhost:1883
 *
 * Run: node k10-cyd-gateway-service.js
 */

const express = require('express');
const mqtt = require('mqtt');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.GATEWAY_PORT || 8888;
const MQTT_HOST = process.env.MQTT_HOST || 'localhost';
const MQTT_PORT = process.env.MQTT_PORT || 1883;
const POCKET_NODE_IP = process.env.POCKET_NODE_IP || '100.85.242.34';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MQTT Client for bridging local devices
const mqttClient = mqtt.connect(`mqtt://${MQTT_HOST}:${MQTT_PORT}`);
let mqttConnected = false;

// Device registry
const devices = {
  k10: { status: 'unknown', lastSeen: null, ip: null, port: 4000 },
  cyd: { status: 'unknown', lastSeen: null, ip: null, port: 80 },
  'pocket-node': { status: 'unknown', lastSeen: null, ip: POCKET_NODE_IP, port: 8080 }
};

// ============================================================================
// MQTT Setup
// ============================================================================

mqttClient.on('connect', () => {
  mqttConnected = true;
  console.log('✓ MQTT Connected');

  // Subscribe to all WISE² topics
  mqttClient.subscribe('wise2/#', (err) => {
    if (!err) {
      console.log('✓ Subscribed to wise2/#');
    }
  });

  // Subscribe to device topics
  mqttClient.subscribe('wise2/k10/#');
  mqttClient.subscribe('wise2/cyd/#');
  mqttClient.subscribe('wise2/pocket-node/#');
});

mqttClient.on('message', (topic, message) => {
  const msg = message.toString();
  console.log(`[MQTT] ${topic}: ${msg.substring(0, 50)}${msg.length > 50 ? '...' : ''}`);

  // Route K10 voice data to Pocket Node
  if (topic.includes('wise2/k10')) {
    forwardToPocketNode('k10', topic, msg);
  }

  // Route Pocket Node HVAC data to CYD display
  if (topic.includes('wise2/pocket-node/hvac')) {
    forwardToCYD(topic, msg);
  }
});

mqttClient.on('error', (err) => {
  console.error('✗ MQTT Error:', err.message);
  mqttConnected = false;
});

// ============================================================================
// Device Discovery & Health
// ============================================================================

async function discoverDevices() {
  console.log('\n🔍 Discovering devices...');

  const localIPs = ['192.168.8.100', '192.168.8.101', '192.168.8.102'];

  for (const ip of localIPs) {
    try {
      // Try K10 (port 4000)
      const k10Response = await axios.get(`http://${ip}:4000/health`, { timeout: 2000 });
      if (k10Response.status === 200) {
        devices.k10.ip = ip;
        devices.k10.status = 'online';
        devices.k10.lastSeen = new Date();
        console.log(`✓ K10 found at ${ip}:4000`);
      }
    } catch (e) {
      // Not K10
    }

    try {
      // Try CYD (port 80)
      const cydResponse = await axios.get(`http://${ip}:80/health`, { timeout: 2000 });
      if (cydResponse.status === 200) {
        devices.cyd.ip = ip;
        devices.cyd.status = 'online';
        devices.cyd.lastSeen = new Date();
        console.log(`✓ CYD found at ${ip}:80`);
      }
    } catch (e) {
      // Not CYD
    }
  }

  // Check Pocket Node via Tailscale
  try {
    const pocketResponse = await axios.get(`http://${POCKET_NODE_IP}:8080/health`, { timeout: 2000 });
    if (pocketResponse.status === 200) {
      devices['pocket-node'].status = 'online';
      devices['pocket-node'].lastSeen = new Date();
      console.log(`✓ Pocket Node found at ${POCKET_NODE_IP}:8080 (Tailscale)`);
    }
  } catch (e) {
    devices['pocket-node'].status = 'offline';
    console.log(`✗ Pocket Node unreachable (${e.message})`);
  }
}

// Periodic discovery (every 30 seconds)
setInterval(discoverDevices, 30000);
discoverDevices(); // Initial discovery

// ============================================================================
// HTTP Routes
// ============================================================================

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    gateway: 'wisepi',
    timestamp: new Date().toISOString(),
    mqtt: mqttConnected ? 'connected' : 'disconnected',
    devices: devices
  });
});

// Device registration (for K10 and CYD to register themselves)
app.post('/devices/register', (req, res) => {
  const { device_type, ip, port, hostname, features } = req.body;

  if (devices[device_type]) {
    devices[device_type].ip = ip;
    devices[device_type].port = port;
    devices[device_type].status = 'online';
    devices[device_type].lastSeen = new Date();

    console.log(`✓ Registered ${device_type} at ${ip}:${port}`);

    // Notify via MQTT
    mqttClient.publish(`wise2/${device_type}/registered`, JSON.stringify({
      device_type,
      ip,
      port,
      hostname,
      features,
      timestamp: new Date().toISOString()
    }));

    res.json({ status: 'registered', device_type, ip, port });
  } else {
    res.status(400).json({ error: 'Unknown device type' });
  }
});

// ============================================================================
// K10 Proxy Routes
// ============================================================================

app.get('/k10/health', async (req, res) => {
  try {
    if (!devices.k10.ip) {
      return res.status(503).json({ error: 'K10 not discovered' });
    }
    const response = await axios.get(`http://${devices.k10.ip}:${devices.k10.port}/health`);
    res.json(response.data);
  } catch (err) {
    res.status(503).json({ error: 'K10 unreachable', message: err.message });
  }
});

app.post('/k10/ask', async (req, res) => {
  try {
    if (!devices.k10.ip) {
      return res.status(503).json({ error: 'K10 not discovered' });
    }
    const response = await axios.post(
      `http://${devices.k10.ip}:${devices.k10.port}/ask`,
      req.body
    );

    // Also publish to MQTT for logging
    mqttClient.publish('wise2/k10/question', JSON.stringify(req.body));

    res.json(response.data);
  } catch (err) {
    res.status(503).json({ error: 'K10 request failed', message: err.message });
  }
});

app.get('/k10/conversation', async (req, res) => {
  try {
    if (!devices.k10.ip) {
      return res.status(503).json({ error: 'K10 not discovered' });
    }
    const response = await axios.get(`http://${devices.k10.ip}:${devices.k10.port}/conversation`);
    res.json(response.data);
  } catch (err) {
    res.status(503).json({ error: 'K10 unreachable' });
  }
});

// ============================================================================
// CYD Proxy Routes
// ============================================================================

app.get('/cyd/health', async (req, res) => {
  try {
    if (!devices.cyd.ip) {
      return res.status(503).json({ error: 'CYD not discovered' });
    }
    const response = await axios.get(`http://${devices.cyd.ip}:${devices.cyd.port}/health`);
    res.json(response.data);
  } catch (err) {
    res.status(503).json({ error: 'CYD unreachable' });
  }
});

app.post('/cyd/display', async (req, res) => {
  try {
    if (!devices.cyd.ip) {
      return res.status(503).json({ error: 'CYD not discovered' });
    }
    const response = await axios.post(
      `http://${devices.cyd.ip}:${devices.cyd.port}/display`,
      req.body
    );
    res.json(response.data);
  } catch (err) {
    res.status(503).json({ error: 'CYD display failed' });
  }
});

app.post('/cyd/brightness', async (req, res) => {
  const { level } = req.body;
  mqttClient.publish('wise2/cyd/brightness', level.toString());
  res.json({ status: 'set', brightness: level });
});

// ============================================================================
// MQTT Publish Routes
// ============================================================================

app.post('/mqtt/publish', (req, res) => {
  const { topic, message } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Missing topic' });
  }

  const payload = typeof message === 'string' ? message : JSON.stringify(message);

  mqttClient.publish(topic, payload, (err) => {
    if (err) {
      res.status(500).json({ error: 'MQTT publish failed', message: err.message });
    } else {
      res.json({ status: 'published', topic, message });
    }
  });
});

// ============================================================================
// Data Forwarding
// ============================================================================

async function forwardToPocketNode(deviceType, topic, message) {
  if (!mqttConnected || !devices['pocket-node'].ip) {
    return;
  }

  try {
    // Forward via MQTT to Pocket Node (if it has MQTT access)
    const pocketMqtt = mqtt.connect(`mqtt://${devices['pocket-node'].ip}:1883`);

    pocketMqtt.on('connect', () => {
      pocketMqtt.publish(topic, message);
      pocketMqtt.end();
    });
  } catch (err) {
    // Fall back to HTTP API
    try {
      await axios.post(
        `http://${devices['pocket-node'].ip}:8080/api/receive-data`,
        { topic, message, source: deviceType },
        { timeout: 5000 }
      );
    } catch (e) {
      console.error(`✗ Could not forward ${deviceType} data to Pocket Node:`, e.message);
    }
  }
}

async function forwardToCYD(topic, message) {
  if (!devices.cyd.ip) {
    console.error('✗ CYD not discovered, cannot forward HVAC data');
    return;
  }

  try {
    // Parse HVAC data and send to CYD
    let data = message;
    try {
      data = JSON.parse(message);
    } catch (e) {
      // Not JSON, send as string
    }

    await axios.post(
      `http://${devices.cyd.ip}:80/api/update-display`,
      { topic, data },
      { timeout: 3000 }
    );

    console.log('✓ HVAC data forwarded to CYD');
  } catch (err) {
    console.error('✗ Failed to forward data to CYD:', err.message);
  }
}

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log('\n════════════════════════════════════════════════════════');
  console.log('WISE² K10 + CYD Gateway Service');
  console.log('════════════════════════════════════════════════════════');
  console.log(`Listening on ${PORT}`);
  console.log(`MQTT: ${MQTT_HOST}:${MQTT_PORT}`);
  console.log(`Pocket Node: ${POCKET_NODE_IP}:8080`);
  console.log('════════════════════════════════════════════════════════\n');
  console.log('Endpoints:');
  console.log(`  GET  /health                     - Gateway status`);
  console.log(`  POST /devices/register           - Register K10/CYD`);
  console.log(`  GET  /k10/health                 - K10 status`);
  console.log(`  POST /k10/ask                    - Send voice query to K10`);
  console.log(`  GET  /cyd/health                 - CYD status`);
  console.log(`  POST /cyd/display                - Update CYD display`);
  console.log(`  POST /mqtt/publish               - Publish to MQTT`);
  console.log('\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  mqttClient.end();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nTerminating...');
  mqttClient.end();
  process.exit(0);
});

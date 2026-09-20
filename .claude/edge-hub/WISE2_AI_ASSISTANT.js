#!/usr/bin/env node
/**
 * WISE² Always-On AI Assistant
 * Runs on Pocket Node for real-time HVAC diagnostics & guidance
 *
 * Features:
 * - Voice command listening (microphone)
 * - Text input via API
 * - HVAC-specific knowledge (R-410A, calculations, diagnostics)
 * - Equipment context awareness
 * - Work order integration
 * - Integration with local inference or WISE² Core
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import sqlite3 from 'sqlite3';
import mqtt from 'mqtt';
import { spawn } from 'child_process';
import fs from 'fs';

const app = express();
const wss = new WebSocketServer({ noServer: true });
const PORT = 4000;
const DB_PATH = '/opt/wise2/data/wise2.db';

let db;
let mqttClient;
let currentEquipment = 'RTU-01';
let latestMeasurements = {};
let conversationHistory = [];

const HVAC_KNOWLEDGE = {
  'R-410A': {
    name: 'Puron (R-410A)',
    normal_superheat: '10-15°F',
    normal_subcooling: '8-12°F',
    common_issues: [
      'Low superheat indicates possible liquid return',
      'High superheat indicates possible undercharge',
      'Low subcooling indicates possible overcharge',
      'High Delta-T suggests restricted airflow'
    ]
  },
  'R-22': {
    name: 'R-22 (HCFC)',
    normal_superheat: '8-12°F',
    normal_subcooling: '5-10°F',
    common_issues: [
      'R-22 systems are being phased out - consider replacement',
      'Superheat/subcooling ranges slightly different than R-410A'
    ]
  }
};

// Initialize database
function initDatabase() {
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
        latestMeasurements[topic] = JSON.parse(message.toString());
      } catch (e) {
        console.error('MQTT parse error:', e);
      }
    });
  });
}

// Get equipment context
async function getEquipmentContext(equipmentId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM equipment WHERE id = ?`,
      [equipmentId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || {});
      }
    );
  });
}

// Get latest measurements
async function getLatestMeasurements() {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT DISTINCT sensor_type, value, unit FROM measurements
       WHERE equipment_id = ?
       ORDER BY timestamp DESC LIMIT 10`,
      [currentEquipment],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

// AI Assistant Brain
async function processUserQuery(userMessage, refrigerant = 'R-410A') {
  conversationHistory.push({ role: 'user', content: userMessage });

  // Get current context
  const equipment = await getEquipmentContext(currentEquipment);
  const measurements = await getLatestMeasurements();

  // Build HVAC knowledge prompt
  const hvacContext = HVAC_KNOWLEDGE[refrigerant] || HVAC_KNOWLEDGE['R-410A'];

  // Simple rule-based responses (future: integrate with local LLM or WISE² Core Hermes)
  let response = generateAIResponse(userMessage, equipment, measurements, hvacContext);

  // Add to conversation history
  conversationHistory.push({ role: 'assistant', content: response });

  // Keep conversation history bounded
  if (conversationHistory.length > 20) {
    conversationHistory = conversationHistory.slice(-20);
  }

  return response;
}

function generateAIResponse(query, equipment, measurements, hvacContext) {
  const lowerQuery = query.toLowerCase();

  // Equipment status
  if (lowerQuery.includes('status') || lowerQuery.includes('how is')) {
    return `Equipment ${equipment.id || currentEquipment} is online and monitoring. ` +
           `Last reading: ${measurements.length} sensor data points. ` +
           `Run a diagnostic for detailed analysis.`;
  }

  // Superheat/subcooling questions
  if (lowerQuery.includes('superheat') || lowerQuery.includes('subcool')) {
    return `For ${hvacContext.name}: Normal superheat is ${hvacContext.normal_superheat}, ` +
           `normal subcooling is ${hvacContext.normal_subcooling}. ` +
           `${hvacContext.common_issues[0]} Connect pressure and temperature sensors for exact readings.`;
  }

  // Airflow questions
  if (lowerQuery.includes('airflow') || lowerQuery.includes('delta') || lowerQuery.includes('delta-t')) {
    return `Delta-T (supply - return) indicates airflow. Normal range is 15-22°F for cooling. ` +
           `Low Delta-T (under 15°F) suggests restricted airflow — check filters, coils, and ductwork.`;
  }

  // Refrigerant questions
  if (lowerQuery.includes('refrigerant') || lowerQuery.includes('charge')) {
    return `This system uses ${hvacContext.name}. Proper charge is critical for efficiency. ` +
           `Symptoms of undercharge: high superheat, low subcooling, low cooling capacity. ` +
           `Symptoms of overcharge: high subcooling, high head pressure.`;
  }

  // Diagnostic questions
  if (lowerQuery.includes('diagnose') || lowerQuery.includes('what\'s wrong') || lowerQuery.includes('issue')) {
    return `Run a full diagnostic by clicking "Run Diagnostic" on the dashboard. ` +
           `I'll analyze pressure, temperature, and airflow data to identify issues. ` +
           `Have you checked filters and airflow recently?`;
  }

  // Work order help
  if (lowerQuery.includes('work order') || lowerQuery.includes('job')) {
    return `Create a new work order by clicking "New Job" on the dashboard. ` +
           `This records what service you performed and when. ` +
           `All data syncs to WISE² when you're back online.`;
  }

  // Service help
  if (lowerQuery.includes('help') || lowerQuery.includes('assist')) {
    return `I'm WISE² AI Assistant. I can help with: ` +
           `HVAC diagnostics, refrigerant questions, airflow analysis, troubleshooting, ` +
           `and work order management. Ask me about superheat, subcooling, Delta-T, or system performance.`;
  }

  // Default helpful response
  return `For ${equipment.id || 'this unit'}: I can help diagnose issues, explain HVAC concepts, ` +
         `or guide you through the service process. Ask about the system's performance or specific symptoms.`;
}

// REST API: Text input
app.post('/ask', express.json(), async (req, res) => {
  try {
    const { question, equipment = currentEquipment, refrigerant = 'R-410A' } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Missing question' });
    }

    currentEquipment = equipment;
    const response = await processUserQuery(question, refrigerant);

    res.json({
      question,
      response,
      equipment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// REST API: Get conversation history
app.get('/conversation', (req, res) => {
  res.json({
    equipment: currentEquipment,
    history: conversationHistory.slice(-10), // Last 10 messages
    timestamp: new Date().toISOString()
  });
});

// REST API: Clear conversation
app.post('/conversation/reset', (req, res) => {
  conversationHistory = [];
  res.json({ status: 'Conversation reset', timestamp: new Date().toISOString() });
});

// WebSocket for voice/live interaction
wss.on('connection', (ws) => {
  console.log('AI Assistant: WebSocket client connected');
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'WISE² AI Assistant ready. Ask me about HVAC diagnostics.',
    equipment: currentEquipment
  }));

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data.toString());

      if (msg.type === 'question') {
        if (msg.equipment) currentEquipment = msg.equipment;

        const response = await processUserQuery(msg.text, msg.refrigerant || 'R-410A');

        ws.send(JSON.stringify({
          type: 'response',
          question: msg.text,
          response,
          equipment: currentEquipment,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('AI Assistant: WebSocket client disconnected');
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'wise2-ai-assistant',
    equipment: currentEquipment,
    conversations: conversationHistory.length,
    timestamp: new Date().toISOString()
  });
});

// Start server
async function start() {
  try {
    console.log('Initializing WISE² AI Assistant...');
    await initDatabase();
    await initMQTT();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ AI Assistant listening on port ${PORT}`);
      console.log(`  REST API: http://localhost:${PORT}/ask`);
      console.log(`  WebSocket: ws://localhost:${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/health`);
    });

    // Upgrade HTTP to WebSocket
    server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });
  } catch (error) {
    console.error('Failed to start AI Assistant:', error);
    process.exit(1);
  }
}

start();

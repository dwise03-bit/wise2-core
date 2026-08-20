#!/usr/bin/env node

/**
 * USB Serial Bridge for K10 Defense IMP
 *
 * Bridges HTTP API requests from K10 device via USB serial connection.
 * Useful for testing and offline operation.
 *
 * Usage:
 *   npm install serialport dotenv axios
 *   node usb-serial-bridge.js
 *
 * K10 will send JSON requests on serial, this bridge forwards to HTTP API
 * and returns responses.
 */

const SerialPort = require('serialport');
const readline = require('readline');
const axios = require('axios');
require('dotenv').config();

const SERIAL_PORT = process.env.K10_SERIAL_PORT || '/dev/ttyUSB0';
const SERIAL_BAUD = 115200;
const API_BASE_URL = process.env.EDGE_API_URL || 'http://localhost:3000';

let port;
let isConnected = false;

async function init() {
  console.log(`🔗 USB Serial Bridge for K10 Defense IMP`);
  console.log(`📡 Serial: ${SERIAL_PORT} @ ${SERIAL_BAUD} baud`);
  console.log(`🌐 API: ${API_BASE_URL}`);
  console.log('');

  try {
    // Open serial port
    port = new SerialPort(SERIAL_PORT, {
      baudRate: SERIAL_BAUD,
      autoOpen: false,
    });

    port.open((err) => {
      if (err) {
        console.error('❌ Failed to open serial port:', err.message);
        process.exit(1);
      }

      console.log('✅ Serial port opened');
      isConnected = true;

      // Line-based reading
      const rl = readline.createInterface({
        input: port,
      });

      rl.on('line', async (line) => {
        await handleSerialRequest(line.trim());
      });

      rl.on('close', () => {
        console.log('❌ Serial connection closed');
        isConnected = false;
      });

      rl.on('error', (err) => {
        console.error('❌ Serial error:', err.message);
      });
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      if (port && isConnected) {
        port.close();
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to initialize:', error.message);
    process.exit(1);
  }
}

async function handleSerialRequest(line) {
  if (!line) return;

  console.log(`📨 K10: ${line}`);

  try {
    const req = JSON.parse(line);

    if (req.type === 'get_defense_imp_data') {
      const response = await axios.get(`${API_BASE_URL}/defense-imp/data`, {
        timeout: 3000,
      });

      sendSerialResponse(response.data);
    } else {
      console.warn(`⚠️  Unknown request type: ${req.type}`);
      sendSerialError(`Unknown request type: ${req.type}`);
    }
  } catch (error) {
    if (error.response) {
      console.error(`❌ API error: ${error.response.status} ${error.response.statusText}`);
      sendSerialError(`API error: ${error.response.status}`);
    } else {
      console.error(`❌ Error: ${error.message}`);
      sendSerialError(error.message);
    }
  }
}

function sendSerialResponse(data) {
  if (!port || !isConnected) {
    console.error('❌ Serial port not available');
    return;
  }

  try {
    const json = JSON.stringify(data);
    port.write(json + '\n', (err) => {
      if (err) {
        console.error('❌ Failed to write to serial:', err.message);
      } else {
        console.log(`📤 Response sent (${json.length} bytes)`);
      }
    });
  } catch (error) {
    console.error('❌ Serialization error:', error.message);
  }
}

function sendSerialError(message) {
  if (!port || !isConnected) {
    console.error('❌ Serial port not available');
    return;
  }

  const error = JSON.stringify({ error: message });
  port.write(error + '\n', (err) => {
    if (err) {
      console.error('❌ Failed to write error to serial:', err.message);
    } else {
      console.log(`📤 Error response sent`);
    }
  });
}

// Start the bridge
init().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

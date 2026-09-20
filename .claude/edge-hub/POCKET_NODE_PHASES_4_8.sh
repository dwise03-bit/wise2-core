#!/bin/bash
# WISE² HVAC POCKET NODE — PHASES 4, 5, 6, 7, 8
# Sensor Pod, HVAC Engine, Field Workflow, Sync, Hardening

set -e

cd /opt/wise2/pocket-node

echo "════════════════════════════════════════════"
echo "PHASES 4-8: COMPREHENSIVE DEPLOYMENT"
echo "════════════════════════════════════════════"
echo

# ============================================
# PHASE 4: SENSOR POD INTEGRATION
# ============================================
echo
echo "PHASE 4: SENSOR POD INTEGRATION"
echo "================================"
echo

mkdir -p sensors

cat > sensors/sensor-pod-adapter.js << 'EOF'
import mqtt from 'mqtt';
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const mqttClient = mqtt.connect('mqtt://localhost:1883');
let serialPort;

export async function initSensorPod() {
  return new Promise((resolve, reject) => {
    // Try to connect to ESP32 sensor pod via USB serial
    const port = new SerialPort('/dev/ttyUSB0', { baudRate: 115200 }, (err) => {
      if (err) {
        console.log('⚠️  Sensor Pod USB not found (awaiting hardware connection)');
        // Sensor pod is optional for MVP
        resolve();
        return;
      }

      const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

      parser.on('data', (line) => {
        try {
          const data = JSON.parse(line);
          const topic = `wise2/sensors/${data.type}`;
          mqttClient.publish(topic, JSON.stringify({
            value: data.value,
            unit: data.unit,
            timestamp: new Date().toISOString()
          }));
        } catch (e) {
          // Non-JSON lines ignored
        }
      });

      serialPort = port;
      console.log('✓ Sensor Pod connected via USB serial');
      resolve();
    });
  });
}

export function getSensorPodStatus() {
  return {
    connected: !!serialPort,
    port: '/dev/ttyUSB0',
    baudRate: 115200
  };
}
EOF

echo "✓ Sensor Pod adapter created"

# ============================================
# PHASE 5: HVAC CALCULATION ENGINE
# ============================================
echo
echo "PHASE 5: HVAC CALCULATION ENGINE"
echo "================================="
echo

mkdir -p diagnostics/calculations

cat > diagnostics/hvac-engine.js << 'EOF'
// HVAC Diagnostics & Calculations
// Supports R-410A, R-22, R-32, R-454B

export const REFRIGERANTS = {
  'R-410A': {
    name: 'R-410A (Puron)',
    saturation: {
      '100': 64.5, '110': 74.3, '120': 84.1, '130': 94.0,
      '140': 104.0, '150': 114.0, '160': 124.0, '170': 134.0,
      '180': 144.0, '190': 154.0, '200': 164.0
    }
  },
  'R-22': {
    name: 'R-22 (HCFC)',
    saturation: {
      '60': 33.7, '70': 45.6, '80': 58.5, '90': 72.6,
      '100': 86.8, '110': 101.0, '120': 116.0, '130': 131.0
    }
  }
};

export function calculateSuperheat(suctionPressure, suctionTemp, refrigerant) {
  const refData = REFRIGERANTS[refrigerant];
  if (!refData) return null;

  // Find saturation temp from pressure
  const satTemp = findSaturationTemp(suctionPressure, refData.saturation);
  if (!satTemp) return null;

  return suctionTemp - satTemp;
}

export function calculateSubcooling(liquidPressure, liquidTemp, refrigerant) {
  const refData = REFRIGERANTS[refrigerant];
  if (!refData) return null;

  const satTemp = findSaturationTemp(liquidPressure, refData.saturation);
  if (!satTemp) return null;

  return satTemp - liquidTemp;
}

export function calculateDeltaT(supplyTemp, returnTemp) {
  return Math.abs(returnTemp - supplyTemp);
}

export function calculateStaticPressure(suctionPsi, liquidPsi, deltaT) {
  // Rough estimate: higher pressure differential correlates with airflow restriction
  const pressureDiff = liquidPsi - suctionPsi;
  if (pressureDiff > 300) return 'HIGH - possible restriction';
  if (pressureDiff < 150) return 'LOW - possible overcharge or leak';
  return 'NORMAL';
}

function findSaturationTemp(pressure, saturationTable) {
  const keys = Object.keys(saturationTable).map(Number).sort((a,b) => a-b);

  for (let i = 0; i < keys.length - 1; i++) {
    if (pressure >= keys[i] && pressure <= keys[i+1]) {
      const p1 = keys[i], p2 = keys[i+1];
      const t1 = saturationTable[p1], t2 = saturationTable[p2];
      return t1 + (pressure - p1) * (t2 - t1) / (p2 - p1);
    }
  }
  return null;
}

export function generateDiagnosticReport(measurements, refrigerant) {
  const {suction, liquid, supplyTemp, returnTemp} = measurements;

  if (!suction || !liquid || !supplyTemp || !returnTemp) {
    return { status: 'INSUFFICIENT_DATA', message: 'Awaiting sensor data...' };
  }

  const superheat = calculateSuperheat(suction, supplyTemp, refrigerant);
  const subcooling = calculateSubcooling(liquid, returnTemp, refrigerant);
  const deltaT = calculateDeltaT(supplyTemp, returnTemp);
  const staticPressure = calculateStaticPressure(suction, liquid, deltaT);

  const issues = [];
  if (superheat < 5) issues.push('LOW SUPERHEAT - possible liquid return');
  if (superheat > 20) issues.push('HIGH SUPERHEAT - possible undercharge');
  if (subcooling < 5) issues.push('LOW SUBCOOLING - possible overcharge');
  if (deltaT < 10) issues.push('LOW DELTA-T - poor airflow or filter clog');
  if (deltaT > 25) issues.push('HIGH DELTA-T - possible overcharge');

  return {
    status: issues.length > 0 ? 'DIAGNOSTIC_ISSUES' : 'NORMAL',
    superheat: superheat ? superheat.toFixed(1) : '--',
    subcooling: subcooling ? subcooling.toFixed(1) : '--',
    deltaT: deltaT.toFixed(1),
    staticPressure,
    issues,
    refrigerant
  };
}
EOF

echo "✓ HVAC calculation engine created"

# ============================================
# PHASE 6: FIELD WORKFLOW
# ============================================
echo
echo "PHASE 6: FIELD WORKFLOW"
echo "======================="
echo

mkdir -p calculations

sqlite3 /opt/wise2/data/wise2.db << 'EOSQL'
-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment models
INSERT OR IGNORE INTO equipment (id, name, model, serial, location)
VALUES
  ('RTU-01', 'Rooftop Unit', 'AHRI 1234567', 'SN12345', 'Main Bldg'),
  ('AC-01', 'Window Unit', 'Model X5', 'SN98765', 'Office');

-- Sample work order
INSERT OR IGNORE INTO work_orders (id, equipment_id, title, status)
VALUES
  ('WO-001', 'RTU-01', 'Routine Maintenance', 'open');
EOSQL

echo "✓ Field workflow database updated"

# ============================================
# PHASE 7: WISE² SYNC
# ============================================
echo
echo "PHASE 7: WISE² SYNC & INTEGRATION"
echo "=================================="
echo

mkdir -p sync

cat > sync/wise2-sync.js << 'EOF'
// WISE² Sync Service
// Queues local data for sync to WISE² Core when online

import sqlite3 from 'sqlite3';
import fs from 'fs';

const DB_PATH = '/opt/wise2/data/wise2.db';
const SYNC_QUEUE_FILE = '/opt/wise2/data/sync-queue.json';

let db;

export function initSync() {
  db = new sqlite3.Database(DB_PATH);
  console.log('✓ WISE² Sync initialized');
}

export function queueForSync(record) {
  const queue = loadSyncQueue();
  queue.push({
    ...record,
    local_timestamp: new Date().toISOString(),
    synced: false
  });
  saveSyncQueue(queue);
}

export function getSyncQueue() {
  return loadSyncQueue().filter(r => !r.synced);
}

export async function attemptSync(wise2CoreURL) {
  const queue = getSyncQueue();
  if (queue.length === 0) {
    console.log('✓ Sync queue empty, nothing to send');
    return { synced: 0 };
  }

  let synced = 0;
  try {
    const response = await fetch(`${wise2CoreURL}/api/sync/pocket-node`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: queue })
    });

    if (response.ok) {
      const q = loadSyncQueue();
      q.forEach(r => r.synced = true);
      saveSyncQueue(q);
      synced = queue.length;
      console.log(`✓ Synced ${synced} records to WISE² Core`);
    }
  } catch (err) {
    console.error('Sync attempt failed (offline):', err.message);
  }

  return { synced, pending: getSyncQueue().length };
}

function loadSyncQueue() {
  try {
    if (fs.existsSync(SYNC_QUEUE_FILE)) {
      return JSON.parse(fs.readFileSync(SYNC_QUEUE_FILE));
    }
  } catch (e) {
    console.error('Error loading sync queue:', e);
  }
  return [];
}

function saveSyncQueue(queue) {
  try {
    fs.writeFileSync(SYNC_QUEUE_FILE, JSON.stringify(queue, null, 2));
  } catch (e) {
    console.error('Error saving sync queue:', e);
  }
}
EOF

echo "✓ WISE² Sync service created"

# ============================================
# PHASE 8: FIELD HARDENING & TESTING
# ============================================
echo
echo "PHASE 8: FIELD HARDENING & TESTING"
echo "==================================="
echo

# Create health check script
cat > scripts/health-check.sh << 'EOF'
#!/bin/bash

echo "WISE² Pocket Node Health Check"
echo "=============================="
echo

# CPU Temperature
TEMP=$(vcgencmd measure_temp 2>/dev/null | grep -o '[0-9]*\.[0-9]*')
echo "CPU Temperature: ${TEMP}°C"
if (( $(echo "$TEMP > 80" | bc -l) )); then echo "  ⚠️  WARNING: Temperature high"; fi

# Disk Space
DISK=$(df / | tail -1 | awk '{print $5}')
echo "Disk Usage: $DISK"
if [[ ${DISK%\%*} -gt 90 ]]; then echo "  ⚠️  WARNING: Low disk space"; fi

# Memory
MEM=$(free -h | grep Mem | awk '{print $3 " / " $2}')
echo "Memory: $MEM"

# Services
echo
echo "Service Status:"
echo "  MQTT: $(systemctl is-active mosquitto)"
echo "  Edge Agent: $(systemctl is-active wise2-edge-agent)"
echo "  Dashboard: $(systemctl is-active wise2-dashboard)"
echo "  SSH: $(systemctl is-active ssh)"

# Network
echo
echo "Network:"
IP=$(hostname -I | awk '{print $1}')
echo "  Local IP: $IP"
INTERNET=$(timeout 2 ping -c 1 8.8.8.8 2>/dev/null && echo "online" || echo "offline")
echo "  Internet: $INTERNET"

# Database
DBSIZE=$(ls -lh /opt/wise2/data/wise2.db | awk '{print $5}')
echo
echo "Database: $DBSIZE"

# API check
echo
echo "API Endpoints:"
curl -s http://localhost:8080/health > /dev/null 2>&1 && echo "  ✓ Edge API" || echo "  ✗ Edge API"
curl -s http://localhost:3000 > /dev/null 2>&1 && echo "  ✓ Dashboard" || echo "  ✗ Dashboard"

echo
echo "✅ Health check complete"
EOF

chmod +x scripts/health-check.sh
echo "✓ Health check script created"

# Systemd watchdog
cat > /etc/systemd/system/wise2-watchdog.service << 'EOF'
[Unit]
Description=WISE² Service Watchdog
After=wise2-edge-agent.service wise2-dashboard.service

[Service]
Type=oneshot
ExecStart=/bin/bash -c 'systemctl --failed | grep -q wise2 && systemctl restart wise2-edge-agent wise2-dashboard || true'
StandardOutput=journal

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
echo "✓ Watchdog service configured"

echo
echo "════════════════════════════════════════════"
echo "✅ PHASES 4-8 COMPLETE"
echo "════════════════════════════════════════════"
echo
echo "PHASE 4: Sensor Pod integration ready"
echo "PHASE 5: HVAC calculations engine deployed"
echo "PHASE 6: Field workflow database updated"
echo "PHASE 7: WISE² Sync queue service active"
echo "PHASE 8: Health monitoring & hardening ready"
echo
echo "Health check: /opt/wise2/pocket-node/scripts/health-check.sh"
echo

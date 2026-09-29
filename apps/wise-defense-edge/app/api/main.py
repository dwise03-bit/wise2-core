#!/usr/bin/env python3
"""
WISE DEFENSE EDGE INTELLIGENCE NODE
Core API Service

Production-ready FastAPI service for Raspberry Pi edge intelligence.
Handles incidents, alerts, device telemetry, and IMP coordination.

Architecture:
- Lightweight FastAPI for Pi 3B+ constraints
- SQLite for local persistence
- Offline-capable design
- Tailscale-secured cloud sync
- Multi-source intelligence correlation
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Dict, List, Any

from fastapi import FastAPI, HTTPException, Depends, Header, WebSocket
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import uvicorn
import sqlite3

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/wise2-defense/api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Constants
DATA_DIR = Path('/opt/wise2-defense/data')
DB_PATH = DATA_DIR / 'wise2-defense.db'
API_PORT = int(os.getenv('WISE_DEFENSE_API_PORT', 3014))
DEVICE_ID = os.getenv('WISE_DEFENSE_DEVICE_ID', 'EDGE-001')
CLOUD_API_KEY = os.getenv('WISE_DEFENSE_API_KEY', '')
CLOUD_URL = os.getenv('WISE_DEFENSE_CLOUD_URL', 'https://api.wise2.net')

# App
app = FastAPI(
    title='WISE Defense Edge Intelligence',
    version='1.0.0',
    docs_url=None,  # Disable docs in production
    redoc_url=None,
    openapi_url=None
)

# Models
class Incident(BaseModel):
    provider: str
    provider_incident_id: Optional[str] = None
    headline: str
    category: str
    incident_type: str
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    approximate_location: Optional[str] = None
    source_url: Optional[str] = None
    verification_status: str = 'UNVERIFIED'

class WatchZone(BaseModel):
    name: str
    latitude: float
    longitude: float
    radius_miles: float
    kind: str = 'CUSTOM'
    categories: List[str] = []
    minimum_threat: str = 'ELEVATED'
    enabled: bool = True

class MeshTelemetry(BaseModel):
    node_id: str
    long_name: Optional[str] = None
    short_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    battery_level: Optional[int] = None
    voltage: Optional[float] = None
    snr: Optional[float] = None
    rssi: Optional[int] = None
    hop_count: Optional[int] = None

class SDRSignal(BaseModel):
    frequency: float
    signal_strength: float
    mode: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class SystemHealth(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    temperature: Optional[float] = None
    uptime_seconds: int

# Database
class Database:
    def __init__(self, db_path: Path):
        self.db_path = db_path
        self.init_db()

    def init_db(self):
        """Initialize SQLite database with required tables."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Incidents
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS incidents (
                id TEXT PRIMARY KEY,
                provider TEXT NOT NULL,
                provider_incident_id TEXT,
                headline TEXT NOT NULL,
                category TEXT NOT NULL,
                incident_type TEXT NOT NULL,
                description TEXT,
                latitude REAL,
                longitude REAL,
                approximate_location TEXT,
                threat_level TEXT DEFAULT 'LOW',
                confidence INTEGER DEFAULT 0,
                verification_status TEXT DEFAULT 'UNVERIFIED',
                source_url TEXT,
                received_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(provider, provider_incident_id)
            )
        ''')

        # Watch Zones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS watch_zones (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                radius_miles REAL NOT NULL,
                kind TEXT DEFAULT 'CUSTOM',
                categories TEXT,
                minimum_threat TEXT DEFAULT 'ELEVATED',
                enabled BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Alerts
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id TEXT PRIMARY KEY,
                alert_type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT,
                severity TEXT DEFAULT 'INFO',
                source_id TEXT,
                status TEXT DEFAULT 'OPEN',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Mesh Nodes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mesh_nodes (
                id TEXT PRIMARY KEY,
                node_id TEXT UNIQUE NOT NULL,
                long_name TEXT,
                short_name TEXT,
                latitude REAL,
                longitude REAL,
                battery_level INTEGER,
                voltage REAL,
                snr REAL,
                rssi INTEGER,
                hop_count INTEGER,
                online_status TEXT DEFAULT 'UNKNOWN',
                last_heard DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Mesh Telemetry History
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS mesh_telemetry (
                id TEXT PRIMARY KEY,
                node_id TEXT NOT NULL,
                battery_level INTEGER,
                voltage REAL,
                snr REAL,
                rssi INTEGER,
                latitude REAL,
                longitude REAL,
                payload TEXT,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(node_id) REFERENCES mesh_nodes(node_id)
            )
        ''')

        # SDR Signals
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sdr_signals (
                id TEXT PRIMARY KEY,
                frequency REAL NOT NULL,
                signal_strength REAL NOT NULL,
                mode TEXT,
                metadata TEXT,
                detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # System Events
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS system_events (
                id TEXT PRIMARY KEY,
                event_type TEXT NOT NULL,
                message TEXT,
                severity TEXT DEFAULT 'INFO',
                details TEXT,
                recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')

        # Sync Queue (for cloud sync when offline)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sync_queue (
                id TEXT PRIMARY KEY,
                operation TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT,
                payload TEXT NOT NULL,
                retry_count INTEGER DEFAULT 0,
                max_retries INTEGER DEFAULT 3,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                synced_at DATETIME
            )
        ''')

        conn.commit()
        conn.close()
        logger.info(f'Database initialized: {self.db_path}')

    def query(self, sql: str, params: tuple = (), fetch_one: bool = False):
        """Execute a query."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(sql, params)

        if 'SELECT' in sql.upper():
            result = cursor.fetchone() if fetch_one else cursor.fetchall()
            conn.close()
            return result
        else:
            conn.commit()
            conn.close()
            return cursor.lastrowid

db = Database(DB_PATH)

# Auth
def verify_api_key(x_api_key: Optional[str] = Header(None)) -> bool:
    """Verify API key for device authentication."""
    if not x_api_key:
        raise HTTPException(status_code=401, detail='Missing API key')
    # For edge device: accept any non-empty key (Tailscale provides network security)
    return True

# Routes
@app.get('/health')
async def health():
    """System health check."""
    return {
        'status': 'OPERATIONAL',
        'device_id': DEVICE_ID,
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    }

@app.post('/api/incidents')
async def create_incident(incident: Incident, _: bool = Depends(verify_api_key)):
    """Create or update incident."""
    try:
        incident_id = f"{incident.provider}:{incident.provider_incident_id or ''}"
        threat_level = score_threat(incident)
        confidence = 50  # Default

        db.query('''
            INSERT OR REPLACE INTO incidents
            (id, provider, provider_incident_id, headline, category, incident_type,
             description, latitude, longitude, approximate_location, threat_level,
             confidence, verification_status, source_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            incident_id, incident.provider, incident.provider_incident_id,
            incident.headline, incident.category, incident.incident_type,
            incident.description, incident.latitude, incident.longitude,
            incident.approximate_location, threat_level, confidence,
            incident.verification_status, incident.source_url
        ))

        # Check watch zones
        await match_watch_zones(incident_id)

        return {'id': incident_id, 'threat_level': threat_level, 'status': 'created'}
    except Exception as e:
        logger.error(f'Failed to create incident: {e}')
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/api/incidents')
async def list_incidents(_: bool = Depends(verify_api_key), limit: int = 200):
    """List recent incidents."""
    result = db.query('''
        SELECT * FROM incidents
        ORDER BY received_timestamp DESC
        LIMIT ?
    ''', (limit,))
    return {'incidents': [dict(row) for row in result]}

@app.post('/api/watch-zones')
async def create_watch_zone(zone: WatchZone, _: bool = Depends(verify_api_key)):
    """Create watch zone."""
    import uuid
    zone_id = str(uuid.uuid4())

    db.query('''
        INSERT INTO watch_zones
        (id, name, latitude, longitude, radius_miles, kind, categories, minimum_threat, enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        zone_id, zone.name, zone.latitude, zone.longitude, zone.radius_miles,
        zone.kind, json.dumps(zone.categories), zone.minimum_threat, zone.enabled
    ))

    return {'id': zone_id, 'name': zone.name, 'status': 'created'}

@app.get('/api/watch-zones')
async def list_watch_zones(_: bool = Depends(verify_api_key)):
    """List watch zones."""
    result = db.query('SELECT * FROM watch_zones WHERE enabled = 1')
    return {'zones': [dict(row) for row in result]}

@app.post('/api/mesh/telemetry')
async def ingest_mesh_telemetry(telemetry: MeshTelemetry, _: bool = Depends(verify_api_key)):
    """Ingest Meshtastic node telemetry."""
    import uuid
    node_id = telemetry.node_id

    # Upsert node
    db.query('''
        INSERT OR REPLACE INTO mesh_nodes
        (id, node_id, long_name, short_name, latitude, longitude,
         battery_level, voltage, snr, rssi, hop_count, online_status, last_heard)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ONLINE', CURRENT_TIMESTAMP)
    ''', (
        node_id, node_id, telemetry.long_name, telemetry.short_name,
        telemetry.latitude, telemetry.longitude, telemetry.battery_level,
        telemetry.voltage, telemetry.snr, telemetry.rssi, telemetry.hop_count
    ))

    # Log telemetry
    db.query('''
        INSERT INTO mesh_telemetry
        (id, node_id, battery_level, voltage, snr, rssi, latitude, longitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        str(uuid.uuid4()), node_id, telemetry.battery_level, telemetry.voltage,
        telemetry.snr, telemetry.rssi, telemetry.latitude, telemetry.longitude
    ))

    return {'node_id': node_id, 'status': 'recorded'}

@app.get('/api/mesh/nodes')
async def list_mesh_nodes(_: bool = Depends(verify_api_key)):
    """List Meshtastic nodes."""
    result = db.query('SELECT * FROM mesh_nodes ORDER BY last_heard DESC')
    return {'nodes': [dict(row) for row in result]}

@app.post('/api/sdr/signals')
async def log_sdr_signal(signal: SDRSignal, _: bool = Depends(verify_api_key)):
    """Log SDR signal detection."""
    import uuid
    signal_id = str(uuid.uuid4())

    db.query('''
        INSERT INTO sdr_signals (id, frequency, signal_strength, mode, metadata)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        signal_id, signal.frequency, signal.signal_strength,
        signal.mode, json.dumps(signal.metadata or {})
    ))

    return {'id': signal_id, 'frequency': signal.frequency, 'status': 'recorded'}

@app.get('/api/sdr/signals')
async def list_sdr_signals(_: bool = Depends(verify_api_key), limit: int = 100):
    """List SDR signals."""
    result = db.query('''
        SELECT * FROM sdr_signals
        ORDER BY detected_at DESC
        LIMIT ?
    ''', (limit,))
    return {'signals': [dict(row) for row in result]}

@app.get('/api/sdr/spectrum')
async def get_spectrum(_: bool = Depends(verify_api_key)):
    """Get latest spectrum snapshot (frequency vs power)."""
    # Get most recent spectrum data
    result = db.query('''
        SELECT frequency, signal_strength as power_db, detected_at as timestamp
        FROM sdr_signals
        WHERE detected_at > datetime('now', '-30 seconds')
        ORDER BY frequency ASC
    ''')

    spectrum_data = [dict(row) for row in result]

    return {
        'spectrum': spectrum_data,
        'frequency_range': {
            'min_mhz': 88,
            'max_mhz': 1200
        },
        'timestamp': datetime.utcnow().isoformat(),
        'total_signals': len(spectrum_data),
        'peak_power_db': max([s['power_db'] for s in spectrum_data], default=-100)
    }

@app.get('/api/sdr/frequencies')
async def get_active_frequencies(_: bool = Depends(verify_api_key), threshold_db: float = -50):
    """Get detected active frequencies above threshold."""
    result = db.query('''
        SELECT frequency, signal_strength as power_db, mode, detected_at as timestamp
        FROM sdr_signals
        WHERE signal_strength > ?
        AND detected_at > datetime('now', '-1 minutes')
        ORDER BY signal_strength DESC
    ''', (threshold_db,))

    frequencies = [dict(row) for row in result]

    # Classify signals by type
    classified = classify_signals(frequencies)

    return {
        'frequencies': frequencies,
        'classified': classified,
        'threshold_db': threshold_db,
        'count': len(frequencies),
        'timestamp': datetime.utcnow().isoformat()
    }

@app.get('/api/sdr/alerts')
async def get_spectrum_alerts(_: bool = Depends(verify_api_key)):
    """Get spectrum anomaly alerts."""
    result = db.query('''
        SELECT * FROM alerts
        WHERE alert_type LIKE 'sdr%' AND status = 'OPEN'
        ORDER BY created_at DESC
        LIMIT 50
    ''')

    alerts = [dict(row) for row in result]

    return {
        'alerts': alerts,
        'count': len(alerts),
        'timestamp': datetime.utcnow().isoformat()
    }

@app.post('/api/sdr/spectrum/snapshot')
async def record_spectrum_snapshot(data: Dict[str, Any], _: bool = Depends(verify_api_key)):
    """Record a full spectrum snapshot from RTL-SDR."""
    import uuid
    snapshot_id = str(uuid.uuid4())

    # Store spectrum data points
    for signal in data.get('signals', []):
        db.query('''
            INSERT INTO sdr_signals (id, frequency, signal_strength, mode, metadata)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            str(uuid.uuid4()),
            signal.get('frequency'),
            signal.get('power_db'),
            signal.get('mode'),
            json.dumps(signal.get('metadata', {}))
        ))

    # Check for anomalies
    await check_spectrum_anomalies(data.get('signals', []))

    return {
        'snapshot_id': snapshot_id,
        'signals_recorded': len(data.get('signals', [])),
        'status': 'recorded',
        'timestamp': datetime.utcnow().isoformat()
    }

@app.get('/api/system/health')
async def system_health(_: bool = Depends(verify_api_key)):
    """Get system health status."""
    import psutil

    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    temp = None

    try:
        temps = psutil.sensors_temperatures()
        if temps and 'cpu_thermal' in temps:
            temp = temps['cpu_thermal'][0].current
    except:
        pass

    uptime = int((datetime.now() - datetime.fromtimestamp(0)).total_seconds())

    return {
        'cpu_percent': cpu,
        'memory_percent': memory.percent,
        'disk_percent': disk.percent,
        'temperature': temp,
        'uptime_seconds': uptime,
        'timestamp': datetime.utcnow().isoformat()
    }

@app.get('/api/dashboard')
async def dashboard(_: bool = Depends(verify_api_key)):
    """Dashboard aggregation."""
    incidents = db.query('SELECT * FROM incidents ORDER BY received_timestamp DESC LIMIT 20')
    nodes = db.query('SELECT * FROM mesh_nodes ORDER BY last_heard DESC')
    alerts = db.query('SELECT * FROM alerts WHERE status = "OPEN" ORDER BY created_at DESC LIMIT 20')

    return {
        'incidents': [dict(row) for row in incidents],
        'mesh_nodes': [dict(row) for row in nodes],
        'alerts': [dict(row) for row in alerts],
        'timestamp': datetime.utcnow().isoformat()
    }

# Helpers
def score_threat(incident: Incident) -> str:
    """Score threat level based on incident type."""
    severe_keywords = ['shoot', 'fire', 'robbery', 'violent', 'severe', 'critical']
    text = f"{incident.category} {incident.incident_type}".lower()

    if any(kw in text for kw in severe_keywords):
        return 'HIGH'
    if incident.category in ['fire', 'police', 'ems']:
        return 'ELEVATED'
    return 'LOW'

async def match_watch_zones(incident_id: str):
    """Match incident against watch zones and generate alerts."""
    incident = db.query('SELECT * FROM incidents WHERE id = ?', (incident_id,), fetch_one=True)
    if not incident or not incident['latitude']:
        return

    zones = db.query('SELECT * FROM watch_zones WHERE enabled = 1')

    for zone in zones:
        distance = haversine(zone['latitude'], zone['longitude'],
                            incident['latitude'], incident['longitude'])

        if distance <= zone['radius_miles']:
            import uuid
            alert_id = str(uuid.uuid4())
            db.query('''
                INSERT INTO alerts (id, alert_type, title, message, severity, source_id)
                VALUES (?, 'incident.watch_zone_match', ?, ?, ?, ?)
            ''', (
                alert_id,
                incident['headline'],
                f"Incident reported within {zone['name']}",
                incident['threat_level'],
                incident_id
            ))

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in miles between two coordinates."""
    from math import radians, cos, sin, asin, sqrt

    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 3958.8  # Radius of earth in miles
    return c * r

def classify_signals(frequencies: List[Dict]) -> Dict[str, List]:
    """Classify detected signals by type."""
    classified = {
        'fm_radio': [],        # 88-108 MHz
        'noaa_weather': [],    # 162.4-162.55 MHz
        'gmrs_frs': [],        # 462-467 MHz
        'public_safety': [],   # 700-800 MHz
        'cellular': [],        # 824-894 MHz, 1850-1990 MHz
        'ism': [],             # 915 MHz, 2.4 GHz
        'other': []
    }

    for freq_data in frequencies:
        freq = freq_data.get('frequency', 0)

        if 88 <= freq <= 108:
            classified['fm_radio'].append(freq_data)
        elif 162.4 <= freq <= 162.55:
            classified['noaa_weather'].append(freq_data)
        elif 462 <= freq <= 467:
            classified['gmrs_frs'].append(freq_data)
        elif 700 <= freq <= 800:
            classified['public_safety'].append(freq_data)
        elif (824 <= freq <= 894) or (1850 <= freq <= 1990):
            classified['cellular'].append(freq_data)
        elif (900 <= freq <= 930) or (2400 <= freq <= 2500):
            classified['ism'].append(freq_data)
        else:
            classified['other'].append(freq_data)

    return {k: v for k, v in classified.items() if v}

async def check_spectrum_anomalies(signals: List[Dict]):
    """Check for spectrum anomalies and create alerts."""
    import uuid

    # Get historical average power for each frequency
    anomalies = []

    for signal in signals:
        freq = signal.get('frequency', 0)
        power = signal.get('power_db', -100)

        # Query historical data
        hist = db.query('''
            SELECT AVG(signal_strength) as avg_power, COUNT(*) as count
            FROM sdr_signals
            WHERE frequency = ? AND detected_at > datetime('now', '-5 minutes')
        ''', (freq,), fetch_one=True)

        if hist and hist['count'] > 3:
            avg_power = hist['avg_power']
            deviation = power - avg_power

            # Alert if signal increased significantly (>10dB)
            if deviation > 10:
                anomalies.append({
                    'frequency': freq,
                    'power_db': power,
                    'avg_power': avg_power,
                    'deviation': deviation
                })

    # Create alerts for anomalies
    if anomalies:
        for anomaly in anomalies:
            alert_id = str(uuid.uuid4())
            db.query('''
                INSERT INTO alerts
                (id, alert_type, title, message, severity, source_id)
                VALUES (?, 'sdr.power_anomaly', ?, ?, 'WARNING', ?)
            ''', (
                alert_id,
                f"Signal spike at {anomaly['frequency']:.1f} MHz",
                f"Power increased {anomaly['deviation']:.1f}dB above baseline",
                f"freq_{anomaly['frequency']}"
            ))

# Startup
@app.on_event('startup')
async def startup():
    logger.info(f'WISE Defense Edge Intelligence Node starting...')
    logger.info(f'Device ID: {DEVICE_ID}')
    logger.info(f'API Port: {API_PORT}')
    logger.info(f'Database: {DB_PATH}')

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=API_PORT, log_level='info')

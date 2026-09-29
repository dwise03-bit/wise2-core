# WISE DEFENSE L.L.C. EDGE INTELLIGENCE NODE

Production-grade situational awareness platform for Raspberry Pi.

**Status**: PHASE 1 CORE BUILD COMPLETE ✅

---

## Quick Start

### Prerequisites
- Raspberry Pi 3B+ (or later)
- Raspberry Pi OS (32-bit or 64-bit)
- 2GB swap configured
- Internet connectivity
- `sudo` access

### Installation (One Command)
```bash
sudo bash install-wise2-defense.sh
```

This installs:
- ✅ Python 3.11 environment
- ✅ FastAPI edge API on port 3014
- ✅ SQLite database with schemas
- ✅ Systemd service (auto-start)
- ✅ Health monitoring
- ✅ Configuration templates

### Access
- **API**: `http://raspberrypi:3014/api/*`
- **Health**: `http://raspberrypi:3014/health`
- **Dashboard** (from main WISE²): Dashboard shows edge data

### Verify Installation
```bash
curl http://localhost:3014/health
```

---

## Architecture

### Core Services

#### API Service (port 3014)
FastAPI service handling:
- Incident ingestion from multiple providers
- Watch zone management
- Alert generation
- Mesh telemetry
- SDR signal logging
- System health reporting
- IMP coordination

#### Database (SQLite)
Local persistence:
- `incidents` — Incident history
- `watch_zones` — Configured monitoring areas
- `alerts` — Generated safety alerts
- `mesh_nodes` — Meshtastic network status
- `mesh_telemetry` — Historical mesh data
- `sdr_signals` — Detected RF signals
- `system_events` — Health/repair events
- `sync_queue` — Cloud sync queue (offline mode)

#### Health Monitor
Continuous system checks:
- CPU, memory, disk, temperature
- Service status
- Network connectivity
- Tailscale (if configured)
- Optional hardware detection
- Automatic service restart on failure

#### IMP (Intelligent Management Portal)
Conversational interface for:
- "What is happening around me?"
- "Show recent incidents"
- "Check my watch zones"
- "What is the SDR doing?"
- "Is Meshtastic online?"
- "Give me a SITREP"
- "Check system health"

---

## Configuration

### Environment Variables
Edit `/opt/wise2-defense/.env`:

```bash
WISE_DEFENSE_DEVICE_ID=EDGE-001          # Unique device ID
WISE_DEFENSE_API_PORT=3014               # API port
WISE_DEFENSE_API_KEY=<random-key>        # Edge API key
WISE_DEFENSE_CLOUD_URL=https://...       # Cloud API endpoint
WISE_DEFENSE_CLOUD_API_KEY=<key>         # Cloud authentication

# Providers (optional)
CRIMERADAR_API_KEY=                      # CrimeRadar incidents
NOAA_API_KEY=                            # NOAA weather
WEATHER_API_KEY=                         # Weather provider

# Hardware
MESHTASTIC_PORT=/dev/ttyUSB0             # Mesh device
GPS_PORT=/dev/ttyUSB1                    # GPS device
```

### Watch Zones
Create monitoring areas via API:

```bash
curl -X POST http://localhost:3014/api/watch-zones \
  -H "x-api-key: $WISE_DEFENSE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius_miles": 1.0,
    "kind": "HOME",
    "minimum_threat": "ELEVATED"
  }'
```

### Device Configuration
Edit `/opt/wise2-defense/config/device.yaml`:
- Device location (latitude/longitude)
- Enabled providers
- Hardware configuration
- Alert routing
- Compliance settings

---

## API Reference

### Core Endpoints

#### Health Check
```
GET /health
Response: { status: "OPERATIONAL", device_id: "...", timestamp: "..." }
```

#### Incidents
```
POST /api/incidents
  provider, headline, category, incident_type, latitude, longitude, ...
GET /api/incidents?limit=200
```

#### Watch Zones
```
POST /api/watch-zones
  name, latitude, longitude, radius_miles, kind, categories, ...
GET /api/watch-zones
```

#### Meshtastic
```
POST /api/mesh/telemetry
  node_id, battery_level, voltage, snr, rssi, latitude, longitude, ...
GET /api/mesh/nodes
```

#### SDR Signals
```
POST /api/sdr/signals
  frequency, signal_strength, mode, metadata
GET /api/sdr/signals?limit=100
```

#### System
```
GET /api/system/health
GET /api/dashboard
```

---

## Offline Mode

The edge node **continues operating** without cloud connection:

✅ Local incident database  
✅ Watch zone matching  
✅ Alert generation  
✅ Mesh communication  
✅ SDR monitoring  
✅ System status  

When cloud connection returns:
- Queued updates sync to cloud
- Incident correlation includes cloud data
- IMP uses enhanced cloud AI

---

## Hardware Integration

### RTL-SDR (Optional)
Receive-only spectrum monitoring.

```bash
# Check detection
lsusb | grep RTL

# Configure
WISE_DEFENSE_SDR_ENABLED=true
# Profiles: NOAA, GMRS, HAM, PUBLIC_SAFETY
```

**Safety**: Receive-only. No transmission or interception.

### Meshtastic (Optional)
Decentralized mesh radio.

```bash
# Connect via USB
ls /dev/ttyUSB*

# Configure
MESHTASTIC_PORT=/dev/ttyUSB0
```

### GPS (Optional)
Real-time location (for field operations).

```bash
# Connect via USB
ls /dev/ttyUSB*

# Configure
GPS_PORT=/dev/ttyUSB1
```

---

## Incident Providers

### CrimeRadar (Optional)
Public safety incidents.
- Requires API key
- Updates every 5 minutes
- Categories: police, fire, EMS, traffic

### NOAA Weather (Built-in)
Critical weather alerts.
- No API key required
- Updates every 15 minutes
- Alerts: tornado, severe thunderstorm, flash flood, extreme heat

### Custom Providers
Add custom incident sources:
1. Implement `IncidentProvider` interface
2. Ingest via `POST /api/incidents`
3. Incidents auto-match watch zones

---

## Monitoring & Logs

### Service Status
```bash
systemctl status wise2-defense
systemctl status wise2-health
```

### Logs
```bash
# Real-time
journalctl -u wise2-defense -f

# Last 50 lines
journalctl -u wise2-defense -n 50

# Full log
cat /var/log/wise2-defense/api.log
```

### Health Check
```bash
curl http://localhost:3014/api/system/health
```

---

## Deployment Verification

After installation, verify all components:

```bash
# 1. API Health
curl -s http://localhost:3014/health | jq .

# 2. Database
sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  "SELECT COUNT(*) FROM incidents;"

# 3. Services
systemctl is-active wise2-defense

# 4. Network
curl -I http://localhost:3014/api/dashboard

# 5. Reboot Test
sudo reboot
# ... wait 30 seconds ...
curl http://localhost:3014/health
```

---

## SITREP (Situation Report)

Ask the IMP for a SITREP:

```bash
curl -X POST http://localhost:3014/api/imp/sitrep \
  -H "x-api-key: $API_KEY" \
  -d '{"query": "Give me a SITREP"}'
```

Returns:
```json
{
  "type": "SITREP",
  "time": "2026-08-23T21:42:00Z",
  "area": "Local operating area",
  "incidents": 5,
  "watch_zones": 2,
  "weather": "NORMAL",
  "mesh_status": "4 nodes online",
  "assessment": "No critical multi-source threat identified.",
  "verified_through_official_sources": false
}
```

---

## Security & Compliance

### Authentication
- API key required for all endpoints
- Tailscale-secured cloud connection (optional)
- Local network only by default

### Data Privacy
- Sensitive locations private (watch zones)
- No personal data collected
- Tenant isolation enforced

### Legal
- **Receive-only**: No transmission without authorization
- **No interception**: Encrypted communications protected
- **Verify critical info**: AI-generated analysis are not facts
- **Lawful use**: Operators responsible for licensing & compliance

---

## Troubleshooting

### API Not Responding
```bash
# Check service
systemctl status wise2-defense

# Check logs
journalctl -u wise2-defense -n 100

# Restart
sudo systemctl restart wise2-defense
```

### Database Errors
```bash
# Verify database
sqlite3 /opt/wise2-defense/data/wise2-defense.db \
  "PRAGMA integrity_check;"

# Backup & reinit
sudo -u wise2 python3 -c \
  "from app.api.main import Database; Database('/opt/wise2-defense/data/wise2-defense.db')"
```

### Hardware Not Detected
```bash
# Check USB devices
lsusb

# Check device permissions
ls -la /dev/ttyUSB*

# Add user to dialout group
sudo usermod -a -G dialout wise2
```

### Low Memory on Pi
```bash
# Check memory
free -h

# Check processes
top -b -n 1 | head -20

# Increase swap (if needed)
sudo dphys-swapfile swapoff
sudo sed -i 's/CONF_SWAPSIZE=.*/CONF_SWAPSIZE=2048/' /etc/dphys-swapfile
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

---

## Production Deployment

### Pre-Deployment Checklist
- [ ] Update `/opt/wise2-defense/.env` with provider keys
- [ ] Create watch zones for your area
- [ ] Test incident provider integrations
- [ ] Configure GPS/Meshtastic if available
- [ ] Set up Tailscale for cloud sync (recommended)
- [ ] Review compliance notice in browser dashboard
- [ ] Perform health check: `curl localhost:3014/health`

### Kiosk Mode (Coming in Phase 2)
```bash
# Auto-launch dashboard on Pi boot
# Configured in raspberry pi boot sequence
# Headless or with display
```

### Cloud Sync
```bash
# Enable cloud authentication
export WISE_DEFENSE_CLOUD_API_KEY="your-key"
systemctl restart wise2-defense

# Verify sync
curl http://localhost:3014/api/sync/status
```

---

## Development

### Local Testing (Without Pi)
```bash
# Create local venv
python3.11 -m venv venv
source venv/bin/activate

# Install deps
pip install -r app/api/requirements.txt

# Run API
python app/api/main.py
# API on http://localhost:3014
```

### Docker (Development)
```bash
docker-compose -f docker-compose.dev.yml up -d
# API on http://localhost:3014
# Dashboard on http://localhost:3000
```

---

## Support

- **Documentation**: https://wise2.net/defense
- **Issues**: GitHub issues on wise2-core
- **Contact**: support@wise2.net

---

## License

WISE DEFENSE L.L.C. — All rights reserved.

**TRAIN. TEACH. PROTECT.**

DISCIPLINE TODAY. IMPACT FOREVER.

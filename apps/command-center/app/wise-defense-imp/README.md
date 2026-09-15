# WISE² Defense IMP Dashboard

A kiosk-mode Raspberry Pi dashboard for the WISE² Defense edge intelligence node, featuring real-time incident mapping, SDR monitoring, Meshtastic integration, and AI-powered situation analysis.

## Features

### Core UI
- **WISE² IMP Character** — Animated AI assistant with state awareness (IDLE, LISTENING, THINKING, SCANNING, ALERT, OFFLINE, CONNECTED)
- **Boot Sequence** — Professional system initialization animation
- **Dark Command Center Theme** — Military-grade tactical interface with neon green accents
- **Kiosk Mode** — Fullscreen, no browser UI, keyboard shortcuts for operation

### Intelligence Features
- **Defense Intelligence Map** — Real-time incident visualization with tactical grid overlay
- **CrimeRadar Integration** — Public safety incident feed (when configured)
- **Watch Zones** — User-defined geographical alert areas
- **Incident Classification** — Police, Fire, EMS, Traffic, Weather, Public Safety categories
- **Severity Levels** — INFO, WATCH, WARNING, CRITICAL with visual indicators
- **Multi-Source Correlation** — Fuse data from CrimeRadar, SDR, Meshtastic, weather

### Hardware Integration
- **SDR Monitoring** — Real-time RTL-SDR device status, frequency monitoring, signal levels
- **Meshtastic Mesh** — Node visualization, battery status, signal strength (RSSI/SNR)
- **GPS Integration** — Optional location display and watch zone proximity detection
- **Weather Alerts** — NOAA/NWS integration for severe weather warnings

### System Intelligence
- **Health Monitoring** — CPU, RAM, disk, temperature metrics
- **Connectivity Status** — WISE² cloud sync, Tailscale VPN, local network
- **Hardware Detection** — Honest status reporting (ACTIVE, OFFLINE, NOT_CONFIGURED, MISSING_HARDWARE)
- **SITREP Generation** — Automated situation report summarizing local intelligence

### Offline-First
- Local API client with fallback handling
- Works completely without cloud connectivity
- Graceful degradation for missing hardware
- Never fabricates credentials or fake ONLINE states

## Architecture

```
WISE² Defense IMP Dashboard
├── Frontend (Next.js 14, React, TypeScript)
│   ├── Components
│   │   ├── ImpCharacter — AI assistant UI with state machine
│   │   ├── BootScreen — Professional initialization sequence
│   │   ├── DefenseMap — Tactical map with incident markers
│   │   ├── IncidentFeed — Recent incidents list with filtering
│   │   └── SystemStatus — Hardware and system metrics
│   ├── Hooks
│   │   └── usePolling — Real-time data polling with offline handling
│   ├── Utils
│   │   └── api-client — Edge appliance API client
│   └── Config
│       └── api — API configuration and timeouts
│
└── Backend (Edge Appliance)
    ├── Local API (Port 3000)
    │   ├── /api/status — System health
    │   ├── /api/incidents — CrimeRadar incidents
    │   ├── /api/sdr — SDR device status and signals
    │   ├── /api/mesh/nodes — Meshtastic mesh nodes
    │   ├── /api/alerts — Active alerts
    │   ├── /api/sitrep — Generated situation report
    │   └── /api/imp/chat — Chat with local AI
    ├── Services
    │   ├── SDR Service — RTL-SDR monitoring
    │   ├── Mesh Service — Meshtastic integration
    │   ├── Incident Provider — CrimeRadar adapter
    │   ├── Weather Service — NOAA/NWS alerts
    │   └── Health Monitor — System metrics
    └── Database
        └── SQLite — Local incident storage, watch zones, configuration
```

## Quick Start

### Prerequisites
- Raspberry Pi 3B+ or better
- Docker and Docker Compose
- Node.js 20+ (for Next.js build)
- Optional: RTL-SDR USB receiver, Heltec V3 Meshtastic device

### Development

```bash
# Install dependencies
npm install

# Configure API endpoint (defaults to http://localhost:3000)
cp .env.local.example .env.local
# Edit .env.local if needed

# Build Next.js
npm run build

# Start development server
npm run dev

# Open http://localhost:3001 in browser
```

### Docker Deployment on Raspberry Pi

```bash
# On the Raspberry Pi edge node, start all services:
cd services/edge-appliance

# Copy and configure environment
cp .env.example .env
# Edit .env with real values

# Start with hardware overlays
docker compose \
  -f docker-compose.yml \
  -f docker-compose.pi-hardware.yml \
  -f docker-compose.wise-defense.yml \
  up -d --build

# Dashboard automatically serves at http://localhost:3000/wise-defense-imp
# or if behind reverse proxy: https://wisedefensellc.com/wise-defense-imp
```

### Kiosk Mode Configuration

After deployment, configure auto-boot:

```bash
# Edit systemd service on Raspberry Pi
sudo systemctl edit wise2-kiosk

# Add:
[Unit]
Description=WISE² Defense IMP Kiosk
After=network-online.target docker.service
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/bin/chromium-browser --kiosk http://localhost:3000/wise-defense-imp
Restart=always
User=pi

[Install]
WantedBy=multi-user.target

# Enable
sudo systemctl daemon-reload
sudo systemctl enable wise2-kiosk
sudo systemctl start wise2-kiosk
```

## Environment Variables

### NEXT_PUBLIC_WISE_DEFENSE_API_URL
Local API base URL (default: `http://localhost:3000`)

### NEXT_PUBLIC_DEMO_MODE
Enable demo data with synthetic incidents (default: `false`)

### NEXT_PUBLIC_MAP_CENTER_LAT / NEXT_PUBLIC_MAP_CENTER_LNG
Default map center coordinates (default: `0, 0`)

### NEXT_PUBLIC_CRIMERADAR_ENABLED
Enable CrimeRadar integration (requires API key in backend)

## API Endpoints

All endpoints are relative to the edge appliance API base URL (typically `http://localhost:3000`):

### GET /api/status
Service health status for load balancers

### GET /api/system
System metrics: CPU %, RAM %, temperature, disk %, uptime

### GET /api/incidents
All incidents from CrimeRadar or local database

### GET /api/incidents/recent
Recent incidents (default: last 24 hours, sorted by proximity)

### GET /api/sdr/status
RTL-SDR device status, frequency, sample rate, signal level

### GET /api/mesh/nodes
Meshtastic mesh nodes with battery, RSSI, coordinates

### GET /api/alerts
Active alerts across all sources (CrimeRadar, weather, system)

### GET /api/sitrep
Generated situation report (facts + assessment)

### POST /api/imp/chat
Chat with local AI assistant

```bash
curl -X POST http://localhost:3000/api/imp/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is happening near me?"}'
```

## Keyboard Shortcuts

While in dashboard (kiosk mode):

- `S` — Generate SITREP (situation report)
- `H` — Show help message
- `R` — Reload dashboard
- `ESC` — (reserved for admin menu on production)

## Data Flow

```
Edge Appliance Services
├── CrimeRadar Provider ─→ Incidents
├── SDR Service ────────→ Signal Events
├── Meshtastic Gateway ─→ Mesh Telemetry
├── Weather Service ────→ NOAA Alerts
└── GPS Service ───────→ Location Data
         ↓
    Local SQLite Database
         ↓
    Express API (localhost:3000)
         ↓
    WISE² Defense IMP Dashboard (Next.js)
         ↓
    Browser (Fullscreen Kiosk)
```

## Offline Operation

The dashboard is designed to work completely offline:

1. **Boot** → All services start locally
2. **Poll API** → Fetch local cached data
3. **No Cloud** → Still functional with:
   - Last known incidents
   - System metrics
   - Local alerts
   - Mesh network status
4. **Cloud Returns** → Sync resumes automatically
5. **No Single Point of Failure** → Missing hardware doesn't crash system

## Security

- **No Hardcoded Credentials** — All secrets via environment variables
- **Least Privilege** — Services run with minimal required permissions
- **No Transmission** — SDR is receive-only by design
- **VPN Only** — Cloud communication via Tailscale (not public internet)
- **Honest Reporting** — Never fabricates hardware status or fake ONLINE states

## Hardware Status Messages

### Possible States
- `ACTIVE` — Device connected and configured ✓
- `CONNECTED` — Service connected to cloud ✓
- `OFFLINE` — Device missing or unreachable ⚫
- `DETECTED_NOT_CONFIGURED` — Hardware found but not yet configured 🟡
- `MISSING_CREDENTIAL` — Missing API key or auth token 🟡
- `MISSING_HARDWARE` — Expected hardware not found ⚫
- `DISABLED` — Feature explicitly disabled 🔴

### Example Scenarios

```
SDR: DETECTED_NOT_CONFIGURED
└─ RTL-SDR found but needs configuration in .env

WISE²: OFFLINE
└─ Cloud sync unavailable (normal for edge-first operation)

GPS: MISSING_HARDWARE
└─ No GPS device connected (optional)

MESH: ACTIVE
└─ Heltec V3 connected and syncing telemetry
```

## Troubleshooting

### Dashboard Won't Load

```bash
# Check edge appliance is running
docker compose ps

# Check API is responding
curl http://localhost:3000/api/status

# View appliance logs
docker compose logs edge-runtime
```

### Map Markers Not Appearing

```bash
# Verify incidents endpoint
curl http://localhost:3000/api/incidents

# Check CrimeRadar is configured
grep WISE_DEFENSE_API_URL services/edge-appliance/.env
```

### SDR or Mesh Show Offline

```bash
# These are optional. The dashboard should still work.
# Check hardware is connected:
lsusb  # for RTL-SDR
ls /dev/serial/by-id  # for Heltec V3

# If hardware is present but offline, check .env configuration
docker compose logs -f wise-sdr-service
docker compose logs -f wise-mesh-service
```

### High CPU Usage

This is a Pi 3. Optimize:

1. Reduce polling intervals in `config/api.ts`
2. Limit incident history retention
3. Disable animations if needed (reduce Tailwind @apply usage)
4. Monitor background processes

## Performance Notes

- **Polling intervals**: Configurable per data type (2s-5s typical)
- **Memory footprint**: ~200MB typical for dashboard + services
- **CPU load**: <30% on Pi 3B+ at normal polling rates
- **Storage**: ~2GB for OS + models + database

Adjust `WISE_DEFENSE_API_CONFIG.polling` in `config/api.ts` to balance responsiveness vs. load.

## Future Enhancements

- [ ] Live Leaflet/Mapbox map integration
- [ ] Voice command support (push-to-talk)
- [ ] Camera feed integration
- [ ] Advanced SITREP with AI analysis
- [ ] Multi-language support
- [ ] Custom incident filtering and watch zone management UI
- [ ] Incident photo/video capture integration
- [ ] Mobile companion app for remote monitoring

## Contributing

See the main WISE² repository CONTRIBUTING.md

## License

MIT - WISE² Defense, Wise Defense LLC

## Support

- **Docs**: https://wise2.cloud/docs/edge-appliance
- **Issues**: Report bugs in WISE² GitHub repository
- **Contact**: support@wisedefensellc.com

---

**Built for Raspberry Pi with TypeScript, React, and the WISE² Defense ecosystem.**

Last Updated: August 2026 | WISE² Team

# WISE² Edge Appliance

A production-ready Raspberry Pi runtime for WISE² that enables local AI inference, voice control, GPIO automation, and offline-first operation with bidirectional cloud synchronization.

## Features

### Core Capabilities
- **Local AI Inference**: Run Mistral and other open-source LLMs locally via Ollama
- **Voice Control**: Wake-word detection, speech-to-text, and text-to-speech
- **Hardware Control**: GPIO pins, camera, microphone abstractions
- **Offline-First**: Fully operational without cloud connectivity
- **Cloud Sync**: Automatic bidirectional sync when cloud is available
- **Secure VPN**: WireGuard encryption for all cloud communication
- **Automation**: Cron-based triggers, webhooks, GPIO events, and event listeners
- **Health Monitoring**: Real-time metrics, performance tracking, and alerting
- **Production-Ready**: TypeScript strict mode, comprehensive error handling, structured logging

### Performance
- **CPU**: Optimized for Raspberry Pi 4/5 (single-core fallback supported)
- **Memory**: 768 MB typical runtime (configurable)
- **Disk**: ~2 GB for base system + model storage
- **Network**: Offline operation, syncs when connectivity returns

## Architecture

```
┌─────────────────────────────────────────────┐
│        WISE² Edge Appliance Runtime         │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ EdgeRuntime ─────────────────────┐    │
│  │ (Orchestrator & Lifecycle)        │    │
│  └────────────────────────────────────┘    │
│           │          │          │         │
│           ▼          ▼          ▼         ▼
│  ┌─────────────┐ ┌────────┐ ┌──────┐ ┌──────┐
│  │   LocalDB   │ │ Agent  │ │Voice │ │GPIO  │
│  │  (SQLite)   │ │(Ollama)│ │(STT/ │ │Ctrl  │
│  │   + CRDT    │ │        │ │ TTS) │ │      │
│  └─────────────┘ └────────┘ └──────┘ └──────┘
│           │          │          │
│           └──────────┴──────────┘
│                  │
│     ┌────────────┼────────────┐
│     ▼            ▼            ▼
│  ┌────────┐ ┌──────────┐ ┌────────┐
│  │Sync    │ │Automation│ │Health  │
│  │Manager │ │Engine    │ │Monitor │
│  └────────┘ └──────────┘ └────────┘
│
│  Express API Server (Port 3000)
│
└─────────────────────────────────────────────┘
         │                      │
         ▼                      ▼
    Docker/Ollama          Cloud APIs
    (Port 11434)        (WireGuard VPN)
```

## Quick Start

### Prerequisites
- Raspberry Pi 4 or 5 (4GB+ RAM recommended)
- Raspberry Pi OS (Bullseye or newer)
- Docker and Docker Compose
- Node.js 20+
- WireGuard client (optional, for VPN)

### Local Development

```bash
# Clone repository
git clone https://github.com/wise2/wise2-core.git
cd wise2-core/services/edge-appliance

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start locally (requires Docker for Ollama)
npm run docker:run

# Test health endpoint
curl http://localhost:3000/health
```

### Docker Deployment

```bash
# Build image
npm run docker:build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f edge-runtime

# Stop services
docker-compose down
```

### Ansible Deployment (Fleet)

```bash
# Install Ansible
pip install ansible

# Copy and configure inventory
cp ansible/inventory.yml.example ansible/inventory.yml
# Edit with your node IPs and credentials

# Deploy to all nodes
ansible-playbook -i ansible/inventory.yml ansible/setup.yml

# Deploy to specific node
ansible-playbook -i ansible/inventory.yml ansible/setup.yml -l edge-node-1

# Deploy with specific variables
ansible-playbook -i ansible/inventory.yml ansible/setup.yml \
  -e "cloud_url=https://api.wise2.cloud" \
  -e "api_key=$API_KEY"
```

## Configuration

### Environment Variables

```bash
# Runtime
NODE_ENV=production              # or 'development'
NODE_ID=edge-node-1              # Unique identifier
PORT=3000                         # API port
LOG_LEVEL=info                    # info, debug, warn, error

# Database & Storage
LOCAL_DB_PATH=/data/wise2-edge.db # SQLite database path
MODEL_PATH=/models                # AI model storage

# Cloud Configuration
CLOUD_URL=https://api.wise2.cloud # Cloud API endpoint
API_KEY=<your-api-key>           # API authentication key
WIREGUARD_CONFIG_PATH=/etc/wireguard/wise2.conf # VPN config

# AI Models
VOICE_MODEL=mistral              # Ollama model name
OLLAMA_URL=http://localhost:11434 # Ollama API endpoint

# Features
OFFLINE_MODE=false               # Disable cloud sync
ENABLE_VOICE=true                # Voice control
ENABLE_GPIO=true                 # GPIO automation
ENABLE_CAMERA=true               # Camera capture

# Performance
MAX_CONNECTIONS=100              # Max concurrent connections
REQUEST_TIMEOUT=30000            # Request timeout (ms)
SYNC_INTERVAL=30000              # Sync interval (ms)
HEALTH_CHECK_INTERVAL=30000      # Health check interval (ms)
```

### Docker Compose Override

```bash
# Create override file
cp docker-compose.override.yml.example docker-compose.override.yml

# Edit volumes, ports, environment variables as needed
# Then reload: docker-compose up -d
```

## API Reference

### Status & Monitoring

#### GET /health
Service health status (for load balancers)
```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ready",
  "nodeId": "edge-node-1",
  "uptime": 3600000,
  "connectivity": {
    "cloud": true,
    "localNetwork": true,
    "vpn": true
  }
}
```

#### GET /status
Detailed runtime status including component states
```bash
curl http://localhost:3000/status
```

#### GET /health/metrics
Performance metrics (CPU, memory, disk, temperature)
```bash
curl http://localhost:3000/health/metrics | jq
```

#### GET /health/report
Human-readable health report
```bash
curl http://localhost:3000/health/report
```

### Commands & Control

#### POST /commands
Execute AI command locally
```bash
curl -X POST http://localhost:3000/commands \
  -H "Content-Type: application/json" \
  -d '{
    "command": "turn on light 1"
  }'
```

Response:
```json
{
  "id": "response_1234567890",
  "command": "turn on light 1",
  "response": "Turning on light 1...",
  "confidence": 0.95,
  "timestamp": 1234567890
}
```

### Voice Control

#### POST /voice/speak
Text-to-speech output
```bash
curl -X POST http://localhost:3000/voice/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, welcome to WISE²"}'
```

### Hardware Control

#### POST /gpio/:pin
Set GPIO pin state
```bash
# Configure pin as output and set high
curl -X POST http://localhost:3000/gpio/17 \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "out",
    "value": true
  }'

# Read pin state
curl -X POST http://localhost:3000/gpio/17 \
  -H "Content-Type: application/json" \
  -d '{"mode": "in"}'
```

#### POST /camera/capture
Capture image from camera
```bash
curl -X POST http://localhost:3000/camera/capture \
  -o image.jpg
```

### Automation & Triggers

#### GET /automations/triggers
List all automation triggers
```bash
curl http://localhost:3000/automations/triggers
```

#### POST /automations/triggers
Create new automation trigger
```bash
curl -X POST http://localhost:3000/automations/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily morning routine",
    "type": "cron",
    "config": {
      "expression": "0 7 * * *"
    },
    "actions": [
      {"type": "gpio", "config": {"pin": 17, "value": true}},
      {"type": "voice", "config": {"text": "Good morning!"}}
    ]
  }'
```

### Synchronization

#### POST /sync
Trigger immediate sync with cloud
```bash
curl -X POST http://localhost:3000/sync
```

## Automation Triggers

### Cron Triggers
Schedule actions using cron expressions:
```json
{
  "type": "cron",
  "config": {
    "expression": "0 9 * * MON-FRI"
  }
}
```

### Webhook Triggers
Receive HTTP POST requests:
```bash
curl -X POST http://localhost:3002/webhook/trigger-id-123 \
  -H "Content-Type: application/json" \
  -d '{"action": "turn_off_lights"}'
```

### GPIO Event Triggers
React to pin state changes:
```json
{
  "type": "gpio",
  "config": {
    "pin": 27,
    "edge": "rising",
    "debounce": 100
  }
}
```

### Event Triggers
Listen for system events:
```json
{
  "type": "event",
  "config": {
    "eventName": "sync:complete"
  }
}
```

## Offline Operation

The appliance is designed for offline-first operation:

1. **Local Inference**: All AI processing happens locally via Ollama
2. **Local Storage**: SQLite database stores all data locally
3. **Queuing**: Operations queue for sync when cloud returns
4. **No Single Point of Failure**: Works completely without cloud connectivity

### Offline Mode
Enable offline-only operation:
```bash
OFFLINE_MODE=true npm run start
```

### Sync Queue
The sync manager maintains a queue of operations to sync when cloud becomes available:
- Commands executed
- Triggers fired
- Sensor readings
- Configuration changes

## Deployment Guide

### Single Node Deployment

```bash
# SSH into Raspberry Pi
ssh pi@192.168.1.100

# Run Ansible playbook
ansible-playbook -i ansible/inventory.yml ansible/setup.yml \
  -l edge-node-1 \
  -e "api_key=$WISE2_API_KEY"
```

### Fleet Deployment

```bash
# Deploy to all nodes simultaneously
ansible-playbook -i ansible/inventory.yml ansible/setup.yml \
  --extra-vars @ansible/vars.yml

# Monitor progress
watch -n 5 'ansible all -i ansible/inventory.yml -m shell -a "systemctl status wise2-edge | grep Active"'
```

### Rolling Updates

```bash
# Update code on a single node
ansible-playbook -i ansible/inventory.yml ansible/update.yml \
  -l edge-node-1

# Test the update
curl http://192.168.1.100:3000/status

# Roll out to production if OK
ansible-playbook -i ansible/inventory.yml ansible/update.yml \
  -l edge_production
```

## Troubleshooting

### Service Won't Start
```bash
# Check logs
journalctl -u wise2-edge -n 50 -e

# Check configuration
cat /opt/wise2-edge/.env

# Verify Docker
docker ps
docker logs wise2-edge-runtime
```

### High CPU/Memory Usage
```bash
# Check resource limits
systemctl cat wise2-edge

# View metrics
curl http://localhost:3000/health/metrics | jq '.[] | {cpuUsage, memoryUsage}'

# Increase limits if needed
systemctl edit wise2-edge
# Modify MemoryMax and CPUQuota
systemctl restart wise2-edge
```

### Cloud Sync Not Working
```bash
# Check connectivity
curl http://localhost:3000/status | jq '.connectivity'

# Check sync queue
curl http://localhost:3000/sync

# View WireGuard status
sudo wg show

# Test cloud connectivity
curl -v $CLOUD_URL/health
```

### Camera/Audio Not Available
```bash
# List devices
ls /dev/video*
arecord -l
aplay -l

# Check permissions
id $USER
groups $USER

# Add user to groups if needed
sudo usermod -aG video,audio wise2
```

## Performance Tuning

### Resource Limits
Adjust systemd service limits:
```bash
sudo systemctl edit wise2-edge
```

Configure:
```ini
MemoryMax=1024M        # Increase if needed
CPUQuota=100%          # Use more CPU if available
TasksMax=512           # Max processes
```

### Database Optimization
SQLite performance tuning in OfflineDB:
- WAL mode enabled (faster writes)
- NORMAL synchronous mode (balance speed/safety)
- Indexes on frequently queried columns

### Network Optimization
- Adjust sync interval based on network availability
- Batch sync operations to reduce overhead
- Use compression for large transfers

## Monitoring & Logging

### Systemd Journal
```bash
# Follow logs in real-time
journalctl -u wise2-edge -f

# Search logs
journalctl -u wise2-edge --since "2 hours ago" | grep error

# Export logs
journalctl -u wise2-edge -o json > logs.json
```

### Application Logs
```bash
# Runtime logs
tail -f /var/log/wise2-edge-appliance/edge-runtime.log

# Health check logs
tail -f /var/log/wise2-edge-appliance/health-check.log
```

### Prometheus Metrics (Optional)
```bash
# Enable monitoring
docker-compose --profile monitoring up -d

# Access Prometheus
curl http://localhost:9090/metrics

# Access Grafana
open http://localhost:3001  # Default: admin/admin
```

## Security Considerations

### Production Deployment
- [ ] Enable TLS (set TLS_ENABLED=true)
- [ ] Generate signed certificates
- [ ] Rotate API keys regularly
- [ ] Configure firewall rules
- [ ] Monitor for unauthorized access
- [ ] Enable WireGuard VPN
- [ ] Regular security updates

### Best Practices
- Store API keys in Ansible vault, not in git
- Use environment variables, not config files
- Regularly update OS and dependencies
- Monitor resource usage for anomalies
- Enable security updates automatically
- Audit access logs regularly

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md)

## License

MIT - See [LICENSE](../../LICENSE)

## Support

- **Documentation**: https://wise2.cloud/docs/edge-appliance
- **Issues**: https://github.com/wise2/wise2-core/issues
- **Email**: support@wise2.cloud
- **Community**: https://community.wise2.cloud

## Roadmap

- [ ] GPU acceleration support
- [ ] Kubernetes deployment
- [ ] Advanced analytics dashboard
- [ ] Edge-to-edge mesh networking
- [ ] Machine learning model updates via cloud
- [ ] Multi-tenant support
- [ ] Extended camera/sensor library

## Version History

### v1.0.0 (Current)
- Initial production release
- Full offline-first operation
- Local AI inference via Ollama
- Voice control (STT/TTS)
- GPIO automation
- Cloud synchronization
- Health monitoring
- Ansible fleet deployment

---

**Built with TypeScript, Docker, and designed for Raspberry Pi 4/5**

Last Updated: 2026-07-21 | Maintained by WISE² Team

# WISE² Edge on Pi 3B - Quick Reference Card

**Keep this handy for daily operations and troubleshooting.**

---

## System Access

```bash
# SSH into Pi
ssh pi@raspberrypi.local

# Or by IP address
ssh pi@192.168.1.100

# SCP file to Pi
scp myfile.txt pi@raspberrypi.local:/home/pi/
```

---

## API Endpoints

```bash
# Health check (fastest)
curl http://localhost:3000/health

# Full status report
curl http://localhost:3000/status | jq

# System metrics
curl http://localhost:3000/health/metrics | jq

# Voice test (if enabled)
curl -X POST http://localhost:3000/voice/speak \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello"}'
```

---

## Docker Management

```bash
# View container status
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml ps

# View real-time logs
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs -f

# Restart all services
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart

# Stop all services
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml down

# Start all services
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml up -d

# Remove unused images/containers (free disk space)
docker system prune -a
```

---

## Systemd Service Commands

```bash
# Start service
sudo systemctl start wise2-edge

# Stop service
sudo systemctl stop wise2-edge

# Restart service
sudo systemctl restart wise2-edge

# Check status
sudo systemctl status wise2-edge

# View recent logs
journalctl -u wise2-edge -n 50

# Follow logs in real-time
journalctl -u wise2-edge -f

# Enable autostart on boot
sudo systemctl enable wise2-edge

# Disable autostart
sudo systemctl disable wise2-edge
```

---

## System Monitoring

```bash
# Check memory usage
free -h

# Check disk space
df -h

# Check CPU temperature
vcgencmd measure_temp

# Monitor in real-time
htop
# Press Q to exit

# Docker resource usage
docker stats --no-stream

# Check system uptime
uptime

# Check CPU frequency
grep "cpu MHz" /proc/cpuinfo
```

---

## Network Commands

```bash
# Find Pi's IP address
hostname -I

# Test connectivity to gateway
ping 192.168.1.1

# Test internet access
ping 8.8.8.8

# DNS lookup
nslookup google.com

# Check open ports
netstat -tlnp

# Check network interfaces
ip link show

# Show IP configuration
ip addr show
```

---

## File Operations

```bash
# Navigate to deployment directory
cd /opt/wise2-edge

# View configuration
cat .env

# View database size
du -sh data/

# View logs directory
du -sh logs/

# List backups
ls -lh backups/

# Manual backup
cp data/wise2-edge.db data/wise2-edge.db.backup

# Restore from backup
cp data/wise2-edge.db.backup data/wise2-edge.db
```

---

## Configuration Updates

```bash
# Edit environment variables
nano /opt/wise2-edge/.env

# Save changes (Ctrl+O, Enter, Ctrl+X)

# Restart to apply changes
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart
```

---

## Troubleshooting Quick Fixes

| Issue | Command |
|-------|---------|
| API not responding | `docker-compose restart edge-runtime` |
| Out of memory | `docker system prune -a` |
| Services not starting | `docker-compose up -d --build` |
| Disk full | `docker system prune -a` then `df -h` |
| High temperature | `vcgencmd measure_temp` then improve ventilation |
| Network issues | `sudo systemctl restart networking` |
| Can't SSH | `ping raspberrypi.local` to verify network |
| Database corrupted | `cp backups/wise2-edge.db.* data/wise2-edge.db` |

---

## Health Check Script

```bash
# Run comprehensive health check
/opt/wise2-edge/health-check.sh

# Run with specific checks:
/opt/wise2-edge/health-check.sh status     # Container status
/opt/wise2-edge/health-check.sh health     # API health
/opt/wise2-edge/health-check.sh resources  # System resources
/opt/wise2-edge/health-check.sh report     # Full report
/opt/wise2-edge/health-check.sh trouble    # Troubleshooting
```

---

## Emergency Procedures

### System Overheating
```bash
# 1. Check temperature
vcgencmd measure_temp

# 2. If > 80°C:
#    - Add heatsink
#    - Improve ventilation
#    - Reduce model size in .env (use tinyllama)
```

### Out of Disk Space
```bash
# 1. Check usage
df -h

# 2. If > 90% full:
docker system prune -a  # Remove unused images
du -sh /opt/wise2-edge/* | sort -h  # Find large files

# 3. If still full:
# Remove old Ollama models:
docker exec wise2-ollama ollama rm mistral
# Keep only tinyllama for Pi 3B
```

### Out of Memory
```bash
# 1. Check memory
free -h

# 2. If approaching limit:
docker stats  # See which container using most memory

# 3. If OOM kills occurring:
# Reduce MAX_CONNECTIONS in .env
nano /opt/wise2-edge/.env
# Change: MAX_CONNECTIONS=10
docker-compose restart
```

### Services Won't Start
```bash
# 1. Check logs
docker-compose logs edge-runtime

# 2. Check Docker daemon
sudo systemctl status docker

# 3. Rebuild
docker-compose down -v
docker-compose up -d --build

# 4. Check resources
free -h
df -h
vcgencmd measure_temp
```

---

## Reboot Procedures

```bash
# Safe reboot
sudo reboot

# Monitor startup (in another terminal)
watch -n 2 'curl -s http://localhost:3000/health | jq .status'

# Wait for: "status": "ready"

# Verify with health check
/opt/wise2-edge/health-check.sh
```

---

## Logs Location

```bash
# Application logs
tail -f /var/log/wise2-edge-appliance/health-check.log

# Docker container logs
docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs -f

# Systemd service logs
journalctl -u wise2-edge -f

# System logs
sudo tail -f /var/log/syslog
```

---

## Performance Baseline (Pi 3B)

| Metric | Idle | Active |
|--------|------|--------|
| Memory | 200-300MB | 700-800MB |
| CPU | 5-15% | 40-70% |
| Temperature | 45-55°C | 65-75°C |
| Disk I/O | <1MB/s | 5-10MB/s |

---

## Key Files & Paths

```
/opt/wise2-edge/
├── docker-compose.pi3b.yml    # Docker configuration
├── .env                         # Environment variables
├── data/
│   └── wise2-edge.db           # SQLite database
├── models/                      # AI models storage
├── logs/                        # Application logs
├── backups/                     # Database backups
├── health-check.sh             # Health monitoring script
└── backup.sh                   # Backup automation script

/var/log/wise2-edge-appliance/  # Log directory
/etc/systemd/system/wise2-edge.service  # Autostart service
```

---

## Feature Enablement

### Enable Voice Control
```bash
nano /opt/wise2-edge/.env
# Set: ENABLE_VOICE=true
docker-compose restart
```

### Enable GPIO Control
```bash
nano /opt/wise2-edge/.env
# Set: ENABLE_GPIO=true
# Connect GPIO pins and test
curl -X POST http://localhost:3000/gpio/17 \
  -d '{"mode":"out","value":true}'
```

### Enable Cloud Sync
```bash
nano /opt/wise2-edge/.env
# Set: API_KEY=your-key-here
# Set: CLOUD_URL=https://api.wise2.cloud
docker-compose restart
curl http://localhost:3000/status | jq '.connectivity'
```

---

## Useful Aliases (add to ~/.bashrc)

```bash
alias pi-status='curl -s http://localhost:3000/health | jq'
alias pi-logs='docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml logs -f'
alias pi-restart='docker-compose -f /opt/wise2-edge/docker-compose.pi3b.yml restart'
alias pi-health='/opt/wise2-edge/health-check.sh'
alias pi-temp='vcgencmd measure_temp'
alias pi-memory='free -h'
alias pi-disk='df -h /'
```

Then use:
```bash
source ~/.bashrc
pi-status
pi-logs
pi-restart
```

---

## Cron Jobs (check with `crontab -l`)

```bash
# Hourly health check
0 * * * * /opt/wise2-edge/health-check.sh

# Daily backup at 2 AM
0 2 * * * /opt/wise2-edge/backup.sh

# Weekly reboot (Sunday 3 AM, optional)
# 0 3 * * 0 sudo reboot
```

---

## Security Checklist

- [ ] Default password changed
- [ ] SSH key authentication configured (optional)
- [ ] Firewall enabled: `sudo ufw status`
- [ ] Automatic security updates: `sudo apt install unattended-upgrades`
- [ ] Regular backups scheduled
- [ ] API key stored securely in .env
- [ ] WireGuard VPN configured (if using cloud)

---

## Performance Tips

1. **Memory Optimization**
   - Monitor with `free -h`
   - Reduce MAX_CONNECTIONS if needed
   - Use tinyllama instead of larger models

2. **Temperature Management**
   - Keep Pi in well-ventilated location
   - Add heatsink if temp > 70°C
   - Monitor with `vcgencmd measure_temp`

3. **Disk Space**
   - Check usage: `df -h`
   - Clean Docker: `docker system prune -a`
   - Archive old logs

4. **Network Performance**
   - Use Ethernet if possible (WiFi slower)
   - Static IP for consistency
   - Monitor connectivity: `ping 8.8.8.8`

---

## Getting Help

1. **Check health**: `/opt/wise2-edge/health-check.sh`
2. **Review logs**: `docker-compose logs -f`
3. **Read guide**: `PI3B_EDGE_INSTALLATION_GUIDE.md`
4. **Troubleshooting**: `Part 11` of installation guide
5. **WISE² Docs**: https://docs.wise2.cloud

---

**Print this page and keep it handy!**

Last Updated: 2026-07-21  
System: Raspberry Pi 3B  
Status: Production Ready 🍓✨

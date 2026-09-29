# WISE² Raspberry Pi Installation Guide

Complete step-by-step guide to install WISE² on Raspberry Pi 3B+.

## Prerequisites

### Hardware
- **Raspberry Pi 3B+** or later
- **1GB RAM** minimum (2GB+ recommended)
- **32GB SD Card** minimum (64GB+ recommended for backups)
- **Power supply**: 2.5A+ USB-C adapter
- **Ethernet or WiFi** for network connectivity

### Software
- **Operating System**: Debian Trixie or compatible
- **Docker**: Will be installed by the script
- **Docker Compose**: Will be installed by the script

### Network
- Internet connection for initial setup
- Ability to access `wise.local` (mDNS requires Avahi)
- Optional: Static IP address configuration

## Installation Steps

### Step 1: Prepare Raspberry Pi

1. **Flash SD Card**
   ```bash
   # Download Raspberry Pi Imager: https://www.raspberrypi.com/software/
   # Flash latest Debian Trixie image to SD card
   ```

2. **Initial Setup**
   ```bash
   # Insert SD card, boot Pi
   # Connect via SSH or console
   ssh debian@raspberrypi.local
   ```

3. **Update System**
   ```bash
   sudo apt-get update
   sudo apt-get upgrade -y
   ```

### Step 2: Clone Repository

```bash
# Clone the WISE² repository
git clone https://github.com/yourusername/wise2-core.git
cd wise2-core

# Or if you already have the project:
cd /path/to/wise2-core
```

### Step 3: Run Installation Script

```bash
# Make script executable
chmod +x pi/scripts/install.sh

# Run installation (with demo data)
bash pi/scripts/install.sh

# Or skip demo data
bash pi/scripts/install.sh --no-demo

# Or skip Docker installation if already installed
bash pi/scripts/install.sh --skip-docker
```

The script will:
1. ✅ Check system requirements
2. ✅ Install Docker and Docker Compose
3. ✅ Install mDNS support (Avahi)
4. ✅ Generate security secrets
5. ✅ Build optimized Docker images
6. ✅ Start all services
7. ✅ Load demo data
8. ✅ Configure auto-start on boot
9. ✅ Set up log rotation

### Step 4: Access WISE²

After installation completes:

**Primary URL** (recommended):
```
http://wise.local
```

**Fallback URL** (if mDNS doesn't work):
```
http://<pi-ip-address>
# Example: http://192.168.1.100
```

**Find your Pi's IP address**:
```bash
hostname -I
```

## Verification

### Check Service Status

```bash
# View all services
docker-compose -f pi/docker-compose.yml ps

# View logs
docker-compose -f pi/docker-compose.yml logs -f

# Health check
bash pi/scripts/health-check.sh

# Detailed health check
bash pi/scripts/health-check.sh --detailed
```

### First Time Setup

1. **Dashboard loads** → System is running
2. **Demo data visible** → Database is working
3. **Can navigate between pages** → Frontend is working
4. **Can perform actions** → API is working

## Initial Configuration

### Access Settings

1. **Navigate to Settings** (bottom of sidebar)
2. **Configure Network**
   - Set static IP (optional)
   - Configure WiFi (if needed)
3. **Configure Backup**
   - Set backup schedule
   - Choose backup location

### Load Custom Data

To load your own data instead of demo data:

1. **Prepare data** in CSV/JSON format
2. **Create data migration** in `pi/data/migrations/`
3. **Run migration** through admin panel

### Enable AI Features (Optional)

To enable Ollama AI:

1. **Edit** `pi/.env`
   ```bash
   OLLAMA_ENABLED=true
   ```

2. **Restart services**
   ```bash
   docker-compose -f pi/docker-compose.yml restart api
   ```

3. **Download model** (first time only, ~5-10 minutes)
   ```bash
   docker-compose -f pi/docker-compose.yml up -d ollama
   docker-compose -f pi/docker-compose.yml exec ollama ollama pull qwen2.5:1.5b
   ```

## Common Tasks

### Create Backup

```bash
bash pi/scripts/backup.sh

# Full backup (includes all volumes)
bash pi/scripts/backup.sh --full

# Specify custom location
bash pi/scripts/backup.sh --output /backups/manual_backup.tar.gz
```

### Restore Backup

```bash
bash pi/scripts/restore.sh --file /path/to/backup.tar.gz
```

### Update WISE²

```bash
bash pi/scripts/update.sh

# This will:
# - Pull latest code
# - Rebuild Docker images
# - Restart services
# - Verify health
```

### View Logs

```bash
# All services
docker-compose -f pi/docker-compose.yml logs -f

# Specific service
docker-compose -f pi/docker-compose.yml logs -f api
docker-compose -f pi/docker-compose.yml logs -f dashboard

# Follow in real-time
docker-compose -f pi/docker-compose.yml logs -f --tail=50
```

### Stop Services

```bash
docker-compose -f pi/docker-compose.yml down

# This preserves all data
# Services will auto-restart on reboot (if systemd service is enabled)
```

### Restart Services

```bash
docker-compose -f pi/docker-compose.yml restart

# Or restart specific service
docker-compose -f pi/docker-compose.yml restart api
```

### Reset to Demo Data

```bash
bash pi/scripts/reset-demo.sh

# This will:
# - Stop services
# - Clear database
# - Reload demo data
# - Restart services
```

## Troubleshooting

### Dashboard Not Loading

1. **Check if services are running**
   ```bash
   docker-compose -f pi/docker-compose.yml ps
   ```

2. **Check logs**
   ```bash
   docker-compose -f pi/docker-compose.yml logs -f
   ```

3. **Restart services**
   ```bash
   docker-compose -f pi/docker-compose.yml down
   docker-compose -f pi/docker-compose.yml up -d
   ```

### High Memory Usage

1. **Check current usage**
   ```bash
   bash pi/scripts/health-check.sh
   ```

2. **Disable optional services**
   - Comment out Ollama in `pi/docker-compose.yml`
   - Comment out Prometheus/Grafana if monitoring not needed

3. **Reduce Redis memory**
   - Edit `pi/config/redis.conf`
   - Set `maxmemory` to smaller value (e.g., 128mb)

### Network/mDNS Issues

1. **Check if mDNS is working**
   ```bash
   ping wise.local
   ```

2. **Check Avahi status**
   ```bash
   systemctl status avahi-daemon
   ```

3. **Install Avahi if missing**
   ```bash
   sudo apt-get install -y avahi-daemon
   sudo systemctl start avahi-daemon
   ```

4. **Use IP address instead**
   ```bash
   # Find IP
   hostname -I
   # Access via http://<ip>
   ```

### Database Corruption

1. **Check database health**
   ```bash
   sqlite3 pi/data/wise2.db ".tables"
   ```

2. **Restore from backup**
   ```bash
   bash pi/scripts/restore.sh --file /path/to/backup.tar.gz
   ```

3. **Reset database**
   ```bash
   bash pi/scripts/reset-demo.sh
   ```

### Disk Full

1. **Check disk usage**
   ```bash
   df -h
   ```

2. **Clean up backups**
   ```bash
   ls -lh backups/
   rm backups/wise2_backup_OLDER.tar.gz
   ```

3. **Clean Docker**
   ```bash
   docker system prune -a
   ```

## Security

### Change Default Passwords

The install script generates strong random secrets. Never commit `.env` to version control.

```bash
# Check current secrets
grep -E "JWT_SECRET|API_KEY|REDIS_PASSWORD" pi/.env
```

### Enable SSL/TLS

Traefik is pre-configured for Let's Encrypt. To enable:

1. **Edit** `pi/docker-compose.yml`
2. **Uncomment** TLS configuration sections
3. **Restart** Traefik

### Backup Encryption

Backups are not encrypted by default. To encrypt:

```bash
# Create encrypted backup
bash pi/scripts/backup.sh --output backup.tar.gz.enc --encrypt
```

## Performance Tips

### Optimize for Low-Memory Systems

1. **Disable demo data** if not needed
2. **Disable monitoring** (Prometheus/Grafana)
3. **Use SQLite** (already default)
4. **Set Redis memory** to 128MB or less
5. **Disable Ollama** unless needed

### Improve Responsiveness

1. **Use SSD** for SD card (faster I/O)
2. **Configure static IP** (avoids DHCP delays)
3. **Use wired Ethernet** (more reliable than WiFi)
4. **Reduce number of containers** (disable unused services)

### Monitor Performance

```bash
# Real-time system stats
docker stats --no-stream

# Historical logs
docker-compose -f pi/docker-compose.yml logs --timestamps api

# Health metrics
bash pi/scripts/health-check.sh --detailed
```

## Advanced Configuration

### Custom Database

To use PostgreSQL instead of SQLite:

1. **Modify** `docker-compose.yml` to include PostgreSQL
2. **Update** `api/.env` with PostgreSQL connection string
3. **Create migrations** for PostgreSQL
4. **Rebuild and restart**

### Multi-Pi Cluster

To run WISE² across multiple Pi's:

1. **Set up leader/follower** architecture
2. **Use PostgreSQL** for shared database
3. **Use NFS** for shared storage
4. **Configure load balancing** with Traefik

### Custom Domain

To use your own domain instead of `wise.local`:

1. **Edit** `/etc/hosts`
   ```
   127.0.0.1  yourdomain.com
   ```

2. **Update Traefik** configuration
3. **Configure DNS** to point to Pi's IP

## Next Steps

After successful installation:

1. **Explore the interface** - Navigate through different sections
2. **Test demo data** - View sample businesses and transactions
3. **Configure settings** - Set up preferences and integrations
4. **Set up backups** - Enable automatic daily backups
5. **Invite users** - Add team members and assign roles
6. **Customize branding** - Add your company logo and colors

## Support

For issues or questions:

1. **Check health** - `bash pi/scripts/health-check.sh`
2. **View logs** - `docker-compose -f pi/docker-compose.yml logs -f`
3. **Read documentation** - See `docs/` directory
4. **Report issues** - Create GitHub issue with logs

## Additional Resources

- **Architecture Guide**: See `docs/ARCHITECTURE.md`
- **API Reference**: See `docs/API.md`
- **Troubleshooting**: See `docs/TROUBLESHOOTING.md`
- **Backup & Recovery**: See `docs/RECOVERY.md`

---

**Congratulations! WISE² is now running on your Raspberry Pi.** 🎉

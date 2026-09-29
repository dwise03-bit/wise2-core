# WISE² Raspberry Pi Troubleshooting Guide

Complete reference for diagnosing and resolving issues on Raspberry Pi deployments of WISE².

**Quick Links:**
- [Deployment Issues](#deployment-issues)
- [Service Issues](#service-issues)
- [Performance Issues](#performance-issues)
- [Data Issues](#data-issues)
- [Update Issues](#update-issues)
- [Monitoring & Alerts](#monitoring--alerts)
- [Network Issues](#network-issues)
- [Log Locations](#log-file-locations)
- [Debug Commands](#debug-commands)
- [Diagnostics Collection](#collecting-diagnostics-for-support)

---

## Deployment Issues

### SSH Connection Fails

**Symptoms:**
- `ssh: connect to host 192.168.x.x port 22: Connection refused`
- `ssh: connect to host pi.local: Could not resolve hostname`
- Terminal hangs when attempting SSH connection
- "Permission denied (publickey)"

**Root Causes:**
- SSH service not running on Pi
- Firewall blocking port 22
- Network not reachable
- SSH keys not configured
- Pi not booted

**Diagnostic Commands:**

```bash
# From local machine - check if Pi is on network
ping -c 4 pi.local                          # Or IP: ping 192.168.1.100
nmap -p 22 192.168.1.100                    # Check if SSH port open
arp-scan -l                                  # List all network devices

# On Pi (if you have keyboard/monitor access)
sudo systemctl status ssh                   # Check SSH service
sudo systemctl start ssh                    # Start SSH if stopped
sudo ss -tlnp | grep :22                    # Verify port 22 listening
ip addr show                                # Check IP address
```

**Solution Steps:**

1. **Enable SSH on Pi:**
   ```bash
   # If using Raspberry Pi OS, enable via raspi-config (if available)
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

2. **Check network connectivity:**
   ```bash
   # On Pi console
   ifconfig                                  # Check if WiFi/Ethernet connected
   sudo systemctl restart networking         # Restart network
   ```

3. **Verify SSH keys:**
   ```bash
   # On local machine
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519  # Generate key if missing
   ssh-copy-id -i ~/.ssh/id_ed25519 dwise@pi.local  # Copy public key
   ```

4. **Check firewall:**
   ```bash
   # On Pi
   sudo ufw status                           # UFW firewall status
   sudo ufw allow 22/tcp                     # Allow SSH if needed
   sudo ufw reload
   ```

5. **Find Pi on network:**
   ```bash
   # If hostname not resolving
   sudo apt update && sudo apt install avahi-daemon  # Enable mDNS
   hostname -I                               # Get Pi IP address
   ```

**Prevention:**
- Keep SSH enabled in raspi-config
- Maintain consistent IP (set static IP or reserve DHCP)
- Document Pi hostname and IP in deployment notes
- Test SSH connectivity immediately after deployment

---

### Docker Not Installed

**Symptoms:**
- `docker: command not found`
- `docker-compose: command not found`
- `ERROR: The Docker daemon is not running`
- `Cannot connect to Docker daemon at /var/run/docker.sock`

**Root Causes:**
- Docker not installed on Pi
- Docker daemon stopped
- Docker not running on Pi architecture (32-bit vs 64-bit)
- Installation incomplete

**Diagnostic Commands:**

```bash
docker --version                            # Check Docker installed
docker-compose --version                   # Check Docker Compose installed
sudo systemctl status docker                # Check Docker daemon
sudo systemctl start docker                 # Start if stopped
dpkg -l | grep docker                       # List Docker packages installed
uname -m                                    # Check Pi architecture (armv7l vs aarch64)
```

**Solution Steps:**

1. **Install Docker for Raspberry Pi:**
   ```bash
   # Download and run official Docker install script
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Add user to docker group
   sudo usermod -aG docker dwise
   newgrp docker
   ```

2. **Install Docker Compose:**
   ```bash
   # For Pi with ARM processor (recommended method)
   sudo apt-get install -y python3 python3-pip
   sudo pip3 install docker-compose
   
   # Or use pre-built binary (faster)
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Enable Docker daemon:**
   ```bash
   sudo systemctl enable docker
   sudo systemctl restart docker
   ```

4. **Verify installation:**
   ```bash
   docker run hello-world                   # Test Docker
   docker-compose --version                 # Verify Compose
   docker ps                                # List running containers
   ```

**Prevention:**
- Use official Docker installation script
- Test Docker on first boot before deploying
- Pin Docker Compose version in deployment script
- Document required Docker version in README

---

### Insufficient Disk Space

**Symptoms:**
- `No space left on device`
- Docker build fails with disk space error
- Database write operations fail
- Services start then crash with I/O errors
- `df -h` shows 100% disk usage

**Root Causes:**
- Docker images and layers consuming space
- Database data growing without pruning
- Log files accumulating (API, nginx, Docker)
- Temporary files in /tmp
- Downloaded packages not cleaned up

**Diagnostic Commands:**

```bash
# Check disk usage
df -h                                       # Show filesystem usage
du -sh /*                                   # Show size of top-level dirs
du -sh ~/                                   # Show home directory size

# Find large files
find / -type f -size +100M -exec ls -lh {} \;  # Files > 100MB
du -sh /var/lib/docker/*                   # Docker storage size
du -sh /var/log/*                          # Log file sizes
du -sh /var/lib/postgresql/*                # Database size (if using local Postgres)

# Check disk I/O
iostat -x 1 5                               # I/O statistics (if sysstat installed)
```

**Solution Steps:**

1. **Clean Docker resources:**
   ```bash
   # Remove unused images
   docker image prune -a -f
   
   # Remove unused containers
   docker container prune -f
   
   # Remove unused volumes
   docker volume prune -f
   
   # Remove build cache
   docker builder prune -a -f
   ```

2. **Rotate/clean logs:**
   ```bash
   # View log sizes
   du -sh /var/log/*
   
   # Clean old logs
   sudo find /var/log -type f -name "*.log" -mtime +7 -delete  # Delete logs >7 days old
   
   # Configure logrotate for Docker (if needed)
   cat > /etc/docker/daemon.json <<EOF
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     }
   }
   EOF
   sudo systemctl restart docker
   ```

3. **Clean temporary files:**
   ```bash
   sudo rm -rf /tmp/*                       # Clear /tmp
   sudo rm -rf /var/tmp/*                   # Clear /var/tmp
   ```

4. **Expand filesystem (if using SD card):**
   ```bash
   # Resize SD card to use full capacity
   sudo raspi-config nonint do_expand_rootfs
   sudo reboot
   ```

5. **Move Docker data to external storage:**
   ```bash
   # Stop Docker
   sudo systemctl stop docker
   
   # Move Docker directory (if you have external USB)
   sudo mv /var/lib/docker /mnt/external/docker
   sudo ln -s /mnt/external/docker /var/lib/docker
   
   # Start Docker
   sudo systemctl start docker
   ```

**Prevention:**
- Monitor disk usage weekly: `df -h` and `du -sh /var/lib/docker`
- Set up log rotation with max size
- Schedule weekly cleanup: `docker image prune -a --filter "until=168h"`
- Use external storage for database if dataset > 20GB
- Document disk space requirements in deployment notes

---

### Network Issues During Deployment

**Symptoms:**
- `apt update` fails to reach repositories
- Docker image download hangs or times out
- `curl` commands fail with connection timeouts
- Intermittent connection drops
- Deployment script times out

**Root Causes:**
- Pi WiFi connection unstable
- Network congestion
- DNS resolution failing
- Router/ISP issues
- Firewall blocking connections

**Diagnostic Commands:**

```bash
# Test basic connectivity
ping 8.8.8.8                                # Ping public DNS
ping google.com                             # Test DNS resolution
curl -I https://google.com                  # Test HTTPS connectivity

# Check network interface
ip addr show                                # Show network config
ip route show                               # Show routing table
nmcli device show                           # Network status (if NetworkManager installed)

# Test DNS
nslookup 8.8.8.8                            # Test DNS server
cat /etc/resolv.conf                        # Check configured DNS

# Check routing
traceroute 8.8.8.8                          # Trace route to public IP
iperf3 -c <server>                          # Bandwidth test (if iperf3 installed)
```

**Solution Steps:**

1. **Switch to wired Ethernet:**
   ```bash
   # If Pi has Ethernet port
   # Connect Ethernet cable - should auto-configure
   ip addr show                             # Verify Ethernet IP
   ```

2. **Fix WiFi connectivity:**
   ```bash
   # Restart WiFi
   sudo systemctl restart networking
   
   # Or reconnect to WiFi
   sudo nmcli device wifi rescan
   sudo nmcli device wifi list
   sudo nmcli device wifi connect "SSID" password "PASSWORD"
   ```

3. **Configure static DNS:**
   ```bash
   # Edit resolv.conf
   sudo nano /etc/resolv.conf
   
   # Add:
   # nameserver 8.8.8.8
   # nameserver 8.8.4.4
   
   # Make permanent (in /etc/network/interfaces or netplan)
   sudo systemctl restart networking
   ```

4. **Increase timeout for downloads:**
   ```bash
   # For apt
   echo 'Acquire::http::Timeout "120";' | sudo tee /etc/apt/apt.conf.d/99timeout
   
   # For Docker
   sudo docker pull --timeout 180 <image>
   ```

5. **Use local package cache:**
   ```bash
   # Pre-download Docker images on local network
   # Transfer via USB if possible
   docker load < wise2-api.tar.gz
   docker load < wise2-website.tar.gz
   ```

**Prevention:**
- Use wired Ethernet if available (more reliable than WiFi)
- Set static IP and DNS in `/etc/network/interfaces`
- Pre-download Docker images before deployment
- Use local package mirror if available
- Document network requirements in deployment notes

---

## Service Issues

### API Won't Start

**Symptoms:**
- `docker ps` shows `api` container exited
- Logs show `Error: listen EADDRINUSE :::3000`
- App crashes immediately after start
- API returns 502 Bad Gateway
- Logs show database connection errors

**Root Causes:**
- Port 3000 already in use
- Database not reachable
- Environment variables not set
- Application crash (code error)
- Out of memory

**Diagnostic Commands:**

```bash
# Check if container is running
docker ps                                   # List running containers
docker ps -a | grep api                     # Show all api containers

# Check container logs
docker logs wise2-api                       # Stream recent logs
docker logs wise2-api --tail 50 --follow    # Stream with tail

# Check port usage
sudo netstat -tlnp | grep 3000              # List process on port 3000
lsof -i :3000                               # Alternative port check

# Check container status
docker inspect wise2-api | grep -A 5 State  # Full container state
docker stats wise2-api                      # CPU/memory usage

# Test database connectivity
docker exec wise2-api curl -f http://postgres:5432 || true  # Won't work but shows connectivity
```

**Solution Steps:**

1. **Check application logs:**
   ```bash
   # See full log output
   docker logs wise2-api --tail 100
   
   # Save to file for analysis
   docker logs wise2-api > /tmp/api-logs.txt 2>&1
   cat /tmp/api-logs.txt
   ```

2. **Kill process on port 3000 if in use:**
   ```bash
   # Find what's using port
   sudo lsof -i :3000
   
   # Kill the process
   sudo kill -9 <PID>
   
   # Restart API
   docker-compose -f docker-compose.prod.yml up -d api
   ```

3. **Verify database is reachable:**
   ```bash
   # Check if database container running
   docker ps | grep postgres
   
   # Test connection from host
   nc -zv postgres 5432  # Or use IP: nc -zv 127.0.0.1 5432
   
   # Check logs
   docker logs wise2-db
   ```

4. **Verify environment variables:**
   ```bash
   # Check what variables are set in container
   docker exec wise2-api env | grep DATABASE
   docker exec wise2-api env | grep STRIPE
   
   # Compare with .env file
   cat .env.production | grep DATABASE
   ```

5. **Restart API service:**
   ```bash
   # Stop
   docker-compose -f docker-compose.prod.yml down api
   
   # Wait a few seconds
   sleep 5
   
   # Start with fresh state
   docker-compose -f docker-compose.prod.yml up -d api
   
   # Monitor startup
   docker logs wise2-api --follow
   ```

6. **Check resource constraints:**
   ```bash
   # See memory/CPU limits
   docker inspect wise2-api | grep -E "Memory|CpuShares"
   
   # Monitor usage
   docker stats wise2-api
   ```

**Prevention:**
- Add health check to docker-compose
- Log all errors to file on startup
- Set memory limits appropriate for Pi (e.g., 256MB for API)
- Pre-test database connectivity in deployment script
- Use docker-compose healthchecks for auto-restart

---

### Website Won't Start

**Symptoms:**
- Website container shows exited status
- Visiting http://pi.local:3001 shows "connection refused"
- Logs show `ENOENT: no such file or directory`
- Build errors with CSS/JavaScript

**Root Causes:**
- Build failed during startup
- Environment variables not set
- Port already in use
- Insufficient memory for Node process
- Missing asset files

**Diagnostic Commands:**

```bash
# Check container
docker ps -a | grep website
docker logs wise2-website --tail 50

# Check build logs
docker-compose -f docker-compose.prod.yml build website 2>&1 | tail -20

# Check port
sudo netstat -tlnp | grep 3001
lsof -i :3001

# Check container file system
docker exec wise2-website ls -la /app/public
docker exec wise2-website ls -la /app/.next
```

**Solution Steps:**

1. **Rebuild website image:**
   ```bash
   # Clean build
   docker-compose -f docker-compose.prod.yml build --no-cache website
   
   # Check for build errors
   docker-compose -f docker-compose.prod.yml build website 2>&1 | grep -i error
   ```

2. **Check build dependencies:**
   ```bash
   # Verify Node version
   docker exec wise2-website node --version
   
   # Check installed packages
   docker exec wise2-website npm list 2>&1 | head -20
   ```

3. **Verify environment:**
   ```bash
   # Check NEXT_PUBLIC variables
   docker exec wise2-website env | grep NEXT_PUBLIC
   
   # Update if needed in docker-compose.prod.yml
   ```

4. **Run with verbose output:**
   ```bash
   # Remove container
   docker-compose -f docker-compose.prod.yml rm -f website
   
   # Start with logs attached
   docker-compose -f docker-compose.prod.yml up website
   ```

**Prevention:**
- Test build on local machine before pushing
- Use multi-stage builds to reduce image size
- Add build status health check
- Store build logs for debugging

---

### Database Won't Start

**Symptoms:**
- `docker ps` shows postgres exited
- `docker logs wise2-db` shows "could not open"
- Apps report "cannot connect to database"
- Data directory appears corrupted

**Root Causes:**
- Data directory permissions issue
- Disk space full
- PostgreSQL crash/corruption
- Volume mount issue
- Port conflict

**Diagnostic Commands:**

```bash
# Check container
docker ps -a | grep postgres
docker logs wise2-db --tail 50

# Check volume
docker volume ls | grep postgres_data
docker volume inspect postgres_data

# Check disk
df -h /var/lib/docker/volumes/

# Test port
sudo netstat -tlnp | grep 5432
```

**Solution Steps:**

1. **Check PostgreSQL data directory:**
   ```bash
   # List PostgreSQL data volume
   docker volume ls
   
   # Inspect volume location
   docker volume inspect postgres_data | grep Mountpoint
   
   # Check permissions (as root)
   sudo ls -la /var/lib/docker/volumes/postgres_data/_data/
   
   # Fix permissions if needed
   sudo chown -R 999:999 /var/lib/docker/volumes/postgres_data/_data/
   ```

2. **Restart PostgreSQL:**
   ```bash
   # Stop
   docker-compose -f docker-compose.prod.yml stop postgres
   sleep 5
   
   # Start
   docker-compose -f docker-compose.prod.yml up -d postgres
   
   # Monitor logs
   docker logs wise2-db --follow
   ```

3. **Check for corruption:**
   ```bash
   # If safe shutdown needed
   docker exec wise2-db pg_ctl -D /var/lib/postgresql/data -l /tmp/postgres.log stop
   
   # Restart normally
   docker-compose -f docker-compose.prod.yml up -d postgres
   ```

4. **Recreate volume if necessary:**
   ```bash
   # WARNING: This deletes all data
   # Backup first:
   docker exec wise2-db pg_dump -U wise2 wise2_prod > /tmp/wise2_backup.sql
   
   # Delete and recreate
   docker-compose -f docker-compose.prod.yml down
   docker volume rm postgres_data
   docker-compose -f docker-compose.prod.yml up -d postgres
   
   # Restore backup
   docker exec -i wise2-db psql -U wise2 wise2_prod < /tmp/wise2_backup.sql
   ```

**Prevention:**
- Monitor disk space regularly
- Set up automated backups
- Use managed database if possible
- Test recovery procedures monthly

---

### Services Keep Restarting

**Symptoms:**
- Containers show restart count > 0 and increasing
- `docker logs` shows repeated crash messages
- Application briefly runs then stops
- Error happens within first few seconds

**Root Causes:**
- Memory leak causing OOM kill
- Crashing on startup
- Health check failing
- Dependency not ready
- Process exiting normally (wrong entrypoint)

**Diagnostic Commands:**

```bash
# Check restart count
docker inspect wise2-api | grep RestartCount

# View events
docker events --filter container=wise2-api

# Check exit codes
docker logs wise2-api | grep "exited with code"

# Monitor resources
watch -n 1 'docker stats wise2-api --no-stream'

# Check system logs for OOM kills
dmesg | grep "Killed process"
```

**Solution Steps:**

1. **Check if running out of memory:**
   ```bash
   # Monitor memory during startup
   docker stats wise2-api --no-stream
   
   # See total available
   free -h
   docker info | grep Memory
   
   # Set memory limit if not set
   # Edit docker-compose.prod.yml:
   # deploy:
   #   resources:
   #     limits:
   #       memory: 512M
   ```

2. **Examine error message:**
   ```bash
   # Get full error
   docker logs wise2-api 2>&1 | grep -i error | head -5
   
   # See last exit status
   docker inspect wise2-api | jq '.State'
   ```

3. **Disable health check temporarily:**
   ```bash
   # Edit docker-compose.prod.yml and comment out healthcheck:
   # healthcheck:
   #   test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
   
   # Rebuild and retry
   docker-compose -f docker-compose.prod.yml up -d api
   ```

4. **Check dependency order:**
   ```bash
   # Verify depends_on in docker-compose
   # Example:
   # depends_on:
   #   postgres:
   #     condition: service_healthy
   ```

5. **Increase restart delay:**
   ```bash
   # Edit restart policy
   # restart_policy:
   #   condition: on-failure
   #   delay: 5s
   #   max_attempts: 5
   ```

**Prevention:**
- Set memory limits to 80% of available
- Add startup delays between services
- Implement exponential backoff
- Monitor restart events

---

## Performance Issues

### Pi Running Hot

**Symptoms:**
- CPU temperature > 80°C
- Fan running constantly at high speed
- Services becoming sluggish
- Thermal throttling (reduced performance)
- `vcgencmd measure_temp` shows high values

**Root Causes:**
- High CPU load from processes
- Docker processes using excessive CPU
- Poor airflow/ventilation
- Thermal paste dry
- Room temperature high

**Diagnostic Commands:**

```bash
# Check temperature
vcgencmd measure_temp                       # Broadcom GPU temp
cat /sys/class/thermal/cooling_device0/cur_state  # Throttle state (0=full, higher=reduced)

# Check CPU usage
top -n 1 -b | head -20                      # Show CPU usage
ps aux --sort=-%cpu | head -10              # Top processes by CPU
docker stats                                 # Container CPU usage

# Check system load
uptime                                      # Load average
cat /proc/loadavg                           # Detailed load

# Check thermal settings
cat /sys/devices/virtual/thermal/thermal_zone0/temp  # Temp in millidegrees
```

**Solution Steps:**

1. **Find hot processes:**
   ```bash
   # Identify which containers using CPU
   docker stats --no-stream
   
   # Identify which processes within container
   docker top wise2-api                     # Show processes in container
   docker exec wise2-api ps aux --sort=-%cpu
   ```

2. **Reduce Docker CPU load:**
   ```bash
   # Stop unnecessary containers
   docker-compose -f docker-compose.prod.yml down studio  # If not needed
   
   # Reduce number of workers
   docker exec wise2-api npm run start -- --workers 1
   ```

3. **Improve cooling:**
   ```bash
   # Add heatsinks if not present
   # Install aluminum heatsinks on chips
   
   # Improve airflow
   # Add cooling case with fan
   # Ensure vents not blocked
   
   # Lower ambient temperature
   # Keep Pi in cool location
   # Avoid direct sunlight
   ```

4. **Enable throttling monitoring:**
   ```bash
   # Monitor if thermal throttling active
   watch -n 1 'vcgencmd measure_temp; cat /sys/class/thermal/cooling_device0/cur_state'
   
   # If throttling (cur_state > 0), CPU is overheating
   ```

5. **Scale back non-critical services:**
   ```bash
   # Run only API and website
   docker-compose -f docker-compose.prod.yml down studio
   docker-compose -f docker-compose.prod.yml up -d api website postgres
   ```

**Prevention:**
- Install thermal heatsinks from start
- Use cooling case
- Monitor temperature weekly
- Set CPU frequency scaling
- Plan capacity for peak load

---

### Very Slow Response Times

**Symptoms:**
- API responses take 30+ seconds
- Website pages load very slowly
- Even simple queries timeout
- Response time inconsistent
- Disk LED constantly flashing

**Root Causes:**
- Disk I/O bottleneck
- Database queries slow
- Network congestion
- Memory swap in use
- Processes competing for resources

**Diagnostic Commands:**

```bash
# Check disk I/O
iostat -x 1 5                               # I/O statistics
iotop -b -n 2                               # Top I/O processes
df -h                                       # Disk usage
lsof +D /                                   # Open files

# Check memory
free -h                                     # Memory usage
vmstat 1 5                                  # Virtual memory stats
cat /proc/swaps                             # Swap in use

# Check network
iftop -n                                    # Network bandwidth
netstat -i                                  # Network interface stats
ss -s                                       # Socket stats

# Check database
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5;"
```

**Solution Steps:**

1. **Identify bottleneck:**
   ```bash
   # Check which resource at capacity
   top                                      # Full view
   # Look for: high iowait%, high swap, 100% CPU
   ```

2. **Optimize database queries:**
   ```bash
   # Connect to database
   docker exec -it wise2-db psql -U wise2 -d wise2_prod
   
   # Inside psql:
   \dt                                      # List tables
   EXPLAIN ANALYZE SELECT ...;              # Analyze slow query
   CREATE INDEX idx_name ON table(column);  # Add index if needed
   ```

3. **Clear cache/temp files:**
   ```bash
   # Free page cache
   sync
   echo 3 | sudo tee /proc/sys/vm/drop_caches
   
   # Remove temporary files
   docker exec wise2-api rm -rf /tmp/*
   ```

4. **Reduce Docker logging verbosity:**
   ```bash
   # Edit /etc/docker/daemon.json
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "5m",
       "max-file": "2",
       "labels": "lifecycle"
     }
   }
   sudo systemctl restart docker
   ```

5. **Add swap for extra headroom:**
   ```bash
   # Check current swap
   free -h | grep Swap
   
   # Add swap file (if needed)
   sudo dphys-swapfile swapoff
   sudo nano /etc/dphys-swapfile  # Set CONF_SWAPSIZE=2048 for 2GB
   sudo dphys-swapfile setup
   sudo dphys-swapfile swapon
   ```

**Prevention:**
- Monitor response times daily
- Set up database query logging
- Keep indexes optimized
- Use CDN for static assets
- Add read replicas for high load

---

### Memory Constantly Full

**Symptoms:**
- `free -h` shows very little available memory
- Services getting killed with OOM
- Swap usage high and increasing
- System becomes unresponsive
- Docker exec commands fail

**Root Causes:**
- Memory leak in application
- Docker images/layers not cleaned
- Database buffer pool too large
- Cache not clearing
- Runaway process

**Diagnostic Commands:**

```bash
# Check memory usage
free -h                                     # Overall memory
watch -n 1 free -h                          # Monitor over time

# Find memory hogs
ps aux --sort=-%mem | head -10              # Top processes
docker stats                                 # Container memory

# Check memory details
cat /proc/meminfo                           # Detailed memory info
cat /proc/sys/vm/max_map_count              # Memory map limit

# Database memory
docker exec wise2-db psql -U wise2 -c "SELECT name, setting FROM pg_settings WHERE name LIKE '%memory%';"
```

**Solution Steps:**

1. **Identify memory leak:**
   ```bash
   # Monitor memory over time
   watch -n 5 'free -h; echo "---"; docker stats --no-stream'
   
   # If process grows indefinitely, it's a leak
   ```

2. **Restart leaking service:**
   ```bash
   # Temporary fix: restart daily
   docker-compose -f docker-compose.prod.yml restart api
   
   # Permanent: add cron job
   (crontab -l; echo "0 2 * * * /usr/bin/docker-compose -f /path/docker-compose.prod.yml restart api") | crontab -
   ```

3. **Reduce memory allocations:**
   ```bash
   # Edit docker-compose.prod.yml
   # api:
   #   deploy:
   #     resources:
   #       limits:
   #         memory: 256M
   #       reservations:
   #         memory: 128M
   
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Disable unnecessary features:**
   ```bash
   # Disable Node.js cluster mode
   # Use single worker
   NODE_ENV=production npm start
   ```

5. **Clean Docker resources:**
   ```bash
   docker system prune --all -f
   docker image prune -a -f
   ```

**Prevention:**
- Set memory limits on all containers
- Monitor memory weekly
- Profile application for memory leaks
- Use production-optimized libraries
- Set up alerts for high memory

---

### Disk I/O Bottleneck

**Symptoms:**
- `iostat` shows 100% utilization
- Disk reads/writes very slow
- System becomes unresponsive during I/O
- SD card wear indicators high
- "Input/output error" messages

**Root Causes:**
- Database doing full table scans
- Large file operations
- Insufficient I/O cache
- SD card reaching end of life
- Network storage latency

**Diagnostic Commands:**

```bash
# Detailed I/O stats
iostat -x 1 10 -k                           # I/O per device

# Top I/O processes
iotop -b -n 2                               # Per-process I/O

# File system checks
df -h                                       # Disk space
e2fsck -n /dev/mmcblk0p2                    # Check filesystem (read-only)

# SD card health
sudo smartctl -a /dev/mmcblk0 2>/dev/null || echo "smartctl not available"

# Database I/O
docker exec wise2-db psql -U wise2 -c "SELECT * FROM pg_stat_io ORDER BY reads DESC LIMIT 5;"
```

**Solution Steps:**

1. **Find I/O hogs:**
   ```bash
   # Run iotop for 30 seconds
   iotop -b -n 30 -d 1 > /tmp/iotop.log
   cat /tmp/iotop.log | tail -20
   ```

2. **Optimize database I/O:**
   ```bash
   # Check slow queries using I/O
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT query, calls FROM pg_stat_statements WHERE rows > 10000 ORDER BY calls DESC LIMIT 5;"
   
   # Add indexes
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "CREATE INDEX IF NOT EXISTS idx_table_col ON table(column);"
   ```

3. **Reduce logging:**
   ```bash
   # Lower PostgreSQL log verbosity
   # Edit /var/lib/docker/volumes/postgres_data/_data/postgresql.conf
   # log_min_statements: 1000  # Only log statements taking > 1 second
   ```

4. **Use external storage:**
   ```bash
   # If using USB SSD for database
   # Move database to faster storage
   docker volume inspect postgres_data | grep Mountpoint
   
   # For USB: mount at /mnt/usb and link docker volume
   ```

5. **Monitor wear indicators:**
   ```bash
   # Check for SD card failure signs
   dmesg | tail -20 | grep -i "error\|mmc"
   
   # Plan SD card replacement if seeing I/O errors
   ```

**Prevention:**
- Use class 10 or UHS SD cards
- Add SSD via USB for database
- Query optimization before deployment
- Monitor I/O stats weekly
- Plan for increased disk usage

---

## Data Issues

### Database Corrupted

**Symptoms:**
- Queries fail with "could not access status of transaction"
- "relation does not exist" errors
- Database won't start after crash
- Data seems missing or garbled
- `pg_ctl: could not start server`

**Root Causes:**
- Unclean shutdown
- Disk corruption
- File system error
- Cosmic ray (single-bit flip)
- Power loss during write

**Diagnostic Commands:**

```bash
# Check database integrity
docker exec wise2-db pg_basebackup -D /tmp/backup -v 2>&1 | head -20

# Check log for errors
docker logs wise2-db 2>&1 | grep -i error

# Test specific table
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT * FROM subscriptions LIMIT 1;"

# Run consistency check
docker exec wise2-db psql -U wise2 -d wise2_prod -c "REINDEX DATABASE wise2_prod;"
```

**Solution Steps:**

1. **Attempt recovery:**
   ```bash
   # Stop database
   docker-compose -f docker-compose.prod.yml stop postgres
   sleep 10
   
   # Run fsck on volume (if accessible)
   # Usually not possible with Docker volumes
   
   # Restart database
   docker-compose -f docker-compose.prod.yml up -d postgres
   
   # Monitor recovery
   docker logs wise2-db --follow
   ```

2. **Reindex database:**
   ```bash
   # If database runs but is corrupted
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "REINDEX DATABASE wise2_prod;"
   
   # This may take 10-20 minutes on Pi
   ```

3. **Restore from backup:**
   ```bash
   # Stop services
   docker-compose -f docker-compose.prod.yml down
   
   # Restore from backup
   # (assuming backup exists)
   docker-compose -f docker-compose.prod.yml up -d postgres
   sleep 30
   docker exec -i wise2-db psql -U wise2 -d wise2_prod < /backups/wise2_latest.sql
   
   # Verify restore
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT COUNT(*) FROM subscriptions;"
   ```

4. **Rebuild if necessary:**
   ```bash
   # Last resort: rebuild database
   # Delete volume
   docker volume rm postgres_data
   
   # Recreate with init script
   docker-compose -f docker-compose.prod.yml up -d postgres
   
   # Run migrations
   docker exec wise2-db psql -U wise2 -d wise2_prod < packages/db/schema.sql
   ```

**Prevention:**
- Set up automated backups (daily)
- Use UPS for power stability
- Monitor database health daily
- Test restore procedure monthly
- Use ext4 filesystem (more robust than others)

---

### Backups Failing

**Symptoms:**
- Backup script exits with error
- Backup files not being created
- Backup file size suspiciously small (< 1MB)
- Backup takes increasingly long
- Disk fills up during backup

**Root Causes:**
- Insufficient disk space
- Database locked during backup
- Permission issues
- Backup script not running
- Backup destination full

**Diagnostic Commands:**

```bash
# Check backup cron job
crontab -l | grep backup

# Manual backup test
docker exec wise2-db pg_dump -U wise2 wise2_prod | wc -c

# Check backup directory
ls -lh /backups/
du -sh /backups/

# Check disk space
df -h /backups/

# Check backup process
ps aux | grep pg_dump
```

**Solution Steps:**

1. **Test manual backup:**
   ```bash
   # Create backup manually
   docker exec wise2-db pg_dump -U wise2 wise2_prod > /tmp/test_backup.sql
   
   # Verify size
   ls -lh /tmp/test_backup.sql
   
   # Verify content
   head -20 /tmp/test_backup.sql | grep -E "CREATE|INSERT"
   ```

2. **Fix backup script:**
   ```bash
   # Create proper backup script
   cat > /usr/local/bin/backup-wise2-db.sh <<'EOF'
   #!/bin/bash
   BACKUP_DIR="/backups"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   # Create backup
   docker exec wise2-db pg_dump -U wise2 wise2_prod | gzip > $BACKUP_DIR/wise2_$DATE.sql.gz
   
   # Check size
   if [ $(stat -f%z "$BACKUP_DIR/wise2_$DATE.sql.gz") -lt 1000 ]; then
     echo "Backup suspiciously small, possible error" >&2
     exit 1
   fi
   
   # Keep only 7 days
   find $BACKUP_DIR -name "wise2_*.sql.gz" -mtime +7 -delete
   EOF
   
   chmod +x /usr/local/bin/backup-wise2-db.sh
   ```

3. **Create backup cron:**
   ```bash
   # Create directory
   sudo mkdir -p /backups
   sudo chmod 755 /backups
   
   # Add cron (daily at 2am)
   (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-wise2-db.sh") | crontab -
   
   # Verify
   crontab -l | grep backup
   ```

4. **Check backup destination:**
   ```bash
   # Ensure sufficient space
   df -h /backups/
   
   # If full, use USB drive
   mkdir /mnt/backup
   mount /dev/sda1 /mnt/backup
   # Update script to use /mnt/backup
   ```

5. **Test restore:**
   ```bash
   # Test that backups can be restored
   docker exec -i wise2-db psql -U wise2 -d wise2_prod < /backups/wise2_latest.sql
   
   # Verify data
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT COUNT(*) FROM subscriptions;"
   ```

**Prevention:**
- Schedule daily backups at low-load time
- Test restore monthly
- Monitor backup size trends
- Store backups on external device
- Set up alerting for failed backups

---

### Recovery Failed

**Symptoms:**
- Restore command starts but hangs
- "Permissions denied" during restore
- Incomplete restore (missing tables)
- Data inconsistent after restore
- High disk usage during restore

**Root Causes:**
- Backup file corrupted
- Database user permissions wrong
- Disk full during restore
- Connection interrupted
- Version mismatch (PostgreSQL)

**Diagnostic Commands:**

```bash
# Verify backup integrity
gzip -t /backups/wise2_latest.sql.gz        # Test gzip
file /backups/wise2_latest.sql.gz           # Verify file type

# Check database state before restore
docker exec wise2-db psql -U wise2 -l | grep wise2_prod

# Monitor restore progress
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"
```

**Solution Steps:**

1. **Prepare for restore:**
   ```bash
   # Stop all services
   docker-compose -f docker-compose.prod.yml down
   
   # Delete current database to start fresh
   docker volume rm postgres_data
   
   # Recreate container
   docker-compose -f docker-compose.prod.yml up -d postgres
   sleep 30
   ```

2. **Restore from backup:**
   ```bash
   # Decompress if needed
   gunzip /backups/wise2_latest.sql.gz -c | docker exec -i wise2-db psql -U wise2 -d wise2_prod
   
   # Or restore uncompressed
   docker exec -i wise2-db psql -U wise2 -d wise2_prod < /backups/wise2_latest.sql
   ```

3. **Verify restore:**
   ```bash
   # Check tables
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "\dt"
   
   # Count records
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT COUNT(*) FROM subscriptions; SELECT COUNT(*) FROM workspaces;"
   
   # Check recent data
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;"
   ```

4. **Restart services:**
   ```bash
   # Start all services
   docker-compose -f docker-compose.prod.yml up -d
   
   # Monitor logs
   docker logs wise2-api --follow
   ```

**Prevention:**
- Verify backup file size after creation
- Test restore process regularly (monthly)
- Keep 3 generations of backups
- Use checksums to verify backup integrity
- Document restore procedure

---

### Data Loss

**Symptoms:**
- User data missing after restart
- Recent transactions not in database
- Backups also appear to be missing data
- Data inconsistent between services

**Root Causes:**
- Database not persisting to volume
- Volume not properly mounted
- Backup strategy inadequate
- Accidental deletion
- Backup corrupted

**Diagnostic Commands:**

```bash
# Check if volume mounted
docker inspect wise2-db | grep -A 5 Mounts

# Check volume contents
docker run -v postgres_data:/data alpine ls -la /data

# Verify data directory
docker exec wise2-db ls -la /var/lib/postgresql/data/

# Check all backups
ls -lh /backups/*
```

**Solution Steps:**

1. **Verify volume mounting:**
   ```bash
   # Check docker-compose
   grep -A 5 "volumes:" docker-compose.prod.yml
   
   # Should show:
   # volumes:
   #   - postgres_data:/var/lib/postgresql/data
   
   # Not:
   # volumes: []
   ```

2. **Locate lost data:**
   ```bash
   # Check if backup exists from before loss
   ls -lh /backups/ | sort -k6,7
   
   # Find most recent good backup
   ```

3. **Restore lost data:**
   ```bash
   # Stop services
   docker-compose -f docker-compose.prod.yml down
   
   # Restore from backup prior to loss
   docker volume rm postgres_data
   docker-compose -f docker-compose.prod.yml up -d postgres
   docker exec -i wise2-db psql -U wise2 -d wise2_prod < /backups/wise2_20240101.sql
   ```

4. **Investigate root cause:**
   ```bash
   # Check docker logs for errors
   docker logs wise2-db --since 2h | grep -i error
   
   # Check system logs
   sudo dmesg | tail -20 | grep -i "error\|fail"
   
   # Check if volume filled up
   df -h /var/lib/docker/volumes/
   ```

**Prevention:**
- Implement write-once backup strategy
- Backup to external location daily
- Store backups on separate device
- Monitor for data consistency
- Keep 30-day backup retention

---

## Update Issues

### Update Stuck or Failed

**Symptoms:**
- `docker pull` hangs indefinitely
- Update script terminates with error
- Container partially updated
- Version mismatch between services
- Deployment script hangs on docker build

**Root Causes:**
- Network timeout
- Insufficient disk space during build
- Docker daemon stuck
- Build cache corrupted
- Base image unavailable

**Diagnostic Commands:**

```bash
# Check if pull in progress
ps aux | grep docker
docker ps

# Check Docker daemon
sudo systemctl status docker
docker version

# Check disk space
df -h /var/lib/docker

# Monitor Docker build
docker buildx build --progress=plain .

# Check network
curl -I https://registry-1.docker.io/
```

**Solution Steps:**

1. **Stop and clean Docker:**
   ```bash
   # Stop running build
   docker stop $(docker ps -q)
   
   # Clean up
   docker system prune -af
   docker builder prune -af
   ```

2. **Restart Docker daemon:**
   ```bash
   # Restart daemon
   sudo systemctl restart docker
   
   # Monitor
   docker ps
   ```

3. **Retry with smaller chunks:**
   ```bash
   # Pull one image at a time
   docker pull postgres:15-alpine
   docker pull node:18-alpine
   
   # Build services individually
   docker-compose -f docker-compose.prod.yml build api
   docker-compose -f docker-compose.prod.yml build website
   ```

4. **Use offline mode:**
   ```bash
   # If network unreliable, pre-download images on reliable connection
   # Transfer via USB
   docker save postgres:15-alpine > /tmp/postgres.tar
   # On Pi:
   docker load < /tmp/postgres.tar
   ```

**Prevention:**
- Test updates on test Pi first
- Schedule updates during stable network time
- Pre-download images before updating
- Keep 50GB free disk space
- Use version pinning, not latest

---

### Rollback Needed

**Symptoms:**
- New version has critical bug
- Services not working after update
- Need to revert to previous version
- Configuration incompatible

**Root Causes:**
- Breaking changes in new version
- Database migration incompatible
- Incomplete rollout
- Configuration not backward compatible

**Diagnostic Commands:**

```bash
# Check current image versions
docker images | grep wise2
docker ps --format "{{.Image}} {{.Names}}"

# Check container history
docker history wise2-api | head -20

# Check previous versions in git
git log --oneline packages/Dockerfile.* | head -10
```

**Solution Steps:**

1. **Quick rollback:**
   ```bash
   # Stop current version
   docker-compose -f docker-compose.prod.yml down
   
   # Rebuild previous version
   git checkout HEAD~1  # Go back one commit
   docker-compose -f docker-compose.prod.yml build --no-cache api
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Rollback specific service:**
   ```bash
   # Keep database, rollback application
   docker-compose -f docker-compose.prod.yml build --no-cache api
   docker-compose -f docker-compose.prod.yml up -d api
   ```

3. **Verify rollback:**
   ```bash
   # Check if services running
   docker ps | grep wise2
   
   # Test endpoints
   curl http://localhost:3000/health
   curl http://localhost:3001/
   ```

**Prevention:**
- Test updates on staging environment first
- Keep previous Docker image tagged: `wise2-api:v1.0.0`
- Test rollback procedure monthly
- Document version compatibility
- Use blue-green deployment if possible

---

### Version Mismatch

**Symptoms:**
- Services report different versions
- API incompatibility between services
- Database schema mismatch
- Feature flags not working
- Environment variables wrong

**Root Causes:**
- Partial deployment
- Services restarted at different times
- Cache not cleared
- Configuration not synchronized

**Diagnostic Commands:**

```bash
# Check all image versions
docker images | grep wise2

# Check running container versions
docker inspect wise2-api | grep Version
docker inspect wise2-website | grep Version

# Check environment variables
docker exec wise2-api env | grep VERSION
docker exec wise2-website env | grep VERSION

# Check database schema version
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT version();"
```

**Solution Steps:**

1. **Force rebuild all services:**
   ```bash
   # Stop all
   docker-compose -f docker-compose.prod.yml down
   
   # Remove all images
   docker rmi wise2-api wise2-website wise2-studio
   
   # Rebuild
   docker-compose -f docker-compose.prod.yml build --no-cache
   
   # Start
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Sync version tags:**
   ```bash
   # Add version to docker-compose
   # In docker-compose.prod.yml:
   # image: wise2-api:v1.0.0
   # image: wise2-website:v1.0.0
   
   # Tag images
   docker tag wise2-api:latest wise2-api:v1.0.0
   docker tag wise2-website:latest wise2-website:v1.0.0
   ```

3. **Clear environment cache:**
   ```bash
   # Restart with fresh environment
   docker-compose -f docker-compose.prod.yml down
   docker system prune -af
   docker-compose -f docker-compose.prod.yml up -d
   ```

**Prevention:**
- Use explicit version tags
- Deploy all services simultaneously
- Test version compatibility before deployment
- Maintain version compatibility matrix

---

## Monitoring & Alerts

### Alerts Not Working

**Symptoms:**
- Alert notifications not received
- Alert service shows running but no alerts sent
- Logs show alert triggered but not sent
- Email/Slack integration not working

**Root Causes:**
- Email credentials invalid
- Slack webhook invalid
- Network connectivity issue
- Alert threshold not triggered
- Service not connected

**Diagnostic Commands:**

```bash
# Check if alert service running
docker ps | grep alert

# Check service logs
docker logs wise2-api 2>&1 | grep -i alert

# Test email service
docker exec wise2-api curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer $SENDGRID_API_KEY"

# Test webhook
curl -X POST https://hooks.slack.com/services/... \
  -H 'Content-Type: application/json' \
  -d '{"text":"Test"}'
```

**Solution Steps:**

1. **Verify configuration:**
   ```bash
   # Check alert environment variables
   docker exec wise2-api env | grep -i alert
   docker exec wise2-api env | grep -i sendgrid
   docker exec wise2-api env | grep -i slack
   
   # Verify in docker-compose
   grep -A 5 "ALERT\|SENDGRID\|SLACK" docker-compose.prod.yml
   ```

2. **Test alert sending:**
   ```bash
   # Manually trigger test alert
   docker exec wise2-api curl -X POST http://localhost:3000/v1/alerts/test \
     -H "Content-Type: application/json" \
     -d '{"message":"Test alert"}'
   
   # Check logs
   docker logs wise2-api --tail 20
   ```

3. **Re-enter credentials:**
   ```bash
   # Update .env file with correct values
   nano .env.production
   
   # Re-source environment
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d
   ```

**Prevention:**
- Test alerts weekly
- Monitor alert delivery
- Keep credentials up to date
- Document alert configuration

---

### Metrics Not Collecting

**Symptoms:**
- Dashboard shows no data
- Metrics endpoint returns empty
- Monitoring graphs flat
- Historical data missing

**Root Causes:**
- Metrics collector not running
- Database not storing metrics
- Collection disabled
- No permission to write

**Diagnostic Commands:**

```bash
# Check metrics collection
docker exec wise2-api curl http://localhost:3000/v1/metrics

# Check database metrics table
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT * FROM analytics_events LIMIT 5;"

# Check if collection job running
docker exec wise2-api ps aux | grep metric

# View logs
docker logs wise2-api 2>&1 | grep -i metric
```

**Solution Steps:**

1. **Start metrics collection:**
   ```bash
   # Restart API
   docker-compose -f docker-compose.prod.yml restart api
   
   # Wait for collection to start
   sleep 10
   
   # Check data
   docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT COUNT(*) FROM analytics_events WHERE created_at > NOW() - INTERVAL '1 minute';"
   ```

2. **Enable collection if disabled:**
   ```bash
   # In docker-compose
   # Add environment:
   # ENABLE_METRICS: "true"
   
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Backfill missing data:**
   ```bash
   # If metrics were lost, regenerate from logs
   docker exec wise2-api curl -X POST http://localhost:3000/v1/metrics/backfill \
     -H "Content-Type: application/json" \
     -d '{"from":"2024-01-01","to":"2024-01-31"}'
   ```

**Prevention:**
- Monitor metrics collection daily
- Set up alerting for missing data
- Test metrics endpoint weekly
- Keep metrics database separate if possible

---

### Dashboard Not Updating

**Symptoms:**
- Dashboard shows stale data
- Refresh button doesn't update
- Timestamps not changing
- Real-time data missing

**Root Causes:**
- WebSocket connection lost
- API not pushing updates
- Frontend not polling
- Cache too aggressive

**Diagnostic Commands:**

```bash
# Check WebSocket connection
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  http://localhost:3000/ws

# Check API data freshness
docker exec wise2-api curl http://localhost:3000/v1/dashboard/stats

# Check dashboard app logs
docker logs wise2-studio --tail 20

# Monitor network requests
curl http://localhost:3000/v1/dashboard/stats
```

**Solution Steps:**

1. **Hard refresh dashboard:**
   ```bash
   # In browser
   Ctrl+Shift+R (or Cmd+Shift+R)  # Hard refresh
   # Or
   F12 → Settings → Disable cache while open
   ```

2. **Restart frontend:**
   ```bash
   docker-compose -f docker-compose.prod.yml restart studio website
   ```

3. **Check WebSocket:**
   ```bash
   # Enable debug logging
   docker exec wise2-website curl http://localhost:3001/api/debug/websocket
   ```

4. **Clear cache:**
   ```bash
   # Clear browser cache
   # In dashboard app
   localStorage.clear()
   sessionStorage.clear()
   location.reload()
   ```

**Prevention:**
- Monitor dashboard response times
- Test WebSocket connections weekly
- Set up alerts for stale data
- Use aggressive cache busting in production

---

## Network Issues

### No Internet Connectivity

**Symptoms:**
- `ping 8.8.8.8` fails
- Can SSH locally but not from outside
- Docker pull fails
- All services offline

**Root Causes:**
- Ethernet/WiFi not connected
- Network interface down
- Default route missing
- DHCP not working
- Firewall blocking

**Diagnostic Commands:**

```bash
# Check network interfaces
ip addr show
ifconfig
nmcli device

# Check connectivity
ping 8.8.8.8
ping google.com
traceroute 8.8.8.8

# Check routing
ip route show
default gateway

# Check DHCP
dhclient -v eth0
```

**Solution Steps:**

1. **Check physical connection:**
   ```bash
   # Verify Ethernet cable connected
   # Or WiFi SSID visible
   nmcli device wifi list
   ```

2. **Restart networking:**
   ```bash
   # Restart all network interfaces
   sudo systemctl restart networking
   
   # Or specific interface
   sudo ifdown eth0
   sudo ifup eth0
   ```

3. **Re-enable DHCP:**
   ```bash
   # Restart DHCP client
   sudo dhclient -r eth0              # Release
   sudo dhclient eth0                 # Renew
   ```

4. **Connect to WiFi:**
   ```bash
   # List networks
   nmcli device wifi list
   
   # Connect
   nmcli device wifi connect "SSID" password "PASSWORD"
   ```

5. **Check firewall:**
   ```bash
   sudo ufw status
   sudo ufw allow out on eth0 from any to any
   ```

**Prevention:**
- Use wired Ethernet if possible
- Monitor network connectivity
- Set static IP
- Configure backup WiFi

---

### Ping Fails But SSH Works

**Symptoms:**
- `ping pi.local` fails
- But `ssh dwise@pi.local` works
- ICMP blocked
- Some services work, some don't

**Root Causes:**
- Firewall blocking ICMP
- Network filtering
- ISP blocking ICMP
- Router configuration

**Diagnostic Commands:**

```bash
# Check ICMP firewall
sudo ufw status | grep ICMP
sudo iptables -L | grep icmp

# Test TCP connectivity
curl -v http://pi.local:22

# Check route
traceroute -I pi.local              # Use ICMP
mtr pi.local                        # Monitor connectivity
```

**Solution Steps:**

1. **Allow ICMP through firewall:**
   ```bash
   sudo ufw allow in icmp
   sudo ufw allow out icmp
   sudo ufw reload
   ```

2. **Check iptables:**
   ```bash
   # List rules
   sudo iptables -L INPUT
   
   # Add ICMP if missing
   sudo iptables -A INPUT -p icmp -j ACCEPT
   sudo iptables -A OUTPUT -p icmp -j ACCEPT
   ```

3. **Test now:**
   ```bash
   ping -c 4 pi.local
   ```

**Prevention:**
- Allow ICMP in firewall config
- Monitor both ICMP and TCP connectivity
- Document firewall rules

---

### DNS Not Resolving

**Symptoms:**
- `ping google.com` fails but `ping 8.8.8.8` works
- `nslookup google.com` times out
- Services can't resolve hostnames
- Intermittent resolution failures

**Root Causes:**
- DNS server not configured
- DNS server not reachable
- Network issue
- /etc/resolv.conf not persistent

**Diagnostic Commands:**

```bash
# Check configured DNS
cat /etc/resolv.conf
nmcli device show | grep DNS

# Test DNS resolution
nslookup google.com
dig google.com
host google.com

# Test specific DNS server
nslookup google.com 8.8.8.8
dig @8.8.8.8 google.com
```

**Solution Steps:**

1. **Configure DNS:**
   ```bash
   # Edit resolv.conf
   sudo nano /etc/resolv.conf
   
   # Add:
   nameserver 8.8.8.8
   nameserver 8.8.4.4
   ```

2. **Make persistent (if using systemd):**
   ```bash
   # Use systemd-resolved
   sudo systemctl restart systemd-resolved
   
   # Or configure in NetworkManager
   nmcli connection modify eth0 ipv4.dns "8.8.8.8 8.8.4.4"
   nmcli connection down eth0
   nmcli connection up eth0
   ```

3. **Test resolution:**
   ```bash
   ping google.com
   nslookup google.com
   ```

**Prevention:**
- Configure DNS in network config files
- Monitor DNS resolution latency
- Use upstream DNS with low latency
- Set up DNS caching if needed

---

## Log File Locations

### WISE² Application Logs

| Service | Log Location | Command |
|---------|--------------|---------|
| **API** | Docker logs | `docker logs wise2-api --tail 100 --follow` |
| **Website** | Docker logs | `docker logs wise2-website --tail 100 --follow` |
| **Studio** | Docker logs | `docker logs wise2-studio --tail 100 --follow` |
| **PostgreSQL** | Docker logs | `docker logs wise2-db --tail 100 --follow` |
| **Nginx** | Docker logs | `docker logs wise2-nginx --tail 100 --follow` |

### System Logs

| Log | Location | Command |
|-----|----------|---------|
| **System** | `/var/log/syslog` | `sudo tail -f /var/log/syslog` |
| **Kernel** | `dmesg` | `dmesg --follow` |
| **Docker** | `/var/log/docker.log` (if configured) | `sudo journalctl -u docker -f` |
| **SSH** | `/var/log/auth.log` | `sudo tail -f /var/log/auth.log` |

### Accessing Container Logs

```bash
# Stream live logs
docker logs -f wise2-api

# Show all logs
docker logs wise2-api 2>&1 | less

# Save to file
docker logs wise2-api > /tmp/api-logs.txt 2>&1

# Search logs
docker logs wise2-api 2>&1 | grep -i error

# Follow with timestamps
docker logs -f --timestamps wise2-api
```

---

## Debug Commands

### Quick Health Check

```bash
#!/bin/bash
# Run comprehensive health check

echo "=== WISE² Health Check ==="
echo ""

echo "1. Docker Services"
docker ps --format "table {{.Names}}\t{{.Status}}"
echo ""

echo "2. Network Connectivity"
ping -c 1 8.8.8.8 && echo "✓ Internet OK" || echo "✗ No internet"
echo ""

echo "3. Disk Space"
df -h | grep -E "^/dev|Filesystem"
echo ""

echo "4. Memory Usage"
free -h
echo ""

echo "5. CPU Temperature"
vcgencmd measure_temp 2>/dev/null || echo "N/A"
echo ""

echo "6. Service Health"
curl -s http://localhost:3000/health | jq '.' || echo "API unreachable"
echo ""

echo "7. Database"
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT COUNT(*) as total_subscriptions FROM subscriptions;" 2>/dev/null || echo "Database unreachable"
```

### Memory Profile

```bash
#!/bin/bash
# Profile memory usage

echo "=== Memory Profile ==="
echo ""
echo "System Memory:"
free -h
echo ""
echo "Top Memory Consumers:"
ps aux --sort=-%mem | head -10
echo ""
echo "Docker Container Memory:"
docker stats --no-stream
```

### Disk I/O Profile

```bash
#!/bin/bash
# Profile disk I/O

echo "=== Disk I/O Profile ==="
echo ""
echo "Disk Usage:"
df -h
echo ""
echo "I/O Statistics:"
iostat -x 1 3
echo ""
echo "Top I/O Processes:"
iotop -b -n 2
```

### Network Diagnostics

```bash
#!/bin/bash
# Diagnose network issues

echo "=== Network Diagnostics ==="
echo ""
echo "Network Interfaces:"
ip addr show
echo ""
echo "Routing Table:"
ip route show
echo ""
echo "DNS Servers:"
cat /etc/resolv.conf
echo ""
echo "Connectivity Tests:"
ping -c 1 8.8.8.8 && echo "✓ Public DNS" || echo "✗ Public DNS"
curl -s https://api.github.com/status && echo "✓ HTTPS" || echo "✗ HTTPS"
```

---

## Collecting Diagnostics for Support

When reporting issues, collect this information:

```bash
#!/bin/bash
# Comprehensive diagnostics collection

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DIAG_DIR="/tmp/wise2-diag-$TIMESTAMP"
mkdir -p $DIAG_DIR

echo "Collecting diagnostics to $DIAG_DIR..."

# System info
uname -a > $DIAG_DIR/01-system.txt
df -h >> $DIAG_DIR/01-system.txt
free -h >> $DIAG_DIR/01-system.txt
vcgencmd measure_temp >> $DIAG_DIR/01-system.txt 2>/dev/null

# Network
ip addr show > $DIAG_DIR/02-network.txt
ip route show >> $DIAG_DIR/02-network.txt
cat /etc/resolv.conf >> $DIAG_DIR/02-network.txt

# Docker
docker version > $DIAG_DIR/03-docker.txt
docker ps -a >> $DIAG_DIR/03-docker.txt
docker stats --no-stream >> $DIAG_DIR/03-docker.txt

# Logs (last 1000 lines each)
docker logs wise2-api --tail 1000 > $DIAG_DIR/04-logs-api.txt 2>&1
docker logs wise2-website --tail 1000 > $DIAG_DIR/04-logs-website.txt 2>&1
docker logs wise2-db --tail 1000 > $DIAG_DIR/04-logs-db.txt 2>&1
docker logs wise2-nginx --tail 1000 > $DIAG_DIR/04-logs-nginx.txt 2>&1

# Database info
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT version();" > $DIAG_DIR/05-db-info.txt 2>&1
docker exec wise2-db psql -U wise2 -d wise2_prod -c "\dt" >> $DIAG_DIR/05-db-info.txt 2>&1
docker exec wise2-db psql -U wise2 -d wise2_prod -c "SELECT COUNT(*) FROM pg_stat_activity;" >> $DIAG_DIR/05-db-info.txt 2>&1

# API endpoints
curl -s http://localhost:3000/health > $DIAG_DIR/06-api-health.json 2>&1
curl -s http://localhost:3000/v1/status >> $DIAG_DIR/06-api-health.json 2>&1

# Configuration
env | grep -E "NODE_ENV|DATABASE|STRIPE|API" > $DIAG_DIR/07-env.txt 2>&1
grep -r "^[^#]" docker-compose.prod.yml | head -50 > $DIAG_DIR/07-config.txt 2>&1

# System logs
sudo tail -100 /var/log/syslog > $DIAG_DIR/08-syslog.txt 2>&1 || echo "Permission denied"
dmesg | tail -100 >> $DIAG_DIR/08-syslog.txt 2>&1

echo "✓ Diagnostics collected in $DIAG_DIR"
echo "  To share: tar -czf $DIAG_DIR.tar.gz $DIAG_DIR && ls -lh $DIAG_DIR.tar.gz"
```

**When reporting issues, include:**
1. What you were doing when issue occurred
2. Exact error messages
3. Output from above diagnostics script
4. Recent changes (updates, config changes)
5. When issue started
6. Frequency (always, intermittent)

---

**Last Updated**: 2024-01-XX  
**Version**: 1.0  
**Author**: WISE² Deployment Team

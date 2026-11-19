# WISE² Hermes — New Server Integration Guide

## Overview

This guide walks through auditing and integrating a new server into the WISE² Hermes network via Tailscale.

**Current Infrastructure:**
- **Mac (Local)**: Hermes coordinator, iMessage gateway, Photon
- **VPS (173.208.147.165)**: Always-on Hermes node, API, Database, Redis
- **Tailscale Network**: Secure private mesh connecting all nodes
- **New Server**: To be integrated as additional Hermes node

---

## Prerequisites

Before starting, ensure:

1. **Server on Tailscale** — Device is connected to the WISE² Tailscale network
   - Run: `tailscale status`
   - Should show connection to `vps.internal` and `mac.internal`

2. **SSH Access** — Can SSH to the new server
   - From your local machine: `ssh dwise@[new-server-ip]`

3. **wise2-core Cloned** — Repository is at `~/wise2-core`
   ```bash
   git clone https://github.com/dwise03-bit/wise2-core.git ~/wise2-core
   ```

4. **Basic Tools** — OS has Docker and Node.js
   - `docker --version`
   - `node --version`
   - `git --version`

---

## Step 1: Audit the New Server

The audit script inventories the server's current state.

### Run Audit

```bash
# On the new server:
cd ~/wise2-core
bash deploy/audit-new-server.sh
```

### Expected Output

```
Hostname: gpu-node-1
OS: Linux
CPU Cores: 24
Memory: 96GB

Docker: Docker version 20.10.x
Node.js: v18.x.x
Hermes: hermes version 1.0.x (or not installed)

Tailscale: Connected - 100.x.x.x
  Can reach vps.internal ✅
  Can reach mac.internal ✅

Readiness: 5/6 (Hermes not installed)
```

### Checklist

- [ ] OS is Linux (Ubuntu 20.04 LTS or newer)
- [ ] At least 8GB RAM, 2+ CPU cores
- [ ] Docker installed and running
- [ ] Node.js v16+ installed
- [ ] Git installed
- [ ] Tailscale connected and can reach other nodes
- [ ] wise2-core repository cloned

**If any items missing**: Run `bash deploy/02-vps-setup.sh` to install prerequisites

---

## Step 2: Integrate with Hermes Network

The integration script configures the server as a WISE² node.

### Run Integration

```bash
# On the new server:
cd ~/wise2-core
bash deploy/integrate-new-server.sh [server-name]
```

**Example:**
```bash
bash deploy/integrate-new-server.sh gpu-node-1
```

This will:
1. ✅ Verify prerequisites (Docker, Node, Git, Tailscale)
2. ✅ Install Hermes (if not present)
3. ✅ Create service user `wise2-service`
4. ✅ Create configuration directory `/etc/wise2`
5. ✅ Set up systemd service
6. ✅ Configure Docker for the service user
7. ✅ Start the WISE² server

### Configuration Files Created

**`/etc/wise2/server.env`**
```env
SERVER_NAME=gpu-node-1
NODE_ENV=production
API_HOST=0.0.0.0
API_PORT=3000
HERMES_PORT=9000
DATABASE_URL=postgresql://wise2:password@postgres.internal:5432/wise2
REDIS_URL=redis://redis.internal:6379
```

**Edit this file** to configure:
- Database connection strings
- API ports and hostnames
- Logging levels
- Storage directories

```bash
# Edit configuration:
sudo nano /etc/wise2/server.env

# Restart service to apply changes:
sudo systemctl restart wise2-server
```

**`/etc/systemd/system/wise2-server.service`**

Systemd service that:
- Runs WISE² server as `wise2-service` user
- Automatically restarts on failure
- Logs to systemd journal
- Starts after Docker and networking

```bash
# Service commands:
sudo systemctl start wise2-server      # Start
sudo systemctl stop wise2-server       # Stop
sudo systemctl restart wise2-server    # Restart
sudo systemctl status wise2-server     # Status
sudo journalctl -u wise2-server -f     # Live logs
```

---

## Step 3: Tailscale Tagging

Tag the new server in Tailscale admin console for ACL control.

### Tag the Server

1. Go to: https://login.tailscale.com/admin/machines
2. Find the new server in the list
3. Click the **three-dot menu** → **Edit machine...**
4. Add tags (use Ctrl+click for multiple):
   - `tag:ops-host` — For ops/control bridge
   - `tag:gpu-node` — For GPU workloads
   - `tag:worker` — For background jobs

### Example Tags

```json
// For a GPU compute node:
"tags": ["tag:gpu-node", "tag:worker", "tag:always-on"]

// For a secondary API server:
"tags": ["tag:api-server", "tag:always-on"]

// For an edge device:
"tags": ["tag:edge-device", "tag:worker"]
```

### ACL Rules (in `/config/tailscale/wise2-ops-acl.json`)

After tagging, update Tailscale ACL to allow communication:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["tag:ops-relay"],
      "dst": ["tag:ops-host:3099"]
    },
    {
      "action": "accept",
      "src": ["tag:api-server"],
      "dst": ["tag:database-server:5432"]
    },
    {
      "action": "accept",
      "src": ["tag:worker"],
      "dst": ["tag:api-server:3000"]
    }
  ]
}
```

---

## Step 4: Network Verification

Verify the new server can communicate with other nodes.

### Check Connectivity

```bash
# From the new server:

# 1. Tailscale status
tailscale status
# Should show: vps.internal, mac.internal in the list

# 2. Ping other nodes
ping -c 1 vps.internal
ping -c 1 mac.internal

# 3. Test SSH (if configured)
ssh dwise@vps.internal 'hostname'

# 4. Check DNS resolution
getent hosts vps.internal
getent hosts mac.internal
```

### Expected Output

```bash
$ tailscale status
100.64.x.1  gpu-node-1       linux   -
100.64.x.2  vps              linux   active; relay "blah"
100.64.x.3  macbook          darwin  active; relay "blah"

$ ping vps.internal
PING vps.internal (100.64.x.2) 56(84) bytes of data.
64 bytes from 100.64.x.2: icmp_seq=1 ttl=64 time=15.2 ms

✅ All nodes reachable
```

---

## Step 5: Service Health Check

Verify the WISE² server is running and healthy.

```bash
# 1. Check service status
sudo systemctl status wise2-server

# 2. View logs
sudo journalctl -u wise2-server -n 50

# 3. Test health endpoint
curl http://localhost:3000/health
# Expected: {"status":"ok","timestamp":"..."}

# 4. Check Docker containers
docker ps | grep wise2

# 5. View resource usage
docker stats
```

### Common Issues

**Service won't start:**
```bash
# Check logs for errors
sudo journalctl -u wise2-server -f

# Common causes:
# - Port 3000 already in use
# - Docker permissions (user not in docker group)
# - Database unreachable
# - Configuration file error
```

**Can't reach database:
```bash
# Test database connectivity
psql -h postgres.internal -U wise2 -d wise2 -c "SELECT 1"
# If fails: check DATABASE_URL in /etc/wise2/server.env
```

**Docker containers not starting:**
```bash
# Check Docker logs
docker logs wise2-api
docker logs wise2-postgres

# Verify Docker daemon is running
sudo systemctl status docker
```

---

## Step 6: Hermes Configuration

Configure Hermes on the new server as a peer to the network.

### Create Peer Connection

The integration script creates a basic config. To add peer connections:

```bash
# On the new server:
hermes peer add mac.internal --token [PEER_TOKEN]
hermes peer add vps.internal --token [PEER_TOKEN]

# List peers
hermes peer list
```

### Get Peer Tokens

Peer tokens allow servers to trust each other without shared passwords.

**On the main VPS:**
```bash
# Generate a token for the new server to use
hermes peer-token generate --name gpu-node-1
# Output: hermes_token_1234567890abcdef...
```

**On the new server:**
```bash
# Use the token to register with VPS
hermes peer add vps.internal --token hermes_token_1234567890abcdef...
```

### Verify Peers

```bash
# List connected peers
hermes peer list

# Check health of a peer
hermes peer health vps.internal

# View peer statistics
hermes peer stats
```

---

## Scaling: Multiple New Servers

To add more servers to the network, repeat Steps 1-6 for each server:

```bash
# Server 2:
bash deploy/integrate-new-server.sh gpu-node-2

# Server 3:
bash deploy/integrate-new-server.sh api-secondary

# Server 4:
bash deploy/integrate-new-server.sh edge-device
```

Then update Tailscale ACL to allow inter-server communication:

```json
{
  "acls": [
    {
      "action": "accept",
      "src": ["tag:gpu-node"],
      "dst": ["tag:api-server:3000", "tag:database-server:5432"]
    },
    {
      "action": "accept",
      "src": ["tag:worker"],
      "dst": ["tag:api-server:3000", "tag:redis-server:6379"]
    }
  ]
}
```

---

## Monitoring

### Real-time Logs

```bash
# WISE² server logs
sudo journalctl -u wise2-server -f

# Docker container logs
docker logs -f wise2-api
docker logs -f wise2-postgres

# Hermes gateway logs
hermes logs --tail 100
```

### Health Checks

```bash
# API health
curl http://localhost:3000/health

# Hermes health
curl http://localhost:9000/health

# Database health
psql -h postgres.internal -U wise2 -c "SELECT version();"

# Redis health
redis-cli -h redis.internal PING
```

### Metrics

```bash
# System resources
docker stats --no-stream

# Network throughput
iftop -i eth0

# Disk usage
df -h /var/lib/wise2

# Container status
docker compose -f /home/wise2-service/wise2-core/docker-compose.prod.yml ps
```

---

## Troubleshooting

### New server can't reach vps.internal

**Symptoms:**
```
ping: vps.internal: Temporary failure in name resolution
```

**Solutions:**
1. Check Tailscale is running: `tailscale status`
2. Restart Tailscale: `sudo systemctl restart tailscaled`
3. Verify DNS: `tailscale dns list`
4. Add to `/etc/hosts` manually:
   ```bash
   100.64.x.2 vps.internal vps
   100.64.x.3 mac.internal mac
   ```

### Service fails to start

**Symptoms:**
```
wise2-server.service: Main process exited with code=1
```

**Solutions:**
1. Check configuration: `cat /etc/wise2/server.env`
2. Test Docker: `docker ps`
3. Check permissions: `ls -la /home/wise2-service`
4. View full logs: `sudo journalctl -u wise2-server --no-pager`

### Database connection refused

**Symptoms:**
```
error: connect ECONNREFUSED postgres.internal:5432
```

**Solutions:**
1. Verify database URL: `cat /etc/wise2/server.env | grep DATABASE`
2. Test connectivity: `psql -h postgres.internal -U wise2 -c "SELECT 1"`
3. Check firewall: `ufw status | grep 5432`
4. Verify database service on main server: `ssh dwise@vps.internal sudo systemctl status postgres`

### Port already in use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions:**
1. Find process using port: `lsof -i :3000`
2. Kill process: `sudo kill -9 [PID]`
3. Or use different port: Edit `/etc/wise2/server.env` and change `API_PORT`

---

## Rollback / Removal

To remove the new server from the WISE² network:

```bash
# Stop the service
sudo systemctl stop wise2-server
sudo systemctl disable wise2-server

# Remove systemd service
sudo rm /etc/systemd/system/wise2-server.service
sudo systemctl daemon-reload

# Remove configuration
sudo rm -rf /etc/wise2

# Remove service user
sudo userdel -r wise2-service

# Leave Tailscale (optional)
sudo tailscale logout
sudo systemctl stop tailscaled
```

---

## Summary

| Step | Action | Time | Status |
|------|--------|------|--------|
| 1 | Audit new server | 2 min | Run script |
| 2 | Integrate with Hermes | 5 min | Run script |
| 3 | Tag in Tailscale | 2 min | Manual |
| 4 | Verify network | 2 min | Test connectivity |
| 5 | Health check | 2 min | Curl endpoints |
| 6 | Configure peers | 2 min | Add peer tokens |

**Total Time:** ~15 minutes per server

---

## Questions?

- **Network issues:** Check Tailscale admin console and ACL rules
- **Service issues:** Check systemd logs: `sudo journalctl -u wise2-server`
- **Docker issues:** Check Docker logs: `docker logs wise2-api`
- **Hermes issues:** Check Hermes status: `hermes status`

---

**Version:** 1.0  
**Last Updated:** 2026-11-19  
**Status:** Production Ready

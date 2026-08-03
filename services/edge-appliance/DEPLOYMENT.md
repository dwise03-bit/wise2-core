# WISE² Edge Appliance Deployment Guide

This guide covers production deployment of WISE² Edge Appliance to Raspberry Pi clusters.

## Prerequisites

### Hardware
- **Raspberry Pi 4** (minimum): 4GB RAM, 32GB SD card
- **Raspberry Pi 5** (recommended): 8GB RAM, 128GB NVMe SSD
- Reliable power supply (5V/3A minimum)
- Stable network connectivity (wired Ethernet recommended)

### Software
- Raspberry Pi OS (Bullseye or newer)
- Ansible 2.10+ (for fleet deployment)
- SSH access to all nodes
- Docker credentials (if pulling from private registry)

### Network
- WireGuard VPN for cloud connectivity (optional but recommended)
- Firewall rules allowing port 3000 (API), 3002 (webhooks), 11434 (Ollama)

## Single Node Deployment

### 1. Prepare Raspberry Pi

```bash
# SSH into Pi
ssh pi@192.168.1.100

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Enable memory split for GPU
sudo nano /boot/config.txt
# Set: gpu_mem=256
sudo reboot
```

### 2. Install Prerequisites

```bash
# Install system dependencies
sudo apt-get install -y \
  curl wget git \
  build-essential \
  python3-pip python3-dev \
  docker.io docker-compose \
  wireguard-tools

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Deploy Edge Appliance

```bash
# Clone repository
git clone https://github.com/wise2/wise2-core.git
cd wise2-core/services/edge-appliance

# Create environment file
cp .env.example .env
nano .env
# Configure:
# - NODE_ID (unique identifier)
# - CLOUD_URL and API_KEY
# - Paths as needed

# Install and build
npm install
npm run build

# Start service
npm run docker:run

# Verify
curl http://localhost:3000/health
```

### 4. Configure Systemd Service

```bash
# Copy provided systemd service
sudo cp ansible/wise2-edge.service /etc/systemd/system/

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable wise2-edge
sudo systemctl start wise2-edge

# Check status
sudo systemctl status wise2-edge
```

## Fleet Deployment (Multiple Nodes)

### 1. Prepare Ansible

```bash
# Install Ansible
pip3 install ansible

# Create inventory
mkdir -p ansible
cat > ansible/inventory.yml << 'EOF'
all:
  children:
    edge_nodes:
      hosts:
        edge-node-1:
          ansible_host: 192.168.1.100
        edge-node-2:
          ansible_host: 192.168.1.101
        edge-node-3:
          ansible_host: 192.168.1.102
      vars:
        ansible_user: pi
        ansible_password: raspberry
        cloud_url: https://api.wise2.cloud
        api_key: YOUR_API_KEY
        admin_email: admin@wise2.cloud
EOF

# Create Ansible vault for secrets
ansible-vault create ansible/secrets.yml
# Add:
# vault_api_key: <your-api-key>
# vault_raspberry_password: <password>
# vault_jwt_secret: <random-secret>
```

### 2. Run Deployment Playbook

```bash
# Syntax check
ansible-playbook -i ansible/inventory.yml ansible/setup.yml --syntax-check

# Deploy to all nodes (slow, one at a time)
ansible-playbook -i ansible/inventory.yml ansible/setup.yml

# Deploy to specific node
ansible-playbook -i ansible/inventory.yml ansible/setup.yml -l edge-node-1

# Deploy with extra variables
ansible-playbook -i ansible/inventory.yml ansible/setup.yml \
  --extra-vars "@ansible/secrets.yml"

# Dry run (check mode)
ansible-playbook -i ansible/inventory.yml ansible/setup.yml --check
```

### 3. Parallel Deployment (Advanced)

For faster deployment to many nodes:

```bash
# Deploy to 3 nodes in parallel
ansible-playbook -i ansible/inventory.yml ansible/setup.yml \
  -f 3 \
  --limit edge_production

# Monitor progress
watch -n 5 'ansible all -i ansible/inventory.yml -m shell -a "systemctl status wise2-edge | grep Active"'
```

## Configuration Management

### Environment Variables

Create `.env.production` for production settings:

```bash
NODE_ENV=production
NODE_ID=edge-node-1
CLOUD_URL=https://api.wise2.cloud
API_KEY=<secure-api-key>
LOCAL_DB_PATH=/opt/wise2-edge/data/wise2-edge.db
LOG_LEVEL=info
SYNC_INTERVAL=30000
HEALTH_CHECK_INTERVAL=30000
```

### WireGuard VPN Setup

For secure cloud communication:

```bash
# Generate keypair on management host
wg genkey | tee privatekey | wg pubkey > publickey

# Create WireGuard config
sudo nano /etc/wireguard/wise2.conf

# Example config
[Interface]
Address = 10.0.0.2/32
PrivateKey = <client-private-key>
ListenPort = 51820

[Peer]
PublicKey = <server-public-key>
AllowedIPs = 10.0.0.0/24
Endpoint = vpn.wise2.cloud:51820
PersistentKeepalive = 25

# Enable
sudo systemctl enable wg-quick@wise2
sudo systemctl start wg-quick@wise2
```

### Model Management

```bash
# Download models locally
docker exec wise2-ollama ollama pull mistral
docker exec wise2-ollama ollama pull neural-chat

# List models
docker exec wise2-ollama ollama list

# Model selection in config
VOICE_MODEL=mistral  # For voice
AGENT_MODEL=neural-chat  # For agent
```

## Monitoring & Maintenance

### Health Monitoring

```bash
# Continuous health check
watch -n 5 'curl http://localhost:3000/health | jq'

# Generate health report
curl http://localhost:3000/health/report

# View metrics
curl http://localhost:3000/health/metrics | jq '.[] | {cpuUsage, memoryUsage, temperature}'
```

### Log Management

```bash
# Follow live logs
journalctl -u wise2-edge -f

# Search for errors
journalctl -u wise2-edge -p err

# Export logs
journalctl -u wise2-edge -o json > logs.json
```

### Remote Debugging

```bash
# SSH into node
ssh pi@192.168.1.100

# Check service status
systemctl status wise2-edge

# View recent logs
journalctl -u wise2-edge -n 100

# Check resource usage
top -p $(systemctl show -p MainPID --value wise2-edge)

# Test API
curl http://localhost:3000/health
```

## Backup & Recovery

### Database Backup

```bash
# Manual backup
docker-compose exec edge-runtime sqlite3 /data/wise2-edge.db ".backup '/data/backup.db'"

# Automated backup (add to cron)
0 2 * * * sudo docker-compose -f /opt/wise2-edge/docker-compose.yml exec edge-runtime sqlite3 /data/wise2-edge.db ".backup '/data/backup_$(date +%s).db'"
```

### Configuration Backup

```bash
# Backup configuration
tar -czf wise2-edge-backup-$(date +%s).tar.gz \
  /opt/wise2-edge/.env \
  /etc/systemd/system/wise2-edge.service \
  /etc/wireguard/wise2.conf

# Restore
tar -xzf wise2-edge-backup-*.tar.gz -C /
```

## Troubleshooting

### Service Won't Start

```bash
# Check logs
journalctl -u wise2-edge -n 50

# Verify configuration
sudo systemctl cat wise2-edge

# Manual start to see errors
cd /opt/wise2-edge && npm start
```

### High CPU/Memory Usage

```bash
# Check container limits
docker stats wise2-edge-runtime

# Adjust limits
docker-compose up -d --scale edge-runtime=1 -e MemoryMax=1024M

# Monitor over time
watch -n 1 'docker stats wise2-edge-runtime --no-stream'
```

### Network Connectivity Issues

```bash
# Check IP configuration
ip addr show

# Test cloud connectivity
ping api.wise2.cloud
curl -v https://api.wise2.cloud/health

# Check WireGuard status
sudo wg show

# Test VPN tunnel
ping 10.0.0.1  # Server IP in VPN
```

### Database Corruption

```bash
# Check database integrity
sqlite3 /opt/wise2-edge/data/wise2-edge.db "PRAGMA integrity_check;"

# Attempt recovery
sqlite3 /opt/wise2-edge/data/wise2-edge.db ".recover" | sqlite3 /opt/wise2-edge/data/wise2-edge-recovered.db

# Restore from backup if needed
cp /opt/wise2-edge/data/backup.db /opt/wise2-edge/data/wise2-edge.db
systemctl restart wise2-edge
```

## Security Hardening

### SSH Hardening

```bash
# Generate SSH key
ssh-keygen -t ed25519 -f ~/.ssh/wise2-deploy

# Copy to nodes
ssh-copy-id -i ~/.ssh/wise2-deploy.pub pi@192.168.1.100

# Disable password auth in /etc/ssh/sshd_config
PasswordAuthentication no
PubkeyAuthentication yes
```

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow from any to any port 22  # SSH
sudo ufw allow from any to any port 3000  # API
sudo ufw allow from any to any port 3002  # Webhooks
sudo ufw allow from any to any port 51820  # WireGuard
sudo ufw enable
```

### TLS Configuration

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 \
  -keyout /etc/wise2/tls/key.pem \
  -out /etc/wise2/tls/cert.pem \
  -days 365 -nodes

# Enable TLS
TLS_ENABLED=true
TLS_CERT_PATH=/etc/wise2/tls/cert.pem
TLS_KEY_PATH=/etc/wise2/tls/key.pem
```

## Performance Tuning

### Database Optimization

```bash
# VACUUM to reclaim space
sqlite3 /opt/wise2-edge/data/wise2-edge.db "VACUUM;"

# Analyze for query optimization
sqlite3 /opt/wise2-edge/data/wise2-edge.db "ANALYZE;"
```

### System Tuning

```bash
# Increase file descriptors
echo "wise2 soft nofile 65535" | sudo tee -a /etc/security/limits.conf
echo "wise2 hard nofile 65535" | sudo tee -a /etc/security/limits.conf

# Tune TCP stack
sudo sysctl -w net.core.rmem_max=134217728
sudo sysctl -w net.core.wmem_max=134217728

# Make persistent
sudo nano /etc/sysctl.conf
# Add:
# net.core.rmem_max=134217728
# net.core.wmem_max=134217728
```

## Rollback Procedures

### Revert to Previous Version

```bash
# If using git deployment
cd /opt/wise2-edge
git checkout previous-tag
npm install
npm run build
systemctl restart wise2-edge

# If using Docker
docker pull wise2/edge-appliance:previous-tag
docker-compose up -d
```

## Success Criteria

After deployment, verify:

- [ ] Service running: `systemctl status wise2-edge`
- [ ] API responding: `curl http://localhost:3000/health`
- [ ] Database initialized: `/opt/wise2-edge/data/wise2-edge.db` exists
- [ ] Ollama running: `curl http://localhost:11434/api/tags`
- [ ] Cloud sync working: Check `/health/report`
- [ ] Logs flowing: `journalctl -u wise2-edge`
- [ ] Health checks passing: `curl http://localhost:3000/health/report`

## Support

For deployment issues:
- Check logs: `journalctl -u wise2-edge -f`
- Review documentation: https://wise2.cloud/docs/edge-appliance
- Report issues: https://github.com/wise2/wise2-core/issues
- Contact support: support@wise2.cloud

---

**Last Updated**: 2026-07-21

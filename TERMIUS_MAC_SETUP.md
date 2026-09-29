# Termius SSH Integration for Mac

**Goal**: Remote access to VPS (173.208.147.165) from Mac using Termius terminal app

## Prerequisites
- Termius installed on Mac (from App Store or termius.com)
- SSH key already generated: `~/.ssh/vps-deploy`
- VPS reachable at 173.208.147.165:22

## Step 1: Import SSH Key into Termius (One-Time)

### Open Termius Settings
1. Launch **Termius** on Mac
2. Click **Termius** menu → **Preferences** (or Cmd+,)
3. Go to **Keys** tab

### Add Private Key
1. Click **+** button to add new key
2. Select **Import Key**
3. Navigate to: `~/.ssh/vps-deploy`
4. Confirm import (no passphrase needed if key is unencrypted)
5. Label it: **vps-deploy** (optional but recommended)
6. Click **Save**

**Verify**: Key should appear in Keys list with fingerprint visible

---

## Step 2: Create Host Connection

### Add New Host
1. In Termius, click **Hosts** tab (or **+** → **New Host**)
2. Click **+** to create new host
3. Fill in:
   - **Nickname**: `WISE2-VPS` (or your preferred name)
   - **Address**: `173.208.147.165`
   - **Port**: `22` (default)
   - **User**: `dwise`
   - **Password**: Leave empty
   - **Key**: Select **vps-deploy** (from Step 1)

### Advanced Settings (Optional)
- **Timeout**: 30 seconds
- **Keep Alive**: Enable (recommended for long sessions)

4. Click **Save**

**Verify**: Host appears in Termius list, colored green when online

---

## Step 3: First Connection Test

1. In Termius, find **WISE2-VPS** host
2. Click to connect
3. First time: Accept SSH fingerprint (appears as alert)
4. **Expected**: SSH prompt shows you're logged in as `dwise@173.208.147.165`

```
Welcome to Ubuntu 24.04.4 LTS (GNU/Linux 6.8.0-139...
System load: X.XX
...
dwise@wise2-core:~$
```

---

## Common Commands on VPS

Once connected, you can run these commands:

### Check Router Status
```bash
docker ps -a | grep router
docker logs wise2-ai-router-prod | tail -20
curl http://localhost:3100/health
```

### Start/Stop Services
```bash
# Start all services
cd ~/wise2-core && docker-compose -f docker-compose.production.yml up -d

# Stop services
docker-compose -f docker-compose.production.yml down

# Restart specific service
docker restart wise2-ai-router-prod
```

### View Deployment Logs
```bash
docker logs wise2-ai-router-prod | tail -50
docker logs $(docker ps -q -f name=postgres) | tail -20
```

### Check Disk/Memory
```bash
df -h           # Disk usage
du -sh *        # Directory sizes
free -h         # Memory usage
```

### Monitor Running Containers
```bash
docker ps
docker stats
```

---

## Troubleshooting

### "Connection refused"
- Check VPS is online: `ping 173.208.147.165`
- Check SSH port: `ssh -p 22 dwise@173.208.147.165`

### "Permission denied (publickey)"
- Verify key in Termius: Preferences → Keys (should see vps-deploy)
- Verify key on VPS: `cat ~/.ssh/authorized_keys` (should contain your public key)
- Try SSH from terminal: `ssh -i ~/.ssh/vps-deploy dwise@173.208.147.165`

### "Key fingerprint not recognized"
- This is normal first time — accept and continue
- Future connections will auto-verify

---

## Advanced: Termius Shortcuts

### Create Quick Commands
In Termius → Host → **Snippets** (or **Commands**):

```
# Check router health
curl http://localhost:3100/health | jq .

# Deploy latest code
cd ~/wise2-core && git pull && docker-compose -f docker-compose.production.yml up -d

# View budget status
curl http://localhost:3100/api/status -H "X-API-Key: sk-test" | jq .
```

Save as snippets for one-click execution.

---

## Keep-Alive SSH Tunnel (Optional)

If you need persistent background tunnels (e.g., for Grafana):

```bash
# In local terminal (not Termius)
ssh -i ~/.ssh/vps-deploy -N -L 3012:127.0.0.1:3012 dwise@173.208.147.165
```

Then access locally: `http://localhost:3012`

---

## Termius Features to Explore

- **Hosts**: Organize connections by group (Production, Staging, etc.)
- **Snippets**: Save common commands as buttons
- **Themes**: Dark/Light themes available
- **Font Size**: Adjust in Preferences → Display
- **Sync**: Connect Termius account to sync hosts across devices

---

## Success Indicators

✅ You're set up correctly when:
1. SSH key imported in Termius
2. WISE2-VPS host shows as "Online" (green)
3. Can connect and see Ubuntu prompt
4. Can run `docker ps` and see running containers
5. Can run `curl http://localhost:3100/health` and get JSON response

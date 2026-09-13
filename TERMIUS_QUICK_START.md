# 🚀 TERMIUS + VPS Quick Start

## ✅ What's Ready

Your Mac now has **instant VPS access**:

```bash
# From Terminal - SSH shortcuts auto-installed:
vps                    # Direct SSH to VPS (173.208.147.165)
vps-health             # Check router health
vps-status             # Check budget status  
vps-logs               # View router logs
```

SSH is **fully configured and tested**.

---

## 🎯 Add to Termius (Manual - 30 seconds)

If you want Termius as your terminal instead of Mac Terminal:

### Option 1: Quick Import
1. **Open Termius**
2. Click **Hosts** tab
3. Click **+** → **New Host**
4. Copy-paste these values:
   - **Nickname**: `WISE2-VPS`
   - **Address**: `173.208.147.165`
   - **Port**: `22`
   - **User**: `dwise`
   - **Key**: Select `vps-deploy` (import it first if needed)
5. Click **Save**

### Option 2: Use SSH Config
Termius can import from `~/.ssh/config` which already has:
```
Host wise2-vps
  HostName 173.208.147.165
  User dwise
  IdentityFile ~/.ssh/vps-deploy
```

Open Termius → Hosts → Import from SSH Config

---

## 🔑 SSH Key Setup (Already Done)

Your `~/.ssh/vps-deploy` key is:
- ✅ In place on Mac
- ✅ Authorized on VPS
- ✅ Working for direct SSH
- ✅ Ready for Termius import

---

## 📊 VPS Commands

Once connected (via `vps` or Termius):

```bash
# Check router
curl http://localhost:3100/health | jq .
curl http://localhost:3100/api/status -H "X-API-Key: sk-test" | jq .

# View logs
docker logs wise2-ai-router-prod | tail -50
docker ps

# Manage services
docker-compose -f docker-compose.production.yml ps
docker-compose -f docker-compose.production.yml restart wise2-ai-router-prod

# System info
df -h
free -h
docker stats
```

---

## ✨ Status

- **SSH Access**: ✅ Working
- **VPS Router**: ✅ Running (port 3100)
- **Termius Ready**: ✅ Add host manually (UI automation blocked)
- **Fallback Shortcuts**: ✅ Available via `vps` command

**Recommendation**: Use `vps` shortcuts from Terminal for fastest access, or add WISE2-VPS to Termius for a centralized terminal.

# 🔐 Darren SSH & GitHub Sync Checklist

**Status**: Darren is a registered co-owner (@darrinwisejr) — now activating SSH access  
**Date**: 2026-10-08  
**Last Verified**: main branch clean & synced

---

## ✅ DANIEL's Setup (Complete)

- [x] SSH working for GitHub (dwise03-bit authenticated)
- [x] Repository synced with origin/main
- [x] No uncommitted changes
- [x] Latest commit: Agent Network Dashboard (1db8f686)

---

## 🔧 DARREN's Setup Checklist

### Step 1: Accept GitHub Invitation
```
[ ] Go to: https://github.com/dwise03-bit/wise2-core/invitations
[ ] Click "Accept Invitation" for dwise03-bit/wise2-core
[ ] Verify you're now a collaborator with Write access
```

### Step 2: Generate SSH Key (on Darren's Windows Machine)
```powershell
# Open PowerShell or Windows Terminal

# Generate SSH key (ed25519 is modern & secure)
ssh-keygen -t ed25519 -f $env:USERPROFILE\.ssh\github_darren -C "darren@wise2.net"

# Press Enter 2x (no passphrase needed)

# View the public key (copy this)
Get-Content $env:USERPROFILE\.ssh\github_darren.pub
```

### Step 3: Add SSH Key to GitHub
```
[ ] Go to: https://github.com/settings/ssh/new
[ ] Title: "Windows PC - Darren"
[ ] Paste the public key from Step 2
[ ] Click "Add SSH Key"
```

### Step 4: Configure Git (on Windows)
```bash
# Tell git which SSH key to use
git config --global core.sshCommand "ssh -i ~/.ssh/github_darren"

# Verify git SSH user (should show Darren's username)
ssh -T git@github.com
# Expected: "Hi darrinwisejr! You've successfully authenticated..."
```

### Step 5: Clone the Repository
```bash
# Choose a location (e.g., C:\Projects or $env:USERPROFILE\Projects)
cd $env:USERPROFILE\Projects

# Clone the repo
git clone git@github.com:dwise03-bit/wise2-core.git

# Navigate into it
cd wise2-core
```

### Step 6: Verify Sync
```bash
# Check status
git status
# Expected: "On branch main... nothing to commit"

# Check latest commits
git log --oneline -5
# Expected: Latest should be "Agent Network Dashboard"

# Verify remote
git remote -v
# Expected: Both fetch and push should show git@github.com:dwise03-bit/wise2-core.git
```

---

## 📋 Verification Commands

Run these on Darren's machine to confirm full sync:

```bash
# 1. SSH auth working?
ssh -T git@github.com

# 2. Git config correct?
git config --global core.sshCommand

# 3. Cloned repo?
ls ~/Projects/wise2-core/.git

# 4. On main branch?
git branch

# 5. Up to date?
git pull origin main
git log --oneline -1
```

---

## 🎯 Next: Collaboration Ready

Once all steps above are ✅, Darren can:
- [ ] Create feature branches: `git checkout -b feat/feature-name`
- [ ] Push to GitHub: `git push origin feat/feature-name`
- [ ] Create Pull Requests
- [ ] Merge code to main (as co-owner)
- [ ] Deploy via CI/CD (automatic on main push)
- [ ] Access Tailscale infrastructure (VPS, TV Hub, etc.)

---

## ❌ Troubleshooting

**"Permission denied (publickey)"** — SSH key not found
- Verify key path: `~/.ssh/github_darren` exists
- Verify GitHub has the key: https://github.com/settings/ssh/new
- Re-run: `git config --global core.sshCommand "ssh -i ~/.ssh/github_darren"`

**"Could not authenticate"** — GitHub key mismatch
- Check fingerprint: `ssh-keygen -lf ~/.ssh/github_darren.pub`
- Compare with GitHub: https://github.com/settings/ssh/new
- Regenerate if needed

**"fatal: could not read Username"** — Git isn't using SSH
- Verify URL is SSH: `git remote -v` should show `git@github.com:...`
- Not HTTPS: `https://github.com/...`

**Tailscale access issues** —
- Check Tailscale status: `tailscale status`
- Verify Windows device is connected
- Ping VPS: `ping gpu-nmls.tail1dc3bd.ts.net`

---

## 📞 Contact Daniel (@dwise03-bit) if:
- SSH setup fails repeatedly
- GitHub collaborator invitation expired
- Tailscale device won't connect
- Need VPS/infrastructure access help
- Ready for deployment training

---

**Goal**: ✅ Darren fully synced and ready to collaborate on main branch

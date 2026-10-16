# WISE² Co-Owner Handoff — Darrin Wise Jr

**Date**: October 7, 2026  
**Status**: ✅ FULLY ACTIVATED & OPERATIONAL  
**Version**: 1.0

---

## Executive Summary

You are now a **full co-owner of WISE²** with complete infrastructure access, deployment permissions, and operational responsibility alongside Daniel Wise. This document contains everything you need to operate as a co-owner.

**Your Role**: Co-Owner with Daniel Wise (@dwise03-bit)  
**Your Device**: Windows PC (100.100.26.47)  
**Your Authority**: Full deployment, code review, infrastructure access  

---

## 🔐 Your Accounts & Access

### GitHub
- **Username**: @wisevillain86
- **Role**: Co-Owner of dwise03-bit/wise2-core
- **Permissions**: Push to main, merge PRs, manage deployments, create releases
- **MFA**: Enable immediately if not already enabled
- **Link**: https://github.com/dwise03-bit/wise2-core

### Tailscale Network
- **Device Name**: darrinwisejr (Windows)
- **MagicDNS Hostname**: darrinwisejr.tail1dc3bd.ts.net
- **Device IP**: 100.100.26.47 (authoritative)
- **Network Status**: Connected to mesh
- **Access**: All internal systems via Tailscale (MagicDNS preferred over IP)
- **Dashboard**: https://login.tailscale.com/admin/machines

### VPS (gpu-nmls)
- **Hostname**: gpu-nmls
- **MagicDNS**: gpu-nmls.tail1dc3bd.ts.net
- **Tailscale IP**: 100.68.145.5 (authoritative)
- **SSH User**: dwise
- **Auth Method**: Tailscale (no password needed)
- **SSH Command**: `ssh dwise@gpu-nmls.tail1dc3bd.ts.net` (preferred) or `ssh dwise@100.68.145.5`
- **Docker**: All services running
- **Deployed Services**: API, Website, Dashboard, Database, Redis + 8 more

### TV Hub Display (wise2-surface)
- **Hostname**: wise2-surface
- **MagicDNS**: wise2-surface.tail1dc3bd.ts.net
- **Tailscale IP**: 100.97.230.73 (authoritative)
- **SSH User**: dwise
- **Auth Method**: Tailscale (no password needed)
- **SSH Command**: `ssh dwise@wise2-surface.tail1dc3bd.ts.net` (preferred) or `ssh dwise@100.97.230.73`
- **Display Service**: wise2-display (systemd)
- **Display Port**: 3000 (http://wise2-surface.tail1dc3bd.ts.net:3000 or http://100.97.230.73:3000)

### Cloudflare
- **Zone**: wise2.net
- **DNS Management**: Configured for VPS routing
- **SSL/TLS**: Automatic HTTPS
- **Status**: Active
- **Access**: Contact Daniel for Cloudflare account access

---

## 🛠️ Your Development Environment

### Installed Tools
- **Claude Code CLI**: Installed globally via npm
- **Claude Desktop App**: Installing (download from https://claude.ai/download)
- **Node.js/npm**: Latest stable
- **Git**: Configured with SSH
- **SSH Keys**: Generated and configured for VPS/TV Hub access

### Project Setup
- **Repository**: ~/Projects/wise2-core
- **Branch**: main (protected)
- **Remote**: git@github.com:dwise03-bit/wise2-core.git
- **Initialization**: `claude init` already run

### Quick Start Commands

```bash
# Navigate to project
cd ~/Projects/wise2-core

# Start Claude development
claude code .

# Check git status
git status

# Pull latest
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "feat: description of your changes"

# Push to GitHub (triggers automatic deployment)
git push origin feature/your-feature-name

# Create pull request on GitHub
# Once merged to main, automatic deployment starts
```

---

## 🚀 Deployment Pipeline

### How Deployments Work

1. **You push code** to any branch: `git push origin feature/your-feature`
2. **GitHub Actions runs**: Linting, tests, build checks
3. **You create a PR** on GitHub
4. **Co-owner reviews** (Daniel or you review each other's PRs)
5. **Merge to main** when approved
6. **Automatic Deployment**:
   - GitHub Actions detects push to main
   - VPS deployment stage runs (100.68.145.5)
   - TV Hub deployment stage runs (100.97.230.73)
   - Notification sent to team
   - Live on production within 5-10 minutes

### Manual Deployment

For urgent TV Hub display updates:

```bash
./scripts/deploy-display.sh   # not yet in this repo
```

This deploys display updates immediately without waiting for full CI/CD.

### Deployment Status

Check live deployment status:
- **GitHub Actions**: https://github.com/dwise03-bit/wise2-core/actions
- **VPS Logs**: `ssh dwise@gpu-nmls.tail1dc3bd.ts.net "docker-compose logs -f"`
- **TV Hub Logs**: `ssh dwise@wise2-surface.tail1dc3bd.ts.net "journalctl -u wise2-display -f"`

---

## 📋 Daily Operations

### Morning Briefing (Optional)

```bash
# Check system status
tailscale status

# Check for urgent issues
ssh dwise@gpu-nmls.tail1dc3bd.ts.net "docker ps"
ssh dwise@wise2-surface.tail1dc3bd.ts.net "systemctl status wise2-display"

# Check recent deployments
cd ~/Projects/wise2-core && git log --oneline -5
```

### Code Development Flow

1. **Create feature branch**: `git checkout -b feature/my-work`
2. **Make changes** and test locally
3. **Commit regularly**: `git commit -m "feat: incremental progress"`
4. **Push branch**: `git push origin feature/my-work`
5. **Create PR on GitHub** with description
6. **Request review** from Daniel or ping on Discord
7. **Address feedback** if any
8. **Merge to main** when approved
9. **Monitor deployment** on GitHub Actions
10. **Verify live**: Check VPS and TV Hub are updated

### Deployment Verification

After each deployment, verify:

```bash
# Check VPS is healthy
curl https://api.wise2.net/health || echo "API check failed"

# Check TV Hub display
curl http://wise2-surface.tail1dc3bd.ts.net:3000/health || echo "Display check failed"

# SSH to verify services
ssh dwise@gpu-nmls.tail1dc3bd.ts.net "docker ps | grep wise2"
```

---

## 🔍 Troubleshooting

### SSH Connection Issues

```bash
# Test Tailscale connectivity
tailscale status

# Test VPS connection (use MagicDNS hostname)
ssh -v dwise@gpu-nmls.tail1dc3bd.ts.net "echo OK"

# Test TV Hub connection
ssh -v dwise@wise2-surface.tail1dc3bd.ts.net "echo OK"

# Manually specify key if needed
ssh -i ~/.ssh/id_rsa dwise@gpu-nmls.tail1dc3bd.ts.net

# Check SSH config
cat ~/.ssh/config

# Verify host keys
ssh-keyscan -t rsa gpu-nmls.tail1dc3bd.ts.net >> ~/.ssh/known_hosts
```

### Git Push Fails

```bash
# Check remote config
git remote -v

# Verify SSH key is loaded
ssh-add -l

# If key not loaded
ssh-add ~/.ssh/id_rsa

# Retry push
git push origin main
```

### Deployment Stuck or Failed

1. **Check GitHub Actions** for error messages: https://github.com/dwise03-bit/wise2-core/actions
2. **Check VPS logs**: `ssh dwise@100.68.145.5 "docker-compose logs -f wise2-api"`
3. **Check TV Hub logs**: `ssh dwise@100.97.230.73 "journalctl -u wise2-display -n 50"`
4. **Contact Daniel** if immediate action needed

### Service Down

**VPS Down?**
```bash
ssh dwise@gpu-nmls.tail1dc3bd.ts.net
docker-compose restart wise2-api
docker-compose ps
```

**TV Hub Down?**
```bash
ssh dwise@wise2-surface.tail1dc3bd.ts.net
sudo systemctl restart wise2-display
systemctl status wise2-display
```

---

## 🚨 Emergency Procedures

### Immediate Rollback

If deployment breaks production:

```bash
# SSH to VPS
ssh dwise@gpu-nmls.tail1dc3bd.ts.net

# Check recent commits
git log --oneline -5

# Revert to last working state
git revert HEAD
git push origin main

# GitHub Actions will auto-redeploy
```

### Emergency Contact

- **Daniel Wise**: dwise03@gmail.com (primary)
- **Discord**: @dwise03-bit
- **GitHub**: @dwise03-bit

For critical issues, reach out immediately.

---

## 📚 Important Files & Documentation

### In Your Repository

- **COOWNER_INTEGRATION.md** — Full technical integration guide
- **DARRIN_COOWNER_HANDOFF.md** — This file
- **.github/CODEOWNERS** — Co-owner configuration
- **.github/workflows/deploy.yml** — CI/CD pipeline definition (in the `wise2-dashboard` repo, not this one)
- **cloudflare-config.toml** — DNS/security configuration (not yet in this repo)
- **scripts/setup-co-owner.sh** — Setup automation script (not yet in this repo)
- **scripts/deploy-display.sh** — Manual display deployment (not yet in this repo)

### On Your Machine

- **~/.wise2/deployments/config.json** — Deployment configuration
- **~/.ssh/id_rsa** — SSH private key (keep secure!)
- **~/.ssh/known_hosts** — SSH host keys

---

## ✅ Responsibilities as Co-Owner

### Code Review
- Review pull requests from team members
- Provide constructive feedback
- Approve/request changes before merge
- Minimum one co-owner approval required before main merge

### Deployment Oversight
- Monitor deployments after pushing to main
- Verify live systems are functioning
- Report any issues immediately
- Test new features in staging before production

### Infrastructure Maintenance
- Monitor VPS and TV Hub health
- Report unusual activity or errors
- Keep dependencies up to date
- Document any manual interventions

### Communication
- Keep Daniel informed of major changes
- Update project status in daily logs
- Notify team of planned deployments
- Document decisions in commit messages

---

## 🎯 Your Next Steps

### Immediate (Today)

- [ ] Enable MFA on GitHub account
- [ ] Test SSH to VPS: `ssh dwise@100.68.145.5 "docker ps"`
- [ ] Test SSH to TV Hub: `ssh dwise@100.97.230.73 "systemctl status wise2-display"`
- [ ] Verify Claude Code works: `claude --version`
- [ ] Review .github/workflows/deploy.yml (in `wise2-dashboard`)
- [ ] Read COOWNER_INTEGRATION.md for technical details

### This Week

- [ ] Complete Claude desktop app installation
- [ ] Make your first feature branch and test full deploy cycle
- [ ] Review recent commit history: `git log --oneline -20`
- [ ] Set up any IDE extensions or tools you prefer
- [ ] Create GitHub SSH key if not already done

### This Month

- [ ] Participate in at least 2 code reviews
- [ ] Deploy at least 1 feature to production
- [ ] Document any issues or improvements found
- [ ] Familiarize yourself with all services running on VPS

---

## 🔗 Quick Links

- **GitHub Repository**: https://github.com/dwise03-bit/wise2-core
- **GitHub Actions**: https://github.com/dwise03-bit/wise2-core/actions
- **Tailscale Dashboard**: https://login.tailscale.com/admin/machines
- **Claude Code Docs**: https://claude.com/claude-code
- **Project Issues/PRs**: https://github.com/dwise03-bit/wise2-core/issues

---

## 📞 Support

### Questions About...

**Setup/Access**: See COOWNER_INTEGRATION.md  
**Deployment**: Check GitHub Actions logs first, then ask Daniel  
**Code/Architecture**: Review existing PRs and commits for context  
**Emergency**: Contact Daniel immediately via Discord or email  

### Learning Resources

- Claude Code docs: https://claude.com/claude-code
- Git workflow: https://github.com/dwise03-bit/wise2-core
- Docker docs: https://docs.docker.com
- Tailscale docs: https://tailscale.com/kb

---

## 🎓 Final Notes

**You are now a full co-owner of WISE² with complete operational authority.**

- Trust your judgment — you have the same permissions as Daniel
- Communicate early if unsure — coordination prevents problems
- Document your decisions — future you and Daniel will thank you
- Keep security tight — your access keys are valuable
- Have fun — you're building production infrastructure!

**Welcome aboard, Darrin. Let's build something great together.**

---

**Version**: 1.0  
**Created**: 2026-10-07  
**Status**: Active  
**Last Updated**: 2026-10-07

---

*For questions or updates to this handoff, contact Daniel Wise (@dwise03-bit)*


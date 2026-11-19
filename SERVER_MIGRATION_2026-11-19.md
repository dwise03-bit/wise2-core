# WISE² Server Migration — 2026-11-19

## Migration Overview

**Status**: 🟡 IN PROGRESS  
**Migration Date**: 2026-11-19  
**Old VPS**: `173.208.147.165` (unreachable, decommissioned)  
**New Server**: `wise2` (Tailscale-based)

---

## New Server Configuration

| Property | Value |
|----------|-------|
| **Hostname** | `wise2` |
| **Tailscale IP** | `100.109.230.122` |
| **LAN IP** | `192.168.8.191` |
| **Public IP** | *To be determined* |
| **SSH User** | `dwise` |
| **OS** | Ubuntu 24.04.5 LTS |
| **Domain** | `wise2.net` (unchanged) |
| **Auth Method** | Tailscale SSH |

---

## Migration Checklist

### Phase 1: Verification (Pre-Migration)
- [ ] Verify SSH connectivity to `100.109.230.122` (Tailscale)
- [ ] Check available disk space: `df -h`
- [ ] Verify Docker/Docker Compose installed
- [ ] Confirm git repository cloned at `/home/dwise/wise2-core`
- [ ] Check which services already running on new server

### Phase 2: Configuration Updates
- [ ] Update GitHub Actions secrets:
  - `DEPLOY_HOST`: Change from `173.208.147.165` to `100.109.230.122`
  - `DEPLOY_USER`: Confirm `dwise`
  - `DEPLOY_KEY`: Verify SSH key works with Tailscale
- [ ] Update deployment documentation
- [ ] Update `.claude/` configuration files
- [ ] Update deployment scripts with new IP (optional — using secrets is preferred)

### Phase 3: Data Migration
- [ ] Backup database from old VPS (if accessible)
- [ ] Migrate PostgreSQL data
- [ ] Migrate Redis data (if needed)
- [ ] Verify data integrity on new server

### Phase 4: Service Deployment
- [ ] Deploy wise2-api to new server
- [ ] Deploy wise2-website to new server
- [ ] Deploy supporting services (PostgreSQL, Redis, etc.)
- [ ] Verify all health checks pass

### Phase 5: DNS & Public Access
- [ ] Determine public IP of new server
- [ ] Update DNS records for `wise2.net` (if public IP differs from Tailscale)
- [ ] Test public access to `https://wise2.net`
- [ ] Verify SSL/TLS certificates

### Phase 6: Decommission
- [ ] Archive data from old VPS
- [ ] Decommission `173.208.147.165`
- [ ] Update all documentation

---

## Critical Information

⚠️ **Important Notes**:
1. **Tailscale IP is private**: `100.109.230.122` is only accessible via Tailscale network
2. **Public endpoint needed**: For public DNS on `wise2.net`, need to identify public IP or use Tailscale exit node
3. **Old VPS unreachable**: Data may not have been migrated automatically
4. **SSH from local machine required**: This remote environment cannot SSH. Run migrations from your local machine.

---

## SSH Command Format

```bash
# Via Tailscale IP (requires Tailscale installed)
ssh dwise@100.109.230.122

# Via LAN IP (if on same network)
ssh dwise@192.168.8.191
```

---

## Next Steps

1. **From your local machine**, verify SSH connectivity:
   ```bash
   ssh dwise@100.109.230.122 "uname -a"
   ```

2. **Check services on new server**:
   ```bash
   ssh dwise@100.109.230.122 "docker ps -a"
   ```

3. **Update GitHub secrets** with new `DEPLOY_HOST`:
   - Go to: https://github.com/dwise03-bit/wise2-core/settings/secrets/actions
   - Edit `DEPLOY_HOST`: `100.109.230.122`

4. **Test deployment** to new server:
   ```bash
   cd /path/to/wise2-core
   git push origin main
   # GitHub Actions will auto-deploy to new server
   ```

---

## Rollback Plan

If issues occur during migration:
1. Keep old VPS data archived
2. Roll back GitHub secrets to old IP (if still accessible)
3. Document issues for post-mortem

---

**Last Updated**: 2026-11-19  
**Updated By**: Claude Code  
**Status**: Ready for Phase 1 verification

# WISE² Core - Disaster Recovery & Rollback System

Complete disaster recovery solution for Raspberry Pi deployments, enabling safe rollback of failed deployments with data preservation.

---

## What's Included

This disaster recovery system consists of:

### 1. **Rollback Script** (`rollback-pi.sh`)
Automated rollback to previous working deployment versions

- **Purpose**: Recover from deployment failures
- **Time**: 10-15 minutes
- **Safety**: Interactive confirmation, pre-rollback snapshots
- **Verification**: Automatic health checks after rollback
- **Output**: Detailed report with recommendations

**Usage**:
```bash
./scripts/rollback-pi.sh pi.local prod
```

### 2. **Backup Manager** (`backup-manager.sh`)
Create, list, and restore backups for comprehensive data protection

- **Purpose**: Manage backup lifecycle
- **Retention**: 7 days, minimum 10 backups
- **Components**: Database + volumes + configuration
- **Recovery**: Point-in-time restoration capability

**Usage**:
```bash
./scripts/backup-manager.sh pi.local create
./scripts/backup-manager.sh pi.local list
./scripts/backup-manager.sh pi.local restore backup-20260723-120000
```

### 3. **Documentation**

#### [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md) - **START HERE**
Complete guide to understanding and using rollback

- When to rollback
- Pre-rollback checklist
- Step-by-step process
- Recovery scenarios
- Troubleshooting
- Post-rollback procedures
- Advanced usage

#### [DISASTER_RECOVERY_OPERATIONS.md](./DISASTER_RECOVERY_OPERATIONS.md)
Operational procedures for on-call engineers and DevOps teams

- Architecture overview
- Prevention strategies
- Emergency procedures
- Runbooks by scenario
- Backup strategy
- Automation & monitoring
- Communication templates
- Escalation paths

#### [QUICK_REFERENCE.txt](./QUICK_REFERENCE.txt) - **PRINT THIS**
One-page cheat sheet for emergency situations

- Emergency procedures
- Common issues & fixes
- Key commands
- Important paths
- Escalation contacts
- Decision tree

---

## Quick Start

### 1. System Down? (5 minutes)

```bash
# Rollback to previous version (interactive)
./scripts/rollback-pi.sh pi.local prod

# During execution:
# - Review the rollback plan
# - Confirm "yes" when prompted
# - Wait for health checks
# - Services will be restored

# Verify recovery
./scripts/health-check.sh
```

### 2. Before Every Deployment

```bash
# Create backup
./scripts/backup-manager.sh pi.local create

# Verify backup
./scripts/backup-manager.sh pi.local list

# Deploy (with rollback ready if needed)
./scripts/deploy-to-pi.sh pi.local prod

# Verify deployment
./scripts/health-check.sh
```

### 3. Backup Management

```bash
# List available backups
./scripts/backup-manager.sh pi.local list

# Restore from backup (if needed)
./scripts/backup-manager.sh pi.local restore backup-20260723-120000

# Cleanup old backups
./scripts/backup-manager.sh pi.local cleanup
```

---

## File Structure

```
scripts/
├── rollback-pi.sh                          # Main rollback script (executable)
├── backup-manager.sh                       # Backup management (executable)
├── README_DISASTER_RECOVERY.md             # This file
├── ROLLBACK_GUIDE.md                       # Complete rollback guide (READ FIRST)
├── DISASTER_RECOVERY_OPERATIONS.md         # Operational procedures
├── QUICK_REFERENCE.txt                     # Emergency cheat sheet (PRINT)
└── logs/
    ├── rollbacks/
    │   ├── rollback-YYYYMMDD-HHMMSS.log
    │   └── rollback-report-YYYYMMDD-HHMMSS.md
    └── backups/
        ├── backup.log
        └── backup-YYYYMMDD-HHMMSS/
            ├── db-dump.dump
            ├── volumes-postgres.tar.gz
            ├── volumes-redis.tar.gz
            └── BACKUP_MANIFEST.txt
```

---

## Quick Reference

### Common Commands

| Task | Command | Time |
|------|---------|------|
| Create backup | `./scripts/backup-manager.sh pi.local create` | 2-5 min |
| List backups | `./scripts/backup-manager.sh pi.local list` | <1 min |
| Rollback (interactive) | `./scripts/rollback-pi.sh pi.local prod` | 10-15 min |
| Health check | `./scripts/health-check.sh` | <1 min |
| View logs | `ssh pi@pi.local && docker-compose logs -f` | Real-time |

### Decision Tree

```
System is down
├─ SSH works? NO → Network issue (not covered here)
└─ SSH works? YES
   ├─ Recent deployment? YES → Rollback immediately
   ├─ Recent changes? YES → Rollback immediately
   ├─ Services won't start? YES → Check logs, then rollback
   └─ All else → Investigate root cause, then decide
```

### Recovery Times

| Scenario | RTO | Process |
|----------|-----|---------|
| Deployment bug | 10-15 min | Rollback to previous |
| Database issue | 15-30 min | Restore from backup |
| Complete failure | 30-60 min | Full system restore |
| Security issue | 10-20 min | Rollback + credential rotation |

---

## Documentation Map

### For Different Roles

**On-Call Engineer**:
1. Print [QUICK_REFERENCE.txt](./QUICK_REFERENCE.txt)
2. Read [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md)
3. Practice rollback in staging
4. Know escalation contacts

**DevOps Team**:
1. Read [DISASTER_RECOVERY_OPERATIONS.md](./DISASTER_RECOVERY_OPERATIONS.md)
2. Understand backup strategy
3. Test backup restoration quarterly
4. Review rollback logs monthly

**Engineering Lead**:
1. Review [DISASTER_RECOVERY_OPERATIONS.md](./DISASTER_RECOVERY_OPERATIONS.md)
2. Understand RTO/RPO targets
3. Set up incident escalation
4. Review postmortems

**CEO/Leadership**:
1. Read executive summary (below)
2. Understand recovery capabilities
3. Know communication plan

---

## Executive Summary

### What It Is

A complete disaster recovery solution that enables safe rollback of failed Raspberry Pi deployments with:
- **Data Preservation**: Database and file backups
- **Fast Recovery**: 10-15 minutes to restore from failed deployment
- **Automated Verification**: Health checks confirm successful recovery
- **Detailed Reporting**: Full documentation of what happened and why

### Why It Matters

- **Reduces Risk**: Rollback ability makes deployments safer
- **Faster Resolution**: 10 minutes vs 2+ hours to debug and fix
- **Preserves Data**: No data loss during recovery
- **Enables Confidence**: Team can deploy with backup plan

### How It Works

1. **Prevention**: Automatic backup before each deployment
2. **Detection**: Health checks identify issues immediately
3. **Response**: One-command rollback to previous version
4. **Recovery**: Verification and reporting
5. **Analysis**: Postmortem to prevent recurrence

### Impact

- **Uptime**: Recover from most failures in <15 minutes
- **Risk**: Reduced deployment risk with rollback capability
- **Cost**: Prevent revenue loss during outages
- **Confidence**: Team can deploy more frequently with safety net

---

## Getting Started

### Step 1: Read Documentation
- Start with: [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md)
- Reference: [DISASTER_RECOVERY_OPERATIONS.md](./DISASTER_RECOVERY_OPERATIONS.md)
- Emergency: [QUICK_REFERENCE.txt](./QUICK_REFERENCE.txt)

### Step 2: Test in Staging
```bash
# Practice rollback in staging environment
./scripts/rollback-pi.sh pi-staging staging

# Test backup/restore
./scripts/backup-manager.sh pi-staging create
./scripts/backup-manager.sh pi-staging list
```

### Step 3: Deploy with Confidence
```bash
# Before deployment
./scripts/backup-manager.sh pi.local create

# Deploy
./scripts/deploy-to-pi.sh pi.local prod

# If issues arise
./scripts/rollback-pi.sh pi.local prod
```

### Step 4: Setup Monitoring
```bash
# Continuous health monitoring
watch -n 5 'curl -sf http://pi.local:3000/health && echo OK || echo FAIL'

# Or: Set up automated checks (see DISASTER_RECOVERY_OPERATIONS.md)
```

---

## Key Features

### Rollback Script (`rollback-pi.sh`)

✓ **Interactive Version Selection**
  - Previous version (recommended)
  - Specific commit hash
  - Timestamped backup
  - Full git history display

✓ **Safety**
  - Pre-rollback snapshots
  - Confirmation required
  - Pre-rollback backup creation
  - Rollback plan review

✓ **Intelligence**
  - Database schema migration handling
  - Health checks after rollback
  - Volume restoration
  - Automatic service ordering

✓ **Reporting**
  - Detailed execution log
  - Recovery report in Markdown
  - Service status summary
  - Recommendations for next steps

### Backup Manager (`backup-manager.sh`)

✓ **Comprehensive Backup**
  - PostgreSQL database dump
  - Docker volumes (postgres + redis)
  - Configuration files
  - Metadata manifest

✓ **Automatic Management**
  - Retention policy (7 days, 10 min backups)
  - Cleanup of old backups
  - Size reporting
  - Backup verification

✓ **Flexible Restore**
  - Point-in-time restoration
  - Database-only restore
  - Full system restore
  - Minimal downtime

---

## Configuration

### Environment Variables (Optional)

```bash
# SSH Configuration
export SSH_USER="pi"              # Default: pi
export SSH_PORT="22"             # Default: 22
export SSH_TIMEOUT="30"          # Seconds

# Backup Configuration (in backup-manager.sh)
BACKUP_RETENTION_DAYS=7          # Keep 7 days
BACKUP_RETENTION_COUNT=10        # Keep 10 min backups

# Notifications (future enhancement)
export ALERT_EMAIL="..."
export SLACK_WEBHOOK="..."
export DISCORD_WEBHOOK="..."
```

### Pi Paths (Hardcoded)

These paths are built into the scripts:

```
Pi Deployment:     /opt/wise2-edge/
Pi Backups:        /opt/wise2-edge-backups/
Pi Data:           /opt/wise2-edge/data/
Pi Logs:           /var/log/wise2-edge-appliance/

Local Logs:        ./logs/rollbacks/
Local Backups:     ./logs/backups/
```

---

## Troubleshooting

### Can't Connect to Pi?
```bash
ping pi.local
ssh -v pi@pi.local  # Shows detailed error
```
See [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md#issue-cannot-connect-to-pi)

### Rollback Failed?
```bash
# Check logs
tail -f logs/rollbacks/rollback-*.log

# Review report
cat logs/rollbacks/rollback-report-*.md
```
See [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md#troubleshooting)

### Database Issues After Rollback?
```bash
# Check database
docker-compose exec postgres psql -U wise2 -d wise2_prod -c "SELECT 1;"

# Restore from backup if needed
./scripts/backup-manager.sh pi.local restore backup-XXX
```
See [DISASTER_RECOVERY_OPERATIONS.md](./DISASTER_RECOVERY_OPERATIONS.md)

---

## Support & Help

### Documentation
- Full guide: [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md)
- Operations: [DISASTER_RECOVERY_OPERATIONS.md](./DISASTER_RECOVERY_OPERATIONS.md)
- Quick help: [QUICK_REFERENCE.txt](./QUICK_REFERENCE.txt)

### Common Issues
- SSH connection problems
- Backup/restore failures
- Health check issues
- Service start failures
- Database problems

See troubleshooting sections in the documentation.

### Escalation
1. **Tier 1**: Refer to documentation
2. **Tier 2**: Contact DevOps lead
3. **Tier 3**: Contact platform architect
4. **Tier 4**: Contact engineering leadership

---

## Requirements

### On Local Machine
- Bash shell
- `git` command
- `ssh` and `scp` commands
- Write access to `logs/` directory

### On Raspberry Pi
- Docker & Docker Compose
- SSH server running
- Network connectivity
- Adequate disk space for backups

### Network
- SSH access to Pi (port 22, or custom)
- Pi can reach Docker registry (for image pulls)
- Local machine can reach Pi

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-23 | Initial release with rollback and backup system |

---

## Next Steps

1. **Immediate**: Print [QUICK_REFERENCE.txt](./QUICK_REFERENCE.txt) and post it
2. **This Week**: Read [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md) completely
3. **This Month**: 
   - Test rollback in staging
   - Set up monitoring
   - Train team on procedure
4. **Ongoing**:
   - Review rollback logs monthly
   - Test backup restoration quarterly
   - Update documentation as needed

---

## Questions?

See the documentation files in this directory:
- **Complete guide**: [ROLLBACK_GUIDE.md](./ROLLBACK_GUIDE.md)
- **Operations manual**: [DISASTER_RECOVERY_OPERATIONS.md](./DISASTER_RECOVERY_OPERATIONS.md)
- **Quick reference**: [QUICK_REFERENCE.txt](./QUICK_REFERENCE.txt)

Or contact:
- DevOps: [your-devops-email]
- Platform: [your-platform-email]
- Leadership: [your-leadership-email]

---

**WISE² Core Disaster Recovery System v1.0**  
Last Updated: 2026-07-23  
Status: ✓ Production Ready

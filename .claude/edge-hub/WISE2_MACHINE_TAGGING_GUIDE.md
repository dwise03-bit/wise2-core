# WISE² Tailscale Machine Tagging Guide

**Date**: 2026-09-20  
**Status**: Ready for Deployment  
**Machines**: 18 total across 6 tagged groups

---

## Overview

This guide covers how to tag all 18 WISE² machines with their designated Tailscale tags. Tags are essential for enforcing the WISE² ACL policies that control network access.

## Machine Configuration

### Complete Machine List (18 machines)

#### Infrastructure (5 machines) → `tag:infrastructure`
- `gpu-nmls` - GPU server
- `gpu-nmls-1` - GPU server backup
- `vps-0fa5d30a` - VPS primary
- `cursor-cloud-iphone-deploy` - Cloud agent
- `wise2-cloud-agent` - Cloud agent secondary

#### Edge Nodes (2 machines) → `tag:edge`
- `wise2-skorpious` - HVAC Pocket Node (Raspberry Pi 5)
- `skorpius` - Secondary Pi

#### Developers (3 machines) → `tag:developers` (+ 2 also get `tag:operators`)
- `daniels-macbook-pro` - macOS (also `tag:operators`)
- `dwise-mac` - macOS (also `tag:operators`)
- `gl-mt3600be` - Linux workstation

#### Field Tech (6 machines) → `tag:field-tech`
- `ipad-9th-gen-wifi` - iOS
- `iphone-15-pro-max` - iOS
- `iphone175` - iOS
- `iphone182` - iOS
- `google-pixel-slate` - Chromebook
- `motorola-razr-2025-xt2553v` - Android

#### Shared (1 machine) → `tag:shared`
- `darrinwisejr` - Windows shared device

---

## Tagging Methods

### Method 1: On Each Machine (Recommended)

Run on each machine directly:

```bash
bash apply_wise2_machine_tags.sh
```

**Steps**:
1. SSH into the machine
2. Download or copy `apply_wise2_machine_tags.sh`
3. Run it: `bash apply_wise2_machine_tags.sh`
4. The script will:
   - Detect the machine's hostname
   - Look up its designated tags
   - Apply them via `tailscale up --tags="..."`
5. Approve the login in Tailscale admin console if needed

**Example**:
```bash
# On gpu-nmls machine:
ssh user@gpu-nmls
curl -s https://your-server/apply_wise2_machine_tags.sh | bash

# Or if already downloaded:
bash apply_wise2_machine_tags.sh
```

### Method 2: Remote Deployment Script

Deploy tags to all machines from a central control machine:

```bash
# Configure SSH addresses in deploy_wise2_tags.sh first
./deploy_wise2_tags.sh --dry-run    # See what will happen
./deploy_wise2_tags.sh --deploy     # Actually deploy
```

**Prerequisites**:
- SSH access to all machines
- Tailscale installed on all machines
- SSH key-based authentication (no password prompts)

**Steps**:
1. Edit `deploy_wise2_tags.sh` to update SSH addresses
2. Run dry-run: `./deploy_wise2_tags.sh --dry-run`
3. Review the output
4. Run deploy: `./deploy_wise2_tags.sh --deploy`
5. Monitor progress and resolve any connection issues

### Method 3: Manual CLI Tagging

On each machine, manually run:

```bash
# Check if already logged in
tailscale status

# If logged in, update tags
tailscale up --tags="tag:shared"    # For shared devices
tailscale up --tags="tag:edge"      # For edge nodes
# etc.

# If not logged in, login with tags
tailscale up --tags="tag:shared"
# Then approve in admin console
```

---

## Implementation Checklist

### Preparation
- [ ] Review this guide and understand the 18 machines
- [ ] Verify SSH access to all machines
- [ ] Ensure Tailscale is installed on all machines
- [ ] Test connection to 1-2 machines

### Deployment
- [ ] Choose tagging method (1, 2, or 3)
- [ ] If using Method 1: SSH to each machine and run script
- [ ] If using Method 2: Update SSH addresses, run dry-run, deploy
- [ ] If using Method 3: Manually run tailscale commands on each machine

### Verification
- [ ] Go to https://login.tailscale.com/admin/machines
- [ ] Verify all 18 machines have their correct tags
- [ ] Check machine counts per tag:
  - `tag:infrastructure`: 5 machines
  - `tag:edge`: 2 machines
  - `tag:developers`: 3 machines (with 2 also having `tag:operators`)
  - `tag:field-tech`: 6 machines
  - `tag:shared`: 1 machine

### ACL Enforcement
- [ ] Navigate to https://login.tailscale.com/admin/acls/file
- [ ] Apply the WISE² ACL JSON (from `/tmp/wise2_tailscale_acl.json`)
- [ ] Test access from different groups to verify enforcement

### Testing
- [ ] From a developer machine: Can you access edge, infrastructure, and shared? ✓
- [ ] From a field-tech device: Can you access edge nodes only? ✓
- [ ] From infrastructure: Can you access other infrastructure? ✓
- [ ] Verify denied connections from unpermitted sources

---

## Troubleshooting

### Script Says "Machine Not Found"

**Cause**: Hostname doesn't match configuration  
**Fix**:
1. Check actual hostname: `hostname -s`
2. Add machine to script if new
3. Or manually run: `tailscale up --tags="tag:yourgroup"`

### Tailscale Not Installed

**Cause**: Tailscale client isn't installed  
**Fix**:
1. Install from https://tailscale.com/download
2. Then run tagging script again

### SSH Connection Timeout

**Cause**: SSH address incorrect or machine unreachable  
**Fix**:
1. Verify SSH address in deploy script
2. Test: `ssh -v user@machine "echo OK"`
3. Check network connectivity
4. Use Method 1 instead (manual on each machine)

### Tags Not Appearing

**Cause**: Tailscale needs time to process  
**Fix**:
1. Wait 30-60 seconds
2. Refresh admin console (F5)
3. Check: `tailscale status` on the machine

### "Not Authorized" Error

**Cause**: Tags need account admin approval  
**Fix**:
1. Go to Tailscale admin console
2. Check for pending authorizations
3. Approve the tag assignment
4. Device will sync within moments

---

## Script Usage Reference

### `apply_wise2_machine_tags.sh`

**Run on individual machines**

```bash
# Tag the current machine with its designated tags
bash apply_wise2_machine_tags.sh

# Show all machines and their tags
bash apply_wise2_machine_tags.sh --show-all

# Generate SSH commands for all machines
bash apply_wise2_machine_tags.sh --generate-commands

# Show help
bash apply_wise2_machine_tags.sh --help
```

### `deploy_wise2_tags.sh`

**Run from central control machine**

```bash
# See what will be deployed (no changes)
./deploy_wise2_tags.sh --dry-run

# Deploy tags to all configured machines
./deploy_wise2_tags.sh --deploy

# List all machines and their SSH addresses
./deploy_wise2_tags.sh --list

# Show help
./deploy_wise2_tags.sh --help
```

---

## ACL Policies (After Tagging)

Once machines are tagged, these ACL rules will be enforced:

| From | To | Ports | Allowed |
|------|----|----|---------|
| **Developers** | Infrastructure | All | ✓ |
| **Developers** | Edge | All | ✓ |
| **Developers** | Shared | All | ✓ |
| **Operators** | Infrastructure | All | ✓ |
| **Operators** | Edge | All | ✓ |
| **Operators** | Shared | All | ✓ |
| **Field-Tech** | Edge | 3000,3001,3002,3003,3004,3005,4000,8080 | ✓ |
| **Field-Tech** | Infrastructure | Any | ✗ |
| **Edge** | Infrastructure | 22,443,5433,6380 | ✓ |
| **Shared** | Edge | 3000,4000,8080 | ✓ |
| **Shared** | Infrastructure | Any | ✗ |
| **All Others** | Any | Any | ✗ |

---

## Quick Start

**For immediate deployment** (if SSH access configured):

```bash
# 1. Make scripts executable
chmod +x apply_wise2_machine_tags.sh deploy_wise2_tags.sh

# 2. Edit deploy_wise2_tags.sh with correct SSH addresses for your environment

# 3. Preview what will happen
./deploy_wise2_tags.sh --dry-run

# 4. Deploy to all machines
./deploy_wise2_tags.sh --deploy

# 5. Verify in Tailscale admin console
open https://login.tailscale.com/admin/machines
```

---

## Files

- `apply_wise2_machine_tags.sh` - Script to run on individual machines
- `deploy_wise2_tags.sh` - Script for centralized remote deployment
- `WISE2_MACHINE_TAGGING_GUIDE.md` - This guide
- `apply_wise2_tailscale_acl.sh` - ACL application documentation
- `WISE2_TAILSCALE_ORGANIZATION.md` - Network architecture documentation

---

## Next Steps

1. ✅ **Machines Tagged** - All 18 machines have correct tags
2. ✅ **ACL Applied** - WISE² ACL rules enforced
3. ✅ **Network Organized** - Tagged groups active
4. **Test Access** - Verify field-tech ↔ edge, dev ↔ all, etc.
5. **Document** - Update WISE² runbooks
6. **Monitor** - Check Tailscale logs for policy violations

---

**Last Updated**: 2026-09-20  
**Owner**: dwise (dwise03@gmail.com)  
**Status**: Ready for Production Deployment

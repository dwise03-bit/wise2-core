# WISE² Tailscale Network Organization & ACL Strategy

**Date**: 2026-09-20  
**Status**: Configuration Plan  
**Goal**: Organize 18+ WISE² devices into logical tagged groups with proper access control

---

## Current Network State

| Category | Count | Status |
|----------|-------|--------|
| Infrastructure (VPS, Cloud) | 5 | Active |
| Edge Nodes (Raspberry Pi) | 2 | Active (skorpios + others) |
| Desktops (Mac, Windows, Linux) | 7 | Active |
| Mobile (iOS, Android) | 2 | Active |
| IoT/Devices (Chromebook, etc) | 2 | Active |
| **TOTAL** | **18** | **All Connected** |

---

## WISE² Machine Groups & Tags

### 1. **Infrastructure Layer** (`tag:infrastructure`)
Machines: VPS, cloud-agent, database-servers

- **IP Pool**: 100.85.x.x/16 (Tailscale IPs)
- **Machines**:
  - `gpu-nmls` (Linux, GPU server)
  - `gpu-nmls-1` (Linux, GPU server backup)
  - `vps-0fa5d30a` (VPS primary)
  - `cursor-cloud-iphone-deploy` (Cloud agent)
  - `wise2-cloud-agent` (Cloud agent secondary)

- **Services**: Port 22 (SSH), 443 (HTTPS), 5433 (PostgreSQL), 6380 (Redis)
- **Access**: Only `tag:developers` + `tag:operators`
- **Firewall**: All inbound restricted

### 2. **Edge Nodes** (`tag:edge`)
Machines: Raspberry Pi, embedded devices

- **Machines**:
  - `wise2-skorpious` (Pocket Node - HVAC diagnostics) ← Primary
  - `skorpius` (Secondary Pi)

- **Services**: Port 22, 1883 (MQTT), 3000 (Dashboard), 4000 (AI Assistant), 8080 (API)
- **Access**: `tag:field-tech` + `tag:operators`
- **Note**: Local-first, offline-capable architecture

### 3. **Developer Workstations** (`tag:developers`)
Machines: Laptops & desktops where code is written

- **Machines**:
  - `daniels-macbook-pro` (Primary dev, macOS)
  - `dwise-mac` (Secondary, macOS)
  - `gl-mt3600be` (Linux dev workstation)

- **Access**: Full network (infrastructure + edge)
- **Firewall**: Unrestricted outbound

### 4. **Field Technology** (`tag:field-tech`)
Machines: In-field devices (iOS, Android, Chromebook)

- **Machines**:
  - `ipad-9th-gen-wifi` (iOS)
  - `iphone-15-pro-max` (iOS)
  - `iphone175` (iOS)
  - `iphone182` (iOS)
  - `google-pixel-slate` (Chromebook/Android)
  - `motorola-razr-2025-xt2553v` (Android)

- **Access**: Edge nodes only (port 3000, 4000, 8080)
- **Restriction**: No infrastructure access
- **Services**: Dashboard UI, AI Assistant, API endpoints

### 5. **Shared Devices** (`tag:shared`)
Machines: Windows machines, shared lab devices

- **Machines**:
  - `darrinwisejr` (Windows, shared/lab)

- **Access**: Limited (edge + specific infrastructure)

### 6. **Operators & Admin** (`tag:operators`)
Machines: Monitoring, admin dashboards (subset of devs)

- **Designated**: dwise03@gmail.com account
- **Access**: Full network monitoring
- **Services**: SSH, remote management

---

## Tailscale ACL Rules (JSON Format)

```json
{
  "tagOwners": {
    "tag:infrastructure": ["dwise03@gmail.com"],
    "tag:edge": ["dwise03@gmail.com"],
    "tag:developers": ["dwise03@gmail.com"],
    "tag:field-tech": ["dwise03@gmail.com"],
    "tag:shared": ["dwise03@gmail.com"],
    "tag:operators": ["dwise03@gmail.com"]
  },
  
  "acls": [
    {
      "action": "accept",
      "src": ["tag:developers"],
      "dst": ["tag:infrastructure", "tag:edge", "tag:shared", "*:*"]
    },
    {
      "action": "accept",
      "src": ["tag:operators"],
      "dst": ["tag:infrastructure", "tag:edge", "tag:shared", "*:*"]
    },
    {
      "action": "accept",
      "src": ["tag:field-tech"],
      "dst": ["tag:edge:3000,3001,3002,3003,3004,3005,4000,8080"]
    },
    {
      "action": "accept",
      "src": ["tag:edge"],
      "dst": ["tag:infrastructure:443,5433,6380"]
    },
    {
      "action": "accept",
      "src": ["tag:shared"],
      "dst": ["tag:edge:3000,4000,8080"]
    },
    {
      "action": "deny",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ],
  
  "autoApprovers": {
    "exitNode": ["dwise03@gmail.com"],
    "routes": ["dwise03@gmail.com"]
  }
}
```

---

## Machine Tagging Strategy

### How to Tag a Machine in Tailscale Console

1. Go to **Machines** page
2. Click on the machine name
3. Scroll to **Tags** section
4. Add tags from the list:
   - `tag:infrastructure`
   - `tag:edge`
   - `tag:developers`
   - `tag:field-tech`
   - `tag:shared`
   - `tag:operators`

### Recommended Tagging (Current Machines)

**Infrastructure**:
```
gpu-nmls: tag:infrastructure
gpu-nmls-1: tag:infrastructure
vps-0fa5d30a: tag:infrastructure
cursor-cloud-iphone-deploy: tag:infrastructure
wise2-cloud-agent: tag:infrastructure
```

**Edge**:
```
wise2-skorpious: tag:edge
skorpius: tag:edge
```

**Developers**:
```
daniels-macbook-pro: tag:developers, tag:operators
dwise-mac: tag:developers, tag:operators
gl-mt3600be: tag:developers
```

**Field Tech**:
```
ipad-9th-gen-wifi: tag:field-tech
iphone-15-pro-max: tag:field-tech
iphone175: tag:field-tech
iphone182: tag:field-tech
google-pixel-slate: tag:field-tech
motorola-razr-2025-xt2553v: tag:field-tech
```

**Shared**:
```
darrinwisejr: tag:shared
```

---

## Network Access Matrix

| From \ To | Infrastructure | Edge | Developers | Field Tech | Shared |
|-----------|---|---|---|---|---|
| **Infrastructure** | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Edge** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Developers** | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Field Tech** | ✗ | ✓ | ✗ | ✓ | ✗ |
| **Shared** | ✗ | ✓ | ✗ | ✗ | ✓ |

---

## Remote Access Examples

### From Anywhere via Tailscale

**SSH to Pocket Node**:
```bash
ssh -i ~/.ssh/skorpias-deploy d@100.85.242.34
```

**HVAC AI Assistant API**:
```bash
curl -X POST http://100.85.242.34:4000/ask \
  -H 'Content-Type: application/json' \
  -d '{"question": "What is normal superheat for R-410A?"}'
```

**Dashboard UI**:
```
http://100.85.242.34:3000
```

**Infrastructure Services** (developers only):
```bash
ssh gpu@gpu-nmls.tail44396d.ts.net
psql -h vps-0fa5d30a.tail44396d.ts.net -d wise2
```

---

## DNS & Hostnames

All machines automatically get `.tail44396d.ts.net` domain:

- `wise2-skorpious.tail44396d.ts.net` → 100.85.242.34
- `gpu-nmls.tail44396d.ts.net` → 100.x.x.x
- `daniels-macbook-pro.tail44396d.ts.net` → 100.x.x.x

Use these hostnames in place of IP addresses for stability.

---

## Implementation Checklist

- [ ] Review and approve ACL rules above
- [ ] Apply tags to all 18 machines in Tailscale console
- [ ] Upload ACL JSON to Tailscale (via JSON editor)
- [ ] Test access from each group (dev→edge, field-tech→edge, etc)
- [ ] Verify field tech devices CAN access dashboard but NOT infrastructure
- [ ] Verify edge nodes CAN access infrastructure (for sync)
- [ ] Document in WISE² runbook

---

## Security Notes

1. **No wide-open rules**: Field tech devices are restricted to edge nodes only
2. **Infrastructure isolation**: Only developers and operators can access GPU/VPS
3. **Encryption**: All traffic is WireGuard-encrypted end-to-end
4. **Audit**: Tailscale logs all connections (viewable in Logs tab)
5. **Revocation**: Remove tags instantly if device is lost/stolen

---

## Next Steps

1. Tag all machines (5 min)
2. Apply ACL rules (2 min)
3. Test each group's access (15 min)
4. Update WISE² runbook with Tailscale setup
5. Document in team handbook

---

**Last Updated**: 2026-09-20  
**Owner**: dwise (dwise03@gmail.com)  
**Status**: Ready for implementation

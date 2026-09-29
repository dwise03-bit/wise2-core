# Tailscale Device Rename Deployment Checklist

**Status**: Script pushed to GitHub ✅ | Mac renamed to `dwise-mac` ✅

## Automated Deployment (2026-09-15)

- [x] Commit rename script to repo
- [x] Push to GitHub (main branch)
- [x] Rename local Mac → `dwise-mac`

## Manual Device Renaming

Run on each device when online. SSH via Tailscale DNS:

```bash
# Option 1: Download and run from GitHub
curl -s https://raw.githubusercontent.com/dwise03-bit/wise2-core/main/scripts/rename-tailscale-devices.sh | bash -s dwise-DEVICENAME

# Option 2: Direct tailscale command
sudo tailscale set --hostname=dwise-DEVICENAME
```

### Rename Queue (by device status)

#### 🟢 Online (rename immediately)
- [ ] `dwise-mac` → **✅ DONE**

#### 🔴 Offline (rename when online)
- [ ] `big-byte` (last seen 6d ago) → `dwise-pi`
- [ ] `cursor-cloud-iphone-deploy` → `dwise-gpu-build`
- [ ] `daniels-macbook-pro` → `dwise-mbp`
- [ ] `gl-mt3600be` → `dwise-router`
- [ ] `gpu-nmls-1` → `dwise-gpu-1`
- [ ] `gpu-nmls` → `dwise-gpu-2`
- [ ] `ipad-9th-gen-wifi` → `dwise-ipad`
- [ ] `iphone-15-pro-max` → `dwise-iphone-pro`
- [ ] `iphone175` → `dwise-iphone-2`
- [ ] `iphone182` → `dwise-iphone-3`
- [ ] `motorola-razr-2025-xt2553v` → `dwise-android`
- [ ] `vps-0fa5d30a` (requires sudo on 173.208.147.165) → `dwise-vps`
- [ ] `wise2-cloud-agent` → `dwise-cloud`
- [ ] `skorpius` → `dwise-pi-2`

#### 👤 Other User
- N/A `darrinwisejr.tail1dc3bd.ts.net` (darrinwisejr owns this)

## Device Access Methods

### VPS (173.208.147.165)
```bash
ssh dwise@173.208.147.165
sudo tailscale set --hostname=dwise-vps
```

### Raspberry Pi
```bash
# Via Tailscale
ssh dwise@skorpius.tail1dc3bd.ts.net
tailscale set --hostname=dwise-pi

# Or directly
ssh dwise@192.168.x.x
tailscale set --hostname=dwise-pi
```

### Cloud/GPU Machines
```bash
ssh dwise@gpu-nmls-1.tail1dc3bd.ts.net
sudo tailscale set --hostname=dwise-gpu-1
```

### Mobile Devices (iOS/Android)
1. Open Tailscale app
2. Settings → Device Name → Edit
3. Change to `dwise-iphone-pro` etc.
4. Save

## Verification

After each rename, verify:
```bash
tailscale status | grep "dwise-DEVICENAME"
```

Should show: `100.x.x.x  dwise-DEVICENAME  dwise03@  [platform]  -`

## Notes

- VPS rename requires `sudo` (password needed)
- Mobile devices need manual rename via app settings
- Offline devices will rename once they come online and pull latest config
- DNS names available immediately: `dwise-pi.tail1dc3bd.ts.net`, etc.

# Surface SSH Setup for WISE² VPS Access

**Goal**: Enable your Microsoft Surface device to SSH into the WISE² VPS (100.68.145.5) using Ed25519 keys.

---

## Prerequisites

- **OpenSSH Client** (built-in on Windows 10/11)
- **PowerShell 5.0+** (built-in or `winget install Microsoft.OpenSSH.Beta`)
- **Network access** to WISE² infrastructure (direct or Tailscale)

---

## Step 1: Generate SSH Keys on Surface

Run the setup script as your current user (not admin):

```powershell
cd $env:USERPROFILE\Projects\wise2-core\infra\windows-ssh
.\setup-surface-ssh.ps1
```

**What it does**:
- Creates `~/.ssh/` directory with correct permissions
- Generates Ed25519 key pair: `id_surface_ed25519` + `id_surface_ed25519.pub`
- Copies SSH config template to `~/.ssh/config`
- Displays your public key for authorized_keys

**Output**: Your public key (ed25519) and paths to key files.

---

## Step 2: Add Public Key to VPS

Copy your public key (from script output) and add it to the VPS:

### Option A: Remote add (if you have current SSH access)

```bash
# From your Mac/existing SSH access:
cat ~/.ssh/id_surface_ed25519.pub | ssh gpu-nmls 'cat >> ~/.ssh/authorized_keys'
```

### Option B: Manual add (no current SSH)

1. Copy the public key output from the script
2. SSH into the VPS using an existing key
3. Run:

```bash
echo "PASTE_YOUR_SURFACE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Option C: Via Tailscale (if already connected)

```bash
ssh wise2-vps 'cat >> ~/.ssh/authorized_keys' < ~/.ssh/id_surface_ed25519.pub
```

---

## Step 3: Test Connection

From your Surface PowerShell:

```powershell
# Test direct IP access
ssh wise2-vps

# Should see:
# Welcome to WISE² VPS (gpu-nmls)
# Type 'exit' to disconnect
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ssh: command not found` | Install OpenSSH: `winget install Microsoft.OpenSSH.Beta` |
| `Permission denied (publickey)` | Verify public key was added to VPS `~/.ssh/authorized_keys` |
| `Could not resolve hostname` | Check DNS or use direct IP: `ssh 100.68.145.5` |
| `Connection refused` | Verify VPS is online: `ping 100.68.145.5` |
| `Too many authentication failures` | Ensure SSH config has correct `IdentityFile` path |

---

## SSH Config Reference

Your `~/.ssh/config` contains:

```ssh
Host wise2-vps
    HostName gpu-nmls-1.tail44396d.ts.net
    User dwise
    IdentityFile ~/.ssh/id_surface_ed25519
    IdentitiesOnly yes
```

### SSH Aliases

After setup, you can use these shortcuts:

```powershell
ssh gpu-nmls          # Direct VPS IP (100.68.145.5)
ssh wise2-vps         # Tailscale VPS (when on network)
ssh wise2-vps ps aux  # Run commands directly
```

---

## Managing Keys

### List your keys

```powershell
ls ~/.ssh/id_*.pub
```

### Rotate key (security)

```powershell
# Backup old key
ren ~/.ssh/id_surface_ed25519 ~/.ssh/id_surface_ed25519.old

# Generate new key
.\setup-surface-ssh.ps1

# Add new public key to VPS
# Remove old key from ~/.ssh/authorized_keys
```

---

## Integration with WISE²

Your Surface device is now registered in:

```json
// config/devices.json
{
  "id": "surface-dev",
  "type": "workstation",
  "platform": "windows",
  "ssh_key": "~/.ssh/id_surface_ed25519"
}
```

**This enables**:
- Multi-device SSH coordination
- Automated deployment from Surface
- Remote command execution for WISE² services
- Centralized key management

---

## Security Notes

- ✅ Private key (`id_surface_ed25519`) is local only — never commit to git
- ✅ Ed25519 is FIPS 140-2 compliant and future-proof
- ✅ SSH config uses `StrictHostKeyChecking accept-new` (safe default)
- ✅ VPS firewall allows SSH on port 22 only (no open ports)

---

## Support

For issues or questions, check:
- `infra/windows-ssh/` (this directory)
- `config/devices.json` (device registry)
- `.ssh/config` (your SSH configuration)


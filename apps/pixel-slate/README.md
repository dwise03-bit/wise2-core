# Pixel Slate WISE² Setup

**Target**: https://wise2.net/pixel-slate  
**Purpose**: Full WISE² Command Center for ChromeOS/Linux/Mac with Tailscale integration

## Components

1. **ChromeOS/Linux Setup** - Automated environment initialization
2. **Tailscale Connection** - Secure network access
3. **WISE² Command Center** - Dashboard and control interface
4. **Hermes/Web UI** - AI chat and assistant interface
5. **Local/VPS Access** - Bi-directional sync
6. **GitHub/Dev Tools** - Source control and development
7. **Discord Alerts** - Real-time notifications
8. **Bootstrap Installer** - Copy/paste one-liner installation

## Architecture

```
┌─────────────────────────────────────────┐
│  Pixel Slate Bootstrap Installer        │
│  (Copy/Paste One-Liner)                 │
└──────────────┬──────────────────────────┘
               │
      ┌────────┴─────────┐
      ▼                  ▼
┌──────────────┐  ┌──────────────┐
│  Tailscale   │  │  GitHub SSH  │
│  Connection  │  │  Credentials │
└──────┬───────┘  └──────┬───────┘
       │                  │
       └──────────┬───────┘
                  ▼
         ┌──────────────────┐
         │ WISE² Command    │
         │ Center           │
         │ (Dashboard)      │
         └──────────┬───────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
    ┌─────────────┐      ┌──────────────┐
    │ Local Sync  │      │ VPS/Discord  │
    │ (Mac)       │      │ Integration  │
    └─────────────┘      └──────────────┘
```

## Deployment Path

`/apps/pixel-slate/` → `https://wise2.net/pixel-slate` (via nginx path-based routing)

## Bootstrap Installer

One-liner setup for users:

```bash
curl https://wise2.net/pixel-slate/install.sh | bash
```

This will:
1. Detect OS (ChromeOS, Linux, Mac)
2. Install dependencies
3. Configure Tailscale
4. Clone wise2-core
5. Start Command Center
6. Connect Discord alerts
7. Configure GitHub access

## Status

- [ ] Create installer script
- [ ] Create web UI component
- [ ] Integrate Hermes AI
- [ ] Set up Tailscale auto-discovery
- [ ] Configure Discord webhooks
- [ ] Build GitHub token manager
- [ ] Test on ChromeOS
- [ ] Test on Linux
- [ ] Test on Mac
- [ ] Deploy to production


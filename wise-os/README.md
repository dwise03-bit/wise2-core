# WISE² Defense IMP Edge Node

Lightweight Raspberry Pi 3 edge-intelligence appliance with a kiosk dashboard, real host telemetry, receive-only SDR detection, optional Meshtastic/GPS adapters, offline IMP responses, SQLite storage, and explicit integration states.

## Local verification

```bash
npm ci
npm test
npm start
curl http://127.0.0.1:3000/api/status
```

Open `http://127.0.0.1:3000`. Live providers remain `NOT CONFIGURED` until credentials are supplied. To show clearly labeled synthetic incidents, start with `WISE2_DEMO_MODE=true npm start`.

## Raspberry Pi deployment

Copy this directory to a Raspberry Pi OS ARM64 device, then run:

```bash
sudo bash install-wise2-defense.sh
```

Configure `/etc/wise2-defense/wise2-defense.env`; never commit secrets. The installer is idempotent, initializes `/opt/wise2-defense/data/wise2-defense.db`, installs systemd units, and configures kiosk autostart when Chromium is present. It does not force a reboot.

Run `/opt/wise2-defense/scripts/health.sh` for exact hardware and integration state. Missing SDR, GPS, Meshtastic, CrimeRadar, or cloud credentials do not fail the core appliance.

This system is an awareness tool. It contains no transmit controls, targeting, interception, authentication bypass, or arbitrary web shell.

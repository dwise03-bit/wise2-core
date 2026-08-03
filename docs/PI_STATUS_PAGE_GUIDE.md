# Raspberry Pi Status Dashboard - Implementation Guide

## Overview

The Pi Status page provides real-time monitoring of Raspberry Pi health, services, and system metrics. It displays CPU/memory/disk usage, service status, logs, backups, updates, alerts, and deployment history.

## Files Created

### Frontend
- **`apps/website/app/dashboard/pi-status/page.tsx`** - Main status dashboard page
  - Dark theme matching WISE² design system
  - Real-time metrics display with gauges and progress bars
  - Tabbed interface for logs, alerts, and deployments
  - Auto-refresh every 30 seconds
  - Responsive grid layout

### Backend
- **`apps/website/app/api/admin/pi-status/route.ts`** - API endpoint
  - `GET /api/admin/pi-status` - Fetch Pi status data
  - `POST /api/admin/pi-status/actions` - Trigger actions (backup, restart, update)
  - Currently returns mock data for development/testing
  - Includes TypeScript interfaces for type safety

## Features Implemented

### 1. System Metrics Display
- **CPU Usage** - Circular gauge visualization (0-100%)
- **Memory Usage** - Circular gauge visualization (0-100%)
- **Disk Space** - Progress bar visualization (0-100%)
- **Network I/O** - Bytes/second for both incoming and outgoing traffic
- **System Uptime** - Formatted as days:hours:minutes

Color coding:
- Green (emerald): < 50% usage
- Yellow: 50-75% usage
- Red: > 75% usage

### 2. Service Status Monitoring
Displays 4 core services:
- API Service (port 3001)
- Website (port 3000)
- Database (port 5432)
- Redis Cache (port 6379)

For each service:
- Current status (running/stopped/error)
- Uptime duration
- Port number
- Restart count

### 3. Logs & Events Tabs

**Logs Tab:**
- Display last 20 log entries
- Filter by level: All, Error, Info, Warn
- Shows: timestamp, level badge, service, message
- Scrollable (max-height: 396px)

**Alerts Tab:**
- Display last 10 alerts
- Color-coded by severity (critical/warning/info)
- Shows resolved status
- Service association
- Timestamp

**Deployments Tab:**
- Display last 10 deployments
- Version tracking
- Status indicators (success/failed/in-progress)
- Duration and changed files count

### 4. Backups Section
- Last backup timestamp and size
- Success/failed status
- Next scheduled backup time
- "Backup Now" button for manual backups

### 5. Updates Section
- List available package updates
- Shows current vs. available versions
- Distinguishes between Docker and system updates
- Highlights critical updates
- "Update All" button for bulk updates

### 6. Alerts & Status
- Overall system health status (Healthy/Warning/Critical)
- Unresolved alert count by severity
- Recent alert timeline
- Auto-resolves when conditions improve

### 7. System Information
- Pi model (e.g., Raspberry Pi 4 Model B)
- OS version and architecture
- Hostname
- Last status update timestamp

### 8. Auto-Refresh
- Updates every 30 seconds
- Uses `setInterval` with cleanup on unmount
- Maintains scroll position in tabs

## Integration with Real Pi Data

To connect with actual Raspberry Pi system data, implement the following in `apps/website/app/api/admin/pi-status/route.ts`:

### CPU & Memory Usage
```bash
# Option 1: SSH to Pi and execute commands
ssh pi@hostname "cat /proc/cpuinfo" # CPU info
ssh pi@hostname "free -b | grep Mem" # Memory

# Option 2: Use monitoring agent on Pi
# Install collectd, telegraf, or prometheus exporter
```

### Disk Usage
```bash
ssh pi@hostname "df -B1 | grep /$"
```

### Network I/O
```bash
ssh pi@hostname "cat /proc/net/dev | grep eth0"
```

### Service Status
```bash
ssh pi@hostname "systemctl status {service-name}"
ssh pi@hostname "systemctl show {service-name} -p UpstreamStartTime"
```

### System Logs
```bash
ssh pi@hostname "journalctl -n 100 --output=json"
ssh pi@hostname "docker logs {container-name}"
```

### Backups
```bash
# List backups by checking /backups directory
ssh pi@hostname "ls -lh /backups | tail -20"
```

### System Updates
```bash
# System packages
ssh pi@hostname "apt list --upgradable"

# Docker images
docker images --format "{{.Repository}}:{{.Tag}}" | while read img; do
  docker pull $img:latest 2>/dev/null | grep -i "newer"
done
```

## Implementation Steps

### 1. Set Up Authentication
In `route.ts`, implement proper authentication:
```typescript
const token = request.headers.get('authorization');
const userId = verifyToken(token); // Implement with your auth system
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

### 2. Create Data Collection Service
Create `packages/api/src/services/pi-status.service.ts`:
```typescript
export class PiStatusService {
  async getSystemMetrics() { /* collect actual data */ }
  async getServiceStatus() { /* check systemctl status */ }
  async getLogs() { /* fetch from journalctl */ }
  // ... etc
}
```

### 3. Connect to Backend API
If using NestJS backend at `3001`, create an endpoint:
```typescript
// packages/api/src/v1/admin/pi-status.controller.ts
@Controller('admin/pi-status')
@UseGuards(AdminGuard)
export class PiStatusController {
  @Get()
  async getStatus() { return this.piStatusService.getStatus(); }
}
```

### 4. Update Frontend API Call
Modify `route.ts` to call backend:
```typescript
const response = await fetch(`${API_BASE_URL}/v1/admin/pi-status`);
```

## Mock Data Structure

For testing/development, the endpoint returns:
```json
{
  "model": "Raspberry Pi 4 Model B",
  "osVersion": "Raspberry Pi OS (64-bit) v12.4",
  "architecture": "ARMv8 64-bit",
  "hostname": "wise2-pi",
  "timestamp": "2026-07-23T...",
  "metrics": {
    "cpu": 34,
    "memory": 58,
    "disk": 72,
    "networkBytesIn": 524288,
    "networkBytesOut": 262144,
    "uptime": 3924345
  },
  "services": [ ... ],
  "logs": [ ... ],
  "alerts": [ ... ],
  "deployments": [ ... ]
}
```

## Usage

### Access the Page
```
http://localhost:3000/dashboard/pi-status
```

### Available Actions
- **View Metrics**: Real-time CPU/memory/disk gauges
- **Monitor Services**: Check if API, website, database, Redis are running
- **Filter Logs**: View errors, info, or warnings
- **Manual Backup**: Trigger backup from dashboard
- **Update System**: Apply available updates

## Styling & Theme

The page follows WISE² design standards:
- Background: `bg-[#050505]` (dark)
- Cards: `bg-[#0a0a0a]` with `border-[#1a1a1a]`
- Accent color: Emerald (`emerald-500`, `emerald-400`)
- Status colors: Emerald (success), Red (error), Yellow (warning)
- Text: `text-white` with gray accents for labels

## Performance Considerations

1. **Auto-Refresh**: 30-second interval balances responsiveness with server load
2. **Log Pagination**: Limits to 20 entries to prevent DOM bloat
3. **Tab Navigation**: Only loads active tab data
4. **Responsive Design**: Adapts from mobile to 4K displays

## Future Enhancements

1. Real-time WebSocket updates (currently polling)
2. Historical metrics graphs (CPU/memory trends over 24h)
3. Alert configuration UI (set custom thresholds)
4. Service restart buttons with confirmation
5. Log filtering by date range and service
6. Deployment rollback capability
7. Resource usage predictions (ML-based)
8. Slack/Discord notifications for critical alerts
9. Multi-Pi dashboard (monitor multiple Pis)
10. Export metrics as CSV/PDF reports

## Troubleshooting

### No Data Displayed
- Check `/api/admin/pi-status` endpoint is accessible
- Verify network connectivity to Pi
- Check browser console for fetch errors

### Stale Data
- Refresh page manually (data updates every 30s)
- Check backend is running
- Verify `/api/admin/pi-status` is returning data

### Slow Performance
- Reduce log entries limit
- Increase refresh interval
- Cache metrics on backend side

## Security Notes

- Add role-based access control (admin only)
- Implement API rate limiting
- Use HTTPS in production
- Validate all action parameters
- Log all admin actions for audit trail
- Consider 2FA for sensitive actions (updates, backups)

## References

- WISE² Design System: `docs/WISE2_DESIGN_SYSTEM_MASTER_VISUAL.png`
- API Documentation: `packages/api/src/`
- Dashboard Components: `apps/website/app/dashboard/`

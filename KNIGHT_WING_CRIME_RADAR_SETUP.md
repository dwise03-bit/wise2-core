# Knight Wing Crime Radar - Google Maps Integration Setup

**Version**: 1.0.0  
**Date**: 2024-08-24  
**Status**: Ready for Deployment  
**Domain**: wisedefensellc.com  

---

## Overview

Knight Wing Crime Radar integrates Google Maps with WISE Defense Edge API to provide real-time incident mapping and RTL-SDR signal visualization for Greensboro, NC.

**Key Features**:
- Live crime/incident mapping with color-coded threat levels
- RTL-SDR spectrum overlay with frequency classification
- 6 configurable watch zones with radius monitoring
- Real-time updates (5-10 second intervals)
- Historical data filtering (1h, 6h, 24h, all-time)
- Heat map visualization for signal density
- Traffic layer integration
- GeoJSON export for incident analysis
- Dark theme matching WISE² aesthetic

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (Next.js)                         │
├─────────────────────────────────────────────────────────────┤
│  CrimeRadarMap Component (React)                            │
│  ├─ Google Maps API (@react-google-maps/api)              │
│  ├─ Signal Mapper (RTL-SDR → Geographic)                  │
│  ├─ Incident Markers (Color-coded by threat)              │
│  ├─ Watch Zone Circles (6 zones, radius monitoring)       │
│  ├─ Heat Map Layer (Signal strength visualization)        │
│  └─ Real-time Updates (Polling @ 5-10s intervals)         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                ┌──────▼──────────┐
                │  Google Maps    │
                │  Cloud Services │
                │  (Static Styles)│
                └──────────────────┘
                
┌──────────────────────────────────────────────────────────────┐
│              WISE Defense Edge API (Python/FastAPI)          │
├──────────────────────────────────────────────────────────────┤
│  Port: 3014                                                  │
│  Endpoints:                                                  │
│  ├─ /api/sdr/frequencies         → RTL-SDR signals         │
│  ├─ /api/sdr/spectrum            → Frequency spectrum      │
│  ├─ /api/incidents               → Crime incidents         │
│  ├─ /api/watch-zones             → Zone definitions        │
│  ├─ /api/mesh/nodes              → Meshtastic nodes        │
│  └─ /api/system/health           → System status          │
└──────────────────────────────────────────────────────────────┘
                       ▲
                       │
            ┌──────────┴──────────┐
            │  RTL-SDR Receiver   │
            │  (Big Byte Pi)      │
            │  88-1200 MHz        │
            └─────────────────────┘
```

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd apps/website
pnpm install @react-google-maps/api
pnpm install
```

### Step 2: Configure Google Maps API

#### 2.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project: `wise-defense-crime-radar`
3. Enable APIs:
   - Maps JavaScript API
   - Maps SDK for JavaScript
   - Geocoding API (optional)

#### 2.2 Create API Key
1. Navigate to **Credentials**
2. Click **Create Credentials** → **API Key**
3. Restrict key to:
   - **Application restrictions**: HTTP referrers
   - **Allowed referrers**: `https://wisedefensellc.com/*`
   - **API restrictions**: Google Maps APIs
4. Copy the API key

#### 2.3 Update Environment Variables

**Local Development** (`.env.local`):
```bash
NEXT_PUBLIC_GOOGLE_MAPS_KEY=YOUR_GOOGLE_MAPS_API_KEY_HERE
NEXT_PUBLIC_WISE_DEFENSE_API=http://localhost:3014
NEXT_PUBLIC_WISE_DEFENSE_API_KEY=demo-key
```

**Production** (`.env.prod`):
```bash
NEXT_PUBLIC_GOOGLE_MAPS_KEY=YOUR_PRODUCTION_API_KEY_HERE
NEXT_PUBLIC_WISE_DEFENSE_API=https://defense.wisedefensellc.com/api
NEXT_PUBLIC_WISE_DEFENSE_API_KEY=YOUR_PRODUCTION_API_KEY_HERE
```

### Step 3: Verify WISE Defense API

Ensure WISE Defense Edge is running on port 3014:

```bash
# Test API connectivity
curl -H "X-API-Key: demo-key" http://localhost:3014/health

# Expected response:
# {"status": "OPERATIONAL", "device_id": "EDGE-001", "version": "1.0.0"}
```

### Step 4: Test Local Development

```bash
cd apps/website
pnpm dev

# Navigate to: http://localhost:3001/dashboard/greensboro
```

---

## Component Structure

### Files Created

```
apps/website/
├── src/
│   ├── lib/
│   │   ├── google-maps-config.ts        # Configuration & constants
│   │   └── signal-mapper.ts             # RTL-SDR → Geographic mapping
│   └── components/
│       └── maps/
│           └── CrimeRadarMap.tsx        # Main map component
└── app/
    └── dashboard/
        └── greensboro/
            └── page.tsx                 # Full-page radar view
```

### Configuration Files

**`google-maps-config.ts`**:
- API key management
- Greensboro center coordinates (36.0726°N, -79.7920°W)
- Watch zone definitions (6 zones)
- Signal classifications (Police, Fire/EMS, etc.)
- Color schemes for dark mode
- Update intervals (5-10s)

**`signal-mapper.ts`**:
- Frequency classification logic
- Signal strength to visual mapping
- Incident marker conversion
- Zone determination algorithm
- Trail generation (5-minute history)
- Clustering for performance
- GeoJSON export

**`CrimeRadarMap.tsx`**:
- Google Maps component wrapper
- Real-time data fetching
- Marker rendering (signals, incidents, zones)
- Heat map visualization
- Filter controls (frequency, time, threat)
- Sidebar with zone list
- Export functionality

**`greensboro/page.tsx`**:
- Dashboard page layout
- Map container
- Header with stats
- Info panel overlay
- Footer with links

---

## API Integration

### Endpoint: `/api/sdr/frequencies`

**Request**:
```bash
GET http://localhost:3014/api/sdr/frequencies?threshold_db=-50
Headers: X-API-Key: demo-key
```

**Response**:
```json
{
  "frequencies": [
    {
      "frequency": 461.1625,
      "power_db": -45.5,
      "mode": "FM",
      "timestamp": "2024-08-24T18:30:00Z"
    }
  ],
  "classified": {
    "police": [{...}],
    "fire_ems": [{...}],
    "public_safety": [{...}]
  },
  "count": 42,
  "timestamp": "2024-08-24T18:30:00Z"
}
```

### Endpoint: `/api/incidents`

**Request**:
```bash
GET http://localhost:3014/api/incidents?limit=200
Headers: X-API-Key: demo-key
```

**Response**:
```json
{
  "incidents": [
    {
      "id": "provider:incident123",
      "headline": "Motor Vehicle Accident",
      "category": "accident",
      "incident_type": "accident",
      "latitude": 36.0726,
      "longitude": -79.7920,
      "threat_level": "LOW",
      "received_timestamp": "2024-08-24T18:25:00Z"
    }
  ]
}
```

### Endpoint: `/api/watch-zones`

**Request**:
```bash
GET http://localhost:3014/api/watch-zones
Headers: X-API-Key: demo-key
```

**Response**:
```json
{
  "zones": [
    {
      "id": "zone-1",
      "name": "Downtown Greensboro",
      "latitude": 36.0726,
      "longitude": -79.7920,
      "radius_miles": 1.2,
      "minimum_threat": "ELEVATED"
    }
  ]
}
```

---

## Watch Zones Configuration

### Zone 1: Downtown Greensboro
- **Center**: 36.0726°N, -79.7920°W
- **Radius**: 1.2 miles
- **Priority**: High (Red)
- **Description**: Downtown core, highest incident density
- **Monitoring**: 24/7

### Zone 2: Residential North
- **Center**: 36.1200°N, -79.7920°W
- **Radius**: 2.5 miles
- **Priority**: Medium (Orange)
- **Description**: Northern residential neighborhoods

### Zone 3: Residential South
- **Center**: 36.0250°N, -79.7920°W
- **Radius**: 2.5 miles
- **Priority**: Medium (Orange)
- **Description**: Southern residential neighborhoods

### Zone 4: I-40 Corridor
- **Center**: 36.0726°N, -79.6500°W
- **Radius**: 1.5 miles
- **Priority**: Low (Yellow)
- **Description**: Interstate 40 and major routes

### Zone 5: UNCG Campus
- **Center**: 36.0693°N, -79.8193°W
- **Radius**: 1.2 miles
- **Priority**: Elevated (Blue)
- **Description**: University of North Carolina at Greensboro

### Zone 6: Commercial District
- **Center**: 36.0900°N, -79.7500°W
- **Radius**: 2.0 miles
- **Priority**: Standard (Green)
- **Description**: Commercial and retail areas

---

## Signal Classification

### Frequency Bands

| Type | Frequency | Color | Icon | Priority |
|------|-----------|-------|------|----------|
| Police Radio | 461.1625 MHz | Red | 🚔 | CRITICAL |
| Fire/EMS | 463.5 MHz | Orange | 🚒 | HIGH |
| Public Safety | 410-480 MHz | Yellow | ⚠️ | MEDIUM |
| Cellular | 824-1990 MHz | Cyan | 📱 | LOW |
| FM Radio | 88-108 MHz | Green | 📻 | LOW |
| Civilian/Other | Various | Blue | 📡 | LOW |

### Signal Strength Mapping

| Strength | Range | Opacity | Size | Label |
|----------|-------|---------|------|-------|
| Very Strong | > -30 dB | 1.0 | 12 | VStr |
| Strong | -30 to -50 dB | 0.8 | 10 | Str |
| Moderate | -50 to -70 dB | 0.6 | 8 | Mod |
| Weak | -70 to -90 dB | 0.4 | 6 | Wk |
| Very Weak | < -90 dB | 0.2 | 4 | VWk |

---

## Real-time Updates

### Update Intervals

```typescript
SPECTRUM:   10 seconds  (primary update loop)
INCIDENTS:  10 seconds  (secondary update loop)
SIGNALS:     5 seconds  (high-priority data)
ZOOM:       300ms       (animation)
```

### Data Flow

```
1. Fetch RTL-SDR signals (/api/sdr/frequencies)
   └─ Every 5-10 seconds
   └─ Max 500 signals in-memory

2. Classify by frequency band
   └─ Police/Fire/EMS → High priority
   └─ Public Safety → Medium priority
   └─ Cellular/FM → Low priority

3. Map to geographic coordinates
   └─ Use frequency + signal strength
   └─ Add ±0.01° random offset within zone
   └─ Build 5-minute trail history

4. Render on map
   └─ Cluster signals for performance
   └─ Color-code by threat
   └─ Update markers in real-time

5. Fetch incidents (/api/incidents)
   └─ Every 10 seconds
   └─ Apply threat filtering
   └─ Show info windows on click
```

---

## Features

### Map Controls

| Control | Purpose |
|---------|---------|
| **Zoom In/Out** | Google Maps zoom (levels 1-21) |
| **Pan** | Drag to move map |
| **Satellite Toggle** | Switch to satellite view |
| **Traffic Layer** | Show live Greensboro traffic |
| **Fullscreen** | Expand to fullscreen |

### Sidebar Controls

| Filter | Options |
|--------|---------|
| **Frequency Band** | All, Police, Fire/EMS, Public Safety, Cellular, FM Radio |
| **Time Range** | Last 1h, 6h, 24h, All-time |
| **Threat Level** | All, Elevated+, High+, Critical only |
| **Layers** | Signals, Incidents, Zones, Heat map |

### Data Export

**Format**: GeoJSON  
**Filename**: `crime-radar-{TIMESTAMP}.geojson`  
**Contents**:
- Signal points with frequency & power
- Incident points with headline & threat
- Feature properties for analysis

---

## Performance Optimization

### Clustering

Signals within 0.15° (~1.5km) are clustered into single markers to prevent:
- DOM bloat (too many markers)
- Rendering lag
- Map unresponsiveness

Cluster size increases with density:
```typescript
cluster.size = baseSize + clusterDensity
```

### Memory Management

- Max 500 signals stored in-memory
- Signals >5 minutes old are discarded
- Trails limited to 5-minute history
- Incidents kept for full time range but paginated

### Lazy Loading

- Google Maps API loads on page mount
- Heat map layer loads on user toggle
- Traffic layer loads on user toggle
- Info windows load on marker click

---

## Error Handling

### API Failures

```typescript
// Graceful degradation
if (fetch fails) {
  - Show last known data
  - Display "Offline" indicator
  - Retry after 10 seconds
  - Show error message in UI
}
```

### Missing Coordinates

```typescript
// Fallback to Greensboro center
if (!incident.latitude || !incident.longitude) {
  - Use GREENSBORO_CENTER (36.0726, -79.7920)
  - Add note: "Approximate location"
}
```

### API Key Expiration

```typescript
// 403 errors trigger reload
if (403 Forbidden) {
  - Show "API Key Error" message
  - Direct user to /dashboard/settings
  - Provide link to update credentials
}
```

---

## Security

### API Key Restrictions

**Domain Restriction**:
```
Allowed: *.wisedefensellc.com
Blocked: All other domains
```

**API Restriction**:
```
Allowed:
  - Maps JavaScript API
  - Maps SDK for JavaScript
  
Blocked:
  - Directions API
  - Places API
  - Roads API
```

### Data Privacy

- No signal locations logged to third parties
- API calls encrypted via HTTPS
- Local storage cleared on session end
- GeoJSON exported only on user request

---

## Deployment Steps

### Step 1: Build Docker Image

```bash
cd apps/website
docker build -t wise-defense-website:latest .
```

### Step 2: Update nginx Configuration

```nginx
# /etc/nginx/sites-available/wisedefensellc.com

server {
    listen 443 ssl;
    server_name wisedefensellc.com;
    
    ssl_certificate /etc/letsencrypt/live/wisedefensellc.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wisedefensellc.com/privkey.pem;
    
    location /dashboard/greensboro {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Step 3: Deploy Container

```bash
docker run -d \
  --name wise-defense-website \
  -p 3001:3001 \
  -e NEXT_PUBLIC_GOOGLE_MAPS_KEY=$GOOGLE_MAPS_KEY \
  -e NEXT_PUBLIC_WISE_DEFENSE_API=http://localhost:3014 \
  wise-defense-website:latest
```

### Step 4: Verify Deployment

```bash
# Test the dashboard page
curl https://wisedefensellc.com/dashboard/greensboro

# Expected: 200 OK with HTML page
```

---

## Troubleshooting

### Issue: "Google Maps API key not recognized"

**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
2. Verify key is from Google Cloud Console
3. Ensure domain restriction includes current domain
4. Clear browser cache & hard reload

### Issue: "No signals showing on map"

**Solution**:
1. Verify WISE Defense API is running: `curl http://localhost:3014/health`
2. Check API key in environment: `echo $NEXT_PUBLIC_WISE_DEFENSE_API_KEY`
3. Verify RTL-SDR is active and collecting data
4. Check browser console for error messages

### Issue: "Map not rendering"

**Solution**:
1. Ensure `@react-google-maps/api` is installed: `pnpm list @react-google-maps/api`
2. Check for JavaScript errors in browser console
3. Verify Google Maps API is enabled in Cloud Console
4. Try incognito mode to rule out cache issues

### Issue: "Signals not updating in real-time"

**Solution**:
1. Check network tab for API calls (should see every 5-10s)
2. Verify WISE Defense API returns new data
3. Check for CORS errors in browser console
4. Ensure `autoUpdate={true}` prop is set on CrimeRadarMap

### Issue: "Heat map doesn't show"

**Solution**:
1. Heat map requires >5 signals to display
2. Ensure "Heat map" layer is toggled ON
3. Check signal strength values (should be numeric)
4. Zoom to level 12-15 for best visibility

---

## Maintenance

### Weekly Tasks
- Monitor API uptime (WISE Defense Edge)
- Check RTL-SDR receiver health
- Verify Google Maps quota usage
- Review incident logs

### Monthly Tasks
- Update API documentation
- Audit API key usage
- Review security logs
- Test failover procedures

### Quarterly Tasks
- Update dependencies
- Review threat classification rules
- Audit zone configurations
- Performance optimization

---

## Support & Documentation

### Additional Resources
- [Google Maps API Documentation](https://developers.google.com/maps/documentation)
- [WISE Defense Edge API](../apps/wise-defense-edge/README.md)
- [RTL-SDR Receiver Setup](../apps/wise-defense-edge/PHASE1_BUILD_REPORT.md)
- [Greensboro, NC Map Center](https://maps.google.com/maps?q=36.0726,-79.7920)

### Contact
- **WISE Defense Support**: support@wisedefensellc.com
- **Technical Issues**: tech@wisedefensellc.com
- **API Issues**: api@wisedefensellc.com

---

## Changelog

### v1.0.0 (2024-08-24)
- Initial release
- Google Maps integration complete
- 6 watch zones configured
- RTL-SDR signal visualization
- Real-time updates (5-10s)
- GeoJSON export
- Dark mode styling
- Heat map support
- Traffic layer integration

---

**Ready to Deploy to wisedefensellc.com**

All components are production-ready. Follow setup instructions above to deploy.

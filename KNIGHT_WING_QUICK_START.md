# Knight Wing Crime Radar - Quick Start Guide

**What**: Google Maps integration for WISE Defense Edge real-time crime/incident mapping  
**Where**: https://wisedefensellc.com/dashboard/greensboro  
**Status**: ✅ Production Ready  

---

## 5-Minute Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project: "wise-defense-crime-radar"
3. Enable: **Maps JavaScript API**
4. Create **API Key** with these restrictions:
   - **Type**: HTTP referrers
   - **Website**: `https://wisedefensellc.com/*`
   - **APIs**: Google Maps APIs

### 2. Add to Environment

**Development** (`.env.local`):
```bash
NEXT_PUBLIC_GOOGLE_MAPS_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_WISE_DEFENSE_API=http://localhost:3014
NEXT_PUBLIC_WISE_DEFENSE_API_KEY=demo-key
```

**Production** (`.env.prod`):
```bash
NEXT_PUBLIC_GOOGLE_MAPS_KEY=YOUR_PRODUCTION_KEY_HERE
NEXT_PUBLIC_WISE_DEFENSE_API=https://defense.wisedefensellc.com/api
NEXT_PUBLIC_WISE_DEFENSE_API_KEY=YOUR_PRODUCTION_API_KEY
```

### 3. Install & Run

```bash
# Install dependencies
cd apps/website
pnpm install

# Start development server
pnpm dev

# Open browser to:
# http://localhost:3001/dashboard/greensboro
```

### 4. Verify WISE Defense API

```bash
# In another terminal:
curl -H "X-API-Key: demo-key" http://localhost:3014/health

# Expected response:
# {"status": "OPERATIONAL", "device_id": "EDGE-001", "version": "1.0.0"}
```

**✅ Done!** You should see a live crime radar with:
- Google Maps of Greensboro, NC
- 6 watch zones (colored circles)
- Real-time signal markers
- Incident markers
- Filter controls

---

## File Structure

```
apps/website/
├── src/
│   ├── lib/
│   │   ├── google-maps-config.ts        ← Configuration & constants
│   │   └── signal-mapper.ts             ← RTL-SDR → Geographic mapping
│   └── components/
│       └── maps/
│           └── CrimeRadarMap.tsx        ← Main map component
├── app/
│   └── dashboard/
│       └── greensboro/
│           └── page.tsx                 ← Dashboard page
└── package.json                          ← @react-google-maps/api added
```

---

## Configuration

### Colors & Zones

Edit `src/lib/google-maps-config.ts` to:
- Change watch zone locations/colors
- Adjust frequency classifications
- Modify signal strength thresholds
- Update map styling

### Real-Time Updates

```typescript
// Change update intervals (milliseconds):
UPDATE_INTERVALS = {
  SPECTRUM: 10000,   // Signal data
  INCIDENTS: 10000,  // Incident data
  SIGNALS: 5000,     // High-priority data
}
```

### Map Appearance

Dark theme is built-in. To change:
1. Edit `MAP_STYLES.DARK` in `google-maps-config.ts`
2. Or toggle satellite/traffic via UI buttons

---

## Key Features

| Feature | Purpose |
|---------|---------|
| **Real-Time Updates** | Signals update every 5-10 seconds |
| **6 Watch Zones** | Greensboro neighborhoods with threat levels |
| **Signal Classification** | Police, Fire, Public Safety, Cellular, FM Radio |
| **Frequency Filtering** | Filter by band (461 MHz, 463.5 MHz, etc.) |
| **Time Range Filtering** | 1h, 6h, 24h, all-time options |
| **Threat Level Filtering** | Low, Medium, High, Critical |
| **Heat Map** | Visual density of signals |
| **Traffic Layer** | Live Greensboro traffic overlay |
| **GeoJSON Export** | Download incident data for analysis |
| **Responsive Design** | Works on mobile, tablet, desktop |

---

## API Endpoints Used

| Endpoint | Purpose | Frequency |
|----------|---------|-----------|
| `/api/sdr/frequencies` | RTL-SDR signals | Every 5s |
| `/api/incidents` | Crime incidents | Every 10s |
| `/api/watch-zones` | Zone definitions | On load |
| `/api/mesh/nodes` | Meshtastic nodes | Optional |

### Example: Fetch Signals

```typescript
// Automatically called by CrimeRadarMap component
const response = await fetch(
  'http://localhost:3014/api/sdr/frequencies',
  {
    headers: { 'X-API-Key': 'demo-key' }
  }
);

const data = await response.json();
// data.frequencies contains signal array
// Each signal: { frequency, signal_strength, timestamp }
```

---

## How Signals Get on Map

```
1. RTL-SDR Receiver (Big Byte Pi)
   └─ Captures radio signals 88-1200 MHz

2. WISE Defense Edge API
   └─ Classifies by frequency
   └─ Stores in SQLite

3. Website Polls API
   └─ Every 5-10 seconds
   └─ Retrieves latest signals

4. Signal Mapper
   └─ Converts frequency to lat/lng
   └─ Adds geographic distribution
   └─ Colors by signal type

5. Google Maps
   └─ Renders as colored circles
   └─ Size = signal strength
   └─ Opacity = confidence

6. UI Updates
   └─ Filters applied
   └─ Clusters shown
   └─ Info window on click
```

---

## Troubleshooting

### "Google Maps not loading"
- Check API key in .env.local
- Verify key allows your domain
- Clear browser cache
- Try incognito window

### "No signals showing"
- Verify WISE Defense API running: `curl http://localhost:3014/health`
- Check RTL-SDR is active
- Look in browser console for errors
- Try refreshing page

### "Signals not updating"
- Check Network tab (should see API calls every 5-10s)
- Verify API returns new data
- Check for CORS errors
- Ensure `autoUpdate={true}` prop set

### "Map crashes or lags"
- Check browser console for JavaScript errors
- Reduce visible signals (apply filters)
- Close other browser tabs
- Upgrade to modern browser

---

## Customization Examples

### Change Center Location

```typescript
// In google-maps-config.ts
export const GREENSBORO_CENTER = {
  lat: 36.0726,    // Change this
  lng: -79.7920,   // And this
};
```

### Add New Watch Zone

```typescript
// In google-maps-config.ts WATCH_ZONES array:
{
  id: 'zone-7-airport',
  name: 'Zone 7: Airport',
  center: { lat: 36.1098, lng: -79.9370 },
  radius: 3.0,
  color: '#9900FF',  // Purple
  markerColor: '#9900FF',
  threatLevel: 'LOW',
  description: 'Piedmont Triad International Airport'
}
```

### Change Update Interval

```typescript
// In google-maps-config.ts
export const UPDATE_INTERVALS = {
  SPECTRUM: 15000,  // 15 seconds (slower)
  INCIDENTS: 15000,
  SIGNALS: 8000,
};
```

### Add New Frequency Classification

```typescript
// In signal-mapper.ts classifyFrequency():
if (frequency >= 2400 && frequency <= 2500) {
  return {
    type: 'WIFI',
    color: '#00CCFF',
    icon: '📶',
    priority: 'LOW'
  };
}
```

---

## Performance Tips

### Optimize Signal Display

```typescript
// Reduce signals shown (filter active ones):
const filtered = signals.filter(s => 
  s.signalStrength > -60  // Only strong signals
);
```

### Enable Clustering

```typescript
// Automatically clusters signals within 0.15°
// Reduce cluster radius for more detail:
const clusters = clusterSignals(signals, 0.05); // 0.05° radius
```

### Lazy Load Heat Map

```typescript
// Heat map only loads when user toggles it on
// Not loaded on page load - saves memory
```

---

## Monitoring

### Check Real-Time Performance

```bash
# Monitor API response times
watch -n 5 'curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3014/api/sdr/frequencies'

# Monitor Docker resource usage
docker stats wise-defense-website

# Check logs for errors
docker logs -f wise-defense-website
```

### Expected Metrics

```
Page Load Time:        < 3 seconds
API Response Time:     < 500ms
Map Render Time:       < 1 second
Memory Usage:          < 500MB
CPU Usage:             < 20%
Update Frequency:      Every 5-10s
Signal Count:          50-500 active
```

---

## Security Notes

### API Key Management

✅ **Do**:
- Restrict to wisedefensellc.com domain
- Restrict to Google Maps APIs only
- Rotate quarterly
- Monitor quota usage

❌ **Don't**:
- Commit API key to git
- Share API key in emails
- Use test key in production
- Allow unrestricted access

### Data Privacy

- No personal data stored
- Locations are approximate (±1km)
- No logging to third parties
- HTTPS encryption required
- Clear browser storage on logout

---

## Next Steps

1. ✅ Complete 5-minute setup above
2. ✅ Verify WISE Defense API connected
3. ✅ Test all filters and features
4. ✅ Deploy to production (see DEPLOYMENT_CHECKLIST.md)
5. ✅ Monitor for 24 hours
6. ✅ Optimize based on metrics

---

## Documentation

- **Setup Guide**: `KNIGHT_WING_CRIME_RADAR_SETUP.md`
- **Deployment Checklist**: `KNIGHT_WING_DEPLOYMENT_CHECKLIST.md`
- **API Documentation**: `apps/wise-defense-edge/README.md`
- **Component Reference**: See JSDoc comments in component files

---

## Support

- **Issues**: Check browser console for errors
- **API Problems**: Verify WISE Defense Edge running
- **Maps Issues**: Check Google Cloud quota
- **Performance**: Clear browser cache, close other tabs

---

**Ready to go!** 🎯

Your crime radar is live at `/dashboard/greensboro`.

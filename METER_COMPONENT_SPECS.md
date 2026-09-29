# WISE² PROFESSIONAL METER SYSTEM — COMPONENT SPECIFICATIONS

**Reference**: wise2meters.png (User-provided broadcast console reference)  
**Status**: Ready to Implement  
**Date**: 2026-07-24

---

## VISUAL REFERENCE ANALYSIS

### Top Status Ribbon ✅
```
┌─────────────────────────────────────────────────────────────────────┐
│ ● LIVE  01:24:35      1080p60  60 fps  8.4 Mbps  ● Excellent  23ms │
│          SESSION                                    STREAM HEALTH    │
│          DURATION                                   LATENCY          │
│                                                                     │
│ CPU 22% ▮▮▯▯▯  GPU 44% ▮▮▮▮▮▮▯▯▯  MET Excellent  ▮▮▯▯▯            │
│ (Mini telemetry bars - extremely compact)                          │
└─────────────────────────────────────────────────────────────────────┘
```

**Component**: `StreamStatusRibbon`
- Horizontal layout
- Real-time metrics: duration, resolution, fps, bitrate
- Health indicator (colored dot)
- Latency display
- Mini telemetry bars (CPU/GPU/Memory)
- Refresh: Every 100ms
- Max height: 60px

### Video Preview with Audio Meters ✅
```
┌──────────────────────────────────┐
│ ● LIVE  👁️ 1,256                │
│                                  │
│      [Large video area]          │
│                                  │
│  L ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▯▯  -12.4 dB  │
│  R ▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯▯▯   -8.7 dB  │
│  [Segmented LED meters]          │
│  🔇 ☐                             │
└──────────────────────────────────┘
```

**Component**: `StereoMeter` (Master Audio Meter)
- Positioned below video preview
- Two horizontal channels (L/R)
- Segmented LED visualization (NOT continuous gradient)
- Color progression: GREEN → YELLOW → ORANGE → RED
- Peak markers visible
- Current dB value in right column
- Mute button on left
- Clip indicator top-right
- Update: 30-60 FPS (tied to audio processing)

### Audio Mixer Panel ✅
```
┌─────────────────────────────────────────────────┐
│ AUDIO MIXER                                  ⚙️  │
├─────────────────────────────────────────────────┤
│  Mic 1    Mic 2   System   Music   Guest       │
│   ▮▮       ▮▮      ▮▮       ▮▮      ▮▮        │
│   ▮▮       ▮▮      ▮▮       ▮▮      ▮▮        │
│   ▮▮       ▮▮      ▮▮       ▮▮      ▮▮        │
│   ▮▮       ▮▮      ▮▮       ▮▮      ▮▮        │
│ [Vertical Segmented Meters]                   │
│  -4.3dB   -8.1dB  -3.2dB  -10.4dB  -6.7dB   │
│  [Peak levels centered below each meter]      │
│                                               │
│  ▯  ◇                                         │
│  M  S  M  S  M  S  M  S  M  S                │
│  (Mute & Solo buttons below each)            │
│                                               │
│  ├─────────────────────────────────────┤    │
│    Input Boost              AI Voice  ON|    │
│    [Slider]                            │    │
└─────────────────────────────────────────────────┘
```

**Component**: `MixerChannelStrip` (Enhanced)
- Vertical segmented meter (small, in-line display)
- Peak dB value centered below
- Mute (M) button
- Solo (S) button
- Width: ~60-70px per channel
- Scrollable container (5+ channels)
- Grid layout with gap
- Update: 30-60 FPS

### AI Director Metrics ✅
```
┌──────────────────────────────┐
│ AI DIRECTOR            BETA  │
├──────────────────────────────┤
│                              │
│  OVERALL SCORE         94    │
│  Excellent        ◯ [green] │
│                              │
│  AUDIENCE SENTIMENT   92%    │
│  Positive         ◯ [green] │
│                              │
│  ENGAGEMENT                  │
│  High          [sparkline]   │
│                              │
│  RETENTION RATE       78%    │
│                    [sparkline]│
│                              │
│  AI SUGGESTIONS              │
│  ✓ Switch to Camera 2        │
│  ✓ Add tags for viral boost  │
│  ✓ Perfect time for CTA      │
│                              │
│  [Generate Highlight]        │
└──────────────────────────────┘
```

**Components**: 
- `HealthRing` - Circular gauge (94, Excellent)
- `MetricRing` - Metric + ring (92%, Positive)
- `RealtimeSparkline` - 60-120 sample history
- `AIDirectorMetrics` - Container

### Stream Destinations ✅
```
┌────────────────────────────────┐
│ STREAM DESTINATIONS          × │
├────────────────────────────────┤
│ 🔴 YouTube                     │
│    Live  ● 1,256 ▮▮▮▮▮       │
│                                │
│ 🟣 Twitch                      │
│    Live  ● 892  ▮▮▮▮▯         │
│                                │
│ 🔵 Facebook                    │
│    Live  ● 645  ▮▮▮▮▮         │
│                                │
│ 🔗 LinkedIn                    │
│    Live  ● 234  ▮▮▯▯▯         │
│                                │
│ 🎥 Custom RTMP                 │
│    Live  1080p60 ▮▮▮▮▮        │
│                                │
│  [+ Add Destination]           │
└────────────────────────────────┘
```

**Components**:
- `DestinationHealth` - Per-platform status
- `SignalStrength` - 5-bar indicator (▮▮▮▮▮ format)
- `DestinationCard` - Platform badge + status + viewers + signal

### Analytics Dashboard ✅
```
┌─────────────────────────────────────────┐
│ ANALYTICS (LIVE)                   1H ▼ │
├─────────────────────────────────────────┤
│  1,256          8,450          98%      │
│  Viewers      Watch Time (min)  Health  │
│  ↗ +12%        ↗ +3%                   │
│                                         │
│  [Sparkline chart - 60min history]     │
│                                         │
│  TOP SOURCES       VIEWER LOCATIONS    │
│  🟦 YouTube  45%   [Map visualization] │
│  🟦 Direct   25%                        │
│  🟦 Facebook 15%                        │
│  🟦 Twitch   10%                        │
│  🟦 Other    5%                         │
└─────────────────────────────────────────┘
```

**Components**:
- `ViewerMetrics` - Current + velocity + peak
- `RealtimeSparkline` - Viewers history
- `SourceBreakdown` - Pie/bar chart
- `ViewerLocations` - Map or heatmap
- `AnalyticsDashboard` - Container

---

## DESIGN TOKENS FROM REFERENCE

### Colors
```css
/* Meter States */
--meter-silent: #1F2937;         /* Gray-800 (no signal) */
--meter-safe: #10B981;           /* Green (≤-12dB safe) */
--meter-normal: #84CC16;         /* Lime (caution -12 to -6dB) */
--meter-warning: #FBBF24;        /* Amber (-6 to -3dB) */
--meter-hot: #FB923C;            /* Orange (-3 to 0dB) */
--meter-clip: #EF4444;           /* Red (≥0dB clipping) */

/* Status Indicators */
--status-live: #EF4444;          /* Red (#LIVE) */
--status-excellent: #10B981;     /* Green (health good) */
--status-warning: #FBBF24;       /* Amber (degraded) */
--status-critical: #EF4444;      /* Red (critical) */

/* UI Elements */
--accent-primary: #0094FF;       /* WISE² Blue (highlights) */
--bg-primary: #000000;           /* Pure black */
--bg-secondary: #111111;         /* Nearly black panels */
--bg-tertiary: #1F2937;          /* Gray-800 (borders) */
--text-primary: #FFFFFF;         /* White text */
--text-secondary: #9CA3AF;       /* Gray-400 (labels) */

/* Accent States */
--accent-muted: #9CA3AF;         /* Gray-400 */
--accent-active: #0094FF;        /* Blue */
--accent-success: #10B981;       /* Green */
--accent-danger: #EF4444;        /* Red */
```

### Typography
```css
/* Meter Labels */
font-family: 'Monaco', 'Courier New', monospace;  /* Monospace for tech feel */
font-size: 11px;                                   /* Small, technical */
font-weight: 500;                                  /* Medium weight */
letter-spacing: 0.5px;                            /* Slight spacing */
line-height: 1.4;                                 /* Tight leading */

/* Section Titles */
font-family: 'Inter', sans-serif;                 /* Clean sans */
font-size: 12px;                                  /* Small but readable */
font-weight: 600;                                 /* Semi-bold */
text-transform: uppercase;                        /* All caps */
letter-spacing: 1px;                              /* Wide letter spacing */

/* Metrics Display */
font-family: 'Monaco', monospace;
font-size: 13px;
font-weight: 700;                                 /* Bold numbers */
font-variant-numeric: tabular-nums;               /* Monospace numbers */
```

### Spacing & Sizing
```css
/* Component Sizes */
--status-ribbon-height: 56px;
--meter-height-small: 12px;                       /* Channel strip meter */
--meter-height-large: 140px;                      /* Master meter panel */
--meter-width-channel: 68px;                      /* Per-channel width */
--panel-border-radius: 8px;

/* Gaps & Padding */
--gap-xs: 4px;
--gap-sm: 8px;
--gap-md: 12px;
--gap-lg: 16px;
--padding-xs: 4px;
--padding-sm: 8px;
--padding-md: 12px;
--padding-lg: 16px;
```

### Borders & Effects
```css
/* Meter Styling */
border: 1px solid #1F2937;                        /* Subtle gray border */
border-radius: 4px;                               /* Minimal radius */
box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);    /* Subtle inset shadow */

/* Hover Effects */
border-color: #0094FF;                            /* Highlight on hover */
box-shadow: inset 0 1px 2px rgba(0,0,0,0.3),
            0 0 8px rgba(0,148,255,0.2);         /* Subtle glow */

/* Active States */
background: rgba(0,148,255,0.1);
border-color: #0094FF;
```

---

## SEGMENTED LED METER SPECIFICATION

### Visual Structure
```
Single Meter (Vertical, 12 segments)
┌───────┐
│ ▮ (1) │ ← RED (#EF4444)      Clipping zone (-0 to +6dB)
│ ▮ (2) │ ← RED              
│ ▮ (3) │ ← ORANGE (#FB923C)  Hot zone (-3 to 0dB)
│ ▮ (4) │ ← ORANGE            
│ ▮ (5) │ ← AMBER (#FBBF24)   Caution zone (-6 to -3dB)
│ ▮ (6) │ ← AMBER             
│ ◯ (7) │ ← LIME (#84CC16)    Normal zone (-12 to -6dB)
│ ◯ (8) │ ← LIME              
│ ◯ (9) │ ← GREEN (#10B981)   Safe zone (-60 to -12dB)
│ ◯(10) │ ← GREEN             
│ ◯(11) │ ← GREEN             
│ ◯(12) │ ← GREEN             
└───────┘
```

**Segment Behavior**:
- Lit segments: Bright color + glow
- Unlit segments: Dim version (~20% opacity) - visible but inactive
- No gradient - each segment is discrete
- Smooth animation between levels (fast attack, slow release)
- Peak marker: Thin white line at max reached level

### Horizontal Master Meter
```
L ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯▯  -4.3 dB  🔇
R ▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯▯▯▯▯▯  -8.7 dB
```

**Specifications**:
- 20 horizontal segments per channel
- Color zones: Green (0-6), Lime (6-10), Amber (10-14), Orange (14-18), Red (18-20)
- Peak markers visible
- dB value on right
- Mute icon on left
- Smooth real-time updates

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Core Components (Week 1)
```
1. ✅ SegmentedMeter.tsx
   - Vertical meter with 12 LED segments
   - Colors: Red/Orange/Amber/Lime/Green
   - Peak marker + hold
   - Small & large sizes
   
2. ✅ StereoMeter.tsx
   - Horizontal L/R meters
   - 20 segments per channel
   - Peak markers + clip indicators
   - dB value display
   
3. ✅ TelemetryMeter.tsx
   - Mini compact gauges
   - CPU/GPU/Memory bars
   - Compact sparklines
   
4. ✅ useAudioMeter() hook
   - Connect to Web Audio API
   - Real-time peak level
   - Fallback mock data
   
5. ✅ useRollingHistory() hook
   - 60-120 sample buffer
   - Ring buffer implementation
   
6. ✅ db-conversion utilities
   - dB ↔ Linear conversion
   - Normalize to 0-100%
   - Color zone mapping
```

### Phase 2: Analytics & Health (Week 2)
```
7. ✅ RealtimeSparkline.tsx
   - Thin line chart
   - 60-120 sample history
   - Subtle fill + shadow
   
8. ✅ HealthRing.tsx
   - Circular gauge (0-100%)
   - Status label (Excellent/Good/Warning/Critical)
   - Color coded
   
9. ✅ StreamHealthMeter.tsx
   - Collection of telemetry
   - Bitrate + frames + latency + CPU/GPU
   
10. ✅ SignalStrength.tsx
    - 5-bar indicator (▮▮▮▮▯)
    - Color coded by strength
    
11. ✅ DestinationHealth.tsx
    - Platform badge
    - Live status indicator
    - Viewer count
    - Signal bars
```

### Phase 3: Advanced UI (Week 3)
```
12. ✅ AIDirectorMetrics.tsx
    - Overall score ring
    - Sentiment ring
    - Engagement sparkline
    - Retention sparkline
    - Suggestions list
    
13. ✅ ViewerVelocity.tsx
    - Current viewers
    - Velocity indicator
    - Peak viewers
    - Sparkline history
    
14. ✅ StreamStatusRibbon.tsx
    - Compact horizontal status
    - Duration + resolution + fps + bitrate
    - Health indicator
    - Latency
    - Mini telemetry bars
```

---

## PERFORMANCE TARGETS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Meter update rate | 60 FPS | Chrome DevTools Performance |
| Audio meter latency | <50ms | Browser audio processing |
| Sparkline render | 30 FPS | Acceptable for secondary metric |
| Peak hold decay | Smooth | Visual smoothness test |
| React rerenders | <5 per second | React DevTools Profiler |
| Canvas memory | <10MB | DevTools Memory |
| Bundle size increase | <75KB | `npm run build` analysis |

---

## RESPONSIVE BEHAVIOR

### Desktop (1920px+)
- Full professional meters
- All telemetry visible
- Sparklines with 120-sample history
- Multi-line layouts

### Tablet (768px-1920px)
- Compact channel names
- Reduced dB label size
- Sparklines with 90-sample history
- 2-column layout for analytics

### Mobile (< 768px)
- Minimal labels
- Simplified sparklines (60 samples)
- Single-column stacked layout
- Tap-to-expand for detail

---

## ACCESSIBILITY REQUIREMENTS

```
ARIA Labels (Required):
├── aria-label="Microphone 1 level minus 4.3 decibels"
├── aria-label="Stream health excellent"
├── aria-live="polite" (for real-time updates)
├── aria-valuemin="-60"
├── aria-valuemax="6"
├── aria-valuenow="-4.3"
└── aria-valuetext="minus 4 point 3 decibels"

Keyboard Navigation:
├── Tab through controls
├── Enter/Space to toggle mute/solo
├── Arrow keys to adjust volume
└── No focus trap

Reduced Motion:
├── Respect prefers-reduced-motion
├── Static display when animation disabled
├── Peak markers still visible
└── No animation flashing

Color Contrast:
├── All text ≥ 4.5:1 ratio
├── Meters use color + position (not color alone)
└── Labels accompany all indicators
```

---

## TESTING STRATEGY

```
Unit Tests:
✅ dB conversion accuracy
✅ Color zone boundaries
✅ Peak hold timeout
✅ Clip detection logic

Integration Tests:
✅ VUMeter in MixerChannel
✅ StereoMeter under video preview
✅ HealthRing in AI Director
✅ Sparkline data updates

Visual Tests:
✅ Meter animation smoothness
✅ Color accuracy vs reference
✅ Responsive layout breakpoints
✅ Dark mode rendering

Performance Tests:
✅ Frame rate under 60 FPS (meter updates)
✅ React render count < 5/sec
✅ Audio processing latency < 50ms
✅ Memory usage < 10MB for all meters

E2E Tests:
✅ Real stream with live audio
✅ Mock data fallback
✅ Navigation between pages
✅ Responsive viewport changes
```

---

## IMPLEMENTATION PRIORITY

**START HERE - Critical Path**:
1. `SegmentedMeter.tsx` - Foundation for all other meters
2. `useAudioMeter()` hook - Data source
3. `db-conversion.ts` - Utility for all calculations
4. `StereoMeter.tsx` - Master meter (most visible)
5. Integrate into existing MasterMixer

**Then expand**:
6. TelemetryMeter + RealtimeSparkline
7. HealthRing + StreamHealthMeter
8. AIDirectorMetrics
9. Responsive + Accessibility pass
10. Performance optimization

---

## NEXT IMMEDIATE ACTIONS

```
✅ Review reference image (wise2meters.png) ← DONE
✅ Create audit document (WISE2_METER_AUDIT.md) ← DONE
✅ Create component specs (this file) ← DONE
→ START: Build SegmentedMeter.tsx component
→ Build useAudioMeter hook
→ Build db-conversion utilities
→ Test in VUMeterDemo with segmented variant
→ Integrate into MasterMixer
```

Ready to start Phase 1? 🚀

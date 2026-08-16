# WISE² LIVE STUDIO — PROFESSIONAL METER SYSTEM AUDIT

**Date**: 2026-07-24  
**Status**: Ready for Implementation  
**Priority**: Phase 1 (Core Meter System)

---

## EXISTING INFRASTRUCTURE ✅

### Already Built & Working
```
✅ VUMeter.tsx (11.8 KB)
   - Canvas-based rendering at 60 FPS
   - Color zones: Green (-60 to -6dB) / Yellow (-6 to -3dB) / Red (-3 to +6dB)
   - Peak hold with configurable duration
   - Small & large display modes
   - Peak reset callback
   - Responsive scaling + Retina support

✅ MixerChannel.tsx (2.3 KB)
   - Channel strip layout
   - Integrated VUMeter (small)
   - Volume fader (-60dB to +6dB)
   - Mute/Solo toggles
   - Real-time dB display

✅ MasterMixer.tsx (2.5 KB)
   - Multi-channel container
   - Master fader with VUMeter
   - Synchronized controls
   - Responsive grid layout

✅ VUMeterDemo.tsx (7.7 KB)
   - Interactive demo with simulated audio
   - Shows all component variations
   - Feature explanations
   - Usage examples

✅ types.ts (5.6 KB)
   - MixerChannelConfig interface
   - Type definitions for audio data
   - Well-structured type system
```

### Key Files Location
```
/apps/studio/components/Shared/Mixer/
  ├── VUMeter.tsx                 ← Core meter component
  ├── MixerChannel.tsx            ← Channel strip
  ├── MasterMixer.tsx             ← Master mixer
  ├── VUMeterDemo.tsx             ← Demo/Testing
  ├── types.ts                    ← TypeScript types
  ├── index.ts                    ← Exports
  ├── README.md                   ← Documentation
  ├── IMPLEMENTATION_GUIDE.md     ← Integration guide
  └── FEATURES_SUMMARY.md         ← Feature list
```

---

## WHAT'S NEEDED - NEW COMPONENTS

### Phase 1: Core Enhancements (CRITICAL)
| Component | Purpose | Status | Priority |
|-----------|---------|--------|----------|
| SegmentedMeter | Professional LED-style meter (not continuous gradient) | Need | HIGH |
| StereoMeter | Dual-channel horizontal master meter (L/R) | Need | HIGH |
| PeakIndicator | Peak hold + clip indicators | Need | HIGH |
| TelemetryMeter | Compact mini gauges (CPU/GPU/MEM/Network) | Need | HIGH |

### Phase 2: Analytics & Health (IMPORTANT)
| Component | Purpose | Status | Priority |
|-----------|---------|--------|----------|
| RealtimeSparkline | Bitrate/viewers/engagement history graph | Need | MEDIUM |
| HealthRing | Circular ring gauge showing stream health % | Need | MEDIUM |
| StreamHealthMeter | Collection of telemetry indicators | Need | MEDIUM |
| SignalStrength | 5-bar signal indicator ▮▮▮▮▮ | Need | MEDIUM |
| DestinationHealth | Per-platform status + viewers | Need | MEDIUM |

### Phase 3: AI & Advanced (ENHANCEMENT)
| Component | Purpose | Status | Priority |
|-----------|---------|--------|----------|
| AIDirectorMetrics | Sentiment/engagement/retention cards | Need | LOW |
| ViewerVelocity | Current viewers + velocity sparkline | Need | LOW |
| StreamStatusRibbon | Compact status bar with mini meters | Need | LOW |

---

## HOOKS NEEDED

```typescript
// /hooks/audio/
✓ useAudioMeter()           - Get audio engine peak level data
✓ usePeakHold()             - Peak hold state management
✓ useTelemetry()            - Stream telemetry subscription
✓ useRollingHistory()       - Windowed data buffer (60-120 samples)

// Pseudo-code structure (NOT YET BUILT)
const useAudioMeter = () => {
  // Returns: { channels: ChannelData[], master: number }
  // Source: WebAudio API or backend stream telemetry
}

const usePeakHold = (peakLevel, holdDuration = 1000) => {
  // Returns: { displayPeak, resetPeak() }
  // Manages peak decay after hold timeout
}

const useRollingHistory = (dataPoints = 120, interval = 100) => {
  // Returns: { history: number[], push(value) }
  // Ring buffer for sparkline data
}
```

---

## UTILITIES NEEDED

```typescript
// /lib/audio/
db-conversion.ts
  ├── dbToLinear(db: number): number        ← dBFS to linear ratio
  ├── linearToDb(linear: number): number    ← Reverse
  └── getColorZone(db: number): 'green'|'yellow'|'red'

meter-utils.ts
  ├── calculateRMS(pcm: Float32Array): number
  ├── calculatePeakDb(pcm: Float32Array): number
  ├── normalizeLevel(db: number, min, max): 0-1
  └── formatDbLabel(db: number): string    ← "-4.3 dB"

audio-source.ts
  ├── class AudioMeterAdapter              ← Bridge real/mock audio
  ├── MockAudioSource                      ← Demo data
  └── RealAudioSource                      ← Web Audio API integration
```

---

## DESIGN TOKENS NEEDED

```css
/* Add to existing WISE² tokens */

/* Meter Colors */
--meter-inactive: #374151;      /* Gray-700 (off state) */
--meter-signal: #0094FF;        /* WISE² Blue */
--meter-normal: #10B981;        /* Green (safe) */
--meter-warning: #F59E0B;       /* Amber (caution) */
--meter-hot: #EF8860;           /* Orange (hot) */
--meter-clip: #EF4444;          /* Red (clipping) */
--meter-peak: #E3E8EF;          /* Light text (peak marker) */
--meter-grid: #4B5563;          /* Grid lines */

/* Health States */
--health-excellent: #10B981;    /* Green */
--health-good: #3B82F6;         /* Blue */
--health-warning: #F59E0B;      /* Amber */
--health-critical: #EF4444;     /* Red */
```

---

## EXISTING COMPONENTS TO INTEGRATE WITH

| Component | Location | Purpose |
|-----------|----------|---------|
| StreamAnalytics | `/dashboard/components/live-streaming/` | Telemetry display |
| StreamStats | `/dashboard/components/live-streaming/` | Stat cards |
| StreamDestinations | `/dashboard/components/live-streaming/` | Platform status |
| LiveStreamPanel | `/studio/components/` | Main control panel |
| AudioMixer | `/dashboard/components/live-streaming/` | Mixer interface |

---

## IMPLEMENTATION ORDER (Recommended)

```
PHASE 1: CORE METERS (Week 1)
1. Create SegmentedMeter component
2. Create StereoMeter (master meter)
3. Enhance PeakIndicator & ClipDetector
4. Build audio hooks (useAudioMeter, usePeakHold)
5. Build db-conversion utilities
6. Integrate into MasterMixer

PHASE 2: TELEMETRY (Week 2)
7. Create TelemetryMeter (mini gauges)
8. Create RealtimeSparkline (chart)
9. Create HealthRing (gauge)
10. Create StreamHealthMeter (collection)
11. Create SignalStrength (indicator)
12. Integrate into StreamAnalytics

PHASE 3: ADVANCED (Week 3)
13. Create AIDirectorMetrics
14. Create ViewerVelocity
15. Create StreamStatusRibbon
16. Responsive variants (tablet/mobile)
17. Accessibility audit (ARIA, reduced-motion)
18. Performance profiling & optimization
19. Production build test
20. Reference image alignment verification
```

---

## CRITICAL SUCCESS CRITERIA

| Criterion | Status | Notes |
|-----------|--------|-------|
| No streaming functionality broken | VERIFY | Must test before/after |
| Real audio data (not fake) | REQUIRES AUDIT | Check if AudioContext available |
| Peak hold works correctly | TEST | 1-2 second hold with smooth decay |
| Clip detection triggers | TEST | Red segment + "CLIP" label |
| No React rerender storms | PROFILE | Use Canvas + requestAnimationFrame |
| Mobile responsive | TEST | Desktop/tablet/mobile layouts |
| Reduced-motion respected | TEST | Disable animations if pref set |
| TypeScript passes | VERIFY | Strict mode |
| Production build works | VERIFY | Next.js build test |
| Matches reference image | VISUAL AUDIT | Professional broadcast aesthetic |
| Accessibility complete | AUDIT | WCAG 2.1 AA minimum |

---

## TECHNICAL DECISIONS

### 1. Real Audio vs Mock Data
**Decision**: Use real Web Audio API when available, mock fallback for demo
```
- Browser has AudioContext? → Use AnalyserNode
- No AudioContext? → Use mock with subtle variation
- Real stream data? → Use backend telemetry
- Fallback → Demo mode clearly labeled
```

### 2. Canvas vs SVG vs CSS
**Decision**: Canvas for meters (60 FPS), CSS for labels, SVG for icons
```
Why Canvas:
- 60 FPS smooth animation required
- Canvas = hardware-accelerated rendering
- Perfect for real-time gauge visualization

Why NOT SVG:
- SVG slower for frequent redraws
- More CPU usage at 60 FPS
```

### 3. State Management
**Decision**: React hooks + refs for high-frequency updates
```
- useState for UI state (volume, mute, solo)
- useRef for Canvas elements (don't trigger render)
- useCallback for memoized handlers
- Separate high-frequency (meter) from low-frequency (UI) updates
```

### 4. Styling Approach
**Decision**: Tailwind CSS + CSS variables for consistency
```
- Use WISE² design tokens
- Avoid hardcoded colors (use --meter-* variables)
- Responsive with Tailwind breakpoints
```

---

## FILES TO CREATE

```
NEW COMPONENTS
├── components/meters/
│   ├── SegmentedMeter.tsx         (NEW)
│   ├── StereoMeter.tsx            (NEW)
│   ├── PeakIndicator.tsx          (ENHANCE existing)
│   ├── TelemetryMeter.tsx         (NEW)
│   ├── RealtimeSparkline.tsx      (NEW)
│   ├── HealthRing.tsx             (NEW)
│   ├── StreamHealthMeter.tsx      (NEW)
│   ├── SignalStrength.tsx         (NEW)
│   ├── DestinationHealth.tsx      (NEW)
│   ├── AIDirectorMetrics.tsx      (NEW)
│   └── ViewerVelocity.tsx         (NEW)
│
├── hooks/audio/ (NEW)
│   ├── useAudioMeter.ts           (NEW)
│   ├── usePeakHold.ts             (NEW)
│   ├── useTelemetry.ts            (NEW)
│   └── useRollingHistory.ts       (NEW)
│
├── lib/audio/ (NEW)
│   ├── db-conversion.ts           (NEW)
│   ├── meter-utils.ts             (NEW)
│   └── audio-source.ts            (NEW)
│
└── DOCUMENTATION (NEW)
    ├── METER_SYSTEM_DESIGN.md
    ├── COMPONENT_GUIDE.md
    └── INTEGRATION_EXAMPLES.md

EXISTING FILES TO ENHANCE
├── components/Shared/Mixer/
│   ├── VUMeter.tsx                (already good)
│   ├── MixerChannel.tsx           (add segmented meter option)
│   ├── MasterMixer.tsx            (add stereo meter)
│   └── index.ts                   (export new components)
│
└── design tokens (Tailwind config or globals.css)
    └── Add --meter-* CSS variables
```

---

## REFERENCE IMAGE ALIGNMENT CHECKLIST

- [ ] Segmented LED meters (not gradient bars)
- [ ] Professional broadcast console aesthetic
- [ ] Peak hold indicators visible & readable
- [ ] Clipping detection prominent but subtle
- [ ] Telemetry density appropriate (not overwhelming)
- [ ] Color scheme: green/yellow/orange/red (standard broadcast)
- [ ] Spacing: professional technical density
- [ ] Typography: small, monospace for meters
- [ ] Grid background (subtle)
- [ ] Minimal reflections (no skeuomorphism)
- [ ] No "gamer RGB" aesthetic

---

## DEPLOYMENT CONSIDERATIONS

```
Browser Support (Web Audio API):
- Chrome 90+      ✅
- Firefox 88+     ✅
- Safari 14+      ✅
- Edge 90+        ✅
- Mobile Safari   ⚠️  (limited audio input)
- Android Chrome  ✅

Fallback Strategy:
- Desktop Chrome/Firefox/Edge → Full features
- Safari → Full features (iOS limitation on stream input)
- No AudioContext → Mock mode with disclaimer

Performance:
- Target: 60 FPS on meter updates
- Acceptable: 30 FPS on complex dashboards
- Monitor: Main thread CPU < 5% for audio processing
```

---

## SUCCESS METRICS

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame rate | 60 FPS | Chrome DevTools Performance |
| Bundle size increase | < 50 KB | `npm run build` analysis |
| Component load time | < 100ms | Lighthouse |
| Accessibility score | 95+ | Lighthouse |
| Mobile responsiveness | 100% | Chrome DevTools responsive |
| Type checking | 0 errors | `npx tsc --noEmit` |
| Visual match | 95%+ | Side-by-side with reference |

---

## NEXT IMMEDIATE STEPS

```
1. Read existing VUMeter.tsx implementation
2. Audit existing hooks & utilities
3. Identify real audio data source
4. Create SegmentedMeter component (Phase 1 start)
5. Build useAudioMeter hook
6. Integrate into MasterMixer
7. Test with real/mock audio
8. Verify reference image alignment
```

---

## NOTES

- **Keep it simple**: Each component should do ONE thing well
- **Performance first**: No unnecessary renders or animations
- **Accessibility always**: Not just color, use text + icons + position
- **Test early**: Don't wait until end to test integration
- **Reference constantly**: Align visuals with broadcast console aesthetic
- **Document as you go**: Keep component usage clear for team

---

**Ready to begin Phase 1?** ✅

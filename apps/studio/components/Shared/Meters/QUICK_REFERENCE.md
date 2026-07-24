# SegmentedMeter Quick Reference

## Basic Usage
```typescript
<SegmentedMeter peakLevel={-30} />
```

## With All Options
```typescript
<SegmentedMeter
  peakLevel={-30}              // Current level in dB
  size="large"                 // 'small' | 'large'
  label="L"                    // Optional label
  showPeakHold={true}          // Show peak marker
  peakHoldDuration={1500}      // Hold time in ms
  onPeakReset={() => {}}       // Peak decay callback
/>
```

## Sizes
| Size | Width | Height | Use Case |
|------|-------|--------|----------|
| small | 40px | 260px | Compact layouts, many channels |
| large | 80px | 260px | Main displays, detailed info |

## dB Levels
| Level | Meaning |
|-------|---------|
| -60 to -12 dB | Green (Safe) |
| -12 to -6 dB | Lime (Caution) |
| -6 to -3 dB | Amber (Warning) |
| -3 to 0 dB | Orange (Alert) |
| 0 to +6 dB | Red (Critical) |

## Styling
```typescript
// Component uses CSS variables
style={{
  '--meter-safe': '#22C55E',      // Green
  '--meter-caution': '#84CC16',   // Lime
  '--meter-warning': '#FBBF24',   // Amber
  '--meter-alert': '#F97316',     // Orange
  '--meter-critical': '#EF4444',  // Red
} as React.CSSProperties}
```

## Key Features
- ✅ 60 FPS canvas rendering
- ✅ 12 LED segments
- ✅ Peak hold with decay
- ✅ DPI scaling
- ✅ Dark theme
- ✅ No dependencies

## Props
```typescript
interface SegmentedMeterProps {
  peakLevel: number;              // Required
  size?: 'small' | 'large';       // Default: 'small'
  showPeakHold?: boolean;         // Default: true
  peakHoldDuration?: number;      // Default: 1000ms
  onPeakReset?: () => void;       // Optional callback
  label?: string;                 // Optional
}
```

## Common Patterns

### Stereo Pair
```typescript
<div className="flex gap-8">
  <SegmentedMeter peakLevel={leftLevel} label="L" size="large" />
  <SegmentedMeter peakLevel={rightLevel} label="R" size="large" />
</div>
```

### Multi-Channel
```typescript
<div className="flex gap-4">
  {channels.map((ch, i) => (
    <SegmentedMeter key={i} peakLevel={ch.level} label={ch.name} />
  ))}
</div>
```

### With Callback
```typescript
<SegmentedMeter
  peakLevel={level}
  onPeakReset={() => recordPeakEvent()}
/>
```

## Performance Tips
1. Use `small` size for many meters (< 1% CPU each)
2. Update frequency max 60 Hz from audio engine
3. Limit to 8-16 meters per page
4. No need to memoize (optimized internally)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Blurry text | Normal on retina, no workaround needed |
| No update | Check `peakLevel` is changing |
| Missing colors | Ensure CSS variables are defined |
| CPU spike | Reduce meter count or update frequency |

## Export Statement
```typescript
export { SegmentedMeter } from './SegmentedMeter';
export type { SegmentedMeterProps } from './SegmentedMeter';
```

## Files
- `SegmentedMeter.tsx` - Main component (347 lines)
- `README.md` - Full documentation
- `IMPLEMENTATION_SUMMARY.md` - Architecture details
- `SegmentedMeter.example.tsx` - Interactive demo
- `SegmentedMeter.test.tsx` - Unit tests
- `INTEGRATION_CHECKLIST.md` - Integration guide

---
**Status**: Production Ready ✅

# Meters

Professional audio metering components for WISE² Live Studio.

## SegmentedMeter

A production-ready LED-style segmented meter for displaying audio levels in real-time.

### Features

- **Canvas-based rendering** optimized for 60 FPS animation using `requestAnimationFrame`
- **12 LED segments** with smooth, responsive level display
- **Color zones** that match standard audio metering conventions:
  - Green (-60 to -12 dB): Safe zone
  - Lime (-12 to -6 dB): Caution zone
  - Amber (-6 to -3 dB): Warning zone
  - Orange (-3 to 0 dB): Alert zone
  - Red (0 to +6 dB): Critical zone
- **Peak hold marker** showing the maximum level reached with configurable timeout
- **Smooth animation** with fast attack (responsive) and slow release (decay)
- **DPI scaling** for crisp rendering on retina displays
- **Two size options**: `small` (40px wide) and `large` (80px wide)
- **Responsive container** adapts to parent width
- **Dark theme styling** with gray-900 background and subtle borders
- **CSS variable theming** for easy color customization

### Props

```typescript
interface SegmentedMeterProps {
  peakLevel: number;           // -Infinity to +6 dB (required)
  size?: 'small' | 'large';    // Default: 'small'
  showPeakHold?: boolean;      // Default: true
  peakHoldDuration?: number;   // Default: 1000ms
  onPeakReset?: () => void;    // Callback when peak hold decays
  label?: string;              // Optional channel label
}
```

### Usage

```typescript
import { SegmentedMeter } from '@/components/Shared';

export function AudioMeter() {
  const [level, setLevel] = useState(-60);

  return (
    <div className="flex gap-4">
      <SegmentedMeter
        peakLevel={level}
        size="large"
        label="L"
        showPeakHold={true}
        peakHoldDuration={1500}
        onPeakReset={() => console.log('Peak reset')}
      />
      <SegmentedMeter
        peakLevel={level}
        size="large"
        label="R"
      />
    </div>
  );
}
```

### Animation

The meter uses optimized animation logic:

- **Attack time**: 50ms - fast response to rising levels
- **Release time**: 200ms - smooth decay for falling levels
- **Peak hold**: Configurable timeout (default 1000ms) before decay

### Theming

The component uses CSS variables for color customization. Default colors:

```css
--meter-safe:     #22C55E  /* Green */
--meter-caution:  #84CC16  /* Lime */
--meter-warning:  #FBBF24  /* Amber */
--meter-alert:    #F97316  /* Orange */
--meter-critical: #EF4444  /* Red */
```

Override these at the component level:

```typescript
<SegmentedMeter
  peakLevel={level}
  style={{
    '--meter-critical': '#FF1744',
  } as React.CSSProperties}
/>
```

### Performance

- Efficient canvas rendering with minimal redraws
- Memory-managed event listeners and timeouts
- Proper cleanup on unmount
- Optimized for 60 FPS playback

### Accessibility

- Optional label text for screen readers
- Semantic canvas element
- Proper color contrast ratios
- Works with system dark mode

### Browser Support

Requires browsers with:
- Canvas support
- `requestAnimationFrame` API
- `getComputedStyle` for CSS variable resolution

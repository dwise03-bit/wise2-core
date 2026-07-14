# Professional VU Meter & Mixer Components

A suite of professional audio mixer components for the WISE Sound Labs Live Studio, featuring canvas-based VU meter visualization with real-time peak level monitoring.

## Components

### VUMeter

Professional canvas-based VU meter visualization component with smooth animation and peak hold functionality.

#### Features

- **Canvas-based Rendering**: Hardware-accelerated smooth animation at 60 FPS using `requestAnimationFrame`
- **Color Zone Coding**: Visual feedback based on dB levels
  - Green: ≤ -6 dB (safe range)
  - Yellow: -6 to -3 dB (caution range)
  - Red: ≥ -3 dB (clipping risk)
- **Peak Hold Indicator**: Displays maximum level reached with configurable hold duration
- **Peak Reset Button**: Manually reset peak level (large display mode only)
- **Responsive Design**: Scales to container size with automatic Retina display scaling
- **dB Range**: -60 dB to +6 dB display range with -Infinity support for silence
- **Smooth Animation**: Fast attack (30% per frame) and smooth release (5% per frame) for natural decay

#### Props

```typescript
interface VUMeterProps {
  /**
   * Peak level in dB (-Infinity to +6dB)
   */
  peakLevel: number;

  /**
   * Display size: 'small' for inline, 'large' for dedicated panel
   * @default 'small'
   */
  size?: 'small' | 'large';

  /**
   * Show peak hold indicator
   * @default true
   */
  showPeakHold?: boolean;

  /**
   * Peak hold duration in milliseconds
   * @default 1000
   */
  peakHoldDuration?: number;

  /**
   * Callback when peak is reset
   */
  onPeakReset?: () => void;
}
```

#### Usage Examples

**Inline Meter (Channel Strip)**
```tsx
import { VUMeter } from '@/components/Shared/Mixer/VUMeter';

export function ChannelStrip() {
  const [peakLevel, setPeakLevel] = useState(-12);

  return (
    <div className="w-12">
      <VUMeter 
        peakLevel={peakLevel} 
        size="small" 
        showPeakHold={true}
      />
    </div>
  );
}
```

**Large Panel Display (Master Meter)**
```tsx
import { VUMeter } from '@/components/Shared/Mixer/VUMeter';

export function MasterMeterPanel() {
  const [masterLevel, setMasterLevel] = useState(-10);

  return (
    <div className="max-w-md">
      <VUMeter
        peakLevel={masterLevel}
        size="large"
        showPeakHold={true}
        peakHoldDuration={1500}
        onPeakReset={() => {
          console.log('Peak reset');
          // Update your audio engine state if needed
        }}
      />
    </div>
  );
}
```

### MixerChannel

Individual channel component with integrated VUMeter, volume fader, and mute/solo controls.

#### Features

- Professional channel strip layout
- Integrated canvas-based VU meter (small display)
- Vertical volume fader (-60dB to +6dB)
- Mute/Solo buttons
- Real-time level display
- Hover effects and visual feedback

#### Props

```typescript
interface MixerChannelProps {
  name: string;           // Channel identifier (e.g., "MIC 1")
  label: string;          // Channel label (e.g., "Vocals")
  volume: number;         // Current volume in dB (-60 to +6)
  peakLevel: number;      // Peak level in dB from audio engine
  isMuted: boolean;       // Mute state
  isSolo: boolean;        // Solo state
  onVolumeChange: (value: number) => void;
  onMuteToggle: () => void;
  onSoloToggle: () => void;
  index?: number;         // Channel index for tracking
}
```

#### Usage

```tsx
import { MixerChannel } from '@/components/Shared/Mixer/MixerChannel';

<MixerChannel
  name="MIC 1"
  label="Vocals"
  volume={-12}
  peakLevel={-8}
  isMuted={false}
  isSolo={false}
  onVolumeChange={(value) => handleVolumeChange('mic1', value)}
  onMuteToggle={() => handleMuteToggle('mic1')}
  onSoloToggle={() => handleSoloToggle('mic1')}
/>
```

### MasterMixer

Master mixer container managing multiple channels and master fader.

#### Features

- Multi-channel display with horizontal scroll
- Master channel with dedicated VU meter
- Synchronized volume control
- All-tracks view link
- Responsive grid layout

#### Props

```typescript
interface MasterMixerProps {
  channels: MixerChannel[];                           // Array of channel data
  masterVolume: number;                               // Master volume level
  masterPeakLevel: number;                            // Master peak level
  onChannelVolumeChange: (channelId: string, volume: number) => void;
  onChannelMuteToggle: (channelId: string) => void;
  onChannelSoloToggle: (channelId: string) => void;
  onMasterVolumeChange: (volume: number) => void;
  title?: string;                                     // Mixer title
  showAllTracksLink?: boolean;                        // Show view all tracks button
}
```

#### Usage

```tsx
import { MasterMixer } from '@/components/Shared/Mixer/MasterMixer';

<MasterMixer
  channels={channels}
  masterVolume={-6}
  masterPeakLevel={-4}
  onChannelVolumeChange={handleChannelVolumeChange}
  onChannelMuteToggle={handleChannelMuteToggle}
  onChannelSoloToggle={handleChannelSoloToggle}
  onMasterVolumeChange={handleMasterVolumeChange}
  title="LIVE MIXER"
  showAllTracksLink={true}
/>
```

## Technical Details

### Canvas Rendering

The VUMeter component uses the HTML5 Canvas API for smooth, hardware-accelerated rendering:

- **Animation Loop**: `requestAnimationFrame` for 60 FPS rendering
- **DPI Scaling**: Automatic detection and scaling for Retina displays
- **Color Zones**: Dynamic background highlighting based on signal level
- **Peak Hold**: Persistent visual indicator with automatic timeout

### dB Level Calculations

- **Normalization**: Linear mapping of dB range (-60 to +6) to 0-100% display range
- **Color Thresholds**:
  - Green: -60 dB to -6 dB (normalized 0% to 90%)
  - Yellow: -6 dB to -3 dB (normalized 90% to 95%)
  - Red: -3 dB to +6 dB (normalized 95% to 100%)

### Smooth Transitions

- **Attack**: 30% per frame (responsive to sudden peaks)
- **Release**: 5% per frame (smooth natural decay)
- **Peak Hold**: Automatic 1000ms timeout (configurable)

### Performance Optimization

- Canvas rendering only updates on state changes
- Efficient animation loop with minimal redraws
- Automatic cleanup of animation frames on unmount
- DPI-aware scaling for crisp rendering on all displays

## Integration with Audio Engine

The VUMeter components receive `peakLevel` data directly from the audio engine:

```typescript
// From MixerChannelConfig
interface MixerChannelConfig {
  id: string;
  name: string;
  volume: number;
  peakLevel: number;      // ← Pass to VUMeter
  isMuted: boolean;
  isSolo: boolean;
}
```

Update the peak level in real-time as audio is processed:

```tsx
// In your audio processing code
const updateChannelPeakLevel = (channelId: string, peak: number) => {
  setChannels(channels.map(ch => 
    ch.id === channelId 
      ? { ...ch, peakLevel: Math.max(ch.peakLevel, peak) }
      : ch
  ));
};
```

## Styling

All components use Tailwind CSS with a dark theme optimized for audio production:

- Background: `bg-gray-900` / `bg-gray-950`
- Borders: `border-gray-700`
- Interactive states: `hover:border-blue-500`
- Canvas container: Custom sizing with responsive scaling

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Requires Canvas API support and `requestAnimationFrame`

## Demo

See `VUMeterDemo.tsx` for a complete interactive demonstration of all VUMeter features and sizes.

## Files

- `VUMeter.tsx` - Main VU meter component with canvas rendering
- `MixerChannel.tsx` - Individual channel strip with integrated VUMeter
- `MasterMixer.tsx` - Master mixer container
- `VUMeterDemo.tsx` - Interactive demo and feature showcase
- `README.md` - This documentation

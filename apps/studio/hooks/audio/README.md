# Audio Metering Hook

Real-time audio metering for WISE² Live Studio using Web Audio API with intelligent fallbacks.

## Features

- **Real-time Audio Metering**: Tracks peak and RMS levels in dBFS scale (-60 to +6 dB)
- **Multi-channel Support**: Built-in support for 5 channels (Mic 1, Mic 2, System, Music, Guest)
- **Web Audio API Integration**: Connects to browser's native audio context
- **Graceful Fallbacks**: Provides realistic mock data when Web Audio is unavailable
- **Clipping Detection**: Automatically detects and reports when audio clips
- **Channel Controls**: Mute, solo, and volume adjustment per channel
- **Master Level Tracking**: Combined metering across all channels
- **Production-Ready**: Proper error handling, memory cleanup, and TypeScript support

## Installation

The hook is part of `apps/studio/hooks/audio/` and can be imported as:

```typescript
import { useAudioMeter } from '@/hooks/audio';
// or
import { useAudioMeter } from '@/hooks/audio/useAudioMeter';
```

## Basic Usage

```typescript
import { useAudioMeter } from '@/hooks/audio';

export function AudioMeterDisplay() {
  const { data, controls } = useAudioMeter();

  return (
    <div>
      <h3>Master Level: {data.master.toFixed(1)} dB</h3>
      {data.isClipping && <span style={{ color: 'red' }}>CLIPPING!</span>}
      
      <div>
        {data.channels.map((channel) => (
          <div key={channel.id}>
            <label>
              {channel.name}: {channel.peak.toFixed(1)} dB
              <input
                type="checkbox"
                checked={channel.muted}
                onChange={() => controls.toggleChannelMute(channel.id)}
              />
              Mute
            </label>
          </div>
        ))}
      </div>

      <button onClick={controls.resetPeaks}>Reset Peaks</button>
    </div>
  );
}
```

## Advanced Usage

### Connect to Microphone

```typescript
import { useAudioMeter } from '@/hooks/audio';
import { useEffect } from 'react';

export function LiveStreamMeter() {
  const { data, controls, connectAudioStream } = useAudioMeter({
    updateFrequency: 50,  // Update every 50ms (default: 100ms)
    onClipping: () => {
      console.warn('Audio is clipping!');
      // Trigger alert or UI notification
    },
  });

  useEffect(() => {
    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        await connectAudioStream(stream);
      } catch (error) {
        console.error('Mic access denied:', error);
      }
    };

    initMic();
  }, [connectAudioStream]);

  return (
    <div>
      <h2>Live Stream Audio Meters</h2>
      
      <div className="meter-group">
        {data.channels.map((channel) => (
          <ChannelMeter
            key={channel.id}
            channel={channel}
            onMute={() => controls.toggleChannelMute(channel.id)}
            onSolo={() => controls.toggleChannelSolo(channel.id)}
            onVolumeChange={(vol) => controls.setChannelVolume(channel.id, vol)}
          />
        ))}
      </div>

      <MasterMeter
        peak={data.master}
        rms={data.rms}
        isClipping={data.isClipping}
        onVolumeChange={controls.setMasterVolume}
        onResetPeaks={controls.resetPeaks}
      />

      <div>
        Audio API Available: {data.audioContextAvailable ? 'Yes' : 'No (using mock data)'}
      </div>
    </div>
  );
}
```

### Custom Channel Configuration

```typescript
const { data, controls } = useAudioMeter({
  channels: [
    { id: 'host', name: 'Host' },
    { id: 'guest1', name: 'Guest 1' },
    { id: 'guest2', name: 'Guest 2' },
    { id: 'music', name: 'Background Music' },
  ],
});
```

## API Reference

### `useAudioMeter(options?)`

#### Parameters

```typescript
interface Options {
  updateFrequency?: number;        // Update interval in ms (default: 100)
  onClipping?: () => void;         // Callback when clipping occurs
  channels?: Channel[];            // Custom channel configuration
}

interface Channel {
  id: string;
  name: string;
}
```

#### Returns

```typescript
interface UseAudioMeterReturn {
  data: AudioMeterData;
  controls: AudioMeterControls;
  initializeAudioContext: () => Promise<void>;
  connectAudioStream: (stream: MediaStream) => Promise<void>;
}
```

### `AudioMeterData`

```typescript
interface AudioMeterData {
  channels: ChannelMeter[];         // Per-channel meter data
  master: number;                   // Master peak in dB
  rms: number;                      // Master RMS in dB
  isClipping: boolean;              // True if any channel clips
  audioContextAvailable: boolean;   // Web Audio API available
  isPlaying: boolean;               // Audio stream active
}

interface ChannelMeter {
  id: string;
  name: string;
  peak: number;                     // Peak level in dB (-60 to +6)
  rms: number;                      // RMS level in dB (-60 to 0)
  isClipping: boolean;              // True if peak >= 0 dB
  muted: boolean;
  solo: boolean;
  volume: number;                   // 0 to 1
}
```

### `AudioMeterControls`

```typescript
interface AudioMeterControls {
  // Reset peak levels to -60 dB
  resetPeaks: () => void;

  // Toggle mute state for a channel
  toggleChannelMute: (channelId: string) => void;

  // Toggle solo state (mutes all other channels)
  toggleChannelSolo: (channelId: string) => void;

  // Set channel volume (0 to 1)
  setChannelVolume: (channelId: string, volume: number) => void;

  // Set master volume (0 to 1)
  setMasterVolume: (volume: number) => void;
}
```

## dBFS Scale

Audio levels are reported in **dBFS** (decibels relative to full scale):

- **0 dB** = Maximum digital level (clipping starts here)
- **-6 dB** = 75% of max (-3dB headroom is common)
- **-20 dB** = Normal conversation level
- **-60 dB** = Silent/no audio
- **Values below -60 dB** are clamped to -60 dB

## Clipping Detection

The hook detects clipping in two ways:

1. **Per-channel**: `channel.isClipping` is true when `channel.peak >= 0 dB`
2. **Master**: `data.isClipping` is true if any channel clips
3. **Callback**: Optional `onClipping` callback fires when clipping state changes to true

```typescript
const { data, controls } = useAudioMeter({
  onClipping: () => {
    // Audio is clipping - trigger UI warning or automated volume reduction
    console.warn('Audio is clipping! Reduce volume.');
  },
});
```

## Mock Data

When Web Audio API is unavailable, the hook generates realistic mock data with:

- **Subtle variations**: Simulates natural audio level fluctuations
- **Per-channel uniqueness**: Each channel has independent patterns
- **Smooth transitions**: Sine wave oscillation for natural feel
- **Randomization**: +/- 2dB variance for realism

Mock data is automatically used when:

- Browser doesn't support Web Audio API (e.g., old Safari)
- No audio stream is connected
- `audioContextAvailable` is `false`

To force mock mode for testing:

```typescript
// Just don't call connectAudioStream()
const { data } = useAudioMeter();
// data will show mock values
```

## Performance Considerations

- **Update Frequency**: Default 100ms. Use 50ms for UI with >60fps refresh, 200ms for less-sensitive displays
- **Memory**: Analyser nodes are created once and reused
- **CPU**: Peak calculation is efficient (O(n) per channel), uses requestAnimationFrame for smooth updates
- **Browser**: Web Audio API is hardware-accelerated on most browsers

## Error Handling

The hook handles errors gracefully:

1. **No Web Audio API**: Falls back to mock data with warning
2. **Microphone access denied**: Continues with mock data
3. **Audio context suspended**: Auto-resumes on user interaction
4. **Analyser node failures**: Skipped channels report -60 dB

All errors are logged to console but don't crash the component.

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 14+ | ✅ Full |
| Firefox 25+ | ✅ Full |
| Safari 14+ | ✅ Full (with webkit prefix) |
| Edge 79+ | ✅ Full |
| Mobile Safari | ✅ Full (iOS 14.5+) |
| Chrome Android | ✅ Full |

## Example: Full Featured Meter UI

```typescript
import { useAudioMeter } from '@/hooks/audio';

export function AudioMeterPanel() {
  const { data, controls } = useAudioMeter({
    updateFrequency: 50,
    onClipping: () => {
      // Play alert sound or flash UI
    },
  });

  return (
    <div className="audio-meter-panel">
      {/* Master Meter */}
      <div className="master-section">
        <div className="level-display">
          <span>Master</span>
          <span className={data.isClipping ? 'clipping' : ''}>
            {data.master.toFixed(1)} dB
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          onChange={(e) => controls.setMasterVolume(Number(e.target.value))}
        />
        <button onClick={controls.resetPeaks}>Reset</button>
      </div>

      {/* Channel Meters */}
      <div className="channels-section">
        {data.channels.map((channel) => (
          <div key={channel.id} className="channel">
            <div className="channel-header">
              <span>{channel.name}</span>
              <div className="channel-controls">
                <button
                  onClick={() => controls.toggleChannelMute(channel.id)}
                  className={channel.muted ? 'active' : ''}
                >
                  M
                </button>
                <button
                  onClick={() => controls.toggleChannelSolo(channel.id)}
                  className={channel.solo ? 'active' : ''}
                >
                  S
                </button>
              </div>
            </div>
            <div className="meter-bar">
              <div
                className={`level ${channel.isClipping ? 'clipping' : ''}`}
                style={{
                  width: `${((channel.peak + 60) / 66) * 100}%`,
                }}
              />
            </div>
            <div className="meter-label">
              {channel.peak.toFixed(1)} dB / {channel.rms.toFixed(1)} dB RMS
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="status">
        <span>
          {data.audioContextAvailable ? '🎙️ Audio API' : '📊 Mock Data'}
        </span>
        <span>{data.isClipping ? '🔴 CLIPPING' : '🟢 OK'}</span>
      </div>
    </div>
  );
}
```

## Testing

Test the hook with mock data by not connecting a microphone:

```typescript
import { render, screen } from '@testing-library/react';
import { useAudioMeter } from '@/hooks/audio';

function TestComponent() {
  const { data } = useAudioMeter();
  return <div>{data.master.toFixed(1)}</div>;
}

test('displays mock meter data', () => {
  render(<TestComponent />);
  const display = screen.getByText(/dB/);
  expect(display).toBeInTheDocument();
});
```

## Troubleshooting

**Issue**: Mock data not animating
- Check `updateFrequency` is set to a reasonable value (50-200ms)
- Verify component is mounted and re-rendering

**Issue**: Web Audio API not connecting
- Ensure https:// (required for microphone access)
- Check browser console for permission errors
- Verify microphone is available and not in use elsewhere

**Issue**: Clipping callback fires too often
- Increase `updateFrequency` to reduce sensitivity
- Add debouncing logic in your callback
- Set a clipping threshold (e.g., only alert if > -3dB)

**Issue**: Memory leaks on unmount
- Hook handles cleanup automatically
- Verify component properly unmounts on route changes
- Check browser DevTools for dangling AudioContext references

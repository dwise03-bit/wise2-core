# Audio Mixer Quick Start Guide

Get streaming audio mixing up and running in minutes.

## 1-Minute Setup

### Basic Component Usage

```typescript
import { useStreamingAudioMixer } from '@/hooks/useStreamingAudioMixer';
import { AudioMixer } from '@/components/LiveStudio/AudioMixer';

function MyStreamingPage() {
  const mixer = useStreamingAudioMixer();

  return (
    <AudioMixer
      channels={mixer.channels}
      masterVolume={mixer.masterVolume}
      masterPeakLevel={mixer.masterMetering.peakLevel}
      masterRmsLevel={mixer.masterMetering.rmsLevel}
      onChannelVolumeChange={mixer.setSourceVolume}
      onChannelPanChange={mixer.setSourcePan}
      onChannelMuteToggle={mixer.setSourceMute}
      onMasterVolumeChange={mixer.setMasterVolume}
    />
  );
}
```

## 5-Minute Setup

### Complete Mixer with All Features

```typescript
import { useStreamingAudioMixer } from '@/hooks/useStreamingAudioMixer';
import { AudioMixer } from '@/components/LiveStudio/AudioMixer';
import { MasterChannel } from '@/components/LiveStudio/MasterChannel';

function StreamingControl() {
  const mixer = useStreamingAudioMixer();
  const [isLive, setIsLive] = useState(false);

  const goLive = async () => {
    const success = await mixer.connectToStream(
      'rtmp://your-server.com/live',
      'your-stream-key'
    );
    if (success) {
      setIsLive(true);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Channel Strips */}
      <div className="flex-1">
        <AudioMixer
          channels={mixer.channels}
          masterVolume={mixer.masterVolume}
          masterPeakLevel={mixer.masterMetering.peakLevel}
          masterRmsLevel={mixer.masterMetering.rmsLevel}
          masterIsClipping={mixer.masterMetering.isClipping}
          onChannelVolumeChange={mixer.setSourceVolume}
          onChannelPanChange={mixer.setSourcePan}
          onChannelMuteToggle={mixer.setSourceMute}
          onMasterVolumeChange={mixer.setMasterVolume}
        />
      </div>

      {/* Master Controls */}
      <div className="w-64">
        <MasterChannel
          masterVolume={mixer.masterVolume}
          masterPeakLevel={mixer.masterMetering.peakLevel}
          masterRmsLevel={mixer.masterMetering.rmsLevel}
          isClipping={mixer.masterMetering.isClipping}
          onVolumeChange={mixer.setMasterVolume}
        />

        {/* Go Live Button */}
        <button
          onClick={goLive}
          disabled={isLive}
          className={`mt-4 w-full px-4 py-2 rounded font-bold text-white ${
            isLive
              ? 'bg-red-600 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLive ? '🔴 LIVE' : 'Go Live'}
        </button>
      </div>
    </div>
  );
}
```

## Adding Audio Sources

### Add Microphone

```typescript
const { addMicrophoneSource } = mixer;

// Add and start using immediately
const success = await addMicrophoneSource();
if (success) {
  console.log('Microphone ready');
  // Microphone channel will appear in mixer.channels
}
```

### Add System Audio

```typescript
const { addSystemAudioSource } = mixer;

// Capture screen audio
const success = await addSystemAudioSource();
if (success) {
  console.log('System audio captured');
}
```

### Add Suno Track

```typescript
const { addSunoTrackSource, setSourceVolume } = mixer;

// Add AI-generated track
const success = await addSunoTrackSource(
  'https://suno-api.com/audio/track-123.mp3'
);

if (success) {
  // Find the new source ID (will be 'suno-...')
  // Set its volume
  mixer.channels.forEach((ch) => {
    if (ch.type === 'suno') {
      setSourceVolume(ch.id, -6);
    }
  });
}
```

### Add Media File

```typescript
const { addMediaSource, setSourceVolume } = mixer;

// Create audio element
const audio = new Audio('path/to/audio.mp3');
const sourceAdded = addMediaSource(audio, 'my-audio');

if (sourceAdded) {
  setSourceVolume('media-...', -6);
  audio.play();
}
```

## Common Tasks

### Mute a Source

```typescript
const { setSourceMute } = mixer;

// Mute microphone
setSourceMute('mic-1', true);

// Unmute
setSourceMute('mic-1', false);
```

### Control Volume

```typescript
const { setSourceVolume } = mixer;

// Set to -6dB (good default)
setSourceVolume('mic-1', -6);

// Set to -12dB (quieter)
setSourceVolume('mic-1', -12);

// Set to 0dB (max volume - careful!)
setSourceVolume('mic-1', 0);
```

### Pan Stereo

```typescript
const { setSourcePan } = mixer;

// Center (default)
setSourcePan('mic-1', 0);

// Hard left
setSourcePan('mic-1', -1);

// Hard right
setSourcePan('mic-1', 1);

// Slightly right (70%)
setSourcePan('mic-1', 0.7);
```

### Fix A/V Sync Issues

```typescript
const { setAudioDelay } = mixer;

// Audio is 100ms behind video
setAudioDelay('mic-1', 100);

// Audio is 50ms ahead of video
setAudioDelay('mic-1', -50);

// Clear delay
setAudioDelay('mic-1', 0);
```

### Remove Audio Source

```typescript
const { removeSource } = mixer;

// Remove specific source
removeSource('mic-1');

// Or from UI, channel strip has close button
```

## Streaming

### Connect to Stream

```typescript
const { connectToStream } = mixer;

// Connect to RTMP server
const success = await connectToStream(
  'rtmp://stream.youtube.com/live2',  // Server URL
  'xxxx-xxxx-xxxx-xxxx'                // Stream key
);

if (success) {
  console.log('Live now!');
}
```

### Disconnect Stream

```typescript
const { disconnectStream } = mixer;

disconnectStream();
```

### Check Stream Status

```typescript
const { isStreamConnected } = mixer;

if (isStreamConnected()) {
  console.log('Currently streaming');
} else {
  console.log('Not streaming');
}
```

## Monitoring

### Watch Metering

```typescript
const { masterMetering } = mixer;

// Master meters are real-time
console.log(masterMetering.peakLevel);     // -6.5 dB
console.log(masterMetering.rmsLevel);      // -12.3 dB
console.log(masterMetering.headroom);      // 12.5 dB
console.log(masterMetering.isClipping);    // true/false
```

### Watch Individual Channels

```typescript
const { channels } = mixer;

channels.forEach((channel) => {
  console.log(`${channel.name}:`);
  console.log(`  Volume: ${channel.volume} dB`);
  console.log(`  Peak: ${channel.peakLevel} dB`);
  console.log(`  Clipping: ${channel.isClipping}`);
  console.log(`  Muted: ${channel.isMuted}`);
});
```

## Complete Example

```typescript
'use client';

import { useStreamingAudioMixer } from '@/hooks/useStreamingAudioMixer';
import { AudioMixer } from '@/components/LiveStudio/AudioMixer';
import { MasterChannel } from '@/components/LiveStudio/MasterChannel';
import { useState } from 'react';

export default function StreamingPage() {
  const mixer = useStreamingAudioMixer();
  const [isLive, setIsLive] = useState(false);

  const handleGoLive = async () => {
    // Add microphone
    await mixer.addMicrophoneSource();

    // Set volume to safe level
    mixer.channels.forEach((ch) => {
      if (ch.type === 'microphone') {
        mixer.setSourceVolume(ch.id, -6);
      }
    });

    // Connect to stream
    const success = await mixer.connectToStream(
      'rtmp://your-server.com/live',
      'your-key'
    );

    if (success) {
      setIsLive(true);
    }
  };

  const handleStopStreaming = () => {
    mixer.disconnectStream();
    setIsLive(false);
  };

  return (
    <div className="p-4 h-screen bg-gray-950">
      <h1 className="text-2xl font-bold text-white mb-4">Live Stream</h1>

      <div className="grid grid-cols-3 gap-4 h-[calc(100%-60px)]">
        {/* Mixer */}
        <div className="col-span-2 bg-gray-900 rounded border border-gray-700 overflow-hidden">
          <AudioMixer
            channels={mixer.channels}
            masterVolume={mixer.masterVolume}
            masterPeakLevel={mixer.masterMetering.peakLevel}
            masterRmsLevel={mixer.masterMetering.rmsLevel}
            masterIsClipping={mixer.masterMetering.isClipping}
            onChannelVolumeChange={mixer.setSourceVolume}
            onChannelPanChange={mixer.setSourcePan}
            onChannelMuteToggle={mixer.setSourceMute}
            onMasterVolumeChange={mixer.setMasterVolume}
          />
        </div>

        {/* Controls */}
        <div className="bg-gray-900 rounded border border-gray-700 p-4 flex flex-col">
          <MasterChannel
            masterVolume={mixer.masterVolume}
            masterPeakLevel={mixer.masterMetering.peakLevel}
            masterRmsLevel={mixer.masterMetering.rmsLevel}
            isClipping={mixer.masterMetering.isClipping}
            onVolumeChange={mixer.setMasterVolume}
          />

          <div className="mt-4 space-y-2">
            <button
              onClick={async () => await mixer.addMicrophoneSource()}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded"
            >
              Add Microphone
            </button>

            {!isLive ? (
              <button
                onClick={handleGoLive}
                className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded"
              >
                Go Live
              </button>
            ) : (
              <button
                onClick={handleStopStreaming}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded animate-pulse"
              >
                Stop Streaming
              </button>
            )}
          </div>

          {mixer.masterMetering.isClipping && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded text-red-400 text-xs">
              ⚠️ Clipping detected! Reduce volume.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Typical Streaming Setup

### 1. User Interaction
```typescript
// Step 1: Initialize (happens automatically with hook)
// Step 2: Add sources when user clicks buttons
// Step 3: User adjusts levels in mixer UI
// Step 4: User clicks "Go Live"
// Step 5: Audio streams to RTMP server
```

### 2. Volume Levels (Starting Point)

Set these levels and adjust from there:

| Source | Default | Range |
|--------|---------|-------|
| Microphone | -6dB | -12dB to 0dB |
| System Audio | -3dB | -12dB to 0dB |
| Suno Tracks | -6dB | -12dB to 0dB |
| Sound Lab | -6dB | -12dB to 0dB |
| Master | -6dB | -12dB to 0dB |

### 3. Before Going Live

```typescript
// Check these before streaming
- All sources added and at safe volume (-6dB or lower)
- No clipping indicators (red peak meters)
- Headroom above 3dB
- Audio levels showing in meters
- Stream URL and key configured
- Test microphone audio
```

## Troubleshooting

### No Sound Output

```typescript
// 1. Check if sources are muted
mixer.channels.forEach((ch) => {
  if (ch.isMuted) {
    mixer.setSourceMute(ch.id, false);
  }
});

// 2. Check master volume
mixer.setMasterVolume(-6);

// 3. Check browser permissions
// Browser should have microphone permission
```

### Clipping (Distortion)

```typescript
// Reduce all volumes by half
mixer.channels.forEach((ch) => {
  mixer.setSourceVolume(ch.id, ch.volume - 6);
});

// Then reduce master
mixer.setMasterVolume(mixer.masterVolume - 3);
```

### Stream Won't Connect

```typescript
// Check URL format
// rtmp://server.com/app/streamkey (most services)

// Verify stream key is correct
// Check network connectivity
// Try direct RTMP server address instead of vanity domain
```

### A/V Out of Sync

```typescript
// Add delay to audio
mixer.setAudioDelay('mic-1', 100); // Audio 100ms behind

// Or remove delay
mixer.setAudioDelay('mic-1', -50); // Audio 50ms ahead

// Test and adjust until sync is perfect
```

## Best Practices

1. **Always start quiet** (-12dB) and turn up gradually
2. **Watch the meters** - Red = too loud
3. **Leave headroom** - Keep master below -3dB
4. **Test before streaming** - Do a 30-second test
5. **Monitor while streaming** - Check levels continuously
6. **Have a backup plan** - Know how to quickly disconnect

## Next: Advanced Features

- Add EQ and compression filters
- Save mixer presets
- Record mixed audio locally
- Monitor stream quality
- Set up audio automation

See `AUDIO_MIXER_README.md` for full documentation.

---

**Ready to go live? Start with the 5-minute setup above!**

# Audio Export System

Professional audio export engine for WISE² Studio with support for multiple codecs, loudness normalization, and batch export.

## Features

- **Multiple Codec Support**: MP3, WAV, FLAC, ALAC, Opus, OGG Vorbis, AAC
- **Professional Loudness Management**: ITU-R BS.1770 loudness measurement and normalization
- **Streaming Standards**: Built-in presets for Spotify, YouTube, Apple Music, TIDAL, SoundCloud, Broadcast, Podcasts
- **Batch Export**: Export to multiple formats in one operation
- **Quality Presets**: Predefined quality settings for each codec
- **True Peak Metering**: Prevent excessive clipping with true peak limiting
- **File Size Estimation**: Accurate file size predictions before export
- **Progress Tracking**: Real-time export progress callbacks
- **Browser Compatibility**: Cross-browser support with fallbacks

## Architecture

### Modules

1. **Codecs.ts** - Audio codec definitions and configurations
2. **Loudness.ts** - LUFS measurement and normalization engine
3. **ExportEngine.ts** - Core audio rendering and mixing
4. **ExportDialog.tsx** - Professional React UI component
5. **index.ts** - Barrel exports

## Quick Start

### Basic Export

```typescript
import { ExportEngine } from '@/lib/audioExport';

const audioContext = new AudioContext();
const exportEngine = new ExportEngine(audioContext);

// Prepare tracks
const tracks = [
  {
    id: 'track-1',
    name: 'Vocal',
    buffer: audioBuffer1,
    volume: 0.8,
    pan: 0,
    muted: false,
    startTime: 0,
    enabled: true,
  },
  {
    id: 'track-2',
    name: 'Background',
    buffer: audioBuffer2,
    volume: 0.5,
    pan: 0.2,
    muted: false,
    startTime: 0,
    enabled: true,
  },
];

// Export with normalization
const result = await exportEngine.export(
  tracks,
  duration,
  { codec: 'wav' },
  { targetLoudness: -14 }, // Spotify standard
  'my-song.wav'
);

if (result.success) {
  exportEngine.downloadBlob(result.blob!, result.filename);
}
```

### Batch Export

```typescript
// Export to multiple formats at once
const results = await exportEngine.batchExport(
  tracks,
  duration,
  [
    { codec: 'wav', bitDepth: 24, sampleRate: 48000 },
    { codec: 'mp3', bitrate: 192 },
    { codec: 'aac', bitrate: 256 },
  ],
  'my-song',
  { targetLoudness: -14 }
);

// Download all results
for (const result of results) {
  if (result.success) {
    exportEngine.downloadBlob(result.blob!, result.filename);
  }
}
```

### Using the UI Component

```typescript
import { ExportDialog } from '@/components/ExportDialog';

function App() {
  const [isExportOpen, setIsExportOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsExportOpen(true)}>
        Export
      </button>

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tracks={tracks}
        duration={duration}
        projectTitle="My Song"
        audioContext={audioContext}
        onExportComplete={(results) => {
          console.log('Export complete:', results);
        }}
      />
    </>
  );
}
```

## Codec Support

### Lossless Formats

| Codec | Container | Bit Depth | Sample Rate | Use Case |
|-------|-----------|-----------|-------------|----------|
| WAV   | .wav      | 16/24/32  | 44.1-192kHz | Professional archival, broadcast |
| FLAC  | .flac     | 16/24     | 44.1-192kHz | Lossless streaming, archival |
| ALAC  | .m4a      | 16/24     | 44.1-96kHz  | Apple ecosystem, iTunes |

### Lossy Formats

| Codec | Container | Bitrate Range | Use Case |
|-------|-----------|---------------|----------|
| MP3   | .mp3      | 128-320 kbps  | Maximum compatibility, web |
| AAC   | .m4a      | 32-320 kbps   | iTunes, modern streaming |
| Opus  | .opus     | 16-510 kbps   | Efficient streaming, voice |
| OGG   | .ogg      | 45-320 kbps   | Open format, streaming |

## Loudness Standards

The system includes presets for major streaming platforms:

```typescript
import { LOUDNESS_STANDARDS } from '@/lib/audioExport';

// Spotify: -14 LUFS
// YouTube: -14 LUFS
// Apple Music: -16 LUFS
// Amazon Music: -14 LUFS
// TIDAL: -14 LUFS
// SoundCloud: -14 LUFS
// Broadcast (EBU R128): -23 LUFS
// Podcast: -16 LUFS
```

### Loudness Measurement

```typescript
import { analyzeLoudness, generateLoudnessReport } from '@/lib/audioExport';

const measurement = analyzeLoudness(audioBuffer);
console.log(`Integrated Loudness: ${measurement.integratedLoudness} LUFS`);
console.log(`True Peak: ${measurement.truePeak} dBFS`);
console.log(`Loudness Range: ${measurement.loudnessRange} LRA`);

// Generate detailed report
console.log(generateLoudnessReport(measurement));
```

## API Reference

### ExportEngine

```typescript
class ExportEngine {
  // Render multiple tracks into mixed audio buffer
  renderTracks(
    tracks: AudioTrack[],
    duration: number,
    taskId: string
  ): Promise<AudioBuffer>;

  // Normalize buffer to target loudness
  normalizeBuffer(
    buffer: AudioBuffer,
    options: LoudnessNormalizationOptions,
    taskId: string
  ): Promise<NormalizationResult>;

  // Export to single format
  export(
    tracks: AudioTrack[],
    duration: number,
    format: ExportFormat,
    options?: LoudnessNormalizationOptions,
    filename?: string
  ): Promise<ExportResult>;

  // Export to multiple formats
  batchExport(
    tracks: AudioTrack[],
    duration: number,
    formats: ExportFormat[],
    baseFilename?: string,
    options?: LoudnessNormalizationOptions
  ): Promise<ExportResult[]>;

  // Download blob to client
  downloadBlob(blob: Blob, filename: string): void;

  // Register progress callback
  onProgress(
    taskId: string,
    callback: (progress: ExportProgress) => void
  ): void;

  // Get export status
  getExportStatus(taskId: string): ExportProgress | undefined;
}
```

### Codec Functions

```typescript
// Estimate file size
estimateFileSize(format: ExportFormat, durationSeconds: number): number;

// Get browser support info
getCodecBrowserSupport(codec: AudioCodec): SupportInfo;

// Get recommended codec for use case
getRecommendedCodec(useCase: 'streaming' | 'archival' | 'broadcast' | 'social'): AudioCodec;

// Convert quality to bitrate
qualityToBitrate(codec: AudioCodec, quality: number): number;

// Convert bitrate to quality
bitrateToQuality(codec: AudioCodec, bitrate: number): number;
```

### Loudness Functions

```typescript
// Measure integrated loudness (LUFS)
measureIntegratedLoudness(audioBuffer: AudioBuffer): number;

// Measure true peak (dBFS)
measureTruePeak(audioBuffer: AudioBuffer): number;

// Measure loudness range (LRA)
measureLoudnessRange(audioBuffer: AudioBuffer): number;

// Complete analysis
analyzeLoudness(audioBuffer: AudioBuffer): LoudnessMeasurement;

// Calculate normalization gain
calculateNormalizationGain(currentLoudness: number, targetLoudness: number): number;

// Normalize to target
normalizeToTarget(
  audioBuffer: AudioBuffer,
  options?: LoudnessNormalizationOptions
): NormalizationResult;

// Generate report
generateLoudnessReport(measurement: LoudnessMeasurement): string;
```

## Export Dialog Props

```typescript
interface ExportDialogProps {
  // Whether dialog is open
  isOpen: boolean;
  // Close handler
  onClose: () => void;
  // Audio tracks to export
  tracks: AudioTrack[];
  // Project duration in seconds
  duration: number;
  // Project title for filename
  projectTitle?: string;
  // Completion callback
  onExportComplete?: (results: ExportResult[]) => void;
  // Audio context instance
  audioContext: AudioContext;
}
```

## Advanced Usage

### Custom Loudness Normalization

```typescript
import { normalizeToTarget } from '@/lib/audioExport';

// Normalize to Apple Music standard (-16 LUFS)
const result = normalizeToTarget(audioBuffer, {
  targetLoudness: -16,
  maxTruePeak: -1,
  allowClipping: false, // Soft clipping if peak exceeds limit
});

console.log(`Applied gain: ${result.gain} dB`);
console.log(`Measurement:`, result.measurement);
```

### Progress Tracking

```typescript
const engine = new ExportEngine(audioContext);

engine.onProgress('export-1', (progress) => {
  console.log(`${progress.status}: ${progress.progress}%`);
  if (progress.status === 'rendering') {
    console.log(`Processing track ${progress.currentTrack}/${progress.totalTracks}`);
  }
  if (progress.measurement) {
    console.log(`Loudness: ${progress.measurement.integratedLoudness} LUFS`);
  }
});

const result = await engine.export(tracks, duration, format);
```

### Multi-Channel Track Support

```typescript
// Tracks can have different numbers of channels
const monoTrack: AudioTrack = {
  buffer: monoBuffer, // 1 channel
  // ... other properties
};

const stereoTrack: AudioTrack = {
  buffer: stereoBuffer, // 2 channels
  // ... other properties
};

// Engine automatically pans mono to stereo position
```

## Performance Considerations

1. **Memory Usage**: Large audio buffers are pooled and reused
2. **Real-time Constraints**: Rendering happens offline, not in real-time
3. **Browser Optimization**: Uses native Web Audio API for efficiency
4. **Soft Clipping**: Applied to prevent harsh digital clipping
5. **File Size Prediction**: Accurate without actual encoding overhead

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support (except AAC/ALAC encoding)
- Safari: Full support
- Mobile browsers: Full support with file download limitations

## Limitations

1. **Encoding**: Currently renders to WAV; other formats require external encoders (mp3enc, ffmpeg, etc.)
2. **Real-time Encoding**: Batch operations render sequentially, not in parallel
3. **True Peak**: Uses peak sample value; true inter-sample peak calculation would require upsampling
4. **Effects**: Track effects simplified; use EffectChain from audioEffects module for advanced processing

## Future Enhancements

- [ ] WebAssembly encoders for MP3, FLAC, AAC, Opus
- [ ] Parallel rendering for multi-track projects
- [ ] Advanced metering displays (waveform, spectrum, loudness graph)
- [ ] Metadata embedding (ID3, Vorbis comments)
- [ ] ReplayGain calculation
- [ ] Audio fingerprinting
- [ ] Cloud export options
- [ ] Integration with distribution services

## Contributing

When adding new codecs or features:

1. Update CODEC_CONFIGS in Codecs.ts
2. Add quality presets if applicable
3. Update browser support detection
4. Add tests for loudness measurements
5. Update this README

## References

- ITU-R BS.1770-4: Loudness normalisation and permitted maximum level of audio signals
- LUFS vs PEAK: https://en.wikipedia.org/wiki/Loudness_unit_relative_to_full_scale
- Streaming Platform Standards: https://www.youtube.com/watch?v=4SEHoDiE64c

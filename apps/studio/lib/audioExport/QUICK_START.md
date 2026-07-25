# Audio Export System - Quick Start

30-second setup for WISE² Studio audio export.

## 1. Add Export Button to Your App

```typescript
import { useState } from 'react';
import { ExportDialog } from '@/components/ExportDialog';

export function MyStudio() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  
  // ... your studio setup code ...

  return (
    <>
      <button 
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
        onClick={() => setIsExportOpen(true)}
      >
        Export
      </button>

      <ExportDialog
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tracks={yourTracks}        // Array of AudioTrack
        duration={projectDuration} // Number in seconds
        projectTitle="My Song"
        audioContext={audioContext}
        onExportComplete={(results) => {
          console.log('Exported:', results);
        }}
      />
    </>
  );
}
```

## 2. Define Your Tracks

```typescript
import { AudioTrack } from '@/lib/audioExport';

const tracks: AudioTrack[] = [
  {
    id: 'vocal',
    name: 'Vocal',
    buffer: vocalAudioBuffer,      // AudioBuffer from Web Audio
    volume: 0.8,                   // 0-1
    pan: -0.1,                     // -1 (left) to 1 (right)
    muted: false,
    startTime: 0,                  // Seconds
    enabled: true,
  },
  {
    id: 'beats',
    name: 'Drums',
    buffer: beatsAudioBuffer,
    volume: 0.9,
    pan: 0,
    muted: false,
    startTime: 0,
    enabled: true,
  },
];
```

## 3. (Optional) Use Hook for Custom UI

```typescript
import { useAudioExport } from '@/hooks/audio/useAudioExport';

function MyExportPanel() {
  const {
    isExporting,
    progress,
    status,
    error,
    exportSingle,
    downloadAll,
    measurement,
  } = useAudioExport({
    audioContext: yourAudioContext,
    tracks: yourTracks,
    duration: yourDuration,
    projectTitle: 'My Song',
  });

  return (
    <div className="space-y-4">
      {/* Progress */}
      {isExporting && (
        <div>
          <div className="text-sm text-gray-500">{status}: {progress}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Loudness Info */}
      {measurement && (
        <div className="text-sm text-gray-600">
          Loudness: {measurement.integratedLoudness.toFixed(2)} LUFS
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => exportSingle({ codec: 'mp3', bitrate: 192 })}
          disabled={isExporting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Export MP3
        </button>
        <button 
          onClick={() => exportSingle({ codec: 'wav', bitDepth: 24 })}
          disabled={isExporting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Export WAV
        </button>
      </div>

      {/* Errors */}
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  );
}
```

## Features at a Glance

### ✅ Supported Formats
- WAV (16/24/32-bit, up to 192kHz)
- MP3 (128-320 kbps)
- FLAC (16/24-bit lossless)
- ALAC (Apple lossless)
- Opus (16-510 kbps, ultra-efficient)
- OGG Vorbis (45-320 kbps)
- AAC (32-320 kbps, iTunes)

### ✅ Loudness Management
- Auto-normalize to streaming standards
- Spotify: -14 LUFS
- YouTube: -14 LUFS
- Apple Music: -16 LUFS
- Podcast: -16 LUFS
- Broadcast (EBU): -23 LUFS
- Custom LUFS targets

### ✅ Mixing Features
- Multi-track rendering
- Volume control per track
- Stereo panning
- Track time offset (start times)
- Soft clipping to prevent distortion
- Real-time progress tracking

### ✅ Batch Export
- Export to multiple formats in one click
- Automatic file naming
- Individual downloads

### ✅ Quality Presets
- Pre-configured for each codec
- Easy quality/bitrate control
- File size estimation

## Common Tasks

### Export Default (WAV at full quality)
```typescript
await exportSingle({ codec: 'wav', bitDepth: 24, sampleRate: 48000 });
```

### Export for Streaming (Spotify, YouTube)
```typescript
await exportSingle(
  { codec: 'mp3', bitrate: 192 },
  'my-song.mp3',
  { targetLoudness: -14 }
);
```

### Export for iTunes
```typescript
await exportSingle(
  { codec: 'aac', bitrate: 256 },
  'my-song.m4a',
  { targetLoudness: -16 }
);
```

### Export Multiple Formats
```typescript
await exportBatch([
  { codec: 'wav', bitDepth: 24 },        // Backup
  { codec: 'mp3', bitrate: 192 },        // Web
  { codec: 'aac', bitrate: 256 },        // iTunes
  { codec: 'flac', bitDepth: 24 },       // Archive
]);
```

### Measure Loudness Only (No Export)
```typescript
import { analyzeLoudness } from '@/lib/audioExport';

const measurement = analyzeLoudness(audioBuffer);
console.log(`Loudness: ${measurement.integratedLoudness} LUFS`);
console.log(`Peak: ${measurement.truePeak} dBFS`);
```

## Troubleshooting

### Q: Export button not working
**A**: Check that:
- Audio buffers are valid (not null/undefined)
- Duration > 0
- At least one track has enabled=true
- AudioContext is initialized

### Q: Loudness not normalizing
**A**: Ensure ExportDialog has `normalizeEnabled` checked, or pass normalizationOptions to exportSingle:
```typescript
await exportSingle(format, 'file.mp3', { targetLoudness: -14 });
```

### Q: File too large
**A**: Use lossy formats and lower bitrates:
- MP3: 128 kbps (small), 192 kbps (standard), 320 kbps (high)
- AAC: Similar bitrate behavior
- WAV: Lossless but large (use only for archival)

### Q: Progress not showing
**A**: Register callback before export:
```typescript
engine.onProgress(taskId, (progress) => {
  setState(prev => ({ ...prev, progress: progress.progress }));
});
```

## Next Steps

1. **Dialog Import** → Add ExportDialog to your studio page
2. **Test Export** → Try exporting a simple audio clip
3. **Customize** → Adjust styling to match WISE² design
4. **Integrate Hooks** → Replace dialog with custom UI if needed
5. **Production** → Deploy with your app

## API Cheat Sheet

```typescript
// UI Component
<ExportDialog isOpen onClose tracks duration audioContext />

// React Hook
const { exportSingle, exportBatch, progress, ... } = useAudioExport(options);

// Direct Engine
const engine = new ExportEngine(audioContext);
await engine.export(tracks, duration, format, normalizationOptions);

// Loudness
const measurement = analyzeLoudness(buffer);
const normalized = normalizeToTarget(buffer, { targetLoudness: -14 });

// Codecs
const size = estimateFileSize(format, duration);
const codec = getRecommendedCodec('streaming'); // 'aac'
```

## File Locations

```
/lib/audioExport/
  ├── Codecs.ts              # Codec configs & utilities
  ├── Loudness.ts            # LUFS measurement & normalization  
  ├── ExportEngine.ts        # Core export engine
  ├── index.ts               # Exports
  ├── README.md              # Full API documentation
  ├── QUICK_START.md         # This file
  ├── INTEGRATION.md         # Integration guide
  ├── examples.ts            # 10 code examples

/components/
  └── ExportDialog.tsx       # UI component (ready to use)

/hooks/audio/
  └── useAudioExport.ts      # React hooks
```

## Support

- API Docs: See README.md
- Examples: See examples.ts  
- Integration: See INTEGRATION.md
- Questions: Review the examples for your use case

---

**Ready to export!** Start with the ExportDialog component above. 🚀

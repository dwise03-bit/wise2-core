# AI Music Generator - Usage Examples

## Basic Setup

### Importing the Component

```typescript
'use client';

import { AIMusicGeneratorEnhanced } from '@/components/AIMusicGeneratorEnhanced';

export function MusicStudio() {
  return (
    <div className="h-screen">
      <AIMusicGeneratorEnhanced />
    </div>
  );
}
```

### With Custom Layout

```typescript
'use client';

import { AIMusicGeneratorEnhanced } from '@/components/AIMusicGeneratorEnhanced';

export function MusicStudioPage() {
  return (
    <div className="flex h-screen gap-4 p-4 bg-wise-background">
      <div className="flex-1">
        <AIMusicGeneratorEnhanced />
      </div>
      <aside className="w-64 bg-wise-surface rounded-lg p-4">
        <h2 className="font-bold mb-4">Studio Tools</h2>
        {/* Additional sidebar content */}
      </aside>
    </div>
  );
}
```

## Hook Usage (Advanced)

### Using useAIMusicEnhanced Directly

```typescript
'use client';

import { useAIMusicEnhanced } from '@/hooks/useAIMusicEnhanced';

export function CustomMusicGenerator() {
  const music = useAIMusicEnhanced();

  return (
    <div>
      {/* Custom UI using music state and methods */}
      <button onClick={() => music.generateMusic({
        mode: 'text-to-song',
        description: 'Upbeat electronic',
        genre: 'Electronic',
        mood: 'Happy',
        tempo: 120,
        instruments: ['Synth', 'Piano'],
        duration: 60,
      })}>
        Generate
      </button>

      {music.currentGeneration && (
        <div>
          <p>Progress: {music.currentGeneration.progress}%</p>
        </div>
      )}

      <div>
        {music.library.tracks.map(track => (
          <div key={track.id}>
            <h3>{track.prompt}</h3>
            <p>{track.genre} • {track.mood}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Feature Examples

### 1. Text-to-Song Generation

```typescript
// Simple text-to-song
await music.generateMusic({
  mode: 'text-to-song',
  description: 'Upbeat 80s synthwave with driving bass',
  genre: 'Synthwave',
  mood: 'Energetic',
  tempo: 140,
  instruments: ['Synth', 'Bass', 'Drums'],
  duration: 120,
});

// With custom voice
await music.generateMusic({
  mode: 'text-to-song',
  description: 'Soulful R&B track',
  genre: 'R&B',
  mood: 'Smooth',
  tempo: 90,
  instruments: ['Piano', 'Bass'],
  duration: 180,
  customVoiceId: 'voice-123', // Use recorded voice
});

// With custom model
await music.generateMusic({
  mode: 'text-to-song',
  description: 'Track in my signature style',
  genre: 'Electronic',
  mood: 'Dreamy',
  tempo: 100,
  instruments: [],
  duration: 60,
  customModelId: 'model-456', // Use trained model
});
```

### 2. Sound Generation

```typescript
// Generate foley effects
await music.generateMusic({
  mode: 'sounds',
  prompt: 'crisp snare hit with reverb',
  soundType: 'percussion',
  loopLength: 1,
  bpm: 120,
  tag: 'drums',
});

// Generate ambient pad loop
await music.generateMusic({
  mode: 'sounds',
  prompt: 'ambient atmospheric pad with decay',
  soundType: 'ambience',
  loopLength: 8,
  bpm: 100,
  tag: 'background',
});
```

### 3. Audio-to-Song

```typescript
// Upload audio and extend
await music.generateMusic({
  mode: 'audio-to-song',
  audioUrl: 'blob:...',
  audioFile: fileObject,
  transformType: 'extend',
  prompt: 'extend with similar style',
  duration: 60,
});

// Remix uploaded audio
await music.generateMusic({
  mode: 'audio-to-song',
  audioUrl: 'blob:...',
  transformType: 'remix',
  prompt: 'remix in electronic style',
  duration: 90,
});
```

### 4. Voice Recording

```typescript
// Start recording
await music.startVoiceRecording();

// Stop recording and save
const voice = await music.stopVoiceRecording();
console.log('Voice saved:', voice.id, voice.name);

// Use recorded voice in generation
await music.generateMusic({
  mode: 'text-to-song',
  description: 'Song with my voice',
  genre: 'Pop',
  mood: 'Happy',
  tempo: 120,
  instruments: [],
  duration: 60,
  customVoiceId: voice.id,
});
```

### 5. Model Training

```typescript
// Train custom model from reference track
const model = music.trainCustomModel(
  'track-123', // Reference track ID
  'My Signature Style'
);

// Monitor training progress
setInterval(() => {
  const current = music.library.customModels.find(m => m.id === model.id);
  console.log(`Training: ${current?.trainingProgress}%`);
}, 1000);

// Use trained model once ready
// (status will change from 'training' to 'ready')
if (model.status === 'ready') {
  await music.generateMusic({
    mode: 'text-to-song',
    description: 'New track in my style',
    genre: 'Electronic',
    mood: 'Calm',
    tempo: 100,
    instruments: [],
    duration: 60,
    customModelId: model.id,
  });
}
```

### 6. Stem Extraction

```typescript
// Extract stems from generated track
const stems = music.extractStems('track-123');

// Access individual stems
const vocals = stems.find(s => s.name === 'vocals');
const drums = stems.find(s => s.name === 'drums');
const bass = stems.find(s => s.name === 'bass');

// Manipulate stem
if (vocals) {
  // Change volume
  vocals.volume = 0.8;
  
  // Change panning
  vocals.pan = -0.5; // Pan left
  
  // Toggle dry version
  vocals.isDry = true;
}
```

### 7. Mashups

```typescript
// Create mashup of two tracks
const mashup = music.createMashup(
  'track-1-id',
  'track-2-id',
  75  // 75% track 1, 25% track 2
);

// Get mashup data
const mashupTrack = music.library.tracks.find(t => t.id === mashup.id);
```

### 8. Lyrics Editing

```typescript
// Update lyrics for track
music.updateLyrics('track-123', `
Verse 1:
Amazing melody flowing through the night
Lyrics sync perfectly with the beat

Chorus:
This is the hook that gets stuck in your head
Repeating endlessly through the thread
`);

// Access edited lyrics
const track = music.library.tracks.find(t => t.id === 'track-123');
console.log('Lyrics:', track?.lyrics);
console.log('Lyric lines:', track?.lyricLine);

// Each line has timing info
track?.lyricLine?.forEach(line => {
  console.log(`${line.text} (${line.startTime}s - ${line.endTime}s)`);
});
```

### 9. Timeline/Multitrack Editing

```typescript
// Create multitrack timeline
const timeline = music.createTimeline(
  120,    // BPM
  '4/4'   // Time signature
);

// Access timeline
console.log('Timeline:', timeline.id);
console.log('Tracks:', timeline.tracks.length);

// Timeline structure
timeline.bpm = 128;  // Change BPM
timeline.timeSignature = '3/4';
timeline.quantizeGrid = '1/16';

// Add tempo ramp
timeline.tempoRamps = [{
  startTime: 0,
  startBpm: 120,
  endTime: 30,
  endBpm: 140,
}];
```

### 10. Personas (Style Learning)

```typescript
// Create persona from reference tracks
const persona = music.createPersona(
  'My Chill Vibes',
  ['track-1', 'track-2', 'track-3'],
  'Relaxing ambient tracks with orchestral elements'
);

// Apply persona to generation
music.applyPersona('persona-456', {
  mode: 'text-to-song',
  description: 'New track',
  genre: 'Ambient',
  mood: 'Calm',
  tempo: 80,
  instruments: [],
  duration: 60,
});

// Generate with persona (track will use persona characteristics)
```

### 11. Magic Wand (User Taste)

```typescript
// Apply learned preferences
const enhancedParams = music.applyMagicWand({
  prompt: 'Generate something cool',
  genre: 'Electronic',
});

// The result will have:
// - Your favorite genre
// - Your preferred mood
// - Your tempo preferences
// - Your favorite instruments

// Generate with magic wand
await music.generateMusic({
  mode: 'text-to-song',
  description: enhancedParams.prompt || 'Generate music',
  genre: enhancedParams.genre || 'Electronic',
  mood: enhancedParams.mood || 'Happy',
  tempo: enhancedParams.tempo || 120,
  instruments: enhancedParams.instruments || [],
  duration: 60,
});
```

### 12. Library & Search

```typescript
// Search tracks
const results = music.searchTracks('synthwave');
// Searches: prompt, genre, mood, tags

// Get favorites
const favorites = music.library.tracks.filter(t => t.isFavorite);

// Toggle favorite
music.toggleFavorite('track-123');

// Delete track
music.deleteTrack('track-123');

// Track metadata
const track = music.library.tracks[0];
console.log({
  id: track.id,
  type: track.type,
  title: track.title,
  prompt: track.prompt,
  genre: track.genre,
  mood: track.mood,
  tempo: track.tempo,
  duration: track.duration,
  status: track.status,
  progress: track.progress,
  isFavorite: track.isFavorite,
  tags: track.tags,
  createdAt: track.createdAt,
});
```

### 13. Export Options

```typescript
// Export as MP3
music.downloadTrack('track-123', {
  format: 'mp3',
  bitrate: 'high',
});

// Export as WAV (lossless)
music.downloadTrack('track-123', {
  format: 'wav',
  sampleRate: 48000,
  channels: 'stereo',
});

// Export stems
music.downloadTrack('track-123', {
  format: 'stems',
  stems: ['vocals', 'drums', 'bass'],
});

// Export as MIDI
music.downloadTrack('track-123', {
  format: 'midi',
  includeMetadata: true,
});
```

## Event Handling Patterns

### Monitor Generation Progress

```typescript
useEffect(() => {
  if (music.isGenerating) {
    const interval = setInterval(() => {
      if (music.currentGeneration) {
        console.log(`Progress: ${music.currentGeneration.progress}%`);
      }
    }, 500);
    return () => clearInterval(interval);
  }
}, [music.isGenerating, music.currentGeneration]);
```

### React to Track Completion

```typescript
useEffect(() => {
  const lastTrack = music.library.tracks[0];
  if (lastTrack?.status === 'complete') {
    console.log('Track generation complete!');
    console.log('Track ID:', lastTrack.id);
    console.log('Waveform data:', lastTrack.waveformData);
  }
}, [music.library.tracks]);
```

### Error Handling

```typescript
useEffect(() => {
  if (music.error) {
    console.error('Music generator error:', music.error);
    // Show error toast to user
    showErrorNotification(music.error);
  }
}, [music.error]);
```

## Integration Examples

### With Discord Chat Panel

```typescript
// Send generated track to Discord
const handleShareToDiscord = (trackId: string) => {
  const track = music.library.tracks.find(t => t.id === trackId);
  if (track) {
    discord.sendMessage({
      content: `Check out this track: ${track.prompt}`,
      attachment: track.url,
    });
  }
};
```

### With Project Serialization

```typescript
// Save music project with studio project
const saveStudioProject = () => {
  return {
    tracks: studio.tracks,
    musicLibrary: music.library,
    musicTimeline: music.currentTimeline,
  };
};

// Load music project
const loadStudioProject = (project) => {
  // Restore music library from saved project
  localStorage.setItem('wise2-music-library', JSON.stringify(project.musicLibrary));
};
```

### With Cloud Persistence

```typescript
// Sync library to cloud
const syncToCloud = async () => {
  await api.post('/music/library', {
    library: music.library,
    timestamp: new Date(),
  });
};

// Load from cloud
const loadFromCloud = async () => {
  const response = await api.get('/music/library');
  localStorage.setItem('wise2-music-library', JSON.stringify(response.library));
};
```

## Performance Tips

### Optimize for Large Libraries

```typescript
// Use search for filtering instead of loading all tracks
const search = useMemo(() => {
  return query ? music.searchTracks(query) : [];
}, [query, music.library.tracks]);

// Render only visible tracks with virtualization (future feature)
```

### Batch Operations

```typescript
// Generate multiple tracks efficiently
const batchGenerate = async (prompts: string[]) => {
  for (const prompt of prompts) {
    await music.generateMusic({
      mode: 'text-to-song',
      description: prompt,
      genre: 'Electronic',
      mood: 'Happy',
      tempo: 120,
      instruments: [],
      duration: 60,
    });
    // Wait between generations
    await new Promise(r => setTimeout(r, 2000));
  }
};
```

### Memory Management

```typescript
// Cleanup old tracks periodically
const cleanupOldTracks = () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oldTracks = music.library.tracks.filter(
    t => new Date(t.createdAt) < thirtyDaysAgo && !t.isFavorite
  );
  oldTracks.forEach(t => music.deleteTrack(t.id));
};
```

## Troubleshooting

### Voice Recording Not Working

```typescript
// Check microphone permissions
const hasMicrophone = await navigator.permissions.query({ name: 'microphone' });
console.log('Microphone status:', hasMicrophone.state);

// Request permission
await navigator.mediaDevices.getUserMedia({ audio: true });
```

### Library Not Persisting

```typescript
// Check localStorage
console.log('Saved library:', localStorage.getItem('wise2-music-library'));

// Clear and reset
localStorage.removeItem('wise2-music-library');
// Library will reset on next refresh
```

### High Memory Usage

```typescript
// Check library size
console.log('Track count:', music.library.tracks.length);
console.log('Voice count:', music.library.customVoices.length);
console.log('Model count:', music.library.customModels.length);

// Delete large/old items if needed
```

## Best Practices

1. **Always handle errors**: Wrap generation calls in try-catch
2. **Use TypeScript**: Import types for better IDE support
3. **Monitor progress**: Show users generation progress
4. **Persist state**: Library auto-saves to localStorage
5. **Clean up**: Delete unused tracks and voices to save space
6. **Test responsiveness**: Ensure mobile/tablet support
7. **Accessibility**: Use semantic HTML and ARIA labels

---

For more examples and advanced usage, see the component source code and type definitions.

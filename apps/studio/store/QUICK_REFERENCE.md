# Zustand Store Quick Reference

Fast lookup for common store operations.

## Import All Stores

```typescript
import {
  useSunoStore,
  useObsStore,
  useCreativeStudioStore,
  sunoSelectors,
  obsSelectors,
  creativeStudioSelectors,
} from '@/store';
```

## Suno Store Cheat Sheet

### Generate Music
```typescript
const { submitGeneration, updateGenerationStatus } = useSunoStore();

await submitGeneration({
  mode: 'text-to-song',
  description: 'Upbeat pop',
  genre: 'pop',
  mood: 'energetic',
  tempo: 120,
  instruments: ['piano', 'drums'],
  duration: 30,
});
```

### Track History
```typescript
const { addToHistory, removeFromHistory, searchHistory } = useSunoStore();

const results = searchHistory('summer');
removeFromHistory('track-123');
```

### Favorites
```typescript
const { addToFavorites, isFavorite } = useSunoStore();

addToFavorites('track-123');
if (isFavorite('track-123')) { /* ... */ }
```

### Playlists
```typescript
const { createPlaylist, addToPlaylist, getPlaylistTracks } = useSunoStore();

const playlist = createPlaylist('My Chill Vibes', 'Relaxing tracks');
addToPlaylist(playlist.id, 'track-123');
const tracks = getPlaylistTracks(playlist.id);
```

### Preview
```typescript
const { playTrack, pauseTrack, updatePlaybackTime } = useSunoStore();

playTrack(track);
updatePlaybackTime(15); // 15 seconds
pauseTrack();
```

## OBS Store Cheat Sheet

### Scene Management
```typescript
const { addScene, switchScene, deleteScene } = useObsStore();

const scene = addScene('Main');
switchScene(scene.id);
deleteScene(scene.id);
```

### Source Management
```typescript
const { addSource, updateSource, removeSource } = useObsStore();

addSource(sceneId, {
  id: 'src-1',
  type: 'camera',
  name: 'Webcam',
  enabled: true,
  position: { x: 0, y: 0, width: 1920, height: 1080 },
  properties: {},
});

updateSource(sceneId, 'src-1', { enabled: false });
removeSource(sceneId, 'src-1');
```

### Stream Control
```typescript
const { startStream, stopStream, startRecording } = useObsStore();

await startStream();
startRecording();
// ... streaming ...
const recording = stopRecording();
await stopStream();
```

### Mixer
```typescript
const { addMixerChannel, setChannelVolume, muteChannel } = useObsStore();

addMixerChannel({
  id: 'mic',
  name: 'Microphone',
  label: 'Mic',
  type: 'mic',
  volume: 0,
  peakLevel: -6,
  isMuted: false,
  isSolo: false,
  pan: 0,
});

setChannelVolume('mic', -3);
muteChannel('mic', true);
```

### Status Updates
```typescript
const { updateStreamStatusInfo, updateSystemMetrics } = useObsStore();

updateStreamStatusInfo({
  viewerCount: 150,
  bitrate: 4500,
  frameDrops: 0,
});

updateSystemMetrics({
  cpuUsage: 45,
  memoryUsage: 62,
});
```

## Creative Studio Store Cheat Sheet

### Link Tracks to Scenes
```typescript
const { linkTrackToScene, autoPlayTrackOnSceneSwitch } = useCreativeStudioStore();

linkTrackToScene('track-123', 'scene-456');
autoPlayTrackOnSceneSwitch('link-0', true);
```

### Projects
```typescript
const { createProject, updateProject, loadProject } = useCreativeStudioStore();

createProject('Summer Streams');
updateProject({ tags: ['summer', '2024'] });
loadProject('proj-123');
```

### Workflow
```typescript
const { setActiveModule, setWorkflowMode } = useCreativeStudioStore();

setActiveModule('suno'); // Switch to music generation
setWorkflowMode('stream-integration');
```

### Export
```typescript
const { exportProject } = useCreativeStudioStore();

await exportProject('json'); // Downloads JSON
```

### Queries
```typescript
const { getLinkedTrackBySceneId, getLinkedSceneByTrackId } = useCreativeStudioStore();

const link = getLinkedTrackBySceneId('scene-123');
const sceneId = getLinkedSceneByTrackId('track-123');
```

## Selector Patterns (Optimized)

### Suno
```typescript
const history = sunoSelectors.selectHistory();
const playing = sunoSelectors.selectIsPlaying();
const favs = sunoSelectors.selectFavoriteTracks();
```

### OBS
```typescript
const isLive = obsSelectors.selectIsLive();
const metrics = obsSelectors.selectSystemMetrics();
const channels = obsSelectors.selectMixerChannels();
```

### Creative Studio
```typescript
const module = creativeStudioSelectors.selectActiveModule();
const project = creativeStudioSelectors.selectCurrentProject();
const links = creativeStudioSelectors.selectLinkedTracks();
```

## Sync & Composites

### Sync All Sub-Stores
```typescript
const { syncFromSubStores } = useCreativeStudioStore();
syncFromSubStores(); // Call on component mount
```

### Get Linked Track Details
```typescript
import { useLinkedTrackInfo } from '@/store';

const { track, scene, link } = useLinkedTrackInfo('0');
if (track && scene) {
  // Use track and scene data
}
```

## Common Patterns

### Workflow: Generate Music → Add to Stream

```typescript
function GenerateAndStream() {
  const sunoStore = useSunoStore();
  const obsStore = useObsStore();
  const creativeStore = useCreativeStudioStore();

  const handleGenerateForStream = async () => {
    // 1. Generate track
    await sunoStore.submitGeneration({
      mode: 'text-to-song',
      description: 'Background music',
      genre: 'ambient',
      mood: 'calm',
      tempo: 80,
      instruments: ['piano', 'strings'],
      duration: 120,
    });

    // Wait for generation
    // (In real app, listen to progress updates)

    // 2. Add scene
    const scene = obsStore.addScene('Music Loop');

    // 3. Link them (assuming generation completed)
    const track = sunoStore.generationHistory[0];
    creativeStore.linkTrackToScene(track.id, scene.id);
    creativeStore.autoPlayTrackOnSceneSwitch(0, true);
  };

  return <button onClick={handleGenerateForStream}>Generate & Link</button>;
}
```

### Workflow: Live Stream with Dynamic Scenes

```typescript
function LiveStreamController() {
  const obsStore = useObsStore();
  const creativeStore = useCreativeStudioStore();
  const sunoStore = useSunoStore();

  const handleSwitchScene = (sceneId: string) => {
    // Switch scene
    obsStore.switchScene(sceneId);

    // Check for linked music
    const linkedTrack = creativeStore.getLinkedTrackBySceneId(sceneId);
    if (linkedTrack?.autoPlayOnSceneSwitch) {
      const track = sunoStore.generationHistory.find(
        (t) => t.id === linkedTrack.sunoTrackId
      );
      if (track) sunoStore.playTrack(track);
    }
  };

  const scenes = obsSelectors.selectScenes();

  return (
    <div className="scenes">
      {scenes.map((scene) => (
        <button key={scene.id} onClick={() => handleSwitchScene(scene.id)}>
          {scene.name}
        </button>
      ))}
    </div>
  );
}
```

### Workflow: Save Project with Everything

```typescript
function SaveProjectButton() {
  const creativeStore = useCreativeStudioStore();

  const handleSave = async () => {
    creativeStore.updateProject({
      name: 'My Latest Stream',
      tags: ['live', 'music', 'streaming'],
    });

    await creativeStore.exportProject('json');
    // User downloads JSON with all tracks, scenes, links
  };

  return <button onClick={handleSave}>Save Project</button>;
}
```

## Reset & Debug

### Reset All Stores
```typescript
const { reset } = useCreativeStudioStore();
reset(); // Clears all stores
```

### View Store State (Browser Console)
```typescript
// Check store state
const state = useSunoStore.getState();
console.log(state);

// Subscribe to changes
useSunoStore.subscribe((state) => {
  console.log('Suno state changed:', state);
});
```

---

For detailed docs, see [README.md](./README.md)

# Creative Studio Store Management

Zustand-based state management system for the WISE² Creative Studio, providing integrated state handling for Suno AI music generation and OBS-like streaming capabilities.

## Architecture

```
Creative Studio Store (Master)
├── Suno Store (AI Music)
├── OBS Store (Streaming)
└── Cross-Module Communication
```

## Stores

### 1. **Suno Store** (`sunoStore.ts`)

Manages AI music generation, track history, and music library.

#### State
```typescript
- currentGeneration: Generation status, prompt, progress
- generationHistory: All generated tracks (searchable, sortable)
- selectedTrack: Current preview track
- previewState: Playback control state
- favorites: Favorite track IDs
- playlists: User playlists
- customVoices: Voice library
- personas: Style personas
```

#### Actions
```typescript
// Generation
submitGeneration(params)
updateGenerationStatus(status, progress)
completeGeneration(track)

// History Management
addToHistory(track)
removeFromHistory(trackId)
clearHistory()
searchHistory(query)
getHistoryByFilter(filter)

// Playback
setSelectedTrack(track)
playTrack(track)
pauseTrack()
updatePlaybackTime(time)

// Favorites
addToFavorites(trackId)
removeFromFavorites(trackId)
isFavorite(trackId)

// Playlists
createPlaylist(name, description)
deletePlaylist(playlistId)
addToPlaylist(playlistId, trackId)
removeFromPlaylist(playlistId, trackId)
getPlaylistTracks(playlistId)

// Voices & Personas
addCustomVoice(voice)
removeCustomVoice(voiceId)
addPersona(persona)
getMostUsedPersonas(limit)
```

#### Selectors (for optimized re-renders)
```typescript
sunoSelectors.selectCurrentGeneration()
sunoSelectors.selectHistory()
sunoSelectors.selectSelectedTrack()
sunoSelectors.selectFavoriteTracks()
sunoSelectors.selectPlaylists()
```

#### Usage Example
```typescript
'use client';
import { useSunoStore, sunoSelectors } from '@/store';

export function GenerationPanel() {
  const { submitGeneration, updateGenerationStatus } = useSunoStore();
  const currentGen = sunoSelectors.selectCurrentGeneration();
  const history = sunoSelectors.selectHistory();

  const handleGenerate = async () => {
    await submitGeneration({
      mode: 'text-to-song',
      description: 'Upbeat electronic pop',
      genre: 'electronic',
      mood: 'upbeat',
      tempo: 128,
      instruments: ['synth', 'drums'],
      duration: 30,
    });
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      <p>Progress: {currentGen.progress}%</p>
      <div>Recent: {history.slice(0, 5).map(t => <div key={t.id}>{t.title}</div>)}</div>
    </div>
  );
}
```

---

### 2. **OBS Store** (`obsStore.ts`)

Manages streaming scenes, sources, mixer, and live metrics.

#### State
```typescript
- scenes: Array of scenes with sources
- activeSceneId: Currently active scene
- streamConfig: Stream title, description, etc.
- streamDestinations: YouTube, Twitch, RTMP, etc.
- streamStatus: idle | starting | streaming | stopping | error
- streamStatusInfo: Viewer count, bitrate, uptime, etc.
- mixerChannels: Audio mixer channels
- systemMetrics: CPU, memory, disk, network usage
- streamHealth: Bitrate, frame drops, latency, buffer health
- recordings: Recording history
```

#### Actions
```typescript
// Scene Management
addScene(name, description)
deleteScene(sceneId)
switchScene(sceneId)
updateScene(sceneId, updates)
duplicateScene(sceneId)
reorderScenes(sceneIds)

// Source Management
addSource(sceneId, source)
removeSource(sceneId, sourceId)
updateSource(sceneId, sourceId, updates)
enableSource(sceneId, sourceId)
disableSource(sceneId, sourceId)
reorderSources(sceneId, sourceIds)

// Stream Control
startStream()
stopStream()
startRecording()
stopRecording()

// Mixer
addMixerChannel(channel)
removeMixerChannel(channelId)
setChannelVolume(channelId, volume)
muteChannel(channelId, muted)
soloChannel(channelId, solo)
setMasterVolume(volume)

// Status Updates
updateStreamStatus(status)
updateStreamStatusInfo(info)
updateSystemMetrics(metrics)
updateStreamHealth(health)

// Stream Destinations
addStreamDestination(destination)
removeStreamDestination(destinationId)
activateDestination(destinationId)
deactivateDestination(destinationId)
```

#### Selectors
```typescript
obsSelectors.selectScenes()
obsSelectors.selectActiveScene()
obsSelectors.selectStreamStatus()
obsSelectors.selectIsLive()
obsSelectors.selectViewerCount()
obsSelectors.selectMixerChannels()
obsSelectors.selectSystemMetrics()
```

#### Usage Example
```typescript
'use client';
import { useObsStore, obsSelectors } from '@/store';

export function StreamingControl() {
  const { startStream, stopStream, switchScene } = useObsStore();
  const isLive = obsSelectors.selectIsLive();
  const scenes = obsSelectors.selectScenes();

  return (
    <div>
      {isLive ? (
        <button onClick={stopStream}>Stop Stream</button>
      ) : (
        <button onClick={startStream}>Start Stream</button>
      )}
      
      <div className="scenes">
        {scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => switchScene(scene.id)}
          >
            {scene.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

### 3. **Creative Studio Store** (`creativeStudioStore.ts`)

Master store that integrates Suno and OBS, enabling cross-module workflows.

#### State
```typescript
- activeModule: 'suno' | 'obs' | 'collaboration' | 'export'
- workflowMode: 'standalone' | 'stream-integration' | 'content-creation' | 'live-performance'
- linkedTracks: Links between Suno tracks and OBS scenes
- currentProject: Project metadata
- isPreviewMode: Preview/edit mode toggle
- timelineMode: 'tracks' | 'scenes' | 'unified'
```

#### Actions
```typescript
// Module Integration
linkTrackToScene(sunoTrackId, obsSceneId)
unlinkTrackFromScene(linkId)
autoPlayTrackOnSceneSwitch(linkId, enabled)

// Workflow
setActiveModule(module)
setWorkflowMode(mode)
switchToModule(module)

// Project Management
createProject(name, description)
updateProject(updates)
deleteProject()
loadProject(projectId)

// Cross-Module Operations
syncSunoToObs(sunoTrackId, obsSceneId)
exportProject(format: 'json' | 'mp4' | 'stems')

// Queries
getLinkedTrackBySceneId(sceneId)
getLinkedSceneByTrackId(trackId)
canPlayTrackInScene(trackId, sceneId)
```

#### Usage Example
```typescript
'use client';
import {
  useCreativeStudioStore,
  useLinkedTrackInfo,
  useSyncStores,
} from '@/store';

export function CreativeStudio() {
  useSyncStores(); // Sync sub-stores on mount

  const {
    createProject,
    linkTrackToScene,
    switchToModule,
    activeModule,
  } = useCreativeStudioStore();

  const handleCreateProject = () => {
    createProject('My Mix Stream', 'Combining music and live stream');
  };

  const handleLinkTrackToScene = (trackId: string, sceneId: string) => {
    linkTrackToScene(trackId, sceneId);
    switchToModule('obs');
  };

  return (
    <div>
      <button onClick={handleCreateProject}>New Project</button>
      <p>Active Module: {activeModule}</p>
    </div>
  );
}
```

---

## Performance Optimization

### Selectors Pattern

All stores include selectors for optimized re-renders. Instead of subscribing to the entire store state, use specific selectors:

```typescript
// Good - Only re-renders when selectedTrack changes
const selectedTrack = sunoSelectors.selectSelectedTrack();

// Avoid - Re-renders on any store state change
const { selectedTrack } = useSunoStore();
```

### Composite Hooks

For complex queries spanning multiple stores, use composite hooks:

```typescript
// Get linked track and scene info
const { track, scene, link } = useLinkedTrackInfo(linkId);
```

---

## Persistence

All stores use localStorage persistence via Zustand middleware:

- **Storage Key:** `suno-store`, `obs-store`, `creative-studio-store`
- **Versioning:** v1 (can be updated for migrations)
- **Auto-save:** State persists automatically on changes

---

## Integration Pattern

### Linking Tracks to Scenes

```typescript
const {
  useSunoStore,
  useObsStore,
  useCreativeStudioStore,
} = require('@/store');

// 1. Create a Suno track
const sunoStore = useSunoStore.getState();
const newTrack = await sunoStore.submitGeneration({...});

// 2. Create an OBS scene
const obsStore = useObsStore.getState();
const scene = obsStore.addScene('Scene with Music');

// 3. Link them
const creativeStore = useCreativeStudioStore.getState();
creativeStore.linkTrackToScene(newTrack.id, scene.id);

// 4. Enable auto-play on scene switch
creativeStore.autoPlayTrackOnSceneSwitch(linkId, true);
```

### Stream with Background Music

```typescript
export function LiveStreamWithMusic() {
  const creativeStore = useCreativeStudioStore();
  const obsStore = useObsStore();

  const handleSwitchScene = (sceneId: string) => {
    const linkedTrack = creativeStore.getLinkedTrackBySceneId(sceneId);
    
    obsStore.switchScene(sceneId);

    if (linkedTrack?.autoPlayOnSceneSwitch) {
      const sunoStore = useSunoStore.getState();
      const track = sunoStore.generationHistory.find(
        (t) => t.id === linkedTrack.sunoTrackId
      );
      if (track) {
        sunoStore.playTrack(track);
      }
    }
  };

  return (
    <div>
      {/* Scene selection with automatic music playback */}
    </div>
  );
}
```

---

## Testing

Stores include devtools middleware for easy debugging:

```typescript
// In browser console
const store = window.__ZUSTAND_STORE__;
store.getState(); // View current state
store.subscribe(console.log); // Listen to changes
```

---

## Best Practices

1. **Use Selectors** - Prefer selectors over direct store subscription for performance
2. **Persist Strategically** - Exclude sensitive data from persistence
3. **Batch Updates** - Group related state changes to minimize re-renders
4. **Type Safety** - Use TypeScript types for all actions and selectors
5. **Reset on Unmount** - Consider resetting stores when components unmount if needed
6. **Avoid Circular Dependencies** - Keep store modules independent

---

## File Structure

```
apps/studio/store/
├── index.ts                    # Central exports
├── sunoStore.ts               # AI music generation store
├── obsStore.ts                # Streaming/recording store
├── creativeStudioStore.ts     # Master integration store
└── README.md                  # This file
```

---

## Next Steps

1. Install Zustand dependencies: `pnpm add zustand`
2. Import stores in components: `import { useSunoStore } from '@/store'`
3. Use hooks in components for reactive state management
4. Create custom hooks for common patterns
5. Build UI components that integrate both Suno and OBS workflows

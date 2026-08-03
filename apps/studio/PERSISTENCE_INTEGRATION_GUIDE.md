# SoundLabs Studio Project Persistence Integration Guide

This guide explains how to integrate project persistence into your studio workspace pages.

## Overview

Four new files have been created to enable project persistence:

1. **`utils/projectSerializer.ts`** - Serialization/deserialization utilities
2. **`hooks/useProjectPersistence.ts`** - localStorage management hook
3. **`components/ProjectManager.tsx`** - UI component for project management
4. **`hooks/useAudioEngine.ts`** (modified) - Added project save/load methods

## Quick Integration Example

Here's how to integrate project persistence into a workspace page:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { useAudioEngine } from '../hooks/useAudioEngine';
import { ProjectManager } from '../components/ProjectManager';

export default function StudioWorkspacePage() {
  const audioEngine = useAudioEngine();
  const [showProjectManager, setShowProjectManager] = useState(false);

  // Load last project on mount
  useEffect(() => {
    if (audioEngine.state.isInitialized) {
      const lastProjectId = audioEngine.projectPersistence.getLastProjectId();
      if (lastProjectId) {
        audioEngine.loadProject(lastProjectId);
      }
    }
  }, [audioEngine.state.isInitialized]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header with Project Controls */}
      <header className="border-b border-wise-medium p-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{audioEngine.state.projectName}</h1>
          <p className="text-sm text-wise-text-secondary">
            {audioEngine.projectPersistence.saveState.isSaving
              ? 'Saving...'
              : audioEngine.projectPersistence.saveState.lastSaved
              ? `Last saved: ${new Date(audioEngine.projectPersistence.saveState.lastSaved).toLocaleTimeString()}`
              : 'Not saved yet'}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowProjectManager(true)}
            className="px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover rounded font-semibold"
          >
            Projects
          </button>
          <button
            onClick={() => audioEngine.saveProject()}
            className="px-4 py-2 bg-wise-primary/50 hover:bg-wise-primary rounded font-semibold"
          >
            Save
          </button>
        </div>
      </header>

      {/* Studio Content */}
      <main className="p-4">
        {/* Your studio UI here */}
        <div className="space-y-4">
          {audioEngine.state.tracks.length === 0 ? (
            <p className="text-wise-text-secondary">No tracks yet. Create a new track to start.</p>
          ) : (
            <div className="space-y-2">
              {audioEngine.state.tracks.map((track) => (
                <div key={track.getId()} className="bg-wise-surface p-4 rounded border border-wise-medium">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{track.getName()}</h3>
                    <button
                      onClick={() => audioEngine.removeTrack(track.getId())}
                      className="text-wise-accent-red hover:opacity-80"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => audioEngine.addTrack()}
            className="w-full py-2 bg-wise-primary/20 hover:bg-wise-primary/40 rounded border border-wise-primary text-wise-primary font-semibold transition"
          >
            + Add Track
          </button>
        </div>
      </main>

      {/* Project Manager Modal */}
      {showProjectManager && (
        <ProjectManager
          currentProjectId={audioEngine.state.projectId}
          onProjectSelect={(projectId, projectName) => {
            if (projectId === audioEngine.state.projectId) {
              setShowProjectManager(false);
              return;
            }
            // Check if project exists in localStorage
            const project = audioEngine.projectPersistence.loadProject(projectId);
            if (project) {
              audioEngine.loadProject(projectId);
              setShowProjectManager(false);
            } else {
              // Create new project
              audioEngine.createNewProject(projectName);
              setShowProjectManager(false);
            }
          }}
          onClose={() => setShowProjectManager(false)}
        />
      )}

      {/* Error Display */}
      {audioEngine.projectPersistence.saveState.error && (
        <div className="fixed bottom-4 left-4 bg-wise-accent-red/10 border border-wise-accent-red rounded p-4 max-w-md">
          <p className="text-sm text-wise-accent-red">
            {audioEngine.projectPersistence.saveState.error}
          </p>
        </div>
      )}
    </div>
  );
}
```

## API Reference

### useAudioEngine() - New Methods

```typescript
// Save project to localStorage
saveProject(): boolean;

// Load project from localStorage
loadProject(projectId: string): boolean;

// Create new blank project
createNewProject(projectName?: string): string | null;

// Rename current project
renameProject(newName: string): boolean;

// Access to persistence state and methods
projectPersistence: {
  saveState: {
    isSaving: boolean;
    lastSaved: number | null;
    error: string | null;
  };
  getProjectList(): ProjectMetadata[];
  getTotalStorageUsed(): number;
}
```

### useProjectPersistence() - Complete API

```typescript
// State
saveState: {
  isSaving: boolean;
  lastSaved: number | null;
  error: string | null;
}

// Save/Load
saveProject(projectId, projectName, tracks, mixer, playback, masterVolume, bpm): boolean;
debouncedSaveProject(...): void; // Auto-save with 2s debounce

loadProject(projectId: string): SerializedProject | null;

// Project management
getProjectList(): ProjectMetadata[];
deleteProject(projectId: string): boolean;
clearAllProjects(): boolean;
getLastProjectId(): string | null;

// Utilities
getTotalStorageUsed(): number;
isLocalStorageAvailable(): boolean;
```

## Features

### Auto-Save
- State is automatically saved every 2 seconds (debounced)
- Prevents localStorage thrashing
- Shows "Saving..." indicator while saving

### Project Management
- Create, load, rename, and delete projects
- View list of saved projects with timestamps and file sizes
- Load previously saved projects instantly

### Storage Limits
- Respects 50MB browser storage limit
- Shows available storage in ProjectManager UI
- Gracefully handles quota exceeded errors

### Error Handling
- Try-catch blocks throughout
- User-friendly error messages
- Graceful fallback if localStorage unavailable
- Console logging for debugging

### State Persistence
Saved state includes:
- Project metadata (ID, name, timestamp)
- All tracks (ID, name, volume, pan, mute, solo, color)
- Mixer settings (master volume, BPM)
- File size calculation for storage management

## Example: Auto-Load Last Project

```typescript
useEffect(() => {
  if (!audioEngine.state.isInitialized) return;

  const lastProjectId = audioEngine.projectPersistence.getLastProjectId();
  if (lastProjectId) {
    audioEngine.loadProject(lastProjectId);
  }
}, [audioEngine.state.isInitialized, audioEngine.projectPersistence]);
```

## Example: Rename Project

```typescript
const [newName, setNewName] = useState(audioEngine.state.projectName);

const handleRename = () => {
  audioEngine.renameProject(newName);
};

return (
  <input
    value={newName}
    onChange={(e) => setNewName(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') handleRename();
    }}
  />
);
```

## Storage Details

### Serialization Format
Projects are stored as JSON in localStorage with keys like:
- `wise2_studio_projects_project-1721367890000`
- `wise2_studio_project_list` - Index of all projects

### Maximum Project Size
- Individual projects are limited by browser storage (~50MB total)
- Each project is serialized as JSON, typically 10-100KB depending on content
- Audio buffers are NOT persisted (recording data)

## Debugging

Enable console logging by setting up:

```typescript
// In your component
useEffect(() => {
  console.log('Project Persistence State:', audioEngine.projectPersistence.saveState);
  console.log('Saved Projects:', audioEngine.projectPersistence.getProjectList());
  console.log('Storage Used:', audioEngine.projectPersistence.getTotalStorageUsed());
}, [audioEngine.projectPersistence.saveState]);
```

## Troubleshooting

### Projects not saving?
- Check if localStorage is available: `localStorage.length > 0`
- Check browser console for errors
- Verify storage quota not exceeded

### Projects not loading?
- Ensure project ID is correct
- Check localStorage isn't cleared by browser
- Verify Track objects are created correctly after load

### Performance issues?
- Reduce the number of tracks (serialization can be slow with 50+ tracks)
- Clear old projects periodically
- Consider moving to IndexedDB for larger projects

## Production Deployment Checklist

- [ ] Test auto-save on actual user workflows
- [ ] Verify storage quota errors handled gracefully
- [ ] Test project loading on slow networks
- [ ] Implement project backup/export feature
- [ ] Add analytics for project creation/loading
- [ ] Consider migrating to IndexedDB for larger projects
- [ ] Test on mobile browsers (localStorage limits vary)

## Future Enhancements

1. **Cloud Sync** - Use `useCloudPersistence.ts` for backend storage
2. **Project Export** - Download projects as .json or .wise2 files
3. **Project Import** - Import previously exported projects
4. **Undo/Redo** - Snapshot system for project history
5. **Collaboration** - Real-time sync via WebSockets
6. **Offline Support** - Queue operations for later sync

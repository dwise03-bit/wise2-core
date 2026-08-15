# SoundLabs Live Studio — Phase 2 Implementation Spec

**Status**: 🚀 **STARTING PHASE 2**  
**Date**: July 14, 2026  
**Foundation**: Phase 1 Complete ✅

---

## Phase 2 Overview

Build advanced production features on top of Phase 1's solid audio engine. Focus on professional workflows that power real DAWs.

**Estimated Duration**: 3-4 weeks  
**Team**: 1-2 engineers  
**Scope**: 5 major features + refinements

---

## Priority 1: Clip Editor (CRITICAL)

### What Users Can Do
- **Record Audio** → **See waveform on timeline** → **Edit clips** ← **This is Phase 2**
- Drag clips left/right to reposition
- Trim start/end by dragging edges
- Split clips at playhead position
- Delete clips
- Fade in/out by dragging corners
- Crossfade overlapping clips

### Technical Implementation

**1. Timeline Clip Container**
```tsx
<TimelineTrack>
  <Clip 
    clipId="clip-1"
    startTime={0}
    duration={5}
    waveformData={AudioBuffer}
    onMove={handleMove}
    onTrim={handleTrim}
    onDelete={handleDelete}
  />
</TimelineTrack>
```

**2. Clip Data Structure**
```typescript
interface Clip {
  id: string;
  trackId: string;
  startTime: number;        // seconds from start
  duration: number;         // original duration
  displayStart: number;     // trim start (for display)
  displayEnd: number;       // trim end (for display)
  audioBuffer: AudioBuffer;
  fadeInDuration?: number;  // seconds
  fadeOutDuration?: number; // seconds
  isSelected: boolean;
}
```

**3. Audio Processing**
- Store original AudioBuffer in Track
- Calculate playback using displayStart/displayEnd
- Apply fades during playback
- Don't modify original buffer (non-destructive)

**4. Waveform Rendering**
- Generate waveform image from AudioBuffer
- Draw in canvas for performance
- Cache waveform image per clip
- Re-render on trim/fade changes

**5. Keyboard Shortcuts**
- `X` - Split at playhead
- `Delete` - Delete selected clip
- `L` - Set loop in point
- `'` - Set loop out point
- `Ctrl+D` - Duplicate clip
- `Ctrl+F` - Fade in/out dialog

### Files to Create
- `components/Clip.tsx` — Individual clip component
- `components/TimelineTrack.tsx` — Track timeline renderer
- `components/Waveform.tsx` — Waveform canvas renderer
- `utils/waveformGenerator.ts` — Convert AudioBuffer to pixel data
- `hooks/useClipDragResize.ts` — Handle clip manipulation
- Update `useAudioEngine.ts` — Add clip management methods

### Testing
- ✅ Drag clip left/right
- ✅ Trim start/end
- ✅ Split at playhead
- ✅ Delete clip
- ✅ Fade in/out
- ✅ Crossfade detection
- ✅ Playback with trimmed clip
- ✅ Multiple clips on same track

---

## Priority 2: Effect Automation (HIGH)

### What Users Can Do
- Record automation curves for any effect parameter
- Draw/edit curves in automation lanes
- Play back automation in real-time
- Enable/disable per parameter

### Technical Implementation

**1. Automation Lane UI**
```tsx
<AutomationLane
  trackId="track-1"
  parameter="volume"    // or "eq-low-gain", "comp-ratio", etc.
  effect={effectConfig}
  timelineLength={60}
  onPointsChange={handleUpdate}
/>
```

**2. Automation Point Storage**
```typescript
interface AutomationPoint {
  time: number;           // seconds
  value: number;          // 0-1 normalized
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

interface AutomationLane {
  trackId: string;
  parameterId: string;    // "volume", "pan", "eq-low-gain", etc.
  points: AutomationPoint[];
  isRecording: boolean;
  isEnabled: boolean;
}
```

**3. Recording Automation**
- Enable record mode on automation lane
- Capture parameter changes in real-time
- Quantize to timeline grid (optional)
- Play back recorded curve

**4. Playback Integration**
- Query automation point at current playhead time
- Interpolate between points
- Apply to effect parameter during playback
- Use easing functions for smooth curves

### Files to Create
- `components/AutomationLane.tsx` — Automation lane component
- `components/AutomationCurve.tsx` — Curve editor/display
- `utils/automationInterpolation.ts` — Point interpolation
- Update `useAudioEngine.ts` — Add automation playback

### Testing
- ✅ Add automation point by clicking
- ✅ Drag point to change value
- ✅ Record live automation
- ✅ Playback matches recording
- ✅ Easing functions work

---

## Priority 3: Advanced Editing Tools (HIGH)

### Time-Stretch (Change speed without pitch)

**Implementation**:
```typescript
// Slow down clip to 80% speed (without changing pitch)
const stretched = await audioEngine.timeStretch(
  audioBuffer, 
  { 
    ratio: 0.8,  // 80% of original speed
    quality: 'high'
  }
);
```

**Algorithm**: Phase vocoder (use Web Audio API or external library)

### Pitch-Shift (Change pitch without speed)

**Implementation**:
```typescript
// Raise pitch by 5 semitones
const pitched = await audioEngine.pitchShift(
  audioBuffer,
  {
    semitones: 5,  // Up 5 semitones
    quality: 'high'
  }
);
```

**Algorithm**: Phase vocoder or granular synthesis

### Crossfade (Blend overlapping clips)

**Implementation**:
```typescript
// 500ms crossfade at overlap
const faded = await audioEngine.crossfade(
  clip1Buffer,
  clip2Buffer,
  {
    duration: 0.5,  // 500ms
    curve: 'equal-power'
  }
);
```

### Files to Create
- `utils/timeStretch.ts` — Time-stretch implementation
- `utils/pitchShift.ts` — Pitch-shift implementation
- `utils/crossfade.ts` — Crossfade implementation
- Update `useAudioEngine.ts` — Expose these utilities

---

## Priority 4: Real-Time Collaboration (MEDIUM)

### What Users Can Do
- Invite collaborators via link
- See other users' cursors and selections
- Co-edit same project
- See live edits (clips, effects, automation)
- Chat sidebar for coordination

### Architecture

**Backend (Node.js/Express)**
```typescript
// /api/projects/:id/collaborate
WebSocket server handling:
- User presence (join/leave)
- Track additions
- Clip operations (add/move/delete)
- Effect changes
- Automation updates
- Project saves
```

**Frontend**
```typescript
const { projectId } = useParams();
const collaborators = useCollaborators(projectId);
const syncedProject = useSyncedProject(projectId);

// All changes broadcast to other users
onClipMove(() => {
  socket.emit('clip:moved', { clipId, newStart });
});
```

**Conflict Resolution**: Last-write-wins (LWW) for Phase 2

### Files to Create
- `hooks/useCollaborators.ts` — Manage connected users
- `hooks/useSyncedProject.ts` — Real-time project sync
- `components/CollaboratorsList.tsx` — Show active users
- `services/collaborationSocket.ts` — WebSocket management
- Backend: `routes/collaborate.ts` — WebSocket handler

---

## Priority 5: Project Management (MEDIUM)

### Save/Load Projects

**Storage**: IndexedDB for large projects

```typescript
// Save project with all clips, effects, automation
await projectStore.save({
  id: projectId,
  name: 'Summer Campaign',
  bpm: 120,
  tracks: [...],
  clips: [...],
  automation: [...],
  createdAt: Date.now(),
  modifiedAt: Date.now()
});
```

### Auto-Save

Every 30 seconds, save to IndexedDB

### Version History

Keep up to 10 snapshots, restore any previous version

### Project Templates

Pre-built track setups for common genres:
- Hip-hop (8 tracks: drums, bass, keys, vocals, etc.)
- Pop (6 tracks: drums, bass, guitar, keys, vocals, harmonies)
- Electronic (4 tracks: drums, bass, synth, effects)

### Files to Create
- `utils/projectStorage.ts` — IndexedDB operations
- `hooks/useProjectHistory.ts` — Version history
- `components/ProjectTemplates.tsx` — Template selector
- `components/SaveDialog.tsx` — Save/load UI

---

## Implementation Order

### Week 1: Clip Editor
1. Waveform rendering from AudioBuffer
2. Clip component with drag/resize
3. Timeline track component
4. Split, delete, fade controls
5. Playback integration

### Week 2: Effect Automation
1. Automation lane component
2. Point editor UI
3. Live recording
4. Playback integration
5. Parameter mapping

### Week 3: Advanced Editing + Collaboration
1. Time-stretch (use existing library)
2. Pitch-shift (use existing library)
3. Crossfade tool
4. WebSocket server setup
5. Presence indicators

### Week 4: Project Management
1. IndexedDB storage
2. Auto-save (30s interval)
3. Version history UI
4. Project templates
5. Polish & testing

---

## Success Criteria

### Clip Editor
- ✅ Record audio, see waveform
- ✅ Trim clips by dragging edges
- ✅ Move clips on timeline
- ✅ Split at playhead position
- ✅ Delete clips
- ✅ Fade in/out

### Effect Automation
- ✅ Record automation curves
- ✅ Edit points visually
- ✅ Playback automation
- ✅ Multiple automation lanes per track

### Advanced Editing
- ✅ Time-stretch without pitch change
- ✅ Pitch-shift without speed change
- ✅ Crossfade overlapping clips

### Collaboration
- ✅ Invite link sharing
- ✅ See other users' cursors
- ✅ Real-time clip updates
- ✅ Live audio playback sync

### Project Management
- ✅ Auto-save every 30 seconds
- ✅ Manual save/load
- ✅ Version history (10 snapshots)
- ✅ Genre templates

---

## Performance Targets

- **Waveform rendering**: < 100ms for 5-minute audio
- **Clip drag**: 60 FPS
- **Timeline scrub**: 60 FPS
- **Real-time collaboration**: < 200ms latency
- **Auto-save**: < 500ms for large projects

---

## Dependencies to Add

```json
{
  "tone": "^14.8.0",              // For time-stretch/pitch-shift
  "socket.io-client": "^4.7.0",   // Already added
  "idb": "^7.0.0"                 // IndexedDB helper
}
```

---

## Testing Strategy

### Unit Tests
- Waveform generation
- Time-stretch algorithms
- Automation interpolation
- Project storage

### Integration Tests
- Clip editing workflow
- Effect automation playback
- Collaboration sync
- Project save/restore

### Manual Testing
- Record → Edit → Playback workflow
- Multi-user collaboration
- Edge cases (overlapping clips, audio artifacts)
- Performance with 20+ tracks

---

## Risk Mitigation

**Risk**: Real-time collaboration lag  
**Mitigation**: Implement client-side prediction, server sync validation

**Risk**: Large project file size  
**Mitigation**: Compress automation curves, delta-sync only changed data

**Risk**: Audio artifacts from time-stretch  
**Mitigation**: Use proven library (tone.js), allow quality settings

**Risk**: Browser storage limits (IndexedDB ~50MB)  
**Mitigation**: Warn user, offer cloud sync (Phase 3)

---

## Phase 3 Preview (Roadmap)

- Cloud sync (Amazon S3 + database)
- AI-powered mixing assistant
- Marketplace integration
- Mobile apps (iOS/Android)
- VST plugin support
- Mastering tools

---

**Ready to start Phase 2?** Beginning with Clip Editor implementation.

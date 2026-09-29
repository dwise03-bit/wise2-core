# SoundLabs Live Studio — Phase 1 & 2 Implementation Plan

**Scope**: Core browser DAW + Advanced Production Features  
**Timeline**: 2-4 weeks of focused development  
**Deliverable**: Production-ready recording studio with mixer, effects, and collaboration

---

## Phase 1: Core Recording Studio (Foundation)

### 1.1 Audio Engine Architecture
**Objective**: Build a robust Web Audio API wrapper for recording, playback, and routing.

**Components**:
- `AudioContext` manager (single instance, sample rate detection)
- `Track` class (audio buffer, playback state, volume, pan)
- `Mixer` class (master bus, gain, metering)
- `Recorder` class (MediaRecorder wrapper, WAV/Blob export)
- `Playback` engine (timeline scrubbing, looping, punch-in/out)

**Deliverable**: `packages/audio/engine/` with full TypeScript types

### 1.2 Recording Capabilities
**Objective**: Enable high-quality audio recording from microphone or line-in.

**Features**:
- Microphone permission handling
- Live input monitoring (with gain control)
- Recording state management (idle, armed, recording)
- Metronome with tempo sync
- Punch-in/out controls
- Click track generation

**Deliverable**: Recording service, UI controls, permission flows

### 1.3 Multitrack Editing
**Objective**: Edit clips, arrange tracks, navigate timeline.

**Features**:
- Track list (add/remove/reorder tracks)
- Clip editor (trim, split, move, delete)
- Timeline scrubber with BPM-aware grid
- Waveform visualization (via canvas)
- Keyboard shortcuts (space = play, delete = clip delete, etc.)

**Deliverable**: Track manager, clip editor, timeline UI

### 1.4 Basic Mixer
**Objective**: Mix tracks with essential controls.

**Features**:
- Per-track volume (0-100 dB fader)
- Per-track pan (-100L to +100R)
- Mute/solo buttons
- Master volume
- Peak meters (visual only, no LUFS yet)

**Deliverable**: Mixer UI, real-time audio routing

### 1.5 Undo/Redo & Autosave
**Objective**: Protect user work, support non-destructive editing.

**Features**:
- Undo stack (limit to 100 actions)
- Redo stack
- Autosave every 30 seconds (localStorage initially, IndexedDB for larger projects)
- Session restore on page load
- Export to WAV

**Deliverable**: State management, IndexedDB schema, recovery UI

### 1.6 Phase 1 UI Refinement
**Objective**: Polish to production standard.

**Features**:
- Dark theme (black bg, chrome typography, electric blue accents)
- Responsive layout (desktop-first, then mobile)
- Loading states, error handling
- Onboarding flow (new project wizard)
- Settings panel (sample rate, buffer size, click track volume)

**Deliverable**: All screens pixel-perfect, WCAG AA compliant

---

## Phase 2: Advanced Production Features

### 2.1 Advanced Mixer
**Objective**: Professional mixing with buses, sends, and routing.

**Features**:
- Aux/bus creation (stereo mix bus, reverb bus, etc.)
- Send knobs (pre/post fader, send routing)
- Master chain (separate from mix bus)
- Channel strips with name/color customization
- Fader automation lanes (basic: volume, pan, send)

**Deliverable**: Advanced mixer UI, bus routing engine

### 2.2 Metering & Analysis
**Objective**: Help users mix to professional standards.

**Features**:
- Peak meters (per track + master, hold indicator)
- LUFS meter (broadcast standard loudness)
- Spectrum analyzer (FFT, real-time frequency display)
- Correlation meter (stereo image detection)
- Clipping indicator

**Deliverable**: Metering components, analysis algorithms

### 2.3 Effects Chain
**Objective**: Apply professional audio processing.

**Features**:
- Insert chain (up to 10 effects per track)
- Pre/post fader insert toggle
- Effect bypass per slot
- Parameter automation (record/playback automation curves)

**Built-in Effects**:
- EQ (3-band parametric)
- Compressor (threshold, ratio, attack, release, makeup gain)
- Limiter (fast safety tool)
- Delay (milliseconds, feedback, dry/wet)
- Reverb (room size, damping, width, dry/wet)
- Chorus (rate, depth, feedback)
- Saturation (drive, tone)

**Deliverable**: Effect framework, individual effect implementations (Web Audio API based)

### 2.4 Real-Time Collaboration
**Objective**: Multiple users edit the same project simultaneously.

**Architecture**:
- WebSocket transport (upgrade from HTTP)
- Operational Transformation (OT) for conflict resolution
- State sync on reconnect
- User presence indicators (who's editing what)
- Real-time cursor positions

**Features**:
- Invite link sharing (permission-based)
- Synchronized playhead (all users see same position)
- Merge conflicts (last-write-wins for initial phase)
- Activity feed (who recorded, who edited, timestamps)

**Deliverable**: WebSocket server upgrade, OT library integration, collaboration UI

### 2.5 Advanced Editing
**Objective**: Non-destructive, professional-grade editing.

**Features**:
- Time-stretching (tempo change without pitch change)
- Pitch-shifting (per-track pitch adjustment, ±12 semitones)
- Fade in/out editor
- Crossfade tool (blend overlapping clips)
- Comping (take selector for multiple recordings on one track)
- Markers & regions (loop points, section markers)

**Deliverable**: Editing tools, DSP algorithms

### 2.6 Project Management
**Objective**: Organize and navigate projects.

**Features**:
- Project list with metadata (name, BPM, key, duration, created/modified dates)
- Project templates (genre-based: hip-hop, pop, EDM, folk, etc.)
- Save/load/duplicate/delete projects
- Version history (save points, revert to earlier versions)
- Export presets (standard formats: WAV, MP3, FLAC, AIFF, stems)

**Deliverable**: Project CRUD, template system, version control

### 2.7 Phase 2 UI Refinement
**Objective**: Polish all new features to production standard.

**Features**:
- Animated metering (smooth decay, hold indicators)
- Drag-and-drop effect reordering
- Right-click context menus
- Responsive mixer resize
- Keyboard shortcuts documentation
- Help/tutorial tooltips

**Deliverable**: All screens polished, animations smooth, accessibility maintained

---

## Technical Stack

### Frontend (apps/studio)
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS + custom CSS for animations
- **Audio**: Web Audio API (no third-party audio library)
- **Real-time**: Socket.io for WebSocket
- **State**: Zustand (lightweight, no Redux overhead)
- **Components**: Shadcn/ui + custom WISE² components

### Backend (services/api)
- **Framework**: NestJS 10
- **Database**: PostgreSQL 16
- **Cache**: Redis (for collaboration session state)
- **WebSocket**: Socket.io
- **ORM**: TypeORM

### Packages
- **packages/audio**: Audio engine, effects library, recording service
- **packages/ui-components**: Shared DAW components (metering, faders, knobs)
- **packages/types**: Shared TypeScript types (Track, Clip, Project, etc.)
- **packages/api**: API client for studio

---

## Critical Path (Build Order)

1. **Audio Engine** (foundation for everything)
   - AudioContext manager
   - Track/Clip classes
   - Playback engine

2. **Recording Pipeline**
   - Microphone input handling
   - Recording service
   - WAV export

3. **Basic UI**
   - Track list
   - Transport controls
   - Waveform display

4. **Mixer**
   - Gain/pan routing
   - Volume faders
   - Mute/solo

5. **Editing Tools**
   - Timeline scrubber
   - Clip trim/split/move
   - Undo/redo

6. **Autosave & Recovery**
   - IndexedDB schema
   - Periodic snapshots
   - Session restore

7. **Effects Chain** (Phase 2)
   - Effect framework
   - Individual effect implementations

8. **Metering** (Phase 2)
   - Peak meters
   - LUFS calculation
   - Spectrum analyzer

9. **Collaboration** (Phase 2)
   - WebSocket upgrade
   - OT conflict resolution
   - Presence indicators

10. **Project Management** (Phase 2)
    - Template system
    - Version history
    - Export formats

---

## Definition of Done

✅ **Phase 1 Complete** when:
- Users can record audio from microphone
- Users can add/remove/reorder tracks
- Users can edit clips (trim, split, move)
- Users can mix tracks (volume, pan, mute/solo)
- Users can play back with timeline scrubbing
- Users can undo/redo all actions
- Users can export to WAV
- Sessions autosave every 30 seconds
- UI is polished to Fortune 500 quality
- No console errors
- < 2 second first paint
- 60 FPS animations

✅ **Phase 2 Complete** when:
- All Phase 1 features working
- Users can add effects to tracks
- Users can automate effect parameters
- Users can create aux buses and send audio
- Users can view real-time meters (peak, LUFS, spectrum, correlation)
- Multiple users can edit the same project in real-time
- Users can time-stretch and pitch-shift clips
- Users can view/restore project version history
- UI for all features is polished
- Collaboration has < 100ms latency

---

## Success Metrics

- **Quality**: Zero crashes, full error recovery, no data loss
- **Performance**: 60 FPS, < 100ms recording latency, < 100ms collaboration latency
- **UX**: Intuitive controls, discoverable features, comprehensive keyboard shortcuts
- **Reliability**: 99.9% uptime (test with load testing)
- **Accessibility**: WCAG AA compliance, keyboard navigation, screen reader support

---

**Estimated Effort**: 
- Phase 1: 2 weeks (1 architect + 1 engineer)
- Phase 2: 2 weeks (1 architect + 1 engineer)
- Total: 4 weeks to production-ready DAW

**Next Step**: Start Phase 1 implementation with audio engine.

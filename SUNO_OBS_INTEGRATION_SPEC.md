# WISE² Creative Studio — Suno + OBS Integration Spec

**Status**: Design Phase  
**Date**: 2026-07-24  
**Scope**: Sound Lab (Suno) + Live Studio (OBS)  
**Impact**: Full parity with Suno AI & OBS feature sets

---

## 🎵 Sound Lab — Suno Music Generation

### Core Features

#### 1. Text-to-Music Generation
- **Prompt input**: Text description of desired music
- **Style/Genre selector**: 50+ genres (Pop, Electronic, Hip-Hop, Classical, etc.)
- **Mood/Tempo controls**: 
  - Mood: Happy, Sad, Energetic, Calm, Dark, Uplifting
  - Tempo: 40-200 BPM (slider)
  - Duration: 10s, 30s, 60s options
- **Voice selection**: 12+ AI singer voices (male, female, various accents)
- **Vocal/Instrumental toggle**: With/without singing
- **Key/Scale control**: C-B natural, major/minor

**UI Layout**:
```
┌─────────────────────────────────────┐
│ Prompt Input (multiline textarea)   │
├─────────────────────────────────────┤
│ Genre: [Dropdown ▼] Mood: [Dropdown ▼]
│ Tempo: [━━━━•━━━] 120 BPM            │
│ Duration: [10s] [30s] [60s]          │
│ Voice: [Voice Selector ▼]            │
│ □ Vocal  ☑ Instrumental              │
│ Key: [C Major ▼]                     │
├─────────────────────────────────────┤
│ ▶ Generate (Loading: Progress ██50%) │
└─────────────────────────────────────┘
```

#### 2. Generation History & Library
- **Recent generations**: Last 20 tracks with timestamps
- **Starred/favorites**: Quick-save system
- **Search/filter**: By prompt, style, date, duration
- **Bulk export**: Download multiple generations as ZIP

#### 3. Track Management
- **Clip conversion**: Generated track → Sound Lab timeline as clip
- **Layering**: Stack multiple generated tracks
- **Mixing**: Generated tracks with recorded audio
- **Effects**: Apply reverb, EQ, compression to generated tracks
- **Export formats**: MP3, WAV, FLAC, MIDI (if instrumental)

#### 4. Advanced Controls (Phase 2)
- **Continuation**: Generate next section of existing track
- **Style transfer**: Apply one track's style to another prompt
- **Remix mode**: Modify existing generation (re-prompt same track ID)
- **Stem separation**: Isolate vocals, drums, bass, melody

### Integration Points
- **Sound Lab ClipTrack**: Generated tracks become editable clips
- **Meter system**: Monitor generation in progress
- **Transport controls**: Play/pause generated previews
- **Timeline**: Layer generated + recorded audio
- **Effects chain**: Apply to generated tracks like any clip

---

## 🎬 Live Studio — OBS Streaming Integration

### Core Features

#### 1. Scene Management
- **Scene creation**: Add/edit/delete scenes
- **Scene library**: Presets (Intro, Gameplay, Talk, Outro)
- **Scene switching**: Smooth transitions (Cut, Fade, Slide)
- **Transition duration**: 0-2000ms (100ms steps)
- **Hotkeys**: Quick-switch scenes (Ctrl+1, Ctrl+2, etc.)

**UI Layout**:
```
┌──────────────────────────┐
│ SCENES                   │
├──────────────────────────┤
│ ✓ Intro                  │ ← Active
│   Live Gameplay          │
│   Talk Show              │
│   Outro                  │
├──────────────────────────┤
│ [+ New Scene] [↑] [↓]    │
│ Transition: [Fade ▼] 300ms
└──────────────────────────┘
```

#### 2. Source Management
- **Video sources**:
  - Screen capture (full screen or window)
  - Webcam (multi-camera support)
  - Browser source (display webpage)
  - Image/slideshow
  - Video file playback
- **Audio sources**:
  - Microphone input
  - Desktop audio capture
  - Audio file playback
  - Suno generated tracks
- **Text overlays**: Chat, timer, alerts
- **Source properties**: Position, scale, rotation, opacity, crop

**Source Mixer**:
```
┌────────────────────────────────┐
│ SOURCES (Scene: Live Gameplay) │
├────────────────────────────────┤
│ ✓ Screen Capture (Display 1)   │
│   [━━━━━•━━━━] 100%            │
│   Webcam (Logitech 4K)         │
│ ✓ [━━━━━•━━━━] 85%             │
│   Microphone (USB Audio)       │
│ ✓ [━━━━━•━━━━] 90%             │
│   Desktop Audio                │
│   [━━━━━•━━━━] 70%             │
├────────────────────────────────┤
│ [+ Add Source] [↑] [↓] [×]    │
└────────────────────────────────┘
```

#### 3. Stream Settings
- **Platform selection**: Twitch, YouTube, Facebook Live, Custom RTMP
- **Resolution**: 480p, 720p (30/60fps), 1080p (30/60fps)
- **Bitrate**: Auto (2500-6000 kbps), Custom
- **Encoder**: Software (x264), Hardware (NVIDIA, AMD)
- **Stream key management**: Secure storage, auto-hide
- **Advanced**: Buffer size, rate control, preset (ultrafast→slower)

**Stream Config**:
```
┌─────────────────────────────────┐
│ STREAM SETTINGS                 │
├─────────────────────────────────┤
│ Platform: [Twitch ▼]            │
│ Resolution: [1080p ▼] @60fps    │
│ Bitrate: [6000 ▼] kbps (Auto)   │
│ Encoder: [x264 ▼]               │
│ Stream Key: ••••••••••••••••••   │
│            [👁️ Show] [🔄 Reset] │
├─────────────────────────────────┤
│ [Test Stream] [Apply]           │
└─────────────────────────────────┘
```

#### 4. Live Controls
- **Start/Stop**: Go live / Stop streaming
- **Pause/Resume**: Pause stream without disconnecting (30s max)
- **Status indicator**: Connected, Streaming, Disconnected, Reconnecting
- **Bitrate monitor**: Real-time kbps
- **Frame drop counter**: Skipped/rendered frames
- **Stream health**: Traffic, Encoding load, Network latency

**Transport Bar**:
```
┌──────────────────────────────────────┐
│ ⏺️ LIVE (2:34:12)  ↗️ 5200 kbps  📊 2% │
│ [||] Pause  [⊡] Stop  [🔊 Mute]     │
│ Network: Good | FPS: 60/60 | CPU: 45% │
└──────────────────────────────────────┘
```

#### 5. Chat & Overlay
- **Chat widget**: Live Twitch/YouTube chat display
- **Chat alerts**: Moderator notifications, new follower alerts
- **Overlay templates**:
  - Webcam border (custom frame)
  - Chat overlay (side/bottom)
  - Alerts (top-right: follows, subs, tips)
  - Timer/clock
  - Browser source docking
- **Custom overlays**: Text, image, media layers

#### 6. Recording
- **Local recording**: Save stream to disk alongside broadcast
- **Format**: MP4 (H.264), MKV (lossless option)
- **Separate tracks**: Video + audio tracks for post-editing
- **Auto-split**: Break into 1GB/5GB chunks
- **Recording folder**: Organized by date

**Recording Controls**:
```
Record: ⭕ (Not recording)
[🔴 Start Recording] [Recordings: 24]
```

#### 7. Analytics & Stats
- **Real-time dashboard**:
  - Peak viewers, current viewers
  - Average bitrate, frame drops
  - Encoding time (% of real-time)
  - Network fluctuations
- **Stream history**: Past 30 days
- **Peak times**: When viewers peak
- **Platform-specific data**: Twitch (followers gained), YouTube (likes)

#### 8. Advanced Features (Phase 2)
- **Multistreaming**: Broadcast to 3+ platforms simultaneously
- **VOD management**: Auto-upload to YouTube, archive to S3
- **Clip creation**: Quick highlight clips during stream
- **Guest streaming**: Invite co-hosts (share webcam)
- **Replay buffer**: 10-60s instant replay capture
- **Studio mode**: Separate preview/live views

### Integration Points
- **Creative Studio nav**: Live Studio module in sidebar
- **Sound Lab tracks**: Use generated/recorded audio as stream source
- **Command Center stats**: Stream metrics dashboard
- **Notifications**: Stream alerts in activity feed
- **Mobile control**: Stream from phone (minimal UI)

---

## 🏗️ Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Suno:**
- Text-to-music prompt UI
- API integration (polling for generation status)
- Basic history/library view
- Generated track → Sound Lab clip conversion

**OBS:**
- Scene management (CRUD)
- Basic video source capture (screen, webcam)
- Stream start/stop with hardcoded RTMP
- Status indicator

### Phase 2: Full Feature Parity (Week 3-4)
**Suno:**
- All control selectors (genre, mood, tempo, voice, duration)
- Advanced audio effects on generated tracks
- Starred/favorites system
- Bulk export

**OBS:**
- All source types (browser, image, audio files)
- Smooth scene transitions
- Platform settings (Twitch, YouTube, Facebook)
- Stream settings (resolution, bitrate, encoder)
- Real-time stats dashboard

### Phase 3: Polish (Week 5)
**Suno:**
- Style transfer, continuation, stem separation
- Remix mode
- Better previews

**OBS:**
- Chat overlay integration
- Recording with separate tracks
- Multistreaming
- Mobile stream control

---

## 📊 Data Model

### Suno Track (Generation)
```typescript
interface SunoGeneration {
  id: string;
  prompt: string;
  style: string;              // 'pop', 'electronic', etc.
  mood: 'happy' | 'sad' | 'energetic' | 'calm' | 'dark';
  tempo: number;              // 40-200 BPM
  duration: 10 | 30 | 60;     // seconds
  voice: string;              // voice ID
  instrumental: boolean;
  key: string;                // 'C Major', etc.
  audioUrl: string;           // S3/CDN URL
  status: 'queued' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  error?: string;
  starred: boolean;
  clipId?: string;            // linked Sound Lab clip
}
```

### OBS Scene
```typescript
interface OBSScene {
  id: string;
  name: string;
  sources: OBSSource[];
  transitionType: 'cut' | 'fade' | 'slide';
  transitionDuration: number; // ms
  isActive: boolean;
  order: number;
}

interface OBSSource {
  id: string;
  name: string;
  type: 'screen' | 'webcam' | 'browser' | 'image' | 'video' | 'audio';
  properties: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    url?: string;
    device?: string;
    volume?: number;
  };
  visible: boolean;
}

interface StreamSession {
  id: string;
  platform: 'twitch' | 'youtube' | 'facebook' | 'custom';
  rtmpUrl: string;
  streamKey: string;
  resolution: '480p' | '720p' | '1080p';
  fps: 30 | 60;
  bitrate: number;
  status: 'idle' | 'streaming' | 'paused';
  startedAt?: Date;
  stats: {
    viewers: number;
    bitrate: number;
    frameDrops: number;
    encodingTime: number;
  };
}
```

---

## 🎯 Success Criteria

### Suno Integration
- ✅ Generate 5+ tracks/day from prompts
- ✅ Convert any generated track to Sound Lab clip in <1s
- ✅ Layer generated + recorded audio on same timeline
- ✅ Export as MP3, WAV, FLAC
- ✅ <30s generation latency (avg)

### OBS Integration
- ✅ Manage 10+ scenes smoothly
- ✅ Switch scenes <100ms
- ✅ Stream to Twitch/YouTube/Facebook
- ✅ <5% dropped frames at 1080p60
- ✅ Real-time stats accurate within 5% of OBS

### User Experience
- ✅ No page reloads during generation/streaming
- ✅ Stream controls work on mobile (touch-friendly)
- ✅ Chat overlay keeps up with stream chat
- ✅ Dark theme consistent with WISE² branding

---

## 💾 Storage & API Strategy

### Suno Backend
- **API**: Integrate with Suno API (or self-host inference)
- **Storage**: S3 for generated MP3s
- **Database**: Store generation metadata (Postgres)
- **Queue**: Redis for generation job queue

### OBS Backend
- **RTMP server**: Nginx RTMP module (or custom Node.js server)
- **Storage**: Local disk for stream recordings
- **Streaming protocols**: RTMP (ingest), HLS/DASH (playback)
- **Database**: Stream sessions & stats (Postgres)

---

## 🚀 Deployment

### Local Development
```bash
# Start Suno API mock server
npm run dev:suno-api

# Start OBS RTMP server
npm run dev:obs-server

# Run dashboard
cd apps/studio && npm run dev
```

### Production
- Suno API: Integrate with official Suno API
- OBS: Self-hosted RTMP + HLS server (EC2 + nginx)
- CDN: CloudFront for generated audio delivery
- Database: RDS (Postgres) for metadata

---

## 📋 Dependencies

### Frontend
- `zustand`: State management (extend for Suno + OBS state)
- `react-hook-form`: Form handling (prompts, settings)
- `socket.io-client`: Real-time streaming updates
- `hls.js`: Stream playback (HLS)
- `wavesurfer.js`: Audio waveform display (generated tracks)

### Backend
- `suno-api` (npm package or custom wrapper)
- `node-rtmp-server` or `nginx` + `node.js` shim
- `ffmpeg-fluent`: Audio/video encoding
- `redis`: Job queue for generations
- `postgres`: Metadata storage

---

## 📝 Next Steps

1. **Confirm scope**: User approves full feature set
2. **API selection**: Choose Suno API vs self-host
3. **Infrastructure**: Provision RTMP server + storage
4. **Phase 1 implementation**: Text-to-music + basic OBS
5. **Phase 2 expansion**: Full feature parity
6. **Phase 3 polish**: Advanced features + performance

**Estimated Timeline**: 4-6 weeks for full implementation  
**Complexity**: High (new external integrations, real-time streaming)  
**Priority**: 🔴 High (core Creative Studio differentiator)


# WISE² Creative Studio — Complete Specification

**Derived from**: `/Downloads/wise2new.zip` — design prototype (WISE2 Creative Studio.dc.html)  
**Date Extracted**: 2026-07-19  
**Status**: Rebuild as production Next.js app starting Task #2

---

## Overview

A dense, pro-tool dashboard for creators to manage audio production, live streaming, AI music generation, voice cloning, and content manufacturing across seven integrated pages.

**Aesthetic**: Dark command center (OLED-optimized `#050505` bg), neon green (#39FF14) accents, Orbitron + Rajdhani fonts, canvas-heavy visualizations.

**Brand Accent**: All mockup green references are `#39FF14` per `WISE2_DESIGN_SYSTEM.md`. Updated `apps/studio/tailwind.config.js` to add `wise-accent` tokens.

---

## Architecture

### State Model (Zustand store)

```typescript
type CreativeStudioState = {
  page: 'command' | 'sound' | 'live' | 'jingle' | 'voice' | 'factory' | 'showcase';
  paletteOpen: boolean;
  paletteQ: string; // command palette search
  notifOpen: boolean;
  profileOpen: boolean;
  assistantOpen: boolean;
  
  // Live metrics
  playing: boolean;
  isLive: boolean;
  liveSecs: number; // uptime seconds
  viewers: number;
  chatRate: number; // messages/min
  credits: number;
  
  // Sound Lab
  playing: boolean;
  tempoRaw: number;
  durationRaw: number;
  tracks: Track[];
  fx: FXUnit[];
  audioChans: AudioChannel[];
  
  // Live Studio
  isLive: boolean;
  sceneSel: number;
  previewSel: number;
  transSel: number;
  sources: VideoSource[];
  overlays: Overlay[];
  outputs: StreamOutput[];
  chat: ChatMessage[];
  aiFeed: AIActivityItem[];
  
  // Jingle Lab
  genActive: boolean;
  genPct: number;
  jingles: Jingle[];
  
  // Voice Lab
  voiceSel: number;
  vParams: Record<string, number>; // Stability, Similarity, Style Exaggeration, Energy, Confidence
  pauses: boolean;
  
  // Content Factory
  factorySel: number; // 0-7 (Images, Videos, Shorts, Ads, Voiceovers, Emails, Blogs, Landing Pages)
  factoryPrompt: string;
  factoryItems: FactoryItem[];
  
  // Client Showcase
  gFilter: 'All' | 'Audio' | 'Video' | 'Live' | 'Brand';
  
  // Checkout
  checkoutOpen: boolean;
  packSel: number;
  paying: boolean;
  payDone: boolean;
};
```

### Pages (7 total)

#### 1. Command Center (Default)

**Purpose**: Dashboard overview of studio health, recent activity, KPIs, and quick-access shortcuts.

**Sections**:
- **Top KPIs** (4 cards): Assets Produced (312), AI Generations (1,486), Stream Watch Time (412h), Revenue Attributed ($18.9K) — all with delta % and sub-label
- **Activity Feed** (6 items): MASTER, CLIP, VOICE, RENDER, PUBLISH, SYNC — with timestamp
- **Quick Actions** (4 buttons): New Mix Session, Go Live Now, Generate Jingle, Batch Content Run
- **Recommendations** (3 items): Strategic suggestions based on usage patterns

**Canvas**: None. Chart placeholders for future integration.

---

#### 2. Sound Lab

**Purpose**: Multi-track mixer and audio editor for mastering, mixing, and voice synthesis.

**Sections**:
- **Waveform Editor** (top, 60% height)
  - Canvas: Horizontal waveform with playhead
  - Mode: Mono (sum of all tracks)
  - Time format: HH:MM:SS.FF (frame-based)
  - `drawEditor()` implementation: 420 bars, sin-wave overlay, green (#39FF14) for played section, dim (#1f4d18) for unplayed
  
- **Master Meter** (right side of editor, 60px wide)
  - Canvas: Dual stereo LEDs (24 segments each)
  - `drawMeter()` implementation: L/R channels, color gradient (green < -3dB, yellow -3 to 1, red > 1)
  
- **7 Tracks Mixer** (left column, 80% height)
  - Each track row:
    - Fader (vertical, draggable) with dB readout
    - Mute button (toggles red accent)
    - Solo button (toggles green accent)
    - Volume percentage
  - Track list: 808, Snare, Hats, Bass, Keys, Melody, Vocal
  
- **FX Chain** (4 effects, collapsible)
  - Name, on/off toggle, amount knob (0–100%)
  - FX: Parametric EQ, Compressor, De-Noise AI, Saturator
  - Color: Green accents when active, gray when off
  
- **Transport** (top bar)
  - Play/Pause button (toggle ► / ❚❚)
  - Time display (HH:MM:SS.FF format)
  - Auto-save status ("AUTO-SAVED" or "SAVED")
  
- **Edit Tools** (horizontal tabs)
  - Cut, Fade, Loop, Stretch, Normalize (UI only, no canvas)
  
- **AI Tools** (collapsible panel)
  - 6 cards: AI Mastering, Stem Splitter, Noise Reduction, Vocal Enhancer, Pitch Correct, Beat Generator
  - Each: name + description, click-to-run button

**Canvas animations**:
- `drawEditor()`: Waveform playback loop, playhead advances with time
- `drawMeter()`: Live metering, responds to simulated audio levels
- No scroll animation needed, but canvas must gate to Sound Lab page visibility

---

#### 3. Live Studio

**Purpose**: Real-time broadcast control with scene switching, source management, chat integration, and AI assistance.

**Sections**:
- **Program/Preview** (top half, dual-canvas or grid)
  - Scene buttons (numbered 1–6): each shows preview + program + transition selection
  - Scene colors: Red border for active ("PGM"), green border for preview ("PVW"), gray for inactive
  - Transition selector: Cut, Glitch, Fade, Stinger (tab buttons)
  - "Take Cut" button swaps preview ↔ program
  - Live indicator: Green dot + viewer count + chat rate at top
  
- **Sources** (left sidebar, 6 items)
  - Camera A — FX6 (SDI), Camera B — Wide (SDI), Screen — Sound Lab (CAPTURE), Browser — Alerts (WEB), Media — Intro Loop (FILE), Guest — Daniel (WRTC)
  - Each: on/off toggle, kind label
  
- **Audio Mixer** (left sidebar, 4 channels)
  - Mic — SM7B, Guest — Daniel, Music Bed, System / VT
  - Each: fader, dB readout, mute toggle
  - Canvas: `drawHMeter()` for each channel (4 instances, ~24 segments)
  
- **Overlays** (left sidebar, 4 toggles)
  - Lower Third — Host, Brand Frame, News Ticker, Chat on Screen
  
- **Output Destinations** (right sidebar, 5 platforms)
  - YouTube (842 watching), Twitch (511 watching), TikTok Live (389 watching), Facebook (off), Custom RTMP (off)
  - Each: on/off toggle, viewer count or "off"
  
- **Chat Panel** (bottom right, 8 messages shown)
  - Recent messages + draft input
  - User-colored (green, gold, or white)
  - Character count or validation on send
  
- **AI Activity Feed** (right sidebar, 5 events)
  - Tags: SWITCH, CLIP, MOD, CAPTION, CHAPTER
  - Real-time updates as stream progresses ("now", "2m", "5m", etc.)
  
- **Stream Controls** (top bar)
  - Go Live / End Stream button (green when off, red when live)
  - REC button (always red)
  - Save Replay button
  - Clip Last 30s button
  - Live duration (HH:MM:SS format)
  - Bitrate display (dynamic, e.g., "5.8 Mbps")
  - Captions display (subtitle text from caption rotation)
  
- **Stream Archive** (collapsible, 3 recent broadcasts)
  - Name, date, duration, file size, clip count

**Canvas animations**:
- `drawViz()`: Spectrum bars (26 bars × 4px gap) for live feed visualization
- `drawHMeter()`: 4 horizontal channel meters (24 segments each)
- Both gate to Live Studio visibility

---

#### 4. Jingle Lab

**Purpose**: AI-assisted commercial music generation for brands.

**Sections**:
- **Brand Brief Form** (top, 2 rows × 2 cols)
  - Business Name (text input)
  - Genre (dropdown/select)
  - Duration (slider: 5–60s, default 30s)
  - Tempo (slider: 80–140 BPM, default 124 BPM)
  
- **Generation Progress** (center, only shown while `genActive`)
  - Progress bar (0–100%)
  - Stage label (changes at 30%, 60%, 90%): "Writing hook & lyrics…" → "Composing melody + harmony…" → "Rendering vocals…" → "Mastering…"
  - Cancel or wait button
  
- **Jingle Templates** (sidebar, 8 templates)
  - Podcast Intro (15–20s), Radio Sweeper (5–8s), TV/YouTube Intro (10s), Business Jingle (30s), Hold Music (60s), Background Bed (2–3min), DJ Drop (3–5s), Event Stinger (6s)
  - Click to select template (pre-fills form)
  
- **Jingle History** (main area, 5–6 items)
  - Each: Name, metadata (genre, voice, date, duration)
  - Playback controls (simulated, no real audio backend yet)
  - Download link (mock)
  
- **Canvas**: `drawSmooth()` for jingle preview waveform (if playing)

---

#### 5. Voice Lab

**Purpose**: AI voice cloning and text-to-speech generation.

**Sections**:
- **Voice Selector** (top, 5 voice cards)
  - Wise Deep (Flagship · ads & intros)
  - Street CEO (Confident · promos)
  - Midnight FM (Smooth · late-night reads)
  - Coach K (High energy · fitness)
  - Casa Verde ES (Spanish · warm retail)
  - Active voice highlighted (green border)
  
- **Voice Parameters** (4–5 sliders, 0–100%)
  - Stability, Similarity, Style Exaggeration, Energy, Confidence
  - Readout in %
  - Real-time preview (Canvas: `drawSmooth()` waveform)
  
- **Generation Form** (middle section)
  - Text input (multiline) for script
  - "Pauses" toggle (on/off)
  - Format selector: WAV, MP3, FLAC
  - Generate button
  
- **Clone New Voice** (collapsible section)
  - Audio upload (reference samples)
  - Progress bar
  - Confirmation when ready
  
- **Canvas**: `drawSmooth()` for voice preview envelope

---

#### 6. Content Factory

**Purpose**: Batch generation of marketing materials (videos, emails, blogs, landing pages, ads, etc.).

**Sections**:
- **Content Type Selector** (top tabs, 8 types)
  - Images, Videos, Shorts, Ads, Voiceovers, Emails, Blogs, Landing Pages
  - Tab colors: Active is green with green border; inactive is dark gray
  
- **Batch Prompt** (text area + Generate button)
  - Prompt input
  - Generate button (launches new batch)
  
- **Render Queue** (grid or list, 8 items visible)
  - Each item: Name, kind (e.g., "VIDEO 9:16"), metadata (e.g., "Reels · TikTok"), status badge (RENDERING, READY, LIVE)
  - Rendering items: Show progress spinner + throbbing style
  - Ready items: Show thumbnail gradient + action buttons (Export, Publish, Preview)
  - Status color: Yellow (RENDERING), Green (READY), Red (LIVE)

---

#### 7. Client Showcase

**Purpose**: Portfolio gallery of completed projects with case study metrics.

**Sections**:
- **Filter Tabs** (top, 5 filters)
  - All, Audio, Video, Live, Brand
  - Active filter highlighted in green
  
- **Gallery** (6 case study cards)
  - Each card:
    - Image (dan.png, darrin.png, or image-slot placeholder)
    - Project title
    - Client name
    - Metric (e.g., "+188%", "2.4M", "412h")
    - Metric label (e.g., "signups after launch", "views in 30 days")
    - Modules used (e.g., "Content Factory · Voice Lab")
  - On filter: Show only matching cards (All shows all 6)

---

## Shell Architecture

### Top Bar
- **Left**: WISE² logo (Orbitron, white gradient + neon accent glyph)
- **Center**: "Creative Studio" label + current page breadcrumb
- **Right**: 
  - Credits display (e.g., "7,214")
  - Notifications button (badge + dropdown)
  - Profile button (dropdown: Profile & Brand Kit, Theme, Shortcuts, AI Providers, Sign Out)

### Left Navigation (Always Visible)
- **Logo + Title** (top)
- **7 Page Buttons** (CC, SL, LV, JL, VL, CF, SH)
  - Active: Green border + background
  - Live indicator: Red dot on LV (Live Studio) when `isLive: true`
- **Assistant Toggle** (bottom, if `showAssistant: true`)

### Command Palette (Cmd+K / Ctrl+K)
- **Search Input**: Real-time filtering (9 results max)
- **Result Tags**: GO TO, AI, RUN, EXPORT, PAY
- **Results**:
  - 7 navigation commands (one per page)
  - "Master current mix", "Generate highlight clips", "Start broadcast", "New jingle", "Batch content", "Export WAV", "Buy AI credits"
- **Escape**: Closes palette
- **Arrow keys**: Navigate results (TODO: not in mockup, but UX requirement)
- **Enter**: Execute selected result

### Checkout Modal (Credit Packs)
- **Escape**: Closes modal (UX requirement — not in mockup)
- **Credit Packs**: 3–5 options (pack name, amount, price)
- **Payment Form**: Stripe Elements (real, not simulated)
- **Success State**: Confirmation message
- **All fields accessible via keyboard** (TODO: tab order audit)

### AI Assistant Panel (Optional)
- **Toggle**: Bottom-left nav or command palette
- **Content**: Page-specific suggestion (6 different tips per page)
- **Action Button**: "Got it" or "Let's do it"

---

## Canvas Visualization API

### drawEditor() — Waveform + Playhead
```
Context: 2D canvas
Signature: drawEditor()
Inputs: this.wave (420 bars), this.ph (playhead 0–1), this.state.playing
Outputs: Drawn waveform + playhead + anticipation tail

Behavior:
- Clear canvas
- Draw horizontal center line (dark)
- For each bar i in wave (420):
  - played = i/n < ph
  - wob (wobble) = 1 + 0.12 * sin(phase*6 + i) if played & playing
  - color = played ? green : dim
  - height = wave[i] * H * 0.44 * wob
  - fillRect(bar position, center ± height, bar width, height*2)
- Draw playhead line (green, 2px, full height)
- Draw anticipation tail (green, 15% opacity, 26px wide)
```

### drawMeter() — Stereo LED Master Meter
```
Context: 2D canvas
Signature: drawMeter()
Inputs: this.state.playing, this.phase (for animation)
Outputs: Drawn L/R channel meters (22 segments each, color-graded)

Behavior:
- Clear canvas
- Compute level lv: 0.62 + 0.3 * sin oscillation if playing, else 0.05
- For each channel (L @ x=4, R @ x=W/2+2):
  - For each segment (22 total):
    - on = segment / 22 < level
    - color = off: gray (#161616), on: green < -3dB, yellow -3 to 1, red > 1
    - fillRect(segment position)
```

### drawViz() — Spectrum Bars
```
Context: 2D canvas
Signature: drawViz(canvas, bars=26, gap=4)
Inputs: bars, gap, this.phase (for animation)
Outputs: Drawn bar spectrum (26 bars)

Behavior:
- Clear canvas
- For each bar (26):
  - height = H * (0.15 + 0.8 * abs(sin oscillation))
  - alpha = 0.5 + 0.5 * (height / H)
  - fillRect(bar position, green)
```

### drawHMeter() — Horizontal Channel Meter
```
Context: 2D canvas
Signature: drawHMeter(canvas, channelIndex)
Inputs: this.state.audioChans[i], this.phase
Outputs: Drawn horizontal meter (24 segments)

Behavior:
- Clear canvas
- Compute level lv: (channel.vol / 100) * sine oscillation if live & not mute, else 0
- For each segment (24):
  - on = segment / 24 < level
  - color: off gray, on green < -18dB, yellow -18 to -6, red > -6
  - fillRect(segment position, green)
```

### drawSmooth() — Glow Envelope Waveform
```
Context: 2D canvas
Signature: drawSmooth(canvas)
Inputs: this.phase (for animation)
Outputs: Drawn smooth curve (green, with glow)

Behavior:
- Clear canvas
- Set strokeStyle green + shadowColor/shadowBlur for glow
- beginPath() + moveTo start
- For i in 0..W step 4:
  - t = i / W
  - env = sin(t * π)
  - y = mid + env * mid * 0.8 * sin(t*34 + phase*3) * modulation
  - lineTo(i, y)
- stroke()
```

---

## Performance Constraints

### Page Visibility Gating
Each canvas should **only draw when its page is active**, not in a global rAF loop. Implement via React visibility API or page state check:
```typescript
useEffect(() => {
  if (page !== 'sound') return; // Don't draw if not on Sound Lab
  const raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}, [page]);
```

### Numeric Falsy Rendering
Use explicit ternary, not `&&`, for counts:
```typescript
{viewers ? <Badge>{viewers}</Badge> : null} // Correct
// NOT: {viewers && <Badge>{viewers}</Badge>} // Renders "0" as literal text
```

### Keyboard Navigation
- Command palette: Cmd+K (Mac) / Ctrl+K (Win)
- Close: Escape (palette, notif, profile, **and checkout modal**)
- Tab order: Navigation, form inputs, palette results (TODO: implement)
- Arrow keys in palette: Navigate results, Enter to select (TODO: implement)

---

## Design Tokens (Updated in tailwind.config.js)

| Token | Value | Usage |
|---|---|---|
| `wise-accent` | #39FF14 | Primary interactive elements, accents, glows |
| `wise-accent-dim` | #1f4d18 | Inactive/unplayed areas |
| `wise-accent-soft` | #9be07c | Secondary highlights |
| `wise-accent-bright` | #b6ff9e | Hover states |
| `wise-chrome` | #BFC4C9 | Secondary accents, details |
| `studio-bg` | #050505 | Canvas/page background |
| `studio-panel` | #0a0a0a | Panel backgrounds |
| `studio-raised` | #111111 | Elevated components |
| `studio-input` | #161616 | Input fields, controls |
| `studio-line` | #262626 | Borders, dividers |
| `studio-meter-off` | #181818 | Inactive meter segments |

---

## Existing Components to Reconcile

The rebuild should layer on (not duplicate) these existing pieces:

| Existing | Location | Integration |
|---|---|---|
| Billing (Stripe) | `components/Billing/` | Use for checkout modal instead of mockup fake |
| Mixer | `components/Shared/Mixer/` | Reconcile with Sound Lab track mixer |
| Live Streaming | `components/LiveStreaming/` | Reconcile with Live Studio |
| Live Studio | `components/LiveStudio/` | Check for overlap with Live Studio page |
| Audio Engine | `packages/audio/` | Reference for sound playback, if real |

---

## Out of Scope (Production Later)

- Real AI backends (Suno/Kling/Ollama for music/voice/video generation)
- Real live streaming (RTMP, WebRTC, HLS)
- Real chat backend (Socket.io exists but not wired)
- Audio processing (Tone.js hooks exist but not integrated)
- Database persistence (Prisma schema exists but no models yet)

All seven pages will ship with **mock data and UI-only handlers** — ready to wire real services without redesign.

---

## Files Modified

- `apps/studio/tailwind.config.js` — Added wise-accent tokens, fonts, animations
- `apps/studio/public/showcase/` — Added 5 images (daniel.png, darrin.png, concept-01/02/03.png)
- TBD: `apps/studio/CREATIVE_STUDIO_SPEC.md` (this file)

---

## Acceptance Criteria (Per Task)

**Task #2 (Shell)**: Nav, top bar, palette, notif dropdown, profile dropdown, assistant toggle all render and toggle correctly.

**Task #3 (Canvas)**: drawEditor, drawMeter, drawViz, drawHMeter, drawSmooth all render with correct color/animation and gate to page visibility.

**Task #4 (Command Center + Showcase)**: KPI cards, feed, quick actions, and gallery filters render with correct data binding. Image slots placeholder correctly.

**Task #5 (Sound Lab + Live Studio)**: Mixer faders draggable, scene buttons switch state, outputs toggle, chat input sends. Canvas animations play.

**Task #6 (Jingle + Voice + Factory)**: Generation progress bars animate, voice params update smoothly, factory items render with correct status colors.

**Task #7 (Checkout + Verify)**: Stripe checkout modal opens/closes, Escape closes it, dev server runs at localhost:3003, no console errors, all 7 pages accessible.


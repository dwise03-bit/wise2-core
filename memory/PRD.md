# WISE² Sound Labs — PRD

## Original Problem Statement
User provided a screenshot of "WISE² ENTERPRISE — Sound Labs" and said: *"We need this up and running looking just like this. Everything needs to function."*

## User Choices (verbatim)
- AI Assistant name: **Hermes** (Claude Sonnet 4.5 via Emergent Universal Key)
- Admin login: `dwise@wise2.net` / `Glock19!`

## Architecture
- **Frontend**: React 18 (CRA + Craco) + Tailwind + Radix UI + Framer Motion + Sonner toasts + Recharts + **Tone.js** (real audio synthesis)
- **Backend**: FastAPI + Motor (async MongoDB) + bcrypt + PyJWT + emergentintegrations (Claude Sonnet 4.5)
- **Database**: MongoDB (`wise2_soundlabs`) — collections: users, projects, activity, plugins, notifications, hermes_sessions
- **Auth**: JWT bearer token (7d), bcrypt password hashing, admin auto-seeded on startup

## Implemented Modules (2026-01-15)
### Sound Labs Dashboard (fully functional, matches screenshot)
- **Sidebar** — 18 nav items (Dashboard, AI, Sound Labs, Business, Infrastructure, Deployments, Cyber Security, Communications, Storage, Inventory, Fleet, Training, Projects, Analytics, Automation, Store, Finance, Documents)
- **Header** — Global search (with live results), System Status LED, Notifications dropdown (unread counter, mark all read), Settings/Help buttons, Admin user badge with logout
- **Hero Banner** — Studio image + CREATE/PRODUCE/MASTER/DISTRIBUTE quick actions + secondary action bar (New Project/Record/Import/Beat Maker/AI Master/Publish)
- **Studio Status** — Sample Rate/Bit Depth/Buffer/Latency + live pulsing status LED + decorative waveform
- **Active Projects** — CRUD-backed list, click-to-select, current project highlighted with cyan border, per-project mini-waveforms, links into transport bar
- **Studio Overview** — Live stat cards (Projects/Tracks/Beats/Plugins) + 4 live-updating sparklines (CPU/Memory/Disk/Network — refresh every 3s)
- **Recent Activity** — Backend-fed feed
- **Hermes AI Chat** — Full multi-turn chat with **Claude Sonnet 4.5** via Emergent Universal LLM Key. Session persistence in MongoDB (`hermes_sessions`). Verified end-to-end (giving real mixing/mastering advice).
- **Audio Meters** — 6 live LED-segment VU meters (IN/DRUMS/BASS/VOCALS/MELODY/MASTER) with green/yellow/orange/red thresholds and live dB readouts, requestAnimationFrame-driven
- **Beat Maker** — 16-step sequencer with 6 tracks (Kick/Snare/HiHat/808/Clap/Perc), **real Tone.js playback** (MembraneSynth, NoiseSynth, MetalSynth), tempo control, key selector, live step indicator
- **Plugins & Effects** — 5 real plugins with persistent ON/OFF toggles (FabFilter, Waves CLA-76, iZotope Ozone 11, Valhalla, Soundtoys)
- **Sound Library** — 6 category cards with counts (Drum Kits 245, Loops 1432, One Shots 3982, Vocal Presets 426, Instruments 158, Sound FX 892)
- **Transport Bar** — Fixed bottom bar with now-playing (project name/artist), play/pause/prev/next/shuffle/repeat, clickable waveform scrubber (120 bars), volume slider, queue/EQ/expand buttons
- **Login page** — Branded WISE² sign-in form
- **Protected routing** — JWT-guarded routes

## Backend API Endpoints
- `/api/auth/login`, `/api/auth/me`
- `/api/projects`, `/api/projects/{id}/select`
- `/api/stats/overview`, `/api/stats/resources`, `/api/stats/studio`
- `/api/activity`
- `/api/notifications`, `/api/notifications/read`
- `/api/plugins`, `/api/plugins/{id}/toggle`
- `/api/library`
- `/api/search`
- `/api/hermes/chat`, `/api/hermes/history/{session_id}`

## Backlog / Next Steps
- **P1** Individual routes for remaining sidebar modules (Dashboard/AI/Business/Infrastructure/etc — currently placeholder pages)
- **P1** Waveform per Active Project driven by actual audio buffer (WaveSurfer.js) once track uploads implemented
- **P2** Track upload + audio file playback (backend blob storage)
- **P2** Save/load beat maker patterns per project
- **P2** Master output routed through Tone.js Meter → real levels feeding VU meters
- **P2** Multi-user + roles

## Enhancement Idea
Ship a **"One-Click Master"** button that streams the current project through Hermes AI's mastering pipeline (analyze → suggest EQ/compression settings → apply preset). Boosts stickiness and gives producers a clear reason to upgrade — perfect gateway to a paid "Studio Pro" tier.

# WISE Defense — Meta Quest + Shooters Global Virtual Training

## Product decision

Build WISE Defense Training as a native Unity/OpenXR application for Meta Quest 3S and Quest 3, with Shooters Global timer support through the vendor's public BLE API v3.2.

The website remains the account, course catalog, enrollment, results, and instructor portal. The Quest application owns the immersive training loop. A small mobile/desktop companion bridge owns timer discovery, pairing, firmware compatibility checks, and reliable synchronization where direct Quest BLE access is unavailable or unstable.

## User experience

1. User creates an account at `wisedefensellc.com` and enrolls in a training path.
2. User installs the WISE Defense Quest app and signs in with a one-time code.
3. App checks play-area, guardian, headset, controller/hand-tracking, and safety acknowledgements.
4. User selects a drill: dry-fire fundamentals, draw-to-first-shot, controlled pairs, reload, movement, awareness, or decision/de-escalation scenario.
5. App pairs to a Shooters Global timer, selects a preset, and confirms connection before the drill starts.
6. Timer sends the start signal and shot events. Quest records pose, target outcome, decision events, and scenario state against the same session clock.
7. Results show first-shot time, splits, shot count, accuracy, penalties, reaction time, and safety/decision outcomes.
8. Session is stored locally first, then synced to the WISE Defense API. The website displays progress and instructor review.

VR is supplemental training and does not replace live-fire qualification, certified instruction, or compliance with applicable law.

## Integration architecture

```text
Shooter's Global timer
        │ BLE API v3.2
        ▼
Timer adapter (native BLE)
        │ normalized events
        ├──────────────► Unity Quest app
        │                 ├─ scenario engine
        │                 ├─ scoring engine
        │                 └─ local session journal
        ▼
WISE Defense API
        ├─ users / enrollments
        ├─ drill definitions
        ├─ session results
        └─ instructor analytics
        ▲
        │ HTTPS sync
Website / instructor portal
```

### Normalized timer events

```ts
type ShotTimerEvent =
  | { type: "connected"; deviceId: string; model: "SG_TIMER" | "SG_TIMER_2" | "SG_TIMER_GO" }
  | { type: "session_started"; timerTimestampMs: number; parTimeMs?: number }
  | { type: "shot"; index: number; timerTimestampMs: number; splitMs?: number }
  | { type: "session_ended"; timerTimestampMs: number }
  | { type: "disconnected"; reason: string };
```

The Quest app must use the timer's first authoritative session timestamp as the timing origin. Do not calculate shot time from rendered frames or audio latency. Store both the timer timestamp and the Quest monotonic timestamp for diagnostics.

## MVP scope

### Quest app

- Meta Quest 3S/3, seated or standing mode
- Guardian and safety gate
- Controller input first; hand tracking as an optional interaction layer
- One training room and three drills
- Dry-fire mode with inert virtual equipment only
- Timer connection status and start/stop state visible in-headset
- Basic shot-to-target scoring and session replay summary
- Offline session queue with retry-safe sync

### Website

- `/training` course catalog
- `/training/session/[id]` results and progress
- `/instructor` roster, completion, and drill analytics
- Quest sign-in code generation
- Timer setup and compatibility instructions
- Clear supplemental-training, age, privacy, and liability notices

### Defer until validation

- Dynamic AI dialogue
- Multiplayer instructor observation
- Hardware-specific haptic/trigger certification
- State-specific certification claims
- Live-fire video overlays and range integrations

## Backend contracts

`POST /api/training/device-sessions`

Creates a short-lived Quest sign-in session and returns a pairing code.

`POST /api/training/sessions`

Creates a local-first training session with `clientSessionId`, drill version, device metadata, and timer model.

`POST /api/training/sessions/:id/events`

Accepts idempotent event batches. Every event includes `eventId`, `sequence`, `timerTimestampMs`, `questTimestampMs`, and `payload`.

`POST /api/training/sessions/:id/complete`

Finalizes scoring only after all event batches are present or explicitly marked unavailable.

`GET /api/training/me/progress`

Returns course completion, best times, consistency, accuracy, and instructor feedback.

## Timer adapter requirements

- Implement the Shooters Global BLE API v3.2 exactly from the vendor documentation.
- Match service UUID `7520FFFF-14D2-4CDA-8B6B-697C554C9311`.
- Support SG Timer, SG Timer 2, and SG Timer GO device identifiers.
- Handle pairing, reconnect, notification subscription, clock/session synchronization, and firmware incompatibility.
- Never silently fall back to microphone timing when a timer is selected; label microphone timing as a separate lower-confidence mode.
- Log raw BLE packets only in a development diagnostic mode; do not retain them by default.

## Safety and launch gates

- Legal review of training claims, disclaimers, age gating, and state-by-state positioning.
- Curriculum review by a qualified firearms instructor and a safety/de-escalation specialist.
- No real-weapon detection or live-fire operation inside the Quest experience.
- Physical-space check before every session; pause when the user removes the headset or guardian is breached.
- Accessibility options for seated play, left/right-handed setup, reduced motion, subtitles, and audio volume.
- Pilot with instructor-supervised dry-fire sessions before public release.

## Build sequence

1. Obtain and version the official Shooters Global BLE API package/documentation.
2. Create the timer adapter test harness with recorded BLE fixtures and a real-device test matrix.
3. Create the Unity Quest shell and one deterministic drill.
4. Add normalized timer events and local event journaling.
5. Add WISE Defense API session sync and website results view.
6. Pilot with Quest 3S + SG Timer GO, then expand device coverage.
7. Add additional drills only after timing and scoring are verified against the physical timer.

## Acceptance criteria

- A supported timer can pair, reconnect, and report a session without losing shot events.
- Reported first-shot and split times match the timer's authoritative values.
- A Quest session can complete offline and sync exactly once after reconnect.
- Website results and instructor view agree with the Quest summary.
- A failed timer connection is visible, actionable, and never presented as a valid scored session.

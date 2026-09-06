# WISE² SoundLabs Live — Meta Quest 3/3S Design

## Objective

Extend WISE² SoundLabs Live into a native Meta Quest 3/3S spatial collaboration experience that supports both creators and fans while preserving the existing WISE² LiveSession, authentication, role, audience-influence, and broadcast authority model.

The Quest app is not a separate social network, music backend, or streaming authority. It is a spatial client of the same WISE² SoundLabs Live system used by web, iPhone, and iPad.

## Product Positioning

WISE² SoundLabs Live XR combines:
- AI-assisted music creation
- live artist collaboration
- spatial studio controls
- Twitch-style audience participation
- Discord community presence
- WISE² Studio broadcast control
- mixed-reality passthrough on Quest 3/3S

One session can move through:

Create → Collaborate → Audience Influence → AI Generate → Artist Approves → Broadcast → Clip → Publish

Quest adds spatial presence and interaction without changing the authoritative workflow.

## Supported Modes

### Creator Mode

For Owner, Co-Artist, Producer, Guest, and Moderator roles according to server permissions.

Creator mode provides:
- shared spatial studio
- collaborator avatars/presence
- current track waveform and version state
- stem/mixer surfaces
- AI Create controls
- version review and promotion controls where permitted
- live chat and audience influence surfaces
- scene and broadcast controls where permitted
- Discord-linked presence/invites
- VR and passthrough MR presentation

### Audience Mode

For Viewer role.

Audience mode provides:
- enter/watch a live SoundLabs room
- spatialized stage view
- live waveform/track status
- chat
- reactions
- Guided Influence polls
- audience suggestions
- version voting where enabled
- creator/artist presence
- viewer count and stream status
- optional supporter badges/perks later

Audience clients cannot promote versions, modify stems, change roles, control the broadcast, or trigger destructive creator actions.

## Core Architectural Rule

The Quest client uses the existing `LiveSession` as its source of truth.

Quest does not maintain a parallel XR session database.

All state-changing operations are routed to WISE² backend services and are server-authorized.

## Technology Stack

### Runtime
- Unity LTS
- C#
- Meta XR SDK
- OpenXR
- Android/Quest target
- XR Interaction Toolkit where appropriate

### Quest Features
- controller input
- hand tracking
- passthrough MR
- spatial anchors where useful
- spatial audio
- room-scale and seated modes

### Networking
- HTTPS REST for authenticated commands and snapshots
- WebSocket/Socket.IO-compatible realtime gateway for session events
- WebRTC or an existing WISE² media provider for collaborator voice/video

The XR app does not connect directly to PostgreSQL, OBS, Discord bot tokens, AI provider keys, or other privileged credentials.

## Application Boundaries

### Quest Client

Owns:
- spatial rendering
- input
- local UX state
- avatar/presence presentation
- waveform rendering from backend metadata
- mixer interaction UI
- audience reaction presentation
- MR/VR environment selection
- client-side network/reconnect state

Does not own:
- authoritative roles
- project/session persistence
- AI generation authority
- final track/version state
- OBS stream state
- Discord credentials
- billing authority

### SoundLabs Live Service

Owns:
- LiveSession lifecycle
- participants
- roles
- room membership
- chat
- polls
- audience suggestions
- version state
- collaboration events

### SoundLabs Engine

Owns:
- generation jobs
- track assets
- stems
- waveform metadata
- version creation outputs
- AI-provider adapters

### Studio Broadcast Bridge

Owns:
- stream authority
- scene switching
- recording
- broadcast mixer routing
- authoritative telemetry
- sending approved SoundLabs assets into the stream

### Discord Bridge

Owns:
- Join Live announcements
- invite notifications
- approved chat mirroring
- poll announcements
- final-track/session recap

Discord remains a bridge, not the source of truth.

## Spatial Room Design

### Central Creation Table

The center of the room contains the active musical state:
- circular or curved waveform timeline
- current TrackVersion
- BPM/key/duration
- AI generation progress
- playhead
- current/final indicators

Creators can point, grab, and interact with permitted controls around this surface.

Audience clients see a simplified presentation of the same authoritative state.

### Stem Mixer Wall

A configurable floating mixer surface contains channels such as:
- vocal
- drums
- bass
- melody
- music
- SFX
- intro/outro

Each channel may show:
- gain
- mute
- solo
- routing state
- RMS/peak/clip when authoritative telemetry exists

No fake meter movement is permitted.

If telemetry is unavailable, the meter displays an unavailable/stale state.

### AI Create Station

Provides creator-authorized actions:
- Generate
- Extend
- Remix
- Add Vocal
- Generate SFX
- Generate Intro/Outro

Every operation creates a backend `GenerationJob`.

Generated output enters review and never automatically becomes Current or Final.

### Version Stack

A spatial rack/cards interface displays:
- V1, V2, V3…
- parent lineage
- creator
- source
- Crowd Pick
- Artist Pick
- Current
- Final

Promotion controls appear only for authorized roles.

### Crowd Wall

Audience energy appears on a dedicated surface:
- live poll
- vote percentages
- top audience suggestion
- reactions
- viewer count
- crowd mode

Creator mode additionally gets Approve/Reject/Create-from-Winning-Input actions.

### Chat / Discord Panel

A spatial social panel shows:
- WISE² chat
- Discord-origin badges when enabled
- moderator controls
- collaborator invites
- Join Live events

Discord messages entering the room remain clearly identified as Discord-originated.

### Broadcast Deck

Authorized creators can access:
- LIVE/OFFLINE/RECONNECTING status
- current scene
- record state
- stream destinations
- bitrate/FPS/latency/dropped frames where backend supports them
- Start/End Stream according to server permission and backend capability

Quest never assumes a stream command succeeded until the Studio Broadcast Bridge confirms it.

## MR vs VR

### Passthrough MR

Default recommendation for working artists.

The user’s real room remains visible while WISE² studio surfaces are anchored in space.

Recommended layout:
- creation table in front
- mixer on nondominant side
- Crowd/Chat panel on dominant side
- collaborator tiles above or behind the central waveform

### Full VR

Used for branded live rooms, showcases, listening parties, fan events, and virtual performances.

WISE² visual language:
- black/carbon environment
- gunmetal/chrome structure
- electric-blue lighting
- metallic WISE² owl identity
- restrained green/yellow/orange/red for functional metering

Avoid generic gamer RGB aesthetics.

## Interaction Model

### Hands

Primary interactions:
- pinch select
- direct grab for panel repositioning
- slider/pot manipulation
- tap buttons
- point at poll/chat controls

High-risk/destructive actions use an explicit confirmation interaction rather than a casual pinch.

### Controllers

All creator features must have controller equivalents.

Controllers remain the precision fallback for:
- mixer changes
- scene switching
- version promotion
- stream controls

### Accessibility

Support:
- seated mode
- standing mode
- controller-only mode
- hand-tracking mode
- adjustable UI distance/scale
- text size controls
- non-color status cues
- captions for collaborator voice/video where backend support becomes available

## Presence and Avatars

Each `Participant` maps to an XR presence representation.

Phase 1 XR may use lightweight WISE² avatar cards/heads rather than a full custom avatar system.

Presence includes:
- display name
- role
- speaking indicator
- mute state
- online/reconnecting state

Do not make avatar rendering a blocker for room functionality.

## Creator Permissions

Server role checks remain authoritative.

Quest client may hide disabled actions for usability, but backend must reject forged requests.

Role summary:
- OWNER: full session authority
- CO_ARTIST: create/version contribution and delegated creator operations
- PRODUCER: arrangement/mixer/approved production operations
- GUEST: permitted participation/takes
- MODERATOR: community moderation only
- VIEWER: watch/chat/vote/suggest

## Audience Influence in XR

Viewer clients can interact spatially with:
- A/B choices
- mood spheres/buttons
- tempo range choices
- instrument choices
- reaction bursts
- version voting
- text suggestions

The Audience Influence Engine aggregates inputs on the backend.

Creators receive ranked audience intent.

The audience does not directly modify track data.

### Crowd Modes

WATCH_ONLY:
- audience watches, chats, reacts

GUIDED:
- enabled polls and suggestions

CHAOS:
- stronger visual audience energy
- more frequent influence prompts
- creator approval remains mandatory

## Voice and Video Collaboration

Voice/video media should use a dedicated realtime media layer, not the SoundLabs event socket.

Recommended architecture:
- WISE² LiveSession handles identity/roles/presence
- media service issues short-lived room credentials
- WebRTC handles audio/video transport
- spatial audio maps remote artists to avatar positions

Quest must never receive provider master secrets.

If the media service is unavailable, the room remains usable for music state, chat, voting, and control.

## Data Flow

### Join Room

1. User signs in to WISE².
2. Quest receives/uses short-lived access token.
3. Client calls session snapshot endpoint.
4. Backend verifies room membership/role.
5. Client joins realtime session channel.
6. Spatial room is built from authoritative snapshot.
7. Optional media credentials are requested separately.

### Creator Changes Mixer

1. Creator moves a spatial fader.
2. Quest sends requested channel change.
3. Backend checks role/capability.
4. SoundLabs/Studio service accepts or rejects.
5. Authoritative event is broadcast.
6. Quest reconciles to returned state.

### Audience Vote

1. Viewer selects a poll option.
2. Vote is submitted with authenticated viewer identity.
3. Backend enforces one-vote/weight policy.
4. Updated aggregate is emitted.
5. Crowd Wall animates from authoritative result.

### AI Generate

1. Creator enters prompt/options.
2. Quest submits `GenerationJob` request.
3. SoundLabs Engine queues provider work.
4. Progress events update the AI Create station.
5. Output appears as reviewable TrackVersion.
6. Creator explicitly promotes or rejects it.

### Go Live

1. Authorized creator requests Start Stream.
2. Studio Broadcast Bridge validates capability.
3. Bridge starts stream.
4. Authoritative stream state changes to LIVE.
5. Quest displays LIVE only after confirmation.

## Realtime Events

Quest consumes existing/future SoundLabs Live events such as:
- session.snapshot
- participant.joined
- participant.left
- participant.role.updated
- track.version.created
- track.version.promoted
- generation.started
- generation.progress
- generation.ready
- poll.opened
- poll.vote.updated
- poll.closed
- audience.suggestion.updated
- chat.message.created
- mixer.channel.updated
- stream.state.updated
- scene.changed
- discord.bridge.updated

After reconnect, Quest requests a fresh authoritative snapshot.

## Offline / Failure Behavior

### Session Service Unavailable

Show connection failure and do not enter a fake room.

### Realtime Disconnect

Keep last-known room rendering but mark it stale/reconnecting.
Disable mutations that cannot be safely reconciled.
Request a fresh snapshot after reconnect.

### AI Provider Failure

Show generation failure. Existing session/audio stays untouched.

### Broadcast Bridge Failure

Broadcast deck becomes unavailable/degraded. Music collaboration continues.

### Discord Failure

Discord panel shows degraded state. WISE² room continues.

### Media Failure

Voice/video tiles show unavailable. Core session continues.

## Quest Project Structure

Recommended repository path:

`apps/soundlabs-quest/`

Suggested Unity structure:

```text
apps/soundlabs-quest/
  Assets/
    WISE2/
      Core/
      Networking/
      Auth/
      Sessions/
      Realtime/
      SpatialUI/
      Audio/
      Mixer/
      Crowd/
      Chat/
      Broadcast/
      Media/
      MR/
      Avatars/
      Tests/
  Packages/
  ProjectSettings/
  README.md
```

Keep networking/domain contracts isolated from Unity scene components so backend behavior can be unit-tested without loading XR scenes.

## Initial Scenes

### Bootstrap
- login/session restore
- configuration
- connectivity checks

### Lobby
- active rooms
- Join Live
- recent projects
- private/public room entry

### SoundLabsLiveMR
- passthrough creator/audience room

### SoundLabsLiveVR
- full immersive branded room

Use shared prefabs and controllers so MR/VR are presentation modes over the same session state rather than independent products.

## Authentication

Quest uses the existing WISE² account identity.

For production:
- short-lived access token
- refresh/device authorization mechanism appropriate for Quest
- no JWT secret stored in APK
- no OBS/Discord/AI provider secrets in APK
- tokens stored using Android/Quest secure storage patterns

The existing server-side WISE² JWT issuer remains authoritative during the first integration, with future migration to a device-friendly OAuth/OIDC flow allowed without changing LiveSession semantics.

## Performance Targets

Quest 3/3S priorities:
- stable framerate over visual excess
- pooled UI/reaction objects
- efficient waveform meshes
- isolated high-frequency meter updates
- avoid broad scene graph rebuilds on realtime events
- bounded chat/poll history in memory
- LOD for avatars/video tiles

Target 72 FPS minimum as first production baseline, with higher refresh rates enabled only after profiling.

## Security

- TLS/WSS only in production
- server-side authorization for every mutation
- short-lived media credentials
- no production secrets in Unity project or APK
- validate all room IDs and session membership server-side
- rate-limit audience chat/vote/suggestion endpoints
- destructive broadcast actions require explicit confirmation
- sanitize user-generated chat/content before spatial display
- log role, version-promotion, moderation, and broadcast actions

## Testing

### Pure C# Unit Tests
- permission presentation rules
- snapshot parsing
- reconnect reconciliation
- version-state transitions
- poll-state transitions
- stale-state behavior
- command capability gating

### Unity PlayMode Tests
- room builds from snapshot
- viewer cannot access creator controls
- creator UI changes based on role
- MR and VR scenes share session state
- disconnect/reconnect banner behavior
- no meter movement without telemetry

### Device Tests on Quest 3S
- cold launch
- authentication
- room join
- hand tracking
- controller fallback
- passthrough permission
- scene load
- 30-minute stability
- network loss/recovery
- voice/video degradation behavior
- viewer vote flow
- creator version flow
- broadcast capability flow

## Delivery Phases

### XR Phase 1 — Room Shell
- Unity/Meta XR project
- auth/session client
- realtime snapshot/events
- MR/VR room shell
- creator vs viewer role presentation
- participant presence
- chat
- polls

### XR Phase 2 — Music Creation
- waveform
- Version Stack
- AI generation jobs
- review/promote flow
- stem library

### XR Phase 3 — Spatial Production
- stem mixer
- real telemetry meters
- playback routing
- scene controls
- Studio Broadcast Bridge

### XR Phase 4 — Social Layer
- voice/video
- spatial audio
- Discord bridge surfaces
- reactions
- fan room polish

### XR Phase 5 — Launch Hardening
- Quest performance profiling
- onboarding tutorial
- entitlement/account flows
- telemetry/analytics
- crash handling
- store/distribution packaging

## Customer-Ready First Milestone

The first customer-facing Quest milestone is successful when a Quest 3S user can:

1. Sign in with WISE² identity.
2. Join an existing SoundLabs Live session.
3. Enter passthrough MR or full VR.
4. See real participant roles/presence.
5. See the current track/session state.
6. Chat.
7. Participate in audience polls when permitted.
8. See creator controls only when authorized.
9. Disconnect and recover via authoritative snapshot.
10. Exit without corrupting session state.

This milestone deliberately does not fake AI generation, OBS controls, meters, Discord activity, or media state.

## Success Principle

Meta Quest becomes another first-class WISE² SoundLabs Live surface, not a fork.

The same artist can start on web, continue on iPad, enter Quest in passthrough MR, invite collaborators from Discord, let fans influence the creative direction, and broadcast through WISE² Studio while one authoritative LiveSession preserves the state across every client.

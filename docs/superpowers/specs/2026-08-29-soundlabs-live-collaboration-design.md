# WISE² SoundLabs Live Collaboration Design

## Purpose

Build WISE² SoundLabs Live as a real-time collaborative music creation and broadcast experience that combines AI-assisted music generation, artist collaboration, audience participation, live streaming, and Discord community integration under one session model.

The product experience should feel like a hybrid of an AI music studio, a Twitch-style live room, and a Discord-style collaboration space, while preserving the WISE² visual identity and making WISE² the system of record.

## Product Principle

One room, one creative timeline, one source of truth.

A session should move continuously through:

Create → Collaborate → Audience Influence → AI Generate → Artist Approves → Broadcast → Clip → Publish → Discord Recap

The audience may influence the creative direction, but authorized artists retain final control over what becomes active, broadcast, or published.

## Core Product Modes

### Create

Artists can:
- Generate songs, loops, instrumentals, vocals, voice, SFX, intros, and outros.
- Extend or remix an existing version.
- Upload audio and stems.
- Create multiple versions without destroying prior work.
- Compare versions and promote a selected version to Current or Final.
- Route approved assets to the live mixer and broadcast pipeline.

### Collaborate

Invited collaborators can:
- Join a shared live session.
- See session presence and roles.
- Participate in text, voice, and video collaboration surfaces.
- Upload stems and takes according to role permissions.
- Comment on versions and timeline moments.
- Request creative control.
- Trigger allowed actions without overriding the session owner.

### Broadcast

The same session can be broadcast live with:
- Stream status and viewer count.
- Program preview.
- Scene control.
- Audio routing and meters.
- Live audience chat.
- Polls and audience prompts.
- Reactions.
- Highlights and clipping.
- Stream destinations.
- Discord bridge activity.

## Roles and Permissions

Roles are ordered by authority:

1. Owner
2. Co-Artist
3. Producer
4. Guest
5. Moderator
6. Viewer

### Owner

Can manage the session, invite/remove collaborators, assign roles, approve generations, commit versions, change the active version, control broadcast state, change scenes, publish, and configure audience influence.

### Co-Artist

Can create generations, upload stems, propose/commit artist changes when granted, perform live, and participate in version selection. Cannot remove the owner or publish the session without owner permission.

### Producer

Can manage arrangement, mixer settings, approved generation jobs, stem routing, scene suggestions, and version recommendations. Broadcast-destructive actions remain owner-gated unless explicitly delegated.

### Guest

Can participate in voice/video, contribute takes, upload permitted media, and respond to collaboration requests. Cannot commit final versions or control stream state.

### Moderator

Can moderate audience chat, manage polls, remove abusive audience content, and surface audience suggestions. Cannot alter track content or stream state.

### Viewer

Can watch, chat, react, vote, submit suggestions, and participate in enabled audience-influence features.

## Audience Influence Model

Audience participation never directly overwrites the creative session.

Viewer input flows through an Audience Influence Engine that aggregates votes and prompts into ranked suggestions for creators.

Supported influence mechanisms:
- Hook A/B voting.
- Beat direction.
- Mood selection.
- Tempo range.
- Instrument choice.
- Remix direction.
- “Make it darker/brighter” style prompts.
- Cover art choices.
- Next feature or collaborator request.
- Version preference.
- Scene and performance suggestions when enabled.

Creators see ranked audience intent and can approve, reject, or ignore it.

### Crowd Modes

#### Watch Only

Audience can watch, chat, and react, but cannot submit creative-direction inputs.

#### Guided Influence

Audience can vote and submit prompts within artist-defined boundaries. This is the default live collaboration mode.

#### Chaos Mode

Audience gets stronger influence through more frequent polls, broader prompt categories, and higher suggestion visibility. Creator approval remains mandatory for content-changing actions.

## Monetization-Compatible Influence

Supporter benefits may include:
- Extra vote weight within configured limits.
- Subscriber-only polls.
- Early listening rooms.
- Remix challenges.
- Supporter badges.
- Featured questions or suggestions.
- Private after-session rooms.

Paid participation must never grant direct destructive control over tracks, collaborator permissions, or broadcast state.

## Unified Session Model

The system revolves around `LiveSession`.

Every relevant entity references a session so that state remains synchronized across web, iPhone, iPad, backend, broadcast, and Discord.

Core entities:

### LiveSession

Fields:
- id
- ownerId
- title
- description
- status: draft | live | paused | ended | archived
- crowdMode: watch_only | guided | chaos
- currentTrackVersionId
- finalTrackVersionId
- streamStateId
- discordBridgeId
- createdAt
- updatedAt

### Participant

Fields:
- id
- sessionId
- userId
- displayName
- role
- presence: online | away | disconnected
- audioState
- videoState
- permissions
- joinedAt
- lastSeenAt

### Track

Fields:
- id
- sessionId
- title
- artistIds
- bpm
- key
- duration
- status
- createdAt

### TrackVersion

Fields:
- id
- trackId
- parentVersionId
- label
- source: ai | upload | edit | remix | audience_prompt
- generationJobId
- createdBy
- isCurrent
- isFinal
- createdAt

Version history is append-only for content revisions. Promoting a version changes pointers rather than deleting history.

### Stem

Fields:
- id
- trackVersionId
- type: vocal | drums | bass | melody | fx | music | other
- assetUrl
- waveformMetadata
- duration
- gain
- muted
- solo
- routingTarget

### GenerationJob

Fields:
- id
- sessionId
- requestedBy
- type: song | instrumental | vocal | voice | sfx | intro | outro | extend | remix
- prompt
- sourceVersionId
- status: queued | generating | ready_for_review | approved | rejected | failed
- providerMetadata
- outputVersionIds
- createdAt
- completedAt

Generation jobs do not automatically become active content. They enter `ready_for_review` first.

### AudiencePoll

Fields:
- id
- sessionId
- createdBy
- question
- options
- status: draft | open | closed
- weightingPolicy
- openedAt
- closedAt

### AudienceSuggestion

Fields:
- id
- sessionId
- submittedBy
- category
- text
- score
- moderationState
- createdAt

### ChatMessage

Fields:
- id
- sessionId
- authorId
- source: wise2 | discord
- text
- moderationState
- createdAt

### StreamState

Fields:
- id
- sessionId
- status: offline | starting | live | reconnecting | ending | error
- viewerCount
- bitrate
- fps
- latency
- droppedFrames
- startedAt
- endedAt

### Scene

Fields:
- id
- sessionId
- name
- order
- active
- broadcastTargetId

### DiscordBridge

Fields:
- id
- sessionId
- guildId
- channelId
- threadId
- enabledFeatures
- messageCursor
- createdAt

## Service Boundaries

The first production architecture uses three major services with clear ownership.

### SoundLabs Engine

Owns:
- Generation jobs.
- Audio assets.
- Stems.
- Version creation.
- Waveform metadata.
- Generation provider adapters.
- Audio preview assets.

It does not own live-stream state or Discord community state.

### Live Session Service

Owns:
- Session lifecycle.
- Participants and roles.
- Presence.
- Realtime room state.
- Chat.
- Polls.
- Audience suggestions.
- Crowd Mode.
- Version approval state.
- Collaboration events.

It is the realtime coordination layer.

### Studio Broadcast Bridge

Owns:
- Authoritative stream state.
- Scene switching.
- Mixer routing to broadcast.
- Recording.
- Stream destinations.
- Broadcast telemetry.
- Playback commands for approved SoundLabs assets routed into the stream.

The bridge must fail closed when broadcast authority is unavailable.

## Realtime Architecture

Use the existing WISE² realtime stack where practical, preferring Socket.IO/WebSocket for session events.

Event classes include:
- session.presence.updated
- participant.role.updated
- generation.started
- generation.progress
- generation.ready
- generation.approved
- generation.rejected
- track.version.created
- track.version.promoted
- stem.updated
- poll.opened
- poll.vote.received
- poll.closed
- audience.suggestion.updated
- chat.message.created
- stream.state.updated
- scene.changed
- mixer.channel.updated
- discord.bridge.updated

Clients reconcile from authoritative snapshots after reconnect rather than assuming all missed events were received.

## Collaboration Flow

### 1. Start Room

Owner creates a SoundLabs Live session, selects crowd mode, chooses whether it begins private or public, and optionally connects a Discord server/channel.

### 2. Invite Collaborators

Owner sends invite links or WISE² account invitations and assigns initial roles. Discord invitations may expose a Join Live link but role assignment remains controlled by WISE².

### 3. Create Initial Song

An artist opens the Create surface and submits a generation request or uploads source material. The job status is visible to collaborators in real time.

### 4. Review Generation

Generated outputs appear in the Version Stack as review candidates. Artists can audition, compare, reject, remix, extend, or promote a version.

### 5. Add Stems and Takes

Authorized collaborators add vocal takes, instrument stems, SFX, or other media. New content creates or attaches to a version rather than destructively replacing the track.

### 6. Open Audience Influence

Owner or moderator opens a poll or suggestion category. Viewer responses are aggregated by the Audience Influence Engine.

### 7. Artist Approval

Creators see the leading audience choice and may create a generation job from it. No audience action directly commits a track change.

### 8. Send to Broadcast

An approved TrackVersion may be assigned to Music, SFX, Intro, Outro, or another broadcast channel. Studio Broadcast Bridge confirms routing before the UI reports success.

### 9. Go Live

The LiveSession transitions to live only after authoritative Studio Broadcast Bridge confirmation. Audience chat, polls, Discord bridge, viewer state, and collaboration remain tied to the same session.

### 10. Clip and Highlight

Authorized users can mark or generate highlights. Clips reference the original session and track version so provenance remains intact.

### 11. Publish

Owner promotes a version to Final and chooses publish destinations. Publication never implicitly deletes alternate versions.

### 12. Discord Recap

The bridge posts an approved recap containing final-track links, clips, notable poll results, and session replay links into the configured Discord location.

## iPhone Experience

The iPhone experience is optimized for rapid artist participation and live control rather than displaying a desktop DAW at reduced size.

### Header

- WISE² SoundLabs Live identity.
- Live/offline/reconnecting state.
- Viewer count.
- Collaborator avatar row.
- Connection health.

### Main Stage

- Current track artwork or live program preview.
- Primary waveform.
- Current version label.
- Now Playing.
- AI generation progress.
- Session status.

### Bottom Workspace Tabs

#### Create
- Generate.
- Extend.
- Remix.
- Add Vocal.
- Add SFX.
- Upload.
- Version Stack access.

#### Crowd
- Active poll.
- Vote velocity.
- Top suggestion.
- Crowd Mode indicator.
- Creator approval controls when authorized.

#### Chat
- WISE² chat.
- Discord-origin indicators.
- Moderator actions when permitted.

#### Controls
- Music/SFX/Intro/Outro pads.
- Mixer shortcuts.
- Scene shortcut.
- Record.
- Stream controls according to permissions.

## iPad Experience

Landscape is the flagship professional room.

Layout:
- Collaborator stage/video tiles across the top.
- Stem mixer on the left.
- Waveform/timeline and current version in the center.
- AI Create/Director panel on the right-center.
- Audience chat and voting on the far right.
- SoundLabs library/version stack beneath the main stage.
- Bottom production dock for scenes, recording, destinations, Discord, and broadcast commands.

Portrait reorganizes into stacked adaptive regions instead of shrinking the landscape layout.

## Web Experience

The web version provides the most complete room-management experience:
- Full session administration.
- Invite/role management.
- Track and version history.
- Stem library.
- Audience moderation.
- Discord configuration.
- Broadcast setup.
- Publishing and post-session recap.

The visual hierarchy remains music-first: current content and collaborators dominate, while administration stays secondary.

## Discord Integration

Discord is a community bridge, not the source of truth.

Supported integrations:
- Session-start announcement.
- Join Live button/link.
- Collaborator invitation notification.
- Optional chat mirroring.
- Poll announcements and selected poll voting bridge.
- Track version announcement.
- Final version announcement.
- Clip/highlight posts.
- Session-ended recap.

### Chat Mirroring Rules

WISE² chat messages may be mirrored to Discord only when the session owner enables it. Discord messages entering WISE² retain source metadata and pass through WISE² moderation before display.

Avoid infinite message loops by storing origin identifiers and bridge message IDs.

### Discord Permissions

Discord roles do not automatically grant WISE² creative permissions. WISE² role assignments remain authoritative.

## AI Creation Behavior

AI is a creative collaborator, not an autonomous publisher.

AI may:
- Generate musical options.
- Suggest arrangement changes.
- Summarize audience sentiment.
- Convert poll outcomes into generation prompts.
- Detect highlight candidates.
- Suggest scene changes.
- Suggest titles, descriptions, and metadata.

AI may not without authorized user approval:
- Replace the current version.
- Mark a version Final.
- Start or end the broadcast.
- Publish externally.
- Change participant roles.

## Audio and Metering

Meters must use authoritative audio/telemetry sources only.

No random meter animation in production.

Where the backend exposes channel telemetry, clients render RMS/peak/clip state. Where it does not, the meter surface clearly indicates unavailable telemetry rather than synthesizing values.

## Error Handling

### Generation Provider Failure

Generation job becomes `failed` with a user-readable reason. Existing versions and session state remain unaffected.

### Participant Disconnect

Presence becomes `disconnected`; role and session membership are retained for a reconnect window.

### Realtime Disconnect

Client enters reconnecting state, applies exponential backoff with jitter, and requests a fresh session snapshot after reconnect.

### Discord Failure

Discord bridge becomes degraded. The live WISE² session continues normally. Failed outbound Discord messages may retry idempotently.

### Broadcast Failure

Broadcast state is determined by Studio Broadcast Bridge. UI must not report live/ended merely because a command was sent.

### Stale Telemetry

Telemetry is marked stale after a configurable threshold and status indicators communicate that the value is no longer current.

### Permission Violation

Server rejects unauthorized action regardless of client UI state. Client displays the actual role/permission reason.

## Security

- WISE² authentication remains authoritative.
- Role checks occur server-side.
- Broadcast credentials remain server-side.
- Discord bot tokens remain server-side.
- Generation-provider credentials remain server-side.
- Signed asset URLs should be short-lived where private media is involved.
- Session invitation tokens are scoped and expiring.
- Mutating events are auditable by user, session, timestamp, and action.
- Moderation actions are logged.

## Data Ownership and Provenance

TrackVersion and Stem records retain creator and source metadata so the system can show how a version was produced.

Audience influence is stored as input provenance but does not make viewers automatic co-authors or grant publishing control. Legal/rights treatment is an account/product-policy concern and must not be inferred solely from voting activity.

## Testing Strategy

### Unit Tests

Cover:
- Role permissions.
- Crowd Mode rules.
- Poll weighting.
- Audience suggestion ranking.
- Version promotion rules.
- Generation approval rules.
- Discord loop prevention.
- Session state transitions.

### Integration Tests

Cover:
- Create session → invite collaborator → generate → approve version.
- Open poll → collect votes → create audience-derived generation request.
- Promote version → route to broadcast.
- Discord inbound/outbound synchronization.
- Reconnect and authoritative snapshot reconciliation.

### Broadcast Contract Tests

Cover:
- Start stream does not report live without authoritative confirmation.
- End stream does not report ended without authoritative confirmation.
- Scene command failures preserve previous scene state.
- Missing audio telemetry does not create fake meter values.

### Client Tests

Cover:
- iPhone role-based UI.
- iPad landscape layout.
- iPad portrait adaptation.
- Dynamic Type.
- Reduced motion.
- Reconnecting state.
- Stale telemetry state.
- Partial service availability.

### Discord Tests

Cover:
- Message origin tagging.
- Loop prevention.
- Disabled mirroring.
- Moderation before inbound display.
- Session recap generation from approved artifacts only.

## Performance Requirements

- Realtime room interactions should target sub-second perceived updates under normal network conditions.
- High-frequency meter telemetry must be isolated from broad application rerenders.
- Session snapshots should be bounded and paginated where history is large.
- Chat history and version history use incremental pagination.
- Large audio assets use direct object-storage transfer rather than application-server buffering where possible.

## Accessibility

- WCAG AA minimum for web surfaces.
- All status indicators include non-color cues.
- Keyboard-operable web controls.
- VoiceOver labels on iOS/iPadOS.
- Minimum touch targets appropriate for iOS/iPadOS.
- Reduced-motion support.
- Live regions used carefully so realtime updates do not overwhelm screen readers.

## Visual Direction

Preserve WISE² Organized Chaos:
- Black/carbon/charcoal base.
- Gunmetal and metallic silver surfaces.
- Electric-blue primary highlights.
- Functional green/yellow/orange/red meter states.
- Premium broadcast-console density.
- Music-first waveform and track visuals.
- Twitch-like audience energy without copying Twitch UI.
- Discord-like community immediacy without copying Discord UI.
- Avoid gamer RGB, generic SaaS cards, and unnecessary glass effects.

## First Release Scope

The first release includes:
- LiveSession lifecycle.
- Owner/Co-Artist/Producer/Guest/Moderator/Viewer roles.
- Artist invitations.
- Realtime presence.
- Text chat.
- AI generation jobs.
- Track Version Stack.
- Stem upload and playback routing.
- Guided Influence polls.
- Audience suggestions.
- WISE² Live Studio broadcast bridge.
- Discord session announcements and approved chat mirroring.
- iPhone, iPad, and web room surfaces.

The first release does not require a full multitrack DAW editing engine, direct viewer editing rights, or Discord-owned creative permissions.

## Success Criteria

A successful first production flow allows an artist to:

1. Create a SoundLabs Live room.
2. Invite another artist.
3. Generate or upload music.
4. Create and compare versions.
5. Open an audience poll.
6. Turn the winning audience direction into a reviewable generation.
7. Approve a resulting version.
8. Route it into the live broadcast.
9. Stream while collaborators and audience remain in the same session.
10. Publish a final version and automatically send an approved Discord recap.

At no point should viewers, AI, Discord, or a failed client connection be able to silently override the artist’s authoritative session state.
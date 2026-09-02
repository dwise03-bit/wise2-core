# WISE² ME Capture — Android Design

Date: 2026-09-01
Status: Approved architecture / implementation spec pending final review
Primary test device: Motorola Razr
Source repository: `dwise03-bit/wise2-core`
Distribution surface: `wise2.net/apps/me-capture`

## 1. Goal

Build a native Android field-memory application that records video and audio from real work, client interactions, teaching sessions, and personal knowledge dumps, then converts those recordings into structured, reviewable data that can later improve a user-controlled personal AI.

The application is not a covert recorder and does not automatically train an AI from every captured interaction. Recording is visibly indicated, client-oriented capture includes an explicit consent workflow, and content must be reviewed before it can enter the approved AI dataset.

## 2. V1 Scope

### Capture modes

- FIELD — inspections, troubleshooting, job-site walkthroughs, equipment documentation.
- CLIENT — client conversations, estimates, meetings, explanations; requires consent acknowledgement before recording.
- TEACH — tutorials, demonstrations, explanations, procedures.
- THOUGHT — solo ideas, decisions, observations, and knowledge dumps.

### Capture capabilities

- Camera and microphone recording.
- Front/rear camera selection.
- Pause/resume/stop.
- Visible recording state and elapsed time.
- Optional capture context: job/customer label, notes, GPS, tags.
- Local clip persistence when offline.
- User-controlled deletion.

### Library

- Filter by All / Field / Client / Teach / Thought.
- Clip thumbnail, duration, timestamp, processing state, title, and optional customer/job label.
- Search metadata and, once processing is available, transcript text.

### Review pipeline

`RAW -> TRANSCRIBED -> ANALYZED -> REVIEWED -> APPROVED`

A clip cannot become approved AI material without an explicit user action.

Review view includes video playback, summary, transcript, chapters, extracted entities/tags, and two primary actions:

- Reject / exclude from AI training.
- Approve for My AI.

## 3. Android Architecture

Use native Kotlin and Jetpack Compose.

Suggested package: `com.wise2.mecapture`.

Primary modules/boundaries:

- `capture`: CameraX/Media3 recording orchestration and capture state.
- `library`: clip browsing, filtering, search, and playback.
- `storage`: encrypted metadata/database plus controlled media-file access.
- `consent`: recording acknowledgement and consent evidence metadata.
- `sync`: resumable background upload contract using WorkManager.
- `processing`: API contracts and processing-state synchronization.
- `review`: transcript/analysis presentation and approval controls.
- `core-ui`: WISE² visual system and shared Compose components.

The V1 app must remain useful offline. Capture and library operations must not depend on server availability.

## 4. Local Data Model

Each clip should have a stable UUID and at minimum:

- clip ID
- capture mode
- created/updated timestamps
- local media URI/path reference
- duration
- title
- optional customer/job label
- optional notes
- optional tags
- optional GPS coordinates with explicit capture flag
- recording-consent status and timestamp where applicable
- upload state
- processing state
- transcript reference
- analysis reference
- AI approval state and approval timestamp

Sensitive metadata should not be embedded unnecessarily into exported video files.

## 5. WISE² Core Integration

V1 defines a provider-neutral sync boundary so capture is not coupled to a single AI vendor.

Expected logical operations:

- create clip record
- request/resume media upload
- finalize upload
- read processing state
- retrieve transcript/analysis
- approve/reject AI-dataset eligibility
- delete/revoke clip

Server processing can later perform transcription, speaker separation, OCR, scene indexing, equipment/entity extraction, summaries, chapters, and embeddings.

Raw client recordings remain distinct from the approved personal-AI dataset.

## 6. Privacy and Consent

- Never implement hidden recording behavior.
- Show a persistent visible recording indicator.
- CLIENT mode requires an explicit consent acknowledgement flow before recording begins.
- Preserve consent metadata with the clip.
- Provide clear delete/revoke controls.
- GPS collection is off unless enabled by the user.
- Do not automatically mark recordings as AI-training approved.
- Separate raw captured material from approved training material.
- Distribution page must include a privacy and recording-consent notice.

This product design does not attempt to determine whether a particular recording is legally permitted in every jurisdiction; the UI should encourage explicit consent.

## 7. Security

- Use Android Keystore-backed secrets.
- Store structured local metadata using encrypted-at-rest mechanisms appropriate to supported Android versions.
- Keep app-private recordings in protected application storage until intentionally exported/shared.
- Use TLS for network communication.
- Do not commit production credentials or signing secrets to Git.
- Use short-lived upload authorization rather than exposing permanent storage credentials to the app.

## 8. Visual System

Follow the approved WISE² ME Capture concept:

- near-black/gunmetal surfaces
- metallic/chrome WISE² identity
- electric green for FIELD/approval/status
- blue for CLIENT
- purple for TEACH/AI analysis
- amber/orange for THOUGHT
- large, glove-friendly field controls
- high-contrast recording state
- digital instrument/dashboard character without sacrificing readability

Primary bottom navigation: Capture / Library / AI Studio / Profile.

AI Studio in V1 can expose dataset statistics and approved categories while advanced clone generation remains outside the first release.

## 9. Distribution on wise2.net

Public route: `https://wise2.net/apps/me-capture`

The page should provide:

- product overview and screenshots
- current Android version/build number
- direct APK download
- SHA-256 checksum
- release notes
- QR code to the APK/page
- Android sideload instructions
- minimum supported Android version
- privacy notice
- recording-consent notice

APK hosting and page deployment must be automated only after a release build passes validation.

## 10. Build and Release

Initial target is a directly installable Android APK for field testing before Play Store work.

Release pipeline should:

1. run unit/static checks
2. build debug/test artifact
3. run instrumentation/device checks where available
4. produce signed release APK using secrets outside source control
5. compute SHA-256
6. publish versioned artifact
7. update download metadata/page

Do not claim a signed production APK is available unless signing and build verification have actually succeeded.

## 11. Motorola Razr Validation

The connected Motorola Razr is the first physical test target.

Validation checklist:

- ADB device recognized and authorized
- clean install succeeds
- camera permission flow
- microphone permission flow
- FIELD recording start/pause/resume/stop
- CLIENT consent gate
- front/rear camera switch
- clip survives app restart
- playback works
- offline capture works
- library filters work
- delete works
- optional GPS behaves correctly
- upload/sync failure does not lose local media
- battery/thermal behavior observed during a 20+ minute recording

Physical-device validation requires access to the workstation where the Razr is connected; GitHub repository access alone cannot operate that USB device.

## 12. Error Handling

- Never discard a successfully recorded local clip because upload or processing fails.
- Persist resumable upload state.
- Surface actionable camera/microphone/storage permission errors.
- Detect low-storage conditions before long recordings when possible.
- Preserve processing failures as retryable states.
- Avoid blocking capture because AI services are unavailable.

## 13. Testing

Unit tests:

- capture state transitions
- consent requirements
- metadata persistence
- AI approval state transitions
- upload retry state machine

UI tests:

- capture mode selection
- consent gate
- record controls
- library filtering
- review approval/rejection

Device tests:

- CameraX recording and playback
- lifecycle interruption (screen rotation/background/phone interruption where supported)
- long recording
- offline/reconnect behavior
- Motorola Razr validation checklist

## 14. Deferred Beyond V1

- automatic voice cloning
- photorealistic avatar generation
- autonomous impersonation of the user
- automatic training on unreviewed client recordings
- live video-chat recording integration with third-party services
- iOS client
- Play Store release
- advanced multi-user organization administration

The architecture should leave clean interfaces for these capabilities without making them prerequisites for the first usable field build.

## 15. V1 Success Criteria

V1 is successful when the user can install the APK on the Razr, select a capture mode, visibly record a field/client/teaching/thought video, safely retain it offline, browse and replay it, preserve consent/context metadata, and explicitly approve or reject the clip for future personal-AI use. A verified APK can then be published from the WISE² download page with version and checksum information.
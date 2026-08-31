# SOUND LAB AUDIT

Date: 2026-08-29  
Scope: existing WISE² Sound Lab only. Unrelated working-tree work (Blakkhail, HVAC, Discord) was not modified.

## Current architecture

Sound Lab is **not** a single app. It is split across:

| Surface | Location | Role |
|---|---|---|
| Command Center hub | `apps/command-center/app/dashboard/sound-labs/` | Authenticated hub: projects, jingle, library |
| Website CRUD | `apps/website/app/sound-labs/` | Project list/detail, lyrics, MusicGen generate |
| Studio DAW | `apps/studio/components/SoundLab/` | Timeline, mixer, transport, recording, effects UI |
| Audio engine | `packages/audio/` | Web Audio mixer, recorder, playback, EQ/comp/reverb/delay |
| API | `packages/api/src/v1/sound-labs/` | JWT project CRUD + MusicGen generate |
| DB | `SoundLabsProject`, `SoundLabsRecording`, collaborators, comments, versions, presence | Prisma models exist |
| Storage | Gallery local disk (`uploads/gallery`); S3 service is a stub | Media should go through Gallery, not DB blobs |

Target IA (`/sound-lab`, `/sound-lab/projects/[id]`, personas, plugins, releases) **did not exist**. Existing routes are `/dashboard/sound-labs` and `/sound-labs`.

## Existing APIs (preserve)

- `GET/POST /v1/sound-labs/me/projects` — list/create (JWT, ownership, entitlements)
- `GET/PATCH/DELETE /v1/sound-labs/me/projects/:id` — get/update/delete including `mixerState`
- `POST/GET /v1/sound-labs/me/projects/:id/generate` — MusicGen (local service, not Suno)
- `GET /v1/sound-labs/me/can-generate`
- Gallery `POST /v1/gallery/upload` + `GET /v1/gallery` — Live Studio recording → Gallery **works**
- Billing entitlements: Sound Labs requires Starter+ (`canAccessSoundLabs`)

Missing from API despite DB models: recording upload, versions, comments, approvals, audio proxy on Nest.

## Components

**WORKING**
- Project CRUD (API + Command Center / website clients)
- Auth + user-scoped project access
- Live Studio capture → Gallery upload (`apps/command-center/src/lib/recording.ts`)
- Gallery audio library listing
- `packages/audio` Web Audio primitives
- Studio `RecordingEngine`, effect classes, mixer/timeline **components** (in-memory)

**PARTIAL**
- Studio `SoundLabEnhanced` — real UI, clips stay in memory, generate used a hardcoded JWT (removed)
- Mixer meters in Enhanced were placeholders (`peakLevel: -20`)
- Website project page: lyrics + generate, not a DAW
- Jingle Lab hub: workflow chrome, no production engine
- `mixerState` JSON exists but was not a full timeline document

**UI ONLY**
- Command Center Sound Labs landing cards
- Jingle Lab steps 2–4
- Studio Voice Lab gallery mock
- Website `components/studio/pages/SoundLab.tsx` placeholder

**MOCK / BLOCKED**
- Suno-branded UI wrapping MusicGen (local GPU service at `MUSICGEN_API_URL`)
- S3 upload service is a stub
- Stem separation: no provider in repo
- Real-time collaboration / presence sockets: models only
- Platform distribution (Spotify etc.): none

## Technical debt

- Hardcoded JWT + project id in `SoundLabEnhanced` (security defect)
- Duplicate Sound Labs marketing trees (`wise-touch`, nested `services/dashboard`)
- Gallery list by `userId` query is not itself an authz check
- Create-project fails closed with no subscription (correct, but easy to misread as a broken UI)

## Decision

Finish Sound Lab **inside Command Center** at `/sound-lab/*`, reuse the existing API/DB/Gallery/Live Studio, extend the API instead of replacing it, and keep Studio/website routes working. Jingle Lab becomes `/sound-lab/jingle`.

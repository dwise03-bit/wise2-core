# SOUND LAB COMPLETION

Date: 2026-08-29 (updated)  
Home: Command Center at `/sound-lab` (not a new app). Existing website `/sound-labs` CRUD and Studio DAW components were preserved.

## WORKING

Verified in browser at `http://localhost:3004`:

- `/sound-lab` command center (hero, actions, storage/processing/modules)
- `/sound-lab/projects` productions list
- `/sound-lab/plugins` processor inventory with honest WORKING / PARTIAL / BLOCKED labels
- `/sound-lab/jingle` workflow module (Jingle Lab is not a separate DAW)
- `/sound-lab/share/[token]` client review (no WISE² login; play, comment, approve/revision)
- Studio **SHARE** button copies client review link (30-day `ProjectInvite` token)
- Sidebar Create section: Sound Lab, Productions, Jingle Production, Releases
- Command Center dashboard widget linking to Sound Lab
- Studio open of a missing/unreachable project shows **Cannot open studio** (no fake success)
- App shell renders routes on hard load (no false 404 from mount gate)
- API client uses `/api` proxy in browser; authenticated audio fetch for MusicGen clips

Verified by automated checks:

- AI Producer mapper: cleanup chain, streaming master, stem requests stay blocked
- `tsc --noEmit` for `@wise2/command-center` and `@wise2/platform-api`
- `next lint` for command-center: no warnings
- Jest `ai-producer.test.ts`: 3 passed

Implemented (requires Nest API on `:3011` + Starter+ subscription for create/generate):

- JWT project CRUD (existing)
- Recording upload → Gallery + `SoundLabsRecording`
- Attach Live Studio / Gallery audio into a project
- mixerState autosave, named versions, restore
- Timestamp comments, approval states
- Public client review API: `GET/POST /v1/sound-labs/review/:token/*`
- Browser DAW: timeline, transport, record, mix, Web Audio inserts, WAV export, MIDI keyboard/Web MIDI
- Hardcoded JWT removed from Studio `SoundLabEnhanced`

## PARTIAL

- Gate / noise reduction = HPF + gate-style cleanup, not iZotope-class restoration
- Stereo width / pitch: limited Web Audio approximations
- Internal client preview (`/sound-lab/projects/[id]/review`) still requires producer login; external clients use `/sound-lab/share/[token]`
- Real-time collaboration / presence: DB models exist, no live sockets
- Personas: authorized registry via Gallery metadata; Voice Lab is not a second cloning engine
- Mastering = Web Audio glue + limiter, not a commercial mastering suite
- Music generation: MusicGen local service only, when `MUSICGEN_API_URL` is up

## BLOCKED

- Stem separation (no Demucs/GPU adapter in repo)
- S3 cloud storage (service is a stub; Gallery disk is used)
- Paid Suno / commercial music APIs (not added)
- DSP-complete punch-in overdub, true LUFS ITU meters
- Spotify/Apple distribution (no integration)

## PROVIDERS

| Kind | Connected | Notes |
|---|---|---|
| MusicGenerationProvider | MusicGen (`MUSICGEN_API_URL`, default `:5000`) | Existing WISE² service |
| AudioProcessingProvider | Browser Web Audio | EQ, compressor, limiter, reverb, delay, filter, distortion, gain |
| MasteringProvider | Web Audio limiter | -1 dBTP safety |
| StemProvider | none | Explicitly blocked in AI Producer |
| VoiceProvider | Voice Lab / Hermes existing | No unauthorized clone pipeline |
| Storage | Gallery disk | Not DB blobs; S3 stub unused |

## TESTS

```
pnpm --filter @wise2/command-center exec tsc --noEmit
# pass

pnpm --filter @wise2/platform-api exec tsc --noEmit
# pass

cd apps/command-center && pnpm exec next lint
# No ESLint warnings or errors

cd apps/command-center && ./node_modules/.bin/jest --config jest.config.js src/lib/sound-lab/ai-producer.test.ts
# PASS  3 tests
```

Not run: full Nest API integration tests (API down). Browser DAW record/play/export against a real project.

## DEPLOYMENT

Not deployed (requires your approval).

Local:

```
# API (existing)
pnpm --filter @wise2/platform-api dev   # typically :3011

# Command Center
ulimit -n 10240
cd apps/command-center && pnpm exec next dev -p 3004
# open http://localhost:3004/sound-lab
```

Production Command Center already proxies `/api` to the Nest API. After shipping this branch, rebuild the command-center image. Do not treat website `/sound-labs` as removed.

## NEXT

- Run the full authenticated loop with API + MusicGen up: create, record, mix, version, export
- Optional Demucs worker behind `StemProvider`
- Invite-token client review without a WISE² login
- True M/S width and pitch-shift if you want those labeled WORKING

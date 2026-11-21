# WISE² Sound Lab — full production studio completion contract

## Existing foundation (preserve)
Command Center studio, Sound Labs project API, Gallery storage, local MusicGen instrumental generation, Web Audio processing and DAW timeline. Never replace these with duplicate mock apps.

## Required production chain
1. **Composition**: original lyrics, 144 BPM grid, key, section markers, prompt/version history
2. **Beat engine**: existing MusicGen local provider, queued generation, downloadable source audio, retry/error states
3. **Vocal engine**: real singing/rap-capable provider adapter with explicit consent and provider configuration; never present speech TTS as sung vocals; separate lead/double/ad-lib tracks when supported
4. **Reference ingestion**: upload owned/authorized recordings to Gallery, audition and extract non-identifying style cues; no voice impersonation without authorization
5. **DAW**: persisted multitrack session, waveform editing, clip alignment, automation, punch-in, recording and stem import/export
6. **Mix**: EQ, dynamics, de-essing, reverb, delay, routing, buses and headroom
7. **Master**: measure integrated LUFS, true peak, clipping and silence; export 24-bit WAV and 320 kbps MP3; verify via independent decoding
8. **Release**: track artwork, credits, metadata, rights checklist and downloadable delivery package

## Provider policy
- Local-first: existing MusicGen for instrumentals. Rap-vocal provider must be verified to generate musical performance, not narrated speech.
- Optional external song providers may be used as explicitly configured fallback; do not imply self-hosted, free or installed.
- Fail closed with actionable errors on unavailable providers or insufficient credits.
- Keep API keys server-side; restrict downloads to the project owner.

## Release gate
A release is not marked READY until actual audio has been rendered, vocal pronunciation and musical timing have been auditioned, the mix has been inspected, the master decoded and measured, and user review is recorded. A committed workflow is not evidence of a produced track.

## Immediate engineering backlog
- Add real vocal-provider health check and generation endpoint
- Persist generation jobs and project assets in existing API/Gallery
- Connect DAW to provider output and persistent timeline
- Add render and quality-control CI using actual audio fixtures
- Run end-to-end test on authorized runner and publish evidence

## Anthem reference
'I Don't Lurk, I Work': 144 BPM, F minor, original gritty melodic trap/Queensbridge drill. Audition 'My Bots Is Like That' and 'Bots on Go' when source audio is available. Do not imitate a named performer's identity.

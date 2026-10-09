# CODEX FLEX — Two Minds. One Vision.

WISE² live AI entertainment series, hosted by Daniel (The Integrator) and Darrin (The Hype Man). Street-level New York City challenges: audience ideas become songs, websites, brands, apps and immersive experiences on camera.

## Mission
Show the public the creative power of AI through authentic, consent-based real-world demonstrations. Pilot episodes: Stoop Sessions, Rooftop Builds, Park Challenges, and The Portal.

## Integrations
- Sound Lab: original CODEX FLEX anthem, soundtrack production, show stingers and event music.
- MASCHINE Mikro: MIDI pad control for beats, scenes and transitions (mapping pending).
- The Tunnel: immersive music-reactive projection-mapped environment; Pocket Node voice wake phrase: “From the womb to the tomb.”
- WISE² Living Hive / Hermes: orchestration and monitoring (integration pending).
- YouTube: livestream player, episode archive and Shorts (channel setup pending).

## Requested URLs (not yet deployed)
- https://wise2.net/Codex-Flex
- https://wise2.net/The-Tunnels
- https://wise2.net/7-Eleven

## Roles
Daniel: engineering, systems, deployment, demos. Darrin (GitHub wisevillain86): creative direction, live show visuals, music culture, audience engagement. Collaborator access must be confirmed separately.

## Proposed structure
apps/web, apps/producer-console, packages/ui, packages/show-control, integrations/{sound-lab,maschine,tunnel,hermes}, content/{episodes,music}, assets/branding, docs, infra.

## Production readiness (October 9, 2026)
GPU VPS and Surface online through Desktop Commander. Existing wise2-core/apps/sound-labs-ui discovered. wise2-website healthy on port 3001; wise2-studio and wise2-api containers restarting. Main nginx route redirects to HTTPS on port 8444. Public URLs are not verified as deployed. Never claim otherwise. Do not publish credentials, stream keys, or personal data.

## Release checklist
Stabilize Sound Lab; validate hardware/MIDI; produce anthem; build live site; provision YouTube; add moderated challenge queue; wire projection cues; deploy isolated routes; test HTTPS externally; create repeatable creator kit.

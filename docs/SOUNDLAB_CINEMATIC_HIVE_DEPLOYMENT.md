# WISE² Sound Lab — Cinematic Hive Deployment

## Canonical design (October 8, 2026)
Premium humanized 4K studio aesthetic: dark navy/black, electric-blue edge light, neon-green Hive accents, chrome WISE² typography, producer at MASCHINE Mikro MK3, cinematic DAW timeline, animated honeycomb, Jarvis assistant, samples, mixer, transport and device status. Reference: approved visual in project conversation. Do not use Blakk Hail brand assets, logos or copy; match only its cinematic production quality.

## Source of truth
- Main Sound Lab landing: `apps/website/app/soundlab/page.tsx` and `apps/website/components/soundlab/`
- MIDI controller UI: `apps/sound-labs-ui/`
- Production: `https://wise2.net/soundlab`
- Client site: `https://blakkhail.com` must remain isolated.

## Verified incident
On October 8, the public `/soundlab` route returned the Blakk Hail Car 01 HTML title. The VPS has an existing Sound Lab landing route and an independently buildable Vite controller. A successful HTTP 200 alone is not a valid deployment test.

## Execution plan
1. Inspect active Cloudflare routing, reverse proxy, Next.js server and site configuration. Do not assume a disabled Nginx file is active.
2. Identify the authoritative public origin and isolate `/soundlab` from Blakk Hail without changing unrelated sites.
3. Implement cinematic landing and matching controller UI using owned/licensed assets. Keep all existing services, intake, prices and controller capabilities.
4. Do not expose Tailscale bridge addresses to public browsers. Show real connection states and offline fallback.
5. Build/typecheck; validate responsive and reduced-motion UI; test routes, JS/CSS asset URLs and console errors.
6. Deploy using the established pipeline with backups, targeted rollback, and explicit live checks for Sound Lab and Blakk Hail.
7. Report exact commits, build logs, route response titles and real device connection state.

## Guardrails
Do not reset dirty VPS work, force-push, remove unrelated files, copy Blakk Hail assets, or claim deployment success without verifying the live site.

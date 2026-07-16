# WISE² Sound Labs — Organized Chaos Command Center

## Problem Statement
Build (pixel-faithful) the WISE² Sound Labs "Organized Chaos Command Center" dashboard from the provided screenshot. Dark cyberpunk / neon-blue aesthetic. Scope: UI + working backend; Discord = external join link only; main Command Center dashboard + all sidebar pages functional; generate/source visuals.

## Tech Stack
- Frontend: React 18, react-router-dom v7, TailwindCSS, framer-motion, recharts, lucide-react, sonner. Alias `@` → src.
- Backend: FastAPI + Motor (MongoDB), JWT auth (bcrypt).
- Fonts: Chakra Petch / Rajdhani (display), Inter (body).

## Auth
- JWT custom auth. Single admin seeded from env: dwise@wise2.net / Glock19!.

## Implemented (2026-07-16)
- Login page → JWT auth.
- Shell: exact Sidebar (13 nav items w/ sublabels, LIVE badge, system status) + Header (search, W² monogram, live counters, user menu, notifications dropdown, mail, gear).
- **Command Center dashboard (/live)** — matches screenshot: LiveStudio (hero + running timer, 7-stage progress, controls), LiveChat (live post via backend), DiscordCard (external invite), LiveSchedule, ActiveProjects, CommunityFeed (like via backend), Leaderboard, EnterpriseFooter (Enterprise/Update/Roadmap/Metrics).
- All 12 sidebar pages functional: Studio, BrandDNA (radar+sliders), AnthemCreator (lyrics editor), RecordingRoom (record timer+takes), MixingConsole (faders), Mastering (presets+loudness), Community, Challenges (join), Academy (courses), BrandVault (assets), Analytics (recharts), Settings (profile+toggles).
- Backend endpoints: /api/auth/login,me; /api/dashboard (aggregate); /api/chat GET/POST; /api/feed like/create; /api/notifications + read; /api/search.
- Seed data: chat, projects, feed, leaderboard, notifications.

## Notes
- Fixed env pydantic_core mismatch (pinned pydantic-core==2.27.2).
- Discord = external link only (no OAuth), per user choice.

## Backlog / Next
- P1: Wire Analytics/Challenges/Academy to backend persistence.
- P2: Real-time chat via WebSockets; AI Maestro bot via LLM.
- P2: Multi-user registration & profiles.

# WISE TOUCH Complete Baseline

This package turns the recovered WISE TOUCH React source into a runnable Vite + React + Tailwind project without replacing the surviving functionality.

## Milestone 0 baseline

Preserved features:
- WISE TOUCH system directory
- Search
- Category filtering
- System detail view
- Subsystem detail cards
- Main and subsystem prompt generation
- Clipboard fallback
- Favorites persisted in localStorage
- 4-system Hybrid Builder
- Weight validation requiring exactly 100%
- Hybrid prompt generation

## Run

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
npm run preview
```

## Important baseline rule

Do not normalize or refactor the embedded system data until this baseline runs successfully.
Milestone 1 should extract/normalize data while preserving the UI behavior and prompt-generation logic.

## Milestone 1 status

System and Subsystem records are now normalized behind a compatibility layer. Run `npm test` for catalog integrity checks. See `docs/MILESTONE_1.md` for the data contract and intentionally deferred fields.

## Milestone 2 status

Every Subsystem has an individual WT Docs view with its parent, description, Visual DNA, readiness metadata, prompt action, Hybrid action, and explicit empty states for content that has not yet been authored.

## Milestone 3 status

WT Search returns clearly distinguished System and Subsystem results across catalog documentation and supports Category, Flagship, Fully Documented, Favorites, Hybrid Ready, and Prompt Ready filters.

## Milestone 4 status

WT Docs now provides complete System and Subsystem documentation views with status badges, structured DNA, explicit empty states, and direct Prompt, Favorite, and Hybrid actions.

## Milestone 5 status

WT Favorites persists Systems, Subsystems, Hybrids, and Prompts in one versioned store with automatic migration from the recovered System-name array format.

## Milestone 6 status

WT Hybrid supports System/System, System/Subsystem, and Subsystem/Subsystem weighted combinations with generated names, parent metadata, Hybrid DNA, compatibility analysis, prompt foundations, and saved Hybrids.

## Milestone 7 status

WT Prompt Engine produces DNA-driven, production-ready prompts for image, video, cover art, poster, branding, editorial, and storyboard workflows across Universal, Claude, Gemini, Flow, Midjourney, and provider-neutral targets.

## Milestone 8 status

Claude prompt enhancement runs through a protected same-origin Express route with server-only secrets, validation, rate limiting, editable results, and safe unconfigured/error states.

## Milestone 9 status

Video orchestration uses a vendor-neutral adapter registry and asynchronous job manager with provider discovery, submission, status, and safe unconfigured states for Runway, Kling, Luma, Pika, Replicate, and fal.ai.

## Project structure

```text
WISE_TOUCH_COMPLETE_BASELINE/
├─ package.json
├─ index.html
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ .env.example
├─ src/
│  ├─ main.jsx
│  ├─ App.jsx
│  ├─ components/
│  │  └─ WiseTouchDirectoryCleanRebuild.jsx
│  ├─ routes/
│  │  ├─ routeManifest.js
│  │  └─ README.md
│  ├─ assets/
│  │  └─ wise-touch-mark.svg
│  └─ styles/
│     └─ index.css
├─ public/
│  └─ assets/
│     └─ README.md
└─ docs/
   └─ MILESTONE_0_NOTES.md
```

# WISE² Asset Forge Design

## Goal
Build an installable WISE² web app that converts one uploaded artwork sheet into multiple clean, named, optimized image assets while preserving the original artwork exactly.

## Workflow
Upload → Detect → Crop → Review → Export → Preview → Publish.

## Product Rule
Original Artwork Protected is the default. The app may crop, trim, resize, convert format, remove simple backgrounds, and optimize files. It must not redraw, restyle, replace faces, alter poses, or invent character details.

## Platform
Implement inside `apps/website` at `/asset-forge` using the existing Next.js 14 app. The app must work on iPhone, iPad, Mac, and desktop browsers and expose installable PWA metadata.

## Processing
Prefer local browser processing for previews, crop editing, naming, and project state. Use the existing `sharp` dependency for deterministic server-side conversion and optimization when needed. Routine use must not require paid AI.

## MVP
- Upload PNG, JPG, or WebP.
- Create and edit 1–10 crop regions.
- Include a five-subject WISE² IMPS preset.
- Export PNG and WebP.
- Provide original, 512px, 1024px, and 2x size options.
- Auto-name outputs from labels.
- Preview outputs in WISE² cards before publishing.
- Download files individually or as a bundle.
- Publish approved files to a configured GitHub branch and optionally open a pull request.
- Keep publishing limited to configured repositories and destination folders.

## Five IMP Preset
Learner → `learner-imp.webp`
Creator → `creator-imp.webp`
Guide → `guide-imp.webp`
Safe → `safe-imp.webp`
Team → `team-imp.webp`
Default destination: `apps/website/public/imps/`.

## UX
Match the approved Asset Forge visual: dark WISE² shell, electric-blue highlights, six-stage workflow, central crop workspace, export settings, preview cards, and repository publishing status. Mobile uses a vertical stepper rather than a compressed desktop layout.

## Safety and Reliability
Validate file type, decoded dimensions, crop bounds, output names, and destination paths. Remove unnecessary metadata from exports. Publishing must occur server-side and require authorized WISE² access.

## Success Criteria
A user can upload the approved five-IMP school sheet from iPhone or Mac, adjust five crops, export five optimized WebP assets, preview them, and publish them to a review branch without Photoshop, paid AI, or changes to character identity.

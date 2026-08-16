# Get Down Pressure Washing — Business Command Center (Owner Demo)

A presentation-ready demonstration of what the WISE² Revenue Engine looks like when it is built
around Get Down Pressure Washing. Get Down is the hero brand; WISE² is the technology underneath.

## Run it

```bash
pnpm --filter @wise2/getdown-demo dev
```

Then open **http://localhost:3020**. No login, no database, no environment variables.

Present full-screen at **1920×1080**. The guided tour advances with `→` or the space bar, goes
back with `←`, and exits with `esc`.

## Presenting

1. The opening screen offers **Enter Command Center** or **Start Owner Tour**.
2. The tour is 12 steps, roughly 5–7 minutes, and routes itself through the product.
3. It ends on the closing screen with the **Let's Build Get Down OS** call to action.
4. **Start Owner Tour** is always available in the top bar.

## Guide narration (audio)

The tour is narrated by pre-rendered audio in `public/audio/`, so it sounds identical on every
machine rather than depending on which speech voices the viewer happens to have installed. The
assistant's dynamic answers still use live browser synthesis, since they can't be rendered ahead
of time. If an audio track fails to load, the guide falls back to synthesis automatically.

Scripts live in **`lib/data/narration.json`** — the single source for both the on-screen tour and
the audio. Edit that file, then re-render:

```bash
pnpm --filter @wise2/getdown-demo narration
```

That is the default `edge` provider: free Microsoft neural voices (currently
`en-US-AndrewNeural`), no API key and no account. It runs through `uvx`, so nothing is installed
globally — `uv` is the only prerequisite. The narration text is sent to Microsoft's endpoint to be
synthesised; nothing else leaves the machine.

Other providers:

```bash
# Fully offline — macOS `say`. Lower quality, but no network at all.
pnpm --filter @wise2/getdown-demo narration:local

# OpenAI TTS — needs a real key.
OPENAI_API_KEY=sk-... pnpm --filter @wise2/getdown-demo narration:openai
```

Choose a voice with `--voice=` (`en-US-BrianNeural`, `en-US-AvaNeural`, `en-US-EmmaNeural`…);
list them with `uvx edge-tts --list-voices`. Every provider is normalised to mono 64 kbps MP3 at
a matched loudness, so tracks never jump in volume mid-tour.

Current runtime: **about 6.1 minutes** across 14 tracks (~2.9 MB).

## Data safety

Everything in this app is self-contained. It has no connection to the WISE² production database,
authentication, tenants, or credentials. It cannot send an SMS or email, charge a card, create a
real invoice, publish social or Google Business Profile content, modify a production customer
record, or trigger a production automation.

All customers, properties, managers, and financial figures are **fictional demo data** and do not
represent actual Get Down Pressure Washing results. Fictional organizations are prefixed with `*`
in the seed file, and contact details use reserved `example.test` domains and `555` numbers.

Actions that would reach the outside world in production are labelled **DEMO ACTION** or
**APPROVAL REQUIRED** in the interface. The `Owner Demo` toggle in the top bar controls the
simulated-data banner.

## Structure

```
app/                    21 routes, one per navigation item
components/shell/       App shell, sidebar, top bar, brand marks
components/ui/kit.tsx   Panels, KPIs, tables, drawers, tabs, badges, buttons
components/tour/        Guided owner tour, opening and closing screens
components/modules/     Territory map
lib/data/seed.ts        All demo data — the single source of truth
lib/data/types.ts       Domain model
lib/metrics.ts          Derived KPIs and formatting
lib/nav.ts              Navigation registry
```

Every screen reads from `lib/data/seed.ts`. Changing a number there changes it everywhere,
including the AI assistants' answers.

## Session state

Pipeline drags, dispatch assignments, follow-up resolutions, and generated content live in the
browser session only and reset on reload — so the demo always opens in a known-good state.

# Get Down Pressure Washing × WISE² — Owner Business Command Center Demo

**Built for Rob & Kaytiie Panzica**

A presentation-ready demonstration of how the WISE² Operating System strengthens Get Down 
Pressure Washing LLC—the Troutman, NC-based leader in residential and commercial pressure washing, 
serving communities across the Carolinas.

**Get Down is the brand. Get Down is the business. WISE² is the controlled-growth system that 
powers it.**

## Run it

```bash
pnpm --filter @wise2/getdown-demo dev
```

Then open **http://localhost:3020**. No login, no database, no environment variables.

Present full-screen at **1920×1080**. The guided tour advances with `→` or the space bar, goes
back with `←`, and exits with `esc`.

## Presenting to Rob & Kaytiie

1. The opening screen offers **Enter Command Center** or **Start Owner Tour**.
2. The tour is 12 steps, roughly 5–7 minutes, and walks through how WISE² organizes their business.
3. It ends on the closing screen with the **Let's Build Get Down OS** call to action.
4. **Start Owner Tour** is always available in the top bar.

## About the Demo Data

**Everything shown here is completely fictional.** The customers, properties, crew members, 
financial figures, and performance metrics are simulated to demonstrate system capabilities. 
Fictional organizations are prefixed with `*` and use reserved `example.test` domains and `555` 
phone numbers.

Nothing in this demo represents actual Get Down Pressure Washing customers, revenue, operations, 
or results. The purpose is to show Rob & Kaytiie what organized visibility, automated follow-up, 
and controlled growth could look like for their business.

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

## Data Safety & Isolation

Everything in this app is self-contained. It has **zero connection** to:
- WISE² production infrastructure
- Real Get Down Pressure Washing customer records
- Payment systems or billing
- Actual crew or property data
- Real email, SMS, or communication channels

The demo **cannot**:
- Send emails or text messages
- Charge a card or process payments
- Create real invoices or contracts
- Modify production customer records
- Publish to Google Business Profile or social media
- Trigger production automations

**All data is fictional.** Customers, properties, managers, and financial figures are 100% simulated.
Fictional organizations are prefixed with `*` in the seed file, and contacts use reserved `example.test` 
domains and `555` phone numbers per RFC 2606.

The `Owner Demo` toggle in the top bar controls the simulated-data banner at the top of screens.

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

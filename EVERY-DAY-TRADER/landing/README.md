# EVERY DAY TRADER — landing page (V1)

Powered by WISE². Knowledge Builds Freedom. Discipline Creates Freedom.

A static, no-build landing page. It is educational and paper-trading only. It does not connect to a brokerage, place orders, or show live market data.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000 --directory EVERY-DAY-TRADER/landing
```

Open http://localhost:8000. The "Enter the Market" buttons link to `../dashboard/index.html`, so for those links to resolve, serve the parent folder instead:

```bash
python3 -m http.server 8000 --directory EVERY-DAY-TRADER
# then open http://localhost:8000/landing/
```

Check the JavaScript syntax:

```bash
for f in EVERY-DAY-TRADER/landing/*.js; do node --check "$f"; done
```

## Files

| File | Purpose |
|---|---|
| `index.html` | Page structure and all sections |
| `styles.css` | Layout, glass UI, road scene layers, responsive rules, reduced motion |
| `config.js` | Runtime config placeholders (`TRAFFIC_FEED_MODE`, `TRAFFIC_PROVIDER_URL`, `TRAFFIC_CAMERA_ID`) |
| `traffic-feed.js` | `TrafficFeedProvider` boundary, mock provider, and the LIE status panel |
| `app.js` | Market pulse, command-center tabs, Setup Builder, mobile menu, email demo |

## Market Traffic Live (LIE hero)

The hero is built as stacked layers: sky, parallax skyline, perspective road with moving light streaks, fog, and grain. The road is a CSS composition, so the page works with no video at all.

The live feed is off by default. `config.js` sets `TRAFFIC_FEED_MODE: "mock"`, and the mock provider never reports a live feed. The page then shows `LIE ATMOSPHERE — SIMULATED VISUAL` and `Live roadway feed unavailable`. It never presents simulated footage as live.

Before any real camera is connected:

1. Verify the provider's API or embed terms, attribution requirements, refresh limits, and commercial-use permission.
2. Implement `ApprovedProviderStub.getFrame()` in `traffic-feed.js` against that provider. It must return a `FeedFrame` with an approved `src`, an honest `updatedAt`, and `simulated: false`.
3. Set `TRAFFIC_FEED_MODE` to `"provider"` and fill in the placeholders. Do not commit real URLs, keys, or tokens.

Never hard-code, scrape, proxy, rehost, or iframe a traffic camera. Road conditions are visual context only. They are not market data or trading signals.

## Replacing the placeholder road loop

The road is currently a CSS composition. To swap in a licensed or generated seamless 16:9 loop, add `public/media/everyday-trader-lie-loop.mp4` (plus a compressed web variant and a poster frame), then set it as the background in the `.scene` block of `styles.css`. Keep the static CSS composition as the reduced-motion and failure fallback. The image prompt is in `EVERYDAY_TRADER_CLAUDE_BUILD_HANDOFF.md`.

## Demo data

All market values are in `app.js` under `DEMO DATA — NOT LIVE`. The Setup Builder computes whole-share size from entry, stop, and risk budget. It mirrors the logic in `research/research.py`. Its output is planned risk only. Gaps and slippage can make real losses larger.

## Design decisions

- No build step and no runtime dependencies. This matches the rest of the repository, which has no `package.json`. The handoff suggested React, Vite, and Tailwind. Adopt them only if the repository adds a JavaScript toolchain.
- The email capture is a front-end demo. It validates the address and shows a clear "not connected" note. It never displays a fake success message.
- Privacy and Terms links are placeholders (`#privacy`, `#terms`) until real pages exist.

## Not included

- Deployment or publishing. Ask before publishing.
- Any backend, authentication, or brokerage or wallet connection.
- Live market data.

# God's Eye View → WISE² / Mathis Electric Living Grid

Status: integration design branch, no deployment or source overwrite.

## Verified source
- Upstream: https://github.com/bilawalsidhu/gods-eye-view
- Site: https://godseyeview.ai/
- Upstream package version observed: 0.3.0
- Stack: Vue 3, Vite, Cesium; Node >=24.14 <25 or >=26 <27
- WISE² core: pnpm/Turborepo, Next.js 14, Node >=20
- Upstream LICENSE: MIT for source only; third-party datasets and live providers have separate terms.

## Architecture
1. Preserve existing WISE² and any previously installed God's Eye service. Inventory before changing anything.
2. Pin an upstream commit and install a separate, isolated God's Eye service under a dedicated directory/container, with its own supported Node runtime.
3. Expose the globe behind a same-origin reverse proxy such as /living-grid/globe/ (actual path to be confirmed after routing audit).
4. Host the cinematic Mathis Electric entrance in the existing website, then transition to the globe using a link or isolated embedded frame, depending on CSP, authentication, and UX testing.
5. Communicate only through a documented, allowlisted interface (e.g. postMessage with exact origin checks) for navigation to a selected site, camera fly-to, and reset. Never accept arbitrary commands or credentials from the browser.
6. Start with the globe, navigation, and licensed basemap. Defer aircraft, CCTV, military, and unrelated tracking feeds for the contractor website.
7. Build an opt-in 'Electrical Infrastructure' presentation layer using verified customer-approved project coordinates and public licensed data. Do not imply that simulated lines are actual utility locations.
8. Preserve the exact approved Mathis Electric logo as an overlay asset; do not regenerate it.

## Licensing gates
- Retain MIT notice and copyright for reused source.
- Review THIRD_PARTY_NOTICES.md and DATA_SOURCES.md.
- Exclude TeleGeography CC BY-NC-SA data and Vantor/GeoPera CC BY-NC imagery from commercial deployment absent permission.
- Audit Google Maps/Cesium tiles, OSM, provider keys, and attribution separately.
- Never commit API keys or SSH private keys.

## Read-only baseline audit (when shell access becomes available)
- Record existing services, containers, ports, routes, reverse proxy, and git status.
- Locate any existing God's Eye checkout, record git remote and commit, preserve modifications.
- Verify current site availability and build/test baseline before installing or deploying.
- Compare upstream against existing copy; no blind pull or forced update.

## Validation gates
- Isolated development build and test pass
- Desktop/mobile browser globe render
- Cinematic entrance → globe transition
- Logo pixel-accurate overlay
- Accessibility, motion-reduction and fallback image
- Resource usage and CSP/security audit
- Production release only after review

## Not yet verified
- Whether Daniel's previous God's Eye integration exists on the server
- Current reverse-proxy routes or hosting setup
- Existing SSH/Tailscale access from this execution environment
- Commercial rights to all runtime map tiles/data

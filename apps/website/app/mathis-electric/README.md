# Mathis Electric Living Grid route

Route: `/mathis-electric` in the WISE² Next.js website.

## Asset required
Place the approved optimized entrance video at:
`apps/website/public/mathis/entrance.mp4`

Use `scripts/mathis-stage-entrance.sh`. The video is gitignored; stage it on the server.

## Globe (approved proxy strategy)
- Isolated God's Eye View service.
- Same-origin reverse proxy at `/living-grid/globe/`.
- Nginx snippet: `infrastructure/nginx/mathis/living-grid-globe.snippet.conf`
- Production iframe URL (after verification):  
  `https://mathis.wise2.net/living-grid/globe/?embed=1`
- GEV must run with `GEV_EMBED_FRAME_ANCESTORS=https://mathis.wise2.net`
- Set `NEXT_PUBLIC_MATHIS_GLOBE_URL` only after the globe actually renders and responds.

If the env var is unset, visitors see the standard website (no broken iframe).

## Deployment checklist
- [ ] Stage entrance.mp4
- [ ] Verify video HTTP 200 / video/mp4
- [ ] Confirm mobile autoplay, skip, mute, reduced-motion
- [ ] Install isolated GEV (Node ≥24.14), strip NC datasets
- [ ] Apply nginx snippet and set GEV_EMBED_FRAME_ANCESTORS
- [ ] Confirm Cesium assets and /api routes work under the prefix
- [ ] Verify actual globe render + interaction (not just onLoad)
- [ ] Set NEXT_PUBLIC_MATHIS_GLOBE_URL
- [ ] Desktop / mobile / a11y / regression tests
- [ ] Commercial licensing audit complete
- [ ] Deploy only after explicit approval

The route does not change the WISE² root homepage or production routing.

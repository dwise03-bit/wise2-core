# Mathis Electric Living Grid route

Route: `/mathis-electric` in the WISE² Next.js website.

## Asset required
Place the approved optimized entrance video at:
`apps/website/public/mathis/entrance.mp4`

The video is intentionally **not** checked in yet. Do not deploy this route as finished until the binary is uploaded to the correct location. The approved source remains in the ChatGPT conversation and is not available to the GitHub text-file connector.

## Globe
The globe is **not** embedded until `NEXT_PUBLIC_MATHIS_GLOBE_URL` is configured. Set this to a verified same-origin or explicitly trusted URL after the independently hosted God's Eye service is installed, secured, and tested. If unset, visitors see the functional standard website rather than a broken iframe.

## Deployment checklist
- [ ] Upload optimized entrance.mp4 to public/mathis/entrance.mp4
- [ ] Verify video returns HTTP 200 and Content-Type video/mp4
- [ ] Confirm mobile autoplay, skip, mute, and replay
- [ ] Install God's Eye separately with Node version supported by upstream
- [ ] Review source/data licenses and tile provider terms for commercial usage
- [ ] Verify globe origin, frame policy, and secure hosting
- [ ] Configure NEXT_PUBLIC_MATHIS_GLOBE_URL
- [ ] Verify actual globe render, not merely iframe onLoad
- [ ] Run pnpm --dir apps/website type-check and build
- [ ] Review brand logo asset and actual customer contact details
- [ ] Deploy only after approval

The route does not change the WISE² root homepage or production routing.

# WISE² Go-Go Bucket Cinematic Landing

Status: **STAGED, NOT DEPLOYED**. This branch is a release preparation checkpoint, not proof of a live site.

## Source package
The user-provided complete package is `wise2-gogo-full-assets.zip` (approximately 18 MB), currently in the ChatGPT conversation workspace. It contains:
- `index.html`
- `assets/gogo-bucket.jpg` (original supplied concept artwork)
- `assets/reference.mp4` (original supplied creative reference)
- `assets/frame-{3,7,11,15,19}.jpg`
- `quality/audit.json` and `README.md`

**Important:** ChatGPT conversation sandbox files are not accessible to GitHub Actions or the WISE² server automatically. The complete package must be uploaded to this repository or transferred to the authorized server before deployment. Do not substitute stock imagery or silently omit the video.

## Release gate
1. Transfer the actual full asset package into `sites/gogo/` while preserving relative paths.
2. Confirm every referenced asset resolves, including the MP4.
3. Test desktop and mobile rendering, video playback, motion, accessibility and reduced-motion behavior.
4. Run WISE² cinematic quality review against the supplied reference.
5. Deploy to the approved route only after the existing reverse proxy configuration and release process are inspected.
6. Verify HTTP status, TLS, correct content and asset responses on the public domain.

Never replace the WISE² homepage or modify unrelated routes as part of this release. Hardware integrations are concepts, not verified products.

# WISE² iOS Agent Workflow

Run from the repository root:

```bash
scripts/wise2-preflight.sh mobile
apps/wise2-ios/scripts/wise2-ios-check.sh
apps/wise2-ios/scripts/wise2-ios-test.sh
```

Override the scheme or simulator with `WISE2_IOS_SCHEME` and `WISE2_IOS_DESTINATION`. Signing remains local to the Mac. Do not send provisioning profiles or certificates to the VPS.

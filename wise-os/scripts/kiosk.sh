#!/bin/sh
set -eu
xset s off 2>/dev/null || true
xset -dpms 2>/dev/null || true
unclutter -idle 3 -root 2>/dev/null &
BROWSER="$(command -v chromium || command -v chromium-browser)"
PLATFORM_ARGS=""
if [ -n "${WAYLAND_DISPLAY:-}" ]; then PLATFORM_ARGS="--ozone-platform=wayland --enable-features=UseOzonePlatform"; fi
# shellcheck disable=SC2086
exec "$BROWSER" $PLATFORM_ARGS --kiosk --noerrdialogs --disable-infobars --disable-session-crashed-bubble --disable-renderer-accessibility --disable-background-networking --disable-component-update --disable-sync --disable-translate http://127.0.0.1:${WISE2_PORT:-3000}

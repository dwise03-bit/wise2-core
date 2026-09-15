#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
scheme="${WISE2_IOS_SCHEME:-WISE2}"
dest="${WISE2_IOS_DESTINATION:-platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5}"
out="${WISE2_IOS_RESULT_BUNDLE:-$PWD/build/wise2-tests.xcresult}"
mkdir -p "$(dirname "$out")"
rm -rf "$out"
xcodebuild test -project WISE2.xcodeproj -scheme "$scheme" -destination "$dest" -resultBundlePath "$out"

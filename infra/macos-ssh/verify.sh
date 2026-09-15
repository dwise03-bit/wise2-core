#!/bin/bash
set -euo pipefail
ssh -G gpu-nmls >/dev/null
ssh -o BatchMode=yes -o ConnectTimeout=5 localhost 'echo LOCAL_SSH_OK'
ssh -o BatchMode=yes -o ConnectTimeout=8 gpu-nmls 'echo GPU_SSH_OK'
if grep -R -E 'BEGIN (OPENSSH|RSA|EC|DSA) PRIVATE KEY' infra/macos-ssh --exclude=README.md --exclude=verify.sh; then
  echo 'Unsafe SSH material marker detected' >&2
  exit 1
fi
echo WISE2_SSH_BASELINE_OK

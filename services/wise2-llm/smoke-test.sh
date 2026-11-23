#!/usr/bin/env bash
set -euo pipefail
: "${WISE2_LLM_API_KEY:?Set WISE2_LLM_API_KEY in environment}"
BASE="${WISE2_LLM_URL:-http://127.0.0.1:8132}"
echo "[1] Model readiness"
curl --fail --silent --show-error --max-time 10 "$BASE/health"
echo
echo "[2] Unauthorized request must be rejected"
status=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$BASE/v1/models")
test "$status" = 401
echo "[3] Authenticated model listing"
curl --fail --silent --show-error --max-time 10 "$BASE/v1/models" -H "Authorization: Bearer $WISE2_LLM_API_KEY"
echo
echo "[4] Real Ollama inference"
curl --fail --silent --show-error --max-time 180 "$BASE/v1/chat/completions" -H "Authorization: Bearer $WISE2_LLM_API_KEY" -H 'Content-Type: application/json' -d '{"messages":[{"role":"user","content":"Reply with WISE2 READY"}]}'
echo
echo "Smoke checks completed; inspect model response above."

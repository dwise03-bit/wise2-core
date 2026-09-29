#!/bin/bash
# WISE² Slack Alerting
# Usage: ./scripts/slack-alert.sh "title" "description" ":emoji:" "#color"

WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
TITLE="${1:-WISE² Alert}"
DESCRIPTION="${2:-Event}"
EMOJI="${3:-🔔}"
COLOR="${4:-#0099FF}"

if [ -z "$WEBHOOK_URL" ]; then
  echo "⚠️  SLACK_WEBHOOK_URL not set"
  exit 0
fi

curl -X POST "$WEBHOOK_URL" \
  -H 'Content-Type: application/json' \
  -d "{
    \"attachments\": [{
      \"color\": \"$COLOR\",
      \"title\": \"$EMOJI $TITLE\",
      \"text\": \"$DESCRIPTION\",
      \"footer\": \"WISE² Deployment\",
      \"ts\": $(date +%s)
    }]
  }" -s > /dev/null 2>&1 && echo "📤 Slack: $TITLE" || echo "❌ Slack failed"

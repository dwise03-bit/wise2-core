#!/bin/bash
# WISE² Tailscale ACL Application Script
# Apply comprehensive network organization and security policies
#
# Usage: ./apply_wise2_tailscale_acl.sh
#
# Note: This script documents the ACL configuration and provides the JSON
# for application via Tailscale console or API.

set -e

echo "════════════════════════════════════════════"
echo "WISE² Tailscale ACL Configuration"
echo "════════════════════════════════════════════"
echo

# Create ACL JSON configuration
ACL_JSON=$(cat <<'EOJSON'
{
  "tagOwners": {
    "tag:infrastructure": ["dwise03@gmail.com"],
    "tag:edge": ["dwise03@gmail.com"],
    "tag:developers": ["dwise03@gmail.com"],
    "tag:field-tech": ["dwise03@gmail.com"],
    "tag:shared": ["dwise03@gmail.com"],
    "tag:operators": ["dwise03@gmail.com"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["tag:developers", "tag:operators"],
      "dst": ["tag:infrastructure", "tag:edge", "tag:shared", "*:*"]
    },
    {
      "action": "accept",
      "src": ["tag:field-tech"],
      "dst": ["tag:edge:3000,3001,3002,3003,3004,3005,4000,8080"]
    },
    {
      "action": "accept",
      "src": ["tag:edge"],
      "dst": ["tag:infrastructure:22,443,5433,6380"]
    },
    {
      "action": "accept",
      "src": ["tag:shared"],
      "dst": ["tag:edge:3000,4000,8080"]
    },
    {
      "action": "deny",
      "src": ["*"],
      "dst": ["*:*"]
    }
  ],
  "autoApprovers": {
    "exitNode": ["dwise03@gmail.com"],
    "routes": ["dwise03@gmail.com"]
  }
}
EOJSON
)

# Save ACL JSON to file
ACL_FILE="/tmp/wise2_tailscale_acl.json"
echo "$ACL_JSON" > "$ACL_FILE"

echo "✓ WISE² Tailscale ACL Configuration created"
echo
echo "To apply this configuration, use ONE of these methods:"
echo
echo "METHOD 1: Via Tailscale Console (Web UI)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Go to: https://login.tailscale.com/admin/acls"
echo "2. Click 'JSON editor' in Access controls menu"
echo "3. Copy the following JSON and paste into editor:"
echo
echo "JSON Configuration:"
echo "───────────────────"
echo "$ACL_JSON"
echo
echo "4. Click 'Save' button"
echo "5. Verify ACLs are now active"
echo

echo "METHOD 2: Via Tailscale API (CLI)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Requires Tailscale account API token in ~/.tailscale/api_token"
echo
cat << 'EOAPI'
TAILSCALE_TOKEN=$(cat ~/.tailscale/api_token)
TAILSCALE_TAILNET="dwise03@gmail.com"

curl -X POST \
  "https://api.tailscale.com/api/v2/tailnets/${TAILSCALE_TAILNET}/acl" \
  -H "Authorization: Bearer ${TAILSCALE_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @/tmp/wise2_tailscale_acl.json
EOAPI
echo

echo "METHOD 3: Manual Tag Assignment (Browser)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Go to: https://login.tailscale.com/admin/machines"
echo
echo "Assign tags to each machine:"
echo
echo "Infrastructure (6 machines):"
echo "  - gpu-nmls → tag:infrastructure"
echo "  - gpu-nmls-1 → tag:infrastructure"
echo "  - vps-0fa5d30a → tag:infrastructure"
echo "  - cursor-cloud-iphone-deploy → tag:infrastructure"
echo "  - wise2-cloud-agent → tag:infrastructure"
echo "  - (any other cloud/infra machines)"
echo
echo "Edge Nodes (2 machines):"
echo "  - wise2-skorpious → tag:edge"
echo "  - wisepi → tag:edge"
echo
echo "Developers (3 machines):"
echo "  - daniels-macbook-pro → tag:developers,tag:operators"
echo "  - dwise-mac → tag:developers,tag:operators"
echo "  - gl-mt3600be → tag:developers"
echo
echo "Field Tech (6 machines):"
echo "  - ipad-9th-gen-wifi → tag:field-tech"
echo "  - iphone-15-pro-max → tag:field-tech"
echo "  - iphone175 → tag:field-tech"
echo "  - iphone182 → tag:field-tech"
echo "  - google-pixel-slate → tag:field-tech"
echo "  - motorola-razr-2025-xt2553v → tag:field-tech"
echo
echo "Shared (1 machine):"
echo "  - darrinwisejr → tag:shared"
echo

echo "════════════════════════════════════════════"
echo "✓ WISE² Tailscale Configuration Ready"
echo "════════════════════════════════════════════"
echo
echo "Next steps:"
echo "1. Choose your preferred application method above"
echo "2. Apply the ACL configuration"
echo "3. Verify all machines have correct tags"
echo "4. Test access permissions:"
echo
echo "   # From developer machine - should work"
echo "   ssh -i ~/.ssh/skorpias-deploy d@100.85.242.34"
echo
echo "   # From field device - should work (edge only)"
echo "   curl http://100.85.242.34:3000"
echo

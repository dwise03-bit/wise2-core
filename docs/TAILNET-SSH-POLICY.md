# WISE² Tailnet SSH policy

> ACL draft + per-device bootstrap for making Tailscale SSH the default on
> every WISE² device, with no interactive "Tailscale SSH requires an
> additional check" prompt for the tailnet owner.

Two independent layers:

| Layer | What it does | Who edits it |
|---|---|---|
| **Per-node `RunSSH`** | Whether tailscaled on that node accepts inbound SSH over the tailnet | Each device, once: `sudo tailscale set --ssh` (or `scripts/wise2-bootstrap-device.sh`) |
| **Tailnet ACL** | Who is allowed to SSH to whom, and whether the connection is accepted outright or gated behind a Tailscale check URL | Tailnet admin, in https://login.tailscale.com/admin/acls |

Both are required. ACL alone doesn't flip `RunSSH`; `RunSSH` alone still gets rejected if ACL says deny.

## Per-device bootstrap

`scripts/wise2-bootstrap-device.sh` sets `--operator=$SUDO_USER`, enables
Tailscale SSH, and installs the `wise2-sync.user.timer`. One-time, idempotent,
needs sudo once:

```bash
sudo bash scripts/wise2-bootstrap-device.sh
```

Verify:

```bash
tailscale debug prefs | grep -E 'OperatorUser|RunSSH'
# → "OperatorUser": "dwise"
# → "RunSSH": true
```

## Tailnet ACL draft

Paste this into https://login.tailscale.com/admin/acls (replace
`dwise03@gmail.com` if your tailnet owner is different). The ACL is in
HuJSON — comments start with `//`.

```hujson
{
  // Tags you can apply to nodes to scope rules. Only `autogroup:owner` can
  // create nodes with a tag.
  "tagOwners": {
    "tag:wise2":        ["autogroup:owner"],
    "tag:wise2-server": ["autogroup:owner"],
  },

  // Base network ACL — allow all your own nodes to talk to each other on
  // all ports. If your tailnet is multi-user, tighten src/dst accordingly.
  "acls": [
    {
      "action": "accept",
      "src":    ["autogroup:member"],
      "dst":    ["autogroup:member:*"],
    },
  ],

  // SSH access via Tailscale SSH. `action: accept` = no check URL for the
  // listed users. The tailnet owner (that's you) gets passwordless SSH to
  // every WISE² node as any nonroot user or root. Other tailnet members
  // (if any) are gated by `action: check` so they must approve in the
  // browser on first access and periodically after (720 min default).
  "ssh": [
    // You, from any of your devices, to any of your devices — accept.
    {
      "action": "accept",
      "src":    ["autogroup:owner"],
      "dst":    ["autogroup:member"],
      "users":  ["autogroup:nonroot", "root"],
    },
    // Any tailnet member (incl. shared-in guests) to any member — check.
    // Omit this block if you don't want shared-in guests to SSH at all.
    {
      "action":      "check",
      "src":         ["autogroup:member"],
      "dst":         ["autogroup:member"],
      "users":       ["autogroup:nonroot"],
      "checkPeriod": "12h",
    },
  ],

  // Optional: let certain tagged nodes auto-approve themselves as exit
  // nodes / subnet routers at join time (not SSH-specific — included
  // because the sync + bootstrap flow benefits from auto-approve for
  // tagged server nodes like gpu-nmls-1).
  "autoApprovers": {
    "routes": {
      // "10.0.0.0/8": ["tag:wise2-server"],
    },
    "exitNode": ["tag:wise2-server"],
  },
}
```

### What this changes

- **Before**: an SSH to `gpu-nmls-1` from this Surface would print
  `# Tailscale SSH requires an additional check.` and wait for a browser
  click. Backgrounded `!` commands never see the URL and die.
- **After**: owner → owner SSH is `action: accept`, no check URL, no
  browser hop. Backgrounded commands + sync scripts work non-interactively.

### Safety notes

- `autogroup:owner` is you only (the tailnet creator / admin). Any
  compromised owner device can SSH everywhere — don't lose that primary
  account.
- Keep MFA/2FA on your Tailscale login — that's the real auth boundary.
- If you ever share your tailnet with a non-owner teammate, the second
  `ssh` rule (`"action": "check"`) still gates them behind a browser
  check even when they're a tailnet member.
- Tailscale ACL changes take effect **immediately** on save. Test from a
  second device before closing the editor.

## Verifying end-to-end

From any peer where you've enabled `RunSSH`:

```bash
# No key, no password — just works if ACL + RunSSH are both green.
ssh dwise@wise2-surface   'echo hello from $(hostname) at $(date -u +%FT%TZ)'
ssh dwise@gpu-nmls-1      'systemctl is-active cloudflared || echo cloudflared NOT running'
```

If you still see the check URL, either the ACL rule for `autogroup:owner`
isn't in effect yet (reload the admin page and check) or the client
version is old (`tailscale version`).

## Rollback

Policy changes are reverted by editing the ACL back in the admin console.
`sudo tailscale set --ssh=false` on a node disables inbound SSH there.
Device bootstrap script is reversed by `systemctl --user disable --now
wise2-sync.timer` and `sudo tailscale set --ssh=false --operator=`.

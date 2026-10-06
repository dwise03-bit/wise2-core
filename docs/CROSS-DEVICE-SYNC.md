# WISE² cross-device sync

> Keep the `wise2-linux` repo (and later other WISE² repos) in sync across
> every device on your tailnet, without ever force-pushing, auto-merging,
> or touching a dirty working tree.

## Shape

Each device runs a small user-level timer (`wise2-sync.user.timer`) that
calls `scripts/wise2-sync` every 5 minutes. For each configured repo it:

1. Confirms the branch has an upstream.
2. Confirms the working tree is clean (**dirty = skip**, never auto-stash).
3. `git fetch`.
4. `git pull --ff-only` if upstream is strictly ahead.
5. `git push` if local is strictly ahead.
6. On divergence, logs and bails for manual resolution.

Nothing destructive. No `--force`. No merges. All actions log to
`~/.local/share/wise2/sync.log`.

## Per-device install (one-time, no sudo)

Assumes this repo is checked out at `~/wise2-level-up` (adjust if elsewhere).

```bash
mkdir -p ~/.config/systemd/user ~/.local/share/wise2
cp services/wise2-sync.user.service ~/.config/systemd/user/wise2-sync.service
cp services/wise2-sync.user.timer   ~/.config/systemd/user/wise2-sync.timer
systemctl --user daemon-reload
systemctl --user enable --now wise2-sync.timer
systemctl --user status wise2-sync.timer --no-pager | head -10
```

The service `ReadWritePaths` reference `%h/wise2-level-up` — if your clone
lives elsewhere, edit the unit before installing OR run
`scripts/wise2-sync /path/to/repo` from your own cron / timer instead.

### Verify

```bash
systemctl --user list-timers | grep wise2-sync
systemctl --user cat wise2-sync.service
tail -f ~/.local/share/wise2/sync.log
```

## What syncs today

- `~/wise2-level-up` → `linux/<current-branch>` (currently `level-up-2026-10-03`).

To sync additional repos, pass them as arguments:

```bash
~/wise2-level-up/scripts/wise2-sync ~/wise2-level-up ~/other-wise2-checkout
```

Or edit `wise2-sync.user.service`'s `ExecStart=` to list every path.

## Safety guarantees (and what breaks them)

| Guarantee | How enforced |
|---|---|
| Never force-push | Script literally does not pass `--force` |
| Never auto-merge upstream | `git pull --ff-only` only; non-FF skips |
| Never silently stash local work | Dirty tree → skip + log; nothing moved |
| Never run against detached HEAD | `git symbolic-ref` check |
| Never push without a tracking branch | `@{upstream}` check |
| Never write outside your home | systemd `ProtectHome=read-only`, `ReadWritePaths` scoped |
| Logs reviewable in one file | `~/.local/share/wise2/sync.log` |

### Breaks the guarantees
- Running `wise2-sync` as root (don't).
- Editing the service to remove the sandbox directives.
- Pointing it at a repo whose working tree is managed by another process
  that leaves it dirty between runs (sync will skip every tick).

## Tailscale as the device registry

`tailscale status --json` is the canonical list of your devices and their
online state. The current `devices/` directory in this repo is manual
inventory; the plan is to refresh it from `tailscale status --json` so the
registry stays in sync with the tailnet without human edits. This script
intentionally does not change the device registry yet — that's a separate
WIP tracked in `docs/CURRENT-STATE.md`.

Quick ad-hoc query (no sudo once `tailscale set --operator=$USER`):

```bash
tailscale status --json | jq -r '.Peer[] | select(.Online) | "\(.HostName)\t\(.TailscaleIPs[0])\t\(.OS)"'
```

## Rollback

Everything is user-level; nothing persists outside `~/.config/systemd/user`
and `~/.local/share/wise2`.

```bash
systemctl --user disable --now wise2-sync.timer
rm ~/.config/systemd/user/wise2-sync.service ~/.config/systemd/user/wise2-sync.timer
systemctl --user daemon-reload
```

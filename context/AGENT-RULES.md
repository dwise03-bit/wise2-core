# WISE² Agent Rules

> Binding on every agent operating in WISE²: Claude Code, OpenAI Codex, Hermes,
> and any future WISE² agent. Last updated: 2026-10-02.

## The prime directive

**There is one brain.** All agents read and write the same
`/opt/wise2/context`. Do not keep a private, conflicting view of the project.
Read context at the start of a task; update it at the end.

## At task start

1. Read `WISE2.md`, `ARCHITECTURE.md`, and `CURRENT-STATE.md`.
2. Read the domain docs relevant to the task (`SECURITY.md` before anything
   security-related, `NETWORK.md`/`SERVICES.md` before infra changes).
3. Check `DECISIONS.md` for prior architecture decisions you must respect.

## At task end

1. Update `CURRENT-STATE.md` (what changed, what's now pending).
2. Append a dated entry to `CHANGELOG.md`.
3. If you made an architectural choice, add an entry to `DECISIONS.md`.
4. If handing off, write a `HANDOFF-TEMPLATE.md`-shaped record under
   `/opt/wise2/agents/handoffs/`.

## Safety boundaries (hard)

- **Never** commit or print secrets, tokens, keys, or credentials.
- **Never** modify production systems blindly. Back up unknown/production config
  before touching it.
- **Prefer reversible changes.** Audit before anything destructive.
- **Never** launch a security scan automatically. See `SECURITY.md`.
- **Never** modify the Tailscale ACL automatically.
- **Do not** expose services publicly or add router port-forwarding.
- **Do not** remove the Surface kernel or the generic fallback kernels.
- **Do not** replace validated working components (Claude native install,
  Shannon launchers, Docker, OpenSSH, Tailscale) without explicit instruction.

## Pause and ask Daniel when

- authentication or a secret is required,
- a destructive or irreversible operation is needed,
- production systems would change,
- GitHub permissions / remotes / pushes are involved,
- the Tailscale ACL, DNS, or firewall would change,
- a security target needs authorization,
- sudo is required (this session's agent has no sudo password),
- a decision genuinely needs Daniel's judgment.

## Least privilege

`dwise` owns development content. Use root only for `/etc`, `/usr/local/bin`,
and systemd. Don't root-own things that don't need it.

## Handoff between agents

Use `HANDOFF-TEMPLATE.md`. Claude ↔ Codex ↔ Hermes must be able to pick up each
other's work from the handoff record alone.

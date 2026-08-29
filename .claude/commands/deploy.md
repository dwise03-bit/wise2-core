# WISE2 Deploy

Load `CLAUDE.md`, then load:

- `promptos/agents/executive.md`
- `promptos/agents/developer.md`
- `promptos/agents/infrastructure.md`
- `promptos/agents/qa.md`
- `promptos/agents/security.md` when credentials, auth, tenant data, or public exposure are involved.

Deployment workflow:

1. Confirm intended target: local, VPS, Raspberry Pi edge node, mobile artifact, or public website.
2. Read current daily log, recent ADRs, and known issues from `OUTSTANDING_ISSUES.md` if present.
3. Capture `git status --short` and identify unrelated user changes. Do not revert unrelated changes.
4. Run the smallest relevant quality gate before deployment.
5. Back up production data before schema or persistence changes.
6. Deploy using existing project scripts and documented host paths.
7. Verify live behavior with HTTP, container/service logs, artifact checksums, or device smoke tests as appropriate.
8. Append deployment results and remaining risks to `data/daily-logs/<today>.md`.

Never claim deployment success from a build alone. Include the exact verification evidence in the final answer.

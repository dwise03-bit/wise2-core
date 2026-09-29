# WISE² Control Workflow

The control bridge is the canonical local control boundary. ChatGPT or another approved command layer creates a task contract; the bridge persists task state, dispatches the cheapest configured worker, and returns the standard handoff schema.

## API

All routes require `Authorization: Bearer $WISE2_CONTROL_TOKEN` except health.

- `POST /v1/control/tasks` — create a task. Set `dispatch: true` to dispatch immediately.
- `GET /v1/control/tasks` — list latest task states.
- `GET /v1/control/tasks/:taskId` — inspect one task.
- `POST /v1/control/tasks/:taskId/dispatch` — dispatch or retry a task; body may specify `agent`.

Task fields include `project`, `repoPath`, `goal`, `preferredAgent`, `riskLevel`, `approvalRequired`, `filesInScope`, and `testCommand`.

## Routing

`local` calls the configured Ollama chat endpoint (`WISE2_OLLAMA_CHAT_URL`, default `/api/chat`) using `WISE2_OLLAMA_MODEL` (default `qwen2.5-coder:7b`). Hermes, Claude, and Codex currently return an explicit unconfigured adapter handoff; they must not be represented as completed work.

Approval-required tasks are persisted as `blocked` without invoking a worker. Production deployment, destructive migrations, secret changes, and other irreversible operations must use this gate.

## State and safety

Task records are append-only JSONL at `WISE2_TASK_FILE` and reconstructed by task ID. The control bridge remains infrastructure control, not orchestration authority: source code stays in GitHub, and worker changes require normal branch/worktree coordination and verification.

Every dispatch returns `SUCCESS`, `PARTIAL`, `BLOCKED`, or `FAILED` with summary, changed files, tests, blockers, risks, next action, and approval status.

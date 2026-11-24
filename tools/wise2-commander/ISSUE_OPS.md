# WISE2 Commander issue-triggered operations

This workflow provides a no-command trigger for two fixed, read-only tasks on the existing `wise2` GitHub Actions runner.

## Trigger

Create an issue in `dwise03-bit/wise2-core` with exactly one title:

- `WISE2 OPS: server-health`
- `WISE2 OPS: public-link-audit`

The issue body is never read or executed. Only an issue authored by `dwise03-bit` with one of those exact titles can schedule the job. The runner additionally verifies that its short hostname is `wise2`.

## Scope

- `server-health` reports hostname, OS/kernel, uptime, root filesystem usage, and memory summary.
- `public-link-audit` sends HTTPS GET probes to a fixed list of public WISE2 URLs and reports status codes.

The workflow has read-only repository permissions. It does not inspect secrets or environment variables, run arbitrary shell from an issue body, edit server files, restart services, change DNS, send SMS, or deploy. Job output is visible in the repository's Actions logs.

## Current limitation

Only these read-only tasks are enabled. Add any mutating operation as a separate, reviewed workflow with its own fixed inputs and approval gate. Do not add a free-form command field.

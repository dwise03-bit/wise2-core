# WISE² AI Tool Experiments

## Rule
WISE² adopts tools because they measurably improve the business or product, not because they are new. Every candidate receives one of: `ADOPT`, `KEEP TESTING`, `REJECT`.

## Required experiment record
For each candidate record: problem, existing WISE² solution, candidate technology, measurable hypothesis, setup effort, recurring cost, data/security impact, success metric, test duration, rollback/removal plan, decision date, owner, and verdict.

A tool must demonstrate improvement in at least one of: revenue, delivery time, visual quality, reliability, security, or operating cost.

## Current high-value experiments

### Isolated coding-agent execution
Candidate: Cloud/container sandbox execution for Claude/Codex-style engineering jobs.

Hypothesis: risky/client-repository work can run with less production-host exposure while preserving useful engineering throughput.

Guardrail: no production credentials or unrestricted production network access in the experiment environment.

Initial verdict: `KEEP TESTING`.

### Common coding-agent adapter
Candidate: provider-neutral adapter/harness capable of invoking multiple coding agents under the existing WISE² orchestration layer.

Hypothesis: WISE² can swap/compare engineering workers without replacing Hermes or duplicating business orchestration.

Guardrail: Hermes remains orchestration authority; adapter must not create a second workflow/control plane.

Initial verdict: `KEEP TESTING`.

### Langfuse evaluator automation
Candidate: deterministic and model-based evaluator rules for engineering, phone, CRM, HVAC, and visual workflows.

Hypothesis: repeated failure patterns can become automated quality gates, reducing regressions and repeated manual review.

Guardrail: redact secrets/sensitive customer data and set explicit evaluator-cost limits.

Initial verdict: `KEEP TESTING` pending runtime verification.

### Private WISE² UI registry
Candidate: private reusable component registry built on the existing approved UI stack.

Hypothesis: approved WISE²/client UI primitives reduce build time and visual inconsistency across projects.

Guardrail: do not turn third-party component libraries into a second design system; WISE² owns the final components/tokens.

Initial verdict: `KEEP TESTING` pending representative component pilot and visual QA.

### Agent observability expansion
Candidate: expand existing Grafana/OpenTelemetry architecture with agent-oriented dashboards/correlation where supported.

Hypothesis: one operational view can correlate agent failures with API/container/infrastructure failures without adding another observability platform.

Initial verdict: `KEEP TESTING`.

### Automated client media
Candidate: agent-driven HeyGen/Runway-style content generation for onboarding, explainers, product demonstrations, and campaigns.

Hypothesis: paid client content can be produced faster without maintaining unnecessary always-on media subscriptions.

Guardrail: provider-neutral workflow; client revenue must justify recurring paid media spend.

Initial verdict: `KEEP TESTING`.

## Explicit non-experiments
Do not add these without a newly documented gap: another primary CRM; another primary automation platform alongside n8n; another generic multi-agent orchestrator alongside Hermes; another primary observability suite alongside Langfuse + OpenTelemetry/Grafana; another broad UI library merely for variety; Kubernetes solely for prestige rather than demonstrated scale.

## Credit Saver
Prefer free/self-hosted trials and existing infrastructure. Put hard limits on paid API experiments. Stop experiments that fail to produce measurable value; do not allow sunk-cost reasoning to convert pilots into permanent infrastructure.

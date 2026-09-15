# WISE² Ecosystem Master System Design

Date: 2026-09-15
Status: Proposed design for review
Branch: `design/wise2-ecosystem-master-system`

## Objective

Expand the current WISE² brand master sheet into a canonical Brand + Product Operating System that keeps all WISE² products visually and technically coherent while preserving clear product boundaries.

The system must make WISE² UNITED the parent identity, elevate Eagle Eye to a first-class standalone product, and define how shared services such as WISE² Core, Command Systems, CRM, AI Phone, HVAC, XR, Wearables, IMP, Sound Labs, Cloud, Wise Defense, SenCere Creative, client systems, and hardware relate without becoming a single tightly-coupled application.

## Source-of-truth brand direction

WISE² UNITED remains the master identity:

- Primary palette: black / charcoal / metallic silver / white / neon green.
- Accent colors may be product-specific while preserving the WISE² visual grammar.
- Primary motifs: metallic WISE² wordmark, W² monogram, owl, premium cinematic photography, night-city environments, technical HUD/grid overlays, glowing telemetry, chrome and glass UI surfaces.
- Positioning: `PEOPLE × AI × OPPORTUNITY`.
- Core operating message: `BUILD → CONNECT → TRANSFORM → AUTOMATE → SCALE → PROTECT`.
- Ecosystem flow: `CAPTURE → UNDERSTAND → DECIDE → ACT → VERIFY → LEARN`.
- Brand voice: decisive, premium, practical, systems-oriented, real-world impact focused.

## Brand hierarchy

### Tier 1 — Parent identity

**WISE² UNITED**

Owns the master design language, standards, shared brand assets, ecosystem positioning, and governance.

### Tier 2 — Strategic product platforms

These products receive distinct identities while inheriting the WISE² master system.

- **Eagle Eye** — real-world intelligence for security, facilities, HVAC, cameras, sensors, field capture, spatial telemetry, and operational awareness.
- **WISE² Core** — context engine, shared intelligence layer, agent routing, data/API services, model routing, and system context.
- **Command Systems** — command-center interface, alerts, workflows, automation, operational dashboards, team coordination, and control surfaces.
- **CRM + Revenue** — customers, leads, opportunities, service relationships, proposals, invoices, billing, and revenue operations.
- **AI Phone** — inbound/outbound voice, SMS, messaging, AI agents, scheduling, and human handoff.
- **WISE² HVAC** — field service, diagnostics, work orders, maintenance, equipment records, field tools, and technician workflows.
- **XR / Spatial** — Quest experiences, spatial dashboards, digital twins, training, and mixed-reality field workflows.
- **Wearables** — Ray-Ban Meta and related hands-free capture, assistance, and field intelligence.
- **WISE² IMP** — embodied assistant / companion platform, educational units, hardware characters, and specialized interfaces.
- **Hardware Lab** — Pocket Node, BYTE MINI, sensor nodes, probes, SBC systems, enclosures, and prototypes.
- **Sound Labs** — audio creation, live collaboration, Jingle Lab, creator tooling, streaming, and monetization.
- **WISE² Cloud** — hosting, infrastructure, domains, SSL, deployment support, and reseller services.
- **Wise Defense LLC** — training, protection, EDC, and defense-specific applications under a distinct red/black tactical treatment.
- **SenCere Creative LLC** — creative services, client brands, visual production, campaigns, and web/app design under a distinct purple identity.
- **Client Projects** — branded customer implementations that inherit system quality without looking like WISE² unless co-branded.

## Eagle Eye role

Eagle Eye is promoted to a standalone WISE² product with architecture designed for future spin-out.

### Product purpose

`SEE EVERYTHING. UNDERSTAND WHAT MATTERS.`

Eagle Eye combines:

- security awareness,
- facilities monitoring,
- HVAC intelligence,
- authorized cameras,
- field capture,
- IoT / edge sensors,
- telemetry,
- anomaly detection,
- AI summaries,
- operational alerts,
- digital twins,
- XR visualization.

### Core entity model

`Site → Building → Zone → Asset → Device → Observation → Event → Alert → Action`

This model must support multiple operating modes without requiring separate applications:

- `SECURITY`
- `FACILITIES`
- `HVAC`
- `ALL`

### Integration boundary

Eagle Eye owns its operational domain and uses versioned adapters to communicate with WISE² systems.

Eagle Eye must not directly depend on internal implementation details of WISE² Core, CRM, Command Systems, or AI Phone. Shared services are consumed through explicit contracts so Eagle Eye can later replace WISE² adapters without redesigning the product.

## System architecture

### 1. Capture layer

Sources include:

- mobile field capture,
- authorized cameras,
- Ray-Ban Meta / wearable capture,
- Pocket Node and other sensors,
- HVAC probes and equipment telemetry,
- Quest / XR interactions,
- operator notes,
- voice / phone events,
- approved third-party integrations.

### 2. Ingest layer

Responsibilities:

- validation,
- secure device authentication,
- normalized event schemas,
- media metadata,
- telemetry buffering,
- offline synchronization,
- source attribution,
- timestamps and site context.

### 3. Understand layer

Responsibilities:

- WISE² Context Engine integration,
- local-first model routing where practical,
- anomaly detection,
- summaries,
- asset condition classification,
- relationship / context linking,
- duplicate detection,
- confidence metadata.

### 4. Decide layer

Responsibilities:

- deterministic rules,
- AI recommendations,
- escalation policy,
- risk / severity classification,
- work-order recommendations,
- alert routing,
- human approval where required.

### 5. Act layer

Actions may include:

- create / update work orders,
- send alerts,
- notify field teams,
- open CRM tasks,
- initiate approved phone / SMS workflows,
- surface XR instructions,
- update Command dashboards,
- create reports.

### 6. Verify layer

Every action should produce verifiable evidence:

- completion record,
- technician confirmation,
- telemetry change,
- photo / video evidence,
- customer confirmation,
- system health result,
- before / after metrics.

### 7. Learn layer

Use verified outcomes to improve:

- rules,
- recommendations,
- asset histories,
- operational playbooks,
- local retrieval context,
- product analytics.

Do not silently train on private customer data outside approved policies.

## UI and design system

The Brand + Product Operating System should define reusable UI primitives instead of allowing each product or AI coding agent to invent new patterns.

### Shared primitives

- top-level command shell,
- left navigation,
- status cards,
- asset cards,
- alert severity states,
- telemetry tiles,
- map / digital twin overlays,
- AI assistant panel,
- work-order surfaces,
- timeline / event feed,
- camera tiles,
- global search,
- health indicators,
- command palette,
- modal / drawer behavior,
- mobile bottom navigation,
- empty, loading, error, offline, and degraded states.

### Eagle Eye UI modes

- `3D COMMAND` — cinematic digital twin / command world.
- `2D MAP` — fast operational map.
- `LIVE CAMERAS` — authorized camera feeds and event overlays.
- `ASSETS` — searchable asset and equipment intelligence.
- `ANALYTICS` — health, trends, incidents, and maintenance intelligence.

### Design inheritance

Every WISE² product inherits:

- spacing system,
- typography hierarchy,
- border / card language,
- icon weight,
- motion rules,
- accessibility rules,
- data visualization rules,
- status semantics,
- interaction states.

Product-specific accents are allowed, but the system must remain recognizably WISE².

## Canonical brand boards

The master system should be maintained as six connected source-of-truth boards.

### Board 1 — Master Identity

Contains:

- approved logos,
- wordmarks,
- owl,
- W² monogram,
- color tokens,
- typography,
- icon rules,
- image / photography direction,
- textures,
- HUD / grid language,
- tagline library,
- forbidden treatments.

### Board 2 — Product Universe

Contains:

- all active WISE² products,
- ownership / purpose,
- customer-facing positioning,
- integrations,
- product color / accent,
- current lifecycle state,
- links to repo / docs / deployment.

### Board 3 — Digital UI System

Contains:

- web components,
- mobile components,
- command-center components,
- XR design tokens,
- alerts,
- cards,
- charts,
- forms,
- navigation,
- AI interaction patterns.

### Board 4 — Physical + Device System

Contains:

- hardware visual language,
- enclosure branding,
- Pocket Node,
- BYTE MINI,
- IMP family,
- probes,
- Ray-Ban integration,
- Quest integration,
- packaging,
- labels,
- uniforms,
- field kits,
- vehicle applications.

### Board 5 — Sales + Customer System

Contains:

- project sheets,
- sales sheets,
- pricing templates,
- proposals,
- audit reports,
- client onboarding,
- presentation templates,
- website sections,
- social media graphics,
- QR-driven demos.

### Board 6 — Brand Governance

Contains:

- canonical asset locations,
- version numbers,
- change history,
- approval status,
- deprecated assets,
- AI-agent design instructions,
- code / design references,
- release checklist.

## Source-of-truth and repository rules

A machine-readable manifest should become the product catalog used by websites, dashboards, docs, and automation.

Recommended conceptual shape:

```yaml
products:
  - id: eagle-eye
    name: Eagle Eye
    parent: wise2-united
    status: active
    accent: intelligence-blue
    domains: [security, facilities, hvac]
    capabilities: [cameras, sensors, telemetry, ai, xr]
    integrations: [wise2-core, command-systems, crm, ai-phone]
```

The catalog should eventually drive:

- `wise2.net/apps`,
- internal project menus,
- AI / agent context,
- project sheets,
- docs,
- release / deployment status,
- design references.

No production implementation should rely on generated images as the source of truth for product names, architecture, or status.

## AI-agent governance

Claude, Codex, Cursor, Hermes, and local coding agents should consume a compact design contract before creating UI.

Minimum requirements:

1. Read canonical product manifest.
2. Read design tokens.
3. Reuse existing shared components before creating new ones.
4. Preserve approved product branding.
5. Never alter locked human likenesses in approved photography.
6. Do not invent products, integrations, deployment status, or capabilities.
7. Do not overwrite another developer's work.
8. Run tests and visual checks before merge.
9. Store new canonical assets in the approved asset registry.
10. Record material design-system changes in the governance changelog.

## Data ownership

Recommended ownership boundaries:

- WISE² Core: shared intelligence / context services.
- CRM: customer, lead, relationship, billing references.
- Eagle Eye: operational sites, buildings, zones, assets, devices, observations, events, alerts, spatial / telemetry records.
- HVAC: service-specific technician and work-order domain where not already shared through CRM.
- AI Phone: communication events and call-state domain.
- Command Systems: presentation / orchestration state and operational views.

Cross-domain references should use stable IDs and APIs rather than direct table coupling where practical.

## Reliability and safety

- Treat camera / sensor / AI output as evidence with confidence, not infallible truth.
- Human approval is required for consequential real-world actions unless explicitly configured otherwise.
- Device data should include freshness and source health.
- UI must visibly distinguish `ONLINE`, `STALE`, `OFFLINE`, `DEGRADED`, and `UNKNOWN`.
- Alerts require severity, source, timestamp, related asset/site, and acknowledgment state.
- Every automated action should be auditable.
- Store no secrets in repositories or generated assets.

## V1 scope

V1 should prove a complete vertical slice rather than implement every product capability.

### In scope

1. Canonical product / brand manifest.
2. Shared design tokens and product accent rules.
3. Eagle Eye product definition and shell.
4. Site / Building / Zone / Asset / Device / Observation / Event / Alert / Action model.
5. Sample Pocket Node / telemetry ingestion path.
6. Field capture integration contract.
7. Eagle Eye Command UI with 3D-command placeholder and working 2D operational mode.
8. Security / Facilities / HVAC / All filters.
9. AI insight panel using existing WISE² model routing through an adapter.
10. Alert -> work-order / task workflow.
11. WISE² integration adapters.
12. Documentation and test coverage.

### Deferred

- broad computer-vision model training,
- autonomous security enforcement,
- every camera vendor,
- every field instrument vendor,
- full photorealistic digital-twin generation,
- global multi-region infrastructure,
- separate Eagle Eye billing stack,
- product spin-out.

These remain compatible future directions but are not required to validate V1.

## Testing strategy

### Contract tests

Verify Eagle Eye adapters against versioned WISE² Core, CRM, Command, and notification contracts.

### Domain tests

Verify entity relationships, event normalization, alert generation, severity rules, status / freshness handling, and permissions.

### UI tests

Verify shared components, product filtering, mobile responsiveness, dark theme, loading/error/offline states, and critical operator flows.

### Integration tests

Use simulated telemetry and test field-capture payloads to verify:

`device/capture → ingest → observation → event → alert → command → action → verification`

### Security checks

Verify auth boundaries, tenant/site scoping, device credentials, media access, camera authorization, audit logs, and no secret leakage.

## Deployment design

Do not create a new duplicate infrastructure stack unless required.

Initial deployment should reuse proven WISE² infrastructure where appropriate while keeping Eagle Eye isolated at the application/data-contract level. Production deployment remains gated by:

- passing automated tests,
- environment validation,
- database migration review,
- build verification,
- health checks,
- rollback plan,
- post-deploy smoke tests.

## Rollback protection

- Work in feature branches.
- Avoid destructive schema changes in V1.
- Use forward/backward-compatible API changes where practical.
- Keep existing WISE² apps functioning while introducing the new product catalog and Eagle Eye.
- New branding / product metadata must not delete existing assets until a canonical replacement is confirmed.
- Production rollout should be reversible independently from database state where possible.

## Definition of done

The architecture phase is complete when:

- this design is approved,
- canonical product hierarchy is agreed,
- Eagle Eye has an explicit domain boundary,
- product/catalog ownership is defined,
- shared design-system responsibilities are defined,
- V1 scope and deferred scope are accepted,
- an implementation plan is produced from this spec.

The V1 implementation is complete when:

- the canonical manifest exists and is consumed by at least one WISE² UI,
- Eagle Eye is represented as a first-class product,
- Eagle Eye Command can display normalized sample/live operational data,
- all four Eagle Eye operating filters work,
- an alert can be generated from an observation and converted into an operational action,
- WISE² shared services are accessed through explicit adapters,
- tests pass,
- documentation is current,
- deployment verification succeeds,
- rollback instructions are documented.

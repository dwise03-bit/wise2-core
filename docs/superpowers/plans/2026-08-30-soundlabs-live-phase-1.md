# WISE² SoundLabs Live Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working SoundLabs Live room: authenticated sessions, artist roles, realtime presence/chat, append-only track versions, Guided Influence polls, audience suggestions, and a responsive web room that can later connect to AI generation, Discord, broadcast, and iPhone/iPad clients.

**Architecture:** Add a dedicated `services/soundlabs-live` Fastify + Socket.IO service as the authoritative Live Session Service. Persist session state in the existing PostgreSQL/Prisma database while linking each live session to an existing `SoundLabsProject`. Keep the current Studio app as the web client and reuse its established WISE² design tokens and collaboration UI patterns instead of rewriting the existing SoundLabs or Live Studio applications.

**Tech Stack:** Node.js 20+, TypeScript, Fastify 5, Socket.IO 4, Prisma 5.22/PostgreSQL, Zod, JWT bearer authentication, Vitest, Next.js 14, React 18, Zustand where client state benefits from it, existing WISE² Tailwind design system.

**Spec:** `docs/superpowers/specs/2026-08-29-soundlabs-live-collaboration-design.md`

## Global Constraints

- WISE² is the authoritative system of record; Discord, viewers, and AI never silently override artist state.
- Audience participation may influence creative direction but only authorized creators can promote a version to Current or Final.
- Do not reuse the existing `CollaboratorRole` enum for live-room authority because current SoundLabs collaboration depends on `OWNER | EDITOR | VIEWER`; introduce live-room-specific roles instead.
- Preserve existing SoundLabsProject, ProjectCollaborator, VersionHistory, UserPresence, and Live Studio behavior unless a task explicitly migrates data.
- Realtime clients must recover from disconnect by requesting an authoritative session snapshot.
- Server-side permission checks are mandatory even when the UI hides controls.
- No fake telemetry, fake users, fake votes, fake backend success, or random production data.
- `JWT_SECRET` is required by the Live Session Service; there is no insecure default secret.
- Phase 1 does not implement AI generation-provider calls, Discord delivery, OBS control, native iOS code, or full multitrack DAW editing. It defines integration contracts for those later phases.

---

## File Map

### Database
- Modify: `packages/db/prisma/schema.prisma` — add live-session-specific entities without breaking current SoundLabs collaboration tables.
- Create: `packages/db/prisma/migrations/20260830_soundlabs_live_phase1/migration.sql` — PostgreSQL migration generated from the schema change and reviewed before application.

### Live Session Service
- Create: `services/soundlabs-live/package.json` — standalone service scripts/dependencies.
- Create: `services/soundlabs-live/tsconfig.json`
- Create: `services/soundlabs-live/vitest.config.ts`
- Create: `services/soundlabs-live/src/config.ts` — validated environment.
- Create: `services/soundlabs-live/src/auth.ts` — JWT verification and authenticated principal.
- Create: `services/soundlabs-live/src/domain.ts` — public domain types and event contracts.
- Create: `services/soundlabs-live/src/permissions.ts` — role-to-action policy.
- Create: `services/soundlabs-live/src/repository.ts` — Prisma persistence boundary.
- Create: `services/soundlabs-live/src/session-service.ts` — session/version/poll/chat use cases.
- Create: `services/soundlabs-live/src/socket.ts` — Socket.IO room gateway.
- Create: `services/soundlabs-live/src/server.ts` — Fastify HTTP routes + Socket.IO server.
- Create: `services/soundlabs-live/src/__tests__/*.test.ts` — policy, session, voting, version and realtime tests.

### Studio Web Client
- Create: `apps/studio/types/soundlabs-live.ts` — browser-facing contract types matching the service.
- Create: `apps/studio/lib/soundlabs-live-api.ts` — typed HTTP client.
- Create: `apps/studio/lib/SoundLabsLiveSync.ts` — Socket.IO client with reconnect/snapshot reconciliation.
- Create: `apps/studio/lib/soundlabsLiveStore.ts` — live-room client state only.
- Create: `apps/studio/app/soundlabs-live/[sessionId]/page.tsx` — room route.
- Create: `apps/studio/components/SoundLabsLive/LiveRoomShell.tsx`
- Create: `apps/studio/components/SoundLabsLive/ParticipantStage.tsx`
- Create: `apps/studio/components/SoundLabsLive/VersionStack.tsx`
- Create: `apps/studio/components/SoundLabsLive/CrowdPanel.tsx`
- Create: `apps/studio/components/SoundLabsLive/LiveChat.tsx`
- Create: `apps/studio/components/SoundLabsLive/ConnectionBanner.tsx`
- Create: `apps/studio/components/SoundLabsLive/__tests__/*.test.tsx`
- Modify: `apps/studio/package.json` — add test script and Vitest/jsdom dependencies only if they are not already available through workspace resolution.

---

### Task 1: Live-Room Roles and Permission Policy

**Files:**
- Create: `services/soundlabs-live/package.json`
- Create: `services/soundlabs-live/tsconfig.json`
- Create: `services/soundlabs-live/vitest.config.ts`
- Create: `services/soundlabs-live/src/domain.ts`
- Create: `services/soundlabs-live/src/permissions.ts`
- Test: `services/soundlabs-live/src/__tests__/permissions.test.ts`

**Interfaces:**
- Produces: `LiveParticipantRole`, `LiveAction`, `CrowdMode`, `can(role, action): boolean`.
- Later tasks consume the policy for every HTTP and Socket.IO mutation.

- [ ] **Step 1: Create the service package and test harness**

```json
{
  "name": "@wise2/soundlabs-live",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "test": "vitest run",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "fastify": "^5.12.1",
    "jsonwebtoken": "^9.0.3",
    "socket.io": "^4.8.3",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20.17.0",
    "tsx": "^4.23.12",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Write the failing role-policy test**

```ts
import { describe, expect, it } from 'vitest';
import { can } from '../permissions.js';

describe('live room permissions', () => {
  it('lets viewers vote but never promote a version', () => {
    expect(can('VIEWER', 'vote')).toBe(true);
    expect(can('VIEWER', 'promote_version')).toBe(false);
  });

  it('lets moderators moderate without changing creative state', () => {
    expect(can('MODERATOR', 'moderate_chat')).toBe(true);
    expect(can('MODERATOR', 'promote_version')).toBe(false);
  });

  it('lets owners control the full phase-1 room', () => {
    expect(can('OWNER', 'manage_roles')).toBe(true);
    expect(can('OWNER', 'promote_version')).toBe(true);
    expect(can('OWNER', 'open_poll')).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test and verify RED**

Run: `pnpm --dir services/soundlabs-live test -- permissions.test.ts`

Expected: FAIL because `permissions.ts` does not exist.

- [ ] **Step 4: Implement the minimum domain and policy**

```ts
export type LiveParticipantRole =
  | 'OWNER'
  | 'CO_ARTIST'
  | 'PRODUCER'
  | 'GUEST'
  | 'MODERATOR'
  | 'VIEWER';

export type CrowdMode = 'WATCH_ONLY' | 'GUIDED' | 'CHAOS';

export type LiveAction =
  | 'view'
  | 'chat'
  | 'vote'
  | 'suggest'
  | 'create_version'
  | 'promote_version'
  | 'open_poll'
  | 'close_poll'
  | 'moderate_chat'
  | 'manage_roles'
  | 'change_crowd_mode';
```

Implement an explicit role/action matrix in `permissions.ts`; do not infer authority from enum order.

- [ ] **Step 5: Run tests and build**

Run: `pnpm --dir services/soundlabs-live test && pnpm --dir services/soundlabs-live build`

Expected: PASS with zero TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add services/soundlabs-live
git commit -m "feat(soundlabs-live): define live room permissions"
```

---

### Task 2: Persist Live Sessions Without Breaking Existing Collaboration

**Files:**
- Modify: `packages/db/prisma/schema.prisma`
- Create: `packages/db/prisma/migrations/20260830_soundlabs_live_phase1/migration.sql`

**Interfaces:**
- Consumes: role and CrowdMode names from Task 1.
- Produces: Prisma models `SoundLabsLiveSession`, `SoundLabsLiveParticipant`, `SoundLabsTrack`, `SoundLabsTrackVersion`, `SoundLabsAudiencePoll`, `SoundLabsPollVote`, `SoundLabsAudienceSuggestion`, `SoundLabsLiveMessage`.

- [ ] **Step 1: Add live-session relations to `User` and `SoundLabsProject`**

Add relations for owned sessions, live participants, live messages, votes, suggestions, tracks and versions where required by Prisma relation validation. `SoundLabsProject` receives `liveSessions SoundLabsLiveSession[]` rather than being repurposed into a session itself.

- [ ] **Step 2: Add session and participant schema**

```prisma
enum SoundLabsLiveStatus {
  DRAFT
  LIVE
  PAUSED
  ENDED
  ARCHIVED
}

enum SoundLabsCrowdMode {
  WATCH_ONLY
  GUIDED
  CHAOS
}

enum SoundLabsLiveRole {
  OWNER
  CO_ARTIST
  PRODUCER
  GUEST
  MODERATOR
  VIEWER
}

model SoundLabsLiveSession {
  id                    String              @id @default(cuid())
  projectId             String
  project               SoundLabsProject    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  ownerId               String
  owner                 User                @relation("soundLabsLiveOwned", fields: [ownerId], references: [id], onDelete: Cascade)
  title                 String
  description           String?             @db.Text
  status                SoundLabsLiveStatus @default(DRAFT)
  crowdMode             SoundLabsCrowdMode  @default(GUIDED)
  currentTrackVersionId String?
  finalTrackVersionId   String?
  participants          SoundLabsLiveParticipant[]
  tracks                SoundLabsTrack[]
  polls                 SoundLabsAudiencePoll[]
  suggestions           SoundLabsAudienceSuggestion[]
  messages              SoundLabsLiveMessage[]
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  @@index([projectId])
  @@index([ownerId])
  @@index([status])
}

model SoundLabsLiveParticipant {
  id         String            @id @default(cuid())
  sessionId  String
  session    SoundLabsLiveSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  userId     String
  user       User              @relation("soundLabsLiveParticipants", fields: [userId], references: [id], onDelete: Cascade)
  role       SoundLabsLiveRole @default(VIEWER)
  presence   String            @default("offline")
  joinedAt   DateTime          @default(now())
  lastSeenAt DateTime          @default(now())

  @@unique([sessionId, userId])
  @@index([sessionId])
}
```

- [ ] **Step 3: Add append-only track/version schema**

`SoundLabsTrackVersion` must never be updated to replace its content payload. Promotion changes `SoundLabsLiveSession.currentTrackVersionId` or `finalTrackVersionId` only.

Required fields: `trackId`, `parentVersionId?`, `label`, `source`, `assetUrl?`, `metadata Json`, `createdById`, `createdAt`.

- [ ] **Step 4: Add poll, vote, suggestion and chat schema**

Enforce one vote per user per poll using `@@unique([pollId, userId])`. Store vote weight at vote time so historical results do not change when subscription/role policies evolve later.

- [ ] **Step 5: Validate the schema**

Run: `pnpm --filter @wise2/db exec prisma validate --schema prisma/schema.prisma`

Expected: `The schema ... is valid`.

- [ ] **Step 6: Generate and review SQL without applying it to production**

Run from `packages/db` against a disposable/shadow database:

```bash
pnpm exec prisma migrate dev --name soundlabs_live_phase1 --create-only
```

Expected: migration contains additive CREATE TYPE/CREATE TABLE/INDEX/FOREIGN KEY statements and no DROP of existing SoundLabs collaboration tables.

- [ ] **Step 7: Generate Prisma client**

Run: `pnpm --filter @wise2/db prisma:generate`

- [ ] **Step 8: Commit**

```bash
git add packages/db/prisma
git commit -m "feat(db): add SoundLabs Live session models"
```

---

### Task 3: Authoritative Session and Version Service

**Files:**
- Create: `services/soundlabs-live/src/config.ts`
- Create: `services/soundlabs-live/src/auth.ts`
- Create: `services/soundlabs-live/src/repository.ts`
- Create: `services/soundlabs-live/src/session-service.ts`
- Test: `services/soundlabs-live/src/__tests__/session-service.test.ts`
- Test: `services/soundlabs-live/src/__tests__/versions.test.ts`

**Interfaces:**
- Produces: `createSession`, `getSnapshot`, `setParticipantRole`, `createTrackVersion`, `promoteVersion`, `setCrowdMode`.
- Snapshot return type: `LiveSessionSnapshot` with session, participants, tracks/versions, active polls, recent suggestions and recent chat.

- [ ] **Step 1: Write a failing test proving owner creation is atomic**

```ts
it('creates the session with its owner participant', async () => {
  const snapshot = await service.createSession({
    projectId: 'project-1',
    ownerId: 'user-1',
    title: 'Friday Night Cookup',
    crowdMode: 'GUIDED',
  });

  expect(snapshot.session.ownerId).toBe('user-1');
  expect(snapshot.participants).toContainEqual(
    expect.objectContaining({ userId: 'user-1', role: 'OWNER' }),
  );
});
```

Use an in-memory fake repository in unit tests; do not require PostgreSQL for service-policy tests.

- [ ] **Step 2: Run RED**

Run: `pnpm --dir services/soundlabs-live test -- session-service.test.ts`

Expected: FAIL because service implementation is missing.

- [ ] **Step 3: Implement `LiveSessionRepository` interface and Prisma adapter**

```ts
export interface LiveSessionRepository {
  createSession(input: CreateSessionInput): Promise<LiveSessionSnapshot>;
  getSnapshot(sessionId: string): Promise<LiveSessionSnapshot | null>;
  getParticipant(sessionId: string, userId: string): Promise<LiveParticipant | null>;
  setParticipantRole(sessionId: string, userId: string, role: LiveParticipantRole): Promise<void>;
  createVersion(input: CreateVersionInput): Promise<TrackVersion>;
  promoteVersion(sessionId: string, versionId: string, target: 'CURRENT' | 'FINAL'): Promise<void>;
}
```

- [ ] **Step 4: Implement server-side permission checks in the service**

`promoteVersion(actorId, ...)` first loads actor participation and throws `FORBIDDEN` unless `can(role, 'promote_version')`.

- [ ] **Step 5: Write a failing append-only regression test**

Create V1, create V2 with `parentVersionId = V1`, promote V2, then assert V1 still exists and is unchanged.

- [ ] **Step 6: Run GREEN and build**

Run: `pnpm --dir services/soundlabs-live test && pnpm --dir services/soundlabs-live build`

- [ ] **Step 7: Commit**

```bash
git add services/soundlabs-live/src
git commit -m "feat(soundlabs-live): add authoritative session service"
```

---

### Task 4: Guided Influence Polls and Audience Suggestions

**Files:**
- Modify: `services/soundlabs-live/src/repository.ts`
- Modify: `services/soundlabs-live/src/session-service.ts`
- Test: `services/soundlabs-live/src/__tests__/audience-influence.test.ts`

**Interfaces:**
- Produces: `openPoll`, `vote`, `closePoll`, `submitSuggestion`, `rankSuggestions`.

- [ ] **Step 1: Write failing Crowd Mode tests**

```ts
it('rejects voting in WATCH_ONLY mode', async () => {
  await expect(service.vote('viewer-1', pollId, optionId))
    .rejects.toMatchObject({ code: 'CROWD_MODE_DISABLED' });
});

it('accepts one vote per viewer in GUIDED mode', async () => {
  await service.vote('viewer-1', pollId, optionId);
  await expect(service.vote('viewer-1', pollId, otherOptionId))
    .rejects.toMatchObject({ code: 'ALREADY_VOTED' });
});
```

- [ ] **Step 2: Run RED**

Run: `pnpm --dir services/soundlabs-live test -- audience-influence.test.ts`

- [ ] **Step 3: Implement deterministic result aggregation**

Results must be derived from persisted votes, not client counters. Return `{ optionId, weightedVotes, rawVotes }[]` sorted by weighted votes, then raw votes, then option order for deterministic ties.

- [ ] **Step 4: Implement suggestion ranking without AI**

Phase 1 ranking is deterministic: moderation-approved suggestions sort by score descending and createdAt ascending for ties. AI summarization belongs to Phase 2.

- [ ] **Step 5: Run GREEN**

Run: `pnpm --dir services/soundlabs-live test`

- [ ] **Step 6: Commit**

```bash
git add services/soundlabs-live/src
git commit -m "feat(soundlabs-live): add audience influence engine"
```

---

### Task 5: HTTP + Socket.IO Live Session Gateway

**Files:**
- Create: `services/soundlabs-live/src/socket.ts`
- Create: `services/soundlabs-live/src/server.ts`
- Test: `services/soundlabs-live/src/__tests__/http.test.ts`
- Test: `services/soundlabs-live/src/__tests__/socket.test.ts`

**Interfaces:**
- HTTP: `POST /v1/sessions`, `GET /v1/sessions/:id/snapshot`, `PATCH /v1/sessions/:id/crowd-mode`, `POST /v1/sessions/:id/participants/:userId/role`, `POST /v1/sessions/:id/versions`, `POST /v1/sessions/:id/versions/:versionId/promote`, `POST /v1/sessions/:id/polls`, `POST /v1/polls/:pollId/votes`, `POST /v1/sessions/:id/suggestions`, `POST /v1/sessions/:id/messages`.
- Socket namespace: `/soundlabs-live`.
- Room key: `session:<sessionId>`.

- [ ] **Step 1: Require a real JWT secret at startup**

```ts
const Env = z.object({
  PORT: z.coerce.number().default(3045),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  CORS_ORIGIN: z.string().url(),
});
```

Startup must fail if `JWT_SECRET` is absent or shorter than 32 characters.

- [ ] **Step 2: Write failing unauthorized-route tests**

Assert `POST /v1/sessions` and Socket.IO connection reject missing/invalid bearer tokens.

- [ ] **Step 3: Implement JWT principal**

```ts
export interface Principal {
  id: string;
  email?: string;
}
```

Verify with `jsonwebtoken.verify(token, env.JWT_SECRET)` and require a string `id` claim.

- [ ] **Step 4: Write a failing snapshot-reconnect test**

Connect client A, mutate chat/poll state, disconnect client B, mutate again, reconnect B, request `session.snapshot`, and assert B receives current authoritative state rather than replay assumptions.

- [ ] **Step 5: Implement Socket.IO events**

Server-emitted events:

```ts
type LiveRoomEvent =
  | 'session.snapshot'
  | 'participant.joined'
  | 'participant.left'
  | 'participant.role.updated'
  | 'track.version.created'
  | 'track.version.promoted'
  | 'poll.opened'
  | 'poll.vote.updated'
  | 'poll.closed'
  | 'audience.suggestion.updated'
  | 'chat.message.created';
```

Socket mutations call the same `SessionService` methods as HTTP; do not duplicate permission logic in the gateway.

- [ ] **Step 6: Run tests and build**

Run: `pnpm --dir services/soundlabs-live test && pnpm --dir services/soundlabs-live build`

- [ ] **Step 7: Commit**

```bash
git add services/soundlabs-live/src
git commit -m "feat(soundlabs-live): expose realtime room gateway"
```

---

### Task 6: Studio Client Contracts and Reconnect Store

**Files:**
- Create: `apps/studio/types/soundlabs-live.ts`
- Create: `apps/studio/lib/soundlabs-live-api.ts`
- Create: `apps/studio/lib/SoundLabsLiveSync.ts`
- Create: `apps/studio/lib/soundlabsLiveStore.ts`
- Modify: `apps/studio/package.json`
- Test: `apps/studio/lib/__tests__/soundlabsLiveStore.test.ts`

**Interfaces:**
- Produces: `SoundLabsLiveApi`, `SoundLabsLiveSync`, `useSoundLabsLiveStore`.
- Consumers never directly edit authoritative arrays after mutation; they apply server events/snapshots.

- [ ] **Step 1: Add a Studio test script**

Add `"test": "vitest run"` and dev dependencies `vitest`, `jsdom`, and `@testing-library/jest-dom` if workspace resolution does not already provide them.

- [ ] **Step 2: Write failing snapshot-replacement test**

```ts
it('replaces stale room state with an authoritative reconnect snapshot', () => {
  const store = createSoundLabsLiveStore();
  store.getState().applySnapshot(snapshotA);
  store.getState().applySnapshot(snapshotB);
  expect(store.getState().session?.updatedAt).toBe(snapshotB.session.updatedAt);
  expect(store.getState().messages).toEqual(snapshotB.messages);
});
```

- [ ] **Step 3: Implement exact browser-facing contract types**

Use discriminated string unions identical to service JSON values. Dates cross the network as ISO strings.

- [ ] **Step 4: Implement typed HTTP client**

`SoundLabsLiveApi` accepts `{ baseUrl, getAccessToken }`. It refuses a mutation when no bearer token is available rather than sending a demo identity.

- [ ] **Step 5: Implement Socket.IO sync**

On `connect`, emit `session.join` with the session ID. On `reconnect`, request `session.snapshot`. Use exponential Socket.IO reconnection settings with jitter and surface `connected | reconnecting | offline | unauthorized` to the store.

- [ ] **Step 6: Run Studio tests/type check**

Run: `pnpm --dir apps/studio test && pnpm --dir apps/studio type-check`

- [ ] **Step 7: Commit**

```bash
git add apps/studio/package.json apps/studio/types apps/studio/lib
git commit -m "feat(studio): add SoundLabs Live client state"
```

---

### Task 7: Build the WISE² SoundLabs Live Web Room

**Files:**
- Create: `apps/studio/app/soundlabs-live/[sessionId]/page.tsx`
- Create: `apps/studio/components/SoundLabsLive/LiveRoomShell.tsx`
- Create: `apps/studio/components/SoundLabsLive/ParticipantStage.tsx`
- Create: `apps/studio/components/SoundLabsLive/VersionStack.tsx`
- Create: `apps/studio/components/SoundLabsLive/CrowdPanel.tsx`
- Create: `apps/studio/components/SoundLabsLive/LiveChat.tsx`
- Create: `apps/studio/components/SoundLabsLive/ConnectionBanner.tsx`
- Test: `apps/studio/components/SoundLabsLive/__tests__/LiveRoomShell.test.tsx`

**Interfaces:**
- Consumes: the store/API/sync layer from Task 6.
- Produces: responsive Phase-1 room route for desktop/tablet/mobile web.

- [ ] **Step 1: Write failing role-visibility UI test**

Render the room as a VIEWER and assert Vote/Chat are available but Promote Version and Manage Roles are absent. Render as OWNER and assert creator controls are present.

- [ ] **Step 2: Run RED**

Run: `pnpm --dir apps/studio test -- LiveRoomShell.test.tsx`

- [ ] **Step 3: Build the room hierarchy**

Desktop layout:

```text
┌ Collaborators / LIVE / Crowd Mode / Connection ┐
├──────────────┬─────────────────────┬────────────┤
│ Version Stack│ Current Track Stage │ Crowd      │
│              │ waveform/artwork    │ Poll       │
│              │ version + activity  │ Suggestions│
├──────────────┴─────────────────────┼────────────┤
│ Session activity / upcoming Phase 2 Create     │ Chat       │
└─────────────────────────────────────────────────┘
```

Mobile collapses into Current Track followed by tabs `Versions | Crowd | Chat | People`; do not shrink the three-column desktop grid.

- [ ] **Step 4: Preserve the WISE² design system**

Use existing `studio-bg`, `studio-panel`, `studio-raised`, `studio-line`, `wise-chrome`, and WISE² accent tokens. Audience energy may use motion/pulses, but reduced-motion mode must disable nonessential animation.

- [ ] **Step 5: Implement Version Stack actions**

Show lineage (`V1 → V2 → V3`), source, creator and timestamps. Only users allowed by server policy receive Current/Final promotion controls. After a promotion request, keep the old UI state until the authoritative `track.version.promoted` event or refreshed snapshot arrives.

- [ ] **Step 6: Implement Crowd Panel**

WATCH_ONLY: results/read-only state, no creative vote controls. GUIDED: poll and suggestions. CHAOS: visually stronger audience-energy presentation but the same server-enforced creator approval boundary.

- [ ] **Step 7: Implement chat and connection states**

Every chat message shows origin `WISE²` in Phase 1 so Phase 4 can later add `DISCORD`. ConnectionBanner explicitly shows Reconnecting/Stale/Offline and never claims LIVE collaboration when Socket.IO is disconnected.

- [ ] **Step 8: Run tests, type-check and build**

Run:

```bash
pnpm --dir apps/studio test
pnpm --dir apps/studio type-check
pnpm --dir apps/studio build
```

Expected: all exit 0.

- [ ] **Step 9: Commit**

```bash
git add apps/studio/app/soundlabs-live apps/studio/components/SoundLabsLive
git commit -m "feat(studio): add SoundLabs Live collaboration room"
```

---

### Task 8: Integration Verification, Health Endpoint and CI

**Files:**
- Modify: `services/soundlabs-live/src/server.ts`
- Create: `services/soundlabs-live/src/__tests__/journey.test.ts`
- Create: `.github/workflows/soundlabs-live-ci.yml`
- Create: `docs/soundlabs-live/PHASE1_RUNBOOK.md`

**Interfaces:**
- Produces: `GET /health`, reproducible CI, deployment environment contract and full Phase-1 journey verification.

- [ ] **Step 1: Add health response**

`GET /health` returns HTTP 200 only when the process is healthy and DB connectivity probe succeeds:

```json
{
  "service": "soundlabs-live",
  "status": "healthy",
  "database": "connected"
}
```

Do not include secrets or database URLs.

- [ ] **Step 2: Write the complete journey test**

Test this exact flow using two creator principals and one viewer:

```text
Owner creates session
→ Co-Artist joins
→ Owner creates Track V1
→ Owner opens Guided poll
→ Viewer votes
→ Owner closes poll
→ Co-Artist creates V2 referencing V1
→ Viewer fails to promote V2 (403/FORBIDDEN)
→ Owner promotes V2 to Current
→ viewer reconnects
→ viewer snapshot reports V2 as Current and preserved V1
```

- [ ] **Step 3: Run the full service verification**

Run:

```bash
pnpm --dir services/soundlabs-live test
pnpm --dir services/soundlabs-live build
```

- [ ] **Step 4: Run database and Studio verification**

Run:

```bash
pnpm --filter @wise2/db exec prisma validate --schema prisma/schema.prisma
pnpm --filter @wise2/db prisma:generate
pnpm --dir apps/studio test
pnpm --dir apps/studio type-check
pnpm --dir apps/studio build
```

- [ ] **Step 5: Add CI**

Workflow runs on changes to `services/soundlabs-live/**`, SoundLabs Live Studio files, Prisma schema/migration, and this workflow. CI installs pnpm 8.15.9 + Node 20, generates Prisma, runs service tests/build, Studio tests/type-check/build, and Prisma validate.

- [ ] **Step 6: Document the deployment contract**

`PHASE1_RUNBOOK.md` must list:
- `DATABASE_URL`
- `JWT_SECRET` (32+ characters)
- `CORS_ORIGIN`
- `PORT` default 3045
- `NEXT_PUBLIC_SOUNDLABS_LIVE_URL` for Studio
- health check command
- rollback procedure that does not drop additive Phase-1 tables

Do not place any actual credentials in the document.

- [ ] **Step 7: Final verification**

Run the complete commands from Steps 3–4 again after the runbook/CI changes and capture their exit status in the PR description.

- [ ] **Step 8: Commit**

```bash
git add services/soundlabs-live .github/workflows/soundlabs-live-ci.yml docs/soundlabs-live apps/studio packages/db/prisma
git commit -m "test(soundlabs-live): verify phase 1 collaboration flow"
```

---

## Phase 1 Completion Gate

Phase 1 is complete only when fresh verification proves all of the following:

- [ ] Existing Prisma schema validates and additive migration does not drop current SoundLabs collaboration data.
- [ ] Live sessions are persisted and linked to an existing `SoundLabsProject`.
- [ ] Owner is created atomically with every session.
- [ ] Owner, Co-Artist, Producer, Guest, Moderator and Viewer permissions are server-enforced.
- [ ] Viewer cannot promote versions, change roles, or change Crowd Mode by forging API/Socket events.
- [ ] Version history is append-only and Current/Final are pointers, not destructive rewrites.
- [ ] WATCH_ONLY blocks creative influence.
- [ ] GUIDED allows one persisted vote per user per poll.
- [ ] Audience suggestions are persisted and deterministically ranked.
- [ ] Realtime presence/chat/version/poll updates reach other clients.
- [ ] Reconnecting clients replace stale state using an authoritative snapshot.
- [ ] Web room adapts to mobile without shrinking desktop columns.
- [ ] Studio and service TypeScript builds pass.
- [ ] No Phase-1 UI or service fabricates AI output, Discord activity, stream state or audio telemetry.

## Deferred to Later Plans

- Phase 2: AI generation jobs, Suno/provider adapters, Generate/Extend/Remix, artist approval queue.
- Phase 3: Studio Broadcast Bridge, authoritative OBS stream controls, playback routing, real meters, scenes and recording.
- Phase 4: Discord Join Live, chat bridge, polls, announcements, clips and recap.
- Phase 5: Native iPhone/iPad SoundLabs Live surfaces and integration into the WISE² Live Controller.

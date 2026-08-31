# SoundLabs Live Phase 1 — Working Vertical Slice

**Date**: 2026-08-30  
**Scope**: Live Rooms MVP with 6 artist/viewer roles, JWT auth, presence, live chat, Crowd Mode, polls, audience suggestions, real-time sync, reconnect recovery  
**Execution**: Inline, task-by-task with tests and checkpoints  
**Architecture**: Django REST + WebSocket + React/TS with Version Stack

---

## Critical Architecture Decision

**JWT Auth is mandatory from Day 1** — The new Live Session service explicitly requires real JWT authentication and refuses browser-generated (localStorage) identities. This is non-negotiable and prevents technical debt that plagued the Studio auth layer.

---

## Phase 1 Deliverables

| Component | Status | Tasks |
|-----------|--------|-------|
| **JWT Auth Integration** | 🔴 Todo | 1.1 → 1.3 |
| **Live Room API** | 🔴 Todo | 2.1 → 2.5 |
| **Presence + Sync Layer** | 🔴 Todo | 3.1 → 3.4 |
| **Live Chat** | 🔴 Todo | 4.1 → 4.2 |
| **Crowd Mode & Polls** | 🔴 Todo | 5.1 → 5.3 |
| **Audience Suggestions** | 🔴 Todo | 6.1 → 6.2 |
| **Responsive Web Room** | 🔴 Todo | 7.1 → 7.3 |
| **Tests & CI** | 🔴 Todo | 8.1 → 8.3 |

---

## Task Breakdown

### **TASK 1: JWT Auth Integration** (Foundation)

#### 1.1 — Create Live Session Service (Django)
- **File**: `packages/api/src/services/live-session.service.ts`
- **Responsibility**: Manage JWT token validation, issue short-lived tokens for live sessions
- **Requirements**:
  - Accept JWT from request headers
  - Validate token signature + expiry
  - Refuse localStorage/demo identities (enforce real auth)
  - Return session context (user ID, roles, permissions)
- **Test**: Unit test for token validation (valid, expired, invalid signature, missing token)
- **Checkpoint**: Service runs, passes auth tests

#### 1.2 — Live Session Middleware (Django)
- **File**: `packages/api/src/middleware/live-session.ts`
- **Responsibility**: Attach live session context to all `/live/*` requests
- **Requirements**:
  - Extract JWT from `Authorization: Bearer <token>` header
  - Call LiveSessionService.validate()
  - Attach session to request object
  - Return 401 if auth fails
- **Test**: Integration test with valid/invalid tokens on `/live/*` routes
- **Checkpoint**: Middleware intercepts, validates, attaches context

#### 1.3 — Auth Tests
- **Files**: `packages/api/src/tests/auth.live.test.ts`
- **Coverage**:
  - Valid JWT → session accepted
  - Expired JWT → 401
  - Invalid signature → 401
  - Missing auth header → 401
  - localStorage token attempt → 401 (explicit rejection)
- **Checkpoint**: All auth tests pass

---

### **TASK 2: Live Room API** (Core Data Model)

#### 2.1 — Database Schema (Prisma)
- **File**: `packages/db/prisma/migrations/<date>_live_rooms.sql`
- **Tables**:
  ```sql
  LiveRoom:
    - id (UUID, PK)
    - name (string)
    - slug (string, unique)
    - creatorId (FK User)
    - status (enum: draft, live, ended)
    - startedAt (timestamp)
    - endedAt (timestamp nullable)
    - maxConcurrentViewers (int, default 10000)
    - createdAt (timestamp)
    - updatedAt (timestamp)

  LiveRoomMember:
    - id (UUID, PK)
    - roomId (FK LiveRoom)
    - userId (FK User)
    - role (enum: creator, cohost, guest, viewer)
    - permission (bitmap: can_speak, can_chat, can_suggest, can_moderate)
    - joinedAt (timestamp)
    - leftAt (timestamp nullable)

  LiveChatMessage:
    - id (UUID, PK)
    - roomId (FK LiveRoom)
    - userId (FK User)
    - message (text)
    - createdAt (timestamp)

  Audience Suggestion:
    - id (UUID, PK)
    - roomId (FK LiveRoom)
    - userId (FK User)
    - suggestion (text)
    - votes (int, default 0)
    - createdAt (timestamp)
  ```
- **Test**: Migration applies cleanly, tables created
- **Checkpoint**: Schema migrated, tables queryable

#### 2.2 — REST Endpoints
- **Endpoint 1**: `POST /api/v1/live/rooms` (Create room)
  - Auth: JWT required
  - Body: `{ name, slug }`
  - Response: `{ id, name, slug, creatorId, status, createdAt }`
  - DB: Insert LiveRoom, insert LiveRoomMember (creator role)
  
- **Endpoint 2**: `GET /api/v1/live/rooms/:id` (Get room)
  - Auth: JWT required
  - Response: Full room + member list
  
- **Endpoint 3**: `POST /api/v1/live/rooms/:id/join` (Join room)
  - Auth: JWT required
  - Body: `{ roleRequest: "viewer" | "guest" }` (system decides final role)
  - Response: `{ roomId, userId, role, permissions }`
  - DB: Insert LiveRoomMember
  
- **Endpoint 4**: `POST /api/v1/live/rooms/:id/leave` (Leave room)
  - Auth: JWT required
  - DB: Update LiveRoomMember.leftAt
  
- **Endpoint 5**: `POST /api/v1/live/rooms/:id/start` (Go live)
  - Auth: JWT required, creator only
  - DB: Update LiveRoom.status = "live", startedAt
  - Broadcast: WebSocket "room.started" to all members
  
- **Endpoint 6**: `POST /api/v1/live/rooms/:id/end` (End stream)
  - Auth: JWT required, creator only
  - DB: Update LiveRoom.status = "ended", endedAt
  - Broadcast: WebSocket "room.ended" to all members

- **Test**: Each endpoint tested with valid auth + data
- **Checkpoint**: All 6 endpoints callable, return correct responses

#### 2.3 — Role & Permission System
- **File**: `packages/api/src/permissions/live-roles.ts`
- **Roles**:
  - **Creator**: Full control (start, end, invite, moderate, speak, chat)
  - **Cohost**: Moderate, speak, chat (no start/end)
  - **Guest**: Speak, chat, suggest
  - **Viewer**: Chat, suggest (no speak)
- **Permissions bitmap**:
  - `CAN_SPEAK` (0x01)
  - `CAN_CHAT` (0x02)
  - `CAN_SUGGEST` (0x04)
  - `CAN_MODERATE` (0x08)
  - `CAN_INVITE` (0x10)
- **Test**: Unit test for role → permission mapping
- **Checkpoint**: Permission checks work, roles correctly mapped

#### 2.4 — Version Stack (Conflict Resolution)
- **File**: `packages/api/src/version-stack/version-stack.service.ts`
- **Purpose**: Track versions of mutable state (presence, chat, suggestions) for client sync
- **Structure**:
  ```typescript
  interface VersionedState {
    version: number;
    timestamp: number;
    data: any;
  }
  ```
- **Operations**:
  - `get(key)` → return versioned state + version number
  - `set(key, value, clientVersion)` → check version, update if client is current, return conflict if stale
  - `increment()` → bump server version
- **Test**: Concurrent updates, version conflicts, resolution
- **Checkpoint**: Version tracking works, conflicts detected

#### 2.5 — API Tests
- **File**: `packages/api/src/tests/live-rooms.test.ts`
- **Coverage**:
  - Create room (creator becomes member)
  - Join room (member added, permissions set)
  - Start live (status changes, broadcast)
  - End live (cleanup, broadcast)
  - Role enforcement (non-creator can't start)
  - Version conflicts
- **Checkpoint**: All API tests pass

---

### **TASK 3: Presence + Sync Layer** (Real-Time Foundation)

#### 3.1 — WebSocket Server (Socket.io)
- **File**: `packages/api/src/websocket/socket-server.ts`
- **Setup**:
  - Start Socket.io on `/api/live/socket.io`
  - Auth: Extract JWT from handshake headers, validate via LiveSessionService
  - Reject connection if auth fails
  - Join user to room namespace: `/live/:roomId`
- **Test**: Socket connects with valid JWT, rejected with invalid
- **Checkpoint**: WebSocket server running, auth validated on connect

#### 3.2 — Presence Events
- **File**: `packages/api/src/websocket/presence.events.ts`
- **Events**:
  - `"presence.join"` (user → server): `{ userId, role, name }`
    - Server: Add to presence set, broadcast "presence.joined" to room
  - `"presence.leave"` (user → server): `{ userId }`
    - Server: Remove from presence set, broadcast "presence.left" to room
  - `"presence.update"` (user → server): `{ userId, isSpeaking, isMuted }`
    - Server: Update state, broadcast "presence.updated" to room
- **Database**: Store presence snapshots in Redis (expiring after 5 min idle)
- **Test**: User joins, updates state, leaves; all room members receive events
- **Checkpoint**: Presence events flow end-to-end

#### 3.3 — Reconnect Recovery
- **File**: `packages/api/src/websocket/reconnect.service.ts`
- **Purpose**: Recover state if client reconnects within 30 seconds
- **Mechanism**:
  - On disconnect: Mark socket as "potentially-returning" in Redis for 30 sec
  - On reconnect: Check Redis for pending session
  - If found: Resend full state (presence, chat, suggestions) to client
  - If not found: Treat as new join
- **State to resend**:
  - Full member list
  - Chat history (last 50 messages)
  - Presence snapshot
  - Suggestions + votes
- **Test**: Disconnect, reconnect within 30s → state recovered; after 30s → fresh state
- **Checkpoint**: Reconnect recovery works, state restored

#### 3.4 — Sync Tests
- **File**: `packages/api/src/tests/presence.test.ts`
- **Coverage**:
  - Multiple users join, presence received by all
  - State updates propagate
  - Disconnect + reconnect within 30s → state recovered
  - Disconnect + reconnect after 30s → new session
- **Checkpoint**: All presence/sync tests pass

---

### **TASK 4: Live Chat** (Messaging)

#### 4.1 — Chat API & WebSocket
- **Endpoint**: `POST /api/v1/live/rooms/:id/chat` (Send message)
  - Auth: JWT required
  - Body: `{ message }`
  - Validation: Message length 1-500 chars, user has `CAN_CHAT` permission
  - DB: Insert LiveChatMessage
  - WebSocket: Broadcast "chat.message" to room with full message object

- **WebSocket Event**: `"chat.message"` (server → all)
  - Payload: `{ id, userId, userName, message, createdAt }`
  - Received by: All room members with `CAN_CHAT` permission (includes viewers)

- **Query**: `GET /api/v1/live/rooms/:id/chat?limit=50&before=<timestamp>`
  - Returns last 50 messages before timestamp (for history on join)

- **Test**: Send message → stored in DB → broadcast to room → history query works
- **Checkpoint**: Chat messages flow end-to-end

#### 4.2 — Chat Moderation
- **Endpoint**: `DELETE /api/v1/live/rooms/:id/chat/:msgId` (Delete message)
  - Auth: JWT required, user is creator/cohost or owns message
  - DB: Delete LiveChatMessage
  - WebSocket: Broadcast "chat.deleted" to room

- **Test**: Cohost deletes message → removed from DB → broadcast to room
- **Checkpoint**: Moderation works

---

### **TASK 5: Crowd Mode & Polls** (Audience Engagement)

#### 5.1 — Crowd Mode (Silent Viewers Can React)
- **WebSocket Event**: `"crowd.react"` (user → server)
  - Payload: `{ emoji: "👍" | "❤️" | "🔥" | "👏" }`
  - Server: Aggregate reactions, broadcast "crowd.reactions" to room every 500ms
  - Broadcast payload: `{ emoji, count }[]`
  
- **Visualize**: Web client shows floating emoji reactions rising from bottom

- **Test**: Multiple viewers send reactions → aggregated + broadcast
- **Checkpoint**: Crowd Mode rendering in progress (UI in Task 7)

#### 5.2 — Polls API
- **Endpoint**: `POST /api/v1/live/rooms/:id/polls` (Create poll)
  - Auth: JWT required, creator/cohost only
  - Body: `{ question, options: string[], durationSeconds: 30 }`
  - DB: Insert Poll + PollOptions
  - WebSocket: Broadcast "poll.created" to room

- **Endpoint**: `POST /api/v1/live/rooms/:id/polls/:pollId/vote` (Vote)
  - Auth: JWT required
  - Body: `{ optionId }`
  - DB: Insert PollVote (one vote per user per poll)
  - WebSocket: Broadcast "poll.updated" with live counts

- **Endpoint**: `GET /api/v1/live/rooms/:id/polls` (Get active polls)
  - Returns all polls in last 5 minutes + vote counts

- **Test**: Create poll → broadcast → users vote → counts update
- **Checkpoint**: Polls created, votes counted, results broadcast

#### 5.3 — Poll Auto-Close
- **Background Job**: Every 60 seconds, close expired polls
  - Set poll.status = "closed"
  - Broadcast "poll.closed" to room with final results
- **Test**: Poll expires, auto-closes, broadcast sent
- **Checkpoint**: Polls auto-close on schedule

---

### **TASK 6: Audience Suggestions** (Interactive Feedback)

#### 6.1 — Suggestions API
- **Endpoint**: `POST /api/v1/live/rooms/:id/suggestions` (Submit suggestion)
  - Auth: JWT required
  - Body: `{ suggestion }`
  - Validation: 1-200 chars, user has `CAN_SUGGEST` permission
  - DB: Insert AudienceSuggestion
  - WebSocket: Broadcast "suggestion.created" to room

- **Endpoint**: `POST /api/v1/live/rooms/:id/suggestions/:sugId/vote` (Vote up suggestion)
  - Auth: JWT required
  - DB: Increment AudienceSuggestion.votes
  - WebSocket: Broadcast "suggestion.updated" with new vote count

- **Endpoint**: `GET /api/v1/live/rooms/:id/suggestions?orderBy=newest|votes` (Get suggestions)
  - Returns suggestions ordered by date or votes (descending)

- **Test**: Submit suggestion → broadcast → vote → counts update
- **Checkpoint**: Suggestions working end-to-end

#### 6.2 — Suggestions Moderation
- **Endpoint**: `DELETE /api/v1/live/rooms/:id/suggestions/:sugId` (Delete suggestion)
  - Auth: JWT required, creator/cohost or owns suggestion
  - DB: Delete AudienceSuggestion
  - WebSocket: Broadcast "suggestion.deleted" to room

- **Test**: Cohost deletes spam suggestion → removed
- **Checkpoint**: Moderation enforced

---

### **TASK 7: Responsive Web Room** (UI)

#### 7.1 — Live Room Page Layout
- **File**: `apps/website/app/live/[roomId]/page.tsx`
- **Structure**:
  ```
  ┌─────────────────────────────────────┐
  │  Header (Room name, members count)  │
  ├──────────────────┬──────────────────┤
  │                  │  Member List     │
  │  Stream View     │  (sidebar)       │
  │  (placeholder)   ├──────────────────┤
  │                  │  Live Chat       │
  │                  │  (messages feed) │
  │                  ├──────────────────┤
  │                  │  Input box       │
  └──────────────────┴──────────────────┘
  ```
- **Components**:
  - `<StreamView />` — Placeholder video/audio area
  - `<MemberList />` — Show active members with roles
  - `<LiveChat />` — Message list + input
  - `<Header />` — Room name, join/leave buttons
- **Responsive**: Desktop (2-column) → Tablet (stacked) → Mobile (single column)
- **Test**: Page loads, layout responsive
- **Checkpoint**: Layout renders, no errors

#### 7.2 — WebSocket Integration (React)
- **File**: `apps/website/app/live/[roomId]/hooks/useLiveRoom.ts`
- **Hook**:
  ```typescript
  const useLiveRoom = (roomId: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    
    useEffect(() => {
      // Connect to WebSocket
      const s = io(`/api/live/socket.io`, {
        auth: { token: getJWT() },
      });
      
      // Listen for events
      s.on("presence.joined", (user) => setMembers([...members, user]));
      s.on("chat.message", (msg) => setMessages([...messages, msg]));
      s.on("suggestion.created", (sug) => setSuggestions([...suggestions, sug]));
      
      setSocket(s);
      return () => s.disconnect();
    }, [roomId]);
    
    return { socket, members, messages, suggestions };
  };
  ```
- **Test**: Hook connects, receives events, updates state
- **Checkpoint**: Hook working, state updates on events

#### 7.3 — Real-Time Features UI
- **Live Chat Component**:
  - Display messages with user name + timestamp
  - Input box (disabled if no `CAN_CHAT` permission)
  - Auto-scroll to newest message
  
- **Crowd Mode Reactions**:
  - Display floating emoji reactions rising from bottom
  - Update every 500ms with new counts
  
- **Polls Component**:
  - Display active poll + options
  - Show live vote counts
  - Disable voting if poll closed
  
- **Suggestions Component**:
  - Display suggestions sorted by votes
  - Vote button (if `CAN_SUGGEST` permission)
  - Delete button (if creator/cohost)

- **Test**: Render all components, check permissions
- **Checkpoint**: All UI components render correctly

---

### **TASK 8: Tests & CI** (Quality Gates)

#### 8.1 — Unit Tests
- **File**: `packages/api/src/tests/live.unit.test.ts`
- **Coverage**:
  - Version Stack (conflict resolution)
  - Role → Permission mapping
  - Message validation
  - Poll auto-close logic
- **Run**: `npm test -- live.unit.test.ts`
- **Checkpoint**: ≥95% coverage on core logic

#### 8.2 — Integration Tests
- **File**: `packages/api/src/tests/live.integration.test.ts`
- **Coverage**:
  - Full flow: Create room → join → chat → polls → suggestions
  - Multi-user scenarios (3-5 concurrent users)
  - Reconnect recovery
  - Permission enforcement
- **Run**: `npm test -- live.integration.test.ts`
- **Checkpoint**: All integration tests pass

#### 8.3 — CI Pipeline
- **File**: `.github/workflows/live-phase-1.yml`
- **Triggers**: On PR to main with changes in `packages/api/src/live/**` or `apps/website/app/live/**`
- **Steps**:
  1. Lint (eslint)
  2. Type check (tsc)
  3. Unit tests (`npm test -- live.unit.test.ts`)
  4. Integration tests (`npm test -- live.integration.test.ts`)
  5. Build API (`npm run build`)
  6. Build website (`npm run build`)
- **Artifacts**: Test reports, coverage
- **Checkpoint**: All CI checks pass

---

## Execution Checkpoints

| Checkpoint | Gate | Owner |
|------------|------|-------|
| Auth tests pass | All 5 auth tests ✅ | Task 1.3 |
| API working | All 6 endpoints callable | Task 2.5 |
| Presence events flowing | Multiple users → all receive updates | Task 3.4 |
| Chat end-to-end | Messages sent, stored, broadcast | Task 4.1 |
| Polls working | Create, vote, auto-close | Task 5.3 |
| Suggestions working | Submit, vote, delete | Task 6.2 |
| Web UI renders | All components, responsive | Task 7.3 |
| Tests ≥95% coverage | Unit + integration pass | Task 8.2 |
| CI green | All checks pass on PR | Task 8.3 |

---

## Architecture Decisions

1. **JWT Auth First** — No localStorage, no demo identities. Real auth from day one.
2. **Version Stack for Sync** — Tracks state versions to detect/resolve conflicts.
3. **Redis for Presence** — Fast, expiring presence snapshots for reconnect recovery.
4. **Socket.io for WebSocket** — Battle-tested, auto-reconnect, fallbacks.
5. **Role-based Permissions** — Bitmap system, flexible, easy to audit.
6. **Separate Tables for Chat/Suggestions** — Queryable history, moderation-ready.

---

## Known Risks

- **WebSocket Scale**: Socket.io doesn't cluster by default; Redis adapter needed for multi-server
- **Auth Token Expiry**: Need to handle token refresh during long streams (>1 hour)
- **Presence Stale Data**: Redis expiration might leave stale members if client doesn't disconnect cleanly
- **Message History**: No pagination yet; could be slow with 10k+ messages

---

## Next Steps After Phase 1

- **Phase 2**: Audio/video streaming (media engine)
- **Phase 3**: Recording + replay
- **Phase 4**: Advanced analytics (viewer drop-off, engagement)
- **Phase 5**: Multi-room broadcasts, guest co-hosts

---

**Status**: Ready for inline execution  
**Next**: Start with Task 1.1 (JWT Auth Integration)

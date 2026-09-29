# PromptOS Module: Memory
## Context Management & Session Continuity

This module defines how agents manage memory, maintain context across sessions, and organize knowledge.

---

## Memory Architecture

### Session Memory (This Conversation)
- Visible in chat history
- Direct access to all context
- Cleared at session end
- Used for immediate decision-making

### Persistent Memory (Knowledge Base)
- Stored in `data/` directory
- Survives across sessions
- Accessed at session start
- Updated as work progresses

### Agent Memory (Specialized Context)
- Agent-specific state and capabilities
- Tool registry and access control
- Previous agent interactions
- Performance metrics and history

---

## At Session Start

Every agent should check context:

```
1. Read CLAUDE.md (project instructions)
2. Read data/daily-logs/<today>.md (today's work)
3. Read data/decisions/ (recent decisions)
4. Read data/inbox/ (new tasks)
5. Check git status (uncommitted changes)
6. Load relevant agent context (memory, tools, permissions)
```

Example:

```typescript
// Load session context
const context = await loadSessionContext({
  date: new Date(),
  agentName: 'developer',
  workspace: '/Users/danielwise/Projects/wise2-core'
});

console.log('Daily log:', context.dailyLog);
console.log('Recent decisions:', context.decisions);
console.log('Inbox:', context.inbox);
```

---

## Daily Log Format

File: `data/daily-logs/2026-07-21.md`

```markdown
# 2026-07-21 - Daily Log

## Morning Briefing
- [09:00] Started session for PromptOS development
- [09:15] Built Core System modules

## Sessions
- 09:00-12:30: @dev - PromptOS framework architecture
  - Status: 60% complete
  - Blocker: None
  - Next: TypeScript implementation

## Decisions Made
- ✅ Decided to use file-based prompt registry (immutable)
- ✅ Locked agent composition inheritance model
- ✅ Chose YAML for prompt metadata (not JSON)

## Blockers
- Waiting on: Type definitions from shared packages

## Completed Today
- [x] Module system architecture
- [x] Reasoning module written
- [x] Tool-use module written
- [ ] All 16 agent prompts
- [ ] Agent framework TypeScript

## Next Actions
- [ ] Create specialized agent prompts (16 total)
- [ ] Build agent-framework TypeScript package
- [ ] Test prompt composition
- [ ] Document hot-reload system
```

---

## Decision Log Format

File: `data/decisions/2026-07-21-promptos-architecture.md`

```markdown
# Decision: PromptOS File-Based Registry

**Date**: 2026-07-21  
**Decider**: @dev (Developer Agent)  
**Context**: Designing how to load and cache agent prompts

## Problem
How should PromptOS manage prompt versions, inheritance, and caching?

## Options Considered

### Option A: Database-backed registry
- Pros: Version control, quick lookups, audit trail
- Cons: Operational overhead, slower cold start
- Effort: 3 days
- Risk: Database dependency adds complexity

### Option B: File-based with git versioning
- Pros: Simple, auditable via git, works offline
- Cons: No runtime versioning, slower large searches
- Effort: 1 day
- Risk: Git history can get large

### Option C: Hybrid (files + Redis cache)
- Pros: Best of both, fast retrieval
- Cons: Added infrastructure
- Effort: 2 days
- Risk: Cache invalidation complexity

## Decision
**Chose Option B: File-based with git versioning**

## Rationale
- Team already uses git for everything
- WISE² prioritizes simplicity over perfection
- Works offline for edge devices
- Audit trail built into git history
- Minimal operational overhead

## Consequences
- Prompt changes are tracked as code changes
- No runtime versioning (prompt = HEAD of file)
- Large prompt libraries may slow down git clone
- All prompt changes require git commit

## Reversibility
High. If we need a database later, we can build a migration tool.

## Verification
- Prompts load correctly at agent startup
- Git history shows all prompt changes
- Performance acceptable for typical use (< 100 prompts)
```

---

## Knowledge Graph Queries

Agents can query the knowledge graph for relationships:

```typescript
// Find related projects
kg.query({
  entity: 'project:wise2-live-stream',
  relations: ['depends_on', 'related_to', 'blocked_by']
});

// Get team assignments
kg.query({
  entity: 'team:engineering',
  relations: ['assigned_to']
});

// Find similar past decisions
kg.query({
  entity: 'decision:promptos-architecture',
  relations: ['similar_to'],
  limit: 5
});
```

---

## Agent Memory Isolation

Each agent has its own memory space:

```
data/agent-memory/
├── developer/
│   ├── working-on.md          # Current task
│   ├── local-context.json     # In-progress state
│   └── tool-history.log       # Recent tool calls
├── infrastructure/
│   ├── server-state.json      # Last known state
│   └── deployment-queue.md
├── executive/
│   ├── business-context.md    # Recent decisions
│   └── team-status.md         # Team assignments
```

Agent memory is:
- **Isolated** — Can't access other agent memory
- **Ephemeral** — Cleared when agent idle >1 hour
- **Audited** — All reads/writes logged
- **Scoped** — Limited to agent's permissions

---

## Context Passing Between Agents

When one agent calls another:

```typescript
// Developer agent → QA agent (hand off testing)
await agent.call('qa', {
  type: 'test-suite-execution',
  changes: gitDiff,
  testPlan: 'regression + new features',
  
  // Explicit context passing
  context: {
    branch: 'feature/promptos',
    buildId: '2026-07-21-build-123',
    parentAgent: 'developer',
    relatedDecisions: ['2026-07-21-promptos-architecture'],
    deadline: '2026-07-22T10:00:00Z'
  }
});
```

Context passed includes:
- **What work** — What the parent agent is doing
- **Why** — Reason for the handoff
- **Constraints** — Deadlines, priorities
- **History** — Related decisions and context
- **Permissions** — What the receiving agent can access

---

## Session Reflection

At end of each session, append to daily log:

```markdown
## Reflection - Session N

**Duration**: 3h 45m  
**Focus**: PromptOS core system  

### What Worked
- Having CLAUDE.md at session start saved 30 mins of context loading
- Modular prompt design is solid
- TypeScript types caught integration issues early

### What Didn't Work
- Took longer than expected to finalize agent specifications
- Nested inheritance complicated some prompts

### Decisions Logged
- ✅ File-based prompt registry
- ✅ Module composition over inheritance chains
- ✅ Agent memory isolation pattern

### Blockers Encountered
- None, flow was clean

### For Next Session
- Continue with 16 specialized agent prompts
- Build agent-framework TypeScript package
- Test prompt hot-reload with real agents
- Consider caching strategy for large prompt libraries

**Session Status**: [60% complete] Moving to TypeScript implementation phase
```

---

## Memory Decay

Old memory is automatically archived to keep current memory lean:

| Memory Type | Retention | Archive Trigger |
|-------------|-----------|-----------------|
| Session history | Current session | Session end |
| Daily log | 30 days | Auto-archive |
| Decisions | Forever | Searchable, never auto-deleted |
| Agent memory | 1 hour idle | Auto-cleared |
| Chat history | 3 months | Auto-archived |
| Logs | 90 days | Auto-compressed |

---

## Querying History

Find old work or decisions:

```bash
# Find all decisions about architecture
grep -r "architecture" data/decisions/

# Get daily logs from a date range
ls data/daily-logs/ | grep "2026-07"

# Find what we decided about live-stream
grep -r "live-stream" data/decisions/ data/projects/

# Get blocker history
grep -r "Blockers" data/daily-logs/ | tail -20
```

---

## Memory in Multi-Agent Workflows

When agents work in sequence:

```
@design → creates design doc (stored in data/projects/)
          ↓
@dev    → reads design, builds feature (documents decisions)
          ↓
@qa     → tests, finds issue (logs in blocker)
          ↓
@dev    → fixes issue (updates decision log)
          ↓
@design → verifies (approves, documents completion)
```

Each agent reads context from previous steps, adds their work, and updates shared memory.

---

**This module ensures knowledge is preserved, accessible, and organized across sessions and agents.**

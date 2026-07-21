# PromptOS Module: Integration
## System Integration Patterns

This module defines how agents integrate with WISE² services and other systems.

---

## Integration Points

### Knowledge Graph
The central entity-relationship store for business logic.

**Query patterns**:
```typescript
// Find related entities
const projects = await kg.query({
  type: 'project',
  related_to: 'customer:acme-corp'
});

// Get entity details
const customer = await kg.get('customer:acme-corp');

// Find decision trail
const decisions = await kg.query({
  type: 'decision',
  affects: 'feature:live-stream'
});

// Update relationships
await kg.update({
  entity: 'project:promptos',
  relations: {
    blocked_by: ['task:type-definitions'],
    depends_on: ['decision:architecture']
  }
});
```

**Common entities**:
- `project:*` — Work items (promptos, live-stream, etc.)
- `customer:*` — Client accounts
- `team:*` — Groups (engineering, design, sales)
- `person:*` — Individuals
- `service:*` — Running services
- `decision:*` — Architectural decisions
- `device:*` — Deployment targets (servers, devices)

---

### Memory Engine
Persistent storage for agent state and user preferences.

**Read preferences**:
```typescript
// Get user preferences
const prefs = await memory.get('user:dwise03', {
  scope: 'preferences',
  keys: ['timezone', 'language', 'notifications']
});
// Returns: { timezone: 'US/Central', language: 'en', notifications: 'email' }

// Get project context
const context = await memory.get('project:promptos', {
  scope: 'context',
  keys: ['phase', 'budget', 'team']
});
```

**Store results**:
```typescript
// Save work progress
await memory.set('agent:developer', 'task:promptos-agents', {
  status: 'in-progress',
  progress: 60,
  lastUpdate: new Date(),
  notes: 'Completed 16 agent prompts, building TypeScript framework'
});

// Store decision outcome
await memory.set('decision:promptos-registry', {
  choice: 'file-based',
  rationale: 'Simple, auditable, works offline',
  outcome: 'implemented',
  dateDecided: '2026-07-21'
});
```

---

### Discord Integration
Async communication and notifications.

**Send messages**:
```typescript
// Notify team of completion
await discord.send({
  channel: '#engineering',
  author: 'Executive Agent',
  message: `✅ PromptOS core system complete (60% overall)`,
  attachments: [{
    type: 'decision',
    title: 'File-based prompt registry',
    link: 'data/decisions/2026-07-21-promptos-architecture.md'
  }]
});

// Request approval
await discord.requestApproval({
  channel: '#approvals',
  requester: 'developer-agent',
  item: 'Merge feature/promptos to main',
  deadline: '2026-07-22T15:00:00Z'
});
```

**Listen for responses**:
```typescript
// Wait for approval
const response = await discord.waitForApproval(
  'promptos-merge-approval',
  { timeout: 3600000 }  // 1 hour
);

if (response.approved) {
  console.log(`Approved by ${response.approver}`);
} else {
  console.log(`Rejected: ${response.reason}`);
}
```

---

### Raspberry Pi Edge
Local inference, background jobs, and offline capabilities.

**Schedule background job**:
```typescript
// Run on edge device
await edge.scheduleJob({
  device: 'raspberry-pi-home',
  job: 'backup-database',
  schedule: '0 2 * * *',  // Daily at 2 AM
  timeout: 300000  // 5 minutes
});

// Queue offline task
await edge.queueOffline({
  device: 'raspberry-pi-car',
  task: 'sync-navigation-cache',
  priority: 'high',
  retryOn: ['connection-restored']
});
```

**Run local inference**:
```typescript
// Inference on device (lower latency, privacy)
const result = await edge.infer({
  device: 'raspberry-pi-home',
  model: 'whisper-small',  // Local speech-to-text
  input: audioBuffer,
  options: { language: 'en' }
});
```

---

### Cross-Agent Communication
Agents calling each other.

**Simple delegation**:
```typescript
// Developer → QA (run tests)
const testResult = await agentBus.call('qa', {
  action: 'run-test-suite',
  branch: 'feature/promptos',
  testTypes: ['unit', 'integration'],
  reportTo: 'developer'
});
```

**Complex handoff**:
```typescript
// Executive → Developer → Infrastructure → QA (pipeline)
const handoff = await agentBus.pipeline([
  { agent: 'developer', action: 'build', args: { branch: 'feature/promptos' } },
  { agent: 'infrastructure', action: 'deploy-staging', args: { build: '$prev.buildId' } },
  { agent: 'qa', action: 'test-staging', args: { url: '$prev.stagingUrl' } },
  { agent: 'developer', action: 'merge-if-green', args: { testResults: '$prev.results' } }
]);
```

**Wait for agent**:
```typescript
// Executive waiting for developer to finish
const result = await agentBus.waitFor({
  agent: 'developer',
  task: 'task:promptos-agents',
  status: 'complete',
  timeout: 86400000  // 24 hours
});
```

---

### Second Brain (Knowledge Base)
Long-term knowledge storage and retrieval.

**Store knowledge**:
```typescript
// Document decision
await secondBrain.store({
  type: 'decision',
  title: 'PromptOS File-Based Registry',
  content: `
    # Decision: Use file-based prompt registry
    
    ## Problem: How to manage prompt versions?
    
    ## Options:
    - Database (fast, complex)
    - Files (simple, auditable)
    - Hybrid (best, complex)
    
    ## Chosen: Files
    
    Because: Simplicity, auditability, works offline
  `,
  tags: ['architecture', 'promptos', 'decision'],
  relatedTo: ['project:promptos', 'decision:agent-framework']
});

// Store pattern
await secondBrain.store({
  type: 'pattern',
  title: 'Agent Error Recovery Pattern',
  content: '... implementation details ...',
  tags: ['patterns', 'error-handling', 'resilience']
});
```

**Query knowledge**:
```typescript
// Find related documentation
const docs = await secondBrain.search({
  query: 'agent composition inheritance',
  type: 'architecture-doc',
  limit: 10
});

// Get pattern example
const pattern = await secondBrain.getPattern('error-recovery');
```

---

### API Server Integration
Communication with backend services.

**Call REST API**:
```typescript
// Query database through API
const users = await api.get('/api/v1/users', {
  query: { role: 'developer', active: true }
});

// Create resource
const project = await api.post('/api/v1/projects', {
  name: 'PromptOS',
  description: 'Agent framework',
  owner: 'team:engineering'
});

// Update resource
await api.patch(`/api/v1/projects/${project.id}`, {
  status: 'in-progress',
  progress: 60
});
```

**Handle API errors**:
```typescript
try {
  const result = await api.get('/api/data');
} catch (error) {
  if (error.status === 404) {
    console.log('Not found, creating...');
    await api.post('/api/data', defaultData);
  } else if (error.status === 401) {
    console.error('Authentication failed');
    await escalate('API auth failure');
  } else {
    throw error;  // Unknown error, escalate
  }
}
```

---

### Git Repository
Version control for code and prompts.

**Track changes**:
```typescript
// Read changes
const diff = await git.diff('feature/promptos', 'main');

// Make commit
await git.commit({
  message: `Build PromptOS framework: 16 agents, core system, integration`,
  files: ['promptos/', 'packages/agent-framework/'],
  co_author: 'Claude Haiku 4.5 <noreply@anthropic.com>'
});

// Push changes
await git.push('feature/promptos');
```

---

## Integration Workflow Example

**Scenario**: Executive agent orchestrates building PromptOS

```
1. Executive reads CLAUDE.md, daily logs, inbox
2. Executive queries KG: project:promptos (status, team, timeline)
3. Executive calls Developer agent:
   - Pass: project spec, requirements, decisions
   - Receive: build plan, resource needs
4. Developer builds, updates progress in memory
5. Developer completes, notifies via Discord
6. Executive calls QA agent:
   - Pass: built code, test requirements
   - Receive: test results, issues found
7. QA finds issue, escalates to Developer
8. Developer fixes, notifies Discord
9. Executive calls Infrastructure agent:
   - Pass: code, deployment target
   - Receive: deployment status
10. Infrastructure deploys, confirms
11. Executive stores decision and completion in KB
12. Executive updates daily log and sends summary to Discord
```

---

## Error Handling in Integration

When integration points fail:

```typescript
async function integrateWithFallback(integration, primary, fallback) {
  try {
    return await primary();
  } catch (error) {
    console.warn(`${integration} primary failed, using fallback`);
    try {
      return await fallback();
    } catch (fallbackError) {
      console.error(`${integration} both primary and fallback failed`);
      
      // Notify team
      await discord.send({
        channel: '#alerts',
        message: `⚠️ Integration ${integration} failed and degraded gracefully`
      });
      
      // Use offline/cached response
      return await getOfflineResponse(integration);
    }
  }
}
```

---

## Rate Limiting & Quotas

Respect limits on external integrations:

```typescript
const INTEGRATION_LIMITS = {
  'api-server': { callsPerMinute: 100, throttle: true },
  'discord-bot': { messagesPerHour: 50, throttle: true },
  'knowledge-graph': { queriesPerMinute: 50, throttle: false },
  'raspberry-pi': { jobsPerDevice: 5, throttle: false },
};

async function callIntegration(service, fn) {
  const limit = INTEGRATION_LIMITS[service];
  if (!limit) throw new Error(`No limit defined for ${service}`);
  
  if (limit.throttle) {
    await rateLimiter.acquire(service);
  }
  
  return await fn();
}
```

---

**This module ensures all agents can seamlessly integrate with WISE² services and external systems.**

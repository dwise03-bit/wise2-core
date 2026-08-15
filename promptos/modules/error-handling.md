# PromptOS Module: Error Handling
## Failure Recovery & Resilience

This module defines how agents handle errors, recover gracefully, and maintain system stability.

---

## Error Classification

### Tier 1: Recoverable (Agent Continues)
- **API timeout** → Retry with exponential backoff
- **File not found** → Check alternative paths, suggest fixes
- **Tool rate limit** → Queue and retry later
- **Temporary network error** → Retry after delay
- **Invalid input** → Validate and re-request

### Tier 2: Degraded (Agent Continues with Fallback)
- **Non-critical tool unavailable** → Use alternative
- **Partial data returned** → Work with what we have
- **External service slow** → Cache result, move on
- **Memory checkpoint failed** → Use last known state
- **Config missing** → Use sensible default

### Tier 3: Critical (Human Intervention)
- **Database corruption** → Stop, alert, preserve state
- **Git merge conflict** → Human must resolve
- **Permission denied** → Stop, request access
- **Circular dependency** → Architectural issue
- **Deadlock/infinite loop** → Force stop, debug

---

## Tier 1: Recovery Pattern

When a recoverable error occurs:

```
1. Log the error with full context
2. Increment retry counter
3. Calculate backoff (exponential: 1s, 2s, 4s, 8s, 16s)
4. Wait backoff duration
5. Retry operation
6. If max retries (5) exceeded, escalate to Tier 2
```

Example:

```typescript
async function retryWithBackoff(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const backoff = Math.pow(2, i) * 1000;
      console.log(`Retry ${i+1}/${maxRetries} after ${backoff}ms`);
      await sleep(backoff);
    }
  }
  throw new Error(`Failed after ${maxRetries} retries`);
}
```

---

## Tier 2: Fallback Pattern

When primary tool fails, use fallback:

```typescript
async function withFallback(primary, fallback, context) {
  try {
    return await primary();
  } catch (error) {
    console.warn(`Primary failed: ${error.message}`);
    console.log(`Using fallback...`);
    try {
      return await fallback();
    } catch (fallbackError) {
      console.error(`Both primary and fallback failed`);
      // Escalate to Tier 3
      await escalate(error, fallbackError, context);
    }
  }
}

// Example: Fetch data from primary or cache
await withFallback(
  () => fetch('/api/data'),
  () => loadFromCache('/cache/data.json'),
  { operation: 'load-data', critical: false }
);
```

---

## Tier 3: Escalation

When an error requires human intervention:

```typescript
await escalateError({
  tier: 3,
  severity: 'critical',
  error: {
    message: 'Database corruption detected',
    stack: errorStack,
    context: { table: 'users', rows: 1234 }
  },
  recommendation: 'Restore from backup, run integrity check',
  escalateTo: 'infrastructure-agent',
  notifyChannels: ['discord-alerts', 'pagerduty']
});
```

Escalation triggers:
1. **Log to knowledge base** — `data/errors/incident-2026-07-21-001.md`
2. **Notify relevant agent** — Via Discord
3. **Preserve system state** — Save memory, backups, logs
4. **Stop operations** — Don't make things worse
5. **Wait for human decision** — Don't auto-recover critical errors

---

## Error Logging

Every error gets logged with this structure:

```markdown
# Error Log Entry

**Timestamp**: 2026-07-21T09:34:22Z  
**Severity**: [recoverable|degraded|critical]  
**Agent**: developer  
**Operation**: compile-typescript  

## Error Details
- **Message**: Compile failed: 127 syntax errors
- **Code**: TS1234
- **Stack**: [full stack trace]

## Context
- **Attempt**: 1/5
- **Tool**: Bash (tsc command)
- **Input**: src/**/*.ts
- **Last Success**: 2026-07-21T09:30:00Z

## Recovery Attempt
- **Strategy**: Retry with exponential backoff
- **Next Attempt**: 2026-07-21T09:35:22Z (after 60s)
- **Max Retries**: 5

## Agent Notes
- Likely cause: Node modules not installed
- Suggestion: Run npm install before retry
- Escalate if: Still failing after 3 retries
```

---

## Common Error Scenarios

### Scenario 1: File Not Found

```
Error: Read failed for /path/to/file
       Cannot find module or file

Recovery:
1. Check spelling and path separators
2. List directory to find alternatives
3. Suggest closest match to user
4. If truly missing, create or fetch it

Example:
→ User asked for src/components/Button.tsx
→ But file is actually src/components/button.tsx (lowercase)
→ Suggest: "Did you mean src/components/button.tsx?"
```

### Scenario 2: API Rate Limit

```
Error: HTTP 429 Too Many Requests
       X-Rate-Limit-Reset: 2026-07-21T09:45:00Z

Recovery:
1. Extract reset time from headers
2. Calculate wait duration
3. Queue operation for later
4. Continue with cached data if available
5. Notify user of delay

Example:
→ GitHub API rate limit hit (60 requests/hour)
→ Queue remaining requests for 14 minutes
→ Use cached repo info while waiting
→ Resume when rate limit resets
```

### Scenario 3: Git Merge Conflict

```
Error: git merge failed
       Conflict in src/index.ts
       Merge conflict markers present

Recovery:
1. Cannot auto-resolve (Tier 3)
2. Preserve both branches
3. Notify developer
4. Suggest manual resolution
5. Block deployment until resolved

Example:
→ Merge attempt on feature/promptos
→ Conflict with main (both edited agents/executive.md)
→ Show conflict markers to developer
→ Stop CI/CD pipeline
→ Wait for human decision
```

### Scenario 4: Timeout

```
Error: Operation timed out after 30s
       npm install stalled

Recovery:
1. Check if operation is actually stuck
2. Increase timeout if reasonable
3. Kill operation if confirmed hung
4. Try with simpler subset
5. Escalate if pattern repeats

Example:
→ npm install taking >30s
→ Increase timeout to 60s, retry
→ If still slow, check npm registry health
→ If registry down, use fallback mirror
```

---

## Error Prevention

Prevent errors before they happen:

### Pre-Checks
Before operations, verify preconditions:

```typescript
async function safeGitPush(branch) {
  // Pre-checks
  if (!await isCleanWorkingTree()) {
    throw new Error('Uncommitted changes, cannot push');
  }
  if (!await isBranchUpToDate(branch)) {
    throw new Error('Branch behind origin, pull first');
  }
  if (!await hasCIGreen(branch)) {
    throw new Error('CI failing, cannot push');
  }
  
  // Safe to push
  return await gitPush(branch);
}
```

### Validation
Validate all inputs:

```typescript
function validateInput(input) {
  if (!input.name) throw new Error('Missing required: name');
  if (input.name.length < 1) throw new Error('Name too short');
  if (input.name.length > 256) throw new Error('Name too long');
  if (!/^[a-zA-Z0-9-_]+$/.test(input.name)) {
    throw new Error('Invalid characters in name');
  }
  return input;
}
```

### Health Checks
Before critical operations:

```typescript
async function preDeploymentCheck() {
  const checks = {
    database: await ping(DB_URL),
    storage: await checkDiskSpace(),
    ci: await getCIStatus(),
    secrets: await validateSecretsLoaded(),
  };
  
  const passed = Object.values(checks).every(c => c.healthy);
  if (!passed) {
    throw new Error(`Pre-deployment check failed: ${JSON.stringify(checks)}`);
  }
}
```

---

## Graceful Degradation

When systems fail, degrade gracefully:

| System | Failure | Graceful Fallback |
|--------|---------|-------------------|
| Search | Index unavailable | Use grep, slower but works |
| Cache | Cache miss | Fetch from source |
| AI API | Rate limited | Use offline heuristics |
| Database | Slow queries | Show cached results |
| External API | Timeout | Use last known value |

---

## Retry Policies

Different policies for different scenarios:

```typescript
const RETRY_POLICIES = {
  // Aggressive: likely temporary
  API_CALL: {
    maxRetries: 5,
    backoff: (n) => Math.pow(2, n) * 100,  // 100ms, 200ms, 400ms, ...
    onRetry: () => console.log('Retrying API call...')
  },
  
  // Conservative: rare retries
  GIT_OPERATION: {
    maxRetries: 2,
    backoff: (n) => 1000 * (n + 1),  // 1s, 2s
    onRetry: () => console.warn('Git operation failed, retrying...')
  },
  
  // One-shot: no retries
  FILE_PERMISSION: {
    maxRetries: 0,
    backoff: () => 0,
    onRetry: () => { throw new Error('Cannot retry permission errors'); }
  }
};
```

---

## Circuit Breaker Pattern

Stop retrying after repeated failures:

```typescript
class CircuitBreaker {
  constructor(failureThreshold = 5, resetTimeout = 60000) {
    this.failures = 0;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.state = 'closed'; // closed, open, half-open
    this.lastFailureTime = null;
  }
  
  async execute(fn) {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }
}
```

---

**This module ensures agents handle failures gracefully and maintain system reliability.**

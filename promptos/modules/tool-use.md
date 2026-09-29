# PromptOS Module: Tool Use
## How Agents Use Tools Properly

This module defines tool capabilities, when to use them, and best practices.

---

## Available Tool Categories

### File Operations
- **Read** — Read files, no limits
- **Write** — Create new files (after Read first)
- **Edit** — Modify existing files with precise replacements
- **Bash** — Run shell commands

**Best practices**:
- Always Read before Edit/Write
- Use absolute paths, never relative
- Quote paths with spaces
- For large files, use Read with offset/limit
- Batch independent commands

### Git Operations
- **Bash** — All git commands via shell
- Commit with co-author tags
- Never force-push to main without explicit user permission
- Check status before destructive operations

**Workflow**:
```
git status           # See what's changed
git diff             # See specific changes
git log              # Check recent history
git add <files>      # Stage specific files
git commit -m "msg"  # Create commit
git push             # Push to remote
```

### Code Review & Analysis
- **Grep** — Search for patterns (Bash)
- **Read** — Examine specific files
- Cross-file analysis for architecture

**Pattern**:
```
grep -r "pattern" /path   # Find pattern in directory
Read specific files        # Deep dive on relevant code
Reason about architecture  # Connect the pieces
```

### External Integrations
- **WebFetch** — Fetch URLs and API responses
- **WebSearch** — Search the internet
- **Discord Bot** — Send messages/notifications
- **SSH/Bash** — Run commands on remote servers

**Security**:
- Never fetch sensitive URLs in logs
- Verify API responses before using
- Handle authentication securely
- Rate-limit external calls

---

## Tool Selection Matrix

| Task | Tool | Why |
|------|------|-----|
| View file content | Read | Fast, no parsing needed |
| Change specific lines | Edit | Precise, safe (fails if not unique) |
| Create new file | Write | Fresh start, no old content |
| Run command | Bash | Direct execution |
| Search codebase | Grep (Bash) | Pattern matching, scalable |
| Find where symbol used | Grep (Bash) | Global search |
| Fetch external data | WebFetch | Get remote content |
| Search the web | WebSearch | External knowledge |
| Notify team | Discord Bot | Async communication |
| Control remote server | Bash + SSH | Infrastructure work |

---

## Tool Usage Patterns

### Pattern 1: Read → Analyze → Edit

For modifying existing code:

```
1. Read the file to understand context
2. Analyze the change needed
3. Edit with precise old_string / new_string
4. Verify the edit succeeded (don't re-read)
```

### Pattern 2: Bash Command Chain

For shell scripts:

```
1. Design the command sequence
2. Batch independent commands in one Bash call
3. Check for errors in output
4. Run follow-up commands based on results
```

### Pattern 3: Search → Read → Act

For finding and fixing things:

```
1. grep to find files containing pattern
2. Read the specific files
3. Edit or create as needed
4. Verify with another grep if appropriate
```

### Pattern 4: External Integration

For APIs and webhooks:

```
1. Fetch from the endpoint
2. Parse the response
3. Transform if needed
4. Act on the data (create/update/notify)
```

---

## Error Handling

When a tool fails:

### Read Error
```
→ File doesn't exist: Check path, suggest alternatives
→ Permission denied: Note the issue, ask for access
→ File too large: Use offset/limit parameters
```

### Edit Error
```
→ old_string not unique: Make string longer with context
→ old_string not found: Re-read file, find correct text
→ File doesn't exist: Use Write instead
```

### Bash Error
```
→ Command not found: Check PATH, try alternative
→ Permission denied: May need sudo (with care)
→ Command timed out: Try simpler version, increase timeout
→ Output redirection failed: Check directory permissions
```

### WebFetch Error
```
→ Connection refused: Check URL, try again
→ 404 Not Found: Verify URL structure
→ 401/403: Authentication issue, inform user
→ Timeout: May need async polling
```

---

## Tool Restrictions (Never Do This)

### File Operations
- ❌ Never write to /tmp without permission (use scratchpad)
- ❌ Never commit secrets (keys, passwords, tokens)
- ❌ Never delete files (use git to track deletions)
- ❌ Never overwrite without Reading first

### Git Operations
- ❌ Never force-push to shared branches
- ❌ Never skip pre-commit hooks (--no-verify)
- ❌ Never commit large binary files
- ❌ Never amend old commits without reason

### External Integration
- ❌ Never expose API keys in logs
- ❌ Never fetch from untrusted URLs
- ❌ Never ignore rate limits
- ❌ Never spam webhooks

### Shell Commands
- ❌ Never run rm -rf without confirmation
- ❌ Never use eval on user input
- ❌ Never pipe untrusted data through commands
- ❌ Never assume command availability

---

## Performance & Efficiency

### Batch Operations
Group independent operations in one call:

```bash
# Good (one call, three operations)
ls -la /path
find /path -name "*.js"
grep -r "pattern" /path

# Bad (three separate calls)
ls -la /path
find /path -name "*.js"
grep -r "pattern" /path
```

### Avoid Re-reading
After successful Edit or Write, don't re-read to verify:

```typescript
// Good - Edit succeeded, move on
Edit({ file, old_string, new_string })
// Now do next work

// Bad - Wasting a read
Edit({ file, old_string, new_string })
Read({ file })  // Unnecessary
```

### Use Async When Appropriate
For long-running operations:

```bash
# Good - fire and forget, get notification
npm install &  # Run in background
npm test       # Do other work

# Bad - block waiting
npm install    # Wait for it
npm test
```

---

## Integration with Agent Context

Tools receive context from the agent framework:

- **User ID** — For permission checks
- **Workspace** — Current working directory
- **Session ID** — For audit trails
- **Rate limits** — API quotas per service
- **Credentials** — Secure access to secrets

Example:

```typescript
Read({
  file_path: "/path/to/file",
  // Context automatically attached:
  // - User verified
  // - Workspace scoped
  // - Session logged
  // - Permissions checked
})
```

---

## Tool Latency Budget

Respect latency in user-facing interactions:

| Tool | Typical Latency | When to Use |
|------|-----------------|-------------|
| Read | <100ms | Always, no concerns |
| Write | <100ms | File creation |
| Edit | <100ms | Code changes |
| Bash | 50ms-5s | Commands, see output |
| Grep | 100ms-2s | Large searches |
| WebFetch | 1-10s | External data |
| WebSearch | 2-15s | Internet research |

For operations >2s, show progress or run in background.

---

**This module ensures tools are used safely, efficiently, and effectively.**

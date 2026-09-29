# Completion Report Skill

**Purpose**: Generate production-grade visual HTML reports automatically upon task completion using the WISE² Production Report Standard.

**Trigger Keywords**: `completion report`, `final report`, `status report`, `task complete`, `delivery`, `done`, `verified`, `tested`, `deployed`, or end of any significant task

**When to Use**: 
- End of feature implementation
- End of integration work
- End of testing/verification
- End of deployment tasks
- End of bug fixes or refactoring
- Anytime the user asks for a completion report
- Automatically on task completion keywords

---

## WISE² Production Report Standard

Every report must answer within five seconds:
- **WHAT SYSTEM IS THIS?** (Name, logo, context)
- **WHAT IS ITS CURRENT STATE?** (Overall health, verified status)
- **WHAT IS BROKEN?** (Critical alerts, open blockers)
- **WHAT NEEDS ATTENTION?** (Pending items, warnings)
- **WHAT SHOULD [USER] DO NEXT?** (One prominent next action)

### Source of Truth Rule
Never invent system state. Every status must be one of:
- **VERIFIED** — directly confirmed from command, API, log, repository, service, or device
- **WARNING** — operational but degraded, stale, incomplete, or requires attention
- **FAILED** — verification actually failed
- **UNKNOWN** — not enough evidence exists

Never say DONE, WORKING, FIXED, DEPLOYED, or COMPLETE unless the requested result was actually verified.

### Report Structure

#### Executive Command Header (5-second scan)
- WISE² logo / product identity
- Report name
- Environment (dev/staging/production)
- Overall verified health status
- Last verification time
- Last successful sync/deployment
- Active branch
- Current commit
- Deployment target
- Open blockers count
- Critical alerts count
- One prominent NEXT ACTION button

#### System Topology
- Visual architecture diagram
- Show all connections (mobile ↔ VPS ↔ services)
- Connection state for every link (VERIFIED, WARNING, FAILED)
- Do not represent unverified connections as active

#### Live Health Matrix
Cards for each system component:
- **Status** (✅ GREEN, ⚠️ YELLOW, ❌ RED, ❓ UNKNOWN)
- **Host/Device** identifier
- **Latency** (if available)
- **Last Heartbeat** timestamp
- **Version** info
- **Relevant IP/Hostname**

#### Coverage/Accomplishments
- Checklist of what was delivered
- Key milestones hit
- Features/components built

#### Technical Details
- Code statistics if applicable
- API endpoints, database changes, etc.
- Architecture decisions
- Security considerations
- Performance metrics

#### Commits & Changes
- Git commit hashes and messages
- Branch name
- Files changed count
- Lines added/removed

#### Next Steps
- Numbered action items
- Dependencies or blockers
- Recommended timeline
- Who should do what

#### Evidence & Verification
- Links to logs, API responses, test reports
- Commands used to verify
- Screenshots of verification
- Timestamps of verification runs

#### Footer
- Generated timestamp
- Branch/version info
- Verification time
- Quick reference links

## Template Colors

- **Purple Gradient** (#667eea → #764ba2): Header, primary accent, premium feel
- **Green** (#10b981): ✅ SUCCESS / VERIFIED
- **Amber** (#f59e0b): ⚠️ WARNING / PENDING
- **Red** (#ef4444): ❌ FAILED / CRITICAL
- **Blue** (#3b82f6): ℹ️ INFO / ACTION ITEMS
- **Gray** (#6b7280): Text, borders, secondary info
- **Dark** (#1f2937): Headers, emphasis
- **Light Gray** (#f3f4f6): Backgrounds, cards

## Implementation Steps

1. **Detect Task Completion**
   - Watch for natural task conclusion
   - Listen for explicit user request
   - Scan for verification language ("verified", "tested", "complete", "deployed", "shipped")
   - Check for VERIFIED status before claiming completion

2. **Gather Verified Metrics**
   - **Git**: commits, branch, files changed, push status (VERIFIED via git log)
   - **Tests**: pass/fail counts, coverage (VERIFIED via test output)
   - **Code**: LOC, endpoints, schema changes (VERIFIED via inspection)
   - **Status**: blocker-free verification (VERIFIED via checks)
   - **Deployment**: actual service health (VERIFIED via API/health endpoint)
   - **Time**: elapsed time if tracked (VERIFIED via logs)

3. **Verify Every Status**
   - Never claim GREEN without evidence
   - Document how each status was verified
   - Include command/API used for verification
   - Timestamp each verification check
   - Mark UNKNOWN if verification failed
   - Show WARNING if status is stale

4. **Create Report Data**
   - Organize accomplishments into checklist
   - Calculate stats and percentages
   - Summarize next steps
   - Extract key decisions
   - Include evidence links and verification details

5. **Generate HTML**
   - Use production report template (below)
   - Embed all CSS (no external dependencies)
   - Include all data inline
   - Responsive design (desktop/mobile/tablet)
   - Light/dark mode support
   - Accessible color contrasts (WCAG AA minimum)

6. **Publish & Share**
   - Publish as Artifact
   - Provide shareable link
   - Generate Discord-ready message
   - Include one-liner summary for Slack
   - Offer screenshot option for email

## Production Report Template

### Five-Second Executive Header
```html
<!-- Quick scan section - answers: what, state, problems, attention needed, next action -->
<div class="executive-header">
  <div class="header-grid">
    <!-- WHAT SYSTEM? -->
    <div class="header-info">
      <div class="system-name">[PROJECT_EMOJI] [PROJECT_NAME]</div>
      <div class="environment">Environment: [dev/staging/production]</div>
    </div>
    
    <!-- CURRENT STATE? -->
    <div class="health-status">
      <div class="status-badge [status-color]">[OVERALL_STATUS]</div>
      <div class="verification-time">Last verified: [TIMESTAMP]</div>
    </div>
  </div>
  
  <!-- WHAT IS BROKEN? / WHAT NEEDS ATTENTION? -->
  <div class="critical-alerts">
    <div class="alert-item [RED]" if="critical_blockers">🚨 [BLOCKER_COUNT] Blockers</div>
    <div class="alert-item [RED]" if="failed_checks">❌ [FAILED_COUNT] Failed Checks</div>
    <div class="alert-item [AMBER]" if="warnings">[WARNING_COUNT] Warnings</div>
  </div>
  
  <!-- WHAT SHOULD [USER] DO NEXT? -->
  <div class="next-action">
    <button class="primary-action">→ [PRIMARY_ACTION]</button>
  </div>
</div>
```

### System Topology Diagram
```html
<div class="topology-section">
  <h2>System Architecture</h2>
  <svg class="topology-diagram">
    <!-- Visual flow showing:
         - Mobile Device [status]
         - ↓ Connection [VERIFIED/WARNING/FAILED]
         - Tailscale/Network [status]
         - ↓ Connection [status]
         - WISE² API [status]
         - ↓ Connection [status]
         - VPS Services [status]
         - ↓ Connection [status]
         - Database/Redis [status]
    -->
  </svg>
</div>
```

### Live Health Matrix
```html
<div class="health-matrix">
  <h2>Component Health</h2>
  <div class="health-cards">
    <div class="health-card [GREEN/AMBER/RED]">
      <div class="component-name">📱 Mobile</div>
      <div class="status-icon">[✅/⚠️/❌]</div>
      <div class="detail">Last heartbeat: [TIME]</div>
      <div class="version">v[VERSION]</div>
    </div>
    <!-- Repeat for: VPS, API, Database, Redis, Docker, GitHub, etc -->
  </div>
</div>
```

### Full HTML Template Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[PROJECT_NAME] Production Report</title>
    <style>
        /* Production-grade embedded CSS with light/dark mode support */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        :root {
            --color-success: #10b981;
            --color-warning: #f59e0b;
            --color-error: #ef4444;
            --color-info: #3b82f6;
            --color-bg: #ffffff;
            --color-text: #1f2937;
            --color-border: #e5e7eb;
        }
        
        @media (prefers-color-scheme: dark) {
            :root {
                --color-bg: #1f2937;
                --color-text: #f3f4f6;
                --color-border: #374151;
            }
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            color: var(--color-text);
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: var(--color-bg);
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .executive-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-bottom: 2px solid rgba(255,255,255,0.1);
        }
        
        .health-matrix {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin: 30px 0;
        }
        
        .health-card {
            padding: 16px;
            border-radius: 8px;
            border-left: 4px solid;
            background: var(--color-bg);
        }
        
        .health-card.green { border-color: var(--color-success); }
        .health-card.amber { border-color: var(--color-warning); }
        .health-card.red { border-color: var(--color-error); }
        
        /* [Additional responsive styles] */
    </style>
</head>
<body>
    <div class="container">
        <!-- SECTION 1: 5-second executive header -->
        <div class="executive-header">...</div>
        
        <!-- SECTION 2: System topology -->
        <div class="content">
            <div class="topology-section">...</div>
            
            <!-- SECTION 3: Live health matrix -->
            <div class="health-matrix">...</div>
            
            <!-- SECTION 4: Accomplishments -->
            <div class="accomplishments-section">...</div>
            
            <!-- SECTION 5: Technical details -->
            <div class="technical-section">...</div>
            
            <!-- SECTION 6: Verification evidence -->
            <div class="verification-section">...</div>
            
            <!-- SECTION 7: Next steps -->
            <div class="next-steps-section">...</div>
        </div>
        
        <!-- Footer: timestamps, metadata, links -->
        <div class="footer">...</div>
    </div>
</body>
</html>
```

## Usage Examples

### Example 1: Feature Completion
```
Task: Build user authentication flow
Status: ✅ COMPLETE
Stats: 
  - 8 new endpoints
  - 5 tests passed
  - 3 commits
Next: Deploy to staging
```

### Example 2: Bug Fix
```
Task: Fix mobile sync worker
Status: ✅ FIXED
Stats:
  - 3 files changed
  - 1 critical issue resolved
  - All tests passing
Next: Deploy to production
```

### Example 3: Integration Work
```
Task: Mobile-to-VPS sync integration
Status: ✅ INSTALLED & VERIFIED
Stats:
  - 35 tests passed (100%)
  - 19 API endpoints verified
  - 3 commits pushed
Next: Load test with 100 concurrent clients
```

## Options & Customization

**Report Type**:
- `technical`: Code-focused with metrics
- `summary`: High-level overview
- `executive`: Management summary
- `detailed`: Full breakdown with all details

**Emphasis**:
- `metrics`: Lead with numbers
- `features`: Lead with accomplishments
- `timeline`: Lead with schedule
- `risk`: Lead with blockers and mitigations

**Artifacts to Include**:
- Git commits ✓
- Test results ✓
- Code statistics ✓
- Security checks ✓
- Performance metrics ✓
- Screenshots/artifacts ✓

## Production Standards - NEVER Violate

❌ **Never claim status without verification** (no DONE/COMPLETE/WORKING without evidence)  
❌ Include secrets or credentials  
❌ Use external CDNs or scripts  
❌ Reference private URLs or IPs (unless sanitized)  
❌ Include personal information beyond generic names  
❌ Represent unverified connections as active
❌ Use GREEN status for unverified items
❌ Say "should work" or "probably fine" (only VERIFIED/WARNING/FAILED/UNKNOWN)

## Always Required

✅ **Verify every status claim** (show evidence: logs, API responses, test output, commands)  
✅ **Include timestamps** for every verification check  
✅ **Show connection state** for every link in topology (not guessed)  
✅ **Answer 5-second questions** in executive header (what/state/broken/attention/action)  
✅ **Use correct status markers** (✅ VERIFIED, ⚠️ WARNING, ❌ FAILED, ❓ UNKNOWN)  
✅ Embed all CSS inline  
✅ Use simple, semantic HTML  
✅ Include verification method (curl, API, log file, test output, etc)  
✅ Provide evidence links  
✅ Provide next steps and blockers  
✅ Offer Discord-share message  
✅ Light/dark mode support  
✅ Responsive mobile layout  

## Auto-Invoke Rules

1. **Detect task completion** ("done", "verified", "tested", "deployed", "shipped")
2. **Verify every status** before generating report (no speculation)
3. **Gather 30+ seconds of context** before generating
4. **Document evidence** for every status claim (command used, API called, etc)
5. **Mark unknowns** if verification is blocked (don't guess)
6. **Ask confirmation** if ambiguous
7. **Always publish as artifact** (never just text)
8. **Provide shareable link** immediately

## Report Frequency

- ✅ **Per significant task completion** (features, integrations, deployments, fixes)
- ❌ **Don't spam** on every micro-task
- ❌ **Don't auto-generate** if verification is blocked (mark UNKNOWN instead)
- ✅ **Use judgment** on scope and frequency

## Critical Rule: Source of Truth

- **VERIFIED** = You ran a command or called an API that confirmed this status
- **WARNING** = Status is degraded, stale, incomplete, or concerning
- **FAILED** = You attempted verification and it failed
- **UNKNOWN** = Verification was blocked; don't guess

Never display green, yellow, or red without evidence of the actual state.

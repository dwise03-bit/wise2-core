# Completion Report Skill

**Purpose**: Generate professional visual HTML reports automatically upon task completion.

**Trigger Keywords**: `completion report`, `final report`, `status report`, `task complete`, `delivery`, or end of any significant task

**When to Use**: 
- End of feature implementation
- End of integration work
- End of testing/verification
- End of deployment tasks
- End of bug fixes or refactoring
- Anytime the user asks for a completion report

## Report Structure

### Header Section
- Task/Project name
- Status badge (✅ COMPLETE, ⏳ IN PROGRESS, ❌ ISSUES)
- High-level summary

### Stats Grid
- Primary metric (tests passed, lines written, features added, etc.)
- Secondary metrics (failures, time spent, commits, etc.)
- Pass rate or completion percentage
- Key numbers relevant to the task

### Coverage/Accomplishments
- Checklist of what was delivered
- Key milestones hit
- Features/components built

### Status Dashboard
- Component readiness (✅ Ready / ⏳ Pending)
- Deployment status
- Dependencies and blockers

### Technical Details
- Code statistics if applicable
- API endpoints, database changes, etc.
- Architecture decisions
- Security considerations

### Commits & Changes
- Git commit hashes and messages
- Branch name
- Files changed count
- Lines added/removed

### Next Steps
- Numbered action items
- Dependencies or blockers
- Recommended timeline
- Who should do what

### Key Achievements
- What went well
- Performance metrics
- Quality gates passed
- Security verified

### Footer
- Generated timestamp
- Branch/version info
- Quick reference links

## Template Colors

- **Purple Gradient** (#667eea → #764ba2): Header, primary accent
- **Green** (#10b981): Success, checkmarks, ready status
- **Amber** (#f59e0b): Pending, warning, in-progress
- **Blue** (#3b82f6): Info boxes, deployment steps
- **Gray**: Text, borders, muted elements

## Implementation Steps

1. **Detect Task Completion**
   - Watch for natural task conclusion
   - Listen for explicit user request
   - Scan for verification language ("verified", "tested", "complete")

2. **Gather Metrics**
   - Git: commits, branch, files changed
   - Tests: pass/fail counts, coverage
   - Code: LOC, endpoints, schema changes
   - Time: elapsed time if tracked
   - Status: blocker-free verification

3. **Create Report Data**
   - Organize accomplishments into checklist
   - Calculate stats and percentages
   - Summarize next steps
   - Extract key decisions

4. **Generate HTML**
   - Use report template (see below)
   - Embed all CSS (no external dependencies)
   - Include all data inline
   - Ensure responsive design

5. **Publish & Share**
   - Publish as Artifact
   - Provide link to user
   - Suggest Discord message
   - Offer screenshot option

## Report Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[PROJECT_NAME] Completion Report</title>
    <style>
        /* Embedded CSS - no external dependencies */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        /* [Rest of CSS styles] */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>[PROJECT_EMOJI] [PROJECT_NAME]</h1>
            <p>[BRIEF_DESCRIPTION]</p>
            <div class="status-badge">[STATUS_BADGE]</div>
        </div>
        
        <div class="content">
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">[METRIC_1]</div>
                    <div class="stat-label">[LABEL_1]</div>
                </div>
                <!-- More stat cards -->
            </div>
            
            <!-- Sections: Accomplishments, Status, etc -->
            
            <!-- Next Steps -->
            <div class="deployment-box">
                <h4>🚀 Next Steps</h4>
                <ol>
                    <li>[STEP_1]</li>
                    <li>[STEP_2]</li>
                </ol>
            </div>
        </div>
        
        <div class="footer">
            <p>Generated: [DATE] | Branch: [BRANCH_NAME]</p>
            <p>[SUMMARY_MESSAGE]</p>
        </div>
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

## Do Not

❌ Include secrets or credentials  
❌ Use external CDNs or scripts  
❌ Reference private URLs or IPs (unless sanitized)  
❌ Include personal information beyond generic names  
❌ Claim work is complete without verification  

## Always

✅ Embed all CSS inline  
✅ Use simple, semantic HTML  
✅ Include timestamps and metadata  
✅ Provide next steps and blockers  
✅ Verify before publishing  
✅ Offer Discord-share message  

---

**Auto-Invoke Rules**:
1. Detect natural task completion ("done", "verified", "tested", "deployed")
2. Gather 30+ seconds of context before generating
3. Ask user confirmation if ambiguous
4. Always publish as artifact, never just text
5. Provide shareable link immediately

**Report Frequency**: Per significant task completion (don't spam on every micro-task; use judgment)

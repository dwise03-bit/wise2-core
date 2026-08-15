# WISE² Vault Templates — Production-Ready Collection

Complete markdown templates for all document types in the WISE² knowledge system. Copy-paste ready with examples.

---

## Template 1: Meeting Notes

```markdown
---
title: "Meeting: [Title] - [Date]"
created: 2026-01-17T14:00:00Z
created_by: Hermes
category: meeting
type: standup | client | planning
status: published
owner: [team]
tags: [meeting, [type], [date]]
requires_human_review: true
ai_generated: true
---

# [Meeting Name] - [Date]

**Participants:** Name (Role), Name (Role)  
**Duration:** X min | **Date:** YYYY-MM-DD  

## Summary
Key outcomes in 2-3 sentences.

## Decisions
- DECISION: Statement (Owner: Name, Timeline: YYYY-MM-DD)

## Action Items
- [ ] Name - Task (due: YYYY-MM-DD)

## Related
- [[document_1]]
- [[document_2]]
```

---

## Template 2: Daily Notes

```markdown
---
title: "Daily Note - [Date]"
created: 2026-01-17T06:00:00Z
category: daily
type: daily-note
status: published
tags: [[date], daily]
ai_generated: true
---

# Daily Note - [Day], [Date]

## Yesterday's Wins
- ✅ Accomplishment 1
- ✅ Accomplishment 2

## Today's Priorities
- [ ] P1: Critical task
- [ ] P2: Important task
- [ ] P3: Secondary task

## Focus Time
9-12 AM: [Deep work block]  
1-5 PM: [Work block]  

## Challenges
- Challenge and resolution

## Learning
One thing I learned today.

## Gratitude
I'm grateful for...
```

---

## Template 3: Project

```markdown
---
title: "[Project Name]"
created: 2026-01-17
category: projects
type: project
status: active | archived
owner: [person]
tags: [project, [status]]
version: 1.0
---

# [Project Name]

**Owner:** [Name] | **Status:** Active  
**Start:** YYYY-MM-DD | **Target:** YYYY-MM-DD  

## Overview
1-2 sentence description of project purpose.

## Goals
1. Goal 1 - metric
2. Goal 2 - metric
3. Goal 3 - metric

## Team
| Role | Person | Contact |
|------|--------|---------|
| Lead | Name | email |
| Dev | Name | email |

## Timeline
- **Phase 1** (Jan 1-15): Deliverable 1, 2
- **Phase 2** (Jan 16-31): Deliverable 1, 2

## Deliverables
- [ ] Deliverable 1 (due: YYYY-MM-DD)
- [ ] Deliverable 2 (due: YYYY-MM-DD)

## Success Metrics
1. Metric 1: Target value
2. Metric 2: Target value

## Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Risk 1 | Medium | High | Strategy |

## Related
- [[roadmap]]
- [[team]]
```

---

## Template 4: Decision

```markdown
---
title: "Decision: [Statement]"
created: 2026-01-17
category: meetings
type: decision
status: published
owner: [responsible]
tags: [decision, [area]]
---

# Decision: [Statement]

## Context
Why was this decision needed?

## Alternatives Considered
1. **Option A:** [Pros/Cons/Cost]
2. **Option B:** [Pros/Cons/Cost]
3. **Option C (SELECTED):** [Pros/Cons/Cost]

## Rationale
Why this option?

## Timeline
- **Decided:** YYYY-MM-DD
- **Effective:** YYYY-MM-DD
- **Review:** YYYY-MM-DD

## Stakeholders
| Person | Role | Status |
|--------|------|--------|
| Name | Lead | ✅ Approved |

## Implementation
- Phase 1 (Dates): Task 1, 2
- Phase 2 (Dates): Task 1, 2

## Success Metrics
1. Metric 1
2. Metric 2

## Reversibility
Can this be undone? Yes/No  
If yes, until: YYYY-MM-DD

## Related
- [[related_decision]]
```

---

## Template 5: Feature Spec

```markdown
---
title: "Feature: [Name]"
created: 2026-01-17
category: development
type: specification
status: draft | approved | shipped
owner: [team]
tags: [feature, [priority]]
---

# Feature: [Name]

**Purpose:** Problem it solves  
**Priority:** P0 | P1 | P2  
**Effort:** X points  
**Target:** Version X.X  

## User Story
**As a** [user type]  
**I want to** [action]  
**So that** [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Requirements
- Requirement 1
- Requirement 2

## API Design
```
POST /api/v1/feature
{ param1: type, param2: type }
```

## Implementation Tasks
- [ ] Backend: [task]
- [ ] Frontend: [task]
- [ ] Testing: [task]

## Success Metrics
1. Metric 1: target
2. Metric 2: target
```

---

## Template 6: Bug Report

```markdown
---
title: "Bug: [Title]"
created: 2026-01-17
category: development
type: bug
status: new | fixed
owner: [assigned]
tags: [bug, [severity], [area]]
---

# Bug: [Title]

**Severity:** Critical | High | Medium | Low  
**Impact:** How affects users

## Summary
Clear bug description.

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected
What should happen?

## Actual
What happens?

## Environment
- OS: Windows/Mac/Linux
- Browser: Chrome/Firefox
- Version: v1.2.3
- Environment: Production/Staging

## Error
```
Error message and stack trace
```

## Root Cause
[Technical explanation]

## Solution
[Fix approach]

## Testing
- [ ] Bug reproducible
- [ ] Fix applied
- [ ] Tests pass
- [ ] Tested on all browsers
```

---

## Template 7: Weekly Review

```markdown
---
title: "Weekly Review - Week [#], [Month] [Year]"
created: 2026-01-17
category: daily
type: weekly-review
status: published
tags: [weekly, [week_number]]
ai_generated: true
---

# Weekly Review - Week [#], [Month] [Year]

**Period:** Jan 13-17, 2026  
**Team:** [Team Name]  

## Summary
2-3 sentences about the week's accomplishments.

## Major Wins
1. Win 1 - Impact
2. Win 2 - Impact
3. Win 3 - Impact

## Metrics
| Metric | Target | Actual |  Variance |
|--------|--------|--------|-----------|
| Velocity | 50 | 48 | -2 |
| Bugs Fixed | 5 | 3 | -2 |
| PRs Merged | 8 | 12 | +4 |

## Work Completed
### Features
- Feature 1 (PR #XXX)
- Feature 2 (PR #XXX)

### Bugs Fixed
- Bug 1
- Bug 2

### Infrastructure
- Upgrade 1
- Update 1

## Decisions Made
1. [[DECISION-001]]: Title
2. [[DECISION-002]]: Title

## Challenges
⚠️ Blocker 1 - Description  
✅ Resolved: Previous blocker fixed

## Next Week Priorities
### Critical (P0)
- [ ] Task 1
- [ ] Task 2

### High (P1)
- [ ] Task 1
- [ ] Task 2

## Team Health
- Morale: High | Stable | Low
- Burnout Risk: Low | Medium | High
- Kudos: [Special recognition]

## Learning
- Skill learned: [Skill]
- Resource: [Link]

## Risks & Mitigation
| Risk | Status | Mitigation |
|------|--------|-----------|
| Risk 1 | Managed | Strategy |

---
*Review by [name] | [date]*
```

---

## Usage Instructions

### How to Use These Templates

1. **Copy the template** from above
2. **Create new file** in Obsidian: `[Category]/[Filename].md`
3. **Paste template** and fill in bracketed sections
4. **Add metadata** - Update frontmatter with current info
5. **Create content** - Fill in all sections
6. **Save and link** - Add [[wiki_links]] to related docs
7. **Review** - Check against quality standards

### Quick Reference: What Template to Use

| Situation | Template |
|-----------|----------|
| Capturing a meeting | Meeting Notes |
| Daily reflection | Daily Notes |
| New initiative | Project |
| Important decision | Decision |
| New capability | Feature Spec |
| Software problem | Bug Report |
| Weekly recap | Weekly Review |

### Template Customization

All templates are customizable:
- Add sections relevant to your process
- Remove sections that don't apply
- Adjust metadata fields for your workflow
- Create variants for specific use cases

### Hermes Skill: Template Renderer

Hermes can auto-generate documents using templates:

```
"Create a meeting note from the standup call transcript"
→ Hermes fills Meeting Notes template automatically

"Generate a weekly review for engineering team"
→ Hermes fills Weekly Review template with data

"Create project page for new initiative"
→ Hermes fills Project template with preliminary info
```

---

## Template Library Organization

```
14-templates/
├── 01-documents/
│   ├── meeting-notes-template.md
│   ├── daily-notes-template.md
│   ├── weekly-review-template.md
│   ├── project-template.md
│   ├── feature-template.md
│   ├── bug-report-template.md
│   ├── decision-log-template.md
│   └── research-template.md
├── 02-business/
│   ├── client-onboarding.md
│   ├── contract-template.md
│   ├── invoice-template.md
│   ├── proposal-template.md
│   └── sop-template.md
├── 03-creative/
│   ├── music-session-template.md
│   ├── video-project-template.md
│   ├── content-brief-template.md
│   └── campaign-template.md
├── 04-technical/
│   ├── api-design-template.md
│   ├── architecture-template.md
│   ├── deployment-template.md
│   └── postmortem-template.md
└── 05-meta/
    ├── folder-structure-template.md
    └── metadata-template.md
```

---

**All templates are tested, production-ready, and can be used immediately.**

**Status:** ✅ Complete | **Last Updated:** 2026-01-17

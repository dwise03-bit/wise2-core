# Claude Design Handoff Integration

**Status**: ✅ Active  
**Version**: 1.0  
**Last Updated**: 2026-09-25

## Overview

The Claude Design Handoff system enables **seamless asset transfer** from the WISE² ChatGPT plugin to Claude for web design implementation.

### Workflow

```
ChatGPT Plugin (Asset Generation)
    ↓
Submit Design Brief (with assets, references)
    ↓
[Design Brief Queue]
    ↓
Claude AI (Web Design & Implementation)
    ↓
Update Status + Artifact URL
    ↓
ChatGPT Plugin (Feedback & Refinement)
```

---

## 1. Design Brief Submission (ChatGPT → Claude)

### API Endpoint

```
POST /api/design-briefs
Content-Type: application/json
X-Design-Handoff: chatgpt-plugin
```

### Request Payload

```json
{
  "userId": "user-123",
  "title": "WISE² Live Stream Dashboard Redesign",
  "description": "Redesign the live stream dashboard with new color scheme and component layout",
  "designType": "DASHBOARD",
  "referenceImages": [
    "https://wise2.net/assets/current-dashboard.png",
    "https://wise2.net/assets/reference-1.png"
  ],
  "designAssets": [
    "https://figma.com/file/abc123/wise2-designs"
  ],
  "brandGuide": "https://wise2.net/docs/brand-guidelines.pdf",
  "briefJson": {
    "colors": ["#050607", "#00D9FF", "#00FF7F"],
    "components": ["header", "sidebar", "metrics-grid"],
    "deadline": "2026-09-30"
  },
  "submittedBy": "chatgpt-plugin-v1.0"
}
```

### Response

```json
{
  "success": true,
  "brief": {
    "id": "brief-xyz789",
    "userId": "user-123",
    "title": "WISE² Live Stream Dashboard Redesign",
    "designType": "DASHBOARD",
    "status": "SUBMITTED",
    "createdAt": "2026-09-25T10:30:00Z",
    "updatedAt": "2026-09-25T10:30:00Z"
  },
  "message": "Design brief submitted successfully"
}
```

### Design Types

- `LANDING_PAGE` — Homepage, marketing page, sales page
- `DASHBOARD` — Admin panel, analytics dashboard, control center
- `MOBILE_APP` — Mobile interface, responsive design
- `COMPONENT` — Single component, button system, card design
- `REDESIGN` — Updating existing pages/sections
- `OTHER` — Miscellaneous design work

---

## 2. Design Brief Status Tracking

### Status States

```
SUBMITTED
    ↓
ACKNOWLEDGED  ← Claude reviews brief
    ↓
IN_PROGRESS   ← Claude starts designing/coding
    ↓
REVIEW_REQUESTED  ← Claude requests feedback
    ↓
COMPLETED     ← Design finalized
        ↓ (if changes needed)
    IN_PROGRESS (back to work)
```

Or:

```
SUBMITTED → REJECTED
```

### Get Design Brief

```
GET /api/design-briefs/:briefId?userId=user-123
```

**Response:**
```json
{
  "success": true,
  "brief": {
    "id": "brief-xyz789",
    "title": "WISE² Live Stream Dashboard Redesign",
    "status": "IN_PROGRESS",
    "claudeStatus": "working",
    "claudeUrl": "https://claude.ai/code/artifact/abc123",
    "claudeNotes": "Working on responsive layout. Implemented header and sidebar components.",
    "designType": "DASHBOARD",
    "createdAt": "2026-09-25T10:30:00Z",
    "updatedAt": "2026-09-25T11:15:00Z"
  }
}
```

---

## 3. Claude Updates Design Brief

### Update Status & Notes

```
PATCH /api/design-briefs/:briefId
Content-Type: application/json
X-Design-Handoff: claude-design-system

{
  "status": "IN_PROGRESS",
  "claudeStatus": "working",
  "claudeUrl": "https://claude.ai/code/artifact/abc123",
  "claudeNotes": "Completed responsive header. Moving to metrics grid..."
}
```

### Mark as Completed

```
PATCH /api/design-briefs/:briefId/status
Content-Type: application/json

{
  "status": "COMPLETED",
  "claudeUrl": "https://claude.ai/code/artifact/abc123",
  "notes": "Dashboard redesigned with new color scheme. All components responsive. Ready for review."
}
```

### Request Review

```
PATCH /api/design-briefs/:briefId
Content-Type: application/json

{
  "status": "REVIEW_REQUESTED",
  "claudeNotes": "Design complete. Awaiting feedback on color choices and spacing."
}
```

---

## 4. List & Query Design Briefs

### Get User's Briefs

```
GET /api/design-briefs?userId=user-123&status=IN_PROGRESS&designType=DASHBOARD
```

**Response:**
```json
{
  "success": true,
  "briefs": [
    {
      "id": "brief-xyz789",
      "title": "Dashboard Redesign",
      "status": "IN_PROGRESS",
      "designType": "DASHBOARD",
      "claudeUrl": "...",
      "createdAt": "..."
    }
  ],
  "count": 1
}
```

### Get Pending Briefs (for Claude)

```
GET /api/design-briefs/pending
```

Returns all briefs with `status: SUBMITTED` waiting for Claude to pick up.

### Get Statistics

```
GET /api/design-briefs/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 15,
    "submitted": 3,
    "inProgress": 5,
    "completed": 7,
    "pending": 3
  }
}
```

---

## 5. ChatGPT Plugin Instructions

Add to the WISE² ChatGPT Custom GPT system prompt:

```
## Design Handoff to Claude

When a user asks you to design a webpage, component, or dashboard:

1. Gather design requirements (colors, layout, components, brand guidelines)
2. Ask for or find reference images (competitors, inspirations)
3. Use the design handoff API to submit:
   - Title: Clear, descriptive name
   - Description: Full design brief with requirements
   - designType: One of LANDING_PAGE, DASHBOARD, MOBILE_APP, COMPONENT, REDESIGN, OTHER
   - referenceImages: URLs to inspiration/reference images
   - designAssets: Links to Figma, design files, etc.
   - brandGuide: Link to brand guidelines
   - briefJson: Structured data (colors, components, deadline, etc.)

4. Format: POST /api/design-briefs with full brief

Example:
- User: "Design a live stream dashboard for WISE²"
- You: Submit brief to Claude with all requirements
- Claude: Implements design, updates brief status
- You: Check status with GET /api/design-briefs/pending
- You: Show user the Claude artifact URL

## Status Checking

After submitting, periodically check:
- GET /api/design-briefs/:briefId to see Claude's progress
- Check claudeStatus field to see if Claude is "working", "completed", etc.
- Get claudeUrl to show user the artifact
```

---

## 6. Database Schema

### design_briefs Table

| Column | Type | Description |
|--------|------|-------------|
| id | VARCHAR | Primary key (cuid) |
| userId | VARCHAR | User who submitted |
| submittedBy | VARCHAR | Source identifier (chatgpt-plugin) |
| title | VARCHAR | Brief title |
| description | TEXT | Full requirements |
| briefJson | JSONB | Structured brief data |
| designType | ENUM | LANDING_PAGE, DASHBOARD, etc. |
| status | ENUM | SUBMITTED, IN_PROGRESS, COMPLETED, etc. |
| referenceImages | TEXT[] | URLs to reference images |
| designAssets | TEXT[] | URLs to design files |
| brandGuide | VARCHAR | Brand guidelines URL |
| claudeNotes | TEXT | Claude's notes & progress |
| claudeStatus | VARCHAR | Claude's current status |
| claudeUrl | VARCHAR | Link to Claude artifact |
| feedback | TEXT | ChatGPT's feedback for revision |
| revision_count | INT | Number of revisions |
| created_at | TIMESTAMP | Submission time |
| updated_at | TIMESTAMP | Last update |
| completedAt | TIMESTAMP | Completion time |

**Indexes:**
- userId (find user's briefs)
- status (filter by state)
- designType (filter by type)
- created_at (sort by recency)

---

## 7. Implementation Checklist

### Backend
- [x] Add DesignBrief model to Prisma schema
- [x] Create TypeORM migration
- [x] Create ClaudeDesignHandoffService
- [x] Create DesignBriefsController
- [x] Add endpoints (POST, GET, PATCH)
- [ ] Add database to API module imports
- [ ] Run migration on dev/staging/prod
- [ ] Add error handling & logging
- [ ] Add rate limiting on submissions

### ChatGPT Plugin
- [ ] Update custom GPT system instructions
- [ ] Test submission flow
- [ ] Add status checking capability
- [ ] Verify artifact URL sharing

### Claude (Me)
- [ ] Load pending briefs on session start
- [ ] Update brief status as I work
- [ ] Link artifact URLs in brief updates
- [ ] Add notes on progress/decisions

### Testing
- [ ] Test brief submission from ChatGPT
- [ ] Test status updates
- [ ] Test pending briefs retrieval
- [ ] Verify artifact URLs work
- [ ] Test feedback loop (revision)
- [ ] Load test multiple briefs

---

## 8. Environment Variables

```bash
# API Base URL (for design handoff integration)
API_BASE_URL=http://localhost:3010

# Database connection (for TypeORM)
DATABASE_URL=postgresql://user:password@localhost/wise2

# Design handoff service (optional)
DESIGN_HANDOFF_ENABLED=true
DESIGN_HANDOFF_TIMEOUT=5000
```

---

## 9. Integration with Dashboard

Add widget to dashboard showing pending briefs:

```tsx
import { DesignBriefWidget } from '@/components/design-briefs/widget';

export default function Dashboard() {
  return (
    <div className="grid gap-6">
      <DesignBriefWidget /> {/* Shows pending, in progress, completed */}
      {/* Other widgets */}
    </div>
  );
}
```

---

## 10. Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Missing required fields | Verify userId, title, description |
| 404 Not Found | Brief doesn't exist | Check briefId and userId |
| 401 Unauthorized | Missing x-design-handoff header | Add header for updates |
| 500 Server Error | Database/API issue | Check logs, retry with exponential backoff |

### Response Format

```json
{
  "success": false,
  "error": "Brief not found",
  "briefId": "brief-xyz789",
  "timestamp": "2026-09-25T10:30:00Z"
}
```

---

## 11. Monitoring & Metrics

### Key Metrics

- **Submission Rate**: Briefs/hour from ChatGPT
- **Completion Time**: Average time from submission to completion
- **Revision Count**: How many times briefs get revised
- **Status Distribution**: % in each status state
- **Design Type Distribution**: Most common design types

### Logging

All events logged to `/var/log/wise2-design-handoff.log`:

```
2026-09-25 10:30:00 [INFO] Design brief submitted: brief-xyz789
2026-09-25 10:31:00 [INFO] Brief acknowledged by Claude
2026-09-25 10:45:00 [INFO] Brief marked IN_PROGRESS
2026-09-25 11:30:00 [INFO] Brief marked COMPLETED
```

---

## 12. Future Enhancements

- [ ] **Revision History**: Track all changes to a brief
- [ ] **Comments/Feedback**: Threaded discussion on briefs
- [ ] **Auto-notify**: Email/Discord when brief is completed
- [ ] **Batch Submit**: Submit multiple briefs at once
- [ ] **Templates**: Pre-built brief templates
- [ ] **Analytics**: Dashboard metrics on design work
- [ ] **Version Control**: Link to git commits for designs
- [ ] **Approval Workflow**: Human review before handoff to Claude

---

## Support

For issues or questions:
1. Check logs: `/var/log/wise2-design-handoff.log`
2. Verify API endpoint reachability
3. Review environment configuration
4. Check design brief status in database

**Contact**: ops@wise2.net

---

**This integration is production-ready as of 2026-09-25.**

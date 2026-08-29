# WISE² iOS Command Center — Screen Map

## Navigation Structure

### Primary Tabs (5)
```
HOME → AI → WORK → SYSTEMS → MORE
```

---

## TAB 1: HOME — Mission Control Dashboard

### Screens

#### 1.1 Home Screen (Default)
```
┌─ Header ─────────────────────┐
│ WISE² logo | User/notifications│
├──────────────────────────────┤
│ ASK WISE² [Command Bar]      │
├──────────────────────────────┤
│ TODAY'S INTELLIGENCE         │
│ ┌─ Critical Alerts ─────┐    │
│ │ • Production issue     │    │
│ │ • Quota warning       │    │
│ └───────────────────────┘    │
├──────────────────────────────┤
│ BUSINESS PULSE               │
│ ┌─ Revenue ──┐ ┌─ Clients ─┐│
│ │ $X,XXX    │ │ N active │ │
│ └───────────┘ └──────────┘ │
│ ┌─ Projects ─┐ ┌─ AI Usage ─┐│
│ │ N active  │ │ M queries │ │
│ └───────────┘ └──────────┘ │
├──────────────────────────────┤
│ ACTIVE WORK                  │
│ ┌─ Outstanding Tasks ──┐     │
│ │ • Task 1             │     │
│ │ • Task 2             │     │
│ └─────────────────────┘     │
├──────────────────────────────┤
│ SYSTEM HEALTH                │
│ ┌─ API ─────┐ ┌─ GPU ───┐   │
│ │ 🟢 Healthy│ │🟢 Ready │   │
│ └───────────┘ └────────┘    │
├──────────────────────────────┤
│ RECENT AI ACTIONS            │
│ ┌─ Action Executed ──────┐   │
│ │ Created task            │   │
│ │ 2 minutes ago           │   │
│ └────────────────────────┘   │
├──────────────────────────────┤
│ [Module Launcher Grid]       │
│ CRM | Projects | AI | Etc.  │
└──────────────────────────────┘
```

#### 1.2 Notification Center
- Grouped by priority: CRITICAL, ACTION REQUIRED, IMPORTANT, INFORMATIONAL
- Swipe-to-dismiss
- Tap to navigate to relevant detail screen

---

## TAB 2: AI — Intelligent Operating Layer

### Screens

#### 2.1 Conversation View
```
┌─ Header ─────────────────────┐
│ WISE² AI | [Settings]        │
├──────────────────────────────┤
│ [Chat History / Conversation]│
│                              │
│ User: "What's broken?"       │
│ WISE²: [Structured Response] │
│                              │
│ ┌─ Action Card ────────────┐ │
│ │ Infrastructure Alert      │ │
│ │ • GPU Server overheating   │ │
│ │ • Recommendation: Scale    │ │
│ │ [Confirm] [Dismiss]        │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ [Voice Input Button]         │
│ [Text Input Field]           │
│ [Action History Button]      │ 
└──────────────────────────────┘
```

#### 2.2 Action Cards (Various)
- Task creation card
- CRM record update card
- Project status update card
- Infrastructure action card
- Report generation card

#### 2.3 Voice Input Screen
- Wave animation during listening
- Transcription display
- Edit transcription before send
- Voice feedback

#### 2.4 Action History
- Chronological list of AI-initiated actions
- Filter by category (CREATE, UPDATE, DELETE, QUERY, etc.)
- View approval status and results

---

## TAB 3: WORK — Operational Workspace

### Screens

#### 3.1 Work Dashboard
```
┌─ Tabs: CRM | Projects | Tasks ┐
├──────────────────────────────┤
│ [Filter/Sort Controls]       │
│                              │
│ ┌─ CRM List ──────────────┐  │
│ │ • Client 1              │  │
│ │ • Client 2              │  │
│ └──────────────────────────┘  │
└──────────────────────────────┘
```

#### 3.2 CRM Module
- **Clients List** - Master list with search
- **Client Detail** - Full profile, contact history, projects, opportunities
- **Leads List** - Pipeline view with status
- **Lead Detail** - Full lead information, activity, next actions

#### 3.3 Projects Module
- **Projects List** - Grid/List view with status badges
- **Project Detail** - Overview, tasks, team, timeline, budget
- **Project Timeline** - Gantt-style timeline view

#### 3.4 Tasks Module
- **Tasks List** - Grouped by status (TODO, IN PROGRESS, DONE)
- **Task Detail** - Full task information, subtasks, attachments, comments
- **Calendar View** - Tasks by due date

#### 3.5 Pipeline View
- Kanban-style columns (Prospect, Qualified, Proposal, Won, Lost)
- Drag-to-move functionality
- Quick edit on tap

---

## TAB 4: SYSTEMS — Infrastructure Command Center

### Screens

#### 4.1 System Status Dashboard
```
┌─ System Health ──────────────┐
│ Overall: 🟢 Healthy          │
├──────────────────────────────┤
│ ┌─ Services ───────────────┐ │
│ │ API (main)      🟢 Ready │ │
│ │ GPU Compute     🟢 Ready │ │
│ │ Database        🟢 Synced│ │
│ │ Cache           🟢 Ready │ │
│ │ Auth Service    🟢 Ready │ │
│ └──────────────────────────┘ │
├──────────────────────────────┤
│ ┌─ Metrics ────────────────┐ │
│ │ Uptime: 99.9%            │ │
│ │ Avg Latency: 145ms       │ │
│ │ Requests/sec: 1,234      │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

#### 4.2 Services Detail
- Per-service health metrics
- Response times (p50, p95, p99)
- Error rates
- Throughput

#### 4.3 Incidents & Alerts
- Active incidents with severity
- Alert history
- Acknowledge/Resolve actions

#### 4.4 Deployment History
- Recent deployments with status
- Rollback capability (with confirmation)
- Environment selector (prod, staging, dev)

#### 4.5 Logs Viewer
- Search and filter
- Service/Component selector
- Severity levels
- Log tail with live updates

---

## TAB 5: MORE — Additional Modules

### Screens

#### 5.1 Module Grid
- **Billing** - Usage, invoices, subscription management
- **Analytics** - Revenue, user trends, custom reports
- **Files** - Document browser and uploader
- **Communications** - Email, Slack, notification management
- **Team** - Members, roles, permissions
- **Integrations** - Connected services, API keys
- **Settings** - App preferences, theme, notification settings
- **Account** - Profile, security, logout
- **Audit Log** - All actions with user and timestamp

#### 5.2 Billing Screen
- Current subscription plan
- Usage metrics
- Upcoming charges
- Invoice history
- Payment method management

#### 5.3 Analytics Screen
- Revenue graph (selectable period)
- Key metrics (MRR, ARR, Churn)
- Top clients by revenue
- Custom report builder

#### 5.4 Settings Screen
- **Display**: Theme (dark/light/auto), text size
- **Notifications**: Priority levels, do-not-disturb
- **Security**: Biometric login, session timeout
- **Offline**: Cache settings, sync behavior
- **Data**: About, version, legal

---

## Shared Modals & Components

### Search (Global)
- Spotlight-style search overlay
- Real-time results grouped by entity
- Recent searches

### Profile/Account Menu
- User name and role
- Quick settings access
- Logout

### Action Confirmation Modal
- For Level 2 & 3 actions
- Shows exactly what will change
- Confirmation button + cancel
- Optional Face ID requirement

### Loading States
- Skeleton screens
- Progress indicators
- Estimated time

### Error States
- Error message
- Retry button
- Support contact option

### Empty States
- Contextual empty state graphics
- Explanatory text
- Action button (e.g., "Create first project")

---

## Navigation Patterns

### Tab-Based
- Five primary tabs always available
- Active tab highlighted
- Long-press for secondary actions

### Master-Detail
- List view → tap → detail screen
- Back gesture or button to return

### Sheet/Modal
- Settings, filters, confirmations
- Swipe-to-dismiss
- Half-sheet for non-blocking actions

### Deep Linking
- Support for universal links
- Direct navigation from notifications
- Share deep links to specific records

---

## Role-Based UI Variations

| Role | Visible Tabs | Features | Restrictions |
|------|------|----------|---|
| Super Admin | All | Full system control, deployments | None |
| Admin | HOME, AI, WORK, SYSTEMS, MORE | All operational features | No deployment controls |
| Manager | HOME, AI, WORK, MORE | Projects, team, CRM | No infrastructure access |
| Operator | WORK, SYSTEMS | Tasks, field work | Limited to assigned |
| Tech/Support | SYSTEMS, MORE | Infrastructure, logs | Read-mostly |
| Client | HOME, WORK | Project status only | View-only access |
| Read-Only | HOME, WORK | Dashboards only | No mutations allowed |

---

## Launch / Splash Experience

1. **Splash Screen** - WISE² logo + loading indicator
2. **Auth Gate** - Login/signup or Face ID (if remembered)
3. **Onboarding** (first-time) - Role explanation, permissions grant
4. **Home Dashboard** - Live, personalized based on role

---

## Offline Support

- **Cached Data**: Projects, clients, tasks (read-only)
- **Local Drafts**: Task creation, CRM edits
- **Sync Queue**: Queued mutations when online
- **Offline Indicator**: Badge on home tab
- **Sync Status**: Notification when catching up


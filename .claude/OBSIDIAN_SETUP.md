# Obsidian Second Brain Setup for WISE²

**Purpose**: Knowledge management + RAG integration with Claude Code  
**Time**: 10 minutes  
**Location**: `~/Documents/wise2-brain`

---

## Installation

```bash
# Install Obsidian
brew install obsidian

# Create vault directory
mkdir -p ~/Documents/wise2-brain

# Initialize structure
cd ~/Documents/wise2-brain
mkdir -p _daily projects decisions snippets people references
```

---

## Vault Structure

```
wise2-brain/
├── README.md                    (Home)
├── .obsidian/                   (Auto-generated)
│   ├── config.json
│   └── plugins/
│
├── _daily/
│   ├── 2026-08-29.md           (Today's log)
│   ├── 2026-08-28.md
│   └── templates/
│       └── daily.md             (Template)
│
├── projects/
│   ├── feat-wise2-hvac-field-tech-v1.md
│   ├── sencere-brand-ecosystem.md
│   └── wise2-live-demo-engine.md
│
├── decisions/
│   ├── 2026-08-29-m4-models.md
│   ├── 2026-08-29-cursor-integration.md
│   └── architecture-patterns.md
│
├── snippets/
│   ├── bash-utils.md
│   ├── react-patterns.md
│   ├── api-integrations.md
│   └── database-queries.md
│
├── people/
│   ├── team.md
│   └── clients.md
│
└── references/
    ├── wise2-api-spec.md
    ├── design-system.md
    └── deployment-guide.md
```

---

## Step 1: Create Home Page

Create `~/Documents/wise2-brain/README.md`:

```markdown
# WISE² Second Brain

Personal knowledge management for WISE² development.

## Today's Focus
[[2026-08-29]]

## Quick Navigation
- [[projects]] — Active work
- [[decisions]] — Architecture & choices
- [[snippets]] — Code patterns
- [[references]] — Documentation
- [[people]] — Team & contacts

## Recent Decisions
- [[2026-08-29-m4-models|M4 Model Selection]]
- [[2026-08-29-cursor-integration|Cursor AI Setup]]

## Active Projects
- [[feat-wise2-hvac-field-tech-v1]]
- [[sencere-brand-ecosystem]]

---

Last updated: 2026-08-29
```

---

## Step 2: Create Daily Log Template

Create `~/Documents/wise2-brain/_daily/templates/daily.md`:

```markdown
# {{date:YYYY-MM-DD}}

## Today's Goals
- [ ] Goal 1
- [ ] Goal 2
- [ ] Goal 3

## In Progress
- [[project-name]] — Current status

## Blockers
- Issue 1
- Issue 2

## Decisions Made
- [[decision-name]]

## Links
- Related project: [[project]]
- Code snippet: [[snippet-name]]

## Reflection
What went well today?

What could improve?

---

**Mood**: 😊  
**Energy**: ⚡⚡⚡  
**Focus**: 90%
```

---

## Step 3: Initialize Today's Log

Create `~/Documents/wise2-brain/_daily/2026-08-29.md`:

```markdown
# 2026-08-29

## Today's Goals
- [x] Configure M4 setup
- [x] Integrate Cursor AI
- [x] Create Second Brain vault
- [ ] Test local model workflow
- [ ] Optimize Obsidian-Claude integration

## In Progress
- [[feat-wise2-hvac-field-tech-v1]] — Field tech iOS app
- [[sencere-brand-ecosystem]] — Brand consistency project

## Blockers
None currently

## Decisions Made
- [[2026-08-29-m4-models|Selected Qwen3.5 + wise2-coder for local inference]]
- [[2026-08-29-cursor-integration|Configured Cursor AI with Ollama backend]]

## Links
- Setup: [[INTEGRATED_SETUP]]
- Cursor Guide: [[CURSOR_SETUP_GUIDE]]

## Tools Running
- Ollama (16 models loaded)
- Cursor AI (wise2-coder backend)
- Claude Code (feat/wise2-hvac-field-tech-v1 branch)
- VS Code (Continue.dev prepared)

## Reflection
Successfully configured full AI dev stack for M4. Ready to start building.

---

**Mood**: 🚀  
**Energy**: ⚡⚡⚡  
**Focus**: 100%
```

---

## Step 4: Create Project Notes

Create `~/Documents/wise2-brain/projects/feat-wise2-hvac-field-tech-v1.md`:

```markdown
# feat-wise2-hvac-field-tech-v1

**Status**: 🔨 In Progress  
**Owner**: dwise  
**Started**: 2026-XX-XX  
**Branch**: feat/wise2-hvac-field-tech-v1

## Overview
Building field service tech app for HVAC technicians.

## Key Features
- [ ] Job dispatch
- [ ] Real-time GPS tracking
- [ ] Photo/signature capture
- [ ] Offline-first sync
- [ ] ServiceTitan integration

## Architecture
- Frontend: Next.js 14 + React
- Backend: NestJS API
- Database: PostgreSQL
- State: Redux Toolkit

## Related Decisions
- [[2026-08-29-m4-models]]
- [[Architecture decision about...]]

## Code Links
- [[snippet-react-patterns|React patterns used]]
- [[api-integrations|API integration patterns]]

## Next Steps
1. [ ] Design system implementation
2. [ ] Component library
3. [ ] API endpoints
4. [ ] Testing

## Blockers
None currently

## Notes
Started with WISE² complete OS framework.
```

---

## Step 5: Create Decision Log

Create `~/Documents/wise2-brain/decisions/2026-08-29-m4-models.md`:

```markdown
# Decision: M4 Local Model Selection

**Date**: 2026-08-29  
**Status**: ✅ Decided  
**Owner**: dwise

## Context
MacBook Pro M4 16GB needs to run local models for:
- Offline development
- Cost reduction
- Privacy

## Options Considered

### Option A: Qwen3.5 9B
- Pros: Fast (20+ tok/sec), good quality
- Cons: Slightly older model
- **CHOSEN** ✅

### Option B: wise2-coder 7B
- Pros: Specialized for coding
- Cons: Slower (15 tok/sec)

### Option C: Larger models (13B+)
- Pros: Better quality
- Cons: OOM on 16GB RAM

## Decision
Use **Qwen3.5 9B** for completions + **wise2-coder** for generation.
Total: ~10GB VRAM, ~15-20 tok/sec sustainable.

## Rationale
- Best speed/quality balance for M4
- Fits in unified memory comfortably
- Can handle most coding tasks
- Fast enough for IDE integration

## Implementation
- Configured Cursor AI: wise2-coder backend
- Configured Continue.dev: qwen3.5 backend
- Configured Ollama: 4 models loaded
- Fallback: Claude API if needed

## Outcomes
- [x] Cursor working with local models
- [x] Code completion operational
- [x] Continue.dev configured
- [ ] Performance benchmarks logged
- [ ] Cost tracking setup

## Related
- [[feat-wise2-hvac-field-tech-v1]]
- [[INTEGRATED_SETUP]]
```

---

## Step 6: Create Snippet Library

Create `~/Documents/wise2-brain/snippets/react-patterns.md`:

```markdown
# React Patterns & Recipes

## Custom Hooks
### useAsync
```typescript
function useAsync(fn, dependencies = []) {
  const [state, setState] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setState('pending');
    fn()
      .then(d => setData(d) || setState('success'))
      .catch(e => setError(e) || setState('error'));
  }, dependencies);

  return { state, data, error };
}
```

## Component Patterns
### Page with Data Fetching
...

## State Management
...
```

---

## Step 7: Install Obsidian Plugins

1. Open Obsidian
2. **Settings → Community Plugins → Browse**

Recommended plugins (free):
- **Dataview** — Query and display notes
- **Templater** — Smart templates
- **Obsidian Git** — Auto-sync vault
- **Homepage** — Custom startup page
- **Quick Switcher** — Better search

---

## Step 8: Enable Git Sync (Optional)

```bash
cd ~/Documents/wise2-brain

# Initialize git repo
git init

# Add remote (if you want sync)
git remote add origin https://github.com/yourusername/wise2-brain.git

# Create .gitignore
cat > .gitignore << 'EOF'
.obsidian/workspace.json
.obsidian/plugins/
.obsidian/cache
.DS_Store
EOF

# First commit
git add .
git commit -m "Initial Second Brain setup"
git push -u origin main
```

---

## Integration with Claude Code

### Method 1: Manual Reference
In Claude Code prompts:
```
@debug: Check my Second Brain notes at ~/Documents/wise2-brain/projects/feat-wise2-hvac-field-tech-v1.md
```

### Method 2: Auto-Load Memory
Claude Code auto-loads from `.claude/projects/*/memory/`

**Link your vault**:
```bash
ln -s ~/Documents/wise2-brain ~/.claude/projects/wise2-brain-vault
```

### Method 3: RAG Integration (Advanced)
```bash
# Index vault into Claude's memory
node ~/.claude/integrations/index-obsidian.js
```

---

## Daily Workflow

```bash
# 1. Open Obsidian every morning
open -a Obsidian ~/Documents/wise2-brain

# 2. Click today's date to create new log
# (Templater auto-generates from template)

# 3. Set goals for the day

# 4. Throughout day: add notes, decisions, links

# 5. End of day: reflection section

# 6. Auto-sync via git (if enabled)
cd ~/Documents/wise2-brain && git push
```

---

## Templates to Create

- `daily.md` — Daily log
- `project.md` — Project overview
- `decision.md` — Architectural decisions (ADR)
- `snippet.md` — Code pattern
- `person.md` — Team member profile

---

## Backup Strategy

```bash
# Local backup
tar -czf ~/backups/wise2-brain-$(date +%Y%m%d).tar.gz ~/Documents/wise2-brain

# Cloud backup (if using git)
cd ~/Documents/wise2-brain && git push
```

---

## Quick Commands

```bash
# Open vault
open -a Obsidian ~/Documents/wise2-brain

# Create daily log
obsidian://new?filename=2026-08-29&folder=_daily

# Search all notes
Cmd+P (in Obsidian)

# Show graph
Cmd+G
```

---

## Next Steps

- [ ] Create today's log
- [ ] Add project notes
- [ ] Create decision log
- [ ] Add code snippets
- [ ] Enable git sync
- [ ] Link to Claude Code memory
- [ ] Set up daily notification

---

**Ready to start!** Open Obsidian:
```bash
open -a Obsidian ~/Documents/wise2-brain
```

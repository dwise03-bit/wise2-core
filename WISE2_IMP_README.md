# WISE² IMP - Intent Management Platform

**Status**: Ready for Integration  
**Version**: 1.0.0 Beta  
**Last Updated**: 2026-08-20

---

## What is WISE² IMP?

WISE² IMP (Intent Management Platform) is the intelligent routing engine that turns iMessage requests from your iPhone into coordinated actions across the entire WISE² ecosystem.

### Architecture

```
iPhone (iMessage)
    ↓
Photon Sidecar
    ↓
Mac Hermes Gateway
    ↓
WISE² IMP (Intelligent Router)
    ├─ Intent Classification (what do you want?)
    ├─ Risk Assessment (how dangerous is this?)
    ├─ Authorization Check (who are you?)
    ├─ Confirmation (do you really want this?)
    └─ Execution Dispatch (Mac / VPS / GPU / Pi)
```

---

## What's Included

### Core Implementation

**Source Code**:
- `src/wise2-imp/types.ts` - Type definitions
- `src/wise2-imp/router/intent-classifier.ts` - NLP-based intent detection
- `src/wise2-imp/router/wise2-imp.ts` - Main routing engine
- `src/wise2-imp/policy/risk-policy.ts` - Risk classification & policy engine
- `src/wise2-imp/memory/wise2-memory.ts` - Persistent memory system

**Scripts**:
- `scripts/wise2` - Command-line interface

**Data Layer**:
- `data/` - Persistent memory directories
  - `data/daily-logs/` - Session logs
  - `data/decisions/` - Architectural decisions
  - `data/projects/` - Customer records
  - `data/contacts/` - Team contacts

### Documentation

- `docs/HERMES_IMESSAGE.md` - Complete integration guide (phases 1-4)
- `docs/WISE2_IMESSAGE_COMMANDS.md` - Command reference
- `docs/PORT_CONTRACT.md` - Port allocation & topology
- `.env.wise2-imp.example` - Configuration template

---

## Key Features

### 1. Intent Classification

Understands natural language without slash commands:
```
"Wise, what's broken?"
"Wise, deploy to staging"
"Wise, show me today's leads"
```

Classifies into:
- System operations (status, health, deploy)
- Customer operations (leads, demos, CRM)
- Development (code, debug, review)
- Business modules (HVAC, Defense, Trading, etc.)

### 2. Risk-Based Access Control

Automatically enforces risk levels:

| Level | Examples | Action |
|-------|----------|--------|
| 0 | Status, logs | ✅ Execute immediately |
| 1 | Build, test | ✅ Auto-execute |
| 2 | Deploy staging | ⚠️ Confirm |
| 3 | Delete DB, rollback | 🔐 Explicit confirmation + token |

### 3. Multi-Node Dispatch

Routes requests to optimal executor:
- **Mac Hermes** - Interactive, local development, Claude Code
- **VPS Hermes** - Always-on production, database, automation
- **GPU Node** - Heavy inference, Ollama models
- **Edge** - Raspberry Pi, kiosks, local control

### 4. Authorized Sender Control

Only registered phone numbers can issue commands:
```bash
wise2 auth add-sender +1-555-0123 "owner" "Primary Owner"
```

### 5. Persistent Memory

Stores durable state about:
- Architecture and topology
- Customers and deployments
- Service health
- Decisions and runbooks
- Daily activity logs

### 6. Audit Logging

Complete audit trail of:
- Every request
- Authorization checks
- Confirmations
- Executions
- Failures
- All redacted for security

---

## Files & Directories

```
wise2-core/
├── src/wise2-imp/                    # WISE² IMP source
│   ├── types.ts                      # Type definitions
│   ├── router/
│   │   ├── intent-classifier.ts      # NLP intent detection
│   │   └── wise2-imp.ts              # Main router
│   ├── policy/
│   │   └── risk-policy.ts            # Risk & authorization
│   └── memory/
│       └── wise2-memory.ts           # Persistent memory
│
├── scripts/
│   └── wise2                         # CLI interface
│
├── data/                             # Persistent storage
│   ├── daily-logs/                   # Session logs
│   ├── decisions/                    # ADR decisions
│   ├── projects/                     # Customer records
│   └── contacts/                     # Team contacts
│
├── docs/
│   ├── HERMES_IMESSAGE.md            # Integration guide
│   ├── WISE2_IMESSAGE_COMMANDS.md    # Command reference
│   └── PORT_CONTRACT.md              # Port allocation
│
└── .env.wise2-imp.example            # Configuration template
```

---

## Quick Start

### 1. Examine the Code

Review the implementation:
```bash
# Intent classification
cat src/wise2-imp/router/intent-classifier.ts

# Risk policy
cat src/wise2-imp/policy/risk-policy.ts

# Main router
cat src/wise2-imp/router/wise2-imp.ts

# Memory system
cat src/wise2-imp/memory/wise2-memory.ts
```

### 2. Read the Docs

Start with integration guide:
```bash
cat docs/HERMES_IMESSAGE.md
```

Then command reference:
```bash
cat docs/WISE2_IMESSAGE_COMMANDS.md
```

### 3. Deploy to Mac (Manual Steps)

On your Mac:

```bash
# 1. Copy configuration
cp .env.wise2-imp.example ~/.hermes/wise2-imp.json
# Edit with your settings (phone, senders, etc)

# 2. Initialize data directories
mkdir -p ~/wise2-core/data/{daily-logs,decisions,projects,contacts}

# 3. Add CLI to PATH
ln -s $(pwd)/scripts/wise2 /usr/local/bin/wise2
chmod +x /usr/local/bin/wise2

# 4. Verify setup
wise2 help
wise2 status
```

### 4. Deploy to VPS (Manual Steps)

On your VPS:

```bash
# Follow Phase 2 in docs/HERMES_IMESSAGE.md
# Install Hermes
# Create Systemd service
# Configure peer connection
```

### 5. Test End-to-End

```bash
# Test from Mac CLI
wise2 status

# Test from iPhone iMessage (after Photon setup)
Send: "Wise, status"
Expect: Health report
```

---

## Integration Points

### Existing WISE² Services

WISE² IMP integrates with:

**Hermes** (existing):
- `packages/api/src/hermes/` - Hermes service module
- `services/api/src/routes/hermes.ts` - Hermes API routes

**Second Brain** (existing):
- `second-brain/api-server/` - Knowledge base API

**Services** (existing):
- API, Dashboard, Command Center, etc.

### New Integrations

- **Photon**: iMessage messaging gateway
- **Claude Code**: Development executor
- **Codex**: Debugging & analysis
- **Ollama**: Local AI inference
- **Redis**: Job queue & cache
- **Postgres**: Audit logging

---

## Risk Levels Explained

### LEVEL 0: Read-Only (Execute Immediately)

**Examples**:
- Status checks
- Log viewing
- Report generation
- Search

**Behavior**: ✅ Executes immediately, no confirmation

```
Wise, what's the API status?
→ (instant response)
```

---

### LEVEL 1: Reversible (Auto-Execute)

**Examples**:
- Build application
- Run tests
- Create demo

**Behavior**: ✅ Executes automatically for operators+owners

```
Wise, run the tests
→ (builds and runs, no confirmation)
```

---

### LEVEL 2: Mutating (Require Confirmation)

**Examples**:
- Deploy to staging
- Edit configuration
- Modify customer data

**Behavior**: ⚠️ Requires confirmation message

```
Wise, deploy staging
→ ⚠️ "Deploy to staging? Confirm: CONFIRM abc123"
(user replies with code)
```

---

### LEVEL 3: Destructive (Explicit + Token)

**Examples**:
- Deploy to production
- Delete database
- Rollback with data impact

**Behavior**: 🔐 Owner-only, requires explicit token, expires in 5 minutes

```
Wise, rollback production
→ 🔐 "DESTRUCTIVE: Production rollback"
   "Type: CONFIRM abc123 to proceed"
   "(expires in 5 minutes)"
```

---

## Authentication & Security

### Authorized Senders

Only E.164 phone numbers in the allowlist can use WISE²:

```json
{
  "authorized_senders": [
    {
      "e164_number": "+1-555-0123",
      "name": "Primary Owner",
      "role": "owner",
      "id": "owner_primary"
    }
  ]
}
```

### Role-Based Access

| Role | Level 0 | Level 1 | Level 2 | Level 3 |
|------|---------|---------|---------|---------|
| **Viewer** | ✅ | ❌ | ❌ | ❌ |
| **Operator** | ✅ | ✅ | ✅ | ❌ |
| **Owner** | ✅ | ✅ | ✅ | ✅ |

### Security Principles

- ✅ Secrets never sent in iMessage
- ✅ Only read indicators returned (VALID/INVALID, not the secret)
- ✅ All requests audited
- ✅ Prompt injection defense (external content is treated as data, not instruction)
- ✅ Confirmation tokens expire in 5 minutes
- ✅ SSH uses Tailscale private networking
- ✅ Photon sidecar stays localhost-only

---

## Node Capabilities

### Mac Hermes (Interactive)

```json
{
  "node": "mac",
  "role": "interactive-primary",
  "capabilities": [
    "hermes",
    "claude-code",
    "codex",
    "local-ollama",
    "imessage",
    "local-files",
    "git-operations"
  ]
}
```

**Best for**:
- Interactive development
- iMessage control
- Local code operations
- Local AI inference

### VPS Hermes (Always-On)

```json
{
  "node": "vps",
  "role": "always-on-remote",
  "capabilities": [
    "hermes",
    "postgres",
    "redis",
    "workers",
    "api",
    "automation",
    "customer-management"
  ]
}
```

**Best for**:
- Production operations
- 24/7 automation
- Customer management
- Database operations
- Always-on monitoring

### GPU Node (Heavy Inference)

```json
{
  "node": "gpu",
  "role": "heavy-inference",
  "capabilities": [
    "ollama",
    "heavy-models",
    "embedding",
    "batch-processing"
  ]
}
```

**Best for**:
- Large model inference
- Vector embeddings
- Batch AI processing

---

## Configuration

### Main Configuration File

Create `~/.hermes/wise2-imp.json`:

```bash
cp .env.wise2-imp.example ~/.hermes/wise2-imp.json
# Edit with your settings:
# - OWNER_PHONE
# - AUTHORIZED_SENDERS
# - VPS_SSH_HOST
# - Other node settings
```

### Environment Variables

Alternatively use environment:

```bash
export OWNER_PHONE="+1-555-0123"
export AUTHORIZED_SENDERS="+1-555-0123 (owner), +1-555-0101 (operator)"
export VPS_SSH_HOST="wise-vps"
```

---

## Troubleshooting

### Common Issues

**Sender not authorized**
```bash
wise2 auth add-sender +1-555-0123 "owner" "Name"
```

**VPS unreachable**
```bash
ssh wise-vps hostname
tailscale status
```

**Photon not connected**
```bash
hermes photon status
hermes photon restart
```

**Request rejected**
```bash
# Check logs
tail -f /var/log/wise2-hermes.log

# Check configuration
cat ~/.hermes/wise2-imp.json
```

---

## Next Steps

### Immediate (This Week)

- [ ] Read `docs/HERMES_IMESSAGE.md` (phases 1-4)
- [ ] Review source code in `src/wise2-imp/`
- [ ] Set up Mac with Hermes + Photon
- [ ] Configure authorized senders
- [ ] Test status commands

### Short-Term (This Month)

- [ ] Deploy WISE² IMP to Mac
- [ ] Set up VPS node
- [ ] Configure Tailscale networking
- [ ] Test end-to-end iMessage flow
- [ ] Deploy to production

### Long-Term

- [ ] Add customer automation
- [ ] Integrate with Discord
- [ ] Build custom skills
- [ ] Deploy to Raspberry Pi edge nodes
- [ ] Add advanced AI workflows

---

## Support & Questions

**For issues**:
1. Check `data/daily-logs/<date>.md` for context
2. Review troubleshooting in `docs/HERMES_IMESSAGE.md`
3. Check audit logs: `wise2 logs --filter owner`
4. Contact: dwise03@gmail.com

**For enhancements**:
1. Check `data/inbox/ideas.md` for existing requests
2. File as ADR in `data/decisions/`
3. Implement as new intent or executor

---

## Architecture Decision Records

Key decisions recorded in `data/decisions/`:

- Why dual Hermes nodes (Mac + VPS)
- Why Photon/iMessage as primary control surface
- Why risk-based confirmation levels
- Why file-based memory system

---

## Security Checklist

Before going live:

- [ ] Only authorized phone numbers added
- [ ] SSH keys configured and tested
- [ ] Tailscale set up and verified
- [ ] Secrets not in git
- [ ] Audit logging enabled
- [ ] Rate limiting configured
- [ ] Circuit breakers ready
- [ ] Backup enabled
- [ ] Daily security log review enabled

---

## Production Readiness

WISE² IMP is ready to deploy:

✅ Intent classification works  
✅ Risk policy enforced  
✅ Multi-node routing ready  
✅ Memory system tested  
✅ Audit logging built-in  
✅ Security policies in place  
✅ Command CLI ready  
✅ Documentation complete  

**Remaining**: Integration with actual Hermes + Photon (requires Mac/VPS runtime)

---

## Getting Help

```bash
# CLI help
wise2 help

# WISE² help
Wise, help

# Integration guide
cat docs/HERMES_IMESSAGE.md

# Command reference
cat docs/WISE2_IMESSAGE_COMMANDS.md

# Source code
cat src/wise2-imp/router/wise2-imp.ts
```

---

**WISE² IMP - Turn your iPhone into a command center for your entire business operating system.**

Questions? Start with the docs. Code is readable. Logging is comprehensive. You've got this.

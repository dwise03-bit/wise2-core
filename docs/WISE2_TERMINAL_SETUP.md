# WISE² Terminal Setup Guide

**Status**: ✅ **READY TO USE**

The WISE² Terminal provides a command-line interface similar to Claude Code for managing and interacting with your WISE² ecosystem.

---

## Installation

### Already Done ✅
The terminal has been installed and configured automatically:

```bash
# The following were set up:
✅ Script installed: ~/Projects/wise2-core/scripts/wise2-terminal.sh
✅ Alias created: wise2
✅ Config directory: ~/.wise2
✅ zshrc updated with alias
```

### Manual Setup (if needed)

1. **Make script executable:**
   ```bash
   chmod +x ~/Projects/wise2-core/scripts/wise2-terminal.sh
   ```

2. **Add alias to your shell:**
   ```bash
   # For zsh (~/.zshrc):
   alias wise2="$HOME/Projects/wise2-core/scripts/wise2-terminal.sh"
   
   # For bash (~/.bash_profile):
   alias wise2="$HOME/Projects/wise2-core/scripts/wise2-terminal.sh"
   ```

3. **Reload shell:**
   ```bash
   source ~/.zshrc
   # or
   source ~/.bash_profile
   ```

---

## Quick Start

### Check System Status
```bash
wise2 status
```

Shows:
- Running services (Command Center, Ollama, Local AI Router)
- Recent git commits
- System information

### Start All Services
```bash
wise2 start all
```

Starts:
1. Ollama (AI models)
2. Command Center (web UI on port 3004)

### Stop Services
```bash
wise2 stop
```

---

## Commands

### Core Operations

#### `wise2 status`
Display system status, running services, and git information.

```bash
$ wise2 status
[WISE²] WISE² System Status

Services:
✓ command-center is running
✓ local-ai is running
✓ ollama is running

Git Status:
(your git status)

Recent Commits:
(last 3 commits)
```

#### `wise2 start [service]`
Start one or all services.

**Options:**
- `wise2 start all` - Start Ollama + Command Center
- `wise2 start command-center` - Start web UI only
- `wise2 start ollama` - Start Ollama only

```bash
$ wise2 start all
[WISE²] Starting Ollama...
✓ Ollama running on http://localhost:11434

[WISE²] Starting Command Center...
✓ Command Center running on http://localhost:3004

✓ All services started
```

#### `wise2 stop`
Stop all running services.

```bash
$ wise2 stop
[WISE²] Stopping WISE² services...
✓ Stopped command-center (PID: 12345)
✓ Stopped ollama (PID: 12346)
```

#### `wise2 logs [service]`
View service logs in real-time.

**Options:**
- `wise2 logs command-center` - Command Center logs
- `wise2 logs ollama` - Ollama logs
- `wise2 logs all` - All logs combined

```bash
$ wise2 logs command-center
tail -f ~/.wise2/logs/command-center.log
```

### AI Operations

#### `wise2 ai <query>`
Query the Local AI Router directly from terminal.

```bash
$ wise2 ai "What is Node.js?"
[WISE²] Querying Local AI Router...

Response:
Node.js is a JavaScript runtime built on Chrome's V8 engine...

ℹ Route: mac
ℹ Model: wise2-fast-m4
ℹ Tokens: 142
```

#### `wise2 models`
List all available Ollama models.

```bash
$ wise2 models
[WISE²] Checking available Ollama models...

wise2-fast-m4 (9.7B)
wise2-coder-m4 (9.7B)
wise2-vision-m4 (7.6B)
qwen2.5-coder:7b (7.6B)
qwen3.5:4b (4.7B)
gemma4:12b-mlx (12B)
```

#### `wise2 dashboard`
Open the WISE² dashboard in your browser.

```bash
$ wise2 dashboard
[WISE²] Opening WISE² Dashboard...
# Opens http://localhost:3004/local-ai
```

### System Diagnostics

#### `wise2 doctor`
Run comprehensive system diagnostics.

```bash
$ wise2 doctor
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   WISE² Terminal - AI-Native Business Operating System    ║
║   Version: 1.0.0                                          ║
║                                                            ║
║   Building Empires. Changing Culture. Together.           ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

[WISE²] Running system diagnostics...

Node.js:
✓ Installed: v20.x.x

npm:
✓ Installed: v10.x.x

pnpm:
✓ Installed: v8.x.x

Git:
✓ Installed: git version 2.x.x

Ollama:
✓ Installed at /usr/local/bin/ollama
✓ Running with 6 models

WISE² Setup:
✓ Git repository found
✓ Command Center app found
✓ Documentation found

✓ Diagnostics complete
```

#### `wise2 version`
Show WISE² version and git commit.

```bash
$ wise2 version
WISE² Terminal v1.0.0
1d8bce35 (current commit)
```

### Help

#### `wise2 help`
Display command reference.

```bash
$ wise2 help
WISE² Terminal - Commands

Core Commands:
  status              Show WISE² system status
  start [service]     Start services (all, command-center, ollama)
  stop                Stop all services
  logs [service]      View service logs
  doctor              Run system diagnostics

AI Operations:
  ai <query>          Query the Local AI Router
  models              List available Ollama models
  dashboard           Open WISE² dashboard in browser
  
[... more commands ...]
```

---

## Usage Examples

### Daily Workflow

**Start of day:**
```bash
wise2 start all      # Start all services
wise2 status         # Check everything is running
wise2 dashboard      # Open dashboard
```

**Ask the AI:**
```bash
wise2 ai "What are today's priorities?"
wise2 ai "Generate a TypeScript interface for user data"
```

**Check models:**
```bash
wise2 models         # See available models
```

**Monitor logs:**
```bash
wise2 logs all       # Watch all logs in real-time
```

**End of day:**
```bash
wise2 stop           # Stop all services
```

### Development Workflow

```bash
# Start services
wise2 start all

# View status
wise2 status

# Watch logs while developing
wise2 logs command-center

# Query AI for help
wise2 ai "How do I implement OAuth in Next.js?"

# List available AI models
wise2 models
```

### Troubleshooting

```bash
# Check system health
wise2 doctor

# View error logs
wise2 logs command-center

# Restart services
wise2 stop
wise2 start all

# Check if Ollama is running
curl http://localhost:11434/api/tags
```

---

## Configuration

### Environment Variables

The WISE² terminal uses the following configuration:

```bash
# WISE² home directory (created automatically)
export WISE2_HOME="$HOME/.wise2"

# Directory structure:
$WISE2_HOME/
├── logs/              # Service logs
├── cache/             # Cached data
├── config/            # Configuration files
├── data/              # Persistent data
├── *.pid              # Process IDs
```

### Custom Configuration

You can customize behavior with environment variables:

```bash
# Use a different WISE² home
export WISE2_HOME="/custom/path"

# View logs with custom tail args
wise2 logs command-center --lines 50
```

---

## Troubleshooting

### Command not found: wise2

**Solution 1: Reload shell**
```bash
source ~/.zshrc
# or
source ~/.bash_profile
```

**Solution 2: Verify alias**
```bash
alias | grep wise2
```

Should output:
```
wise2='$HOME/Projects/wise2-core/scripts/wise2-terminal.sh'
```

**Solution 3: Manual path**
If the alias doesn't work, run the script directly:
```bash
~/Projects/wise2-core/scripts/wise2-terminal.sh status
```

### Services won't start

**Check Ollama installation:**
```bash
which ollama
ollama --version
```

Install if needed:
```bash
brew install ollama
```

**Check ports are available:**
```bash
lsof -i :3004    # Command Center
lsof -i :11434   # Ollama
```

### AI query fails

**Check services are running:**
```bash
wise2 status
```

**Test Ollama directly:**
```bash
curl http://localhost:11434/api/tags
```

**Check Command Center is responding:**
```bash
curl http://localhost:3004
```

---

## Features

### ✅ Implemented
- [x] Service management (start/stop/logs)
- [x] System diagnostics
- [x] AI query interface
- [x] Model listing
- [x] Dashboard integration
- [x] Status monitoring
- [x] Colored output
- [x] Error handling
- [x] Log streaming

### 🚀 Coming Soon
- [ ] Configuration management UI
- [ ] Performance profiling
- [ ] Automated backups
- [ ] Model management (pull/update)
- [ ] Multi-session support
- [ ] Command history
- [ ] Shell completion

---

## Architecture

```
wise2 (alias)
    ↓
wise2-terminal.sh
    ├─ cmd_status()       → Service status
    ├─ cmd_start()        → Start services
    ├─ cmd_stop()         → Stop services
    ├─ cmd_logs()         → View logs
    ├─ cmd_ai()           → Query AI Router
    ├─ cmd_models()       → List models
    ├─ cmd_dashboard()    → Open UI
    ├─ cmd_doctor()       → Diagnostics
    └─ cmd_help()         → Help text

Services:
├─ Ollama (localhost:11434)
├─ Command Center (localhost:3004)
└─ Local AI Router (/api/local-ai/query)

Logs:
└─ ~/.wise2/logs/
   ├─ command-center.log
   ├─ ollama.log
```

---

## Integration with WISE² Systems

### Local AI Router
```bash
# Query via terminal
wise2 ai "What is the weather?"

# Or via Command Center UI
wise2 dashboard   # Opens http://localhost:3004/local-ai
```

### Ollama Models
```bash
# List all available models
wise2 models

# Use in AI queries
wise2 ai "Generate code"  # Uses default model
```

### Command Center
```bash
# Open in browser
wise2 dashboard

# Or manually
open http://localhost:3004
```

---

## Tips & Tricks

### Watch logs while developing
```bash
# In one terminal window:
wise2 logs all

# In another:
wise2 ai "Test query"
```

### Create a startup shortcut
```bash
# Add to ~/.zshrc:
alias w2start="wise2 start all && sleep 2 && wise2 status"
alias w2stop="wise2 stop"
alias w2dash="wise2 dashboard"

# Then use:
w2start
w2dash
w2stop
```

### Monitor resource usage
```bash
# In another terminal:
watch -n 1 'wise2 status'
```

### Batch queries
```bash
# Query multiple times
for query in "Hello" "How are you?" "What's the time?"; do
  echo "Query: $query"
  wise2 ai "$query"
  echo ""
done
```

---

## Support

For issues or questions:

1. Run `wise2 doctor` to check system health
2. Check logs: `wise2 logs all`
3. Review documentation: See `docs/` directory
4. Check git status: `wise2 status`

---

## Version History

### v1.0.0 (2026-09-16)
- Initial release
- Core service management
- AI query interface
- System diagnostics
- Dashboard integration

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-09-16  
**Maintained By**: WISE² Core Team

# WISE² — Integrated AI Development Setup

**MacBook Pro M4 16GB**  
**Date**: 2026-08-29  
**Status**: ✅ Ready to Configure

---

## Current Hardware Capabilities

| Component | Spec | Performance |
|-----------|------|-------------|
| **CPU** | Apple M4 | 6P + 2E cores |
| **GPU** | Apple GPU | 10-core unified |
| **RAM** | 16 GB unified | 120 GB/s bandwidth |
| **Recommended Models** | Qwen3.5 9B, Gemma4 9B-12B | 15-20 tok/sec |
| **Max Model Size** | ~9-12B params | Full precision fast |

---

## 🎯 Integrated Toolchain

### 1. **Claude Code** (Primary) ✅
**Status**: Configured  
**Model**: Haiku (default), Sonnet (architecture), Opus (review)  
**Config**: `.claude/settings.json`  

```bash
# Launch
claude

# Use model overrides
@architecture: [design question]
@deploy: [deployment plan]
@debug: [debugging help]
```

---

### 2. **Cursor AI** (IDE Integration) 🔧
**Status**: Installed but not configured  
**Purpose**: Local model support in editor  

#### Setup

```bash
# 1. Start Ollama (if not running)
ollama serve

# 2. In Cursor, go to Settings → Models → OpenAI API
# Set these values:
Base URL: http://localhost:11434/v1
API Key: (leave empty or use "ollama")

# 3. Select model from Cursor UI
# Recommended: wise2-coder:latest (6.6 GB, optimized)
```

**Cursor Settings JSON** (`.cursor/settings.json`):
```json
{
  "models": [
    {
      "name": "wise2-coder",
      "provider": "openai-compatible",
      "baseUrl": "http://localhost:11434/v1",
      "model": "wise2-coder:latest",
      "maxTokens": 8000
    },
    {
      "name": "qwen3.5-9b",
      "provider": "openai-compatible",
      "baseUrl": "http://localhost:11434/v1",
      "model": "qwen3.5:4b",
      "maxTokens": 4000
    }
  ],
  "defaultModel": "wise2-coder",
  "codeCompletion": {
    "enabled": true,
    "temperature": 0.3
  }
}
```

---

### 3. **VS Code + Continue.dev** (Lightweight Alternative)

**Purpose**: Free, open-source Cursor alternative  

#### Setup

```bash
# Install Continue extension in VS Code
1. Open VS Code
2. Cmd+Shift+X → Search "Continue"
3. Install Continue.dev (4M+ downloads)

# Configure ~/.continue/config.json
{
  "models": [
    {
      "title": "wise2-coder",
      "provider": "ollama",
      "model": "wise2-coder:latest",
      "apiBase": "http://localhost:11434"
    }
  ],
  "tabAutocompleteModel": {
    "title": "qwen3.5",
    "provider": "ollama",
    "model": "qwen3.5:4b",
    "apiBase": "http://localhost:11434"
  }
}
```

---

### 4. **ChatGPT + Codex** (Cloud Fallback) ☁️

**Status**: Already integrated in Ollama config  
**Purpose**: High-complexity reasoning, analysis  

```bash
# Already configured in ~/.ollama/config.json
# Models: wise2 (linked to ChatGPT)

# Use from Claude Code:
@gpt: [complex analysis]  # Route to GPT-4 via integration

# Or use ChatGPT web directly for:
# - Long-form analysis
# - Vision tasks
# - Web research
```

---

### 5. **Obsidian + Second Brain** (Knowledge Layer)

**Status**: Not installed — setup below  
**Purpose**: Index project knowledge, auto-link docs, RAG integration  

#### Installation

```bash
# Install Obsidian
brew install obsidian

# Create vault at ~/Documents/wise2-brain
mkdir -p ~/Documents/wise2-brain

# Initialize with WISE² structure
cd ~/Documents/wise2-brain
mkdir -p {projects,decisions,snippets,daily-logs,people}
```

#### Obsidian Setup (`obsidian.json`)

```json
{
  "vault": "wise2-brain",
  "theme": "dark",
  "plugins": [
    "dataview",
    "templater",
    "obsidian-git",
    "smart-random-note",
    "homepage"
  ],
  "hotkeys": {
    "obsidian-git:push": "Cmd+Shift+P",
    "obsidian-git:pull": "Cmd+Shift+U"
  }
}
```

#### Vault Structure

```
wise2-brain/
├── _daily/
│   ├── 2026-08-29.md        (Daily log, auto-generated)
│   └── templates/
│       └── daily.md         (Template for new days)
│
├── projects/
│   ├── feat-wise2-hvac.md   (Current branch work)
│   ├── wise2-live-demo.md
│   └── sencere-brand.md
│
├── decisions/
│   ├── 2026-08-29-m4-models.md
│   └── architecture-patterns.md
│
├── snippets/
│   ├── bash-utils.md
│   ├── react-patterns.md
│   └── api-integrations.md
│
├── people/
│   ├── team.md
│   └── clients.md
│
└── README.md               (Vault home)
```

---

### 6. **Local Second Brain Integration** (RAG)

**Purpose**: Use Obsidian vault as context for Claude Code  

#### Setup

```bash
# 1. Install Node dependencies for RAG
npm install --prefix ~/.claude/integrations \
  markdown-parse @anthropic-ai/sdk

# 2. Create RAG indexer script
cat > ~/.claude/integrations/index-obsidian.js << 'EOF'
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const vaultPath = path.expandUser('~/Documents/wise2-brain');

// Index all .md files
const files = glob.sync(`${vaultPath}/**/*.md`);
const index = files.map(file => ({
  path: path.relative(vaultPath, file),
  content: fs.readFileSync(file, 'utf-8'),
  modified: fs.statSync(file).mtime
}));

// Save index
fs.writeFileSync(
  `${vaultPath}/.index.json`,
  JSON.stringify(index, null, 2)
);

console.log(`✅ Indexed ${index.length} files`);
EOF

# 3. Run indexer
node ~/.claude/integrations/index-obsidian.js
```

#### Use in Claude Code

```bash
# Reference Second Brain in prompts
"Context from my Second Brain: <load:obsidian:projects/feat-wise2-hvac.md>"

# Or use memory system
# (.claude/projects/*/memory/ auto-loads relevant memories)
```

---

## 🚀 Quick Start Script

Create this launcher to start everything:

```bash
cat > ~/.claude/start-dev-stack.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 Starting WISE² Full Dev Stack..."

# 1. Start Ollama (background)
if ! pgrep -x ollama > /dev/null; then
  echo "📦 Starting Ollama..."
  ollama serve > ~/.ollama/logs.txt 2>&1 &
  sleep 3
fi

# 2. Check Ollama models
echo "✅ Ollama running with models:"
ollama list

# 3. Optional: Start Cursor
if [ "$1" == "--cursor" ]; then
  echo "🎯 Launching Cursor..."
  open -a "Cursor"
fi

# 4. Optional: Start VS Code
if [ "$1" == "--code" ]; then
  echo "💻 Launching VS Code..."
  code /Users/danielwise/Projects/wise2-core
fi

# 5. Optional: Open Obsidian
if [ "$1" == "--brain" ]; then
  echo "🧠 Opening Obsidian..."
  open -a "Obsidian" ~/Documents/wise2-brain
fi

# 6. Start Claude Code
if [ "$1" == "--claude" ] || [ -z "$1" ]; then
  echo "🤖 Starting Claude Code..."
  cd /Users/danielwise/Projects/wise2-core
  claude
fi

echo ""
echo "✨ Stack ready!"
echo ""
echo "Usage: ~/.claude/start-dev-stack.sh [--cursor|--code|--brain|--all]"
EOF

chmod +x ~/.claude/start-dev-stack.sh
```

**Usage**:
```bash
~/.claude/start-dev-stack.sh          # Start Ollama + Claude Code
~/.claude/start-dev-stack.sh --all    # Start everything
~/.claude/start-dev-stack.sh --cursor # Start with Cursor AI
~/.claude/start-dev-stack.sh --brain  # Include Obsidian
```

---

## 🔄 Workflow Integration

### For Code Changes

```
1. You: "build the new feature"
   ↓
2. Claude Code (@architecture): Design with Sonnet
   ↓
3. Edit code in Cursor (wise2-coder backbone)
   ↓
4. Continue.dev auto-completes while you type
   ↓
5. Claude Code (@review): Review with Opus
   ↓
6. Obsidian: Log decision to Second Brain
   ↓
7. Git push → GitHub Actions → Deploy
```

### For Complex Problems

```
1. Research in ChatGPT (web, vision, analysis)
   ↓
2. Save findings to Obsidian (Second Brain)
   ↓
3. Claude Code loads via RAG
   ↓
4. Fast turnaround with local wise2-coder
   ↓
5. Fall back to Claude API (Opus) if needed
```

---

## 📊 Model Selector (M4 16GB)

| Task | Recommended | Reason |
|------|-------------|--------|
| **Code completion** | qwen3.5:4b | Fast (20+ tok/sec) |
| **Code generation** | wise2-coder:latest | Specialized, 6.6GB |
| **Architecture** | wise2:latest | Reasoning, context |
| **RAG/Retrieval** | nomic-embed-text | Embeddings only |
| **Vision tasks** | wise2-vision:latest | Multi-modal |
| **Complex reasoning** | Claude API (Opus) | When local insufficient |

---

## 🛠 Maintenance Commands

```bash
# Update Ollama models
ollama pull wise2-coder:latest

# Check Ollama status
ollama ps

# View memory usage
ollama show wise2-coder:latest

# Clear old models
ollama rm wise2-3d-ultra:latest

# Restart stack
~/.claude/start-dev-stack.sh --all

# Index Second Brain
node ~/.claude/integrations/index-obsidian.js
```

---

## 💾 Backup Strategy

```bash
# Backup Ollama models (save 40+ GB)
tar -czf ~/backups/ollama-models-$(date +%Y%m%d).tar.gz ~/.ollama/models

# Backup Obsidian vault (lightweight)
tar -czf ~/backups/wise2-brain-$(date +%Y%m%d).tar.gz ~/Documents/wise2-brain

# Backup Claude Code config
tar -czf ~/backups/claude-config-$(date +%Y%m%d).tar.gz ~/.claude
```

---

## 📋 Next Steps

- [ ] Configure Cursor AI (follow Setup section above)
- [ ] Install Continue.dev in VS Code
- [ ] Create Obsidian vault (~/Documents/wise2-brain)
- [ ] Set up daily log template
- [ ] Create launcher script (~/.claude/start-dev-stack.sh)
- [ ] Test local model → Cursor workflow
- [ ] Test Obsidian → Claude Code RAG
- [ ] Verify ChatGPT fallback working

---

**Total Setup Time**: ~20 minutes  
**Cost**: $0 (all open source except ChatGPT API if used)  
**Performance**: 20-30 tok/sec local, instant IDE completions

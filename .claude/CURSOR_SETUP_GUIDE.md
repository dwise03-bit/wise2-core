# Cursor AI Setup for WISE² (Local Models)

**Goal**: Use Cursor with local Ollama models for offline coding + free inference  
**Time**: 5 minutes  
**Cost**: $0

---

## ✅ Prerequisite Check

```bash
# Should already be running
ollama list                    # ✅ Shows 16 models
ps aux | grep ollama          # ✅ Process running
curl localhost:11434/api/tags # ✅ Returns JSON
```

---

## Step 1: Verify Cursor Installation

```bash
which cursor  # Should show /opt/homebrew/bin/cursor

# If not installed:
brew install cursor
```

---

## Step 2: Open Cursor Settings

1. **Open Cursor**
2. Press `Cmd+,` (Settings)
3. Navigate to **Models** tab

---

## Step 3: Configure Local Models

### Option A: GUI Setup (Easiest)

In Cursor Settings → Models:

1. **Add Model** button
2. Select **OpenAI Compatible** (or **Ollama**)
3. Fill in:
   - **Base URL**: `http://localhost:11434/v1`
   - **Model Name**: `wise2-coder:latest`
   - **API Key**: Leave blank (Ollama doesn't need it)

4. Repeat for `qwen3.5:4b` (fast completions)

### Option B: Config File Setup (What we created)

Your settings file is ready at: `~/.cursor/settings.json`

**Copy it to Cursor config** (if it doesn't auto-load):

```bash
# Find Cursor config directory
CURSOR_CONFIG="$HOME/Library/Application Support/Cursor/User"

# Copy settings
cp ~/.cursor/settings.json "$CURSOR_CONFIG/settings.json"
```

---

## Step 4: Verify Connection

In Cursor **Chat** tab:

1. Type: "What's 2+2?"
2. Model dropdown should show **wise2-coder**
3. Wait for response

If it works → ✅ Ready!  
If it fails → Check:
```bash
# Is Ollama running?
pgrep ollama

# Is port 11434 open?
curl http://localhost:11434/api/tags

# Check Ollama logs
tail -f ~/.ollama/dev-stack.log
```

---

## Step 5: Configure Code Completion

1. **Settings → Features → Code Completion**
2. Enable **Tab Completion**
3. Model: `qwen3.5:4b` (recommended for speed)

---

## Step 6: Set Keybindings

In Cursor Settings → Keybindings:

| Action | Shortcut |
|--------|----------|
| Open Chat | `Cmd+L` |
| Trigger Completion | `Tab` |
| Dismiss | `Esc` |
| Edit in Place | `Cmd+I` |

---

## Step 7: Optimize Performance

**Settings → Performance:**

```json
{
  "contextWindowSize": 8192,
  "maxTokensPerRequest": 2048,
  "temperature": 0.3,
  "enableCaching": true,
  "autoScroll": true
}
```

---

## 🎯 Usage Tips

### For Code Generation
```
// Press Cmd+L
// Type: "Create a React component for..."
// Wait for response
// Press Accept or Edit
```

### For Code Completion
```
// Type code → Tab appears
// Press Tab → Accept
// Esc → Dismiss
```

### For Refactoring
```
// Select code
// Cmd+L → "Refactor this to be more maintainable"
// Review and accept
```

---

## Model Recommendations

| Task | Model | Why |
|------|-------|-----|
| **Chat/Generation** | `wise2-coder:latest` | Best all-around (6.6GB) |
| **Code Completion** | `qwen3.5:4b` | Fastest (20+ tok/sec) |
| **Quick Help** | `wise2-fast:latest` | Lightweight (3.4GB) |
| **Complex Logic** | Switch to Claude API | When local insufficient |

---

## 🔄 Workflow Example

```
1. Open project in Cursor
   $ open -a Cursor ~/Projects/wise2-core

2. Cmd+L → Ask question
   "What's the architecture pattern here?"

3. wise2-coder responds with analysis

4. Start typing code → Tab auto-completes

5. Select code → Cmd+L → "Refactor this"

6. Accept/Edit changes

7. Git commit (local models, fully private)
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Model not found | `ollama pull wise2-coder:latest` |
| Connection refused | `ollama serve` in new terminal |
| Slow responses | Switch to `qwen3.5:4b` or `wise2-fast` |
| Settings not loading | Restart Cursor (`Cmd+Q` then reopen) |
| High latency | Check GPU usage: `activity monitor` |

---

## Cloud Fallback

If Ollama is down but you need to work:

1. **Settings → Models → Add**
2. Select **Claude** or **GPT-4**
3. Add API key
4. Cursor switches automatically

---

## Performance Benchmarks (M4 16GB)

| Model | Tokens/Sec | Time for 100 tokens |
|-------|-----------|-------------------|
| qwen3.5:4b | 22 | 4.5s |
| wise2-fast | 18 | 5.5s |
| wise2-coder | 15 | 6.7s |
| wise2 (full) | 12 | 8.3s |

---

## Next Steps

- [ ] Verify Cursor connection
- [ ] Test code completion (Tab)
- [ ] Test chat (Cmd+L)
- [ ] Configure keybindings
- [ ] Try refactoring workflow
- [ ] Set up VS Code + Continue.dev as backup

---

**You're set!** Start with:
```bash
open -a Cursor ~/Projects/wise2-core
```

Questions? Ask in Claude Code with `@debug: Cursor AI question`

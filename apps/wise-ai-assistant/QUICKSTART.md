# WISE² AI Assistant — Quick Start

## 30-Second Setup

### 1. Terminal 1 — Backend

```bash
cd apps/wise-ai-assistant/backend
npm install
npm run dev
# Listens on http://localhost:3020
```

### 2. Terminal 2 — Frontend

```bash
cd apps/wise-ai-assistant/frontend
npm install
npm run dev
# Opens http://localhost:5173
```

### 3. Open Browser

```
http://localhost:5173
```

## Usage Examples

### Via UI (Easiest)

1. Open browser to http://localhost:5173
2. Select priority: ⚡ Speed / 🧠 Quality / 💰 Cost
3. Type query
4. Watch routing preview
5. Hit send

### Via API (Advanced)

**Single query:**
```bash
curl -X POST http://localhost:3020/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain quantum computing", "priority": "quality"}'
```

**Batch queries:**
```bash
curl -X POST http://localhost:3020/batch \
  -H "Content-Type: application/json" \
  -d '{"prompts": ["What is React?", "Explain algorithms"], "priority": "speed"}'
```

**Preview routing:**
```bash
curl -X POST http://localhost:3020/route \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Your query", "priority": "quality"}'
```

## What It Does

### Intelligent Routing

| You Ask | → | GPU | Why |
|---------|---|-----|-----|
| "What is React?" | VPS | ⚡ Speed | 5 seconds |
| "Explain quantum computing" | M4 | 🧠 Quality | Complex reasoning |
| "def factorial(n):" | M4 | 💻 Code | 24K context |
| "Analyze this image" | M4 | 🎨 Multimodal | Image support |
| "Design a box" | M4 | 🎯 Specialized | 3D model |

### Zero API Cost

- Everything runs locally (M4) or on your VPS (GTX 1660)
- No external API calls
- No monthly bills
- You own all responses

## Troubleshooting

### Backend won't start
```bash
# Check if port 3020 is in use
lsof -i :3020
# Kill it if needed
kill -9 <PID>
# Try again
npm run dev
```

### Frontend won't connect
- Backend running on 3020? (check terminal output)
- Network error? (check browser console)
- Try hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Linux/Windows)

### wise-ai CLI not found
```bash
# Verify wise-ai exists
which wise-ai
# Should show: /Users/danielwise/.local/bin/wise-ai
# If not, reinstall:
wise-ai status
```

### VPS offline
```bash
# Check VPS connectivity
ssh dwise@173.208.147.165 "ollama ps"
# If fails, VPS is down
# Use --local-only flag (not implemented yet)
```

## Next: Deploy to VPS

Edit backend `server.ts` and change:
```typescript
const PORT = process.env.PORT || 3020;
```

Then on VPS:
```bash
git pull
cd apps/wise-ai-assistant/backend
npm install && npm run build
PORT=3020 node dist/server.js &
```

Expose via Nginx:
```nginx
server {
  listen 443 ssl http2;
  server_name ai.wise2.net;
  
  location / {
    proxy_pass http://localhost:3020;
  }
}
```

## Performance

| Query | GPU | Model | Time |
|-------|-----|-------|------|
| "hello" | VPS | qwen3.5:4b | ~5s |
| "what is react" | VPS | mistral:latest | ~10s |
| "explain algorithm" | M4 | wise2-m4 | ~90s |
| "code review: ..." | M4 | wise2-coder-m4 | ~60s |

## It Works! 🎉

You now have:
- ✅ Intelligent AI routing
- ✅ Dual-GPU orchestration
- ✅ Zero API costs
- ✅ Production-ready chat UI
- ✅ Open API for integrations

Next: Build your thing on top.

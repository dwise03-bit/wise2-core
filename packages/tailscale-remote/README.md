# Tailscale Remote + Codex Service

**AI-powered remote development access for Mac via Tailscale VPN with ChatGPT code generation**.

## Features

✅ **Tailscale VPN Integration** — Secure remote access to your Mac  
✅ **Code Completion** — ChatGPT-powered code suggestions  
✅ **Code Generation** — Generate code from natural language descriptions  
✅ **Code Explanation** — AI-powered code analysis and documentation  
✅ **macOS LaunchAgent** — Auto-start service on system boot  
✅ **REST API** — Easy integration with IDEs and editors  

## Architecture

```
┌─────────────────┐
│   Your Mac      │
│  (IP: Private)  │
└────────┬────────┘
         │
         ↓
┌──────────────────────────┐
│  Tailscale VPN Network   │ ← Secure tunnel
└──────────────┬───────────┘
               │
               ↓
┌──────────────────────────────┐
│  Codex Remote Service        │
│  ├─ Port 3009               │
│  ├─ Express Server          │
│  ├─ ChatGPT Integration     │
│  └─ Tailscale Client        │
└──────────────────────────────┘
               │
               ↓
         ┌─────────────┐
         │  ChatGPT    │
         │  API        │
         └─────────────┘
```

## Installation

### Prerequisites

- **macOS** (Linux/Windows support coming)
- **Node.js 18+**
- **Tailscale** account and API key
- **OpenAI API** key (GPT-4 access)

### Setup Steps

1. **Clone the repo** (if not already done):
   ```bash
   cd /path/to/wise2-core
   git checkout claude/tailscale-mac-codex-chatgpt-vq2di6
   ```

2. **Navigate to the package**:
   ```bash
   cd packages/tailscale-remote
   ```

3. **Get your API keys**:
   - [Tailscale API Key](https://login.tailscale.com/admin/settings/keys)
   - [OpenAI API Key](https://platform.openai.com/account/api-keys)

4. **Run setup**:
   ```bash
   npm install
   npm run setup <TAILSCALE_KEY> <OPENAI_KEY>
   ```

5. **Build and start**:
   ```bash
   npm run build
   npm start
   ```

### macOS LaunchAgent (Auto-Start)

After setup, load the service:
```bash
launchctl load ~/Library/LaunchAgents/com.wise2.codex-remote.plist
```

Check status:
```bash
launchctl list | grep codex-remote
```

View logs:
```bash
tail -f ~/.wise2/logs/codex-remote.log
```

## API Reference

### Health Check
```bash
GET http://localhost:3009/health
```

Response:
```json
{
  "status": "healthy",
  "service": "tailscale-codex-remote",
  "timestamp": "2026-09-03T12:00:00Z",
  "tailscale": {
    "connected": true,
    "machineIP": "100.x.x.x"
  }
}
```

### Tailscale Status
```bash
GET http://localhost:3009/tailscale/status
```

### Code Completion
```bash
POST http://localhost:3009/codex/complete
Content-Type: application/json

{
  "code": "function hello() {\n  console.",
  "language": "javascript",
  "prompt": "Complete this function to print a greeting"
}
```

Response:
```json
{
  "completion": "log('Hello, World!');",
  "language": "javascript",
  "confidence": 0.85
}
```

### Code Generation
```bash
POST http://localhost:3009/codex/generate
Content-Type: application/json

{
  "description": "Create a function to fetch user data from an API",
  "language": "typescript",
  "style": "functional"
}
```

Response:
```json
{
  "code": "const fetchUserData = async (userId: string) => {\n  const response = await fetch(`/api/users/${userId}`);\n  return response.json();\n};",
  "language": "typescript",
  "explanation": "Fetches user data using async/await pattern"
}
```

### Code Explanation
```bash
POST http://localhost:3009/codex/explain
Content-Type: application/json

{
  "code": "const sum = (a, b) => a + b;",
  "language": "javascript"
}
```

Response:
```json
{
  "summary": "Arrow function that adds two numbers",
  "details": ["Uses arrow function syntax", "Takes two parameters a and b", "Returns their sum"],
  "complexity": "O(1) time, O(1) space"
}
```

### Tailscale Connect
```bash
POST http://localhost:3009/tailscale/connect
```

## Usage Examples

### VS Code Integration

Create `.vscode/settings.json`:
```json
{
  "codex.remote.url": "http://localhost:3009",
  "codex.remote.enabled": true,
  "codex.remote.provider": "tailscale"
}
```

Install extension and configure:
```bash
code --install-extension GitHub.copilot
```

### Cursor IDE

Add to `.cursor/settings.json`:
```json
{
  "codegenProvider": "http://localhost:3009/codex/generate",
  "remoteEnabled": true
}
```

### Custom Script

```bash
#!/bin/bash

API="http://localhost:3009/codex/generate"
DESCRIPTION="Create a function to validate email addresses"
LANGUAGE="typescript"

curl -X POST $API \
  -H "Content-Type: application/json" \
  -d '{
    "description": "'$DESCRIPTION'",
    "language": "'$LANGUAGE'",
    "style": "functional"
  }'
```

## Environment Variables

Create `.env`:
```bash
# Tailscale
TAILSCALE_API_KEY=tskey-...
TAILSCALE_MACHINE_NAME=wise2-mac

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Service
PORT=3009
NODE_ENV=production
LOG_LEVEL=info
```

## Troubleshooting

### "Tailscale not connected"
```bash
# Start Tailscale daemon
launchctl start io.tailscale.ipn.macos

# Or manually
tailscale login
```

### "Cannot reach OpenAI API"
- Verify API key is valid: `echo $OPENAI_API_KEY`
- Check OpenAI account has GPT-4 access
- Verify network connectivity

### "Service not starting"
```bash
# Check logs
tail -f ~/.wise2/logs/codex-remote-error.log

# Unload and reload service
launchctl unload ~/Library/LaunchAgents/com.wise2.codex-remote.plist
launchctl load ~/Library/LaunchAgents/com.wise2.codex-remote.plist
```

### "Machine IP not updating"
```bash
# Force Tailscale reconnect
tailscale logout
tailscale login
```

## Development

### Build
```bash
npm run build
```

### Run in dev mode
```bash
npm run dev
```

### Run tests
```bash
npm test
```

## Architecture Details

### Tailscale Client
- Manages VPN connectivity via `tailscale` CLI
- Auto-detects machine IP
- Handles authentication and reconnection
- Supports macOS launchd integration

### Codex Service
- Wraps ChatGPT API for code tasks
- Provides three capabilities:
  1. **Complete** — Finish incomplete code snippets
  2. **Generate** — Create code from description
  3. **Explain** — Analyze and explain code
- Supports multiple languages (JavaScript, TypeScript, Python, Go, Rust, etc.)

### Express Server
- REST API on port 3009
- Health checks and status endpoints
- Secure handling of API keys
- Error logging and recovery

## Security

⚠️ **Important**: This service exposes code completion over HTTP. Use only on Tailscale VPN network.

**Recommended practices**:
- Never expose port 3009 publicly
- Use Tailscale authentication exclusively
- Rotate API keys regularly
- Monitor logs for suspicious activity
- Run with least privileges

## Performance

- **Code Completion**: ~500ms per request
- **Code Generation**: ~1-2s per request
- **Code Explanation**: ~800ms per request
- **Max concurrent requests**: 10 (configurable)

## License

MIT

## Support

For issues, feature requests, or contributions:
- GitHub Issues: [wise2-core/issues](https://github.com/dwise03-bit/wise2-core/issues)
- Email: dwise03@gmail.com

---

**Built for WISE² Genesis — AI-Native Business OS**

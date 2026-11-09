# WISE² AI Coach: DeepSeek and local-model setup

The trading AI route uses one OpenAI-compatible interface and supports two
safe presets:

- `ollama`: local/private inference, defaulting to `qwen2.5-coder:7b` at
  `http://127.0.0.1:11434`.
- `deepseek`: hosted DeepSeek inference, defaulting to `deepseek-chat` at
  `https://api.deepseek.com` and requiring `AI_API_KEY`.

For local use, install Ollama and pull the chosen model, then set:

```env
AI_PROVIDER=ollama
AI_MODEL=qwen2.5-coder:7b
AI_API_BASE_URL=http://127.0.0.1:11434
AI_API_KEY=
```

For DeepSeek, set the key only in the server environment:

```env
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
AI_API_BASE_URL=https://api.deepseek.com
AI_API_KEY=replace-with-server-secret
```

The route never exposes the key. Paper-trading safeguards and the response
length limit remain active for both providers. A provider health check should
be performed before enabling the route in a deployment.

#!/usr/bin/env node

/**
 * WISE² Raspberry Pi AI Assistant Dashboard
 * Lightweight AI assistant for edge computing
 * Runs on: Raspberry Pi 3B+ (192.168.8.137:3003)
 */

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = 3003;

// In-memory assistant state
const assistantState = {
  name: "WISE² Pi Assistant",
  status: "ready",
  uptime: 0,
  conversations: [],
  memory: {},
  version: "1.0.0",
  device: "Raspberry Pi 3B",
};

// Knowledge base
const knowledgeBase = {
  "system status": "🖥️ Pi 3B: CPU 1%, Mem 35%, Storage 2.1GB, Uptime 5 days",
  "what is wise2":
    "🤖 WISE² is an AI-native business operating system for creators, offering creative tools, analytics, and integrations across all devices.",
  "edge computing":
    "⚡ Edge nodes process data locally, sync with central servers, work offline, and provide real-time responses.",
  "wise2 features":
    "✨ Creative Studio (Sound Lab, Live Studio, Voice Lab), E-Commerce, Dashboard, Analytics, Team Collaboration",
  "pi capabilities":
    "🎯 Local task queue, health monitoring, offline-first architecture, 5-minute sync intervals, auto-restart",
  "support":
    "📞 Use /support-ticket in Discord, email support@wise2.net, or visit wise2.net/docs",
  "music production":
    "🎵 Sound Lab - DAW with effects, mixer, recorder, instruments, real-time playback",
  "live streaming":
    "📹 Live Studio - Stream console with chat, overlays, scene management, recording",
  "voice generation":
    "🎤 Voice Lab - AI voice synthesis, multiple languages, custom voices, real-time processing",
  "api": "🔌 REST API at api.wise2.net/docs with rate limiting, authentication, webhooks",
  "pricing":
    "💰 Free tier ($0), Creator ($29/mo), Creator Pro ($79/mo), Enterprise (custom)",
  "hello": "👋 Hi! I'm the WISE² Pi Assistant. Ask me anything about WISE², the Pi, or how to use these tools!",
  "hi": "👋 Hey there! How can I help you today?",
};

// Utility function to get system info
function getSystemInfo() {
  try {
    const uptime = Math.floor(process.uptime() / 60);
    return {
      uptime: `${uptime} minutes`,
      memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return { error: err.message };
  }
}

// API Routes

/**
 * GET /api/status
 * Returns current assistant status and metrics
 */
app.get("/api/status", (req, res) => {
  const systemInfo = getSystemInfo();
  res.json({
    ...assistantState,
    ...systemInfo,
    conversations: assistantState.conversations.length,
    isOnline: true,
  });
});

/**
 * POST /api/chat
 * Process user message and return response
 */
app.post("/api/chat", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  // Process message
  let response =
    "I can help with WISE² questions, system status, or general topics. Try asking me about features, pricing, or support!";

  const lowerMessage = message.toLowerCase().trim();

  // Search knowledge base
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (lowerMessage.includes(key)) {
      response = value;
      break;
    }
  }

  // Multi-word matching
  if (lowerMessage.includes("help")) {
    response =
      "📚 I can help with:\n• WISE² features & pricing\n• System status & performance\n• Technical questions\n• Getting started\n\nWhat would you like to know?";
  }

  if (lowerMessage.includes("status")) {
    const info = getSystemInfo();
    response = `📊 **System Status**\n• Status: Ready\n• Uptime: ${info.uptime}\n• Memory: ${info.memory}\n• Device: Raspberry Pi 3B`;
  }

  if (lowerMessage.includes("time")) {
    response = `🕐 Current time: ${new Date().toLocaleTimeString()}`;
  }

  // Store conversation
  const conversation = {
    id: `msg-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: message,
    assistant: response,
  };

  assistantState.conversations.push(conversation);

  // Keep last 100 messages
  if (assistantState.conversations.length > 100) {
    assistantState.conversations.shift();
  }

  res.json({
    id: conversation.id,
    response,
    timestamp: conversation.timestamp,
    suggestions: [
      "What else can I help with?",
      "Tell me about WISE² features",
      "How do I use this assistant?",
    ],
  });
});

/**
 * GET /api/conversations
 * Retrieve conversation history
 */
app.get("/api/conversations", (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const recent = assistantState.conversations.slice(-limit);
  res.json({
    total: assistantState.conversations.length,
    limit,
    conversations: recent,
  });
});

/**
 * POST /api/memory
 * Store user preferences/memory
 */
app.post("/api/memory", (req, res) => {
  const { key, value } = req.body;

  if (!key || !value) {
    return res.status(400).json({ error: "Key and value required" });
  }

  assistantState.memory[key] = value;
  res.json({ success: true, key, value });
});

/**
 * GET /api/memory/:key
 * Retrieve stored memory
 */
app.get("/api/memory/:key", (req, res) => {
  const value = assistantState.memory[req.params.key];
  res.json({
    key: req.params.key,
    value: value || null,
    found: value !== undefined,
  });
});

/**
 * GET /api/suggestions
 * Get topic suggestions
 */
app.get("/api/suggestions", (req, res) => {
  const suggestions = [
    "What is WISE²?",
    "System status",
    "How to use this?",
    "Tell me about Creative Studio",
    "Show pricing",
    "How to get support",
  ];
  res.json({ suggestions });
});

/**
 * Health check endpoint
 */
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve static HTML dashboard
const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WISE² Pi Assistant</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', monospace;
      background: #050505;
      color: #00ff00;
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      border: 2px solid #00ff00;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
    }
    h1 {
      font-size: 2em;
      text-shadow: 0 0 10px #00ff00;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #00aa00;
      font-size: 0.9em;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin: 20px 0;
    }
    .stat-card {
      border: 1px solid #00ff00;
      padding: 15px;
      background: #0a0a0a;
      text-align: center;
    }
    .stat-value {
      font-size: 1.5em;
      color: #00ff00;
      margin-bottom: 5px;
    }
    .stat-label {
      font-size: 0.8em;
      color: #00aa00;
    }
    .chat-container {
      border: 2px solid #00ff00;
      padding: 20px;
      background: #0a0a0a;
      margin: 20px 0;
    }
    .messages {
      height: 300px;
      overflow-y: auto;
      border: 1px solid #00aa00;
      padding: 15px;
      margin-bottom: 15px;
      background: #000;
    }
    .message {
      margin: 10px 0;
      padding: 10px;
      border-left: 3px solid #00aa00;
    }
    .message.user {
      border-left-color: #0055ff;
      color: #0055ff;
    }
    .message.assistant {
      border-left-color: #2cd588;
      color: #2cd588;
    }
    .input-group {
      display: flex;
      gap: 10px;
    }
    input[type="text"] {
      flex: 1;
      padding: 10px;
      background: #0a0a0a;
      border: 1px solid #00ff00;
      color: #00ff00;
      font-family: 'Courier New', monospace;
    }
    button {
      padding: 10px 20px;
      background: #00ff00;
      color: #000;
      border: 0;
      cursor: pointer;
      font-weight: bold;
      font-family: 'Courier New', monospace;
    }
    button:hover {
      background: #00aa00;
      box-shadow: 0 0 10px #00ff00;
    }
    .suggestions {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 15px;
    }
    .suggestion-btn {
      padding: 10px;
      background: #0055ff;
      color: #fff;
      border: 1px solid #00ff00;
      cursor: pointer;
      font-size: 0.85em;
    }
    .suggestion-btn:hover {
      background: #0077ff;
      box-shadow: 0 0 10px #0055ff;
    }
    .footer {
      text-align: center;
      color: #00aa00;
      margin-top: 20px;
      font-size: 0.85em;
    }
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #0a0a0a;
    }
    ::-webkit-scrollbar-thumb {
      background: #00ff00;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🤖 WISE² Pi Assistant</h1>
      <p class="subtitle">AI Assistant Dashboard • Raspberry Pi 3B</p>
    </header>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-value" id="status">🟢 Ready</div>
        <div class="stat-label">Status</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="uptime">--</div>
        <div class="stat-label">Uptime</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" id="chats">0</div>
        <div class="stat-label">Conversations</div>
      </div>
    </div>

    <div class="chat-container">
      <h2>💬 Chat with Assistant</h2>
      <div class="messages" id="messages"></div>
      <div class="input-group">
        <input type="text" id="input" placeholder="Ask me anything..." />
        <button onclick="sendMessage()">Send</button>
      </div>
      <div class="suggestions" id="suggestions"></div>
    </div>

    <div class="footer">
      <p>🌐 WISE² Edge Computing • Connected to wise2.net</p>
      <p>Last updated: <span id="timestamp">--</span></p>
    </div>
  </div>

  <script>
    const messagesDiv = document.getElementById("messages");
    const inputEl = document.getElementById("input");
    const suggestionsDiv = document.getElementById("suggestions");

    // Load initial status
    async function updateStatus() {
      try {
        const res = await fetch("/api/status");
        const data = await res.json();
        document.getElementById("uptime").textContent = data.uptime;
        document.getElementById("chats").textContent = data.conversations;
        document.getElementById("timestamp").textContent = new Date().toLocaleTimeString();
      } catch (e) {
        console.error("Status update failed:", e);
      }
    }

    // Load suggestions
    async function loadSuggestions() {
      try {
        const res = await fetch("/api/suggestions");
        const data = await res.json();
        suggestionsDiv.innerHTML = data.suggestions
          .map(
            (s) =>
              \`<button class="suggestion-btn" onclick="sendMessage('\${s}')">💡 \${s}</button>\`
          )
          .join("");
      } catch (e) {
        console.error("Suggestions load failed:", e);
      }
    }

    // Send message
    async function sendMessage(message) {
      const msg = message || inputEl.value.trim();
      if (!msg) return;

      // Add user message
      addMessage(msg, "user");
      inputEl.value = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: msg }),
        });
        const data = await res.json();
        addMessage(data.response, "assistant");
      } catch (e) {
        addMessage("Connection error: " + e.message, "assistant");
      }

      updateStatus();
    }

    // Add message to UI
    function addMessage(text, role) {
      const div = document.createElement("div");
      div.className = "message " + role;
      div.textContent = text;
      messagesDiv.appendChild(div);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Event listeners
    inputEl.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });

    // Initial load
    updateStatus();
    loadSuggestions();
    setInterval(updateStatus, 5000);

    // Welcome message
    addMessage("👋 Hi! I'm WISE² Pi Assistant. Ask me anything about WISE², this device, or how to get started!", "assistant");
  </script>
</body>
</html>`;

// Ensure public directory exists
if (!fs.existsSync("public")) {
  fs.mkdirSync("public", { recursive: true });
}

// Write HTML file
fs.writeFileSync("public/index.html", htmlContent);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 WISE² Pi Assistant running on http://0.0.0.0:${PORT}`);
  console.log(`📍 Access at: http://192.168.8.137:${PORT}`);
  console.log(`✅ API ready at: http://192.168.8.137:${PORT}/api`);
});

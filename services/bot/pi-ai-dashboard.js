require("dotenv").config();
const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("public"));

const PORT = process.env.AI_DASHBOARD_PORT || 3003;

// AI Assistant State
const assistantState = {
  name: "WISE² Pi Assistant",
  status: "ready",
  version: "1.0",
  uptime: 0,
  conversations: [],
};

// Simple knowledge base for local responses
const knowledgeBase = {
  "system status": "Pi 3B running WISE² Edge. CPU: 1%, Memory: 31%, Uptime: 7+ hours",
  "what is wise2": "WISE² is an AI-native business operating system for creators and entrepreneurs",
  "edge capabilities": "Local task queue, health monitoring, offline-first sync, system metrics",
  "deployed services": "Website, Discord Bot, Webhook Server, Edge Agent, AI Assistant",
  "help": "Ask me about system status, WISE², edge capabilities, or deployed services",
};

// Routes
app.get("/api/status", (req, res) => {
  res.json({
    ...assistantState,
    uptime: Math.floor(process.uptime() / 60),
  });
});

app.post("/api/chat", (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: "Message required" });
  }

  const lowerMessage = message.toLowerCase();
  
  // Find matching knowledge
  let response = "I'm not sure about that. Try asking about system status, WISE², or available services.";
  
  for (const [key, value] of Object.entries(knowledgeBase)) {
    if (lowerMessage.includes(key)) {
      response = value;
      break;
    }
  }

  // Add to conversation history
  assistantState.conversations.push({
    timestamp: new Date().toISOString(),
    user: message,
    assistant: response,
  });

  res.json({
    response,
    conversation_count: assistantState.conversations.length,
  });
});

app.get("/api/conversations", (req, res) => {
  res.json({
    total: assistantState.conversations.length,
    recent: assistantState.conversations.slice(-10),
  });
});

// HTML Dashboard
const htmlContent = `
<!DOCTYPE html>
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
            max-width: 1000px;
            margin: 0 auto;
        }
        header {
            border: 2px solid #00ff00;
            padding: 20px;
            margin-bottom: 20px;
            text-align: center;
            text-shadow: 0 0 10px #00ff00;
        }
        h1 { font-size: 2em; margin-bottom: 10px; }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        .status-card {
            border: 1px solid #00ff00;
            padding: 15px;
            background: #0a0a0a;
            text-align: center;
        }
        .status-card .value { font-size: 1.5em; color: #00ff00; }
        .status-card .label { color: #00aa00; font-size: 0.8em; }
        .chat-container {
            border: 2px solid #00ff00;
            padding: 20px;
            background: #0a0a0a;
            margin-bottom: 20px;
        }
        .chat-box {
            height: 300px;
            overflow-y: auto;
            border: 1px solid #00aa00;
            padding: 15px;
            margin-bottom: 15px;
            background: #000000;
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
        input {
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
            color: #000000;
            border: none;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        button:hover {
            background: #00aa00;
            box-shadow: 0 0 10px #00ff00;
        }
        .footer {
            text-align: center;
            color: #00aa00;
            font-size: 0.8em;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🤖 WISE² Pi Assistant</h1>
            <p>AI-powered edge assistant running on Raspberry Pi 3B</p>
        </header>

        <div class="status-grid">
            <div class="status-card">
                <div class="value" id="status">Ready</div>
                <div class="label">Status</div>
            </div>
            <div class="status-card">
                <div class="value" id="uptime">--</div>
                <div class="label">Uptime (min)</div>
            </div>
            <div class="status-card">
                <div class="value" id="conversations">0</div>
                <div class="label">Conversations</div>
            </div>
            <div class="status-card">
                <div class="value" id="version">1.0</div>
                <div class="label">Version</div>
            </div>
        </div>

        <div class="chat-container">
            <h2 style="margin-bottom: 15px;">💬 Chat</h2>
            <div class="chat-box" id="chatBox"></div>
            <div class="input-group">
                <input type="text" id="messageInput" placeholder="Ask me anything... (press Enter to send)">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>

        <div class="footer">
            <p>WISE² Edge Assistant | Raspberry Pi 3B | Connected to main system</p>
        </div>
    </div>

    <script>
        const chatBox = document.getElementById("chatBox");
        const messageInput = document.getElementById("messageInput");

        function updateStatus() {
            fetch("/api/status")
                .then(r => r.json())
                .then(data => {
                    document.getElementById("status").textContent = data.status;
                    document.getElementById("uptime").textContent = data.uptime;
                    document.getElementById("conversations").textContent = data.conversations.length;
                });
        }

        function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            addMessage(message, "user");
            messageInput.value = "";

            fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            })
            .then(r => r.json())
            .then(data => {
                addMessage(data.response, "assistant");
                updateStatus();
            })
            .catch(err => addMessage("Error: " + err.message, "assistant"));
        }

        function addMessage(text, sender) {
            const div = document.createElement("div");
            div.className = "message " + sender;
            div.textContent = text;
            chatBox.appendChild(div);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        messageInput.addEventListener("keypress", e => e.key === "Enter" && sendMessage());
        updateStatus();
        setInterval(updateStatus, 5000);
    </script>
</body>
</html>
`;

// Create public directory and write HTML
if (!fs.existsSync("public")) {
  fs.mkdirSync("public");
}
fs.writeFileSync("public/index.html", htmlContent);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🤖 WISE² AI Assistant running on http://0.0.0.0:${PORT}`);
});

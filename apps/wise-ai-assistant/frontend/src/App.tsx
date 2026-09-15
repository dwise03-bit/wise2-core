import React, { useState, useRef, useEffect } from 'react';
import './App.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    gpu?: string;
    model?: string;
    elapsedTime?: number;
    cost?: { api: number; hardware: number; total: number };
  };
}

interface RouteDecision {
  gpu: string;
  model: string;
  reason: string;
  estimatedTime: number;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [priority, setPriority] = useState<'speed' | 'quality' | 'cost'>('speed');
  const [route, setRoute] = useState<RouteDecision | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRoute = async (prompt: string) => {
    try {
      const res = await fetch('http://localhost:3020/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, priority }),
      });
      const data = await res.json();
      setRoute(data.decision);
    } catch (error) {
      console.error('Route error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3020/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, priority }),
      });

      const data = await res.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.result,
        timestamp: Date.now(),
        metadata: {
          gpu: data.decision.gpu,
          model: data.decision.model,
          elapsedTime: data.elapsedTime,
          cost: data.decision.cost,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setRoute(null);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🤖 WISE² AI Assistant</h1>
        <p>Dual-GPU (M4 + VPS) with intelligent routing • Zero API cost</p>
      </header>

      <div className="chat-container">
        <div className="messages">
          {messages.length === 0 && (
            <div className="empty-state">
              <h2>Start a conversation</h2>
              <p>Ask anything — I'll route to the best GPU:</p>
              <ul>
                <li>📱 Quick: "What is React?" → VPS (fast)</li>
                <li>🧠 Complex: "Explain quantum computing in detail" → M4 (quality)</li>
                <li>💻 Code: "Write a factorial function" → M4 (24K context)</li>
                <li>🎨 Image: "Analyze this screenshot" → M4 (multimodal)</li>
              </ul>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`message message-${msg.role}`}>
              <div className="message-header">
                {msg.role === 'user' ? '👤' : '🤖'} <strong>{msg.role}</strong>
                {msg.metadata && (
                  <span className="metadata">
                    {msg.metadata.gpu === 'local' ? '🔵 M4' : '🟡 VPS'} • {msg.metadata.model?.split(':')[0]} •{' '}
                    {msg.metadata.elapsedTime?.toFixed(1)}s
                  </span>
                )}
              </div>
              <div className="message-content">{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="message message-assistant">
              <div className="message-header">🤖 <strong>assistant</strong></div>
              <div className="message-content">Thinking...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="route-preview">
          {route && (
            <div className="route-info">
              <strong>→ Route Preview:</strong> {route.gpu === 'local' ? '🔵 M4' : '🟡 VPS'} ({route.model})
              <br />
              <small>{route.reason}</small>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-controls">
            <select value={priority} onChange={(e) => setPriority(e.target.value as any)} disabled={loading}>
              <option value="speed">⚡ Speed</option>
              <option value="quality">🧠 Quality</option>
              <option value="cost">💰 Cost</option>
            </select>
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value.length > 10) handleRoute(e.target.value);
              }}
              placeholder="Ask anything..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

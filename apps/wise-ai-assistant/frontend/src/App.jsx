import { useState, useRef, useEffect } from 'react';
import './App.css';

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef(null);

  const scroll = () => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(scroll, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3020/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.result,
        gpu: data.decision.gpu,
        time: data.elapsedTime,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e}` }]);
    }
    setLoading(false);
  };

  return (
    <div className="app">
      <header>
        <h1>🤖 WISE² AI</h1>
        <p>Dual-GPU (M4 + VPS) • Zero API cost</p>
      </header>

      <div className="chat">
        {messages.map((msg, i) => (
          <div key={i} className={`msg msg-${msg.role}`}>
            <div className="msg-header">
              {msg.role === 'user' ? '👤' : '🤖'} {msg.gpu && `(${msg.gpu === 'local' ? '🔵 M4' : '🟡 VPS'} • ${msg.time?.toFixed(1)}s)`}
            </div>
            <div className="msg-text">{msg.content}</div>
          </div>
        ))}
        {loading && <div className="msg msg-assistant"><div className="msg-text">⏳ Thinking...</div></div>}
        <div ref={messagesEnd} />
      </div>

      <form onSubmit={handleSubmit} className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>📤</button>
      </form>
    </div>
  );
}

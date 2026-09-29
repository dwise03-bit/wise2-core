import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import './AIAssistant.css';

export default function AIAssistant({ metrics }) {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'I\'m your WISE² AI Assistant. Ask me about your system, commands, or how to optimize performance.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const buildContext = () => {
    return `Current System Context:
- CPU Usage: ${metrics?.cpu || 0}%
- Memory: ${metrics?.memory || 0}%
- Disk: ${metrics?.disk || 0}%
- Services: ${metrics?.services?.map(s => `${s.name}:${s.status}`).join(', ') || 'Unknown'}`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const context = buildContext();
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: `${context}\n\nUser: ${input}\n\nAssistant:`,
          stream: false,
          temperature: 0.7
        })
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Unable to process request'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Connection error. Is Ollama running? (Make sure it's on port 11434)`
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`ai-assistant ${!isOpen ? 'collapsed' : ''}`} data-theme={theme}>
      <div className="ai-header">
        <div className="ai-title">
          <span className="ai-icon">🤖</span>
          <span>AI Assistant</span>
        </div>
        <button
          className="ai-toggle"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? 'Minimize' : 'Expand'}
        >
          {isOpen ? '−' : '+'}
        </button>
      </div>

      {isOpen && (
        <>
          <div className="ai-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-badge">
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message assistant loading">
                <div className="message-badge">🤖</div>
                <div className="message-content">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="ai-input-area">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
              placeholder="Ask about your system..."
              disabled={loading}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()}>
              {loading ? '⏳' : '→'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

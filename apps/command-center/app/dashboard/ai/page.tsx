'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_BRAIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';

interface HermesStatus {
  online: boolean;
  model: string;
  secondBrain: boolean;
  liveOps: boolean;
  knowledgeCount: number;
  edgeDevices: Array<{ deviceId: string; status: string; lastSeenMs: number; online: boolean }>;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  sources?: Array<{ title: string }>;
  durationMs?: number;
  error?: boolean;
}

const getToken = () =>
  (typeof localStorage !== 'undefined'
    ? localStorage.getItem('auth_token') || localStorage.getItem('authToken') || ''
    : '');

export default function HermesPage() {
  const [status, setStatus] = useState<HermesStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await fetch(`${API_URL}/hermes/status`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setStatus(await res.json());
    } catch { /* offline */ }
    setStatusLoading(false);
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API_URL}/hermes/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ message: text, messages: history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: err.error || `Request failed (${res.status})`,
          error: true,
        }]);
      } else {
        const data = await res.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response || '(no response)',
          toolsUsed: data.toolsUsed,
          sources: data.sources,
          durationMs: data.durationMs,
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Network error — Hermes unreachable',
        error: true,
      }]);
    } finally {
      setThinking(false);
      // Restore focus to input on desktop
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [input, thinking, messages]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const SUGGESTED = [
    'What is the status of wisepi?',
    'What happened recently?',
    'What does the Second Brain know about WISE²?',
    'How many services are online?',
  ];

  const deviceBadge = (d: HermesStatus['edgeDevices'][0]) => {
    const stale = d.lastSeenMs > 120000;
    const color = stale ? 'text-amber-400' : d.status === 'online' ? 'text-green-400' : 'text-red-400';
    return (
      <span key={d.deviceId} className={`text-[10px] font-mono ${color}`}>
        {d.deviceId} {d.status.toUpperCase()}{stale ? ' (stale)' : ''}
      </span>
    );
  };

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 60px)' }}>
      {/* Header */}
      <div className="shrink-0 space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="wise-page-title">Hermes</h1>
            <p className="wise-page-subtitle">WISE² Master Intelligence Agent</p>
          </div>
          <button onClick={loadStatus} className="wise-btn-secondary text-xs px-2 py-1 shrink-0">
            Refresh
          </button>
        </div>

        {/* Status strip */}
        <div className="wise-card p-1">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {statusLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-4 py-3"><div className="wise-skeleton h-4 w-20" /></div>
              ))
            ) : status ? (
              <>
                <div className="px-4 py-3 border-r border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${status.online ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className={`text-sm font-semibold ${status.online ? 'text-green-400' : 'text-red-400'}`}>
                      {status.online ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-0.5">
                    Hermes · {status.model}
                  </div>
                </div>
                <div className="px-4 py-3 border-r border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${status.secondBrain ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className={`text-sm font-semibold ${status.secondBrain ? 'text-green-400' : 'text-red-400'}`}>
                      {status.secondBrain ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-0.5">
                    Second Brain · {status.knowledgeCount} items
                  </div>
                </div>
                <div className="px-4 py-3 border-r border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${status.liveOps ? 'bg-green-400' : 'bg-amber-400'}`} />
                    <span className={`text-sm font-semibold ${status.liveOps ? 'text-green-400' : 'text-amber-400'}`}>
                      {status.liveOps ? 'Connected' : 'Degraded'}
                    </span>
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-0.5">
                    Live Ops Stream
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    {status.edgeDevices.length > 0
                      ? status.edgeDevices.map(deviceBadge)
                      : <span className="text-[10px] text-text-muted">No devices</span>}
                  </div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-0.5">
                    Edge Network
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-4 px-4 py-3 text-xs text-text-muted">Hermes offline — check Second Brain service</div>
            )}
          </div>
        </div>
      </div>

      {/* Chat area — grows to fill available space, natural scroll */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 gap-5">
            <div className="text-center">
              <div className="text-4xl mb-2">⚡</div>
              <p className="text-sm font-semibold text-text-secondary">Ask Hermes anything about WISE²</p>
              <p className="text-xs text-text-muted mt-1">Uses live telemetry, Second Brain RAG, and Ollama inference</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="text-left p-3 rounded-lg bg-wise-black/40 border border-border-subtle hover:border-wise-electric/40 transition-colors text-xs text-text-secondary"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4 pb-4 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${m.role === 'user'
                  ? 'bg-wise-electric/10 border border-wise-electric/20 rounded-2xl rounded-br-sm px-4 py-3'
                  : m.error
                    ? 'bg-red-500/10 border border-red-500/20 rounded-2xl rounded-bl-sm px-4 py-3'
                    : 'bg-wise-black/50 border border-border-subtle rounded-2xl rounded-bl-sm px-4 py-3'
                }`}>
                  {m.role === 'assistant' && !m.error && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[9px] font-bold tracking-widest text-wise-electric uppercase">Hermes</span>
                      {m.toolsUsed && m.toolsUsed.length > 0 && (
                        <span className="text-[9px] text-text-muted">
                          · {m.toolsUsed.join(', ')}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{m.content}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border-subtle">
                      <p className="text-[10px] text-text-muted mb-1">Sources</p>
                      {m.sources.map(s => (
                        <p key={s.title} className="text-[10px] text-wise-electric/70">· {s.title}</p>
                      ))}
                    </div>
                  )}
                  {m.durationMs && (
                    <p className="text-[9px] text-text-muted mt-1.5">{(m.durationMs / 1000).toFixed(1)}s</p>
                  )}
                </div>
              </div>
            ))}
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-wise-black/50 border border-border-subtle rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[9px] font-bold tracking-widest text-wise-electric uppercase">Hermes</span>
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-wise-electric/60 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input — sticks to bottom, mobile-safe */}
        <div className="shrink-0 pt-3 pb-[env(safe-area-inset-bottom,8px)]">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about system status, WISE² operations, your devices…"
              rows={1}
              disabled={thinking || !status?.online}
              className="flex-1 resize-none bg-wise-black/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric/50 transition-colors disabled:opacity-50"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
            />
            <button
              onClick={send}
              disabled={thinking || !input.trim() || !status?.online}
              className="shrink-0 wise-btn-primary px-4 py-3 rounded-xl disabled:opacity-40 transition-opacity"
            >
              {thinking ? (
                <span className="text-xs">…</span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="mt-2 text-[10px] text-text-muted hover:text-text-secondary transition-colors"
            >
              Clear conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

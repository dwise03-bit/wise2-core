'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Badge, Button } from '../../../src/components/ui';
import { useAuth } from '../../../src/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3011/api';
const BRAIN_API_URL = process.env.NEXT_PUBLIC_BRAIN_API_URL || '/brain-api';

interface HermesStatus {
  status: 'online' | 'degraded' | 'offline' | string;
  model: string;
  provider?: string;
  ollama?: { status?: string; endpoint?: string; error?: string };
  context?: number;
  predictTokens?: number;
  think?: boolean;
}

interface BrainHealth {
  overallStatus: string;
  components: {
    ai?: { status?: string };
    automation?: { status?: string };
    documents?: { status?: string };
    graph?: { status?: string };
  };
}

interface BrainStats {
  totalOperations?: number;
  successRate?: number;
  totalCostUSD?: number;
  byOperationType?: Record<string, number>;
}

interface DiscordStatus {
  configured: boolean;
  channels: {
    alerts: boolean;
    builds: boolean;
    deployments: boolean;
    decisions: boolean;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  sources?: Array<{ title: string }>;
  durationMs?: number;
  error?: boolean;
}

export default function HermesPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [status, setStatus] = useState<HermesStatus | null>(null);
  const [brainHealth, setBrainHealth] = useState<BrainHealth | null>(null);
  const [brainStats, setBrainStats] = useState<BrainStats | null>(null);
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [discordSending, setDiscordSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadStatus = useCallback(async () => {
    if (!token) {
      setStatusLoading(false);
      return;
    }

    setStatusLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [hermesRes, brainHealthRes, brainStatsRes, discordRes] = await Promise.allSettled([
        fetch(`${API_URL}/v1/hermes/health`, { headers }),
        fetch(`${BRAIN_API_URL}/brain/dashboard/health`, { headers }),
        fetch(`${BRAIN_API_URL}/brain/dashboard/ai/stats`, { headers }),
        fetch('/api/integrations/discord'),
      ]);

      if (hermesRes.status === 'fulfilled' && hermesRes.value.ok) {
        setStatus(await hermesRes.value.json());
      }

      if (brainHealthRes.status === 'fulfilled' && brainHealthRes.value.ok) {
        setBrainHealth(await brainHealthRes.value.json());
      }

      if (brainStatsRes.status === 'fulfilled' && brainStatsRes.value.ok) {
        setBrainStats(await brainStatsRes.value.json());
      }

      if (discordRes.status === 'fulfilled' && discordRes.value.ok) {
        setDiscordStatus(await discordRes.value.json());
      }
    } catch {
      // offline
    }
    setStatusLoading(false);
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id || !token) {
      setStatusLoading(false);
      return;
    }
    loadStatus();
  }, [authLoading, loadStatus, token, user?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  const sendDiscordTest = useCallback(async () => {
    if (discordSending) return;

    setDiscordSending(true);
    try {
      const res = await fetch('/api/integrations/discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'alerts',
          title: 'WISE2 Hermes Alert Test',
          description: 'Command-center test alert from the Hermes dashboard.',
          severity: 'info',
          fields: [
            { name: 'User', value: user?.email || 'Unknown', inline: true },
            { name: 'Source', value: 'command-center/app/dashboard/ai', inline: true },
          ],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setDiscordStatus(prev => ({
        configured: prev?.configured ?? true,
        channels: prev?.channels ?? { alerts: true, builds: false, deployments: false, decisions: false },
      }));
    } catch (err) {
      console.error('Discord test failed:', err);
    } finally {
      setDiscordSending(false);
    }
  }, [discordSending, user?.email]);

  const send = useCallback(async () => {
    if (!token) return;

    const text = input.trim();
    if (!text || thinking) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch(`${API_URL}/v1/hermes/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
  }, [input, thinking, messages, token]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const SUGGESTED = [
    'What is the status of wisepi?',
    'What happened recently?',
    'What does the Second Brain know about WISE²?',
    'How many services are online?',
  ];

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100dvh - 60px)' }}>
      {/* Header */}
      <div className="shrink-0 space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">⚡ Hermes</h1>
            <p className="text-sm text-text-muted mt-1">WISE² Master Intelligence Agent</p>
          </div>
          <Button variant="secondary" size="sm" onClick={loadStatus}>Refresh</Button>
        </div>

        {/* Status rail */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {statusLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 animate-pulse bg-border-medium rounded" />
                  <div className="h-3 w-32 animate-pulse bg-border-medium rounded" />
                </div>
              ))
            ) : status ? (
              <>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${status.status === 'online' ? 'bg-success' : status.status === 'degraded' ? 'bg-warning' : 'bg-danger'}`} />
                    <span className={`text-sm font-semibold ${status.status === 'online' ? 'text-success' : status.status === 'degraded' ? 'text-warning' : 'text-danger'}`}>
                      {status.status?.toUpperCase?.() || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="info">Hermes</Badge>
                    <Badge variant="neutral">{status.model}</Badge>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-2">
                    Provider · {status.provider || 'unknown'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${brainHealth?.overallStatus === 'healthy' ? 'bg-success' : brainHealth?.overallStatus === 'degraded' ? 'bg-warning' : 'bg-danger'}`} />
                    <span className={`text-sm font-semibold ${brainHealth?.overallStatus === 'healthy' ? 'text-success' : brainHealth?.overallStatus === 'degraded' ? 'text-warning' : 'text-danger'}`}>
                      {brainHealth?.overallStatus?.toUpperCase?.() || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="info">Second Brain</Badge>
                    <Badge variant="neutral">{brainHealth?.components?.documents?.status || 'unknown'}</Badge>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-2">
                    Graph · {brainHealth?.components?.graph?.status || 'unknown'}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${discordStatus?.configured ? 'bg-success' : 'bg-warning'}`} />
                    <span className={`text-sm font-semibold ${discordStatus?.configured ? 'text-success' : 'text-warning'}`}>
                      {discordStatus?.configured ? 'Configured' : 'Missing'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={discordStatus?.channels.alerts ? 'success' : 'warning'}>Alerts</Badge>
                    <Badge variant={discordStatus?.channels.deployments ? 'success' : 'neutral'}>Deployments</Badge>
                    <Badge variant={discordStatus?.channels.builds ? 'success' : 'neutral'}>Builds</Badge>
                  </div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-2">
                    Decisions · {discordStatus?.channels.decisions ? 'enabled' : 'disabled'}
                  </p>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="rounded-lg bg-wise-black/30 border border-border-subtle p-2">
                      <div className="text-[9px] uppercase tracking-wider text-text-muted">Ops</div>
                      <div className="text-sm font-semibold text-text-primary">{brainStats?.totalOperations ?? '--'}</div>
                    </div>
                    <div className="rounded-lg bg-wise-black/30 border border-border-subtle p-2">
                      <div className="text-[9px] uppercase tracking-wider text-text-muted">Success</div>
                      <div className="text-sm font-semibold text-text-primary">
                        {typeof brainStats?.successRate === 'number' ? `${brainStats.successRate.toFixed(1)}%` : '--'}
                      </div>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={sendDiscordTest} disabled={discordSending}>
                    {discordSending ? 'Sending…' : 'Send Discord Test'}
                  </Button>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-text-muted mt-2">
                    Cost · {typeof brainStats?.totalCostUSD === 'number' ? `$${brainStats.totalCostUSD.toFixed(2)}` : '--'}
                  </p>
                </div>
              </>
            ) : (
              <div className="col-span-1 md:col-span-2 xl:col-span-4 text-xs text-text-muted">Hermes offline or authentication missing — check the API and token.</div>
            )}
          </div>
        </Card>
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
              disabled={thinking || status?.status !== 'online'}
              className="flex-1 resize-none bg-wise-black/60 border border-border-subtle rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric/50 transition-colors disabled:opacity-50"
              style={{ maxHeight: '120px', overflowY: 'auto' }}
              onInput={e => {
                const t = e.currentTarget;
                t.style.height = 'auto';
                t.style.height = Math.min(t.scrollHeight, 120) + 'px';
              }}
            />
            <Button
              variant="primary"
              size="md"
              onClick={send}
              disabled={thinking || !input.trim() || status?.status !== 'online'}
              className="shrink-0"
            >
              {thinking ? '…' : '↗'}
            </Button>
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

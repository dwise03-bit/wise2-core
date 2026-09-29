'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { analytics } from '@/lib/analytics';
import { ActionConfirm } from './ActionConfirm';
import type { ChatMessage, GlowColor, MascotState } from './useWiseImpStore';
import type { WiseImpAction } from '@/lib/wise-imp/actions';

const SUGGESTED_QUESTIONS = [
  'What is WISE²?',
  'I have an idea but don\'t know where to start',
  'What does an AI Business Audit cost?',
];

interface ChatPanelProps {
  messages: ChatMessage[];
  loading: boolean;
  aiUnavailable: boolean;
  pendingAction: WiseImpAction | null;
  glowColor: GlowColor;
  mascotState: MascotState;
  onSend: (text: string) => void;
  onConfirmAction: () => void;
  onDismissAction: () => void;
  onStartIntake: () => void;
  onOpenContact: () => void;
}

export function ChatPanel({
  messages,
  loading,
  aiUnavailable,
  pendingAction,
  glowColor,
  mascotState,
  onSend,
  onConfirmAction,
  onDismissAction,
  onStartIntake,
  onOpenContact,
}: ChatPanelProps) {
  const [draft, setDraft] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, pendingAction, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  };

  const handleSuggested = (question: string) => {
    analytics.track('wise_imp_suggested_question_selected', { question });
    onSend(question);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Chat Messages */}
      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}
      >
        {messages.length === 0 && !aiUnavailable && (
          <div>
            <p style={{ color: '#8D98A5', fontSize: 13, margin: '0 0 10px' }}>
              Hey — I&apos;m Wise Imp. Ask me anything about WISE², or tell me what you&apos;re trying to build.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSuggested(q)}
                  style={{
                    textAlign: 'left',
                    background: 'rgba(57, 255, 20, 0.08)',
                    border: '1px solid rgba(57, 255, 20, 0.25)',
                    borderRadius: 8,
                    padding: '8px 10px',
                    color: '#39FF14',
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(57, 255, 20, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(57, 255, 20, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(57, 255, 20, 0.25)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.role === 'user' ? 'rgba(0, 148, 255, 0.15)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${m.role === 'user' ? 'rgba(0, 148, 255, 0.35)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12,
              padding: '8px 12px',
              color: '#E8ECEF',
              fontSize: 13,
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap',
            }}
          >
            {m.content}
          </div>
        ))}

        {loading && (
          <div style={{ alignSelf: 'flex-start', color: '#8D98A5', fontSize: 12, padding: '4px 2px' }}>
            Wise Imp is thinking…
          </div>
        )}

        {pendingAction && (
          <ActionConfirm action={pendingAction} onConfirm={onConfirmAction} onDismiss={onDismissAction} />
        )}

        {aiUnavailable && (
          <div
            role="alert"
            style={{
              background: 'rgba(255, 176, 32, 0.08)',
              border: '1px solid rgba(255, 176, 32, 0.35)',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              color: '#E8ECEF',
            }}
          >
            <p style={{ margin: '0 0 8px' }}>
              I can&apos;t reach the AI service right now. Here&apos;s how to get where you need to go directly:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                type="button"
                onClick={onStartIntake}
                style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#39FF14', cursor: 'pointer', padding: 0, fontSize: 13 }}
              >
                → Start a project intake
              </button>
              <Link href="/consulting" style={{ color: '#0094FF', fontSize: 13 }}>
                → See consulting services &amp; FAQ
              </Link>
              <button
                type="button"
                onClick={onOpenContact}
                style={{ textAlign: 'left', background: 'transparent', border: 'none', color: '#0094FF', cursor: 'pointer', padding: 0, fontSize: 13 }}
              >
                → Contact the team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <label htmlFor="wise-imp-input" className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
          Message Wise Imp
        </label>
        <input
          id="wise-imp-input"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask Wise Imp anything…"
          disabled={loading}
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 8,
            padding: '8px 10px',
            color: '#E8ECEF',
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={loading || !draft.trim()}
          style={{
            background: '#39FF14',
            color: '#050505',
            border: 'none',
            borderRadius: 8,
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: 13,
            cursor: loading || !draft.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !draft.trim() ? 0.5 : 1,
            transition: 'all 0.2s ease',
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

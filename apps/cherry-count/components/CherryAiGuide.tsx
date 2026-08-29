'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bot, MessageCircle, Play, X } from 'lucide-react';
import { useCherryTour } from '@/contexts/TourContext';
import { DEMO_AI_INSIGHT } from '@/lib/demo-data';

const QUICK_ASKS = [
  'What should I pack?',
  'What is low stock?',
  'Who is my top customer?',
  'How does Pop-Up Mode work?',
];

const QUICK_ANSWERS: Record<string, string> = {
  'what should i pack?':
    'For Downtown Night Market, prioritize Cherry Bomb Hoodies (M/L), Lavender Crop Tops, and your top 3 sellers. Pack Smart shows what is already in each bin.',
  'what is low stock?':
    'Lavender Crop Top (Size S) is below minimum — only 2 left. Restock before the next pop-up or swap in Pink Aura Tee as backup.',
  'who is my top customer?':
    'Brianna R. is VIP with $1,240 lifetime value. She needs a Medium — flag that for the next event.',
  'how does pop-up mode work?':
    'Pop-Up Mode is live selling on the floor: quick checkout, bin lookup, and a packing checklist so nothing gets left behind.',
};

function answerQuestion(question: string): string {
  const key = question.trim().toLowerCase();
  if (QUICK_ANSWERS[key]) return QUICK_ANSWERS[key];
  return `${DEMO_AI_INSIGHT.tip} Ask me about packing, inventory, customers, or pop-ups.`;
}

export function CherryAiGuide() {
  const { start, active } = useCherryTour();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    {
      role: 'ai',
      text: `${DEMO_AI_INSIGHT.greeting} I can start the guided tour or answer quick questions about your boutique.`,
    },
  ]);

  if (active || pathname.startsWith('/presentation') || pathname === '/') return null;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (/start.*tour|guided tour|walk me through/i.test(trimmed)) {
      setOpen(false);
      start();
      return;
    }

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: trimmed },
      { role: 'ai', text: answerQuestion(trimmed) },
    ]);
    setInput('');
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 pb-28">
          <div className="glass-panel flex max-h-[70vh] w-full max-w-lg flex-col border-cherry-hot/30">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-cherry-hot" />
                <div>
                  <p className="text-sm font-semibold">Cherry AI</p>
                  <p className="text-[10px] text-white/40">Demo guide · read-only insights</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-white/50" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'ai'
                      ? 'bg-cherry-hot/10 text-white/85'
                      : 'ml-8 bg-white/10 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 p-3">
              {QUICK_ASKS.map((ask) => (
                <button
                  key={ask}
                  type="button"
                  onClick={() => send(ask)}
                  className="rounded-full border border-cherry-hot/30 px-2.5 py-1 text-[10px] text-cherry-lavender"
                >
                  {ask}
                </button>
              ))}
            </div>

            <form
              className="flex gap-2 border-t border-white/10 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Cherry AI..."
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-cherry-hot/50"
              />
              <button
                type="submit"
                className="rounded-xl bg-cherry-hot px-3 py-2 text-sm font-semibold"
              >
                Send
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                start();
              }}
              className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-xl border border-cherry-hot/40 bg-cherry-hot/10 py-2.5 text-sm font-semibold text-cherry-hot"
            >
              <Play className="h-4 w-4" />
              Start Guided Tour
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cherry-hot to-cherry-red shadow-glow-sm transition hover:scale-105 active:scale-95"
        aria-label="Open Cherry AI guide"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
    </>
  );
}

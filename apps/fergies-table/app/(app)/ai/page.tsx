'use client';

import { FormEvent, useRef, useState } from 'react';
import { Play, Send } from 'lucide-react';
import { ClocheMark, PageHeader } from '@/components/ui';
import { FERGIE_LAYOUT } from '@/lib/brand-tokens';
import { conciergeReply } from '@/lib/ai-concierge';
import { useOwner } from '@/contexts/OwnerContext';
import { useFergieTour } from '@/contexts/TourContext';

type ChatMsg = { role: 'user' | 'ai'; text: string };

export default function AiPage() {
  const { isOwner } = useOwner();
  const { start } = useFergieTour();
  const starters = isOwner
    ? ['What is in the kitchen?', 'Who is a new lead?', 'Price a cocktail soirée']
    : ['Plan a dinner for two', 'Price a cocktail soirée', 'What can I make gluten-free?'];
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const role = isOwner ? 'owner' : 'guest';

  const greeting = isOwner
    ? 'I am Savôré, your house assistant. Ask about kitchen tickets, leads, the book, or start the guided tour.'
    : "Welcome to Fergie's Table. I can plan a dinner, shape a catering menu, or hold a date. What are we celebrating?";

  const visible = messages.length ? messages : [{ role: 'ai' as const, text: greeting }];

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (/start.*tour|guided tour|walk me through/i.test(trimmed)) {
      start();
      return;
    }
    const next: ChatMsg[] = [
      ...visible,
      { role: 'user', text: trimmed },
      { role: 'ai', text: conciergeReply(trimmed, role) },
    ];
    setMessages(next);
    setInput('');
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className={`${FERGIE_LAYOUT.container} flex min-h-[calc(100vh-7rem)] flex-col py-6`}>
      <div data-tour="ai-briefing">
        <PageHeader
          title={isOwner ? 'House assistant' : 'AI Concierge'}
          subtitle="Savôré"
          action={
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center gap-1 rounded-full border border-fergie-gold/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-fergie-gold"
            >
              <Play className="h-3 w-3" />
              Tour
            </button>
          }
        />
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto pb-4">
        {visible.map((msg, i) => (
          <div key={`${msg.role}-${i}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <span className="mr-2 mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-fergie-royal/30">
                <ClocheMark className="h-5 w-5" />
              </span>
            )}
            <div
              className={`max-w-[80%] rounded-fergie px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-fergie-royal to-fergie-deep text-white'
                  : 'border border-fergie-gold/20 bg-fergie-charcoal/80 text-white/85'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-3 flex gap-2 overflow-x-auto">
        {starters.map((starter) => (
          <button
            key={starter}
            type="button"
            onClick={() => send(starter)}
            className="whitespace-nowrap rounded-full border border-fergie-gold/25 px-3 py-1.5 text-xs text-fergie-gold"
          >
            {starter}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isOwner ? 'Ask about the house…' : 'Ask about a menu, date, or event…'}
          className="flex-1 rounded-full border border-fergie-gold/20 bg-black/40 px-4 py-3 text-sm outline-none focus:border-fergie-gold"
        />
        <button
          type="submit"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-fergie-royal to-fergie-gold text-white"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Check,
  MessageCircle,
  Send,
  X,
  Sparkles,
} from 'lucide-react';
import { useSoundLabModals } from './SoundLabModals';

const CAPABILITIES = [
  'Chat with your AI Producer',
  'Get genre & style suggestions',
  'Instant lyric & melody ideas',
  'Vocal style matching',
  'Arrangement guidance',
  'Mix & master recommendations',
  'Project management & files',
];

const QUICK_PROMPTS = [
  'Create a jingle for my business',
  'Help me choose a genre',
  'Write a hook',
  'Build a podcast intro',
  'Create a commercial concept',
  'Help me develop my brand sound',
];

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

function craftReply(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('jingle')) {
    return "Let's build your jingle. What's the vibe — upbeat & energetic, warm & trustworthy, or bold & modern? Also, how long: 15, 30, or 60 seconds?";
  }
  if (p.includes('genre')) {
    return "Tell me about your brand's personality in three words, and I'll suggest 2-3 genres that fit — pop, cinematic, lo-fi, corporate electronic, or acoustic are common starting points.";
  }
  if (p.includes('hook') || p.includes('lyric')) {
    return 'Give me your brand name and one core promise you make to customers — I\'ll draft a few hook lines built around it.';
  }
  if (p.includes('podcast')) {
    return "Podcast intros usually run 8-15 seconds. Want something minimal and moody, or punchy and energetic? I'll sketch a concept either way.";
  }
  if (p.includes('commercial')) {
    return "For a commercial concept I'll need: the platform (TV/radio/social), target length, and the one emotion you want listeners to feel by the end.";
  }
  if (p.includes('brand sound') || p.includes('sonic')) {
    return "A full sonic brand includes a theme song, a short sonic logo, and a consistent instrumentation palette. Want me to start with the sonic logo — that's usually the fastest win?";
  }
  return "Got it — tell me a bit more about your brand and what this audio is for, and I'll put together a few directions for you.";
}

function ProducerChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hey, I'm your WISE² AI Producer. Tell me about your brand and what you need — a jingle, a full song, a sonic logo — and I'll help you shape it.",
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { role: 'user', text: trimmed }]);
    setInput('');
    setThinking(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { role: 'assistant', text: craftReply(trimmed) }]);
      setThinking(false);
    }, 700 + Math.random() * 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-y-0 right-0 z-[70] w-full sm:w-[420px] bg-[#0a0a0a] border-l border-[#9AFF00]/30 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.6)]"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#9AFF00]/15 border border-[#9AFF00]/40 flex items-center justify-center">
            <Bot size={18} className="text-[#9AFF00]" />
          </div>
          <div>
            <p className="text-sm font-black tracking-wide">AI PRODUCER</p>
            <p className="text-[10px] text-gray-500 tracking-wide">DEMO PREVIEW · SCRIPTED RESPONSES</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white cursor-pointer" aria-label="Close chat">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-4 py-2.5 rounded-lg text-xs leading-relaxed ${
              m.role === 'user'
                ? 'ml-auto bg-[#9AFF00] text-black font-medium'
                : 'bg-white/5 border border-white/10 text-gray-200'
            }`}
          >
            {m.text}
          </div>
        ))}
        {thinking && (
          <div className="bg-white/5 border border-white/10 text-gray-400 text-xs px-4 py-2.5 rounded-lg w-fit flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9AFF00] animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#9AFF00] animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#9AFF00] animate-bounce" />
          </div>
        )}
      </div>

      {messages.length < 3 && (
        <div className="px-5 pb-3 flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="text-[10px] px-2.5 py-1.5 rounded border border-white/10 text-gray-300 hover:border-[#9AFF00]/50 hover:text-[#9AFF00] transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-4 border-t border-white/10 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your AI Producer..."
          className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#9AFF00]/60"
        />
        <button
          type="submit"
          className="px-3.5 py-2.5 rounded bg-[#9AFF00] text-black hover:shadow-[0_0_16px_rgba(154,255,0,0.5)] transition-shadow cursor-pointer"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>
    </motion.div>
  );
}

export function AIProducer() {
  const { producerOpen, openProducer, closeProducer } = useSoundLabModals();

  return (
    <section className="bg-black py-8 px-5 md:px-8">
      <div className="max-w-[1440px] mx-auto rounded-2xl border border-[#9AFF00]/30 bg-gradient-to-br from-[#0d1a05] to-black p-8 md:p-10 grid md:grid-cols-[1fr_auto] gap-8 items-center">
        <div>
          <p className="text-xs font-black tracking-widest text-[#9AFF00] mb-2">LIVE AI PRODUCER</p>
          <h2 className="text-xl md:text-2xl font-black tracking-wide mb-4">YOUR PERSONAL SOUND ENGINEER</h2>
          <ul className="grid sm:grid-cols-2 gap-2 mb-6">
            {CAPABILITIES.map((c) => (
              <li key={c} className="flex items-center gap-2 text-xs text-gray-300">
                <Check size={14} className="text-[#9AFF00] shrink-0" />
                {c}
              </li>
            ))}
          </ul>
          <button
            onClick={openProducer}
            className="flex items-center gap-2 px-5 py-3 rounded bg-[#9AFF00] text-black text-xs font-black tracking-wide hover:shadow-[0_0_24px_rgba(154,255,0,0.5)] transition-shadow cursor-pointer"
          >
            <MessageCircle size={16} />
            TALK TO AI PRODUCER
          </button>
        </div>

        <div className="relative w-40 h-40 md:w-52 md:h-52 mx-auto">
          <div className="absolute inset-0 rounded-full bg-[#9AFF00]/15 blur-2xl animate-pulse" />
          <div className="relative w-full h-full rounded-full border-2 border-[#9AFF00]/50 bg-[#0a0a0a] flex items-center justify-center">
            <Bot size={64} className="text-[#9AFF00]" />
            <Sparkles size={20} className="absolute top-3 right-6 text-[#9AFF00] animate-pulse" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {producerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProducer}
              className="fixed inset-0 z-[60] bg-black/70"
            />
            <ProducerChat onClose={closeProducer} />
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

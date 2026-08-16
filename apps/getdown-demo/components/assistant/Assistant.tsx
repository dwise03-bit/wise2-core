'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Mic,
  MicOff,
  Play,
  Send,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { QUICK_ASKS, askAssistant, type AssistantReply } from '@/lib/assistant';
import { useVoiceInput } from '@/lib/speech';
import { useTour } from '../tour/TourProvider';
import { GuideAvatar } from './GuideAvatar';

interface Turn {
  role: 'user' | 'guide';
  text: string;
  rows?: string[];
  route?: AssistantReply['route'];
}

const GREETING =
  "I'm the WISE² guide. I can walk you through this command center, or just answer questions about the business. What would you like to do?";

export function Assistant() {
  const { start, active, voice } = useTour();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([{ role: 'guide', text: GREETING }]);
  const [greeted, setGreeted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const respond = useCallback(
    (question: string) => {
      const q = question.trim();
      if (!q) return;

      // Let the owner drive the tour by voice or text.
      if (/\b(start|begin|give me|take me through|walk me through).*(tour|demo|walkthrough)\b/i.test(q)) {
        setTurns((t) => [
          ...t,
          { role: 'user', text: q },
          { role: 'guide', text: 'Starting the guided tour now. I will talk you through each screen.' },
        ]);
        setInput('');
        setOpen(false);
        setTimeout(start, 400);
        return;
      }

      const reply = askAssistant('operations', q);
      setTurns((t) => [...t, { role: 'user', text: q }, { role: 'guide', ...reply }]);
      setInput('');
      voice.speak(reply.text);
    },
    [start, voice],
  );

  const { supported: micSupported, listening, start: startMic, stop: stopMic } = useVoiceInput(
    (text) => respond(text),
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [turns, open]);

  // Greet aloud the first time the owner opens the assistant (a click, so
  // speech synthesis is unlocked by a user gesture).
  useEffect(() => {
    if (open && !greeted) {
      setGreeted(true);
      voice.speakTrack('greeting', GREETING);
    }
  }, [open, greeted, voice]);

  // The tour has its own console; keep the orb out of the way while it runs.
  if (active) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="group fixed bottom-6 right-6 z-[75] flex items-center gap-3 rounded-full border border-gd-neon/40 bg-gd-hull/95 py-2.5 pl-2.5 pr-5 shadow-glow-neon backdrop-blur transition-all hover:border-gd-neon/70"
          aria-label="Open the WISE² guide"
        >
          <GuideAvatar speaking={voice.speaking} size={40} idlePulse />
          <span className="text-left">
            <span className="block font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-gd-neon">
              Ask the Guide
            </span>
            <span className="block text-[10px] text-gd-steel">Voice-guided walkthrough</span>
          </span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-[75] flex h-[560px] w-[min(420px,calc(100vw-3rem))] flex-col overflow-hidden rounded-2xl border border-gd-neon/30 bg-gd-abyss/97 shadow-glow-neon backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-gd-line bg-gd-hull/70 px-4 py-3">
            <GuideAvatar speaking={voice.speaking} size={38} />
            <div className="min-w-0 flex-1">
              <p className="font-display text-xs font-extrabold uppercase tracking-[0.14em] text-white">
                WISE<sup className="text-[8px] text-gd-neon">2</sup> Guide
              </p>
              <p className="text-[10px] text-gd-steel">
                {voice.speaking ? 'Speaking…' : listening ? 'Listening…' : 'Ready'}
              </p>
            </div>
            {voice.supported && (
              <button
                onClick={voice.toggleEnabled}
                title={voice.enabled ? 'Mute' : 'Unmute'}
                className={`rounded-lg border p-1.5 transition-colors ${
                  voice.enabled
                    ? 'border-gd-neon/40 bg-gd-neon/10 text-gd-neon'
                    : 'border-white/10 text-gd-steel hover:bg-white/5'
                }`}
              >
                {voice.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            )}
            <button
              onClick={() => {
                voice.cancel();
                setOpen(false);
              }}
              className="rounded-lg border border-white/10 p-1.5 text-gd-steel transition-colors hover:bg-white/5 hover:text-white"
              aria-label="Close guide"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Start tour CTA */}
          <button
            onClick={() => {
              setOpen(false);
              setTimeout(start, 300);
            }}
            className="flex items-center gap-2.5 border-b border-gd-line bg-gd-neon/[0.07] px-4 py-3 text-left transition-colors hover:bg-gd-neon/[0.14]"
          >
            <Play className="h-4 w-4 shrink-0 fill-current text-gd-neon" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-[11px] font-extrabold uppercase tracking-wider text-gd-neon">
                Take the guided tour
              </span>
              <span className="block text-[10px] text-gd-steel">
                12 steps · I narrate each screen · about 6 minutes
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-gd-neon" />
          </button>

          {/* Conversation */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3.5">
            {turns.map((t, i) => (
              <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[92%] rounded-xl px-3.5 py-2.5 ${
                    t.role === 'user'
                      ? 'border border-gd-electric/35 bg-gd-electric/12'
                      : 'border border-gd-line bg-gd-hull/70'
                  }`}
                >
                  <p className="text-[13px] leading-relaxed text-white">{t.text}</p>
                  {t.rows && (
                    <div className="mt-2 space-y-1.5">
                      {t.rows.map((r, j) => (
                        <div
                          key={j}
                          className="flex items-start gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] leading-relaxed text-gd-chrome"
                        >
                          <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-gd-neon" />
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                  {t.route && (
                    <Link
                      href={t.route.href}
                      onClick={() => setOpen(false)}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-gd-electric/45 bg-gd-electric/12 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gd-electric transition-colors hover:bg-gd-electric/22"
                    >
                      {t.route.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick asks */}
          <div className="flex flex-wrap gap-1.5 border-t border-gd-line px-4 py-2.5">
            {QUICK_ASKS.slice(0, 4).map((q) => (
              <button
                key={q}
                onClick={() => respond(q)}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1 text-[10px] text-gd-chrome transition-colors hover:border-white/25 hover:text-white"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 border-t border-gd-line bg-gd-hull/50 px-3 py-3">
            {micSupported && (
              <button
                onClick={listening ? stopMic : startMic}
                title={listening ? 'Stop listening' : 'Ask by voice'}
                className={`shrink-0 rounded-lg border p-2 transition-all ${
                  listening
                    ? 'animate-pulseRing border-gd-neon/60 bg-gd-neon/20 text-gd-neon'
                    : 'border-white/10 text-gd-steel hover:bg-white/5 hover:text-white'
                }`}
              >
                {listening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && respond(input)}
              placeholder={listening ? 'Listening…' : 'Ask about the business…'}
              className="min-w-0 flex-1 rounded-lg border border-gd-line bg-gd-void/60 px-3 py-2 text-[13px] text-white placeholder:text-gd-steel/70 focus:border-gd-electric/50 focus:outline-none"
            />
            <button
              onClick={() => respond(input)}
              className="shrink-0 rounded-lg border border-gd-electric/45 bg-gd-electric/15 p-2 text-gd-electric transition-colors hover:bg-gd-electric/25"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

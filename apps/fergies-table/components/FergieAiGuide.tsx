'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Mic, Play, Send, X } from 'lucide-react';
import { ClocheMark } from '@/components/ui';
import { conciergeReply } from '@/lib/ai-concierge';
import { unlockSavoreVoice, useSavoreSpeech, useVoiceInput } from '@/lib/speech';
import { useOwner } from '@/contexts/OwnerContext';
import { useFergieTour } from '@/contexts/TourContext';

const OWNER_ASKS = ['What is in the kitchen?', 'Who is a new lead?', 'August revenue?'];
const GUEST_ASKS = ['Plan a dinner for two', 'What is popular?', 'Book a table'];

export function FergieAiGuide() {
  const { start, active } = useFergieTour();
  const { isOwner } = useOwner();
  const pathname = usePathname();
  const { speak, cancel, speaking } = useSavoreSpeech();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const role = isOwner ? 'owner' : 'guest';
  const asks = isOwner ? OWNER_ASKS : GUEST_ASKS;

  const greeting = isOwner
    ? 'Good evening, Chef. I am Savôré. I can walk you through the house, or answer for the kitchen, the book, and your leads.'
    : 'Welcome. I am Savôré, your concierge. I can walk you through the table, or help you plan a dinner, catering, or a hold.';

  useEffect(() => {
    setMessages([{ role: 'ai', text: greeting }]);
  }, [greeting]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      if (/start.*tour|guided tour|walk me through|show me around|voice tour/i.test(trimmed)) {
        setOpen(false);
        cancel();
        start();
        return;
      }

      const reply = conciergeReply(trimmed, role);
      setMessages((prev) => [...prev, { role: 'user', text: trimmed }, { role: 'ai', text: reply }]);
      setInput('');
      speak(reply);
    },
    [cancel, role, speak, start],
  );

  const mic = useVoiceInput(send);

  if (active || pathname === '/' || pathname.startsWith('/privacy') || pathname.startsWith('/support')) {
    return null;
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 pb-28">
          <div className="glass-panel flex max-h-[70vh] w-full max-w-lg flex-col border-fergie-gold/30">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <ClocheMark className="h-6 w-6" spinning={speaking} />
                <div>
                  <p className="text-sm font-semibold">Savôré</p>
                  <p className="text-[10px] text-white/40">
                    {speaking
                      ? 'Savôré is speaking'
                      : mic.listening
                        ? 'Listening…'
                        : isOwner
                          ? 'Voice assistant · Command'
                          : 'Voice concierge · guest table'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  cancel();
                  setOpen(false);
                }}
                aria-label="Close"
              >
                <X className="h-5 w-5 text-white/50" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'ai' ? 'bg-fergie-royal/20 text-white/85' : 'ml-8 bg-white/10 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 p-3">
              {asks.map((ask) => (
                <button
                  key={ask}
                  type="button"
                  onClick={() => send(ask)}
                  className="rounded-full border border-fergie-gold/30 px-2.5 py-1 text-[10px] text-fergie-gold"
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
                placeholder={
                  mic.listening ? 'Listening…' : isOwner ? 'Ask about the house…' : 'Ask about a menu or date…'
                }
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-fergie-gold/50"
              />
              {mic.supported && (
                <button
                  type="button"
                  onClick={() => {
                    if (mic.listening) mic.stop();
                    else {
                      cancel();
                      unlockSavoreVoice();
                      mic.start();
                    }
                  }}
                  className={`rounded-xl px-3 py-2 ${
                    mic.listening ? 'bg-fergie-rose text-fergie-black' : 'border border-fergie-gold/40 text-fergie-gold'
                  }`}
                  aria-label={mic.listening ? 'Stop listening' : 'Ask by voice'}
                >
                  <Mic className="h-4 w-4" />
                </button>
              )}
              <button type="submit" className="rounded-xl bg-fergie-gold px-3 py-2 text-sm font-semibold text-fergie-black">
                <Send className="h-4 w-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => {
                cancel();
                setOpen(false);
                start();
              }}
              className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-xl border border-fergie-gold/40 bg-fergie-gold/10 py-2.5 text-sm font-semibold text-fergie-gold"
            >
              <Play className="h-4 w-4" />
              Start voice tour
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          unlockSavoreVoice();
          cancel();
          setOpen(true);
          speak(greeting);
        }}
        className={`fixed bottom-24 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fergie-royal to-fergie-gold shadow-glow-gold transition hover:scale-105 active:scale-95 ${
          speaking ? 'voice-pulse' : ''
        }`}
        aria-label="Open Savôré assistant"
      >
        <ClocheMark className="h-7 w-7" spinning={speaking} />
      </button>
    </>
  );
}

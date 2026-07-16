import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { Send } from "lucide-react";
import { toast } from "sonner";

const SESSION_KEY = "hermes_session";

function ensureSession() {
  let s = localStorage.getItem(SESSION_KEY);
  if (!s) { s = "hermes-" + Math.random().toString(36).slice(2); localStorage.setItem(SESSION_KEY, s); }
  return s;
}

export default function HermesChat({ compact }) {
  const sessionId = ensureSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    api.get(`/hermes/history/${sessionId}`).then(r => setMessages(r.data.messages || [])).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const send = async (e) => {
    e?.preventDefault?.();
    if (!input.trim() || sending) return;
    const q = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setSending(true);
    try {
      const { data } = await api.post("/hermes/chat", { session_id: sessionId, message: q });
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (err) {
      toast.error("Hermes is offline: " + (err?.response?.data?.detail || err.message));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`card-panel ${compact ? "p-3" : "p-5"} flex flex-col h-full`} data-testid="hermes-chat">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon-cyan to-neon-deep flex items-center justify-center text-bg-base font-display font-bold text-[10px]">W<sup>2</sup></div>
          <div className="font-display text-white text-xs">Hermes AI</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-led-green">
          <span className="w-1.5 h-1.5 rounded-full bg-led-green shadow-[0_0_4px_#22c55e]"/> Online
        </div>
      </div>

      <div ref={scrollRef} className={`flex-1 overflow-y-auto space-y-2 ${compact ? "max-h-24 mb-2" : "min-h-[140px] mb-3"}`}>
        {messages.length === 0 && (
          <div className="text-[11px] text-slate-400 leading-snug">
            I can help you with mixing, mastering, sound design, beat making, and more. What are we creating today?
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`text-[11px] leading-snug ${m.role === "user" ? "text-neon-cyan" : "text-slate-200"}`}>
            <span className="font-semibold mr-1">{m.role === "user" ? "You:" : "Hermes:"}</span>
            {m.text}
          </div>
        ))}
        {sending && <div className="text-[11px] text-slate-500 italic">Hermes is thinking…</div>}
      </div>

      <form onSubmit={send} className="flex items-center gap-2">
        <input
          data-testid="hermes-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your sound..."
          className="flex-1 bg-bg-base border border-slate-800 rounded-full px-3 py-1.5 text-[11px] text-white focus:border-neon-cyan/60 focus:outline-none"
        />
        <button data-testid="hermes-send" type="submit" disabled={sending} className="w-7 h-7 rounded-full bg-neon-cyan text-bg-base flex items-center justify-center disabled:opacity-50">
          <Send className="w-3 h-3"/>
        </button>
      </form>
    </div>
  );
}

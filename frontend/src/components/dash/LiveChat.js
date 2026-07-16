import React, { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Users, ChevronDown, Smile, Send, Bot } from "lucide-react";

function Avatar({ name, color, role }) {
  return (
    <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-[#04121f]"
         style={{ background: role === "BOT" ? "#0e2a3a" : color }}>
      {role === "BOT" ? <Bot className="w-3.5 h-3.5 text-neon-cyan" /> : name[0]}
    </div>
  );
}

export default function LiveChat() {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  const load = () => api.get("/chat").then((r) => setMsgs(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight; }, [msgs]);

  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    try {
      const { data } = await api.post("/chat", { text: t });
      setMsgs((m) => [...m, data]);
    } catch {
      toast.error("Failed to send");
    }
  };

  return (
    <div className="panel panel-hover flex flex-col" data-testid="live-chat">
      <div className="flex items-center justify-between px-4 py-3 hair">
        <span className="font-display text-sm font-bold tracking-wider text-white uppercase">Live Chat</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-400"><Users className="w-3.5 h-3.5" /> 358</span>
          <button className="flex items-center gap-1 text-xs text-slate-300 border border-[#1a2942] rounded px-2 py-1 hover:border-neon-cyan/50">
            Top Chat <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[280px] max-h-[360px]">
        {msgs.map((m) => (
          <div key={m.id} className="flex gap-2.5" data-testid="chat-message">
            <Avatar name={m.user} color={m.color} role={m.role} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold" style={{ color: m.color }}>{m.user}</span>
                {m.role === "BOT" && <span className="text-[8px] font-bold text-neon-cyan bg-neon-cyan/15 px-1 rounded">BOT</span>}
                {m.role === "ADMIN" && <span className="text-[8px] font-bold text-fuchsia-300 bg-fuchsia-500/15 px-1 rounded">ADMIN</span>}
              </div>
              <div className="text-[13px] text-slate-300 leading-snug">{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-[#12203a]">
        <div className="flex items-center gap-2 bg-[#0a1120] border border-[#1a2942] rounded-lg px-3 py-1.5">
          <input
            data-testid="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
          />
          <button className="text-slate-500 hover:text-neon-cyan"><Smile className="w-4 h-4" /></button>
          <button className="text-[10px] font-bold text-slate-500 hover:text-neon-cyan">GIF</button>
          <button data-testid="chat-send" onClick={send} className="btn-neon rounded-md px-3 py-1.5 text-xs flex items-center gap-1">
            <Send className="w-3 h-3" /> SEND
          </button>
        </div>
      </div>
    </div>
  );
}

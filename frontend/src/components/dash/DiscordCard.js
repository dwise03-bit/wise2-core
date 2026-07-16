import React from "react";
import { Check } from "lucide-react";

function DiscordGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.43.85-.59 1.23a18.27 18.27 0 0 0-5.94 0C9.87 3.85 9.63 3.36 9.43 3A19.74 19.74 0 0 0 5.67 4.37C2.36 9.29 1.46 14.07 1.91 18.78a19.9 19.9 0 0 0 6.06 3.06c.49-.67.93-1.38 1.3-2.13-.71-.27-1.4-.6-2.04-.99.17-.13.34-.26.5-.4 3.93 1.84 8.18 1.84 12.06 0 .16.14.33.27.5.4-.65.39-1.34.72-2.05.99.38.75.81 1.46 1.3 2.13a19.85 19.85 0 0 0 6.07-3.06c.53-5.45-.9-10.19-3.79-14.41ZM8.68 15.85c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.41-2.16 2.41Zm6.64 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.33-.95 2.41-2.16 2.41Z" />
    </svg>
  );
}

export default function DiscordCard({ data }) {
  const d = data.discord;
  return (
    <div className="panel panel-hover flex flex-col overflow-hidden relative" data-testid="discord-card">
      <div className="absolute inset-0 opacity-40 bg-gradient-to-b from-[#5865F2]/15 via-transparent to-transparent pointer-events-none" />
      <div className="relative px-5 py-5 text-center">
        <div className="text-[10px] tracking-mega text-slate-400 uppercase">Join the Community</div>
        <div className="font-display text-xl font-bold text-white tracking-wide">ON DISCORD</div>

        <div className="my-5 flex justify-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-[#5865F2]/15 border border-[#5865F2]/40"
               style={{ boxShadow: "0 0 30px rgba(88,101,242,0.5)" }}>
            <DiscordGlyph className="w-12 h-12 text-[#8b93ff]" />
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed px-2">
          The official hub for creators, builders, entrepreneurs and dreamers.
        </p>

        <ul className="mt-4 space-y-1.5 text-left px-2">
          {d.benefits.map((b) => (
            <li key={b} className="flex items-center gap-2 text-[13px] text-slate-300">
              <Check className="w-3.5 h-3.5 text-neon-cyan shrink-0" /> {b}
            </li>
          ))}
        </ul>

        <a
          href={d.invite}
          target="_blank"
          rel="noreferrer"
          data-testid="join-discord-btn"
          className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold text-white"
          style={{ background: "#5865F2", boxShadow: "0 0 18px rgba(88,101,242,0.5)" }}
        >
          <DiscordGlyph className="w-4 h-4" /> JOIN DISCORD
        </a>
      </div>

      <div className="mt-auto px-5 py-3 border-t border-[#12203a] flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-glow" /> {d.members_online.toLocaleString()} MEMBERS ONLINE
        </span>
        <div className="flex items-center">
          {d.avatars.slice(0, 5).map((a, i) => (
            <img key={i} src={a} alt="" className="w-6 h-6 rounded-full border-2 border-[#070b16] -ml-2 first:ml-0 object-cover" />
          ))}
          <span className="text-[10px] text-slate-400 ml-1">+1.2K</span>
        </div>
      </div>
    </div>
  );
}

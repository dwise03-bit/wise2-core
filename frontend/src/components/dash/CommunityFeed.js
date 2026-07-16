import React, { useState } from "react";
import { PanelHeader, ViewAll, Waveform } from "./ui";
import { api } from "@/lib/api";
import { Rss, Heart, MessageCircle, Play } from "lucide-react";

function Radar() {
  const pts = [50, 20, 80, 35, 88, 25, 62];
  const n = pts.length;
  const coords = pts.map((v, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (v / 100) * 34;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {[12, 24, 34].map((r) => <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#1a2942" strokeWidth="0.7" />)}
      <polygon points={coords} fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="1.2" />
    </svg>
  );
}

export default function CommunityFeed({ data }) {
  const [feed, setFeed] = useState(data.feed);
  const [liked, setLiked] = useState({});

  const like = async (id) => {
    if (liked[id]) return;
    setLiked((l) => ({ ...l, [id]: true }));
    setFeed((f) => f.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
    api.post(`/feed/${id}/like`).catch(() => {});
  };

  return (
    <div className="panel panel-hover flex flex-col" data-testid="community-feed">
      <PanelHeader icon={Rss} title="Community Feed" right={<ViewAll />} />
      <div className="px-3 py-2 space-y-3">
        {feed.map((p) => (
          <div key={p.id} className="p-2 rounded-lg hover:bg-white/5 transition-colors" data-testid="feed-post">
            <div className="flex items-start gap-2.5">
              <img src={p.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neon-cyan">{p.user}</span>
                  <span className="text-[10px] text-slate-600">{p.when}</span>
                </div>
                <p className="text-[13px] text-slate-300 leading-snug">{p.text}</p>
                <div className="mt-2 flex items-center gap-2">
                  {p.kind === "radar" ? <Radar /> : (
                    <div className="flex items-center gap-2 flex-1">
                      <button className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center shrink-0">
                        <Play className="w-3 h-3 text-neon-cyan fill-neon-cyan" />
                      </button>
                      <Waveform bars={34} className="flex-1" />
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-4">
                  <button data-testid="like-btn" onClick={() => like(p.id)} className={`flex items-center gap-1 text-[11px] ${liked[p.id] ? "text-fuchsia-400" : "text-slate-400 hover:text-fuchsia-400"}`}>
                    <Heart className={`w-3.5 h-3.5 ${liked[p.id] ? "fill-fuchsia-400" : ""}`} /> {p.likes}
                  </button>
                  <span className="flex items-center gap-1 text-[11px] text-slate-400">
                    <MessageCircle className="w-3.5 h-3.5" /> {p.comments}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { Users } from "lucide-react";
import CommunityFeed from "@/components/dash/CommunityFeed";

export default function Community() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/dashboard").then((r) => setD(r.data)).catch(() => {}); }, []);
  if (!d) return <div className="p-8 neon-text font-display animate-pulse">LOADING…</div>;

  const members = [...d.leaderboard].map((u) => ({ ...u }));

  return (
    <PageScaffold icon={Users} title="Community" sub="Connect & Collaborate — the movement">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <CommunityFeed data={d} />
        <div className="space-y-4">
          <Card>
            <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-3">Top Members</div>
            <div className="space-y-2">
              {members.map((u) => (
                <div key={u.id} className="flex items-center gap-3">
                  <img src={u.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                  <div className="flex-1"><div className="text-sm text-white">{u.name}</div><div className="text-[10px] text-neon-cyan">{u.xp.toLocaleString()} XP</div></div>
                  <button className="btn-ghost text-[10px] px-2.5 py-1 rounded-full">Follow</button>
                </div>
              ))}
            </div>
          </Card>
          <Card className="text-center">
            <div className="font-display text-lg font-bold text-white">1,247 <span className="text-neon-cyan">ONLINE</span></div>
            <div className="text-xs text-slate-500 mt-1">Join the daily builds & collaborate live.</div>
            <a href={d.discord.invite} target="_blank" rel="noreferrer" className="btn-neon inline-block mt-3 rounded-lg px-4 py-2 text-sm">Open Discord</a>
          </Card>
        </div>
      </div>
    </PageScaffold>
  );
}

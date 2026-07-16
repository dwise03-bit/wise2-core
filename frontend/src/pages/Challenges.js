import React, { useState } from "react";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { Trophy, Flame, Users } from "lucide-react";
import { toast } from "sonner";

const CHALLENGES = [
  { id: 1, title: "Trap Anthem Battle", prize: "5,000 XP", ends: "2d 14h", entrants: 342, hot: true, color: "from-fuchsia-500 to-purple-700" },
  { id: 2, title: "60-Second Jingle Sprint", prize: "2,500 XP", ends: "5d 02h", entrants: 189, hot: false, color: "from-cyan-500 to-blue-700" },
  { id: 3, title: "Vocal Chop Challenge", prize: "3,000 XP", ends: "1d 08h", entrants: 421, hot: true, color: "from-amber-500 to-orange-700" },
  { id: 4, title: "Brand DNA Showcase", prize: "4,000 XP", ends: "6d 20h", entrants: 156, hot: false, color: "from-emerald-500 to-green-800" },
];

export default function Challenges() {
  const [joined, setJoined] = useState({});
  return (
    <PageScaffold icon={Trophy} title="Challenges" sub="Compete & Win — prove your sound">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHALLENGES.map((c) => (
          <Card key={c.id} className="relative overflow-hidden" data-testid="challenge-card">
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${c.color} opacity-20 blur-2xl`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-display text-lg font-bold text-white">{c.title}</span>
                {c.hot && <span className="flex items-center gap-1 text-[9px] font-bold text-orange-400 bg-orange-500/15 px-1.5 py-0.5 rounded"><Flame className="w-3 h-3" /> HOT</span>}
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <span className="text-neon-cyan font-semibold">{c.prize}</span>
                <span>Ends in {c.ends}</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {c.entrants}</span>
              </div>
              <button data-testid={`join-challenge-${c.id}`} onClick={() => { setJoined((j) => ({ ...j, [c.id]: true })); toast.success(`Joined ${c.title}!`); }} disabled={joined[c.id]} className={`w-full rounded-lg py-2 text-sm font-semibold ${joined[c.id] ? "bg-green-500/20 text-green-400" : "btn-neon"}`}>
                {joined[c.id] ? "✓ Entered" : "Join Challenge"}
              </button>
            </div>
          </Card>
        ))}
      </div>
    </PageScaffold>
  );
}

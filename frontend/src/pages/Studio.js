import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import PageScaffold, { Card, StatTile } from "@/components/PageScaffold";
import { LayoutGrid, Fingerprint, Music2, Mic, Sparkles, Radio, ArrowRight } from "lucide-react";
import { Waveform } from "@/components/dash/ui";

const ACTIONS = [
  { icon: Fingerprint, label: "Build Brand DNA", to: "/brand-dna" },
  { icon: Music2, label: "Create Anthem", to: "/anthem-creator" },
  { icon: Mic, label: "Record Vocals", to: "/recording-room" },
  { icon: Sparkles, label: "Master Track", to: "/mastering" },
];

export default function Studio() {
  const nav = useNavigate();
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/dashboard").then((r) => setD(r.data)).catch(() => {}); }, []);

  return (
    <PageScaffold icon={LayoutGrid} title="Studio" sub="Command Center — your creative operations hub"
      actions={<button onClick={() => nav("/live")} className="btn-neon rounded-lg px-4 py-2 text-sm flex items-center gap-2"><Radio className="w-4 h-4" /> Go Live</button>}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Active Projects" value={d?.stats.projects_live ?? "—"} />
        <StatTile label="Community Online" value={d ? d.stats.community_online.toLocaleString() : "—"} accent="text-white" />
        <StatTile label="Projects Completed" value={d ? d.metrics.projects_completed.toLocaleString() : "—"} accent="text-green-400" />
        <StatTile label="Client Satisfaction" value={d?.metrics.client_satisfaction ?? "—"} accent="text-fuchsia-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-3">
            {ACTIONS.map((a) => (
              <button key={a.to} onClick={() => nav(a.to)} className="btn-ghost rounded-lg p-4 text-left group" data-testid={`quick-${a.to.slice(1)}`}>
                <a.icon className="w-5 h-5 text-neon-cyan mb-2" />
                <div className="text-sm font-semibold text-slate-200 flex items-center gap-1">{a.label}<ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
              </button>
            ))}
          </div>
        </Card>
        <Card>
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-3">Active Projects</div>
          <div className="space-y-3">
            {(d?.projects || []).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{p.name}</div>
                  <div className="h-1 mt-1 rounded-full bg-[#0e1a30] overflow-hidden"><div className="h-full bg-gradient-to-r from-neon-cyan to-neon-deep" style={{ width: `${p.progress}%` }} /></div>
                </div>
                <Waveform bars={12} seed={i} className="w-14 hidden sm:flex" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageScaffold>
  );
}

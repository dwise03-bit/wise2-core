import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CheckCircle2, Upload, FileAudio, Wand2 } from "lucide-react";

const ICONS = [CheckCircle2, Upload, FileAudio, Wand2];

export default function RecentActivity() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/activity").then(r => setItems(r.data)); }, []);
  return (
    <div className="card-panel p-4" data-testid="recent-activity">
      <div className="font-display text-white text-xs mb-2">Recent Activity</div>
      <div className="space-y-2">
        {items.slice(0, 4).map((it, i) => {
          const Ic = ICONS[i % ICONS.length];
          return (
            <div key={it.id} className="flex items-start gap-2">
              <Ic className="w-3.5 h-3.5 text-neon-cyan mt-0.5 shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-slate-200 truncate">{it.text}</div>
                <div className="text-[10px] text-slate-500">{it.when}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

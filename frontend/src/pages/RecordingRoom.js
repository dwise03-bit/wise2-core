import React, { useState, useEffect } from "react";
import PageScaffold, { Card } from "@/components/PageScaffold";
import { Mic, Circle, Square, Play } from "lucide-react";
import { Waveform } from "@/components/dash/ui";
import { toast } from "sonner";

export default function RecordingRoom() {
  const [recording, setRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [takes, setTakes] = useState([
    { id: 1, name: "Hook — Take 3", len: "0:42", keep: true },
    { id: 2, name: "Verse 1 — Take 2", len: "1:08", keep: true },
    { id: 3, name: "Adlibs — Take 1", len: "0:26", keep: false },
  ]);

  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const toggle = () => {
    if (recording) {
      setRecording(false);
      const mm = String(Math.floor(time / 60)); const ss = String(time % 60).padStart(2, "0");
      setTakes((t) => [{ id: Date.now(), name: `New Take — ${t.length + 1}`, len: `${mm}:${ss}`, keep: true }, ...t]);
      setTime(0);
      toast.success("Take saved");
    } else { setRecording(true); }
  };

  return (
    <PageScaffold icon={Mic} title="Recording Room" sub="Sessions & Vocals — capture the magic">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <Card className="flex flex-col items-center justify-center py-10">
          <div className="w-full mb-6"><Waveform bars={80} className="h-16 w-full" color={recording ? "#ef4444" : "#00a8ff"} /></div>
          <div className="font-display text-4xl font-bold text-white tabular-nums mb-6">{String(Math.floor(time / 60)).padStart(2, "0")}:{String(time % 60).padStart(2, "0")}</div>
          <button data-testid="record-btn" onClick={toggle} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${recording ? "bg-red-500/20 border-2 border-red-500" : "btn-neon"}`}>
            {recording ? <Square className="w-7 h-7 text-red-400 fill-red-400" /> : <Circle className="w-8 h-8 fill-current" />}
          </button>
          <div className="text-xs text-slate-500 mt-4 tracking-widest uppercase">{recording ? "Recording…" : "Tap to record"}</div>
        </Card>
        <Card>
          <div className="font-display text-sm font-bold text-white uppercase tracking-wide mb-3">Takes</div>
          <div className="space-y-2">
            {takes.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#0a1120] border border-[#1a2942]">
                <button className="w-8 h-8 rounded-full bg-neon-cyan/15 flex items-center justify-center"><Play className="w-3.5 h-3.5 text-neon-cyan fill-neon-cyan" /></button>
                <div className="flex-1 min-w-0"><div className="text-sm text-white truncate">{t.name}</div><div className="text-[10px] text-slate-500">{t.len}</div></div>
                {t.keep && <span className="text-[8px] font-bold text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded">KEEP</span>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </PageScaffold>
  );
}

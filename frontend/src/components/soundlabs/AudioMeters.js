import React, { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

const CHANNELS = ["IN", "DRUMS", "BASS", "VOCALS", "MELODY", "MASTER"];

function useLiveLevel(seed) {
  const [level, setLevel] = useState(0.5);
  useEffect(() => {
    let raf;
    let last = 0.5;
    const tick = () => {
      // simulated audio-like fluctuation
      const target = 0.45 + 0.5 * Math.abs(Math.sin(Date.now() / (500 + seed * 137)) * Math.cos(Date.now() / (223 + seed * 71)));
      last = last * 0.6 + target * 0.4;
      setLevel(last);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seed]);
  return level;
}

function Meter({ name, seed }) {
  const level = useLiveLevel(seed);
  const segments = 22;
  const activeSegments = Math.round(level * segments);
  const db = -60 + level * 60;

  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <div className="text-[10px] text-slate-400 tracking-widest">{name}</div>
      <div className="flex flex-col-reverse gap-[2px] w-full max-w-[26px] h-40">
        {Array.from({ length: segments }).map((_, i) => {
          const on = i < activeSegments;
          let cls = "led";
          if (on) {
            if (i > segments * 0.85) cls += " on-r";
            else if (i > segments * 0.7) cls += " on-o";
            else if (i > segments * 0.5) cls += " on-y";
            else cls += " on-g";
          }
          return <div key={i} className={cls} />;
        })}
      </div>
      <div className="text-[10px] text-slate-300 tabular-nums font-mono">{db.toFixed(1)}</div>
    </div>
  );
}

export default function AudioMeters() {
  return (
    <div className="card-panel p-5 h-full" data-testid="audio-meters">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-white text-sm">Audio Meters</div>
        <button className="text-xs text-slate-400 bg-bg-base border border-slate-800 rounded-md px-2 py-1 flex items-center gap-1">
          Master Bus <ChevronDown className="w-3 h-3"/>
        </button>
      </div>
      <div className="flex items-start gap-1">
        <div className="flex flex-col justify-between text-[9px] text-slate-500 h-40 pr-1 pt-4">
          <span>0</span><span>-12</span><span>-24</span><span>-36</span><span>-48</span><span>-60</span>
        </div>
        {CHANNELS.map((c, i) => (<Meter key={c} name={c} seed={i}/>))}
      </div>
    </div>
  );
}

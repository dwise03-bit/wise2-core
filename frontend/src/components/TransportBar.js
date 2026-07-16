import React from "react";
import { usePlayer } from "@/context/PlayerContext";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, Maximize2, ListMusic, Sliders } from "lucide-react";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function Waveform({ progress }) {
  const bars = 120;
  const values = React.useMemo(() =>
    Array.from({ length: bars }, (_, i) => {
      const t = i / bars;
      return 0.3 + 0.7 * Math.abs(Math.sin(t * 22) * Math.cos(t * 8) * (0.6 + 0.4 * Math.sin(t * 3)));
    }), []);
  return (
    <div className="flex-1 flex items-center gap-[2px] h-8">
      {values.map((v, i) => {
        const played = i / bars <= progress;
        return (
          <div
            key={i}
            style={{ height: `${Math.max(6, v * 100)}%` }}
            className={`w-[3px] rounded-sm ${played ? "bg-neon-cyan shadow-[0_0_4px_#00d4ff]" : "bg-slate-700"}`}
          />
        );
      })}
    </div>
  );
}

export default function TransportBar() {
  const { current, playing, togglePlay, progress, setProgress } = usePlayer();
  const total = 222; // seconds — display only
  const currentSec = total * progress;

  return (
    <div className="fixed bottom-0 left-64 right-0 h-20 bg-bg-surface/90 backdrop-blur-xl border-t border-slate-800 flex items-center gap-4 px-6 z-30" data-testid="transport-bar">
      {/* Now playing */}
      <div className="flex items-center gap-3 w-64 shrink-0">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${current?.color || "from-fuchsia-500 to-purple-700"} shadow-neon-sm`}></div>
        <div className="leading-tight min-w-0">
          <div className="text-white text-sm font-medium truncate" data-testid="now-playing-title">{current?.name || "—"}</div>
          <div className="text-slate-400 text-xs truncate">{current?.artist || "—"}</div>
        </div>
      </div>

      {/* Controls + waveform */}
      <div className="flex-1 flex items-center gap-4">
        <button className="text-slate-400 hover:text-neon-cyan"><Shuffle className="w-4 h-4" /></button>
        <button className="text-slate-300 hover:text-white"><SkipBack className="w-5 h-5" /></button>
        <button
          data-testid="transport-play-button"
          onClick={togglePlay}
          className="w-12 h-12 rounded-full border-2 border-neon-cyan flex items-center justify-center text-neon-cyan hover:shadow-neon transition-shadow"
        >
          {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <button className="text-slate-300 hover:text-white"><SkipForward className="w-5 h-5" /></button>
        <button className="text-slate-400 hover:text-neon-cyan"><Repeat className="w-4 h-4" /></button>

        <div className="text-xs text-slate-400 tabular-nums w-10 text-right">{formatTime(currentSec)}</div>
        <div className="flex-1 cursor-pointer" onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setProgress((e.clientX - rect.left) / rect.width);
        }}>
          <Waveform progress={progress} />
        </div>
        <div className="text-xs text-slate-400 tabular-nums w-10">{current?.duration || formatTime(total)}</div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4 w-56 justify-end shrink-0">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <input type="range" min="0" max="100" defaultValue="75" className="accent-neon-cyan w-24" data-testid="volume-slider" />
        </div>
        <button className="text-slate-400 hover:text-white" data-testid="queue-button"><ListMusic className="w-4 h-4" /></button>
        <button className="text-slate-400 hover:text-white"><Sliders className="w-4 h-4" /></button>
        <button className="text-slate-400 hover:text-white"><Maximize2 className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { Play, Pause, ChevronDown } from "lucide-react";

const ROWS = [
  { key: "kick",  label: "Kick",   note: "C1" },
  { key: "snare", label: "Snare",  note: "D1" },
  { key: "hihat", label: "Hi Hat", note: "F#4" },
  { key: "808",   label: "808",    note: "A0" },
  { key: "clap",  label: "Clap",   note: "F#3" },
  { key: "perc",  label: "Perc",   note: "B4" },
];

const STEPS = 16;

// Default pattern to match the screenshot vibe (Kick on 1,5,9,13 etc)
const defaultPattern = () => {
  const g = {};
  ROWS.forEach((r) => (g[r.key] = Array(STEPS).fill(false)));
  [0, 4, 6, 8, 10, 12].forEach((s) => (g.kick[s] = true));
  [2, 6, 10, 14].forEach((s) => (g.snare[s] = true));
  [0, 2, 4, 6, 8, 10, 12, 14].forEach((s) => (g.hihat[s] = true));
  [0, 8].forEach((s) => (g["808"][s] = true));
  [4, 12].forEach((s) => (g.clap[s] = true));
  [3, 11].forEach((s) => (g.perc[s] = true));
  return g;
};

export default function BeatMaker() {
  const [grid, setGrid] = useState(defaultPattern);
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(128);
  const [keySig] = useState("C Minor");
  const [step, setStep] = useState(-1);
  const [focusRow, setFocusRow] = useState("kick");
  const synthsRef = useRef(null);
  const seqRef = useRef(null);
  const gridRef = useRef(grid);
  useEffect(() => { gridRef.current = grid; }, [grid]);

  useEffect(() => {
    const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6 }).toDestination();
    const snare = new Tone.NoiseSynth({ noise: { type: "white" }, envelope: { attack: 0.001, decay: 0.15, sustain: 0 } }).toDestination();
    const hihat = new Tone.MetalSynth({ frequency: 250, envelope: { attack: 0.001, decay: 0.05, release: 0.01 }, harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5 }).toDestination();
    hihat.volume.value = -18;
    const eight = new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 4 }).toDestination();
    eight.volume.value = -4;
    const clap = new Tone.NoiseSynth({ noise: { type: "pink" }, envelope: { attack: 0.002, decay: 0.2, sustain: 0 } }).toDestination();
    const perc = new Tone.MetalSynth({ frequency: 400, envelope: { attack: 0.001, decay: 0.1 } }).toDestination();
    perc.volume.value = -20;
    synthsRef.current = { kick, snare, hihat, "808": eight, clap, perc };
    return () => {
      Object.values(synthsRef.current).forEach((s) => s.dispose && s.dispose());
    };
  }, []);

  useEffect(() => { Tone.Transport.bpm.value = bpm; }, [bpm]);

  const toggleCell = (rowKey, i) => {
    setGrid((g) => ({ ...g, [rowKey]: g[rowKey].map((v, idx) => (idx === i ? !v : v)) }));
  };

  const togglePlay = async () => {
    await Tone.start();
    if (playing) {
      Tone.Transport.stop();
      seqRef.current?.dispose();
      seqRef.current = null;
      setPlaying(false);
      setStep(-1);
      return;
    }
    let s = 0;
    seqRef.current = new Tone.Loop((time) => {
      setStep(s);
      const g = gridRef.current;
      const synths = synthsRef.current;
      if (!synths) return;
      if (g.kick[s]) synths.kick.triggerAttackRelease("C1", "8n", time);
      if (g.snare[s]) synths.snare.triggerAttackRelease("16n", time);
      if (g.hihat[s]) synths.hihat.triggerAttackRelease("F#4", "32n", time);
      if (g["808"][s]) synths["808"].triggerAttackRelease("A0", "4n", time);
      if (g.clap[s]) synths.clap.triggerAttackRelease("16n", time);
      if (g.perc[s]) synths.perc.triggerAttackRelease("B4", "32n", time);
      s = (s + 1) % STEPS;
    }, "16n").start(0);
    Tone.Transport.start();
    setPlaying(true);
  };

  return (
    <div className="card-panel p-5" data-testid="beat-maker">
      <div className="flex items-center justify-between mb-3">
        <div className="font-display text-white text-sm">Beat Maker</div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          data-testid="beat-play-button"
          onClick={togglePlay}
          className="btn-neon px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5"
        >
          {playing ? <Pause className="w-3 h-3"/> : <Play className="w-3 h-3"/>}
          {playing ? "Stop" : "Play"}
        </button>

        <div className="bg-bg-base border border-slate-800 rounded-md px-2 py-1 flex items-center gap-2 text-xs">
          <input
            data-testid="beat-bpm-input"
            type="number"
            min="60" max="200"
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value) || 128)}
            className="w-10 bg-transparent text-white font-mono focus:outline-none"
          />
          <span className="text-slate-500 text-[10px]">Tempo</span>
        </div>

        <div className="bg-bg-base border border-slate-800 rounded-md px-2 py-1 flex items-center gap-2 text-xs">
          <span className="text-white text-xs">{keySig}</span>
          <span className="text-slate-500 text-[10px]">Key</span>
          <ChevronDown className="w-3 h-3 text-slate-500"/>
        </div>
      </div>

      {/* Step number bar */}
      <div className="grid grid-cols-[64px_repeat(16,minmax(0,1fr))] gap-1 mb-1">
        <div></div>
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} className={`text-[10px] text-center ${step === i ? "text-neon-cyan" : "text-slate-500"}`}>{i + 1}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="space-y-1">
        {ROWS.map((row) => (
          <div key={row.key} className="grid grid-cols-[64px_repeat(16,minmax(0,1fr))] gap-1 items-center">
            <button
              onClick={() => setFocusRow(row.key)}
              className={`text-[11px] text-left px-2 py-1 rounded-md flex items-center justify-between ${focusRow === row.key ? "bg-neon-cyan/10 text-neon-cyan" : "text-slate-300 hover:bg-white/5"}`}
              data-testid={`beat-row-${row.key}`}
            >
              <span>{row.label}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60"/>
            </button>
            {grid[row.key].map((on, i) => (
              <button
                key={i}
                onClick={() => toggleCell(row.key, i)}
                data-testid={`seq-${row.key}-${i}`}
                className={`seq-cell ${on ? "active" : ""} ${step === i && playing ? "playing" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
        <span className="px-2 py-1 rounded-md bg-neon-cyan/10 text-neon-cyan">{ROWS.find(r => r.key === focusRow)?.label}</span>
        <span className="text-slate-500">Sample: TR-808 · Volume: -4dB</span>
      </div>
    </div>
  );
}

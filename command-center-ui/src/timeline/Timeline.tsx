import { useEffect, useRef } from 'react';
import { useGraphStore } from '../state/store';
import './timeline.css';

const SPEEDS = [1, 2, 4] as const;

export function Timeline() {
  const mode = useGraphStore((s) => s.mode);
  const history = useGraphStore((s) => s.history);
  const cursor = useGraphStore((s) => s.replayCursor);
  const speed = useGraphStore((s) => s.replaySpeed);
  const playing = useGraphStore((s) => s.replayPlaying);
  const setMode = useGraphStore((s) => s.setMode);
  const setCursor = useGraphStore((s) => s.setReplayCursor);
  const setSpeed = useGraphStore((s) => s.setReplaySpeed);
  const setPlaying = useGraphStore((s) => s.setReplayPlaying);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (mode !== 'replay' || !playing) return;
    if (cursor >= history.length - 1) {
      setPlaying(false);
      return;
    }
    const current = history[cursor];
    const next = history[cursor + 1];
    const realGap = Math.max(80, (next.timestamp - current.timestamp) / speed);
    timerRef.current = setTimeout(() => setCursor(cursor + 1), realGap);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mode, playing, cursor, speed, history, setCursor, setPlaying]);

  const toggleReplay = () => setMode(mode === 'replay' ? 'live' : 'replay');

  return (
    <section className="timeline" role="toolbar" aria-label="Execution timeline">
      <button aria-pressed={mode === 'replay'} onClick={toggleReplay}>
        {mode === 'replay' ? 'REPLAY MODE' : 'LIVE'}
      </button>
      <div className="timeline-divider" />
      <button
        onClick={() => setCursor(Math.max(0, cursor - 1))}
        disabled={mode !== 'replay'}
        aria-label="Step back"
      >
        ⟨
      </button>
      <button
        aria-pressed={playing}
        onClick={() => setPlaying(!playing)}
        disabled={mode !== 'replay' || history.length === 0}
      >
        {playing ? 'PAUSE' : 'PLAY'}
      </button>
      <button
        onClick={() => setCursor(Math.min(history.length - 1, cursor + 1))}
        disabled={mode !== 'replay'}
        aria-label="Step forward"
      >
        ⟩
      </button>
      <div className="timeline-divider" />
      {SPEEDS.map((s) => (
        <button key={s} aria-pressed={speed === s} onClick={() => setSpeed(s)} disabled={mode !== 'replay'}>
          {s}×
        </button>
      ))}
      <div className="timeline-track" aria-hidden>
        <div className="timeline-fill" style={{ width: history.length ? `${((cursor + 1) / history.length) * 100}%` : '0' }} />
      </div>
      <div className="timeline-count">
        {history.length === 0 ? 'No events' : `${cursor + 1} / ${history.length}`}
      </div>
    </section>
  );
}

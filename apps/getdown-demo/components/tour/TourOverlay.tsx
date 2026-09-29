'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  RotateCcw,
  Settings2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { TOUR_STEPS, useTour } from './TourProvider';
import { GuideAvatar } from '../assistant/GuideAvatar';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourOverlay() {
  const { active, step, index, next, prev, stop, voice } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!active || !step?.anchor) {
      setRect(null);
      return;
    }
    let raf = 0;
    const measure = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${step.anchor}"]`);
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - 8, left: r.left - 8, width: r.width + 16, height: r.height + 16 });
    };
    // The route may still be settling when the step changes.
    const t = setTimeout(() => {
      measure();
      raf = requestAnimationFrame(measure);
    }, 260);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, step, pathname]);

  if (!active || !step) return null;

  return (
    <>
      {/* Spotlight ring around the step's anchor */}
      {rect && (
        <div
          className="pointer-events-none fixed z-[70] rounded-2xl transition-all duration-500"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow:
              '0 0 0 2px rgba(124,255,61,.75), 0 0 0 9999px rgba(2,6,12,.72), 0 0 40px rgba(124,255,61,.3)',
          }}
        />
      )}
      {!rect && <div className="pointer-events-none fixed inset-0 z-[70] bg-gd-void/60" />}

      {/* Presenter console */}
      <div className="fixed bottom-5 left-1/2 z-[80] w-[min(820px,calc(100vw-2rem))] -translate-x-1/2">
        <div className="gd-panel relative overflow-hidden rounded-2xl border-gd-neon/30 p-5 shadow-glow-neon">
          <div className="flex items-start gap-4">
            <GuideAvatar speaking={voice.speaking} size={54} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-display text-sm font-extrabold uppercase tracking-[0.16em] text-gd-neon">
                  {step.title}
                </p>
                {voice.speaking && (
                  <span className="flex items-center gap-1" aria-label="Guide is speaking">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-[2px] rounded-full bg-gd-neon"
                        style={{
                          height: 8 + (i % 2) * 5,
                          animation: `pulseRing 1s ${i * 0.12}s ease-in-out infinite`,
                        }}
                      />
                    ))}
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white">{step.body}</p>
              <p className="mt-2 text-xs leading-relaxed text-gd-steel">
                <span className="font-bold uppercase tracking-wider text-gd-electric">
                  Why it matters —{' '}
                </span>
                {step.benefit}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {voice.supported && (
                <>
                  <button
                    onClick={() => voice.speakTrack(step.id, step.narration)}
                    title="Replay narration"
                    className="rounded-lg border border-white/10 p-1.5 text-gd-steel transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={voice.toggleEnabled}
                    title={voice.enabled ? 'Mute guide' : 'Unmute guide'}
                    className={`rounded-lg border p-1.5 transition-colors ${
                      voice.enabled
                        ? 'border-gd-neon/40 bg-gd-neon/10 text-gd-neon'
                        : 'border-white/10 text-gd-steel hover:bg-white/5'
                    }`}
                  >
                    {voice.enabled ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowVoiceSettings((s) => !s)}
                    title="Voice settings"
                    className="rounded-lg border border-white/10 p-1.5 text-gd-steel transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Settings2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={stop}
                className="rounded-lg border border-white/10 p-1.5 text-gd-steel transition-colors hover:bg-white/5 hover:text-white"
                aria-label="Exit tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {showVoiceSettings && voice.supported && (
            <div className="mt-3 space-y-2 rounded-lg border border-gd-line bg-gd-void/50 px-3.5 py-2.5">
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-[11px] text-gd-steel">
                  Voice
                  <select
                    value={voice.voiceName}
                    onChange={(e) => {
                      voice.setVoiceName(e.target.value);
                      setTimeout(() => voice.speak('Here is how I sound.'), 60);
                    }}
                    className="max-w-[230px] rounded border border-gd-line bg-gd-hull px-2 py-1 text-[11px] text-white focus:outline-none"
                  >
                    {voice.voices.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name}
                        {/premium|enhanced|neural|natural/i.test(v.name) ? '  ★' : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gd-steel">
                  Pace
                  <input
                    type="range"
                    min={0.8}
                    max={1.2}
                    step={0.02}
                    value={voice.rate}
                    onChange={(e) => voice.setRate(Number(e.target.value))}
                    className="accent-gd-neon"
                  />
                  <span className="w-10 font-mono text-white">{voice.rate.toFixed(2)}×</span>
                </label>
                <label className="flex items-center gap-2 text-[11px] text-gd-steel">
                  Warmth
                  <input
                    type="range"
                    min={0.85}
                    max={1.2}
                    step={0.02}
                    value={voice.pitch}
                    onChange={(e) => voice.setPitch(Number(e.target.value))}
                    className="accent-gd-electric"
                  />
                  <span className="w-10 font-mono text-white">{voice.pitch.toFixed(2)}</span>
                </label>
              </div>
              <p className="text-[10px] leading-relaxed text-gd-steel/80">
                {voice.usingTracks
                  ? 'The tour is playing pre-rendered narration, so it sounds the same on every machine. These controls apply to the assistant’s live answers, and to the tour only if an audio track fails to load.'
                  : 'Audio tracks unavailable — falling back to this machine’s speech synthesis. ★ marks a premium or neural voice.'}
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <div className="flex flex-1 gap-1">
              {TOUR_STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    i < index ? 'bg-gd-neon/50' : i === index ? 'bg-gd-neon' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <span className="shrink-0 font-mono text-[11px] text-gd-steel">
              {index + 1} / {TOUR_STEPS.length}
            </span>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={prev}
                disabled={index === 0}
                className="rounded-lg border border-white/10 px-2.5 py-1.5 text-gd-chrome transition-colors hover:bg-white/5 disabled:opacity-30"
                aria-label="Previous step"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={next}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gd-neon/45 bg-gd-neon/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-gd-neon transition-all hover:bg-gd-neon/25"
              >
                {index === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] uppercase tracking-[0.14em] text-gd-steel/70">
            → / space advances · ← goes back · esc exits
            {!voice.supported && ' · voice narration unavailable in this browser'}
          </p>
        </div>
      </div>
    </>
  );
}

export function TourLauncher() {
  const { start, active } = useTour();
  if (active) return null;
  return (
    <button
      onClick={start}
      data-tour="launcher"
      className="inline-flex items-center gap-2 rounded-lg border border-gd-neon/45 bg-gd-neon/15 px-3.5 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-gd-neon transition-all hover:bg-gd-neon/25 hover:shadow-glow-neon"
    >
      <Play className="h-3.5 w-3.5 fill-current" />
      Start Owner Tour
    </button>
  );
}

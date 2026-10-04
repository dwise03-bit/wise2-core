'use client';

import { useEffect, useRef, useState } from 'react';
import {
  FolderOpen,
  Star,
  CheckCircle2,
  HardDrive,
  Sparkles,
  Mic,
  Radio,
  type LucideIcon,
} from 'lucide-react';

type DashboardTab = 'overview' | 'generate' | 'reaper' | 'stream' | 'projects';

interface DashboardOverviewProps {
  client: { name: string; email: string; plan: string };
  projectCount: number;
  onNavigate?: (tab: DashboardTab) => void;
}

const BAR_COUNT = 24;
// Deterministic seed so server and first client render match (no hydration mismatch).
const SEED_BARS = Array.from({ length: BAR_COUNT }, (_, i) =>
  35 + Math.round(30 * Math.abs(Math.sin(i * 0.9)))
);

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function DashboardOverview({ client, projectCount, onNavigate }: DashboardOverviewProps) {
  const [bars, setBars] = useState<number[]>(SEED_BARS);
  const [vu, setVu] = useState<{ l: number; r: number }>({ l: 62, r: 48 });
  const rafRef = useRef<number | null>(null);

  // Live spectrum + VU animation (client-only; respects reduced motion).
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 90) {
        last = t;
        setBars((prev) =>
          prev.map((v, i) => {
            const target = 20 + 70 * Math.abs(Math.sin(t / 700 + i * 0.5));
            return Math.round(v + (target - v) * 0.35);
          })
        );
        setVu({
          l: 40 + Math.round(45 * Math.abs(Math.sin(t / 500))),
          r: 40 + Math.round(45 * Math.abs(Math.sin(t / 500 + 1.1))),
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const stats: Array<{ label: string; value: string | number; icon: LucideIcon; tint: string }> = [
    { label: 'Projects', value: projectCount, icon: FolderOpen, tint: '#00D9FF' },
    { label: 'Plan', value: client.plan.toUpperCase(), icon: Star, tint: '#C4A369' },
    { label: 'Status', value: 'ONLINE', icon: CheckCircle2, tint: '#00FF7F' },
    { label: 'Storage', value: '2.4 GB', icon: HardDrive, tint: '#00D9FF' },
  ];

  const actions: Array<{
    title: string;
    desc: string;
    icon: LucideIcon;
    tab: DashboardTab;
  }> = [
    { title: 'Generate Music', desc: 'Create a new track', icon: Sparkles, tab: 'generate' },
    { title: 'Start Recording', desc: 'Open REAPER transport', icon: Mic, tab: 'reaper' },
    { title: 'Go Live', desc: 'Stream to your audience', icon: Radio, tab: 'stream' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10 hover:border-[#00D9FF]/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[#00D9FF]/60 text-sm mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <Icon size={22} strokeWidth={1.75} style={{ color: stat.tint }} aria-hidden="true" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Spectrum Analyzer Visualization */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10">
        <h3 className="text-lg font-semibold text-white mb-4">Spectrum Analysis</h3>
        <div className="space-y-4">
          {/* Frequency Bars */}
          <div
            className="flex items-end justify-center gap-1 h-32 p-4 bg-[#050607]/50 rounded-lg"
            role="img"
            aria-label="Live audio spectrum analyzer"
          >
            {bars.map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-[#00D9FF] to-[#00FF7F]"
                style={{ height: `${height}%`, transition: 'height 90ms linear' }}
              />
            ))}
          </div>

          {/* VU Meters */}
          <div className="grid grid-cols-2 gap-4">
            {([['L', vu.l], ['R', vu.r]] as const).map(([channel, level]) => (
              <div key={channel}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[#00D9FF]/60">Channel {channel}</p>
                  <p className="text-xs text-[#00D9FF]/60 font-mono tabular-nums">
                    {Math.round(-60 + (level / 100) * 60)} dB
                  </p>
                </div>
                <div className="h-2 bg-[#050607] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#00FF7F] to-[#00D9FF] rounded-full"
                    style={{ width: `${level}%`, transition: 'width 90ms linear' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.title}
              type="button"
              onClick={() => onNavigate?.(action.tab)}
              className="p-6 rounded-xl bg-gradient-to-br from-[#0a0a0c] to-[#0f0f12] border border-[#00D9FF]/10 hover:border-[#00D9FF]/50 text-left transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]/60"
            >
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-lg bg-[#00D9FF]/10 text-[#00D9FF] mb-3 group-hover:bg-[#00D9FF]/20 transition-colors">
                <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              </span>
              <h4 className="font-semibold text-white mb-1">{action.title}</h4>
              <p className="text-[#00D9FF]/60 text-sm">{action.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

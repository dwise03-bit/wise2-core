'use client';

import { motion } from 'framer-motion';
import { Music2, Mic2, Radio, Tv, Fingerprint, Sparkles, Play } from 'lucide-react';
import { useSoundLabModals } from './SoundLabModals';

const SERVICE_LABELS = [
  { label: 'JINGLES', icon: Music2 },
  { label: 'SONGS', icon: Mic2 },
  { label: 'INTROS', icon: Play },
  { label: 'COMMERCIALS', icon: Tv },
  { label: 'SONIC LOGOS', icon: Fingerprint },
  { label: '& MORE', icon: Sparkles },
];

const BAR_HEIGHTS = [18, 34, 22, 48, 30, 60, 26, 44, 20, 38, 52, 24, 40, 16, 36];

function StudioVisual() {
  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto">
      {/* ambient glow */}
      <div className="absolute inset-0 rounded-full bg-[#9AFF00]/10 blur-[100px]" />

      {/* console base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[92%] h-[38%] rounded-2xl bg-gradient-to-b from-[#141414] to-black border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-8 gap-2 p-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="rounded-sm bg-[#1a1a1a] border border-white/5 flex items-end justify-center overflow-hidden"
            >
              <div
                className="w-full bg-[#9AFF00]/70 shadow-[0_0_6px_rgba(154,255,0,0.8)] animate-pulse"
                style={{
                  height: `${20 + ((i * 13) % 60)}%`,
                  animationDelay: `${i * 0.12}s`,
                  animationDuration: `${1.4 + (i % 5) * 0.2}s`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* chrome W2 + headphones centerpiece */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 400 400" className="w-[78%] h-[78%] drop-shadow-[0_0_40px_rgba(154,255,0,0.25)]">
          <defs>
            <linearGradient id="chrome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f4f4f5" />
              <stop offset="45%" stopColor="#9ca3af" />
              <stop offset="55%" stopColor="#6b7280" />
              <stop offset="100%" stopColor="#e5e7eb" />
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#9AFF00" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#9AFF00" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="190" fill="url(#glow)" />
          {/* headphone band */}
          <path
            d="M 70 190 A 130 130 0 0 1 330 190"
            fill="none"
            stroke="url(#chrome)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* ear cups */}
          <ellipse cx="70" cy="225" rx="34" ry="46" fill="url(#chrome)" stroke="#111" strokeWidth="2" />
          <ellipse cx="330" cy="225" rx="34" ry="46" fill="url(#chrome)" stroke="#111" strokeWidth="2" />
          <ellipse cx="70" cy="225" rx="18" ry="30" fill="#0a0a0a" />
          <ellipse cx="330" cy="225" rx="18" ry="30" fill="#0a0a0a" />
          {/* W2 emblem */}
          <text
            x="200"
            y="235"
            textAnchor="middle"
            fontSize="120"
            fontWeight="900"
            fill="url(#chrome)"
            stroke="#111"
            strokeWidth="2"
            fontFamily="Arial, sans-serif"
          >
            W
            <tspan fontSize="60" dy="-50">2</tspan>
          </text>
        </svg>
      </div>

      {/* floating LED dots */}
      {[
        { top: '12%', left: '8%' },
        { top: '20%', right: '6%' },
        { bottom: '30%', left: '4%' },
        { bottom: '20%', right: '10%' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-[#9AFF00] shadow-[0_0_10px_4px_rgba(154,255,0,0.7)] animate-pulse"
          style={pos as React.CSSProperties}
        />
      ))}
    </div>
  );
}

export function SoundLabHero() {
  const { openIntake } = useSoundLabModals();

  return (
    <section
      id="top"
      className="relative pt-28 md:pt-36 pb-16 px-5 md:px-8 overflow-hidden bg-black"
    >
      {/* background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(154,255,0,0.08),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px]" />

      <div className="relative max-w-[1440px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-gray-400 mb-3">
            YOUR BRAND HAS A VOICE.
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.05] mb-4">
            <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
              WE BUILD THE
            </span>
            <br />
            <span className="text-[#9AFF00] drop-shadow-[0_0_20px_rgba(154,255,0,0.6)]">
              SOUND.
            </span>
          </h1>
          <p className="text-sm md:text-base font-bold tracking-widest text-gray-300 mb-6">
            AI-POWERED. PRO-DIRECTED. UNFORGETTABLE.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {SERVICE_LABELS.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/10 bg-white/5 text-[11px] font-semibold tracking-wide text-gray-300"
              >
                <Icon size={12} className="text-[#9AFF00]" />
                {label}
              </span>
            ))}
          </div>

          <p className="text-sm md:text-base text-gray-400 max-w-xl mb-8 leading-relaxed">
            WISE² Sound Lab creates custom music and audio experiences that make your
            brand impossible to ignore. From a 15-second jingle to a full production —
            we do it all.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => openIntake()}
              className="flex items-center gap-2 px-6 py-3.5 rounded bg-[#9AFF00] text-black text-sm font-black tracking-wide hover:shadow-[0_0_30px_rgba(154,255,0,0.6)] transition-shadow cursor-pointer"
            >
              START MY JINGLE
              <Sparkles size={16} />
            </button>
            <button
              onClick={() =>
                document.querySelector('#samples')?.scrollIntoView({ behavior: 'smooth' })
              }
              className="flex items-center gap-2 px-6 py-3.5 rounded border border-[#9AFF00] text-[#9AFF00] text-sm font-black tracking-wide hover:bg-[#9AFF00]/10 transition-colors cursor-pointer"
            >
              <Play size={16} />
              HEAR SAMPLES
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <StudioVisual />
        </motion.div>
      </div>

      {/* decorative waveform strip */}
      <div className="relative max-w-[1440px] mx-auto mt-12 flex items-end gap-1 h-12 opacity-40">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-[#9AFF00] rounded-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </section>
  );
}

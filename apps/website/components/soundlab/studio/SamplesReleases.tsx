'use client';

import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, MoreHorizontal, AudioLines, ArrowRight } from 'lucide-react';
import { useStudioPlayer, type Track } from './StudioPlayerContext';

const DEMO_SRC = '/audio-wise2-promo.mp3';

const TRACKS: (Track & { tint: [string, string] })[] = [
  { id: 'city-dreams', title: 'CITY DREAMS', artist: 'WISE² Sound Lab', genre: 'Hip Hop', duration: '02:48', src: DEMO_SRC, tint: ['#0a2a4d', '#02050A'] },
  { id: 'late-nights', title: 'LATE NIGHTS', artist: 'WISE² Sound Lab', genre: 'R&B', duration: '02:21', src: DEMO_SRC, tint: ['#10294d', '#02050A'] },
  { id: 'good-energy', title: 'GOOD ENERGY', artist: 'WISE² Sound Lab', genre: 'Pop', duration: '02:59', src: DEMO_SRC, tint: ['#3a1d4d', '#02050A'] },
  { id: 'drive', title: 'DRIVE', artist: 'WISE² Sound Lab', genre: 'Trap', duration: '03:12', src: DEMO_SRC, tint: ['#0b1b2e', '#02050A'] },
  { id: 'higher', title: 'HIGHER', artist: 'WISE² Sound Lab', genre: 'Gospel', duration: '04:01', src: DEMO_SRC, tint: ['#09314a', '#02050A'] },
  { id: 'neon-love', title: 'NEON LOVE', artist: 'WISE² Sound Lab', genre: 'EDM', duration: '03:34', src: DEMO_SRC, tint: ['#2a1150', '#02050A'] },
];

const GENRES = ['All', 'Hip Hop', 'R&B', 'Pop', 'Rock', 'EDM', 'Country', 'Gospel', 'Cinematic', 'Commercial'];

// Deterministic per-track waveform so SSR matches client.
function waveform(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 997;
  return Array.from({ length: 40 }, (_, i) => {
    h = (h * 17 + i * 13) % 997;
    return 20 + (h % 80);
  });
}

function TrackCard({ track }: { track: (typeof TRACKS)[number] }) {
  const { current, isPlaying, play, toggle } = useStudioPlayer();
  const active = current?.id === track.id;
  const bars = useMemo(() => waveform(track.id), [track.id]);

  return (
    <div
      className={`group rounded-xl overflow-hidden bg-[#071321]/70 border transition-all ${
        active ? 'border-[#24C8FF]/50 shadow-[0_0_24px_rgba(0,140,255,0.22)]' : 'border-[#24C8FF]/12 hover:border-[#24C8FF]/35'
      }`}
    >
      {/* cover */}
      <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(135deg,${track.tint[0]},${track.tint[1]})` }}>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,200,255,0.06)_1px,transparent_1px)] bg-[size:9px_100%]" />
        <AudioLines size={40} className="absolute right-3 top-3 text-[#24C8FF]/25" />
        <span className="absolute top-2 left-2 text-[9px] font-bold tracking-widest text-[#8BE8FF] bg-[#02050A]/60 px-2 py-0.5 rounded">
          {track.genre.toUpperCase()}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-black text-[#F7FBFF] truncate">{track.title}</h3>
            <p className="text-[11px] text-[#8D9BAC]">{track.genre} · {track.duration}</p>
          </div>
          <button className="text-[#8D9BAC] hover:text-[#F7FBFF] transition-colors" aria-label="More">
            <MoreHorizontal size={16} />
          </button>
        </div>

        {/* mini waveform */}
        <div className="mt-3 flex items-end gap-[2px] h-8">
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${b}%`,
                background: active && i < bars.length * 0.4 ? '#24C8FF' : 'rgba(36,200,255,0.25)',
              }}
            />
          ))}
        </div>

        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={() => (active ? toggle() : play(track))}
            aria-label={active && isPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
            className="w-9 h-9 grid place-items-center rounded-full bg-gradient-to-br from-[#008CFF] to-[#24C8FF] text-[#02050A] shadow-[0_0_16px_rgba(0,140,255,0.4)] hover:scale-105 transition-transform cursor-pointer"
          >
            {active && isPlaying ? <Pause size={16} fill="currentColor" strokeWidth={0} /> : <Play size={16} fill="currentColor" strokeWidth={0} className="ml-0.5" />}
          </button>
          <span className="text-[10px] font-mono text-[#8D9BAC]">{track.duration}</span>
        </div>
      </div>
    </div>
  );
}

export function SamplesReleases() {
  const { setQueue } = useStudioPlayer();
  const [genre, setGenre] = useState('All');

  useEffect(() => {
    setQueue(TRACKS);
  }, [setQueue]);

  const filtered = genre === 'All' ? TRACKS : TRACKS.filter((t) => t.genre === genre);

  return (
    <section id="samples" className="relative bg-[#02050A] px-4 md:px-6 py-10 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto rounded-2xl border border-[#24C8FF]/12 bg-[#040B18]/60 p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <AudioLines size={20} className="text-[#24C8FF]" />
            <div>
              <h2 className="text-lg font-black text-[#F7FBFF]">SAMPLES &amp; RELEASES</h2>
              <p className="text-[11px] text-[#8D9BAC]">Browse original tracks created with WISE² Sound Lab.</p>
            </div>
          </div>
          <button className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#24C8FF] hover:text-[#8BE8FF] transition-colors cursor-pointer">
            VIEW ALL SAMPLES <ArrowRight size={13} />
          </button>
        </div>

        {/* genre tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition-colors cursor-pointer ${
                genre === g
                  ? 'bg-gradient-to-r from-[#008CFF] to-[#24C8FF] text-[#02050A]'
                  : 'bg-[#071321]/70 border border-[#24C8FF]/12 text-[#8D9BAC] hover:text-[#F7FBFF] hover:border-[#24C8FF]/35'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {filtered.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-[#8D9BAC] text-sm py-8">No releases in this genre yet.</p>
        )}
      </div>
    </section>
  );
}

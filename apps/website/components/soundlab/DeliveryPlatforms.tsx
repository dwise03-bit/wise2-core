'use client';

import {
  Music,
  Youtube,
  Instagram,
  Facebook,
  Podcast,
  Radio,
  Globe,
  Tv,
  CalendarDays,
  Disc,
} from 'lucide-react';

const PLATFORMS = [
  { icon: Music, label: 'Spotify' },
  { icon: Disc, label: 'Apple Music' },
  { icon: Youtube, label: 'YouTube' },
  { icon: Music, label: 'TikTok' },
  { icon: Instagram, label: 'Instagram' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Podcast, label: 'Podcasts' },
  { icon: Radio, label: 'Radio' },
  { icon: Globe, label: 'Websites' },
  { icon: Tv, label: 'Commercials' },
  { icon: CalendarDays, label: 'Events' },
];

export function DeliveryPlatforms() {
  return (
    <section className="bg-black py-20 px-5 md:px-8 border-t border-white/10">
      <div className="max-w-[1440px] mx-auto text-center">
        <h2 className="text-xl md:text-2xl font-black tracking-widest mb-10">
          DELIVERED READY <span className="text-[#9AFF00]">FOR</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 mb-12">
          {PLATFORMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-gray-400">
              <Icon size={18} className="text-[#9AFF00]" />
              <span className="text-xs font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <p className="text-sm md:text-base font-bold tracking-wide text-gray-300 max-w-2xl mx-auto mb-4">
          GREAT MUSIC IS HEARD.{' '}
          <span className="text-[#9AFF00] drop-shadow-[0_0_10px_rgba(154,255,0,0.5)]">
            UNFORGETTABLE MUSIC IS REMEMBERED.
          </span>
        </p>
        <p className="text-[10px] text-gray-600 max-w-lg mx-auto mb-8">
          Exported assets are prepared for these destinations — WISE² Sound Lab does not
          directly publish to third-party platforms on your behalf.
        </p>

        <div className="text-6xl md:text-8xl font-black text-white/5 select-none">W²</div>
      </div>
    </section>
  );
}

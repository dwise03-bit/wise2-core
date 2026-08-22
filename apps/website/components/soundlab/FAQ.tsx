'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'Is the music original?',
    a: 'Yes. Every track, jingle, and sonic identity we produce is composed and produced specifically for your brand — nothing is pulled from stock libraries.',
  },
  {
    q: 'Can I use it commercially?',
    a: 'Every package includes a commercial use license, so you can run your audio across ads, social media, broadcast, and your own products.',
  },
  {
    q: 'Can you match my brand personality?',
    a: 'That is the entire point of the intake process — we build around your brand voice, audience, and goals rather than a generic template.',
  },
  {
    q: 'Can I request revisions?',
    a: 'Yes. Starter includes 1 revision, Pro includes unlimited revisions, and Enterprise engagements work with a dedicated producer through as many rounds as needed.',
  },
  {
    q: 'How fast is delivery?',
    a: 'Most jingles and short-form audio deliver in a few business days. Full productions and sonic branding systems take longer — your producer will give you a timeline upfront.',
  },
  {
    q: 'What files will I receive?',
    a: 'Depending on your package: mastered MP3/WAV files, stems for further mixing, and social-ready edits sized for the platforms you need.',
  },
  {
    q: 'Can you create multiple versions for social media?',
    a: 'Yes — Pro and Enterprise packages include social media edits cut for TikTok, Reels, and YouTube Shorts.',
  },
  {
    q: 'Can WISE² build my entire sonic brand?',
    a: 'Yes. The Enterprise package covers a full sonic identity system: theme song, sonic logo, brand voice system, and an ongoing music library.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-black py-20 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-black tracking-widest mb-12">
          FAQ
        </h2>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className="rounded-lg border border-white/10 bg-[#0a0a0a] overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-bold text-gray-200">{item.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-[#9AFF00] transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-xs text-gray-500 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

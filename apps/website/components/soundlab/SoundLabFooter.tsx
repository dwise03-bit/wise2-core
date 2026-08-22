'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Instagram, Youtube, Music2, Facebook, Twitter, Send, Check } from 'lucide-react';

const COMPANY_LINKS = [
  { label: 'About Us', href: '#what-we-create' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Samples', href: '#samples' },
  { label: 'Careers', href: '#footer' },
  { label: 'Contact', href: '#footer' },
];

const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund Policy', href: '#footer' },
  { label: 'Licensing', href: '#footer' },
];

const SOCIALS = [
  { icon: Instagram, label: 'Instagram' },
  { icon: Youtube, label: 'YouTube' },
  { icon: Music2, label: 'TikTok' },
  { icon: Facebook, label: 'Facebook' },
  { icon: Twitter, label: 'X' },
];

export function SoundLabFooter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubmitted(true);
  };

  return (
    <footer id="footer" className="bg-black border-t border-white/10 pt-16 pb-8 px-5 md:px-8 scroll-mt-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <p className="text-xl font-black tracking-tight mb-2">
              WISE<sup className="text-[10px]">2</sup>{' '}
              <span className="text-[#9AFF00]">SOUND LAB</span>
            </p>
            <p className="text-xs text-gray-500 tracking-wide leading-relaxed">
              SOUND BUILDS BRANDS.
              <br />
              MUSIC CREATES LEGENDS.
            </p>
            <div className="flex gap-3 mt-5">
              {SOCIALS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#footer"
                  aria-label={label}
                  className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#9AFF00] hover:border-[#9AFF00]/50 transition-colors cursor-pointer"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-black tracking-widest text-gray-500 mb-4">COMPANY</p>
            <ul className="space-y-2.5">
              {COMPANY_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="text-xs text-gray-400 hover:text-[#9AFF00] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-black tracking-widest text-gray-500 mb-4">LEGAL</p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-xs text-gray-400 hover:text-[#9AFF00] transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-black tracking-widest text-gray-500 mb-4">JOIN THE MOVEMENT</p>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Get updates, music tips, and exclusive offers.
            </p>
            {submitted ? (
              <p className="flex items-center gap-2 text-xs text-[#9AFF00]">
                <Check size={14} /> You&apos;re on the list.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded px-3 py-2.5 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#9AFF00]/60"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="px-3.5 py-2.5 rounded bg-[#9AFF00] text-black hover:shadow-[0_0_16px_rgba(154,255,0,0.5)] transition-shadow cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[10px] text-gray-600">© 2026 WISE² Sound Lab. All rights reserved.</p>
          <p className="text-[10px] font-bold tracking-widest text-gray-600">
            BUILT BY WISE² <span className="text-[#9AFF00]">|</span> ORGANIZED CHAOS.
          </p>
        </div>
      </div>
    </footer>
  );
}

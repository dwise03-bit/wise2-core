'use client';

import { useEffect, useState } from 'react';
import { Menu, X, AudioWaveform } from 'lucide-react';
import { useSoundLabModals } from './SoundLabModals';

const NAV_LINKS = [
  { label: 'HOME', href: '#top' },
  { label: 'SAMPLES', href: '#samples' },
  { label: 'PACKAGES', href: '#packages' },
  { label: 'HOW IT WORKS', href: '#how-it-works' },
  { label: 'AI TOOLS', href: '#studio-tools' },
  { label: 'ABOUT', href: '#what-we-create' },
  { label: 'FAQ', href: '#faq' },
  { label: 'CONTACT', href: '#footer' },
];

function scrollToId(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function SoundLabHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('#top');
  const { openIntake } = useSoundLabModals();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.querySelector(l.href)).filter(
      Boolean
    ) as Element[];
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    scrollToId(href);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md border-b border-[#9AFF00]/20' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => handleNavClick('#top')}
          className="flex items-baseline gap-2 shrink-0 cursor-pointer group"
          aria-label="WISE² Sound Lab home"
        >
          <span
            className="text-2xl font-black tracking-tight bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent"
            style={{ fontFamily: 'var(--font-sans, Inter, sans-serif)' }}
          >
            WISE<sup className="text-xs -top-3">2</sup>
          </span>
          <span className="hidden sm:inline text-sm md:text-base font-extrabold tracking-widest text-[#9AFF00] drop-shadow-[0_0_8px_rgba(154,255,0,0.6)] group-hover:drop-shadow-[0_0_14px_rgba(154,255,0,0.9)] transition-all">
            SOUND LAB
          </span>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`px-3 py-2 text-xs font-bold tracking-wider transition-colors cursor-pointer ${
                activeSection === link.href
                  ? 'text-[#9AFF00]'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openIntake()}
            className="hidden md:flex items-center gap-2 px-4 md:px-5 py-2.5 rounded border border-[#9AFF00] text-[#9AFF00] text-xs font-bold tracking-wider hover:bg-[#9AFF00] hover:text-black hover:shadow-[0_0_20px_rgba(154,255,0,0.6)] transition-all cursor-pointer"
          >
            START MY PROJECT
            <AudioWaveform size={14} />
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden p-2 text-white cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-black border-t border-[#9AFF00]/20 px-5 py-4 flex flex-col gap-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className={`text-left px-3 py-3 text-sm font-bold tracking-wider border-b border-white/5 cursor-pointer ${
                activeSection === link.href ? 'text-[#9AFF00]' : 'text-gray-300'
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              openIntake();
            }}
            className="mt-4 flex items-center justify-center gap-2 px-5 py-3 rounded border border-[#9AFF00] text-[#9AFF00] text-sm font-bold tracking-wider hover:bg-[#9AFF00] hover:text-black transition-all cursor-pointer"
          >
            START MY PROJECT
            <AudioWaveform size={16} />
          </button>
        </div>
      )}
    </header>
  );
}

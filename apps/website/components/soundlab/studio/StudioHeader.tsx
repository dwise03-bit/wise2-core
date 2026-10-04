'use client';

import { useEffect, useState } from 'react';
import { Search, ShoppingCart, ArrowRight, Menu, X } from 'lucide-react';
import { useSoundLabModals } from '../SoundLabModals';

const NAV = ['Home', 'AI Producer', 'Samples', 'Studio Tools', 'Packages', 'Licensing', 'Delivery', 'About'];

export function StudioHeader() {
  const { openIntake } = useSoundLabModals();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('Home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-[#02050A]/85 backdrop-blur-xl border-b border-[#24C8FF]/12'
          : 'bg-gradient-to-b from-[#02050A] to-transparent'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col leading-none shrink-0 cursor-pointer group"
          aria-label="WISE² Sound Lab home"
        >
          <span className="text-xl font-black tracking-tight text-[#F7FBFF] flex items-baseline">
            WISE<sup className="text-[0.6em] text-[#24C8FF]">2</sup>
          </span>
          <span className="text-[9px] font-bold tracking-[0.42em] text-[#24C8FF]/80">
            SOUND LAB
          </span>
        </button>

        {/* Center nav */}
        <nav className="hidden xl:flex items-center gap-1 mx-auto">
          {NAV.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`relative px-3.5 py-2 text-[13px] font-semibold rounded-md transition-colors cursor-pointer ${
                active === item ? 'text-[#F7FBFF]' : 'text-[#8D9BAC] hover:text-[#F7FBFF]'
              }`}
            >
              {item}
              {active === item && (
                <span className="absolute inset-x-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-[#24C8FF] to-transparent" />
              )}
            </button>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 ml-auto xl:ml-0">
          <div className="hidden md:flex items-center gap-2 h-9 w-56 px-3 rounded-lg bg-[#071321]/70 border border-[#24C8FF]/12 focus-within:border-[#24C8FF]/40 transition-colors">
            <Search size={15} className="text-[#8D9BAC] shrink-0" />
            <input
              type="text"
              placeholder="Search beats, genres, mood…"
              className="w-full bg-transparent text-[13px] text-[#F7FBFF] placeholder-[#8D9BAC] focus:outline-none"
            />
          </div>

          <button
            aria-label="Cart"
            className="relative w-9 h-9 grid place-items-center rounded-lg bg-[#071321]/70 border border-[#24C8FF]/12 text-[#8D9BAC] hover:text-[#F7FBFF] hover:border-[#24C8FF]/35 transition-colors cursor-pointer"
          >
            <ShoppingCart size={17} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#008CFF] text-[9px] font-bold text-white grid place-items-center">
              2
            </span>
          </button>

          <button
            aria-label="Account"
            className="w-9 h-9 grid place-items-center rounded-full bg-gradient-to-br from-[#008CFF] to-[#24C8FF] text-[#02050A] text-[12px] font-black cursor-pointer"
          >
            WU
          </button>

          <button
            onClick={() => openIntake()}
            className="hidden sm:flex items-center gap-2 h-9 pl-4 pr-3 rounded-lg bg-gradient-to-r from-[#008CFF] to-[#24C8FF] text-[#02050A] text-[12px] font-black tracking-wide hover:shadow-[0_0_24px_rgba(36,200,255,0.45)] transition-shadow cursor-pointer"
          >
            START A PROJECT
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="xl:hidden w-9 h-9 grid place-items-center rounded-lg text-[#F7FBFF] cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="xl:hidden bg-[#02050A]/95 backdrop-blur-xl border-t border-[#24C8FF]/12 px-4 py-3 flex flex-col">
          {NAV.map((item) => (
            <button
              key={item}
              onClick={() => {
                setActive(item);
                setMobileOpen(false);
              }}
              className={`text-left px-2 py-3 text-sm font-semibold border-b border-white/5 ${
                active === item ? 'text-[#24C8FF]' : 'text-[#8D9BAC]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

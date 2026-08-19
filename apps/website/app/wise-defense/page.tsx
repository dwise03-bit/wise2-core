'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X, CheckCircle2 } from 'lucide-react';

export default function WiseDefenseLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const navigationItems = [
    { label: 'HOME', href: '#' },
    { label: 'TRAINING PORTAL', href: '#' },
    { label: 'GEAR ROOM', href: '#' },
    { label: 'COMMUNITY', href: '#' },
    { label: 'ABOUT', href: '#' },
    { label: 'CONTACT', href: '#' },
  ];

  const services = [
    { label: 'OFFICIAL WEBSITE', desc: 'News, updates & exclusive content.', status: 'COMING SOON' },
    { label: 'TRAINING PORTAL', desc: 'Courses, certifications & training resources.', status: 'COMING SOON' },
    { label: 'GEAR ROOM™', desc: 'Firearms, apparel, accessories & more.', status: 'COMING SOON' },
    { label: 'ONLINE STORE', desc: 'Premium gear. Built for purpose.', status: 'COMING SOON' },
    { label: 'COMMUNITY PROGRAMS', desc: 'Building stronger communities together.', status: 'COMING SOON' },
  ];

  const aboutPoints = [
    'Firearm Safety & Education',
    'Youth Development',
    'Veteran Outreach',
    'Community Events',
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-sm border-b border-red-600/20">
        <div className="px-4 sm:px-6 lg:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center font-black text-2xl text-black">
                W
              </div>
              <div>
                <p className="text-sm font-black tracking-widest">WISE DEFENSE</p>
                <p className="text-xs text-gray-500">TRAIN. TEACH. PROTECT.</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`text-xs font-bold tracking-wider uppercase transition-colors ${
                    item.label === 'HOME' ? 'text-red-600' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden lg:block">
              <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-wider rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">
                JOIN NOW
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-red-600/20 space-y-3 pb-4">
              {navigationItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-2 text-sm font-bold text-gray-300 hover:text-red-500"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button className="w-full mt-4 px-4 py-2 bg-red-600 text-white text-xs font-bold rounded">
                JOIN NOW
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-0" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 w-full items-center">
          {/* Left Content */}
          <div className="px-6 sm:px-8 lg:px-12 py-16 lg:py-0">
            <div className="max-w-xl animate-fade-in">
              <p className="text-red-600 text-xs font-black tracking-widest mb-4 uppercase">
                WISE DEFENSE L.L.C.
              </p>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black leading-tight mb-6 tracking-tighter">
                TRAIN.<br />
                TEACH.<br />
                PROTECT.
              </h1>
              <p className="text-red-600 text-lg font-bold mb-6 tracking-wide">
                EMPOWERING MINDS. PROTECTING LIVES.
              </p>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-md">
                Real education. Real training. Real results. Let's get to it.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-sm tracking-wider uppercase transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center gap-2">
                  JOIN THE MOVEMENT
                  <span>→</span>
                </button>
                <button className="px-8 py-3 border-2 border-gray-700 hover:border-white text-white font-black text-sm tracking-wider uppercase transition-all duration-300 flex items-center gap-2">
                  WATCH VIDEO
                  <span>▶</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Hero Image Placeholder */}
          <div className="relative h-96 lg:h-screen w-full lg:order-last">
            <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 to-black flex items-center justify-center">
              <div className="text-center text-gray-600">
                <p className="text-sm">Instructor in action</p>
                <p className="text-xs text-gray-700">Professional photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 lg:py-20 border-t border-red-600/20 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {services.map((service, i) => (
              <div
                key={i}
                className="group border border-red-600/30 rounded-lg p-6 hover:border-red-600/60 hover:bg-red-600/5 transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
                  {['🌐', '🎯', '🛡️', '🛒', '👥'][i]}
                </div>
                <h3 className="font-black text-xs tracking-widest uppercase mb-3 text-red-600">
                  {service.label}
                </h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  {service.desc}
                </p>
                <p className="text-gray-600 text-xs font-black tracking-wider uppercase">
                  {service.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-20 border-t border-red-600/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: About Content */}
            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-4 leading-tight">
                ABOUT WISE DEFENSE
              </h2>
              <h3 className="text-2xl lg:text-3xl font-black mb-8">
                <span className="text-red-600">DISCIPLINE TODAY.</span><br />
                <span className="text-white">IMPACT FOREVER.</span>
              </h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed max-w-md">
                Wise Defense L.L.C. is built on discipline, knowledge, and purpose. We provide real world education, firearm safety training, and community programs that make a lasting impact.
              </p>
              <ul className="space-y-4 mb-8">
                {aboutPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 font-semibold">{point}</span>
                  </li>
                ))}
              </ul>
              <button className="px-6 py-3 border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-black text-sm tracking-wider uppercase transition-all duration-300 flex items-center gap-2">
                LEARN MORE
                <span>→</span>
              </button>
            </div>

            {/* Right: Testimonial & Logo */}
            <div className="space-y-8">
              {/* Large W Logo */}
              <div className="relative h-64 flex items-center justify-center opacity-20">
                <div className="text-9xl font-black text-gray-600">W</div>
              </div>

              {/* Testimonial */}
              <div className="border border-red-600/30 rounded-lg p-8 bg-red-600/5">
                <p className="text-2xl font-black text-red-600 mb-4">"</p>
                <p className="text-white text-lg font-bold leading-relaxed mb-6">
                  WE DON'T JUST<br />
                  TALK ABOUT CHANGE.<br />
                  <span className="text-red-600">WE CREATE IT.</span>
                </p>
                <p className="text-gray-400 font-semibold">D Wise</p>
                <p className="text-gray-500 text-sm font-black tracking-wider">FOUNDER / CEO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-16 lg:py-20 border-t border-red-600/20 bg-black/50"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '👥', value: '10K+', label: 'LIVES IMPACTED' },
              { icon: '🛡️', value: '19', label: 'YEARS EXPERIENCE' },
              { icon: '📚', value: '100+', label: 'TRAINING COURSES' },
              { icon: '🤝', value: 'STRONGER', label: 'TOGETHER' },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center"
                style={{
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.6s ease-out ${i * 100}ms`,
                }}
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <p className="text-3xl lg:text-4xl font-black text-red-600 mb-2">
                  {stat.value}
                </p>
                <p className="text-xs font-black text-gray-400 tracking-widest uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expansion Section */}
      <section className="py-16 lg:py-20 border-t border-red-600/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-5xl lg:text-6xl font-black mb-4">
            WISE DEFENSE<br />
            <span className="text-red-600">IS EXPANDING™</span>
          </h2>
          <div className="mt-12 p-12 border-2 border-red-600/30 rounded-lg bg-red-600/5">
            <p className="text-3xl lg:text-4xl font-black text-white leading-tight">
              SOMETHING<br />
              <span className="text-red-600">BIG IS COMING</span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-red-600/20 py-16 bg-black/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div>
              <p className="text-sm font-black tracking-widest mb-4">WISE DEFENSE</p>
              <p className="text-xs text-gray-500">TRAIN. TEACH. PROTECT.</p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-black text-gray-400 tracking-widest mb-4">FOLLOW US</p>
              <ul className="space-y-3 text-xs">
                <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">Instagram</a></li>
                <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">Facebook</a></li>
                <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">YouTube</a></li>
                <li><a href="#" className="text-gray-500 hover:text-red-600 transition-colors">TikTok</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-black text-gray-400 tracking-widest mb-4">CONTACT US</p>
              <ul className="space-y-3 text-xs text-gray-500">
                <li><a href="mailto:info@wisedefensellc.com" className="hover:text-red-600 transition-colors">info@wisedefensellc.com</a></li>
                <li><a href="tel:+13367090472" className="hover:text-red-600 transition-colors">(336) 709-0472</a></li>
              </ul>
            </div>

            {/* Badge */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <div className="w-32 h-32 border-2 border-red-600/40 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs font-black text-red-600 tracking-widest">WISE</p>
                  <p className="text-4xl font-black text-gray-600">W</p>
                  <p className="text-xs font-black text-red-600 tracking-widest">DEFENSE</p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-red-600/20 pt-8 text-center">
            <p className="text-xs text-gray-600 font-black tracking-widest">
              © 2026 WISE DEFENSE L.L.C. ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

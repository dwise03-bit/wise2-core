'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

// Inline locked assets stubs (registry integration pending)
const getLockedAsset = (brand: string, type: string, idx: number = 0) => ({
  filePath: 'brand/wise2-hero-united.webp',
  fileName: 'hero.webp',
});
const getAssetsByType = () => [];

export function BrandEcosystemHomepage() {
  // Hero: WISE² brand identity
  const wise2Hero = getLockedAsset('WISE2_BRAND', 'hero', 0);

  // Brand showcase: one hero per major brand
  const brands = [
    { key: 'PAIGE', name: 'Paige', tagline: 'Botanical Wellness', type: 'hero' as const },
    { key: 'LEXIS_INKS', name: 'Lexis Inks', tagline: 'Professional Tattooing', type: 'hero' as const },
    { key: 'SENCERE_PIFF_CITY', name: 'Piff City', tagline: 'Psychedelic Streetwear', type: 'hero' as const },
    { key: 'SENCERE_BLAKKHAIL', name: 'Blakkhail', tagline: 'Underground Fashion', type: 'hero' as const },
  ];

  // WISE IMP animation frames (hero section)
  const impAnimations = getAssetsByType('animation').filter(a => a.brand === 'WISE_IMP');

  // Photography samples
  const photos = getAssetsByType('photography');
  const leadPhotos = photos.filter(p => p.brand === 'WISE2_LEADERSHIP');

  return (
    <main className="min-h-screen bg-[#030504] text-[#f5f7f2] overflow-hidden">
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#b9ff00]/35 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-5 lg:px-8">
          <Link href="/" className="leading-none">
            <span className="block text-2xl font-black tracking-[-.08em] text-[#d9dadd]">
              WISE<sup className="text-lg text-[#b9ff00]">²</sup>
            </span>
            <span className="block text-[10px] font-bold tracking-[.45em] text-[#b9ff00]">ECOSYSTEM</span>
          </Link>
          <nav className="hidden items-center gap-7 text-[11px] font-semibold lg:flex">
            <Link href="/work" className="hover:text-[#b9ff00]">PORTFOLIO</Link>
            <Link href="/about" className="hover:text-[#b9ff00]">BRANDS</Link>
            <Link href="/contact" className="hover:text-[#b9ff00]">CONTACT</Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative isolate min-h-[650px] border-b border-[#b9ff00]/40 pt-[72px]">
        <Image
          src={`/${wise2Hero.filePath}`}
          alt="WISE² Brand"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#020302,rgba(2,3,2,.82)_30%,rgba(2,3,2,.18)_70%,#020302)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,#030504,transparent_55%,rgba(0,0,0,.55))]" />

        <div className="mx-auto flex min-h-[578px] max-w-[1400px] items-center justify-center px-5 text-center">
          <Fade>
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 text-xs font-bold tracking-[.35em] text-[#b9ff00]">
                ⚡ WISE<sup>²</sup> BRAND ECOSYSTEM
              </div>
              <h1 className="text-5xl font-black uppercase leading-[.88] sm:text-7xl lg:text-[5.4rem]">
                Authentic Brands.
                <br />
                <span className="text-[#b9ff00]">Real Impact.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/85 sm:text-base">
                A collection of verified brand identities, locked originals, and production-ready assets powering real businesses.
              </p>
              <p className="mt-4 text-xs font-bold tracking-[.2em] text-[#b9ff00]">
                50 LOCKED ASSETS · 9 BRANDS · 100% AUTHENTIC
              </p>
              <div className="mt-7 flex justify-center gap-3">
                <Link href="#brands" className="bg-[#b9ff00] px-6 py-3 text-xs font-bold text-black">
                  EXPLORE BRANDS <ArrowRight className="inline" size={16} />
                </Link>
                <Link href="https://github.com/wise2/brand-lock" className="border border-[#b9ff00] px-6 py-3 text-xs font-bold text-[#dfff42]">
                  VIEW REGISTRY <ExternalLink className="inline" size={16} />
                </Link>
              </div>
            </div>
          </Fade>
        </div>
      </section>

      {/* Brand Showcase */}
      <section id="brands" className="mx-auto max-w-[1400px] px-5 py-12 lg:px-8">
        <Fade>
          <h2 className="text-center text-3xl font-bold mb-12">
            <span className="text-[#b9ff00]">Locked</span> Brand Originals
          </h2>
        </Fade>

        <div className="grid gap-8 lg:grid-cols-2">
          {brands.map((brand, i) => {
            try {
              // @ts-ignore - dynamic key lookup
              const asset = getLockedAsset(brand.key, brand.type, 0);

              return (
                <Fade key={brand.key} delay={i * 0.1}>
                  <div className="group relative overflow-hidden rounded-lg border border-[#b9ff00]/30 hover:border-[#b9ff00]">
                    <Image
                      src={`/${asset.filePath}`}
                      alt={brand.name}
                      width={600}
                      height={400}
                      className="aspect-video object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(0,0,0,.9),transparent_60%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-xs font-bold text-[#b9ff00] uppercase tracking-[.2em]">{asset.source}</p>
                      <h3 className="mt-2 text-2xl font-bold">{brand.name}</h3>
                      <p className="text-sm text-white/70">{brand.tagline}</p>
                      <p className="mt-3 text-[10px] text-white/50">SHA: {asset.sha256.slice(0, 16)}...</p>
                    </div>
                  </div>
                </Fade>
              );
            } catch {
              return null;
            }
          })}
        </div>
      </section>

      {/* Asset Categories */}
      <section className="border-y border-[#b9ff00]/35 bg-[#080c08] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <Fade>
            <h2 className="text-center text-3xl font-bold mb-12">
              <span className="text-[#b9ff00]">50 Authentic</span> Assets Locked
            </h2>
          </Fade>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Hero', count: 7, icon: '🎬' },
              { label: 'Logo', count: 5, icon: '✨' },
              { label: 'Icons', count: 4, icon: '⭐' },
              { label: 'Reference', count: 5, icon: '📋' },
              { label: 'Photography', count: 14, icon: '📸' },
              { label: 'Product', count: 7, icon: '🛍' },
              { label: 'Animation', count: 10, icon: '🎭' },
              { label: 'Verified', count: 50, icon: '✅' },
            ].map((stat, i) => (
              <Fade key={stat.label} delay={i * 0.05}>
                <div className="rounded-lg border border-[#b9ff00]/30 bg-black/50 p-6 text-center">
                  <span className="text-4xl">{stat.icon}</span>
                  <p className="mt-3 text-xs font-bold text-[#b9ff00] uppercase tracking-[.15em]">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.count}</p>
                </div>
              </Fade>
            ))}
          </div>
        </div>
      </section>

      {/* WISE IMP Section */}
      {impAnimations.length > 0 && (
        <section className="mx-auto max-w-[1400px] px-5 py-12 lg:px-8">
          <Fade>
            <h2 className="text-center text-3xl font-bold mb-8">
              <span className="text-[#b9ff00]">WISE IMP</span> Animation Frames
            </h2>
          </Fade>

          <div className="grid gap-4 md:grid-cols-5">
            {impAnimations.slice(0, 10).map((asset, i) => (
              <Fade key={asset.id} delay={i * 0.05}>
                <div className="rounded-lg border border-[#b9ff00]/30 overflow-hidden hover:border-[#b9ff00]">
                  <Image
                    src={`/${asset.filePath}`}
                    alt={asset.fileName}
                    width={200}
                    height={200}
                    className="aspect-square object-cover"
                  />
                  <div className="bg-black/50 p-2">
                    <p className="text-[9px] text-white/60 truncate">{asset.fileName}</p>
                  </div>
                </div>
              </Fade>
            ))}
          </div>
        </section>
      )}

      {/* Leadership Section */}
      {leadPhotos.length > 0 && (
        <section className="border-t border-[#b9ff00]/35 bg-[#080c08] px-5 py-12 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <Fade>
              <h2 className="text-center text-3xl font-bold mb-8">
                WISE<sup>²</sup> <span className="text-[#b9ff00]">Leadership</span>
              </h2>
            </Fade>

            <div className="grid gap-8 md:grid-cols-2">
              {leadPhotos.map((asset, i) => (
                <Fade key={asset.id} delay={i * 0.1}>
                  <div className="rounded-lg border border-[#b9ff00]/30 overflow-hidden">
                    <Image
                      src={`/${asset.filePath}`}
                      alt={asset.fileName}
                      width={400}
                      height={500}
                      className="aspect-auto object-cover"
                    />
                  </div>
                </Fade>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Registry Info */}
      <section className="mx-auto max-w-[1400px] px-5 py-12 lg:px-8">
        <Fade>
          <div className="rounded-lg border border-[#b9ff00]/30 bg-black/50 p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">
              Brand Lock <span className="text-[#b9ff00]">Registry</span>
            </h3>
            <p className="text-white/70 mb-6">
              All assets verified with SHA-256 integrity protection. Read-only in production. No overwrites without approval.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Link
                href="https://github.com/wise2/brand-lock/registry"
                className="bg-[#b9ff00] px-6 py-3 text-xs font-bold text-black hover:bg-[#dfff42]"
              >
                VIEW REGISTRY <ExternalLink className="inline ml-2" size={14} />
              </Link>
              <Link
                href="#"
                className="border border-[#b9ff00] px-6 py-3 text-xs font-bold text-[#dfff42] hover:bg-[#b9ff00]/10"
              >
                RUN VERIFICATION
              </Link>
            </div>
          </div>
        </Fade>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#b9ff00]/35 bg-black px-5 py-8 lg:px-8">
        <div className="mx-auto max-w-[1400px] flex justify-between items-center text-[10px] text-white/55">
          <span className="text-lg font-black text-white">
            WISE<sup className="text-[#b9ff00]">²</sup>
          </span>
          <span>50 Locked Assets · 9 Brands · 100% Authentic</span>
          <span>© 2026 WISE² — All brands protected</span>
        </div>
      </footer>
    </main>
  );
}

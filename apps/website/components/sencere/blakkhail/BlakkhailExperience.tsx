'use client';

import Image from 'next/image';
import { useState } from 'react';
import { blakkhailBrand } from './config';
import {
  BLAKKHAIL_ASSETS,
  BLAKKHAIL_CATEGORIES,
  type BlakkhailCategory,
  type CinematicPhase,
} from './blakkhail-experience';
import { BLAKKHAIL, BLAKKHAIL_LAYOUT } from './brand-tokens';
import styles from './blakkhail-cinematic.module.css';

interface BlakkhailExperienceProps {
  activeCategory: BlakkhailCategory | null;
  cinematicPhase: CinematicPhase;
  onSelectCategory: (category: BlakkhailCategory) => void;
}

export function BlakkhailExperience({
  activeCategory,
  cinematicPhase,
  onSelectCategory,
}: BlakkhailExperienceProps) {
  const [pressed, setPressed] = useState<BlakkhailCategory | null>(null);
  const isTransitioning = cinematicPhase !== 'idle' && cinematicPhase !== 'complete';
  const lightsDimmed = cinematicPhase === 'lights-out' || isTransitioning;

  const handlePress = (category: BlakkhailCategory) => {
    if (isTransitioning) return;
    setPressed(category);
    onSelectCategory(category);
  };

  return (
    <section id="home" className="relative w-full overflow-hidden">
      {/* SCENE 1–2: gritty hallway — fluorescents, steam, breathing */}
      <div
        className={`relative min-h-[52vh] w-full sm:min-h-[58vh] ${styles.hallwayBreathe}`}
        style={{
          background: `
            linear-gradient(180deg, rgba(10,10,10,0.15) 0%, rgba(10,10,10,0.92) 100%),
            repeating-linear-gradient(90deg, #1c1c1c 0px, #1c1c1c 3px, #121212 3px, #121212 28px),
            repeating-linear-gradient(0deg, transparent 0px, transparent 48px, rgba(30,30,30,0.4) 48px, rgba(30,30,30,0.4) 50px)
          `,
        }}
      >
        {/* Flickering fluorescent */}
        <div
          className={`pointer-events-none absolute inset-0 ${styles.flickerLight}`}
          style={{
            background:
              'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(214,163,49,0.22) 0%, rgba(214,163,49,0.06) 40%, transparent 70%)',
            opacity: lightsDimmed ? 0 : 1,
            transition: 'opacity 0.5s ease',
          }}
        />

        {/* Steam wisps from pipes */}
        <div className="pointer-events-none absolute bottom-0 left-[8%] h-32 w-16 opacity-40" aria-hidden>
          <div
            className={`h-full w-full rounded-full blur-xl ${styles.steamWisp}`}
            style={{ background: 'radial-gradient(circle, rgba(168,168,168,0.5) 0%, transparent 70%)' }}
          />
        </div>
        <div className="pointer-events-none absolute bottom-0 right-[12%] h-40 w-20 opacity-35" aria-hidden>
          <div
            className={`h-full w-full rounded-full blur-xl ${styles.steamWisp2}`}
            style={{ background: 'radial-gradient(circle, rgba(168,168,168,0.45) 0%, transparent 70%)' }}
          />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-[45%] h-28 w-14 opacity-30" aria-hidden>
          <div
            className={`h-full w-full rounded-full blur-xl ${styles.steamWisp3}`}
            style={{ background: 'radial-gradient(circle, rgba(168,168,168,0.4) 0%, transparent 70%)' }}
          />
        </div>

        <div
          className={`${BLAKKHAIL_LAYOUT.container} relative flex min-h-[52vh] flex-col justify-between py-8 sm:min-h-[58vh] sm:py-12`}
        >
          {/* SenCere emblem + TAKE CONTROL */}
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
            <div
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 sm:h-24 sm:w-24"
              style={{ borderColor: BLAKKHAIL.gold }}
            >
              <Image
                src={BLAKKHAIL_ASSETS.sencereEmblem}
                alt="SenCere Creative LLC emblem"
                fill
                sizes="96px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col gap-1 sm:gap-2">
              <p
                className="text-[10px] font-bold uppercase tracking-[0.35em] sm:text-xs"
                style={{ color: BLAKKHAIL.steel }}
              >
                Int. Gritty Hallway — Night
              </p>
              <p
                className="text-lg font-black uppercase tracking-[0.1em] sm:text-2xl lg:text-3xl"
                style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
              >
                {blakkhailBrand.legalName}
              </p>
              <p
                className="text-xl font-black uppercase tracking-[0.18em] sm:text-2xl lg:text-4xl"
                style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
              >
                {blakkhailBrand.motto}
              </p>
            </div>
          </div>

          {/* BLAKK HAIL arrow down hall */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`hidden text-2xl sm:inline ${styles.arrowDownHall}`}
                style={{ color: BLAKKHAIL.gold }}
                aria-hidden
              >
                →
              </span>
              <div className="border-l-4 py-2 pl-4" style={{ borderColor: BLAKKHAIL.gold }}>
                <p
                  className="text-3xl font-black uppercase tracking-[0.08em] sm:text-4xl lg:text-5xl"
                  style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
                >
                  Blakk Hail
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.steel }}>
                  ↓ Down the hall
                </p>
              </div>
            </div>

            {/* Two friends silhouettes */}
            <div className="hidden items-end gap-1 sm:flex" aria-hidden>
              <div
                className="h-24 w-8 rounded-t-full"
                style={{ background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)' }}
              />
              <div
                className="h-28 w-9 rounded-t-full"
                style={{ background: 'linear-gradient(180deg, #222 0%, #0a0a0a 100%)' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SCENE 3–5: steel door + PIFF CITY + intercom */}
      <div
        className="relative border-y py-10 sm:py-14"
        style={{
          borderColor: BLAKKHAIL.darkGold,
          backgroundColor: BLAKKHAIL.jetBlack,
          opacity: lightsDimmed && cinematicPhase !== 'idle' ? 0.15 : 1,
          transition: 'opacity 0.4s ease',
        }}
      >
        <div className={`${BLAKKHAIL_LAYOUT.container} grid gap-10 lg:grid-cols-[1fr_320px] lg:items-stretch`}>
          {/* Steel door */}
          <div className="relative flex flex-col">
            <p className="text-xs uppercase tracking-[0.35em]" style={{ color: BLAKKHAIL.steel }}>
              At the door
            </p>

            {/* PIFF CITY above door */}
            <div className="relative mx-auto mt-4 w-full max-w-lg">
              <div
                className="mb-2 flex items-center justify-center gap-3 border px-4 py-3"
                style={{
                  borderColor: BLAKKHAIL.gold,
                  backgroundColor: BLAKKHAIL.gunmetal,
                  boxShadow: '0 0 30px rgba(214, 163, 49, 0.15)',
                }}
              >
                <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
                  <Image
                    src={BLAKKHAIL_ASSETS.piffCitySkull}
                    alt="Piff City"
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </div>
                <p
                  className="text-2xl font-black uppercase tracking-[0.12em] sm:text-3xl"
                  style={{ color: BLAKKHAIL.gold, fontFamily: 'var(--font-display)' }}
                >
                  Piff City
                </p>
              </div>

              {/* Steel door frame */}
              <div
                className="relative aspect-[4/5] w-full overflow-hidden border-4"
                style={{
                  borderColor: '#3a3a3a',
                  background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #252525 100%)',
                  boxShadow: 'inset 0 0 60px rgba(0,0,0,0.8), 0 8px 32px rgba(0,0,0,0.6)',
                }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                  }}
                />
                <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-4" style={{ borderColor: BLAKKHAIL.darkGold }} />
                <div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em]"
                  style={{ color: BLAKKHAIL.steel }}
                >
                  Vault sealed
                </div>
              </div>
            </div>

            {activeCategory && cinematicPhase === 'complete' && (
              <p className="mt-4 text-center text-sm font-bold uppercase tracking-[0.16em]" style={{ color: BLAKKHAIL.gold }}>
                Active: {BLAKKHAIL_CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </p>
            )}
          </div>

          {/* Intercom panel */}
          <div
            className="flex flex-col justify-center rounded-sm border p-5 sm:p-6"
            style={{
              borderColor: BLAKKHAIL.darkGold,
              backgroundColor: BLAKKHAIL.gunmetal,
              boxShadow: '0 0 40px rgba(214, 163, 49, 0.08)',
            }}
          >
            <p className="mb-1 text-center text-[10px] uppercase tracking-[0.3em]" style={{ color: BLAKKHAIL.steel }}>
              Intercom Panel
            </p>
            <p
              className="mb-6 text-center text-sm font-bold uppercase tracking-[0.12em] sm:text-base"
              style={{ color: BLAKKHAIL.gold }}
            >
              What are you here for?
            </p>
            <div className="flex flex-col gap-3" role="group" aria-label="Select product category">
              {BLAKKHAIL_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.id && cinematicPhase === 'complete';
                const isPressed = pressed === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    disabled={isTransitioning}
                    onClick={() => handlePress(cat.id)}
                    className="min-h-12 rounded-sm border px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
                    style={{
                      borderColor: isActive || isPressed ? BLAKKHAIL.gold : BLAKKHAIL.darkGold,
                      backgroundColor: isActive ? BLAKKHAIL.gold : BLAKKHAIL.jetBlack,
                      color: isActive ? BLAKKHAIL.jetBlack : BLAKKHAIL.gold,
                      boxShadow: isActive ? '0 0 24px rgba(214, 163, 49, 0.45)' : undefined,
                    }}
                  >
                    {cat.intercomLabel}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em]" style={{ color: BLAKKHAIL.steel }}>
              T-shirts · Hoodies · Hats
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

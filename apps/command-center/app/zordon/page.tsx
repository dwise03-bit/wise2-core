'use client';

/**
 * Zordon preview harness.
 *
 * There is no art yet, so this shows the SPEC — canon features, palette
 * decision, the 16 page variants and their props — with empty slots where the
 * renders drop in. Once scripts/zordon-generator.py has run and the sprite
 * sheets exist, wire ZORDON_SPRITES below and the animated states light up.
 *
 * Deliberately shows placeholders rather than nothing, so the harness is useful
 * before the art lands and obvious about what is still missing.
 */

import React, { useState } from 'react';
import { Zordon, type ZordonState, type ZordonSprite } from '../../src/components/ui/Zordon';

// Fill these in once the sheets exist in /public/zordon/.
// `frames` must match what animate-character reported, or you get visible jitter.
const ZORDON_SPRITES: Partial<Record<ZordonState, ZordonSprite>> = {
  // idle:      { src: '/zordon/idle.png',      frames: 24, duration: 2.0 },
  // wave:      { src: '/zordon/wave.png',      frames: 24, duration: 1.5, once: true },
  // thinking:  { src: '/zordon/thinking.png',  frames: 24, duration: 2.0 },
  // celebrate: { src: '/zordon/celebrate.png', frames: 24, duration: 1.5, once: true },
};

const CANON = [
  'Two curved matte black horns',
  'Black ribbed beanie, gold crown, W²',
  'Pointed elf ears',
  'Oversized electric blue eyes',
  'Gold rope chain, outside the hoodie',
  'Black hoodie, gold W² chest mark',
  'Slim pointed spade-tip tail',
];

const PAGE_VARIANTS: Array<[string, string]> = [
  ['sound-lab', 'gold headphones round the neck'],
  ['live-studio', 'chrome microphone'],
  ['ai', 'holographic orb on an open palm'],
  ['workflows', 'floating gold gear'],
  ['leads', 'tablet with a rising line'],
  ['customers', 'tablet with a rising line'],
  ['billing', 'gold coin on a fingertip'],
  ['print-on-demand', 'folded black t-shirt'],
  ['gallery', 'gold-tipped paintbrush'],
  ['projects', 'gold clipboard'],
  ['discord', 'game controller'],
  ['business-os', 'floating gold crown'],
  ['consulting', 'gold pointer at a chart'],
  ['jingle-lab', 'gold music notes'],
  ['pricing', 'a coin in each hand'],
  ['community', 'welcoming open arm'],
];

const STATES: ZordonState[] = ['idle', 'wave', 'thinking', 'celebrate'];

export default function ZordonPreview() {
  const [state, setState] = useState<ZordonState>('idle');
  const hasArt = Object.keys(ZORDON_SPRITES).length > 0;

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight">ZORDON</h1>
          <p className="text-neutral-400 mt-1">WISE² mascot — preview harness</p>
        </header>

        {!hasArt && (
          <div className="mb-10 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
            <p className="font-semibold text-amber-300">No art yet</p>
            <p className="text-sm text-neutral-300 mt-1">
              Run <code className="text-amber-200">scripts/zordon-generator.py</code> on the GPU
              box, pick an on-model render, then <code className="text-amber-200">/animate-character</code>{' '}
              it into sprite sheets. Drop them in <code className="text-amber-200">/public/zordon/</code>{' '}
              and uncomment <code className="text-amber-200">ZORDON_SPRITES</code> in this file.
            </p>
          </div>
        )}

        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4 text-neutral-200">Animation states</h2>
          <div className="flex gap-2 mb-6 flex-wrap">
            {STATES.map((s) => (
              <button
                key={s}
                onClick={() => setState(s)}
                className={`px-4 py-2 rounded-md text-sm transition-colors ${
                  state === s
                    ? 'bg-[#0094FF] text-black font-semibold'
                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-center h-56 rounded-lg border border-neutral-800 bg-neutral-950">
            {hasArt ? (
              <Zordon state={state} sprites={ZORDON_SPRITES} size={180} />
            ) : (
              <span className="text-neutral-600 text-sm">
                sprite sheet for “{state}” not present
              </span>
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-1 text-neutral-200">Canon — all seven, always</h2>
          <p className="text-sm text-neutral-500 mb-4">
            A render missing any of these is off-model. Discard it rather than fixing it in post.
          </p>
          <ul className="grid sm:grid-cols-2 gap-2">
            {CANON.map((c) => (
              <li key={c} className="text-sm text-neutral-300 bg-neutral-900/60 rounded px-3 py-2">
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-1 text-neutral-200">Palette — unresolved</h2>
          <p className="text-sm text-neutral-500 mb-4">
            The reference art and the brand bible disagree. Decide before rendering 16 variants.
          </p>
          <div className="flex gap-4 flex-wrap">
            {[
              ['#0094FF', 'reference art + login page'],
              ['#0055FF', 'BRAND_BIBLE_UPDATED.md'],
              ['#D4AF37', 'gold — not yet a brand token'],
            ].map(([hex, note]) => (
              <div key={hex} className="flex items-center gap-3 bg-neutral-900/60 rounded px-3 py-2">
                <span
                  className="w-8 h-8 rounded border border-neutral-700"
                  style={{ background: hex }}
                />
                <div>
                  <div className="text-sm font-mono">{hex}</div>
                  <div className="text-xs text-neutral-500">{note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-1 text-neutral-200">
            Page variants — {PAGE_VARIANTS.length}
          </h2>
          <p className="text-sm text-neutral-500 mb-4">
            Canon plus exactly one prop each. Two props and he stops reading as the same character.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PAGE_VARIANTS.map(([page, prop]) => (
              <div key={page} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="aspect-square rounded bg-neutral-900 mb-3 flex items-center justify-center">
                  <span className="text-neutral-700 text-xs">not rendered</span>
                </div>
                <div className="text-sm font-mono text-[#0094FF]">{page}</div>
                <div className="text-xs text-neutral-500 mt-1">{prop}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

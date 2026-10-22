'use client';

import { useState } from 'react';
import Link from 'next/link';
import './type-lab.css';

type Finish = 'metallic' | 'emerald' | 'brushed';
const choices: { id: Finish; label: string; description: string }[] = [
  { id: 'metallic', label: 'Metallic Official', description: 'Silver highlights · precise beveled depth' },
  { id: 'emerald', label: 'Emerald Edge', description: 'Silver lettering · controlled emerald rim light' },
  { id: 'brushed', label: 'Brushed Luxury', description: 'Satin metal · understated premium finish' },
];

export default function TypeLabPage() {
  const [finish, setFinish] = useState<Finish>('emerald');
  return (
    <main className={`wise-type-lab finish-${finish}`}>
      <div className="wise-type-film" aria-hidden="true">
        <video autoPlay loop muted playsInline preload="metadata">
          <source src="/media/wise2-tunnel-background.mp4" type="video/mp4" />
        </video>
        <div className="wise-type-film-scrim" />
      </div>
      <div className="wise-type-content">
        <header className="wise-type-header">
          <Link href="/" className="wise-type-mark">W² <span>WISE²</span></Link>
          <span className="wise-type-kicker">TYPOGRAPHY LAB / PRIVATE DESIGN PREVIEW</span>
        </header>
        <div className="wise-type-picker" role="group" aria-label="Typography finish">
          {choices.map(choice => (
            <button key={choice.id} type="button" aria-pressed={finish === choice.id}
              onClick={() => setFinish(choice.id)}
              className={finish === choice.id ? 'selected' : ''}>
              <strong>{choice.label}</strong><small>{choice.description}</small>
            </button>
          ))}
        </div>
        <section className="wise-type-hero">
          <p className="wise-type-eyebrow">WISE² / BUSINESS OPERATING SYSTEMS</p>
          <h1 className="wise-type-headline">INTELLIGENCE<br /><span>IN MOTION.</span></h1>
          <p className="wise-type-subhead">TWO MINDS. ONE VISION.</p>
          <p className="wise-type-copy">Designed for the work that moves the world. Intelligent tools, cinematic creativity, and real-world business infrastructure.</p>
          <div className="wise-type-actions">
            <Link href="/ai-audit" className="wise-type-cta primary">EXPLORE THE SYSTEM <span aria-hidden="true">↗</span></Link>
            <Link href="/consulting" className="wise-type-cta secondary">OUR SERVICES</Link>
          </div>
        </section>
        <section className="wise-type-services" aria-label="Heading and card samples">
          <h2>THE WISE² ECOSYSTEM</h2>
          <div className="wise-type-grid">
            <article><span>01 / CONNECT</span><h3>AI AUTOMATION</h3><p>Intelligence across systems, workflows, and operations.</p></article>
            <article><span>02 / CREATE</span><h3>CREATIVE STUDIO</h3><p>Production-quality experiences with an unmistakable identity.</p></article>
            <article><span>03 / DEPLOY</span><h3>INFRASTRUCTURE</h3><p>Reliable tools built for businesses in the real world.</p></article>
          </div>
        </section>
        <footer className="wise-type-footer">DESIGN PREVIEW ONLY · THE LIVE HOMEPAGE IS UNCHANGED</footer>
      </div>
    </main>
  );
}

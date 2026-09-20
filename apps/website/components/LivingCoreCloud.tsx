'use client';

import Link from 'next/link';
import { MouseEvent, useEffect, useState } from 'react';
import { ArrowRight, Check, ShieldCheck, Server, TrendingUp } from 'lucide-react';
import { CLOUD_PLANS_STATIC } from '@/lib/cloud-brand';

const chapters = [
  { title: 'HOST', icon: Server, copy: 'Infrastructure that gives your business a dependable place to operate.' },
  { title: 'PROTECT', icon: ShieldCheck, copy: 'A resilient operating layer built around security and continuity.' },
  { title: 'SCALE', icon: TrendingUp, copy: 'A foundation designed to grow with your next move.' },
  { title: 'PROFIT', icon: ArrowRight, copy: 'Infrastructure that helps create room for the work that matters.' },
];

const glyphs = ['W²://CORE', '<>', '//', '[]', 'SYNC', 'NODE', '01', '↗', '◇', 'W²'];

export function LivingCoreCloud() {
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  function trackPointer(event: MouseEvent<HTMLElement>) {
    if (reduced) return;
    const box = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${((event.clientX - box.left) / box.width) * 100}%`);
    event.currentTarget.style.setProperty('--pointer-y', `${((event.clientY - box.top) / box.height) * 100}%`);
  }

  return (
    <main className="living-cloud" onMouseMove={trackPointer}>
      <section className="living-hero" aria-labelledby="living-core-title">
        <div className="living-atmosphere" aria-hidden="true" />
        <div className="living-glyphs" aria-hidden="true">
          {glyphs.map((glyph, index) => <span key={`${glyph}-${index}`}>{glyph}</span>)}
        </div>
        <div className="living-hero-grid">
          <div className="living-copy">
            <p className="living-kicker">WISE² CLOUD / LIVING CORE</p>
            <h1 id="living-core-title">YOUR BUSINESS.<br /><em>OUR INFRASTRUCTURE.</em></h1>
            <p className="living-sequence">HOST <span>→</span> PROTECT <span>→</span> SCALE <span>→</span> PROFIT</p>
            <p className="living-lede">A living intelligent infrastructure layer that attracts signals, transforms complexity, and puts momentum back into your business.</p>
            <div className="living-actions">
              <Link href="/cloud/plans" className="living-primary" onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)}>
                GET STARTED <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#cloud-journey" className="living-secondary">EXPLORE THE CLOUD</a>
            </div>
          </div>

          <div className={`living-core ${active ? 'is-active' : ''}`} role="img" aria-label="Animated WISE² living infrastructure core">
            <div className="living-core-halo" />
            <div className="living-orbit living-orbit-one" />
            <div className="living-orbit living-orbit-two" />
            <div className="living-orbit living-orbit-three" />
            <div className="living-arcs" aria-hidden="true"><i /><i /><i /></div>
            <div className="living-core-center"><span>W²</span><small>CORE / ONLINE</small></div>
          </div>
        </div>
        <p className="living-scroll-cue" aria-hidden="true">SCROLL TO ENTER THE SYSTEM <span>↓</span></p>
      </section>

      <section id="cloud-journey" className="living-journey" aria-label="WISE² Cloud journey">
        <header>
          <p className="living-kicker">INFRASTRUCTURE WORLD</p>
          <h2>From every signal,<br />to a stronger system.</h2>
        </header>
        <div className="living-chapters">
          {chapters.map(({ title, icon: Icon, copy }, index) => (
            <article key={title} className="living-chapter">
              <span className="living-index">0{index + 1}</span>
              <Icon size={24} aria-hidden="true" />
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="living-chapter-line" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="living-plans" aria-labelledby="cloud-plans-title">
        <div className="living-plans-heading">
          <p className="living-kicker">WISE² CLOUD PLANS</p>
          <h2 id="cloud-plans-title">Choose the infrastructure<br />that meets you where you are.</h2>
          <Link href="/cloud/plans" className="living-secondary">VIEW ALL PLANS <ArrowRight size={16} aria-hidden="true" /></Link>
        </div>
        <div className="living-plan-grid">
          {CLOUD_PLANS_STATIC.map((plan) => (
            <article className={`living-plan ${plan.highlight ? 'is-highlighted' : ''}`} key={plan.id}>
              {plan.highlight ? <p className="living-popular">MOST POPULAR</p> : null}
              <p className="living-plan-name">{plan.name}</p>
              <p className="living-price"><sup>$</sup>{plan.price}<small>/MO</small></p>
              <p className="living-plan-tagline">{plan.tagline}</p>
              <ul>{plan.features.map((feature) => <li key={feature}><Check size={15} aria-hidden="true" />{feature}</li>)}</ul>
              <Link href={`/cloud/plans?plan=${plan.id}`} className="living-plan-cta">{plan.cta} <ArrowRight size={15} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className="living-final">
        <p className="living-kicker">WISE² CLOUD</p>
        <h2>Built to carry<br />what comes next.</h2>
        <Link href="/cloud/plans" className="living-primary">BUILD YOUR CLOUD <ArrowRight size={17} aria-hidden="true" /></Link>
      </section>

      <style jsx>{`
        .living-cloud { --ink:#050816; --navy:#07111f; --blue:#2563eb; --cyan:#00d9ff; --violet:#7c3aed; color:#f5f7ff; background:var(--ink); overflow:hidden; }
        .living-hero { position:relative; min-height:100svh; display:grid; place-items:center; isolation:isolate; border-bottom:1px solid rgba(174,184,203,.18); }
        .living-atmosphere { position:absolute; inset:0; z-index:-2; background:radial-gradient(circle at var(--pointer-x,67%) var(--pointer-y,46%),rgba(0,217,255,.16),transparent 20%),radial-gradient(circle at 65% 44%,rgba(37,99,235,.24),transparent 29%),linear-gradient(120deg,#050816,#07111f 58%,#050816); }
        .living-atmosphere:after { content:''; position:absolute; inset:0; opacity:.28; background-image:linear-gradient(rgba(174,184,203,.08) 1px,transparent 1px),linear-gradient(90deg,rgba(174,184,203,.08) 1px,transparent 1px); background-size:52px 52px; mask-image:linear-gradient(to bottom,black,transparent); }
        .living-hero-grid { width:min(1180px,100%); padding:clamp(7rem,12vw,10rem) 1.5rem 5rem; display:grid; grid-template-columns:1.05fr .95fr; align-items:center; gap:2rem; }
        .living-kicker { margin:0; color:var(--cyan); font-size:.72rem; letter-spacing:.22em; font-weight:800; }
        h1,h2,h3,p { margin-top:0; } h1 { font-size:clamp(3rem,6.8vw,6.8rem); line-height:.88; letter-spacing:-.075em; margin:1rem 0 1.6rem; } h1 em { color:#b9eaff; font-style:normal; text-shadow:0 0 36px rgba(0,217,255,.35); }
        .living-sequence { font-weight:800; font-size:.75rem; letter-spacing:.16em; color:#b6c8e7; }.living-sequence span { color:var(--cyan); padding:0 .3rem; }.living-lede { max-width:35rem; color:#aeb8cb; font-size:1.03rem; line-height:1.7; }
        .living-actions { display:flex; flex-wrap:wrap; gap:.8rem; margin-top:2rem; }.living-primary,.living-secondary,.living-plan-cta { display:inline-flex; align-items:center; gap:.55rem; text-decoration:none; font-size:.78rem; font-weight:800; letter-spacing:.1em; padding:.95rem 1.2rem; transition:transform .25s,box-shadow .25s,border-color .25s; }.living-primary { color:#02101e; background:linear-gradient(120deg,#f5f7ff,#9aefff); box-shadow:0 0 32px rgba(0,217,255,.28); }.living-secondary { color:#f5f7ff; border:1px solid rgba(174,184,203,.38); }.living-primary:hover,.living-secondary:hover,.living-plan-cta:hover { transform:translateY(-2px); border-color:var(--cyan); }
        .living-core { width:min(31rem,80vw); aspect-ratio:1; position:relative; justify-self:center; display:grid; place-items:center; filter:drop-shadow(0 0 42px rgba(0,217,255,.28)); }.living-core-halo { position:absolute; inset:14%; border-radius:50%; background:radial-gradient(circle,rgba(245,247,255,.92) 0 2%,rgba(0,217,255,.42) 12%,rgba(37,99,235,.16) 34%,transparent 67%); animation:core-breathe 5s ease-in-out infinite; }
        .living-orbit { position:absolute; border:1px solid rgba(129,216,255,.62); border-radius:50%; animation:spin 16s linear infinite; }.living-orbit-one { inset:5% 17%; transform:rotateX(71deg) rotateZ(15deg); }.living-orbit-two { inset:18% 2%; border-color:rgba(124,58,237,.66); animation-direction:reverse; animation-duration:22s; transform:rotateX(58deg) rotateZ(80deg); }.living-orbit-three { inset:25% 12%; border-style:dashed; border-color:rgba(245,247,255,.48); animation-duration:12s; transform:rotateX(77deg) rotateZ(-32deg); }
        .living-core-center { width:34%; aspect-ratio:1; border-radius:50%; display:grid; place-content:center; text-align:center; background:radial-gradient(circle at 40% 35%,#f5f7ff,#2563eb 34%,#07111f 73%); border:1px solid rgba(255,255,255,.75); box-shadow:inset 0 0 35px rgba(0,217,255,.68),0 0 55px rgba(0,217,255,.68); }.living-core-center span { font-weight:900; font-size:clamp(2rem,5vw,4rem); line-height:.7; }.living-core-center small { margin-top:.75rem; font-size:.42rem; letter-spacing:.16em; }
        .living-arcs i { position:absolute; width:34%; height:2px; background:linear-gradient(90deg,transparent,#f5f7ff,var(--cyan),transparent); box-shadow:0 0 14px var(--cyan); transform-origin:right; animation:arc 4s steps(2,end) infinite; }.living-arcs i:nth-child(1){top:24%;left:22%;transform:rotate(37deg)}.living-arcs i:nth-child(2){right:19%;bottom:28%;transform:rotate(156deg);animation-delay:1.7s}.living-arcs i:nth-child(3){left:31%;bottom:20%;transform:rotate(281deg);animation-delay:2.8s}.is-active .living-core-halo{animation-duration:1.8s}.is-active .living-arcs i{animation-duration:.8s;}
        .living-glyphs span { position:absolute; color:rgba(142,219,255,.55); font:700 .65rem ui-monospace,monospace; letter-spacing:.12em; animation:float 8s ease-in-out infinite; }.living-glyphs span:nth-child(1){left:8%;top:21%}.living-glyphs span:nth-child(2){left:55%;top:14%;animation-delay:-2s}.living-glyphs span:nth-child(3){right:11%;top:30%;animation-delay:-4s}.living-glyphs span:nth-child(4){left:17%;bottom:20%;animation-delay:-3s}.living-glyphs span:nth-child(5){right:29%;bottom:16%;animation-delay:-5s}.living-glyphs span:nth-child(n+6){display:none}
        .living-scroll-cue { position:absolute; bottom:1.5rem; font-size:.63rem; letter-spacing:.18em; color:#aeb8cb; }.living-scroll-cue span { color:var(--cyan); font-size:1rem; }
        .living-journey,.living-plans,.living-final { padding:clamp(5rem,10vw,9rem) max(1.5rem,calc((100vw - 1180px)/2)); }.living-journey { background:linear-gradient(180deg,#07111f,#050816); }.living-journey header h2,.living-plans h2,.living-final h2 { margin:1rem 0 3rem; font-size:clamp(2.5rem,5vw,5rem); line-height:.95; letter-spacing:-.06em; }.living-chapters { display:grid; grid-template-columns:repeat(4,1fr); gap:1px; background:rgba(174,184,203,.2); }.living-chapter { min-height:16rem; position:relative; background:#07111f; padding:1.6rem; }.living-index { color:var(--cyan); font-size:.72rem; letter-spacing:.18em; }.living-chapter svg { display:block; margin:2.4rem 0 1rem; color:#9aefff; }.living-chapter h3 { font-size:1.3rem; letter-spacing:.1em; }.living-chapter p { color:#aeb8cb; line-height:1.6; font-size:.9rem; }.living-chapter-line { position:absolute; left:1.6rem; bottom:1.6rem; height:1px; width:45%; background:linear-gradient(90deg,var(--cyan),transparent); }
        .living-plans { background:#050816; }.living-plans-heading { display:flex; flex-wrap:wrap; align-items:end; justify-content:space-between; gap:1rem; }.living-plans-heading h2 { margin-bottom:0; }.living-plan-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:3rem; }.living-plan { padding:1.7rem; border:1px solid rgba(174,184,203,.23); background:linear-gradient(145deg,rgba(16,39,88,.52),rgba(5,8,22,.9)); }.living-plan.is-highlighted { border-color:var(--cyan); box-shadow:0 0 45px rgba(0,217,255,.12); }.living-popular { color:var(--cyan); font-size:.65rem; letter-spacing:.16em; font-weight:800; }.living-plan-name { color:#b9eaff; font-weight:700; }.living-price { font-size:3rem; font-weight:900; margin:.8rem 0 .3rem; }.living-price sup,.living-price small { font-size:.7rem; letter-spacing:.1em; color:#aeb8cb; }.living-plan-tagline { color:#aeb8cb; min-height:2.8rem; }.living-plan ul { padding:1.25rem 0; list-style:none; min-height:12rem; }.living-plan li { display:flex; gap:.55rem; padding:.35rem 0; color:#dbe6f7; font-size:.88rem; }.living-plan li svg { color:var(--cyan); flex:none; }.living-plan-cta { width:100%; justify-content:center; color:#f5f7ff; border:1px solid rgba(174,184,203,.35); }
        .living-final { text-align:center; background:radial-gradient(circle at 50% 0,rgba(37,99,235,.32),transparent 45%),#050816; }.living-final h2 { max-width:700px; margin-left:auto; margin-right:auto; }
        @keyframes spin { to { rotate:1turn; } } @keyframes core-breathe { 50% { transform:scale(1.1); filter:brightness(1.35); } } @keyframes arc { 0%,72%,100% { opacity:0; } 76%,89% { opacity:1; } } @keyframes float { 50% { transform:translateY(-15px); opacity:.9; } }
        @media (max-width:800px){.living-hero-grid{grid-template-columns:1fr;text-align:center;padding-top:7rem}.living-copy{order:2}.living-actions{justify-content:center}.living-core{order:1;width:min(22rem,76vw)}.living-chapters,.living-plan-grid{grid-template-columns:1fr}.living-chapter{min-height:auto}.living-plan ul{min-height:0}.living-glyphs span:nth-child(n+4){display:none}.living-scroll-cue{display:none}}@media (prefers-reduced-motion:reduce){.living-core-halo,.living-orbit,.living-arcs i,.living-glyphs span{animation:none!important}.living-atmosphere{background:radial-gradient(circle at 65% 44%,rgba(0,217,255,.17),transparent 28%),#07111f}.living-primary,.living-secondary,.living-plan-cta{transition:none}}
      `}</style>
    </main>
  );
}

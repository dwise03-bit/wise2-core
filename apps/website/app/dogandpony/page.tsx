import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Dog & Pony Show | WISE²',
  description: 'WISE² investor presentation and launch readiness overview hosted by Daniel and Darrin.',
  robots: { index: false, follow: false },
}

const sections = [
  'Executive summary', 'Business identity and mission', 'Market and customer',
  'Offers and revenue model', 'Brand and positioning', 'Web presence',
  'Sales and lead generation', 'Client onboarding', 'Operations and delivery',
  'AI and automation', 'Finance and reporting', 'Legal and risk',
  'Team and accountability', 'Launch and growth',
]
const gates = [
  'Verified domain and website', 'Working lead capture and contact',
  'Payment and commercial readiness', 'Client onboarding tested',
  'Security, access and recovery checked', 'Independent production acceptance',
]
const milestones = [
  ['Days 1–30', 'Audit and stabilize', 'Validate ownership, source-of-truth, hosting, routes, access and launch blockers.'],
  ['Days 31–60', 'Connect and prove', 'Complete core workflows, run end-to-end tests and gather client feedback.'],
  ['Days 61–90', 'Launch and measure', 'Release approved experiences, measure conversion and document operations.'],
]
const universes = [
  ['WISE² Core', 'Business operating system'],
  ['Hermes', 'Orchestration and voice workflows'],
  ['Living Hive', 'Visual command and project workflow'],
  ['Sound Labs', 'Creative and audio production'],
  ['WISE² Trading', 'Research and trading operations'],
  ['Client Universes', 'Branded websites and client services'],
]

export default function DogAndPonyPage() {
  return <main className="show">
    <nav className="nav"><a href="/" className="logo">WISE²</a><span>THE DOG & PONY SHOW</span><a href="#investor">Investor update ↓</a></nav>
    <header className="hero">
      <p className="eyebrow">WISE² PRESENTS · SUNDAY, NOVEMBER 22, 2026</p>
      <h1>THE DOG <em>&</em><br/>PONY SHOW<span className="dot">.</span></h1>
      <p className="lede">The vision. The systems. The receipts. A connected look at what WISE² is building and what still needs to ship.</p>
      <div className="actions"><a className="primary" href="#investor">Explore the presentation</a><a className="secondary" href="#roadmap">90-day roadmap</a></div>
      <div className="host"><span>HOSTED BY</span><strong>Daniel & Darrin</strong><span>WITH THE IMPS CREW + SNOW</span></div>
    </header>
    <section id="investor" className="section"><p className="eyebrow">01 / INVESTOR BRIEFING</p><h2>Uncle Steve's<br/><i>full picture.</i></h2><p className="intro">Fourteen operational areas. This is the presentation structure, not a claim that every system has passed its release audit.</p>
      <div className="sectionGrid">{sections.map((s,i)=><article key={s}><span>{String(i+1).padStart(2,'0')}</span><h3>{s}</h3><p>Evidence and acceptance status to be confirmed before investor sign-off.</p></article>)}</div>
    </section>
    <section className="section shade"><p className="eyebrow">02 / RELEASE CONTROL</p><h2>Six launch gates.<br/><i>No shortcuts.</i></h2><div className="gateGrid">{gates.map((g,i)=><article key={g}><b>GATE {i+1}</b><h3>{g}</h3><span className="pending">Pending independent verification</span></article>)}</div></section>
    <section id="roadmap" className="section"><p className="eyebrow">03 / EXECUTION</p><h2>90 days.<br/><i>One direction.</i></h2><div className="timeline">{milestones.map(([time,name,description])=><article key={time}><b>{time}</b><div><h3>{name}</h3><p>{description}</p></div></article>)}</div></section>
    <section className="section shade"><p className="eyebrow">04 / CONNECTED UNIVERSES</p><h2>One ecosystem.<br/><i>Many engines.</i></h2><div className="universeGrid">{universes.map(([name,description])=><article key={name}><h3>{name}</h3><p>{description}</p></article>)}</div><p className="note">Architecture and capabilities are presented as project areas. Live integrations require separate verification.</p></section>
    <footer><strong>WISE²</strong><span>THE DOG & PONY SHOW · DANIEL & DARRIN</span><a href="/">wise2.net</a></footer>
    <style>{`
      .show{background:#05080e;color:#edf5ff;font-family:Arial,Helvetica,sans-serif;overflow:hidden}
      .show *{box-sizing:border-box}.show a{color:inherit;text-decoration:none}
      .nav{height:76px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 clamp(20px,5vw,90px);border-bottom:1px solid #29445c;font-size:11px;letter-spacing:.15em}.logo{font-weight:900;font-size:24px;letter-spacing:-.08em}
      .hero{min-height:calc(100svh - 76px);padding:clamp(80px,12vw,160px) clamp(20px,7vw,110px) 55px;position:relative;background:radial-gradient(ellipse at 85% 25%,#10486b 0%,transparent 40%),radial-gradient(ellipse at 10% 85%,#15294a 0%,transparent 42%),#05080e}
      .eyebrow{font-size:11px;font-weight:800;letter-spacing:.24em;color:#6ed7ff;margin:0 0 26px}.hero h1{font-size:clamp(65px,12.7vw,220px);line-height:.81;letter-spacing:-.095em;margin:0;font-weight:950}.hero h1 em,.section h2 i{color:#72d8ff;font-style:normal}.dot{color:#72d8ff}.lede{max-width:660px;font-size:clamp(17px,2vw,23px);line-height:1.55;color:#b9c9da;margin:40px 0}.actions{display:flex;flex-wrap:wrap;gap:14px}.actions a{padding:16px 22px;border-radius:3px;font-size:12px;font-weight:800;letter-spacing:.06em}.primary{background:#78d9ff;color:#06111c!important}.secondary{border:1px solid #6385a3}.host{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:80px;border-top:1px solid #38546b;padding-top:22px}.host span{color:#88a8c0;font-size:10px;letter-spacing:.16em}.host strong{font-size:17px}
      .section{padding:110px clamp(20px,7vw,110px)}.section h2{font-size:clamp(48px,8vw,110px);line-height:.95;letter-spacing:-.075em;margin:0 0 35px}.intro,.note{max-width:740px;color:#a9bfd1;line-height:1.65}.sectionGrid,.gateGrid,.universeGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:#263e52;border:1px solid #263e52;margin-top:60px}.sectionGrid article,.gateGrid article,.universeGrid article{padding:28px;background:#08121f;min-height:155px}.sectionGrid span,.gateGrid b{font-size:11px;color:#6ed7ff;letter-spacing:.14em}.section h3{font-size:clamp(18px,2vw,26px);margin:18px 0 12px}.section article p{color:#9eb5c9;line-height:1.55;font-size:14px}.shade{background:#0b1422}.pending{display:inline-block;color:#d6c18d;font-size:12px;margin-top:14px}.timeline{border-top:1px solid #29445c;margin-top:60px}.timeline article{display:grid;grid-template-columns:190px 1fr;gap:30px;border-bottom:1px solid #29445c;padding:30px 0}.timeline b{color:#6ed7ff}.timeline h3{margin:0}.universeGrid{grid-template-columns:repeat(3,minmax(0,1fr))}footer{padding:35px clamp(20px,7vw,110px);display:flex;gap:20px;justify-content:space-between;align-items:center;flex-wrap:wrap;font-size:11px;letter-spacing:.1em;color:#8fa9be}footer strong{color:#fff;font-size:25px}
      @media(max-width:700px){.nav{font-size:9px}.nav span{display:none}.hero{min-height:700px}.section{padding-top:80px;padding-bottom:80px}.sectionGrid,.gateGrid,.universeGrid{grid-template-columns:1fr}.timeline article{grid-template-columns:1fr;gap:4px}.host{margin-top:60px}}
      @media(prefers-reduced-motion:no-preference){.actions a{transition:transform .2s,background .2s}.actions a:hover{transform:translateY(-3px)}}
    `}</style>
  </main>
}

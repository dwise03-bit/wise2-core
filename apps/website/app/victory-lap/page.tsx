import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Victory Lap | WISE²',
  description: 'Daniel Wise and Darrin Wise Jr. Building the WISE² ecosystem brick by brick.',
};

const pillars = [
  { title: 'WISE² Business OS', description: 'Websites, workflows, customer operations, and accountable AI.' },
  { title: 'Sound Labs', description: 'Artist collaboration, music production, and creative technology.' },
  { title: 'Dog & Pony Show', description: 'Live product demonstrations and transparent proof of progress.' },
  { title: 'Mission Control', description: 'Readiness gates, smoke tests, evidence, and release decisions.' },
];

export default function VictoryLapPage() {
  return (
    <main style={{ minHeight: '100vh', color: '#f4f8ff', background: 'radial-gradient(ellipse at 70% 10%,#123d78 0%,#070e1d 42%,#03060c 100%)', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style>{`
        @keyframes reveal { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        .vl-reveal { animation: reveal 900ms ease-out both; }
        .vl-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 18px; }
        .vl-link { color: #a5dbff; text-decoration: none; }
        .vl-link:focus-visible { outline: 3px solid #7de8ff; outline-offset: 5px; }
        @media(max-width: 680px) { .vl-grid { grid-template-columns: 1fr; } .vl-heading { font-size: clamp(48px,13vw,90px) !important; } }
        @media(prefers-reduced-motion: reduce) { .vl-reveal { animation: none; } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: 'auto', padding: '26px clamp(20px,5vw,72px) 90px' }}>
        <nav aria-label="Primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
          <a className="vl-link" href="/" style={{ fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>WISE²</a>
          <a className="vl-link" href="#ecosystem">EXPLORE THE ECOSYSTEM</a>
        </nav>
        <header className="vl-reveal" style={{ padding: 'clamp(90px,14vw,180px) 0 100px', borderBottom: '1px solid #35516f' }}>
          <p style={{ letterSpacing: 5, color: '#66cfff', fontWeight: 700 }}>TWO MINDS. ONE VISION.</p>
          <h1 className="vl-heading" style={{ fontSize: 'clamp(64px,10vw,150px)', lineHeight: .88, letterSpacing: '-.065em', margin: '24px 0', fontWeight: 900 }}>VICTORY<br/><span style={{ color: '#68bdff' }}>LAP.</span></h1>
          <p style={{ fontSize: 'clamp(20px,3vw,34px)', maxWidth: 730, lineHeight: 1.35 }}>Brick by brick. Building what we own. Creating what lasts.</p>
          <p style={{ color: '#b7cbe1', marginTop: 34 }}>Daniel Wise × Darrin Wise Jr. · WISE² Co-founders</p>
          <a className="vl-link" href="#ecosystem" style={{ display: 'inline-block', marginTop: 28, border: '1px solid #5dbdff', borderRadius: 6, padding: '14px 22px' }}>ENTER THE EXPERIENCE ↓</a>
        </header>
        <section id="ecosystem" style={{ paddingTop: 90 }}>
          <p style={{ letterSpacing: 4, color: '#67c6ff' }}>THE ECOSYSTEM</p>
          <h2 style={{ fontSize: 'clamp(34px,5vw,62px)', marginBottom: 35 }}>One vision. Connected systems.</h2>
          <div className="vl-grid">
            {pillars.map((p, i) => <article key={p.title} style={{ minHeight: 210, padding: 30, border: '1px solid #28496c', borderRadius: 14, background: 'linear-gradient(145deg,#132b49bb,#080f1dcc)' }}>
              <span style={{ color: '#61c6ff', letterSpacing: 3 }}>0{i + 1}</span>
              <h3 style={{ fontSize: 25 }}>{p.title}</h3>
              <p style={{ color: '#c3d3e6', lineHeight: 1.65 }}>{p.description}</p>
            </article>)}
          </div>
        </section>
        <section style={{ paddingTop: 105 }}>
          <p style={{ letterSpacing: 4, color: '#67c6ff' }}>THE MARATHON DOCTRINE</p>
          <h2 style={{ fontSize: 'clamp(34px,5vw,60px)' }}>Ownership. Discipline. Reinvestment.</h2>
          <p style={{ maxWidth: 760, color: '#c3d3e6', lineHeight: 1.8 }}>Every system earns its place through evidence. Every client outcome matters. Every release is tested before we call it complete.</p>
        </section>
        <section style={{ paddingTop: 100 }}>
          <p style={{ letterSpacing: 4, color: '#67c6ff' }}>THE BUILD PIPELINE</p>
          <h2 style={{ fontSize: 'clamp(30px,4vw,50px)' }}>Hermes → Living Hive → Approval → Build → Test → Verify → Deploy → Sauce Vault</h2>
          <p style={{ color: '#b7cbe1' }}>Target workflow. Individual integrations and production status require independent verification.</p>
        </section>
        <footer style={{ borderTop: '1px solid #35516f', marginTop: 110, paddingTop: 28, color: '#a9c5df' }}>WISE² · VICTORY LAP · THE MARATHON CONTINUES</footer>
      </div>
    </main>
  );
}

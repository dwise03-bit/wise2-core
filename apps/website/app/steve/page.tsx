import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Uncle Steve Demo | WISE²',
  description: 'A guided WISE² demonstration prepared for Uncle Steve.',
  robots: { index: false, follow: false },
}

const demoPoints = [
  ['ONE PLACE', 'Your work, customers, and next steps stay connected.'],
  ['CLEAR SIGNAL', 'See what needs attention without digging through tools.'],
  ['READY WHEN YOU ARE', 'Built to make everyday business work feel simpler.'],
]

export default function UncleSteveDemoPage() {
  return (
    <main className="steve-demo">
      <section className="hero" aria-labelledby="page-title">
        <p className="eyebrow">WISE² · PRIVATE DEMO</p>
        <h1 id="page-title">Hey, Uncle Steve.</h1>
        <p className="intro">
          This is a quick look at how WISE² brings the moving parts of a business
          into one calm, useful place.
        </p>
        <a className="cta" href="#demo">See the demo</a>
      </section>

      <section className="demo" id="demo" aria-labelledby="demo-heading">
        <div className="demo-heading">
          <p className="eyebrow">THE IDEA</p>
          <h2 id="demo-heading">Less chasing. More doing.</h2>
          <p>
            WISE² turns the daily swirl of calls, follow-ups, jobs, and decisions
            into a clear picture of what matters now.
          </p>
        </div>
        <div className="points">
          {demoPoints.map(([label, detail], index) => (
            <article className="point" key={label}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{label}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="closing" aria-label="Next step">
        <p className="eyebrow">A BETTER WAY TO RUN THE DAY</p>
        <h2>Made for real work, not more busywork.</h2>
        <a className="cta cta-secondary" href="/contact">Talk with WISE²</a>
      </section>

      <style>{`
        .steve-demo {
          --ink: #070a12;
          --muted: #aeb7c8;
          --line: rgba(218, 230, 255, .18);
          --lime: #b8ff33;
          min-height: 100vh;
          overflow: hidden;
          color: #f7f9ff;
          background: radial-gradient(circle at 85% 0%, #183e57 0, transparent 32rem), linear-gradient(135deg, #080b13 0%, #101b2a 58%, #080b13 100%);
          font-family: var(--font-geist-sans, Arial, sans-serif);
        }
        .hero, .demo, .closing { max-width: 1120px; margin: auto; padding-left: 28px; padding-right: 28px; }
        .hero { min-height: 72vh; display: grid; align-content: center; padding-top: 100px; padding-bottom: 100px; }
        .eyebrow { margin: 0 0 18px; color: var(--lime); font-size: .75rem; font-weight: 800; letter-spacing: .16em; }
        h1, h2, h3, p { margin-top: 0; }
        h1 { max-width: 780px; margin-bottom: 22px; font-size: clamp(3.5rem, 10vw, 8.8rem); line-height: .9; letter-spacing: -.075em; }
        h2 { font-size: clamp(2.25rem, 5vw, 4.6rem); line-height: .96; letter-spacing: -.055em; }
        .intro, .demo-heading > p { max-width: 580px; color: var(--muted); font-size: clamp(1.1rem, 2vw, 1.35rem); line-height: 1.65; }
        .cta { display: inline-block; width: fit-content; margin-top: 14px; padding: 15px 22px; border-radius: 999px; background: var(--lime); color: var(--ink); font-weight: 800; text-decoration: none; transition: transform .18s ease, box-shadow .18s ease; }
        .cta:hover, .cta:focus-visible { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(184,255,51,.24); }
        .demo { padding-top: 84px; padding-bottom: 88px; border-top: 1px solid var(--line); }
        .demo-heading { display: grid; grid-template-columns: 1.2fr 1fr; gap: 40px; align-items: end; }
        .demo-heading .eyebrow { grid-column: 1 / -1; margin-bottom: -8px; }
        .demo-heading > p { margin: 0; }
        .points { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; margin-top: 72px; background: var(--line); border: 1px solid var(--line); }
        .point { min-height: 235px; padding: 28px; background: rgba(8, 11, 19, .72); }
        .point span { color: var(--lime); font-size: .75rem; font-weight: 800; letter-spacing: .13em; }
        .point h3 { margin: 62px 0 10px; font-size: 1rem; letter-spacing: .08em; }
        .point p { margin: 0; color: var(--muted); line-height: 1.55; }
        .closing { padding-top: 108px; padding-bottom: 120px; text-align: center; }
        .closing h2 { max-width: 750px; margin: 0 auto; }
        .cta-secondary { border: 1px solid var(--line); background: transparent; color: #fff; }
        @media (max-width: 700px) {
          .hero, .demo, .closing { padding-left: 20px; padding-right: 20px; }
          .hero { min-height: 64vh; }
          .demo-heading { display: block; }
          .demo-heading h2 { margin-bottom: 24px; }
          .points { grid-template-columns: 1fr; margin-top: 48px; }
          .point { min-height: auto; }
          .point h3 { margin-top: 36px; }
        }
      `}</style>
    </main>
  )
}

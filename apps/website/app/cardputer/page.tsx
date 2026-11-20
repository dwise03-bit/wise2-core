import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WISE² Cardputer ADV — C5 Edition',
  description: 'WISE² concept showcase for the Cardputer ADV and ESP32-C5 wireless expansion.',
};

const specs = [
  ['CORE', 'ESP32-S3A', 'Cardputer ADV main processor'],
  ['EXPANSION', 'ESP32-C5', '5 GHz capable wireless coprocessor'],
  ['INTERFACE', 'Keyboard + display', 'Compact handheld controls'],
  ['INTEGRATION', 'Hermes bridge', 'Planned; not yet implemented'],
];

export default function CardputerPage() {
  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at 45% 15%, #0d3760 0%, #061322 42%, #02060b 85%)', color: '#f1f7ff', fontFamily: 'Arial, Helvetica, sans-serif', padding: 'clamp(24px,5vw,80px)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #235174', paddingBottom: 24, gap: 20 }}>
          <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 900, fontSize: 28, letterSpacing: 2 }}>WISE²</a>
          <span style={{ color: '#64caff', fontSize: 12, letterSpacing: 3 }}>HARDWARE LAB / CONCEPT 001</span>
        </nav>
        <section style={{ padding: '90px 0 60px', display: 'grid', gap: 35 }}>
          <div style={{ color: '#61d2ff', letterSpacing: 4, fontSize: 13 }}>WIRELESS EXPANSION PROJECT</div>
          <h1 style={{ fontSize: 'clamp(44px,8vw,108px)', lineHeight: .96, letterSpacing: -3, margin: 0, maxWidth: 1050 }}>CARDPUTER ADV<br /><span style={{ color: '#4bc9ff' }}>C5 EDITION.</span></h1>
          <p style={{ maxWidth: 680, color: '#b5cde1', fontSize: 20, lineHeight: 1.6 }}>A WISE² industrial concept for the M5Stack Cardputer ADV with ESP32-C5 expansion. Designed for portable diagnostics, authorized wireless research, and a future Hermes device bridge.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ border: '1px solid #248bc0', padding: '12px 18px', borderRadius: 30 }}>2.4 / 5 GHz hardware capability</span>
            <span style={{ border: '1px solid #248bc0', padding: '12px 18px', borderRadius: 30 }}>ESP32-S3A + ESP32-C5</span>
            <span style={{ border: '1px solid #248bc0', padding: '12px 18px', borderRadius: 30 }}>HERMES / PLANNED</span>
          </div>
        </section>
        <section aria-label="Cardputer concept device" style={{ border: '1px solid #245679', borderRadius: 28, padding: 'clamp(22px,6vw,70px)', background: 'linear-gradient(135deg,#0b2338,#030a13)', boxShadow: '0 20px 100px #007dff20', marginBottom: 45 }}>
          <div style={{ maxWidth: 850, margin: 'auto', transform: 'rotate(-2deg)', border: '10px solid #273849', borderRadius: 25, padding: 18, background: 'linear-gradient(145deg,#253849,#080d16)', boxShadow: '0 30px 65px #000b, 0 0 40px #008cff50' }}>
            <div style={{ background: 'linear-gradient(120deg,#031626,#104d78,#06101e)', border: '2px solid #30bfff', borderRadius: 10, padding: '24px 22px', marginBottom: 20, minHeight: 145 }}>
              <div style={{ fontSize: 14, color: '#59d3ff', letterSpacing: 2 }}>WISE² / HERMES</div>
              <div style={{ fontSize: 'clamp(22px,5vw,45px)', fontWeight: 800, marginTop: 16 }}>DEVICE COMMAND</div>
              <div style={{ color: '#7dffbc', marginTop: 12, fontSize: 13 }}>● CONCEPT INTERFACE — NOT CONNECTED</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10,minmax(0,1fr))', gap: 6 }}>
              {Array.from({ length: 40 }, (_, i) => <div key={i} style={{ height: 'clamp(17px,3vw,35px)', borderRadius: 5, background: 'linear-gradient(#334457,#0c121c)', border: '1px solid #526579', boxShadow: '0 2px 2px #000' }} />)}
            </div>
          </div>
          <p style={{ textAlign: 'center', color: '#8ba8bf', marginTop: 36, fontSize: 13 }}>ILLUSTRATIVE WISE² DESIGN CONCEPT · NOT A PHOTOGRAPH OF BUILT HARDWARE</p>
        </section>
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 16 }}>
          {specs.map(([label, title, detail]) => <article key={label} style={{ background: '#0a1b2b', border: '1px solid #1d4664', borderRadius: 16, padding: 25 }}>
            <div style={{ color: '#53caff', fontSize: 12, letterSpacing: 2 }}>{label}</div>
            <h2 style={{ fontSize: 23 }}>{title}</h2>
            <p style={{ color: '#a4bbcd', lineHeight: 1.5 }}>{detail}</p>
          </article>)}
        </section>
        <footer style={{ marginTop: 70, paddingTop: 25, borderTop: '1px solid #1d4664', color: '#9eb6c8', lineHeight: 1.6 }}>
          Concept only. 5 GHz functionality requires compatible firmware and validated wiring. Hardware power, boot reliability, firmware behavior and Hermes integration are not yet verified. Use only on networks you own or are authorized to test.
        </footer>
      </div>
    </main>
  );
}

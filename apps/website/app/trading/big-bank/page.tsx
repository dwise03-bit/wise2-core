import Link from 'next/link';

const lanes = [
  { name: 'BIG BANK', path: '/big-bank', description: 'MNQ paper signals and research' },
  { name: 'Victory Lap Lab', path: '/big-bank/lab', description: 'Chronological train / validation / OOS evidence' },
  { name: 'AI Crew', path: '/big-bank/crew', description: 'Strategy research and Apex risk stations' },
  { name: 'Pro Chart', path: '/pro', description: 'TradingView research workspace' },
];

function getOrigin() {
  const raw = process.env.WISE2_TRADING_ORIGIN;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}

export default function BigBankGateway() {
  const origin = getOrigin();
  return <main style={{ minHeight: '100vh', background: '#07060b', color: '#f4f0f3', padding: 'clamp(24px,5vw,64px)', fontFamily: 'system-ui,sans-serif' }}>
    <div style={{ maxWidth: 1050, margin: 'auto' }}>
      <p style={{ color: '#ff5361', letterSpacing: 3 }}>WISE² TRADING / PROJECT VICTORY LAP</p>
      <h1 style={{ fontSize: 'clamp(36px,6vw,72px)', margin: '12px 0' }}>BIG BANK 2.0</h1>
      <p>One WISE² Trading platform. BIG BANK is a research lane, not a separate product.</p>
      <p style={{ color: '#ff9da5', fontWeight: 700 }}>PAPER ONLY · BROKER EXECUTION DISABLED · NO VERIFIED STRATEGY EDGE</p>
      {!origin && <p role="status" style={{ border: '1px solid #87515a', borderRadius: 12, padding: 20 }}>Trading research origin not configured. Set WISE2_TRADING_ORIGIN to the HTTPS origin of the paper-only WISE² Trading research service. Links remain disabled until configured.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginTop: 36 }}>
        {lanes.map(lane => <section key={lane.path} style={{ background: '#141018', border: '1px solid #39303d', borderRadius: 16, padding: 24 }}>
          <h2 style={{ fontSize: 21 }}>{lane.name}</h2>
          <p style={{ color: '#aaa1ae', minHeight: 56 }}>{lane.description}</p>
          {origin ? <a href={origin + lane.path} style={{ color: '#ff6573' }}>Open station →</a> : <span style={{ color: '#827984' }}>Awaiting configuration</span>}
        </section>)}
      </div>
      <p style={{ marginTop: 32, color: '#a69ba8' }}>This research gateway cannot place orders, proxy credentials, or bypass broker risk controls.</p>
      <Link href="/trading" style={{ color: '#eee' }}>← Back to WISE² Trading</Link>
    </div>
  </main>;
}

'use client';

import styles from './trader-3d.module.css';

export default function EveryDayTraderPage() {
  const markets = [
    ['S&P 500', '5,728.41', '+0.82%'],
    ['NASDAQ', '18,230.12', '+1.14%'],
    ['BTC', '63,284.50', '+2.46%'],
    ['ETH', '2,612.08', '+1.38%']
  ];

  const watchlist = [
    'NVDA 225.07 +0.22%',
    'AAPL 227.52 +0.62%',
    'TSLA 254.27 +1.83%',
    'MSFT 418.06 +0.74%'
  ];

  const analysisPoints = [
    '✓ Trend — Bullish',
    '✓ Momentum — Strong',
    '✓ Volume — Above Avg',
    '✓ Options Flow — Bullish',
    '✓ News Sentiment — Positive'
  ];

  return (
    <main className={styles.dashboardRoot}>
      {/* Header */}
      <header className={styles.headerPremium}>
        <div className={styles.titlePremium}>
          EVERY DAY
          <br />
          <span className={styles.titleAccent}>TRADER</span>
          <small style={{ display: 'block', fontSize: 8, textAlign: 'right', letterSpacing: '1.4px', marginTop: 8 }}>
            POWERED BY WISE²
          </small>
        </div>
        <input
          aria-label="Search"
          placeholder="⌕  Search stocks, crypto, or ETFs..."
          className={styles.searchInput3d}
        />
        <b style={{ fontSize: 16, letterSpacing: '0.5px' }}>WISE²</b>
      </header>

      {/* Main Content Section */}
      <section style={{ maxWidth: '1400px', margin: 'auto' }}>
        {/* Market Stats Grid */}
        <div className={styles.marketStatsGrid}>
          {markets.map(([name, price, move]) => (
            <div key={name} className={styles.statCard}>
              <small style={{ color: '#b8c9e3', fontSize: '12px', fontWeight: 500 }}>{name}</small>
              <b style={{ display: 'block', fontSize: 19, marginTop: 6, letterSpacing: '-0.5px' }}>{price}</b>
              <em style={{ color: '#05e9ad', fontStyle: 'normal', fontWeight: 600, fontSize: '14px' }}>{move}</em>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2.3fr) minmax(280px,1fr)', gap: 14 }}>
          {/* Chart Panel */}
          <article className={styles.premiumPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                ◉ NVDA{' '}
                <small style={{ fontSize: 13, color: '#a9c1df', fontWeight: 400, display: 'inline' }}>
                  NVIDIA Corporation
                </small>
              </h1>
              <button
                style={{
                  background: 'none',
                  border: 0,
                  color: '#fff',
                  fontSize: 22,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  padding: '4px 8px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                ×
              </button>
            </div>

            {/* Price & Stats */}
            <div style={{ display: 'flex', gap: 13, alignItems: 'baseline', margin: '13px 0' }}>
              <b style={{ fontSize: 28, letterSpacing: '-1px' }}>225.07</b>
              <em style={{ color: '#00e8ad', fontStyle: 'normal', fontWeight: 600, fontSize: '16px' }}>+0.22%</em>
              <small style={{ marginLeft: 'auto', color: '#adbfda', fontSize: '12px' }}>
                High 226.48 · Low 222.91 · Volume 48.2M
              </small>
            </div>

            {/* Chart */}
            <div className={styles.chartContainer}>
              <svg viewBox="0 0 780 340" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <defs>
                  <linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
                    <stop stopColor="#0ce3ff" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#0ce3ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className={styles.chartPathFill} fill="url(#area)" d="M0 290 L45 260 90 275 135 204 180 225 225 153 270 175 315 105 360 135 405 92 450 165 495 125 540 201 585 170 630 235 675 201 720 245 780 150V340H0Z" />
                <path className={styles.chartPathStroke} fill="none" stroke="#13e4ff" strokeWidth="4" d="M0 290 L45 260 90 275 135 204 180 225 225 153 270 175 315 105 360 135 405 92 450 165 495 125 540 201 585 170 630 235 675 201 720 245 780 150" />
              </svg>
              <span className={styles.label3d} style={{ right: 16, top: 70 }}>RESISTANCE $228.50</span>
              <span className={styles.label3d} style={{ right: 70, top: 210 }}>ENTRY $223–$224</span>
              <span className={styles.label3d} style={{ right: 25, bottom: 38 }}>SUPPORT $220.50</span>
            </div>
          </article>

          {/* AI Analysis Panel */}
          <article className={styles.premiumPanel} style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginTop: 0, fontSize: '16px', fontWeight: 700 }}>
              ◉ PLOT AI{' '}
              <small style={{ display: 'block', fontSize: 9, color: '#a9c1df', fontWeight: 400, marginTop: 4 }}>
                LIVE MARKET INTELLIGENCE
              </small>
            </h2>

            {/* Bullish Gauge */}
            <div style={{ margin: '18px auto', width: 175, height: 88, border: '13px solid #0ce3c6', borderBottom: 0, borderRadius: '180px 180px 0 0', textAlign: 'center', paddingTop: 21, boxShadow: 'inset 0 2px 8px rgba(12, 227, 198, 0.2)' }}>
              <b style={{ display: 'block', fontSize: 31, letterSpacing: '-0.5px' }}>72%</b>
              <small style={{ color: '#05e9ad', fontSize: '12px', fontWeight: 600 }}>BULLISH BIAS</small>
            </div>

            {/* Analysis Points */}
            <div className={styles.scrollableList}>
              {analysisPoints.map((point) => (
                <p key={point} style={{ borderBottom: '1px solid #21405e', paddingBottom: 9, fontSize: 12, margin: '12px 0 0 0', color: '#d4e3f7' }}>
                  {point}
                </p>
              ))}
            </div>

            <button className={`${styles.buttonPremium} ${styles.buttonFull}`} style={{ marginTop: 'auto' }}>
              View Full Analysis →
            </button>
          </article>
        </div>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 14 }}>
          {/* Watchlist */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>▥ WATCHLIST</h3>
            <div className={styles.scrollableList}>
              {watchlist.map((item) => (
                <p key={item} style={{ fontSize: 13, borderBottom: '1px solid #193553', paddingBottom: 9, color: '#15e9b5', margin: '0', cursor: 'pointer', transition: 'all 200ms ease' }} onMouseEnter={(e) => (e.currentTarget.style.paddingLeft = '8px')} onMouseLeave={(e) => (e.currentTarget.style.paddingLeft = '0')}>
                  {item}
                </p>
              ))}
            </div>
          </article>

          {/* Trade Planner */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>▣ PAPER TRADE PLANNER</h3>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>Entry Price <b style={{ float: 'right', color: '#FFD700' }}>$223–$224</b></p>
              <p style={{ margin: 0, fontSize: '13px' }}>Stop Loss <b style={{ float: 'right', color: '#ff5276' }}>$220.50</b></p>
              <p style={{ margin: 0, fontSize: '13px' }}>Target <b style={{ float: 'right', color: '#15e9b5' }}>$228.50</b></p>
              <p style={{ margin: 0, fontSize: '13px' }}>Risk / Reward <b style={{ float: 'right', color: '#FFD700' }}>1 : 2.1</b></p>
            </div>
            <button className={`${styles.buttonPremium} ${styles.buttonFull}`}>Build Trade Plan →</button>
          </article>

          {/* Education - Video */}
          <article className={styles.premiumPanel} style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, fontSize: '16px', fontWeight: 700 }}>◇ EDUCATION</h3>
            <h2 style={{ margin: '8px 0', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>Learn. Practice. Grow.</h2>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', marginBottom: '16px', marginTop: '12px' }}>
              <iframe
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
                src="https://www.youtube.com/embed/1KL06bwKzME"
                title="Trading Education"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p style={{ color: '#b9cde8', lineHeight: 1.6, fontSize: '13px', margin: '0 0 16px 0' }}>Focused trading education designed for the next trading day.</p>
            <button className={styles.buttonPremium} style={{ marginTop: 'auto' }}>Continue Learning →</button>
          </article>
        </div>

        {/* Footer */}
        <footer className={styles.footerPremium}>
          <div>EVERY DAY TRADER · WISE²</div>
          <span className={styles.footerTagline}>Knowledge Builds Freedom.</span>
        </footer>
      </section>
    </main>
  );
}

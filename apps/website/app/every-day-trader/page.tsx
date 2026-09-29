'use client';

import styles from './trader-3d.module.css';
import CuzzoAI from './cuzzo-ai';
import LiveTrading from './live-trading';
import FollowTrader from './follow-trader';
import { useState } from 'react';

export default function EveryDayTraderPage() {
  const [activeNav, setActiveNav] = useState('Dashboard');

  const navItems = [
    { icon: '🏠', label: 'Dashboard', id: 'Dashboard' },
    { icon: '📊', label: 'Markets', id: 'Markets' },
    { icon: '📈', label: 'Charts', id: 'Charts' },
    { icon: '🧠', label: 'PLOT AI', id: 'PLOT AI' },
    { icon: '⭐', label: 'Watchlist', id: 'Watchlist' },
    { icon: '👁️', label: 'Options Flow', id: 'Options Flow' },
    { icon: '🧪', label: 'Trade Lab', id: 'Trade Lab' },
    { icon: '📖', label: 'Journal', id: 'Journal' },
    { icon: '🎓', label: 'Education', id: 'Education' },
    { icon: '⚙️', label: 'Settings', id: 'Settings' }
  ];

  const markets = [
    ['S&P 500', '5,728.41', '+0.82%'],
    ['NASDAQ', '18,230.12', '+1.14%'],
    ['BTC', '63,284.50', '+2.46%'],
    ['ETH', '2,612.08', '+1.38%']
  ];

  const watchlist = [
    { symbol: 'NVDA', price: '225.07', change: '+0.22%' },
    { symbol: 'AAPL', price: '227.52', change: '+0.62%' },
    { symbol: 'TSLA', price: '254.27', change: '+1.83%' },
    { symbol: 'MSFT', price: '418.06', change: '+0.74%' }
  ];

  const analysisPoints = [
    '✓ Trend — Bullish',
    '✓ Momentum — Strong',
    '✓ Volume — Above Avg',
    '✓ Options Flow — Bullish',
    '✓ News Sentiment — Positive'
  ];

  const keyLevels = [
    { label: 'Resistance', value: '$228.50', color: '#ff5276' },
    { label: 'Entry Zone', value: '$223–$224', color: '#FFD700' },
    { label: 'Support', value: '$220.50', color: '#00ff7f' }
  ];

  const trendAlignments = [
    '✓ Holding above short-term EMAs with strong volume',
    '✓ Watching $223–$224 for potential entry',
    '✓ Upside target remains $228.50 if buyers hold'
  ];

  return (
    <main className={styles.dashboardRoot}>
      {/* Left Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '-2px', background: 'linear-gradient(135deg, #00D9FF, #0ce3ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TRADER
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeNav === item.id ? styles.navItemActive : ''}`}
              onClick={() => setActiveNav(item.id)}
              title={item.label}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div style={{ fontSize: '11px', color: '#7a9fb5', textAlign: 'center', lineHeight: '1.4' }}>
            DISCIPLINE<br />TODAY.<br />OPTIONS<br />TOMORROW.
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
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

        {/* Main Grid: Chart + Right Column */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 14 }}>
          {/* Chart Panel */}
          <article className={styles.premiumPanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                ◉ NVDA{' '}
                <small style={{ fontSize: 12, color: '#a9c1df', fontWeight: 400, display: 'inline' }}>
                  NVIDIA Corporation
                </small>
              </h1>
              <button
                style={{
                  background: 'none',
                  border: 0,
                  color: '#fff',
                  fontSize: 20,
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  padding: '4px 8px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                ✕
              </button>
            </div>

            {/* Time Buttons */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'].map((period) => (
                <button
                  key={period}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: period === '1D' ? 'rgba(0, 217, 255, 0.2)' : 'rgba(12, 126, 216, 0.15)',
                    border: `1px solid ${period === '1D' ? 'rgba(0, 217, 255, 0.4)' : 'rgba(12, 126, 216, 0.2)'}`,
                    color: period === '1D' ? '#00D9FF' : '#a9c1df',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0, 217, 255, 0.2)';
                    e.currentTarget.style.color = '#00D9FF';
                  }}
                  onMouseLeave={(e) => {
                    if (period !== '1D') {
                      e.currentTarget.style.background = 'rgba(12, 126, 216, 0.15)';
                      e.currentTarget.style.color = '#a9c1df';
                    }
                  }}
                >
                  {period}
                </button>
              ))}
            </div>

            {/* Price & Stats */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'baseline', marginBottom: 14 }}>
              <b style={{ fontSize: 32, letterSpacing: '-1px' }}>225.07</b>
              <em style={{ color: '#00e8ad', fontStyle: 'normal', fontWeight: 600, fontSize: '16px' }}>+0.22%</em>
              <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: '#adbfda' }}>
                <span>High 226.48</span>
                <span>Low 222.91</span>
                <span>Volume 48.2M</span>
              </div>
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
                <path fill="url(#area)" d="M0 290 L45 260 90 275 135 204 180 225 225 153 270 175 315 105 360 135 405 92 450 165 495 125 540 201 585 170 630 235 675 201 720 245 780 150V340H0Z" />
                <path fill="none" stroke="#13e4ff" strokeWidth="3" d="M0 290 L45 260 90 275 135 204 180 225 225 153 270 175 315 105 360 135 405 92 450 165 495 125 540 201 585 170 630 235 675 201 720 245 780 150" />
              </svg>
              <span className={styles.label3d} style={{ right: 16, top: 70 }}>RESISTANCE $228.50</span>
              <span className={styles.label3d} style={{ right: 70, top: 210 }}>ENTRY $223–$224</span>
              <span className={styles.label3d} style={{ right: 25, bottom: 38 }}>SUPPORT $220.50</span>
            </div>

            {/* Volume Bar Chart */}
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #21405e' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${30 + Math.random() * 70}%`,
                      background: Math.random() > 0.5 ? 'rgba(0, 255, 127, 0.3)' : 'rgba(255, 59, 127, 0.3)',
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </div>
            </div>
          </article>

          {/* Right Column: Analysis + Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* PLOT AI Panel */}
            <article className={styles.premiumPanel}>
              <h2 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12 }}>
                ◉ PLOT AI{' '}
                <small style={{ display: 'block', fontSize: 9, color: '#a9c1df', fontWeight: 400, marginTop: 4 }}>
                  LIVE MARKET INTELLIGENCE
                </small>
              </h2>

              {/* Bullish Gauge */}
              <div style={{ margin: '16px auto', width: 140, height: 70, border: '10px solid #0ce3c6', borderBottom: 0, borderRadius: '140px 140px 0 0', textAlign: 'center', paddingTop: 16, boxShadow: 'inset 0 2px 8px rgba(12, 227, 198, 0.2)' }}>
                <b style={{ display: 'block', fontSize: 24, letterSpacing: '-0.5px' }}>72%</b>
                <small style={{ color: '#05e9ad', fontSize: '10px', fontWeight: 600 }}>BULLISH BIAS</small>
              </div>

              {/* Analysis Points */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {analysisPoints.map((point) => (
                  <p key={point} style={{ margin: 0, fontSize: 11, color: '#d4e3f7', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#00ff7f' }}>✓</span> {point.replace('✓ ', '')}
                  </p>
                ))}
              </div>

              <button className={`${styles.buttonPremium} ${styles.buttonFull}`} style={{ marginTop: 12, fontSize: '12px' }}>
                View Full Analysis →
              </button>
            </article>

            {/* Key Levels Panel */}
            <article className={styles.premiumPanel}>
              <h3 style={{ marginTop: 0, fontSize: '12px', fontWeight: 700, marginBottom: 10 }}>KEY LEVELS</h3>
              {keyLevels.map((level) => (
                <div key={level.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #21405e' }}>
                  <span style={{ color: '#7a9fb5' }}>{level.label}</span>
                  <b style={{ color: level.color }}>{level.value}</b>
                </div>
              ))}
            </article>

            {/* Options Flow Panel */}
            <article className={styles.premiumPanel}>
              <h3 style={{ marginTop: 0, fontSize: '12px', fontWeight: 700, marginBottom: 10 }}>OPTIONS FLOW</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#7a9fb5' }}>Bullish Flow</span>
                  <b style={{ color: '#00ff7f' }}>72%</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#7a9fb5' }}>Put/Call Ratio</span>
                  <b style={{ color: '#d4e3f7' }}>0.42</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#7a9fb5' }}>Total Premium</span>
                  <b style={{ color: '#d4e3f7' }}>$186.4M</b>
                </div>
              </div>
              <button className={styles.buttonPremium} style={{ marginTop: 12, fontSize: '11px', padding: '6px 12px' }}>
                View Options Flow →
              </button>
            </article>
          </div>
        </div>

        {/* Market Intelligence Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 14 }}>
          {/* Volume Analysis */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '12px', fontWeight: 700, marginBottom: 10 }}>VOLUME ANALYSIS</h3>
            <b style={{ fontSize: 20, color: '#00ff7f' }}>48.2M</b>
            <small style={{ display: 'block', color: '#7a9fb5', fontSize: '11px', marginTop: 4 }}>Above 200-day Avg</small>
            <div style={{ marginTop: 8, height: 30, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{ flex: 1, height: `${20 + Math.random() * 80}%`, background: 'rgba(0, 217, 255, 0.4)', borderRadius: '2px' }} />
              ))}
            </div>
          </article>

          {/* Price Action */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '12px', fontWeight: 700, marginBottom: 10 }}>PRICE ACTION</h3>
            <b style={{ fontSize: 20, color: '#d4e3f7' }}>225.07</b>
            <small style={{ display: 'block', color: '#00ff7f', fontSize: '11px', marginTop: 4, fontWeight: 600 }}>+0.22%</small>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#7a9fb5' }}>Holding above EMA 20</p>
          </article>

          {/* Trend Alignment */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '12px', fontWeight: 700, marginBottom: 10 }}>TREND ALIGNMENT</h3>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#00ff7f' }}>✓ BULLISH</span>
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#7a9fb5' }}>Holding above short-term EMAs</p>
          </article>
        </div>

        {/* Watchlist + Market Heatmap */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14, marginTop: 14 }}>
          {/* Watchlist */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12 }}>WATCHLIST</h3>
            <div className={styles.scrollableList}>
              {watchlist.map((item) => (
                <div key={item.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #193553' }}>
                  <span style={{ fontWeight: 600, color: '#f4f8ff' }}>{item.symbol}</span>
                  <span style={{ color: '#d4e3f7' }}>{item.price}</span>
                  <span style={{ color: '#00ff7f', fontWeight: 600 }}>{item.change}</span>
                </div>
              ))}
            </div>
          </article>

          {/* Market Heatmap */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12 }}>MARKET HEATMAP</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { sym: 'NVDA', change: '+0.22%', pos: true },
                { sym: 'AAPL', change: '+0.62%', pos: true },
                { sym: 'MSFT', change: '+0.74%', pos: true },
                { sym: 'TSLA', change: '-0.28%', pos: false },
                { sym: 'AMZN', change: '+0.31%', pos: true },
                { sym: 'BRK.B', change: '+0.41%', pos: true },
                { sym: 'GOOGL', change: '+0.50%', pos: true },
                { sym: 'META', change: '-0.19%', pos: false }
              ].map((stock) => (
                <div
                  key={stock.sym}
                  style={{
                    padding: '10px',
                    borderRadius: '10px',
                    background: stock.pos ? 'rgba(0, 255, 127, 0.15)' : 'rgba(255, 59, 127, 0.15)',
                    border: `1px solid ${stock.pos ? 'rgba(0, 255, 127, 0.3)' : 'rgba(255, 59, 127, 0.3)'}`,
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f4f8ff' }}>{stock.sym}</div>
                  <div style={{ fontSize: '10px', color: stock.pos ? '#00ff7f' : '#ff3b7f', fontWeight: 600, marginTop: 4 }}>
                    {stock.change}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Live Trading */}
        <LiveTrading />

        {/* Follow Trader */}
        <FollowTrader />

        {/* Footer */}
        <footer className={styles.footerPremium}>
          <div>EVERY DAY TRADER · WISE²</div>
          <span className={styles.footerTagline}>Knowledge Builds Freedom.</span>
        </footer>
      </div>

      <CuzzoAI />
    </main>
  );
}

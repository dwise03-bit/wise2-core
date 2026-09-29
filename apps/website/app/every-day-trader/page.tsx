'use client';

import styles from './trader-3d.module.css';
import CuzzoAI from './cuzzo-ai';
import LiveTrading from './live-trading';
import FollowTrader from './follow-trader';
import CandlestickChart from './candlestick-chart';
import { TraderAvatars, CandlestickGraphics, IndicatorIcons } from './trader-avatars';
import { HeroBackground, DashboardPreview, SentimentGauge, TradingSetupCard } from './hero-graphics';
import { WISELogo, EDTLogo, ChartSymbols, FeatureBadges, EducationIcons, SentimentBadges } from './brand-assets';
import { marketDataService, liveDataManager, MarketData } from './market-data-service';
import { plotAIService, PlotAIAnalysis } from './plot-ai-service';
import { useState, useEffect } from 'react';

export default function EveryDayTraderPage() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [plotAnalysis, setPlotAnalysis] = useState<PlotAIAnalysis | null>(null);

  // Initialize live data on component mount
  useEffect(() => {
    const initializeData = async () => {
      // Load config from public/config.json or environment variables
      try {
        const response = await fetch('/config.json');
        if (response.ok) {
          const config = await response.json();
          console.log(`🚀 EDT Dashboard - Data Source: ${config.marketDataSource} (with API key from config.json)`);
          liveDataManager.setDataSource(config.marketDataSource, config.alphaVantageKey);
        } else {
          throw new Error('Config not found');
        }
      } catch (e) {
        // Fallback: Set data source from environment
        const dataSource = (process.env.NEXT_PUBLIC_MARKET_DATA_SOURCE || 'mock') as 'mock' | 'alpha-vantage' | 'yahoo';
        const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || process.env.NEXT_PUBLIC_RAPID_API_KEY || '';
        console.log(`🚀 EDT Dashboard - Data Source: ${dataSource}${apiKey ? ' (with API key)' : ' (no API key - using mock)'}`);
        liveDataManager.setDataSource(dataSource, apiKey);
      }

      // Subscribe to live market data
      const unsubscribe = marketDataService.subscribe((data) => {
        setMarketData(data);

        // Update PLOT AI analysis when data changes
        const nvda = data.quotes['NVDA'];
        const nvdaCandles = data.candles['NVDA'] || [];

        if (nvda && nvdaCandles.length > 0) {
          const analysis = plotAIService.analyze(nvdaCandles, nvda);
          setPlotAnalysis(analysis);
        }
      });

      // Start live updates for main symbols
      liveDataManager.startLiveUpdates('NVDA', 5000); // Update every 5 seconds
      liveDataManager.startLiveUpdates('AAPL', 5000);
      liveDataManager.startLiveUpdates('SPY', 5000);
      liveDataManager.startLiveUpdates('QQQ', 5000);

      return () => {
        unsubscribe();
        liveDataManager.stopAll();
      };
    };

    initializeData();
  }, []);

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

  // Generate dynamic analysis points from PLOT AI
  const analysisPoints = plotAnalysis ? [
    `✓ Trend — ${plotAnalysis.trend.replace('_', ' ')}`,
    `✓ Momentum — ${plotAnalysis.momentum}`,
    `✓ Volume — ${plotAnalysis.volume.replace('_', ' ')}`,
    `✓ Options Flow — ${plotAnalysis.optionsFlow}`,
    `✓ News Sentiment — ${plotAnalysis.newsSentiment}`
  ] : [
    '✓ Trend — Loading...',
    '✓ Momentum — Loading...',
    '✓ Volume — Loading...',
    '✓ Options Flow — Loading...',
    '✓ News Sentiment — Loading...'
  ];

  // Use PLOT AI levels or defaults
  const keyLevels = plotAnalysis ? [
    { label: 'Resistance', value: `$${(Math.max(...plotAnalysis.targets)).toFixed(2)}`, color: '#ff5276' },
    { label: 'Entry Zone', value: `$${plotAnalysis.entryZone.low.toFixed(2)}–$${plotAnalysis.entryZone.high.toFixed(2)}`, color: '#FFD700' },
    { label: 'Support', value: `$${plotAnalysis.stopLoss.toFixed(2)}`, color: '#00ff7f' }
  ] : [
    { label: 'Resistance', value: '—', color: '#ff5276' },
    { label: 'Entry Zone', value: '—', color: '#FFD700' },
    { label: 'Support', value: '—', color: '#00ff7f' }
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
          <div style={{ width: '160px' }}>
            <EDTLogo />
          </div>
          <input
            aria-label="Search"
            placeholder="⌕  Search stocks, crypto, or ETFs..."
            className={styles.searchInput3d}
          />
          <div style={{ width: '48px' }}>
            <WISELogo />
          </div>
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

        {/* Main Grid: Chart + Right Column (matching reference) */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: 14 }}>
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
              {['1D', '5D', '1M', '3M', '6M', '1Y'].map((period) => (
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

            {/* Price & Stats - Live Data */}
            <div style={{ display: 'flex', gap: 20, alignItems: 'baseline', marginBottom: 14 }}>
              <b style={{ fontSize: 32, letterSpacing: '-1px' }}>
                ${marketData?.quotes['NVDA']?.price.toFixed(2) || '225.07'}
              </b>
              <em style={{ color: marketData?.quotes['NVDA']?.change ?? 0 > 0 ? '#00e8ad' : '#ff3b7f', fontStyle: 'normal', fontWeight: 600, fontSize: '16px' }}>
                {marketData?.quotes['NVDA']?.changePercent.toFixed(2) || '+0.22'}%
              </em>
              <div style={{ display: 'flex', gap: 16, fontSize: '12px', color: '#adbfda' }}>
                <span>High ${marketData?.quotes['NVDA']?.high.toFixed(2) || '226.48'}</span>
                <span>Low ${marketData?.quotes['NVDA']?.low.toFixed(2) || '222.91'}</span>
                <span>Volume {(marketData?.quotes['NVDA']?.volume ?? 0 / 1000000).toFixed(1)}M</span>
              </div>
            </div>

            {/* Candlestick Chart */}
            <CandlestickChart />
          </article>

          {/* Right Column: PLOT AI + Key Levels + Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* PLOT AI Panel */}
            <article className={styles.premiumPanel}>
              <h2 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12 }}>
                ◉ PLOT AI{' '}
                <small style={{ display: 'block', fontSize: 9, color: '#a9c1df', fontWeight: 400, marginTop: 4 }}>
                  LIVE MARKET INTELLIGENCE
                </small>
              </h2>

              {/* Sentiment Gauge with Live Bias */}
              <div style={{ margin: '8px auto', width: '160px', position: 'relative' }}>
                <SentimentGauge />
                <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', zIndex: 10 }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: plotAnalysis ? (plotAnalysis.bullishBias > 60 ? '#00ff7f' : plotAnalysis.bullishBias > 40 ? '#00D9FF' : '#ff3b7f') : '#00D9FF' }}>
                    {plotAnalysis ? Math.round(plotAnalysis.bullishBias) : 72}%
                  </div>
                  <div style={{ fontSize: '9px', color: '#7a9fb5', marginTop: '2px' }}>
                    {plotAnalysis?.bullishBias ? (plotAnalysis.bullishBias > 60 ? 'BULLISH' : plotAnalysis.bullishBias > 40 ? 'NEUTRAL' : 'BEARISH') : 'BULLISH'}
                  </div>
                </div>
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
              <button className={styles.buttonPremium} style={{ marginTop: 12, fontSize: '11px', padding: '6px 12px', width: '100%' }}>
                View Options Flow →
              </button>
            </article>
          </div>
        </div>

        {/* Watchlist + Market Pulse + Paper Trade (3-column grid matching reference) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: 14, marginTop: 14 }}>
          {/* Watchlist */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              📊 WATCHLIST <span style={{ fontSize: 10, color: '#7a9fb5', fontWeight: 400, marginLeft: 'auto' }}>View All →</span>
            </h3>
            <div className={styles.scrollableList}>
              {[
                { symbol: 'NVDA', price: '225.07', change: '+0.22%' },
                { symbol: 'AAPL', price: '227.52', change: '+0.62%' },
                { symbol: 'TSLA', price: '254.27', change: '-1.83%' },
                { symbol: 'MSFT', price: '418.06', change: '-0.74%' },
                { symbol: 'AMZN', price: '186.53', change: '+0.31%' },
                { symbol: 'BTC', price: '63,284.50', change: '+2.46%' },
                { symbol: 'ETH', price: '2,612.08', change: '+1.38%' }
              ].map((item) => (
                <div key={item.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid #193553' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14 }}>
                      {item.symbol === 'NVDA' ? '💚' : item.symbol === 'AAPL' ? '💚' : item.symbol === 'MSFT' ? '💔' : item.symbol === 'TSLA' ? '💔' : item.symbol === 'AMZN' ? '💚' : item.symbol === 'BTC' ? '💚' : '💚'}
                    </span>
                    <span style={{ fontWeight: 600, color: '#f4f8ff' }}>{item.symbol}</span>
                  </div>
                  <span style={{ color: '#d4e3f7' }}>{item.price}</span>
                  <span style={{ color: item.change.includes('-') ? '#ff3b7f' : '#00ff7f', fontWeight: 600 }}>{item.change}</span>
                </div>
              ))}
            </div>
          </article>

          {/* Market Pulse */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12 }}>📊 MARKET PULSE</h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {['Stocks', 'Crypto', 'ETFs'].map((tab) => (
                <button
                  key={tab}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: tab === 'Stocks' ? 'rgba(0, 217, 255, 0.2)' : 'transparent',
                    border: `1px solid ${tab === 'Stocks' ? 'rgba(0, 217, 255, 0.4)' : 'rgba(0, 217, 255, 0.2)'}`,
                    color: tab === 'Stocks' ? '#00D9FF' : '#7a9fb5',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '10px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f4f8ff' }}>S&P 500</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f4f8ff', marginTop: 4 }}>5,728.41</div>
                <div style={{ fontSize: '11px', color: '#00ff7f', fontWeight: 600, marginTop: 4 }}>+0.82%</div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '10px', border: '1px solid rgba(0, 217, 255, 0.2)' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#f4f8ff' }}>NASDAQ</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#f4f8ff', marginTop: 4 }}>18,230.12</div>
                <div style={{ fontSize: '11px', color: '#00ff7f', fontWeight: 600, marginTop: 4 }}>+1.14%</div>
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.08)', borderRadius: '10px', border: '1px solid rgba(0, 217, 255, 0.15)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#7a9fb5', marginBottom: 8 }}>Market Breadth</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'conic-gradient(#00ff7f 0deg 245deg, #ff3b7f 245deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#020914', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#00ff7f' }}>68%</span>
                  </div>
                </div>
                <div style={{ fontSize: '11px' }}>
                  <div style={{ color: '#00ff7f', fontWeight: 600 }}>1,842 Advancing</div>
                  <div style={{ color: '#ff3b7f', fontWeight: 600 }}>742 Declining</div>
                  <div style={{ color: '#7a9fb5', marginTop: 4 }}>96 Unchanged</div>
                </div>
              </div>
            </div>
          </article>

          {/* Paper Trade Planner */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12 }}>📋 PAPER TRADE PLANNER</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <small style={{ color: '#7a9fb5', fontSize: '11px' }}>Entry Price</small>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFD700', marginTop: 4 }}>$223.00 - $224.00</div>
              </div>
              <div>
                <small style={{ color: '#7a9fb5', fontSize: '11px' }}>Stop Loss</small>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#ff3b7f', marginTop: 4 }}>$220.50</div>
              </div>
              <div>
                <small style={{ color: '#7a9fb5', fontSize: '11px' }}>Target</small>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#00ff7f', marginTop: 4 }}>$228.50</div>
              </div>
              <div style={{ paddingTop: 10, borderTop: '1px solid #193553' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: 6 }}>
                  <span style={{ color: '#7a9fb5' }}>Risk / Reward</span>
                  <b style={{ color: '#d4e3f7' }}>1 : 2.1</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: '#7a9fb5' }}>Position Size</span>
                  <b style={{ color: '#d4e3f7' }}>100 Shares</b>
                </div>
              </div>
            </div>
            <button className={`${styles.buttonPremium} ${styles.buttonFull}`} style={{ marginTop: 12, fontSize: '12px' }}>
              Build Trade Plan →
            </button>
          </article>
        </div>

        {/* Recent Journal + Education (2-column grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 14, marginTop: 14 }}>
          {/* Recent Journal */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              📰 RECENT JOURNAL <span style={{ fontSize: 10, color: '#7a9fb5', fontWeight: 400 }}>View All →</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { title: 'NVDA Trade Setup', desc: 'Good support at $223. Looking for confirmation with volume.', date: 'Apr 9, 2025', time: '6 min read', icon: '💚' },
                { title: 'AAPL Pullback Opportunity', desc: 'Great risk/reward setup. Watch $226 for potential entry.', date: 'Apr 8, 2025', time: '4 min read', icon: '💚' },
                { title: 'Risk Management Review', desc: 'Stick to the plan. Small size, big discipline. Trade longer.', date: 'Jul 7, 2025', time: '5 min read', icon: '⚠️' }
              ].map((entry, i) => (
                <div key={i} style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '10px', border: '1px solid rgba(0, 217, 255, 0.1)', cursor: 'pointer', transition: 'all 200ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.2)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 217, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(0, 217, 255, 0.1)'; }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 16 }}>{entry.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#f4f8ff' }}>{entry.title}</div>
                      <div style={{ fontSize: '11px', color: '#7a9fb5', marginTop: 4 }}>{entry.desc}</div>
                      <div style={{ fontSize: '10px', color: '#7a9fb5', marginTop: 6 }}>{entry.date} • {entry.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* Education */}
          <article className={styles.premiumPanel}>
            <h3 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              🎓 EDUCATION <span style={{ fontSize: 10, color: '#7a9fb5', fontWeight: 400 }}>View All →</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { icon: EducationIcons.PlayVideo, title: 'Understanding Candlesticks', desc: 'The foundation of price action.', duration: '7 min' },
                { icon: EducationIcons.Book, title: 'Options Basics for Beginners', desc: 'Strategies explained simply.', duration: '8 min' },
                { icon: EducationIcons.Certificate, title: 'Risk Management', desc: 'Protect your capital. Trade longer.', duration: '6 min' }
              ].map((video, i) => (
                <div key={i} style={{ padding: '16px', background: 'rgba(0, 217, 255, 0.08)', borderRadius: '12px', border: '1px solid rgba(0, 217, 255, 0.15)', cursor: 'pointer', transition: 'all 200ms ease', textAlign: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 217, 255, 0.15)'; e.currentTarget.style.transform = 'scale(1.02)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 217, 255, 0.08)'; e.currentTarget.style.transform = 'scale(1)'; }}>
                  <div style={{ fontSize: '40px', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>{video.icon()}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f4f8ff', marginBottom: 4 }}>{video.title}</div>
                  <div style={{ fontSize: '11px', color: '#7a9fb5', marginBottom: 8 }}>{video.desc}</div>
                  <div style={{ fontSize: '11px', color: '#00D9FF', fontWeight: 600 }}>{video.duration}</div>
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

'use client';

import styles from './page.module.css';
import { useState, useEffect } from 'react';
import { marketDataService, liveDataManager, MarketData } from '../lib/market-data-service';
import { plotAIService, PlotAIAnalysis } from '../lib/plot-ai-service';
import CandlestickChart from '../components/candlestick-chart';
import { TraderAvatars, CandlestickGraphics, IndicatorIcons } from '../components/trader-avatars';
import {
  HeroBackground,
  DashboardPreview,
  SentimentGauge,
  TradingSetupCard
} from '../components/hero-graphics';
import {
  EDTLogo,
  ChartSymbols,
  FeatureBadges,
  EducationIcons,
  SentimentBadges
} from '../components/brand-assets';

export default function EveryDayTraderPage() {
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [plotAnalysis, setPlotAnalysis] = useState<PlotAIAnalysis | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      let dataSource: 'mock' | 'alpha-vantage' | 'yahoo' = 'mock';
      let apiKey = '';

      try {
        const response = await fetch('/config.json');
        if (response.ok) {
          const config = await response.json();
          dataSource = config.marketDataSource;
          apiKey = config.alphaVantageKey;
        }
      } catch (e) {
        dataSource = (process.env.NEXT_PUBLIC_MARKET_DATA_SOURCE || 'alpha-vantage') as 'mock' | 'alpha-vantage' | 'yahoo';
        apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY || 'VCPIQUKNZ4LT0TFX';
      }

      console.log(`🚀 EDT Dashboard - Data Source: ${dataSource}`);
      liveDataManager.setDataSource(dataSource, apiKey);

      const unsubscribe = marketDataService.subscribe((data) => {
        setMarketData(data);
        const nvda = data.quotes['NVDA'];
        const nvdaCandles = data.candles['NVDA'] || [];

        if (nvda && nvdaCandles.length > 0) {
          const analysis = plotAIService.analyze(nvdaCandles, nvda);
          setPlotAnalysis(analysis);
        }
      });

      liveDataManager.startLiveUpdates('NVDA', 5000);
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

  const keyLevels = plotAnalysis ? [
    { label: 'Resistance', value: `$${(Math.max(...plotAnalysis.targets)).toFixed(2)}`, color: '#ff5276' },
    { label: 'Entry Zone', value: `$${plotAnalysis.entryZone.low.toFixed(2)}–$${plotAnalysis.entryZone.high.toFixed(2)}`, color: '#FFD700' },
    { label: 'Support', value: `$${plotAnalysis.stopLoss.toFixed(2)}`, color: '#00ff7f' }
  ] : [
    { label: 'Resistance', value: '—', color: '#ff5276' },
    { label: 'Entry Zone', value: '—', color: '#FFD700' },
    { label: 'Support', value: '—', color: '#00ff7f' }
  ];

  return (
    <main className={styles.dashboardRoot}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '-2px', background: 'linear-gradient(135deg, #00D9FF, #00FF7F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            EDT
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
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div style={{ fontSize: '11px', color: '#7a9fb5', textAlign: 'center', lineHeight: '1.4' }}>
            EVERY DAY<br />TRADER
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.headerPremium}>
          <div style={{ fontSize: '20px', fontWeight: 900, background: 'linear-gradient(135deg, #00D9FF, #00FF7F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ▲ EDT
          </div>
          <input
            aria-label="Search"
            placeholder="⌕  Search stocks, crypto, or ETFs..."
            className={styles.searchInput3d}
          />
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <button
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #00D9FF 0%, #00FF7F 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '10px',
                color: '#050607',
                fontWeight: 700,
                fontSize: '12px',
                letterSpacing: '0.5px',
                cursor: 'pointer',
                transition: 'all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 4px 20px rgba(0, 217, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) translateY(-3px) scale(1.06)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 217, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              }}
            >
              Sign In →
            </button>
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

        {/* Main Content Grid */}
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

            <CandlestickChart />
          </article>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* PLOT AI Panel */}
            <article className={styles.premiumPanel}>
              <h2 style={{ marginTop: 0, fontSize: '14px', fontWeight: 700, marginBottom: 12 }}>
                ◉ PLOT AI{' '}
                <small style={{ display: 'block', fontSize: 9, color: '#a9c1df', fontWeight: 400, marginTop: 4 }}>
                  LIVE MARKET INTELLIGENCE
                </small>
              </h2>

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
      </div>
    </main>
  );
}

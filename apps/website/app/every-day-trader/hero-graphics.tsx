'use client';

// Hero Background Graphic - Trading Dashboard Theme
export const HeroBackground = () => (
  <svg width="100%" height="400" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#050607"/>
        <stop offset="50%" stopColor="#020914"/>
        <stop offset="100%" stopColor="#010410"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>

    {/* Background gradient */}
    <rect width="1200" height="400" fill="url(#heroGradient)"/>

    {/* Animated grid lines */}
    {Array.from({length: 12}).map((_, i) => (
      <line key={`v-${i}`} x1={i * 100} y1="0" x2={i * 100} y2="400" stroke="#00D9FF" strokeWidth="0.5" opacity="0.1"/>
    ))}
    {Array.from({length: 4}).map((_, i) => (
      <line key={`h-${i}`} x1="0" y1={i * 100} x2="1200" y2={i * 100} stroke="#00D9FF" strokeWidth="0.5" opacity="0.1"/>
    ))}

    {/* Candlestick pattern visualization */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
      const x = 100 + i * 100;
      const isUp = i % 2 === 0;
      const height = 40 + Math.random() * 80;
      const color = isUp ? '#00FF7F' : '#FF3B7F';
      return (
        <g key={`candle-${i}`} filter="url(#glow)">
          <line x1={x} y1={150 - height/2} x2={x} y2={150 + height/2} stroke={color} strokeWidth="1" opacity="0.6"/>
          <rect x={x - 8} y={150 - height/3} width="16" height={height/1.5} fill={color} opacity="0.4"/>
        </g>
      );
    })}

    {/* Accent shapes */}
    <circle cx="150" cy="80" r="40" fill="#00D9FF" opacity="0.05"/>
    <circle cx="1050" cy="320" r="60" fill="#00FF7F" opacity="0.05"/>
    <rect x="400" y="50" width="400" height="300" fill="none" stroke="#00D9FF" strokeWidth="1" opacity="0.1" rx="10"/>
  </svg>
);

// Dashboard Screenshot Graphic (for marketing)
export const DashboardPreview = () => (
  <svg width="100%" height="300" viewBox="0 0 800 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#050607"/>
        <stop offset="100%" stopColor="#020914"/>
      </linearGradient>
    </defs>

    {/* Main frame */}
    <rect width="800" height="300" fill="url(#dashGrad)" stroke="#00D9FF" strokeWidth="1" opacity="0.2"/>

    {/* Sidebar */}
    <rect x="0" y="0" width="80" height="300" fill="#050607" stroke="#00D9FF" strokeWidth="0.5" opacity="0.1"/>
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={`nav-${i}`} cx="40" cy={40 + i * 50} r="20" fill="#00D9FF" opacity="0.15"/>
    ))}

    {/* Header */}
    <rect x="80" y="0" width="720" height="50" fill="#00D9FF" opacity="0.05"/>
    <text x="100" y="32" fill="#00D9FF" fontSize="16" fontWeight="bold" fontFamily="system-ui">EVERY DAY TRADER</text>

    {/* Chart area */}
    <rect x="100" y="70" width="380" height="200" fill="#00D9FF" opacity="0.02" stroke="#00D9FF" strokeWidth="1" opacity="0.1" rx="8"/>
    {[0, 1, 2, 3, 4, 5].map((i) => {
      const h = 30 + Math.random() * 100;
      return (
        <rect key={`chart-${i}`} x={110 + i * 60} y={250 - h} width="50" height={h} fill="#00FF7F" opacity="0.3"/>
      );
    })}

    {/* Info panels */}
    <rect x="500" y="70" width="260" height="90" fill="#00D9FF" opacity="0.02" stroke="#00D9FF" strokeWidth="1" opacity="0.1" rx="8"/>
    <text x="520" y="100" fill="#00D9FF" fontSize="12" fontFamily="system-ui">PLOT AI • 72%</text>
    <circle cx="730" cy="110" r="25" fill="#00FF7F" opacity="0.1"/>

    <rect x="500" y="170" width="260" height="100" fill="#00D9FF" opacity="0.02" stroke="#00D9FF" strokeWidth="1" opacity="0.1" rx="8"/>
    <text x="520" y="200" fill="#00D9FF" fontSize="12" fontFamily="system-ui">KEY LEVELS</text>
    <text x="520" y="225" fill="#FF3B7F" fontSize="11" fontFamily="system-ui">Resistance: $228.50</text>
    <text x="520" y="245" fill="#FFD700" fontSize="11" fontFamily="system-ui">Entry: $223-224</text>
  </svg>
);

// Market Sentiment Gauge
export const SentimentGauge = () => (
  <svg width="160" height="90" viewBox="0 0 160 90" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF3B7F"/>
        <stop offset="50%" stopColor="#FFD700"/>
        <stop offset="100%" stopColor="#00FF7F"/>
      </linearGradient>
    </defs>

    {/* Gauge background */}
    <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="#00D9FF" strokeWidth="1" opacity="0.2"/>

    {/* Gauge gradient */}
    <path d="M 20 80 A 60 60 0 0 1 140 80" fill="none" stroke="url(#gaugeGrad)" strokeWidth="8" opacity="0.6"/>

    {/* Needle at 72% (bullish) */}
    <g transform="translate(80, 80)">
      <line x1="0" y1="0" x2="0" y2="-50" stroke="#00D9FF" strokeWidth="2" opacity="0.8"/>
      <circle cx="0" cy="0" r="3" fill="#00D9FF"/>
    </g>

    {/* Labels */}
    <text x="15" y="75" fill="#FF3B7F" fontSize="10" fontFamily="system-ui" fontWeight="bold">BEAR</text>
    <text x="125" y="75" fill="#00FF7F" fontSize="10" fontFamily="system-ui" fontWeight="bold">BULL</text>
    <text x="80" y="20" textAnchor="middle" fill="#00D9FF" fontSize="16" fontWeight="bold" fontFamily="system-ui">72%</text>
  </svg>
);

// Trading Setup Card Graphic
export const TradingSetupCard = () => (
  <svg width="280" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06264C" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#031125" stopOpacity="0.5"/>
      </linearGradient>
    </defs>

    {/* Card background */}
    <rect width="280" height="160" fill="url(#cardGrad)" stroke="#00D9FF" strokeWidth="1" opacity="0.3" rx="12"/>

    {/* Entry price */}
    <rect x="20" y="20" width="100" height="50" fill="#FFD700" opacity="0.1" rx="6"/>
    <text x="30" y="40" fill="#FFD700" fontSize="11" fontFamily="system-ui" fontWeight="bold">ENTRY</text>
    <text x="30" y="60" fill="#FFD700" fontSize="14" fontFamily="system-ui" fontWeight="bold">$223</text>

    {/* Stop loss */}
    <rect x="135" y="20" width="100" height="50" fill="#FF3B7F" opacity="0.1" rx="6"/>
    <text x="145" y="40" fill="#FF3B7F" fontSize="11" fontFamily="system-ui" fontWeight="bold">STOP</text>
    <text x="145" y="60" fill="#FF3B7F" fontSize="14" fontFamily="system-ui" fontWeight="bold">$220</text>

    {/* Target */}
    <rect x="240" y="20" width="20" height="50" fill="#00FF7F" opacity="0.2" rx="6"/>
    <text x="235" y="60" fill="#00FF7F" fontSize="12" fontFamily="system-ui" fontWeight="bold">T</text>

    {/* Risk/Reward */}
    <rect x="20" y="85" width="240" height="55" fill="#00D9FF" opacity="0.05" stroke="#00D9FF" strokeWidth="0.5" opacity="0.2" rx="6"/>
    <text x="30" y="105" fill="#00D9FF" fontSize="11" fontFamily="system-ui">Risk / Reward</text>
    <text x="30" y="130" fill="#00FF7F" fontSize="14" fontFamily="system-ui" fontWeight="bold">1 : 2.1</text>
    <text x="150" y="105" fill="#00D9FF" fontSize="11" fontFamily="system-ui">Position Size</text>
    <text x="150" y="130" fill="#00FF7F" fontSize="14" fontFamily="system-ui" fontWeight="bold">100 Shares</text>
  </svg>
);

// Market Breadth Distribution
export const MarketDistribution = () => (
  <svg width="200" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="distGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#00FF7F" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#00FF7F" stopOpacity="0.1"/>
      </linearGradient>
      <linearGradient id="distGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#FF3B7F" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#FF3B7F" stopOpacity="0.1"/>
      </linearGradient>
    </defs>

    {/* Bull distribution (68%) */}
    <rect x="10" y="30" width="120" height="80" fill="url(#distGrad1)" stroke="#00FF7F" strokeWidth="1"/>
    <text x="70" y="75" textAnchor="middle" fill="#00FF7F" fontSize="18" fontWeight="bold" fontFamily="system-ui">68%</text>

    {/* Bear distribution (32%) */}
    <rect x="130" y="30" width="60" height="80" fill="url(#distGrad2)" stroke="#FF3B7F" strokeWidth="1"/>
    <text x="160" y="75" textAnchor="middle" fill="#FF3B7F" fontSize="14" fontWeight="bold" fontFamily="system-ui">32%</text>

    {/* Labels */}
    <text x="70" y="115" textAnchor="middle" fill="#00FF7F" fontSize="10" fontFamily="system-ui">Advancing</text>
    <text x="160" y="115" textAnchor="middle" fill="#FF3B7F" fontSize="10" fontFamily="system-ui">Declining</text>
  </svg>
);

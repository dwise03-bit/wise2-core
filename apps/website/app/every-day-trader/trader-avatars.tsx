'use client';

// Trader Avatar Components with initials and trading-themed colors
export const TraderAvatars = {
  TrendMaster: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#00D9FF" opacity="0.2"/>
      <circle cx="24" cy="24" r="20" fill="none" stroke="#00D9FF" strokeWidth="2"/>
      <text x="24" y="32" textAnchor="middle" fill="#00D9FF" fontSize="18" fontWeight="bold" fontFamily="system-ui">TM</text>
    </svg>
  ),
  ValueHunter: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#00FF7F" opacity="0.2"/>
      <circle cx="24" cy="24" r="20" fill="none" stroke="#00FF7F" strokeWidth="2"/>
      <text x="24" y="32" textAnchor="middle" fill="#00FF7F" fontSize="18" fontWeight="bold" fontFamily="system-ui">VH</text>
    </svg>
  ),
  SwingKing: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#FFD700" opacity="0.2"/>
      <circle cx="24" cy="24" r="20" fill="none" stroke="#FFD700" strokeWidth="2"/>
      <text x="24" y="32" textAnchor="middle" fill="#FFD700" fontSize="18" fontWeight="bold" fontFamily="system-ui">SK</text>
    </svg>
  ),
  DayTraderPro: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#FF6B6B" opacity="0.2"/>
      <circle cx="24" cy="24" r="20" fill="none" stroke="#FF6B6B" strokeWidth="2"/>
      <text x="24" y="32" textAnchor="middle" fill="#FF6B6B" fontSize="18" fontWeight="bold" fontFamily="system-ui">DP</text>
    </svg>
  ),
  CryptoNinja: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="24" fill="#A78BFA" opacity="0.2"/>
      <circle cx="24" cy="24" r="20" fill="none" stroke="#A78BFA" strokeWidth="2"/>
      <text x="24" y="32" textAnchor="middle" fill="#A78BFA" fontSize="18" fontWeight="bold" fontFamily="system-ui">CN</text>
    </svg>
  ),
};

// Candlestick Pattern Graphics
export const CandlestickGraphics = {
  // Green uptrend candle
  UptrendCandle: (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="2" x2="16" y2="8" stroke="#00FF7F" strokeWidth="1.5"/>
      <rect x="10" y="12" width="12" height="20" fill="#00FF7F" opacity="0.8"/>
      <rect x="10" y="12" width="12" height="20" stroke="#00FF7F" strokeWidth="1.5"/>
      <line x1="16" y1="32" x2="16" y2="38" stroke="#00FF7F" strokeWidth="1.5"/>
    </svg>
  ),
  // Red downtrend candle
  DowntrendCandle: (
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="16" y1="2" x2="16" y2="12" stroke="#FF3B7F" strokeWidth="1.5"/>
      <rect x="10" y="14" width="12" height="18" fill="#FF3B7F" opacity="0.8"/>
      <rect x="10" y="14" width="12" height="18" stroke="#FF3B7F" strokeWidth="1.5"/>
      <line x1="16" y1="32" x2="16" y2="38" stroke="#FF3B7F" strokeWidth="1.5"/>
    </svg>
  ),
};

// Market Breadth Visualization
export const MarketBreadthChart = (
  <svg width="100%" height="120" viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Grid background */}
    <defs>
      <linearGradient id="bullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#00FF7F" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#00FF7F" stopOpacity="0.05"/>
      </linearGradient>
      <linearGradient id="bearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF3B7F" stopOpacity="0.3"/>
        <stop offset="100%" stopColor="#FF3B7F" stopOpacity="0.05"/>
      </linearGradient>
    </defs>

    {/* Bull bars */}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <rect key={`bull-${i}`} x={10 + i * 15} y={60 - Math.random() * 50} width="12" height={Math.random() * 50} fill="url(#bullGradient)" stroke="#00FF7F" strokeWidth="0.5"/>
    ))}

    {/* Bear bars */}
    {[0, 1, 2].map((i) => (
      <rect key={`bear-${i}`} x={195 + i * 15} y={60 - Math.random() * 30} width="12" height={Math.random() * 30} fill="url(#bearGradient)" stroke="#FF3B7F" strokeWidth="0.5"/>
    ))}

    {/* Center line */}
    <line x1="0" y1="60" x2="300" y2="60" stroke="#00D9FF" strokeWidth="0.5" opacity="0.3"/>

    {/* Labels */}
    <text x="60" y="110" textAnchor="middle" fill="#00FF7F" fontSize="10" fontFamily="system-ui" fontWeight="bold">Advancing</text>
    <text x="240" y="110" textAnchor="middle" fill="#FF3B7F" fontSize="10" fontFamily="system-ui" fontWeight="bold">Declining</text>
  </svg>
);

// Volume Profile Chart
export const VolumeProfile = (
  <svg width="100%" height="80" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
      const height = Math.sin(i * 0.5) * 30 + 20;
      return (
        <rect
          key={`bar-${i}`}
          x={i * 21 + 5}
          y={60 - height}
          width="18"
          height={height}
          fill="#00D9FF"
          opacity={0.3 + Math.random() * 0.4}
        />
      );
    })}
  </svg>
);

// Trading Setup Indicators
export const IndicatorIcons = {
  Bullish: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6,18 12,8 18,14" fill="none" stroke="#00FF7F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Bearish: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline points="6,8 12,18 18,12" fill="none" stroke="#FF3B7F" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Neutral: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="12" x2="18" y2="12" stroke="#00D9FF" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
};

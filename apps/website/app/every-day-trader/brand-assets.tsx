'use client';

// WISE² Logo Mark
export const WISELogo = (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="wiseLogo" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00D9FF"/>
        <stop offset="100%" stopColor="#00FF7F"/>
      </linearGradient>
    </defs>
    <circle cx="32" cy="32" r="30" fill="none" stroke="url(#wiseLogo)" strokeWidth="2"/>
    <text x="32" y="40" textAnchor="middle" fill="url(#wiseLogo)" fontSize="24" fontWeight="900" fontFamily="system-ui">W²</text>
  </svg>
);

// Every Day Trader Logo (Full)
export const EDTLogo = (
  <svg width="240" height="80" viewBox="0 0 240 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="edtGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#00D9FF"/>
        <stop offset="100%" stopColor="#00FF7F"/>
      </linearGradient>
    </defs>

    {/* Icon - Candlestick */}
    <g transform="translate(10, 10)">
      <line x1="20" y1="5" x2="20" y2="15" stroke="url(#edtGrad)" strokeWidth="1.5"/>
      <rect x="16" y="18" width="8" height="15" fill="url(#edtGrad)" opacity="0.7"/>
      <line x1="20" y1="33" x2="20" y2="50" stroke="url(#edtGrad)" strokeWidth="1.5"/>
    </g>

    {/* Text */}
    <text x="50" y="35" fill="#F4F8FF" fontSize="18" fontWeight="900" fontFamily="system-ui" letterSpacing="-0.5px">EVERY DAY</text>
    <text x="50" y="60" fill="url(#edtGrad)" fontSize="18" fontWeight="900" fontFamily="system-ui" letterSpacing="-0.5px">TRADER</text>

    {/* Tagline */}
    <text x="50" y="75" fill="#7A9FB5" fontSize="8" fontFamily="system-ui" fontWeight="500" letterSpacing="1px">POWERED BY WISE²</text>
  </svg>
);

// Chart Symbols & Icons
export const ChartSymbols = {
  // Bull Symbol
  Bull: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#00FF7F" opacity="0.1" stroke="#00FF7F" strokeWidth="1.5"/>
      <polyline points="12,28 18,18 24,22 28,12" fill="none" stroke="#00FF7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Bear Symbol
  Bear: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#FF3B7F" opacity="0.1" stroke="#FF3B7F" strokeWidth="1.5"/>
      <polyline points="12,12 18,22 24,18 28,28" fill="none" stroke="#FF3B7F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Dollar Sign
  Dollar: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#FFD700" opacity="0.1" stroke="#FFD700" strokeWidth="1.5"/>
      <text x="20" y="28" textAnchor="middle" fill="#FFD700" fontSize="20" fontWeight="bold" fontFamily="system-ui">$</text>
    </svg>
  ),

  // Chart Icon
  Chart: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="18" fill="#00D9FF" opacity="0.1" stroke="#00D9FF" strokeWidth="1.5"/>
      <rect x="10" y="24" width="4" height="8" fill="#00D9FF" opacity="0.6"/>
      <rect x="16" y="20" width="4" height="12" fill="#00D9FF" opacity="0.7"/>
      <rect x="22" y="16" width="4" height="16" fill="#00D9FF" opacity="0.8"/>
      <rect x="28" y="18" width="4" height="14" fill="#00D9FF" opacity="0.7"/>
    </svg>
  ),
};

// Feature Badges
export const FeatureBadges = {
  // Real-Time
  RealTime: (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" rx="20" fill="#00D9FF" opacity="0.1" stroke="#00D9FF" strokeWidth="1"/>
      <circle cx="15" cy="20" r="4" fill="#00FF7F"/>
      <text x="30" y="25" fill="#00D9FF" fontSize="12" fontWeight="bold" fontFamily="system-ui">LIVE DATA</text>
    </svg>
  ),

  // AI Powered
  AIPowered: (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" rx="20" fill="#00FF7F" opacity="0.1" stroke="#00FF7F" strokeWidth="1"/>
      <text x="10" y="25" fill="#00FF7F" fontSize="16" fontWeight="bold">🧠</text>
      <text x="35" y="25" fill="#00FF7F" fontSize="12" fontWeight="bold" fontFamily="system-ui">AI POWERED</text>
    </svg>
  ),

  // Pro Features
  ProFeatures: (
    <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" rx="20" fill="#FFD700" opacity="0.1" stroke="#FFD700" strokeWidth="1"/>
      <text x="10" y="25" fill="#FFD700" fontSize="16" fontWeight="bold">⭐</text>
      <text x="35" y="25" fill="#FFD700" fontSize="12" fontWeight="bold" fontFamily="system-ui">PRO TOOLS</text>
    </svg>
  ),
};

// Educational Icons
export const EducationIcons = {
  // Video Play Button
  PlayVideo: (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="28" fill="#00D9FF" opacity="0.1" stroke="#00D9FF" strokeWidth="1.5"/>
      <polygon points="22,20 22,40 42,30" fill="#00D9FF"/>
    </svg>
  ),

  // Book/Learn
  Book: (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="28" fill="#00FF7F" opacity="0.1" stroke="#00FF7F" strokeWidth="1.5"/>
      <path d="M 18 18 L 42 18 L 42 42 L 18 42 Z" fill="none" stroke="#00FF7F" strokeWidth="1.5"/>
      <line x1="30" y1="18" x2="30" y2="42" stroke="#00FF7F" strokeWidth="1"/>
      <line x1="18" y1="26" x2="42" y2="26" stroke="#00FF7F" strokeWidth="1" opacity="0.5"/>
    </svg>
  ),

  // Certificate
  Certificate: (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="28" fill="#FFD700" opacity="0.1" stroke="#FFD700" strokeWidth="1.5"/>
      <path d="M 18 20 L 42 20 L 42 40 L 30 48 L 18 40 Z" fill="none" stroke="#FFD700" strokeWidth="1.5"/>
      <line x1="30" y1="24" x2="30" y2="36" stroke="#FFD700" strokeWidth="1.5"/>
    </svg>
  ),
};

// Sentiment Indicators
export const SentimentBadges = {
  // Extremely Bullish
  ExtremelyBullish: (
    <svg width="100" height="24" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="24" rx="12" fill="#00FF7F" opacity="0.15" stroke="#00FF7F" strokeWidth="1"/>
      <text x="8" y="18" fill="#00FF7F" fontSize="12" fontWeight="bold">🚀 BULLISH</text>
    </svg>
  ),

  // Neutral
  Neutral: (
    <svg width="100" height="24" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="24" rx="12" fill="#00D9FF" opacity="0.15" stroke="#00D9FF" strokeWidth="1"/>
      <text x="12" y="18" fill="#00D9FF" fontSize="12" fontWeight="bold">➡️ NEUTRAL</text>
    </svg>
  ),

  // Bearish
  Bearish: (
    <svg width="100" height="24" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="24" rx="12" fill="#FF3B7F" opacity="0.15" stroke="#FF3B7F" strokeWidth="1"/>
      <text x="8" y="18" fill="#FF3B7F" fontSize="12" fontWeight="bold">📉 BEARISH</text>
    </svg>
  ),
};

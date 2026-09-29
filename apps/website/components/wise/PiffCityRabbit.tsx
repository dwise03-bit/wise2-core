/**
 * PIFF CITY Steampunk Rabbit Mascot
 * A professional SVG illustration featuring the iconic steampunk rabbit
 * with goggles, bandana, cigar, and confident stance
 */

import React from 'react';

export const PiffCityRabbit: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        maxWidth: '400px',
        filter: 'drop-shadow(0 0 40px rgba(166, 60, 255, 0.4))',
      }}
    >
      <defs>
        {/* Gradient for fur */}
        <linearGradient id="furGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A574" />
          <stop offset="50%" stopColor="#C4915C" />
          <stop offset="100%" stopColor="#8B6F47" />
        </linearGradient>

        {/* Gradient for metallic elements */}
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#F2B632" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        {/* Gradient for bandana */}
        <linearGradient id="bandanaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#A63CFF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        {/* Filter for engraving effect */}
        <filter id="engrave">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
        </filter>
      </defs>

      {/* Body */}
      <ellipse cx="200" cy="320" rx="95" ry="120" fill="url(#furGrad)" filter="url(#engrave)" />

      {/* Left arm making gesture */}
      <g>
        {/* Upper arm */}
        <ellipse cx="130" cy="280" rx="35" ry="75" fill="url(#furGrad)" transform="rotate(-35 130 280)" />
        {/* Paw */}
        <circle cx="90" cy="200" r="30" fill="url(#furGrad)" />
        {/* Peace sign fingers */}
        <rect x="75" y="170" width="8" height="45" fill="#D4A574" rx="4" transform="rotate(-25 79 170)" />
        <rect x="95" y="165" width="8" height="50" fill="#D4A574" rx="4" transform="rotate(15 99 165)" />
      </g>

      {/* Right arm making gesture */}
      <g>
        {/* Upper arm */}
        <ellipse cx="270" cy="280" rx="35" ry="75" fill="url(#furGrad)" transform="rotate(35 270 280)" />
        {/* Paw */}
        <circle cx="310" cy="200" r="30" fill="url(#furGrad)" />
        {/* Peace sign fingers */}
        <rect x="305" y="165" width="8" height="50" fill="#D4A574" rx="4" transform="rotate(-15 309 165)" />
        <rect x="325" y="170" width="8" height="45" fill="#D4A574" rx="4" transform="rotate(25 329 170)" />
      </g>

      {/* Head */}
      <circle cx="200" cy="180" r="85" fill="url(#furGrad)" filter="url(#engrave)" />

      {/* Left Ear */}
      <g>
        <ellipse cx="150" cy="90" rx="35" ry="85" fill="url(#furGrad)" filter="url(#engrave)" />
        {/* Inner ear */}
        <ellipse cx="150" cy="100" rx="20" ry="65" fill="#C4915C" />
        {/* Ear fur texture */}
        <ellipse cx="150" cy="70" rx="15" ry="30" fill="#D4A574" opacity="0.6" />
      </g>

      {/* Right Ear */}
      <g>
        <ellipse cx="250" cy="90" rx="35" ry="85" fill="url(#furGrad)" filter="url(#engrave)" />
        {/* Inner ear */}
        <ellipse cx="250" cy="100" rx="20" ry="65" fill="#C4915C" />
        {/* Ear fur texture */}
        <ellipse cx="250" cy="70" rx="15" ry="30" fill="#D4A574" opacity="0.6" />
      </g>

      {/* Snout */}
      <ellipse cx="200" cy="210" rx="50" ry="40" fill="#E8D4C0" />

      {/* Nose */}
      <ellipse cx="200" cy="205" rx="12" ry="15" fill="#8B6F47" />

      {/* Mouth */}
      <path d="M 200 205 Q 190 225 175 220" stroke="#8B6F47" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 200 205 Q 210 225 225 220" stroke="#8B6F47" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Left Eye (behind goggles) */}
      <circle cx="170" cy="165" r="18" fill="#2D2D2D" />
      <circle cx="170" cy="165" r="12" fill="#1a1a1a" />

      {/* Right Eye (behind goggles) */}
      <circle cx="230" cy="165" r="18" fill="#2D2D2D" />
      <circle cx="230" cy="165" r="12" fill="#1a1a1a" />

      {/* Left Goggle */}
      <g>
        <circle cx="170" cy="155" r="32" fill="none" stroke="url(#metalGrad)" strokeWidth="6" />
        {/* Lens */}
        <circle cx="170" cy="155" r="26" fill="rgba(0, 148, 255, 0.3)" opacity="0.8" />
        {/* Lens shine */}
        <circle cx="165" cy="150" r="8" fill="rgba(255, 255, 255, 0.4)" />
      </g>

      {/* Right Goggle */}
      <g>
        <circle cx="230" cy="155" r="32" fill="none" stroke="url(#metalGrad)" strokeWidth="6" />
        {/* Lens */}
        <circle cx="230" cy="155" r="26" fill="rgba(0, 148, 255, 0.3)" opacity="0.8" />
        {/* Lens shine */}
        <circle cx="225" cy="150" r="8" fill="rgba(255, 255, 255, 0.4)" />
      </g>

      {/* Goggle Bridge (metal connector) */}
      <rect x="180" y="148" width="40" height="14" fill="url(#metalGrad)" rx="7" />
      {/* Bridge details */}
      <circle cx="190" cy="155" r="4" fill="#D4AF37" />
      <circle cx="210" cy="155" r="4" fill="#D4AF37" />

      {/* Bandana/Headband */}
      <g>
        {/* Main bandana */}
        <ellipse cx="200" cy="120" rx="95" ry="35" fill="url(#bandanaGrad)" />
        {/* Bandana knot at back */}
        <circle cx="200" cy="115" r="15" fill="#7C3AED" />
        {/* Bandana detail lines */}
        <line x1="150" y1="120" x2="250" y2="120" stroke="#9945FF" strokeWidth="1" opacity="0.6" />
        <line x1="155" y1="135" x2="245" y2="135" stroke="#9945FF" strokeWidth="1" opacity="0.6" />
      </g>

      {/* Cigar in mouth */}
      <g>
        {/* Cigar stick */}
        <rect x="210" y="218" width="55" height="12" fill="#8B4513" rx="6" transform="rotate(15 240 224)" />
        {/* Cigar tip glow */}
        <circle cx="258" cy="208" r="8" fill="#FF6B35" opacity="0.7" filter="url(#engrave)" />
        {/* Cigar smoke suggestion */}
        <path
          d="M 265 200 Q 270 190 265 175 Q 268 160 263 145"
          stroke="rgba(200, 200, 200, 0.3)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 270 198 Q 278 185 275 165 Q 280 150 273 135"
          stroke="rgba(200, 200, 200, 0.2)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Decorative elements - Gears on body (steampunk style) */}
      <g opacity="0.6">
        {/* Left gear */}
        <circle cx="140" cy="280" r="25" fill="none" stroke="url(#metalGrad)" strokeWidth="2" />
        <circle cx="140" cy="280" r="18" fill="none" stroke="url(#metalGrad)" strokeWidth="1" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const x = 140 + 28 * Math.cos(angle);
          const y = 280 + 28 * Math.sin(angle);
          return <rect key={`gear-left-${i}`} x={x - 3} y={y - 8} width="6" height="16" fill="url(#metalGrad)" />;
        })}

        {/* Right gear */}
        <circle cx="260" cy="280" r="25" fill="none" stroke="url(#metalGrad)" strokeWidth="2" />
        <circle cx="260" cy="280" r="18" fill="none" stroke="url(#metalGrad)" strokeWidth="1" />
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const x = 260 + 28 * Math.cos(angle);
          const y = 280 + 28 * Math.sin(angle);
          return <rect key={`gear-right-${i}`} x={x - 3} y={y - 8} width="6" height="16" fill="url(#metalGrad)" />;
        })}
      </g>

      {/* Confidence aura (purple glow) */}
      <circle cx="200" cy="250" r="140" fill="none" stroke="url(#bandanaGrad)" strokeWidth="2" opacity="0.3" />
      <circle cx="200" cy="250" r="155" fill="none" stroke="url(#bandanaGrad)" strokeWidth="1" opacity="0.15" />

      {/* Decorative flowers/nature elements (small) */}
      <g opacity="0.5">
        {/* Left flower */}
        <circle cx="80" cy="300" r="4" fill="#FF69B4" />
        <circle cx="75" cy="295" r="3" fill="#FF69B4" />
        <circle cx="85" cy="295" r="3" fill="#FF69B4" />
        <circle cx="75" cy="305" r="3" fill="#FF69B4" />
        <circle cx="85" cy="305" r="3" fill="#FF69B4" />

        {/* Right flower */}
        <circle cx="320" cy="300" r="4" fill="#FF69B4" />
        <circle cx="315" cy="295" r="3" fill="#FF69B4" />
        <circle cx="325" cy="295" r="3" fill="#FF69B4" />
        <circle cx="315" cy="305" r="3" fill="#FF69B4" />
        <circle cx="325" cy="305" r="3" fill="#FF69B4" />
      </g>
    </svg>
  );
};

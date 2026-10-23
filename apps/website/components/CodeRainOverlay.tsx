'use client';

const glyphs = [
  '0 1 W² 0 1', '1 0 1 1 0', 'W² 0 1 0', '1 0 W² 1',
  '0 0 1 W²', '1 W² 0 1', '0 1 1 0', 'W² 1 0 0',
  '1 0 1 W²', '0 W² 1 0', '1 1 0 0', 'W² 0 0 1',
  '0 1 W² 1', '1 0 0 1', 'W² 1 1 0', '0 0 W² 1',
];

export function CodeRainOverlay() {
  return <div aria-hidden="true" className="wise2-code-rain pointer-events-none fixed inset-0 z-20 overflow-hidden">
    {glyphs.map((glyph, i) => <span key={i} style={{
      left: `${(i + .5) * (100 / glyphs.length)}%`,
      animationDelay: `-${(i * 1.63) % 17}s`,
      animationDuration: `${14 + (i % 5) * 2}s`
    }}>{glyph.split(' ').map((symbol, j) => <b key={j}>{symbol}</b>)}</span>)}
  </div>;
}

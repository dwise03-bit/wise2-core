'use client';

import styles from './trader-3d.module.css';

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

const CandlestickChart = () => {
  // 20 periods of OHLC data for NVDA
  const candles: Candle[] = [
    { open: 218.5, high: 220.2, low: 217.8, close: 219.5, volume: 42 },
    { open: 219.5, high: 221.8, low: 219.2, close: 221.2, volume: 38 },
    { open: 221.2, high: 222.5, low: 220.8, close: 221.9, volume: 35 },
    { open: 221.9, high: 224.1, low: 221.5, close: 223.8, volume: 44 },
    { open: 223.8, high: 225.4, low: 223.2, close: 224.9, volume: 48 },
    { open: 224.9, high: 226.2, low: 224.5, close: 225.7, volume: 41 },
    { open: 225.7, high: 227.1, low: 225.3, close: 226.5, volume: 46 },
    { open: 226.5, high: 228.3, low: 226.1, close: 227.8, volume: 51 },
    { open: 227.8, high: 229.2, low: 227.2, close: 228.6, volume: 45 },
    { open: 228.6, high: 230.1, low: 228.0, close: 229.4, volume: 50 },
    { open: 229.4, high: 231.2, low: 229.0, close: 230.8, volume: 53 },
    { open: 230.8, high: 232.5, low: 230.3, close: 231.9, volume: 47 },
    { open: 231.9, high: 233.8, low: 231.4, close: 233.2, volume: 52 },
    { open: 233.2, high: 235.1, low: 232.8, close: 234.6, volume: 55 },
    { open: 234.6, high: 236.4, low: 234.1, close: 235.8, volume: 49 },
    { open: 235.8, high: 237.2, low: 235.2, close: 236.5, volume: 44 },
    { open: 236.5, high: 238.9, low: 236.0, close: 238.2, volume: 58 },
    { open: 238.2, high: 240.1, low: 237.7, close: 239.5, volume: 62 },
    { open: 239.5, high: 241.8, low: 239.0, close: 241.2, volume: 65 },
    { open: 241.2, high: 243.5, low: 240.6, close: 242.8, volume: 68 }
  ];

  // Calculate min/max for scaling
  const allPrices = candles.flatMap(c => [c.high, c.low]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice;
  const maxVolume = Math.max(...candles.map(c => c.volume));

  // Scale functions
  const scalePrice = (price: number) => {
    const pct = (price - minPrice) / priceRange;
    return 320 - pct * 280; // Invert Y (higher price = higher on screen)
  };

  const candleWidth = 100 / candles.length * 0.7;
  const candleSpacing = 100 / candles.length * 0.3;

  return (
    <div className={styles.chartContainer} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Main candlestick SVG */}
      <svg
        viewBox="0 0 800 360"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="volumeGrad" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#00ff7f" stopOpacity="0.2" />
            <stop offset="1" stopColor="#00ff7f" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Volume bars (background) */}
        <g opacity="0.15">
          {candles.map((candle, i) => {
            const x = (i + 0.5) * (800 / candles.length);
            const height = (candle.volume / maxVolume) * 80;
            return (
              <rect
                key={`vol-${i}`}
                x={x - 8}
                y={320 - height}
                width="16"
                height={height}
                fill={candle.close >= candle.open ? '#00ff7f' : '#ff3b7f'}
                opacity="0.3"
              />
            );
          })}
        </g>

        {/* Candlesticks */}
        {candles.map((candle, i) => {
          const x = (i + 0.5) * (800 / candles.length);
          const isUp = candle.close >= candle.open;
          const color = isUp ? '#00ff7f' : '#ff3b7f';
          const gloColor = isUp ? 'rgba(0, 255, 127, 0.5)' : 'rgba(255, 59, 127, 0.5)';

          const highY = scalePrice(candle.high);
          const lowY = scalePrice(candle.low);
          const openY = scalePrice(candle.open);
          const closeY = scalePrice(candle.close);

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(closeY - openY);
          const bodyHeightAdjusted = Math.max(bodyHeight, 2); // Min height for visibility

          return (
            <g key={`candle-${i}`} filter="url(#glow)">
              {/* Wick (high-low line) */}
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={color}
                strokeWidth="1.2"
                opacity="0.7"
              />

              {/* Body (open-close rectangle) */}
              <rect
                x={x - 6}
                y={bodyTop}
                width="12"
                height={bodyHeightAdjusted}
                fill={color}
                stroke={color}
                strokeWidth="1"
                opacity="0.85"
                rx="1"
              />

              {/* Glow effect on up candles */}
              {isUp && (
                <rect
                  x={x - 6}
                  y={bodyTop}
                  width="12"
                  height={bodyHeightAdjusted}
                  fill="none"
                  stroke={gloColor}
                  strokeWidth="2.5"
                  opacity="0.4"
                  rx="1"
                />
              )}
            </g>
          );
        })}

        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = (i + 1) * (320 / 5);
          const priceAtLine = maxPrice - (i + 1) * (priceRange / 5);
          return (
            <g key={`grid-${i}`}>
              <line
                x1="0"
                y1={y}
                x2="800"
                y2={y}
                stroke="#0ce3ff"
                strokeWidth="0.5"
                opacity="0.08"
                strokeDasharray="4,4"
              />
              <text
                x="785"
                y={y - 4}
                textAnchor="end"
                fontSize="10"
                fill="#7a9fb5"
                opacity="0.6"
              >
                ${priceAtLine.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Current price line (last candle close) */}
        <line
          x1="0"
          y1={scalePrice(candles[candles.length - 1].close)}
          x2="800"
          y2={scalePrice(candles[candles.length - 1].close)}
          stroke="#00D9FF"
          strokeWidth="2"
          opacity="0.3"
          strokeDasharray="6,3"
        />
      </svg>

      {/* Key levels labels */}
      <span
        className={styles.label3d}
        style={{
          right: 16,
          top: '20%',
          background: 'rgba(255, 59, 127, 0.85)',
          borderColor: 'rgba(255, 59, 127, 0.5)'
        }}
      >
        RESISTANCE $228.50
      </span>
      <span
        className={styles.label3d}
        style={{
          right: 70,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 215, 0, 0.85)',
          borderColor: 'rgba(255, 215, 0, 0.5)'
        }}
      >
        ENTRY $223–$224
      </span>
      <span
        className={styles.label3d}
        style={{
          right: 25,
          bottom: '8%',
          background: 'rgba(0, 255, 127, 0.85)',
          borderColor: 'rgba(0, 255, 127, 0.5)'
        }}
      >
        SUPPORT $220.50
      </span>

      {/* Current price indicator */}
      <div
        style={{
          position: 'absolute',
          top: scalePrice(candles[candles.length - 1].close) + '%',
          right: 12,
          background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.9), rgba(0, 255, 127, 0.3))',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#00D9FF',
          border: '1px solid rgba(0, 217, 255, 0.5)',
          whiteSpace: 'nowrap',
          zIndex: 10
        }}
      >
        242.80
      </div>
    </div>
  );
};

export default CandlestickChart;

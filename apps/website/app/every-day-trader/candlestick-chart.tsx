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

  // Analyze trend
  const upCount = candles.filter((_, i) => i > 0 && candles[i].close > candles[i-1].close).length;
  const trendStrength = Math.round((upCount / (candles.length - 1)) * 100);
  const trendLabel = trendStrength > 70 ? '🚀 STRONG UPTREND' : trendStrength > 50 ? '📈 UPTREND' : '➡️ NEUTRAL';

  // Scale functions
  const scalePrice = (price: number) => {
    const pct = (price - minPrice) / priceRange;
    return 280 - pct * 240; // Invert Y
  };

  // Get candle color and analysis
  const getCandleInfo = (candle: Candle, idx: number, prev?: Candle) => {
    const isUp = candle.close >= candle.open;
    const color = isUp ? '#00ff7f' : '#ff3b7f';

    let pattern = '';
    if (idx > 0 && prev) {
      if (isUp && candle.close > prev.close) pattern = 'Higher';
      if (!isUp && candle.close < prev.close) pattern = 'Lower';
    }

    const bodySize = Math.abs(candle.close - candle.open);
    const range = candle.high - candle.low;
    const wickUpper = candle.high - Math.max(candle.open, candle.close);
    const wickLower = Math.min(candle.open, candle.close) - candle.low;

    let signal = '';
    if (bodySize < range * 0.3) signal = '⚠️ Indecision';
    else if (wickUpper > bodySize) signal = '📉 Rejection Up';
    else if (wickLower > bodySize) signal = '📈 Rejection Down';

    return { isUp, color, pattern, bodySize, signal };
  };

  const lastCandle = candles[candles.length - 1];
  const priceChange = lastCandle.close - candles[0].open;
  const priceChangePercent = ((priceChange / candles[0].open) * 100).toFixed(2);

  return (
    <div className={styles.chartContainer} style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Educational Legend */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0, 217, 255, 0.1)',
        border: '1px solid rgba(0, 217, 255, 0.3)',
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '11px',
        zIndex: 10,
        color: '#aec4de',
        backdropFilter: 'blur(8px)'
      }}>
        <div style={{color: '#00ff7f', fontWeight: 700}}>🟢 GREEN = Price UP (Bullish)</div>
        <div style={{color: '#ff3b7f', fontWeight: 700}}>🔴 RED = Price DOWN (Bearish)</div>
        <div style={{color: '#00D9FF', marginTop: '4px'}}>Line = High/Low Range</div>
        <div style={{color: '#00D9FF'}}>Box = Open/Close Range</div>
      </div>

      {/* Trend Analysis Badge */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: trendStrength > 70 ? 'rgba(0, 255, 127, 0.15)' : 'rgba(0, 217, 255, 0.15)',
        border: `1px solid ${trendStrength > 70 ? 'rgba(0, 255, 127, 0.3)' : 'rgba(0, 217, 255, 0.3)'}`,
        borderRadius: '8px',
        padding: '8px 12px',
        fontSize: '12px',
        fontWeight: 700,
        zIndex: 10,
        color: trendStrength > 70 ? '#00ff7f' : '#00D9FF',
        textAlign: 'center',
        backdropFilter: 'blur(8px)'
      }}>
        <div>{trendLabel}</div>
        <div style={{fontSize: '10px', marginTop: '2px'}}>{trendStrength}% Up Candles</div>
      </div>

      {/* Main SVG Chart */}
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
        </defs>

        {/* Volume Bars (background) */}
        <g opacity="0.08">
          {candles.map((candle, i) => {
            const x = (i + 0.5) * (800 / candles.length);
            const height = (candle.volume / maxVolume) * 60;
            return (
              <rect
                key={`vol-${i}`}
                x={x - 8}
                y={310 - height}
                width="16"
                height={height}
                fill="#00ff7f"
              />
            );
          })}
        </g>

        {/* Grid Lines with Labels */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = (i + 1) * (240 / 5) + 40;
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
                opacity="0.5"
              >
                ${priceAtLine.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Candlesticks with Tooltips */}
        {candles.map((candle, i) => {
          const prev = i > 0 ? candles[i - 1] : undefined;
          const { isUp, color, pattern, bodySize, signal } = getCandleInfo(candle, i, prev);

          const x = (i + 0.5) * (800 / candles.length);
          const highY = scalePrice(candle.high);
          const lowY = scalePrice(candle.low);
          const openY = scalePrice(candle.open);
          const closeY = scalePrice(candle.close);

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

          return (
            <g key={`candle-${i}`} filter="url(#glow)" style={{ cursor: 'pointer' }}>
              {/* Wick */}
              <line
                x1={x}
                y1={highY}
                x2={x}
                y2={lowY}
                stroke={color}
                strokeWidth="1.5"
                opacity="0.8"
              />

              {/* Body */}
              <rect
                x={x - 6}
                y={bodyTop}
                width="12"
                height={bodyHeight}
                fill={color}
                stroke={color}
                strokeWidth="1"
                opacity="0.9"
                rx="1"
              />

              {/* Glow on up candles */}
              {isUp && (
                <rect
                  x={x - 6}
                  y={bodyTop}
                  width="12"
                  height={bodyHeight}
                  fill="none"
                  stroke="#00ff7f"
                  strokeWidth="2.5"
                  opacity="0.3"
                  rx="1"
                />
              )}

              {/* Signal Indicator Dot */}
              {signal && (
                <circle
                  cx={x}
                  cy={bodyTop - 15}
                  r="4"
                  fill={signal.includes('Indecision') ? '#FFD700' : signal.includes('Rejection Up') ? '#ff3b7f' : '#00ff7f'}
                  opacity="0.6"
                />
              )}
            </g>
          );
        })}

        {/* Price Trend Line */}
        <polyline
          points={candles.map((c, i) => `${(i + 0.5) * (800 / candles.length)},${scalePrice(c.close)}`).join(' ')}
          fill="none"
          stroke="#00D9FF"
          strokeWidth="1.5"
          opacity="0.3"
          strokeDasharray="5,5"
        />

        {/* Current Price Marker */}
        <circle
          cx={(candles.length - 0.5) * (800 / candles.length)}
          cy={scalePrice(lastCandle.close)}
          r="5"
          fill="none"
          stroke="#00D9FF"
          strokeWidth="2"
          opacity="0.6"
        />
      </svg>

      {/* Analysis Panel */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'rgba(0, 217, 255, 0.08)',
        border: '1px solid rgba(0, 217, 255, 0.2)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '12px',
        zIndex: 10,
        maxWidth: '280px',
        backdropFilter: 'blur(8px)',
        color: '#aec4de'
      }}>
        <div style={{marginBottom: '6px', fontWeight: 700, color: '#00D9FF'}}>📊 Price Action Summary:</div>
        <div>• Price: ${lastCandle.close.toFixed(2)}</div>
        <div>• Change: {priceChangePercent}% {parseFloat(priceChangePercent) > 0 ? '📈' : '📉'}</div>
        <div>• Range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</div>
        <div>• Candles Up: {candles.filter((c, i) => i === 0 || c.close >= candles[i-1].close).length}/{candles.length}</div>
        <div style={{marginTop: '6px', fontSize: '11px', color: '#00ff7f', fontStyle: 'italic'}}>
          ✓ Strong uptrend confirmed by price action
        </div>
      </div>

      {/* Key Levels with Smart Labels */}
      <span
        className={styles.label3d}
        style={{
          right: 16,
          top: '20%',
          background: 'rgba(255, 59, 127, 0.85)',
          borderColor: 'rgba(255, 59, 127, 0.5)',
          fontSize: '11px'
        }}
      >
        🎯 RESISTANCE<br/><strong>$228.50</strong>
      </span>
      <span
        className={styles.label3d}
        style={{
          right: 70,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255, 215, 0, 0.85)',
          borderColor: 'rgba(255, 215, 0, 0.5)',
          fontSize: '11px'
        }}
      >
        📍 BUY ZONE<br/><strong>$223-$224</strong>
      </span>
      <span
        className={styles.label3d}
        style={{
          right: 25,
          bottom: '8%',
          background: 'rgba(0, 255, 127, 0.85)',
          borderColor: 'rgba(0, 255, 127, 0.5)',
          fontSize: '11px'
        }}
      >
        🛡️ SUPPORT<br/><strong>$220.50</strong>
      </span>
    </div>
  );
};

export default CandlestickChart;

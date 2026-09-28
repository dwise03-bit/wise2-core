'use client';

import { useMemo } from 'react';

interface MarketChartProps {
  symbol: string;
  data: Array<{
    time: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
}

export default function MarketChart({ symbol, data }: MarketChartProps) {
  const { candlePositions, minPrice, maxPrice, maxVolume, chartWidth, candleWidth } = useMemo(() => {
    if (!data || data.length === 0) {
      return { candlePositions: [], minPrice: 0, maxPrice: 1, maxVolume: 1, chartWidth: 0, candleWidth: 0 };
    }

    const prices = data.flatMap(d => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const chartWidth = 800;
    const candleWidth = Math.max(3, Math.floor((chartWidth - 40) / data.length));
    const spacing = Math.floor((chartWidth - 40) / data.length);

    const maxVolume = Math.max(...data.map(d => d.volume || 0), 1);
    const positions = data.map((candle, i) => {
      const x = 20 + i * spacing + spacing / 2;
      const highY = 35 + (1 - (candle.high - min) / range) * 335;
      const lowY = 35 + (1 - (candle.low - min) / range) * 335;
      const openY = 35 + (1 - (candle.open - min) / range) * 335;
      const closeY = 35 + (1 - (candle.close - min) / range) * 335;

      return { x, highY, lowY, openY, closeY, candle };
    });

    return {
      candlePositions: positions,
      minPrice: min,
      maxPrice: max,
      maxVolume,
      chartWidth,
      candleWidth,
    };
  }, [data]);

  return (
    <div className="w-full bg-[#07101f] rounded-xl border border-cyan-400/25 p-4 shadow-[inset_0_1px_rgba(255,255,255,.08),0_0_35px_rgba(0,217,255,.08)]">
      <svg viewBox="0 0 840 500" className="w-full h-full" style={{ minHeight: '300px' }}>
        <defs>
          <linearGradient id="chart-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#102642" /><stop offset="1" stopColor="#030812" /></linearGradient>
          <filter id="candle-glow"><feGaussianBlur stdDeviation="2.2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <rect x="0" y="0" width="840" height="500" rx="12" fill="url(#chart-bg)" />
        <rect x="20" y="35" width="800" height="335" fill="rgba(0,0,0,.12)" />
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <g key={`grid-${i}`}>
            <line
              x1="20"
              y1={35 + i * 83.75}
              x2="820"
              y2={35 + i * 83.75}
              stroke="rgba(0, 217, 255, 0.1)"
              strokeDasharray="4"
              strokeWidth="1"
            />
            <text
              x="10"
              y={40 + i * 83.75}
              fontSize="12"
              fill="rgba(107, 114, 128, 0.8)"
              textAnchor="end"
            >
              ${(maxPrice - (maxPrice - minPrice) * (i / 4)).toFixed(0)}
            </text>
          </g>
        ))}

        {/* Candlesticks */}
        {candlePositions.map((pos, i) => {
          const isUp = pos.candle.close >= pos.candle.open;
          const bodyTop = Math.min(pos.openY, pos.closeY);
          const bodyHeight = Math.abs(pos.closeY - pos.openY) || 1;
          const wickX = pos.x;

          return (
            <g key={`candle-${i}`}>
              {/* Wick */}
              <line
                x1={wickX}
                y1={pos.highY}
                x2={wickX}
                y2={pos.lowY}
                stroke={isUp ? '#00ff7f' : '#ff2563'}
                strokeWidth={Math.max(1.5, candleWidth / 5)}
                opacity="0.95"
                filter="url(#candle-glow)"
              />
              {/* Body */}
              <rect
                x={wickX - candleWidth / 2}
                y={bodyTop}
                width={Math.max(5, candleWidth - 2)}
                height={bodyHeight}
                fill={isUp ? '#00ff7f' : '#ff2563'}
                opacity={isUp ? 0.92 : 0.88}
              />
              {/* Body border */}
              <rect
                x={wickX - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill="none"
                stroke={isUp ? '#00ff7f' : '#ff2563'}
                strokeWidth="1"
                opacity="0.9"
              />
              <rect x={wickX - candleWidth / 2} y={380 - ((pos.candle.volume || 0) / maxVolume) * 70} width={Math.max(5, candleWidth - 2)} height={((pos.candle.volume || 0) / maxVolume) * 70} fill={isUp ? '#00d9ff' : '#ff4d88'} opacity=".34" rx="2" />
            </g>
          );
        })}

        {/* X-axis */}
        <line x1="20" y1="370" x2="820" y2="370" stroke="rgba(84, 216, 255, 0.35)" strokeWidth="1" />
        <text x="25" y="395" fontSize="10" fill="rgba(148, 197, 224, .65)">VOLUME</text>

        {/* Labels */}
        {candlePositions.length > 0 && (
          <>
            <text x="820" y="435" fontSize="12" fill="rgba(148, 197, 224, .8)" textAnchor="end">
              Now
            </text>
            <text x="20" y="435" fontSize="12" fill="rgba(148, 197, 224, .8)">
              {candlePositions.length}h ago
            </text>
          </>
        )}
      </svg>

      {/* Stats below chart */}
      <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
        <div>
          <p className="text-slate-400 text-xs">High</p>
          <p className="font-bold text-cyan-100">${maxPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Low</p>
          <p className="font-bold text-cyan-100">${minPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Open</p>
          <p className="font-bold text-cyan-100">${data[0]?.open.toFixed(2) || '—'}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">Close</p>
          <p className="font-bold text-cyan-100">
            ${data[data.length - 1]?.close.toFixed(2) || '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

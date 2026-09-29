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
  const { candlePositions, minPrice, maxPrice, chartWidth, candleWidth } = useMemo(() => {
    if (!data || data.length === 0) {
      return { candlePositions: [], minPrice: 0, maxPrice: 1, chartWidth: 0, candleWidth: 0 };
    }

    const prices = data.flatMap(d => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;

    const chartWidth = 800;
    const candleWidth = Math.max(3, Math.floor((chartWidth - 40) / data.length));
    const spacing = Math.floor((chartWidth - 40) / data.length);

    const positions = data.map((candle, i) => {
      const x = 20 + i * spacing + spacing / 2;
      const highY = 450 - ((candle.high - min) / range) * 400;
      const lowY = 450 - ((candle.low - min) / range) * 400;
      const openY = 450 - ((candle.open - min) / range) * 400;
      const closeY = 450 - ((candle.close - min) / range) * 400;

      return { x, highY, lowY, openY, closeY, candle };
    });

    return {
      candlePositions: positions,
      minPrice: min,
      maxPrice: max,
      chartWidth,
      candleWidth,
    };
  }, [data]);

  return (
    <div className="w-full bg-[#0f0f23] rounded-lg border border-cyan-500/20 p-4">
      <svg viewBox="0 0 840 500" className="w-full h-full" style={{ minHeight: '300px' }}>
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
          <g key={`grid-${i}`}>
            <line
              x1="20"
              y1={50 + i * 100}
              x2="820"
              y2={50 + i * 100}
              stroke="rgba(0, 217, 255, 0.1)"
              strokeDasharray="4"
              strokeWidth="1"
            />
            <text
              x="10"
              y={55 + i * 100}
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
                strokeWidth="1"
                opacity="0.8"
              />
              {/* Body */}
              <rect
                x={wickX - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill={isUp ? '#00ff7f' : '#ff2563'}
                opacity={isUp ? 0.7 : 0.7}
              />
              {/* Body border */}
              <rect
                x={wickX - candleWidth / 2}
                y={bodyTop}
                width={candleWidth}
                height={bodyHeight}
                fill="none"
                stroke={isUp ? '#00ff7f' : '#ff2563'}
                strokeWidth="0.5"
                opacity="0.5"
              />
            </g>
          );
        })}

        {/* X-axis */}
        <line x1="20" y1="450" x2="820" y2="450" stroke="rgba(107, 114, 128, 0.3)" strokeWidth="1" />

        {/* Labels */}
        {candlePositions.length > 0 && (
          <>
            <text x="820" y="470" fontSize="12" fill="rgba(107, 114, 128, 0.8)" textAnchor="end">
              Now
            </text>
            <text x="20" y="470" fontSize="12" fill="rgba(107, 114, 128, 0.8)">
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

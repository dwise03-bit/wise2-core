'use client';

import { useEffect, useRef, useState } from 'react';

interface OHLC {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export default function TradingViewChart({ symbol, data }: { symbol: string; data: OHLC[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !containerRef.current || !data.length) return;

    // Dynamically import lightweight-charts on client side only
    import('lightweight-charts').then(({ createChart, ColorType }) => {
      if (!containerRef.current) return;

      try {
        const chart = createChart(containerRef.current, {
          layout: {
            background: { type: ColorType.Solid, color: '#070812' },
            textColor: '#d1d5db',
          },
          width: containerRef.current.clientWidth,
          height: 400,
          timeScale: {
            timeVisible: true,
            secondsVisible: false,
          },
        });

        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#10b981',
          downColor: '#ef4444',
          borderUpColor: '#10b981',
          borderDownColor: '#ef4444',
          wickUpColor: '#10b981',
          wickDownColor: '#ef4444',
        });

        // Format data for lightweight-charts
        const formattedData = data.map(candle => ({
          time: typeof candle.time === 'string'
            ? Math.floor(new Date(candle.time).getTime() / 1000)
            : candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        candlestickSeries.setData(formattedData);
        chart.timeScale().fitContent();

        const handleResize = () => {
          if (containerRef.current) {
            chart.applyOptions({ width: containerRef.current.clientWidth });
          }
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      } catch (error) {
        console.error('Chart initialization error:', error);
      }
    }).catch(err => console.error('Failed to load lightweight-charts:', err));
  }, [data, isReady]);

  return <div ref={containerRef} style={{ width: '100%', height: '400px' }} />;
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CandlestickSeries,
  ColorType,
  HistogramSeries,
  LineSeries,
  LineStyle,
  createChart,
  type IChartApi,
  type IPriceLine,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import { Headphones, Menu, Minus, MousePointer2, PenLine, Ruler, Type } from 'lucide-react';
import styles from './ChartWorkspace.module.css';
import {
  INSTRUMENTS,
  accountMetrics,
  applyFill,
  buildCandles,
  buildPlan,
  emptyBook,
  nudgeLast,
  readTape,
  type Candle,
  type IntervalId,
  type PaperBook,
  type Side,
  type SymbolId,
} from './chart-desk-model';

const INTERVALS: IntervalId[] = ['1m', '5m', '15m', '1H', '4H', 'D'];
const STEP: Record<IntervalId, number> = { '1m': 60, '5m': 300, '15m': 900, '1H': 3600, '4H': 14400, D: 86400 };
const ORIGIN = 1_732_000_000;

interface PlotContext {
  symbol: string;
  lastPrice: number;
  change: number;
  regime: string;
  setups: number;
}

interface ChartWorkspaceProps {
  accountLabel: string;
  onOpenMenu: () => void;
  // eslint-disable-next-line no-unused-vars
  onOpenPlot: (context: PlotContext) => void;
}

interface Bar extends Candle {
  time: UTCTimestamp;
}

const ROOMS = [
  { id: 'host', name: 'Summerof88', live: true, tone: 'host', note: 'Host desk. The chart on this screen is the MNQ tape.' },
  { id: 'nyce', name: 'nyceone31', live: true, tone: 'dark', note: 'nyceone31 is in the room.' },
  { id: 'cam', name: 'Summerof88', live: true, tone: 'cam', note: 'Second camera on the host.' },
  { id: 'bro', name: 'broman27', live: false, tone: 'gray', note: 'broman27 is on the desk.' },
  { id: 'kevin', name: 'Kevin tucker', live: true, tone: 'green', note: 'Kevin tucker is on the green cam.' },
  { id: 'only', name: 'Theonly1', live: true, tone: 'night', note: 'Theonly1 is in the room.' },
];

function money(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function px(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function stamp(candles: Candle[], interval: IntervalId): Bar[] {
  const step = STEP[interval];
  const start = ORIGIN - candles.length * step;
  return candles.map((candle, index) => ({ ...candle, time: (start + index * step) as UTCTimestamp }));
}

function movingAverage(candles: Bar[], period = 20): Array<{ time: UTCTimestamp; value: number }> {
  const weight = 2 / (period + 1);
  let previous = candles[0]?.c ?? 0;
  return candles.map((candle) => {
    previous = candle.c * weight + previous * (1 - weight);
    return { time: candle.time, value: previous };
  });
}

function roundLevels(low: number, high: number): number[] {
  const span = high - low;
  const step = span > 800 ? 200 : span > 200 ? 100 : 20;
  const levels: number[] = [];
  for (let price = Math.ceil(low / step) * step; price < high; price += step) levels.push(price);
  return levels.slice(0, 6);
}

export default function ChartWorkspace({ accountLabel, onOpenMenu, onOpenPlot }: ChartWorkspaceProps) {
  const [symbol, setSymbol] = useState<SymbolId>('MNQ');
  const [interval, setIntervalId] = useState<IntervalId>('15m');
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [indicatorOpen, setIndicatorOpen] = useState(false);
  const [overlays, setOverlays] = useState({ ma: true, volume: true, levels: true });
  const [tool, setTool] = useState('cursor');
  const [books, setBooks] = useState<Record<SymbolId, PaperBook>>({
    MNQ: emptyBook(), NQ: emptyBook(), MES: emptyBook(), ES: emptyBook(),
  });
  const [pendingSide, setPendingSide] = useState<Side | null>(null);
  const [replayTo, setReplayTo] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState(0);
  const [alertOn, setAlertOn] = useState(false);
  const [locked, setLocked] = useState(false);
  const [contestOpen, setContestOpen] = useState(false);
  const [voice, setVoice] = useState('host');

  const hostRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const maRef = useRef<ISeriesApi<'Line'> | null>(null);
  const linesRef = useRef<IPriceLine[]>([]);
  const readyRef = useRef(false);
  const [chartEpoch, setChartEpoch] = useState(0);

  const instrument = INSTRUMENTS[symbol];
  const base = useMemo(() => buildCandles(instrument, interval), [instrument, interval]);
  const sliced = replayTo == null ? base : base.slice(0, Math.max(12, replayTo));
  const shaped = replayTo == null ? nudgeLast(sliced, tick, instrument.tick) : sliced;
  const bars = useMemo(() => stamp(shaped, interval), [shaped, interval]);
  const tape = useMemo(() => readTape(bars, instrument.tick), [bars, instrument.tick]);
  const plan = useMemo(() => buildPlan(tape, instrument.pointValue), [tape, instrument.pointValue]);
  const book = books[symbol];
  const last = bars[bars.length - 1];
  const metrics = accountMetrics(book, last?.c ?? instrument.start, instrument);
  const shelfTagged = (last?.c ?? instrument.start) <= tape.liquidity;
  const dataKey = `${chartEpoch}|${symbol}|${interval}|${replayTo ?? 'live'}|${overlays.ma}|${overlays.volume}|${overlays.levels}`;

  useEffect(() => {
    setReplayTo(null);
    setPlaying(false);
    setPendingSide(null);
    setTick(0);
  }, [symbol, interval]);

  useEffect(() => {
    if (replayTo != null) return undefined;
    const id = window.setInterval(() => setTick((value) => value + 1), 1800);
    return () => window.clearInterval(id);
  }, [replayTo, symbol, interval]);

  useEffect(() => {
    if (!playing || replayTo == null) return undefined;
    if (replayTo >= base.length) {
      setPlaying(false);
      setReplayTo(null);
      return undefined;
    }
    const id = window.setInterval(() => {
      setReplayTo((value) => (value == null ? value : Math.min(base.length, value + 1)));
    }, 140);
    return () => window.clearInterval(id);
  }, [playing, replayTo, base.length]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const chart = createChart(host, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: '#131722' },
        textColor: '#d1d4dc',
        fontFamily: '-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif',
        fontSize: 12,
      },
      grid: { vertLines: { color: '#1e222d' }, horzLines: { color: '#1e222d' } },
      rightPriceScale: { borderColor: '#2a2e39' },
      timeScale: { borderColor: '#2a2e39', timeVisible: true, secondsVisible: false },
      crosshair: {
        vertLine: { color: '#758696', labelBackgroundColor: '#363a45' },
        horzLine: { color: '#758696', labelBackgroundColor: '#363a45' },
      },
    });
    const candles = chart.addSeries(CandlestickSeries, {
      upColor: '#089981',
      downColor: '#f23645',
      borderUpColor: '#089981',
      borderDownColor: '#f23645',
      wickUpColor: '#089981',
      wickDownColor: '#f23645',
      priceLineColor: '#f23645',
    });
    const volume = chart.addSeries(HistogramSeries, {
      priceScaleId: 'volume',
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const average = chart.addSeries(LineSeries, {
      color: '#2962ff',
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    candles.priceScale().applyOptions({ scaleMargins: { top: 0.08, bottom: 0.22 } });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    chartRef.current = chart;
    candleRef.current = candles;
    volumeRef.current = volume;
    maRef.current = average;
    readyRef.current = false;
    setChartEpoch((value) => value + 1);
    return () => {
      readyRef.current = false;
      linesRef.current = [];
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    const candles = candleRef.current;
    const volume = volumeRef.current;
    const average = maRef.current;
    const chart = chartRef.current;
    if (!candles || !volume || !average || !chart || bars.length === 0) return;
    candles.setData(bars.map((bar) => ({ time: bar.time, open: bar.o, high: bar.h, low: bar.l, close: bar.c })));
    volume.setData(overlays.volume ? bars.map((bar) => ({
      time: bar.time,
      value: bar.v,
      color: bar.c >= bar.o ? 'rgba(8, 153, 129, 0.7)' : 'rgba(242, 54, 69, 0.75)',
    })) : []);
    average.setData(overlays.ma ? movingAverage(bars) : []);
    linesRef.current.forEach((line) => candles.removePriceLine(line));
    linesRef.current = [];
    if (overlays.levels) {
      const low = Math.min(...bars.map((bar) => bar.l));
      const high = Math.max(...bars.map((bar) => bar.h));
      roundLevels(low, high).forEach((price) => {
        linesRef.current.push(candles.createPriceLine({
          price, color: '#2962ff', lineWidth: 1, axisLabelVisible: true, title: '',
        }));
      });
      linesRef.current.push(candles.createPriceLine({
        price: tape.vwap, color: '#00d9ff', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'VWAP',
      }));
      linesRef.current.push(candles.createPriceLine({
        price: tape.liquidity, color: '#f2c14e', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'Shelf',
      }));
    }
    chart.timeScale().fitContent();
    readyRef.current = true;
  }, [dataKey]);

  useEffect(() => {
    if (!readyRef.current || replayTo != null || !last) return;
    candleRef.current?.update({ time: last.time, open: last.o, high: last.h, low: last.l, close: last.c });
    if (overlays.volume) {
      volumeRef.current?.update({
        time: last.time,
        value: last.v,
        color: last.c >= last.o ? 'rgba(8, 153, 129, 0.7)' : 'rgba(242, 54, 69, 0.75)',
      });
    }
    candleRef.current?.applyOptions({ priceLineColor: last.c >= last.o ? '#089981' : '#f23645' });
  }, [tick, last, overlays.volume, replayTo]);

  const fill = (side: Side) => {
    if (locked || !last) return;
    setBooks((current) => ({
      ...current,
      [symbol]: applyFill(current[symbol], side, 1, last.c, instrument.pointValue),
    }));
    setPendingSide(null);
  };

  const chooseSide = (side: Side) => {
    if (locked) return;
    if (pendingSide === side) fill(side);
    else setPendingSide(side);
  };

  const flatten = () => {
    if (!book.position || !last) return;
    const side: Side = book.position.side === 'buy' ? 'sell' : 'buy';
    setBooks((current) => ({
      ...current,
      [symbol]: applyFill(current[symbol], side, book.position!.qty, last.c, instrument.pointValue),
    }));
    setPendingSide(null);
  };

  const openPlot = () => {
    if (!last) return;
    onOpenPlot({
      symbol: instrument.code,
      lastPrice: last.c,
      change: tape.changePercent,
      regime: tape.regime,
      setups: plan.action === 'stand_aside' ? 0 : 1,
    });
  };

  const room = ROOMS.find((item) => item.id === voice) ?? ROOMS[0];
  const headline = book.position
    ? `${book.position.side === 'buy' ? 'Long' : 'Short'} ${book.position.qty} @ ${px(book.position.avg)}`
    : 'Make a trade to get started';

  return (
    <section className={styles.desk} data-testid="chart-desk" aria-label="Paper chart desk">
      <header className={styles.toolbar}>
        <button type="button" className={styles.iconBtn} onClick={onOpenMenu} aria-label="Open navigation"><Menu size={16} /></button>
        <div style={{ position: 'relative' }}>
          <button type="button" className={styles.symbol} onClick={() => { setSymbolOpen((open) => !open); setIndicatorOpen(false); }}>
            <i />{instrument.code}
          </button>
          {symbolOpen && (
            <div className={styles.popover}>
              {Object.values(INSTRUMENTS).map((item) => (
                <button key={item.symbol} type="button" data-active={item.symbol === symbol} onClick={() => { setSymbol(item.symbol); setSymbolOpen(false); }}>
                  {item.code} · {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.intervals}>
          {INTERVALS.map((item) => (
            <button key={item} type="button" className={styles.textBtn} data-active={item === interval} data-testid={`interval-${item}`} onClick={() => setIntervalId(item)}>{item}</button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <button type="button" className={styles.textBtn} data-active={indicatorOpen} onClick={() => { setIndicatorOpen((open) => !open); setSymbolOpen(false); }}>Indicators</button>
          {indicatorOpen && (
            <div className={styles.popover}>
              {(['ma', 'volume', 'levels'] as const).map((key) => (
                <button key={key} type="button" data-active={overlays[key]} onClick={() => setOverlays((current) => ({ ...current, [key]: !current[key] }))}>
                  {overlays[key] ? 'On' : 'Off'} · {key === 'ma' ? 'Moving average' : key === 'volume' ? 'Volume' : 'PLOT levels'}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className={styles.textBtn} data-active={alertOn} onClick={() => setAlertOn((armed) => !armed)}>{alertOn ? 'Alert armed' : 'Alert'}</button>
        <button type="button" className={styles.textBtn} data-active={playing} onClick={() => {
          if (playing) { setPlaying(false); return; }
          setReplayTo(Math.max(16, Math.floor(base.length * 0.45)));
          setPlaying(true);
        }}>{playing ? 'Pause' : 'Replay'}</button>
        <div className={styles.spacer} />
        <button type="button" className={styles.textBtn} data-active={locked} onClick={() => {
          if (locked) { setLocked(false); return; }
          if (book.position) flatten();
          setLocked(true);
        }}>{locked ? 'Locked' : 'Kill switch'}</button>
        <button type="button" className={styles.trade} onClick={() => chooseSide('buy')}>Trade</button>
        <button type="button" className={styles.plotBtn} onClick={openPlot}>PLOT</button>
      </header>

      <div className={styles.stage}>
        <div className={styles.tools} aria-label="Drawing tools">
          <button type="button" data-active={tool === 'cursor'} onClick={() => setTool('cursor')} aria-label="Cursor"><MousePointer2 size={16} /></button>
          <button type="button" data-active={tool === 'trend'} onClick={() => setTool('trend')} aria-label="Trend line"><PenLine size={16} /></button>
          <button type="button" data-active={tool === 'level'} onClick={() => { setTool('level'); setAlertOn(true); }} aria-label="Price level"><Minus size={16} /></button>
          <button type="button" data-active={tool === 'text'} onClick={() => setTool('text')} aria-label="Text"><Type size={16} /></button>
          <button type="button" data-active={tool === 'measure'} onClick={() => setTool('measure')} aria-label="Measure"><Ruler size={16} /></button>
        </div>
        <div ref={hostRef} className={styles.chartHost} />
        <div className={styles.legend}>
          <div className={styles.legendTitle}>
            <b>{instrument.code}</b>
            <span>{instrument.name} Index Futures · {interval} · {instrument.exchange}</span>
          </div>
          {last && (
            <div className={styles.ohlc}>
              <span>O <b>{px(last.o)}</b></span>
              <span>H <b>{px(last.h)}</b></span>
              <span>L <b>{px(last.l)}</b></span>
              <span>C <b className={last.c >= last.o ? styles.up : styles.down}>{px(last.c)}</b></span>
              <span className={tape.change < 0 ? styles.down : styles.up}>{tape.change.toFixed(2)} ({tape.changePercent.toFixed(2)}%)</span>
            </div>
          )}
          <button type="button" className={styles.plotLine} data-testid="plot-headline" onClick={openPlot}>
            PLOT · {plan.headline}
          </button>
        </div>
        {alertOn && (
          <div className={styles.toast} data-testid="alert-banner">
            {shelfTagged ? 'Alert · liquidity shelf tagged' : 'Alert armed on the shelf'}
          </div>
        )}
      </div>

      <div className={styles.paper}>
        <div className={styles.metricRow}>
          <span className={styles.paperLabel}>Paper Trading</span>
          <span>{accountLabel} · {money(100000)} USD</span>
          <span>Unrealized P/L <b className={metrics.unrealized > 0 ? styles.up : metrics.unrealized < 0 ? styles.down : undefined}>{money(metrics.unrealized)}</b></span>
          <span>Realized P/L <b className={metrics.realized > 0 ? styles.up : metrics.realized < 0 ? styles.down : undefined}>{money(metrics.realized)}</b></span>
          <span>Equity <b data-testid="equity">{money(metrics.equity)}</b></span>
          <span>Account margin <b>{money(metrics.margin)}</b></span>
          <span>Available funds <b>{money(metrics.available)}</b></span>
          <span>Margin buffer <b>{(metrics.cushion * 100).toFixed(2)}%</b></span>
        </div>
        <div className={styles.cta}>
          <strong>{headline}</strong>
          <em>{pendingSide ? 'Confirm the paper fill.' : 'Red or blue — choose your pill.'}</em>
          <small data-testid="coach">{plan.detail}</small>
          <div className={styles.actions}>
            <button type="button" className={styles.sell} data-testid="sell-button" disabled={locked} onClick={() => chooseSide('sell')}>
              {pendingSide === 'sell' ? 'Confirm sell' : 'Sell'}
            </button>
            <button type="button" className={styles.buy} data-testid="buy-button" disabled={locked} onClick={() => chooseSide('buy')}>
              {pendingSide === 'buy' ? 'Confirm buy' : 'Buy'}
            </button>
            {book.position && <button type="button" className={styles.flat} onClick={flatten}>Flat</button>}
          </div>
        </div>
      </div>

      <div className={styles.contest}>
        <span>New community contests. Compete with traders worldwide.</span>
        <button type="button" onClick={() => setContestOpen((open) => !open)}>{contestOpen ? 'Hide' : 'Explore'}</button>
      </div>
      {contestOpen && <p className={styles.contestNote}>Paper contest: stand aside when the stop is outside the $200 budget. Replay the selloff, then flatten.</p>}

      <div className={styles.live}>
        <div className={styles.host}>
          <span className={styles.liveBadge}>LIVE</span>
          <b>Summerof88</b>
        </div>
        <div className={styles.tiles}>
          {ROOMS.map((item) => (
            <button key={item.id} type="button" className={styles.tile} data-tone={item.tone} data-active={voice === item.id} onClick={() => setVoice(item.id)}>
              <span className={styles.bust} />
              <Headphones size={18} style={{ position: 'absolute', left: '50%', top: 30, marginLeft: -9 }} />
              {item.live && <span className={styles.tileLive}>LIVE</span>}
              <span className={styles.tileName}>{item.name}</span>
            </button>
          ))}
        </div>
        <p className={styles.voice}>{room.name}: {room.note}</p>
      </div>
    </section>
  );
}

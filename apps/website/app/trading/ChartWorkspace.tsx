'use client';

import { useEffect, useMemo, useState, type PointerEvent } from 'react';
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
  type IntervalId,
  type PaperBook,
  type Side,
  type SymbolId,
} from './chart-desk-model';

const INTERVALS: IntervalId[] = ['1m', '5m', '15m', '1H', '4H', 'D'];
const SYMBOLS = Object.values(INSTRUMENTS);

const SESSION_SOLID = {
  asia: '#c4a369',
  london: '#3d8cff',
  ny: '#00ff7f',
} as const;

interface OverlayFlags {
  sessions: boolean;
  vwap: boolean;
  shelf: boolean;
  volume: boolean;
}

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
  // The callback name is part of the type, not a runtime binding.
  // eslint-disable-next-line no-unused-vars
  onOpenPlot: (context: PlotContext) => void;
}

const VIEW_W = 1000;
const VIEW_H = 640;
const PAD = { l: 12, r: 84, t: 16, b: 22 };

function money(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function priceText(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function placeScaleTags(tags: Array<{ kind: string; y: number; text: string }>) {
  const sorted = [...tags].sort((a, b) => a.y - b.y);
  let previous = 10;
  return sorted.map((tag) => {
    const y = Math.max(14, Math.min(VIEW_H - 18, Math.max(tag.y, previous + 34)));
    previous = y;
    return { ...tag, y };
  });
}

export default function ChartWorkspace({ accountLabel, onOpenMenu, onOpenPlot }: ChartWorkspaceProps) {
  const [symbol, setSymbol] = useState<SymbolId>('MNQ');
  const [interval, setIntervalId] = useState<IntervalId>('15m');
  const [overlays, setOverlays] = useState<OverlayFlags>({ sessions: true, vwap: true, shelf: true, volume: true });
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [indicatorOpen, setIndicatorOpen] = useState(false);
  const [books, setBooks] = useState<Record<SymbolId, PaperBook>>({
    MNQ: emptyBook(),
    NQ: emptyBook(),
    MES: emptyBook(),
    ES: emptyBook(),
  });
  const [pendingSide, setPendingSide] = useState<Side | null>(null);
  const [replayTo, setReplayTo] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [tick, setTick] = useState(0);
  const [hover, setHover] = useState<{ index: number; price: number } | null>(null);
  const [alertOn, setAlertOn] = useState(false);
  const [locked, setLocked] = useState(false);
  const [contestOpen, setContestOpen] = useState(false);
  const [paperNote, setPaperNote] = useState(false);
  const [voice, setVoice] = useState('plot');

  const instrument = INSTRUMENTS[symbol];
  const baseCandles = useMemo(() => buildCandles(instrument, interval), [instrument, interval]);
  const replayCandles = replayTo == null ? baseCandles : baseCandles.slice(0, Math.max(8, replayTo));
  const candles = replayTo == null ? nudgeLast(replayCandles, tick, instrument.tick) : replayCandles;
  const tape = useMemo(() => readTape(candles, instrument.tick), [candles, instrument.tick]);
  const plan = useMemo(() => buildPlan(tape, instrument.pointValue), [tape, instrument.pointValue]);
  const book = books[symbol];
  const metrics = accountMetrics(book, candles[candles.length - 1]?.c ?? instrument.start, instrument);
  const last = candles[candles.length - 1]?.c ?? instrument.start;
  const shelfTagged = last <= tape.liquidity;

  useEffect(() => {
    setReplayTo(null);
    setPlaying(false);
    setPendingSide(null);
    setTick(0);
    setHover(null);
  }, [symbol, interval]);

  useEffect(() => {
    if (replayTo != null) return undefined;
    const id = window.setInterval(() => setTick((value) => value + 1), 1800);
    return () => window.clearInterval(id);
  }, [replayTo, symbol, interval]);

  useEffect(() => {
    if (!playing || replayTo == null) return undefined;
    if (replayTo >= baseCandles.length) {
      setPlaying(false);
      setReplayTo(null);
      return undefined;
    }
    const id = window.setInterval(() => {
      setReplayTo((value) => (value == null ? value : Math.min(baseCandles.length, value + 1)));
    }, 160);
    return () => window.clearInterval(id);
  }, [playing, replayTo, baseCandles.length]);

  const geometry = useMemo(() => {
    const prices = candles.flatMap((candle) => [candle.h, candle.l, tape.vwap, tape.liquidity, tape.reclaim]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const span = max - min || instrument.tick * 4;
    const pad = span * 0.08;
    const low = min - pad;
    const high = max + pad;
    const plotW = VIEW_W - PAD.l - PAD.r;
    const volumeH = overlays.volume ? 78 : 0;
    const plotBottom = VIEW_H - PAD.b - volumeH - 8;
    const plotH = plotBottom - PAD.t;
    const yOf = (price: number) => PAD.t + ((high - price) / (high - low)) * plotH;
    const slot = plotW / candles.length;
    const maxVolume = Math.max(...candles.map((candle) => candle.v), 1);
    return { low, high, plotW, plotH, plotBottom, volumeH, yOf, slot, maxVolume };
  }, [candles, instrument.tick, overlays.volume, tape.liquidity, tape.reclaim, tape.vwap]);

  const impulseAt = Math.floor(candles.length * 0.78);

  const fill = (side: Side) => {
    if (locked) return;
    const qty = 1;
    setBooks((current) => ({
      ...current,
      [symbol]: applyFill(current[symbol], side, qty, last, instrument.pointValue),
    }));
    setPendingSide(null);
  };

  const chooseSide = (side: Side) => {
    if (locked) return;
    if (pendingSide === side) fill(side);
    else setPendingSide(side);
  };

  const flatten = () => {
    if (!book.position) return;
    const side: Side = book.position.side === 'buy' ? 'sell' : 'buy';
    setBooks((current) => ({
      ...current,
      [symbol]: applyFill(current[symbol], side, book.position!.qty, last, instrument.pointValue),
    }));
    setPendingSide(null);
  };

  const lockDesk = () => {
    if (book.position) flatten();
    setLocked(true);
    setPendingSide(null);
  };

  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * VIEW_W;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_H;
    const index = Math.min(candles.length - 1, Math.max(0, Math.floor((x - PAD.l) / geometry.slot)));
    const price = geometry.high - ((y - PAD.t) / geometry.plotH) * (geometry.high - geometry.low);
    setHover({ index, price });
  };

  const sessionBands = (['asia', 'london', 'ny'] as const).map((session) => {
    const indexes = candles
      .map((candle, index) => (candle.session === session ? index : -1))
      .filter((index) => index >= 0);
    if (indexes.length === 0) return null;
    const start = indexes[0];
    const end = indexes[indexes.length - 1];
    return { session, x: PAD.l + start * geometry.slot, width: (end - start + 1) * geometry.slot };
  });

  const riskCopy = pendingSide
    ? pendingSide === 'buy' && plan.action !== 'long'
      ? 'Buying into this tape fights the read. One paper contract is still allowed.'
      : pendingSide === 'sell' && plan.action === 'stand_aside'
        ? plan.detail
        : plan.detail
    : book.position
      ? `${book.position.side === 'buy' ? 'Long' : 'Short'} ${book.position.qty} @ ${priceText(book.position.avg)}`
      : 'Make a trade to get started';

  const rooms = [
    { id: 'you', name: accountLabel || 'Your desk', role: 'Host', live: true, color: '#00d9ff', mark: 'You', note: 'This is your paper desk. Fills stay here.' },
    { id: 'plot', name: 'PLOT', role: 'AI coach', live: true, color: '#00ff7f', mark: 'AI', note: plan.headline },
    { id: 'asia', name: 'Asia book', role: 'Session', live: false, color: '#c4a369', mark: 'AS', note: 'Gold band. The overnight range built the shelf.' },
    { id: 'london', name: 'London book', role: 'Session', live: true, color: '#3d8cff', mark: 'LN', note: 'Blue band. London held the range New York broke.' },
    { id: 'ny', name: 'New York book', role: 'Session', live: true, color: '#ff3d7a', mark: 'NY', note: 'Green wash, magenta impulse. Cash session did the damage.' },
  ];
  const activeRoom = rooms.find((room) => room.id === voice) ?? rooms[1];

  return (
    <section className={styles.desk} data-testid="chart-desk" aria-label="Paper chart desk">
      <header className={styles.toolbar}>
        <button type="button" className={styles.menuBtn} onClick={onOpenMenu} aria-label="Open navigation">Menu</button>
        <div style={{ position: 'relative' }}>
          <button type="button" className={styles.symbolBtn} data-active={symbolOpen} onClick={() => { setSymbolOpen((open) => !open); setIndicatorOpen(false); }}>
            {instrument.code}
          </button>
          {symbolOpen && (
            <div className={styles.popover} role="menu">
              {SYMBOLS.map((item) => (
                <button key={item.symbol} type="button" data-active={item.symbol === symbol} onClick={() => { setSymbol(item.symbol); setSymbolOpen(false); }}>
                  {item.code} · {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className={styles.symbolMeta}>
          <strong>{instrument.name}</strong>
          <span>{interval} · {instrument.exchange} · simulated tape</span>
        </div>
        <div className={styles.quote}>
          <b className={tape.change < 0 ? styles.down : styles.up}>{priceText(last)}</b>
          <span className={tape.change < 0 ? styles.down : styles.up}>
            {tape.change >= 0 ? '+' : ''}{tape.change.toFixed(2)} ({tape.changePercent >= 0 ? '+' : ''}{tape.changePercent.toFixed(2)}%)
          </span>
        </div>
        <div className={styles.intervals} role="tablist" aria-label="Interval">
          {INTERVALS.map((item) => (
            <button key={item} type="button" className={styles.intervalBtn} data-active={item === interval} data-testid={`interval-${item}`} onClick={() => setIntervalId(item)}>
              {item}
            </button>
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <button type="button" className={styles.toolBtn} data-active={indicatorOpen} onClick={() => { setIndicatorOpen((open) => !open); setSymbolOpen(false); }}>Indicators</button>
          {indicatorOpen && (
            <div className={styles.popover}>
              {(Object.keys(overlays) as Array<keyof OverlayFlags>).map((key) => (
                <button key={key} type="button" data-active={overlays[key]} onClick={() => setOverlays((current) => ({ ...current, [key]: !current[key] }))}>
                  {overlays[key] ? 'On' : 'Off'} · {key}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className={styles.toolBtn} data-active={alertOn} onClick={() => setAlertOn((armed) => !armed)}>
          {alertOn ? 'Alert armed' : 'Alert'}
        </button>
        <button
          type="button"
          className={styles.toolBtn}
          data-active={playing}
          onClick={() => {
            if (playing) {
              setPlaying(false);
              return;
            }
            setReplayTo(Math.max(12, Math.floor(baseCandles.length * 0.45)));
            setPlaying(true);
          }}
        >
          {playing ? 'Pause' : 'Replay'}
        </button>
        <div className={styles.spacer} />
        <div className={styles.pills}>
          <span className={styles.pillLive}>Simulated paper</span>
          <button type="button" className={locked ? styles.pillLock : styles.pill} onClick={() => (locked ? setLocked(false) : lockDesk())}>
            {locked ? 'Desk locked' : 'Kill switch'}
          </button>
        </div>
      </header>

      <div className={styles.stage}>
        <div className={styles.chartWrap}>
          <svg
            className={styles.chartSvg}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="none"
            role="img"
            aria-label={`${instrument.code} ${interval} simulated candlestick chart`}
            onPointerMove={onPointerMove}
            onPointerLeave={() => setHover(null)}
          >
            <rect width={VIEW_W} height={VIEW_H} fill="#080d13" />
            {overlays.sessions && sessionBands.map((band) => band && (
              <rect key={band.session} x={band.x} y={PAD.t} width={Math.max(band.width, 1)} height={7} fill={SESSION_SOLID[band.session]} />
            ))}
            {Array.from({ length: 5 }, (_, index) => {
              const y = PAD.t + (geometry.plotH / 4) * index;
              return <line key={index} x1={PAD.l} x2={VIEW_W - PAD.r} y1={y} y2={y} stroke="rgba(0,217,255,0.1)" strokeDasharray="3 6" />;
            })}
            {overlays.shelf && impulseAt < candles.length && (
              <rect
                x={PAD.l + impulseAt * geometry.slot}
                y={PAD.t}
                width={(candles.length - impulseAt) * geometry.slot}
                height={geometry.plotH}
                fill="rgba(255,61,122,0.07)"
              />
            )}
            {overlays.vwap && (
              <line x1={PAD.l} x2={VIEW_W - PAD.r} y1={geometry.yOf(tape.vwap)} y2={geometry.yOf(tape.vwap)} stroke="#00d9ff" strokeWidth="1.4" />
            )}
            {overlays.shelf && (
              <line x1={PAD.l} x2={VIEW_W - PAD.r} y1={geometry.yOf(tape.liquidity)} y2={geometry.yOf(tape.liquidity)} stroke="#c4a369" strokeWidth="1.4" strokeDasharray="6 4" />
            )}
            <line x1={PAD.l} x2={VIEW_W - PAD.r} y1={geometry.yOf(tape.reclaim)} y2={geometry.yOf(tape.reclaim)} stroke="#8b7cff" strokeWidth="1.2" strokeDasharray="2 4" />
            {Math.abs(tape.stop - tape.reclaim) > instrument.tick * 8 && (
              <line x1={PAD.l} x2={VIEW_W - PAD.r} y1={geometry.yOf(tape.stop)} y2={geometry.yOf(tape.stop)} stroke="#ffb3c7" strokeWidth="1" strokeDasharray="1 6" />
            )}
            {candles.map((candle, index) => {
              const up = candle.c >= candle.o;
              const x = PAD.l + index * geometry.slot + geometry.slot / 2;
              const body = Math.max(1.2, Math.abs(geometry.yOf(candle.o) - geometry.yOf(candle.c)));
              const color = up ? '#00ff7f' : '#ff3d7a';
              return (
                <g key={`${candle.o}-${index}`}>
                  <line x1={x} x2={x} y1={geometry.yOf(candle.h)} y2={geometry.yOf(candle.l)} stroke={color} strokeWidth="1.3" />
                  <rect x={x - Math.max(1.6, geometry.slot * 0.28)} y={Math.min(geometry.yOf(candle.o), geometry.yOf(candle.c))} width={Math.max(3.2, geometry.slot * 0.56)} height={body} fill={color} opacity={up ? 0.92 : 0.86} />
                </g>
              );
            })}
            {overlays.volume && candles.map((candle, index) => {
              const up = candle.c >= candle.o;
              const height = (candle.v / geometry.maxVolume) * geometry.volumeH;
              const x = PAD.l + index * geometry.slot + geometry.slot * 0.18;
              return (
                <rect
                  key={`v-${index}`}
                  x={x}
                  y={VIEW_H - PAD.b - height}
                  width={Math.max(1.5, geometry.slot * 0.64)}
                  height={height}
                  fill={up ? 'rgba(0,255,127,0.45)' : 'rgba(255,61,122,0.5)'}
                />
              );
            })}
            {hover && (
              <g>
                <line x1={PAD.l + hover.index * geometry.slot + geometry.slot / 2} x2={PAD.l + hover.index * geometry.slot + geometry.slot / 2} y1={PAD.t} y2={geometry.plotBottom} stroke="rgba(0,217,255,0.55)" />
                <line x1={PAD.l} x2={VIEW_W - PAD.r} y1={geometry.yOf(hover.price)} y2={geometry.yOf(hover.price)} stroke="rgba(0,217,255,0.45)" />
              </g>
            )}
          </svg>
          <div className={styles.scale}>
            {placeScaleTags([
              { kind: tape.change < 0 ? 'last-down' : 'last', y: geometry.yOf(last), text: priceText(last) },
              ...(overlays.vwap && overlays.shelf && Math.abs(geometry.yOf(tape.vwap) - geometry.yOf(tape.liquidity)) < 36
                ? [{ kind: 'vwap', y: (geometry.yOf(tape.vwap) + geometry.yOf(tape.liquidity)) / 2, text: 'VWAP / shelf' }]
                : [
                    ...(overlays.vwap ? [{ kind: 'vwap', y: geometry.yOf(tape.vwap), text: 'VWAP' }] : []),
                    ...(overlays.shelf ? [{ kind: 'shelf', y: geometry.yOf(tape.liquidity), text: 'Shelf' }] : []),
                  ]),
              { kind: 'reclaim', y: geometry.yOf(tape.reclaim), text: 'Reclaim' },
              ...(Math.abs(tape.stop - tape.reclaim) > instrument.tick * 8
                ? [{ kind: 'stop', y: geometry.yOf(tape.stop), text: 'Stop' }]
                : []),
              ...(hover ? [{ kind: 'cross', y: geometry.yOf(hover.price), text: priceText(hover.price) }] : []),
            ]).map((tag) => (
              <span key={tag.kind} className={tag.kind === 'cross' ? styles.crossTag : styles.scaleTag} data-kind={tag.kind} style={{ top: `${(tag.y / VIEW_H) * 100}%` }}>{tag.text}</span>
            ))}
          </div>
          <div className={styles.chips}>
            <div className={styles.chip}><i className={styles.dot} data-tone={plan.action === 'stand_aside' ? 'gold' : 'green'} /> {tape.regime.replaceAll('_', ' ')} · {tape.confidence}%</div>
            <div className={styles.chip}><i className={styles.dot} data-tone="cyan" /> {tape.session === 'ny' ? 'New York' : tape.session === 'london' ? 'London' : 'Asia'}</div>
            {alertOn && (
              <div className={styles.chip} data-testid="alert-banner">
                <i className={styles.dot} data-tone={shelfTagged ? 'gold' : 'cyan'} />
                {shelfTagged ? 'Liquidity shelf tagged' : 'Alert armed above the shelf'}
              </div>
            )}
            <div className={styles.chip}><button type="button" onClick={() => onOpenPlot({ symbol: instrument.code, lastPrice: last, change: tape.changePercent, regime: tape.regime, setups: plan.action === 'stand_aside' ? 0 : 1 })}>Ask PLOT</button></div>
          </div>
          <div className={styles.legend}>
            <span><i className={styles.swatch} style={{ background: '#c4a369' }} />Asia</span>
            <span><i className={styles.swatch} style={{ background: '#3d8cff' }} />London</span>
            <span><i className={styles.swatch} style={{ background: '#00ff7f' }} />New York</span>
            <span><i className={styles.swatch} style={{ background: '#ff3d7a' }} />Impulse</span>
          </div>
        </div>
        <aside className={styles.readout}>
          <h2>PLOT read</h2>
          <p data-testid="plot-headline">{plan.headline}</p>
          <p>{tape.detail}</p>
          <ul className={styles.levelList}>
            <li><span>VWAP</span><b className={styles.cyan}>{priceText(tape.vwap)}</b></li>
            <li><span>Shelf</span><b className={styles.gold}>{priceText(tape.liquidity)}</b></li>
            <li><span>Reclaim</span><b>{priceText(tape.reclaim)}</b></li>
            <li><span>Stop</span><b className={styles.down}>{priceText(tape.stop)}</b></li>
            <li><span>Target</span><b className={styles.up}>{priceText(tape.target)}</b></li>
            <li><span>1-lot risk</span><b>{money(plan.riskPerContract)}</b></li>
          </ul>
          <button type="button" className={styles.ask} onClick={() => onOpenPlot({ symbol: instrument.code, lastPrice: last, change: tape.changePercent, regime: tape.regime, setups: plan.action === 'stand_aside' ? 0 : 1 })}>Open PLOT</button>
        </aside>
      </div>

      <div className={styles.coach} data-action={plan.action} data-testid="coach">
        <strong className={plan.action === 'stand_aside' ? styles.gold : styles.up}>{plan.action === 'stand_aside' ? 'Stand aside' : plan.action}</strong>
        <span>{plan.detail}</span>
      </div>

      <div className={styles.paper}>
        <div>
          <h3>
            Paper trading
            <button type="button" onClick={() => setPaperNote((open) => !open)} aria-expanded={paperNote}>Sim</button>
          </h3>
          <span className={styles.quote}><span>{accountLabel}</span></span>
          {paperNote && <p className={styles.warning}>Fills are simulated on this desk. Nothing is routed to a broker.</p>}
        </div>
        <div className={styles.metrics}>
          <Metric label="Unrealized P/L" value={money(metrics.unrealized)} tone={metrics.unrealized} />
          <Metric label="Realized P/L" value={money(metrics.realized)} tone={metrics.realized} />
          <Metric label="Equity" value={money(metrics.equity)} testId="equity" />
          <Metric label="Account margin" value={money(metrics.margin)} />
          <Metric label="Available funds" value={money(metrics.available)} />
          <Metric label="Margin cushion" value={`${(metrics.cushion * 100).toFixed(1)}%`} />
          <Metric label="Margin buffer" value={money(metrics.buffer)} />
        </div>
        <div className={styles.tradeBox}>
          <p>
            <strong>{riskCopy}</strong>
            {pendingSide ? 'Confirm the paper fill, or pick the other side.' : 'Red sells. Cyan buys. PLOT sizes the risk.'}
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.sell} data-testid="sell-button" disabled={locked} onClick={() => chooseSide('sell')}>
              {pendingSide === 'sell' ? 'Confirm sell' : 'Sell'}
            </button>
            <button type="button" className={styles.buy} data-testid="buy-button" disabled={locked} onClick={() => chooseSide('buy')}>
              {pendingSide === 'buy' ? 'Confirm buy' : 'Buy'}
            </button>
            {book.position && <button type="button" className={styles.flat} onClick={flatten}>Flatten</button>}
          </div>
        </div>
      </div>

      <div className={styles.contest}>
        <span>New community contests. Compare paper discipline with the room.</span>
        <button type="button" onClick={() => setContestOpen((open) => !open)}>{contestOpen ? 'Hide' : 'Explore'}</button>
      </div>
      {contestOpen && (
        <p className={styles.contestNote}>This week’s desk contest scores standing aside when the stop is outside the $200 paper budget. Replay the New York impulse and flatten before the lock.</p>
      )}

      <div className={styles.live}>
        <div className={styles.liveLabel}>Every Day Live<small>ON AIR</small></div>
        <div className={styles.tiles}>
          {rooms.map((room) => (
            <button key={room.id} type="button" className={styles.tile} data-active={voice === room.id} onClick={() => setVoice(room.id)}>
              <div className={styles.tileFace} style={{ background: `linear-gradient(145deg, ${room.color}, #0c1218 70%)` }}>
                <span className={styles.mark} style={{ background: room.color }}>{room.mark}</span>
                {room.live && <span className={styles.badge}>LIVE</span>}
              </div>
              <footer>{room.name}<small>{room.role}</small></footer>
            </button>
          ))}
        </div>
        <p className={styles.voice}>{activeRoom.name}: {activeRoom.note}</p>
      </div>
    </section>
  );
}

function Metric({ label, value, tone, testId }: { label: string; value: string; tone?: number; testId?: string }) {
  const className = tone == null || tone === 0 ? undefined : tone > 0 ? styles.up : styles.down;
  return (
    <div>
      <small>{label}</small>
      <b className={className} data-testid={testId}>{value}</b>
    </div>
  );
}

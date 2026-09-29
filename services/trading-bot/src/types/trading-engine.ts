/**
 * Simplified trading engine types for Discord bot
 * Full implementation at packages/trading-engine/src/aether-trader.ts
 */

export interface OHLCV {
  time: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Swing {
  type: 'high' | 'low';
  price: number;
  time: Date;
  candle: OHLCV;
}

export interface FibonacciLevels {
  level0: number;
  level236: number;
  level382: number;
  level50: number;
  level618: number;
  level100: number;
  level162: number;
}

export interface MarketRegime {
  type: 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'VOLATILE' | 'EXPANSION' | 'COMPRESSION';
  confidence: number;
  lastHigher: boolean;
  lastLower: boolean;
  rsiMomentum: 'rising' | 'falling' | 'neutral';
  volatilityLevel: 'low' | 'moderate' | 'high' | 'extreme';
}

export interface LiquiditySweep {
  type: 'BULLISH' | 'BEARISH';
  liquidityLevel: number;
  sweepStart: Date;
  sweepEnd: Date;
  penetrationATR: number;
  maxPenetration: number;
  rejectionConfirmed: boolean;
  exhaustionSignals: string[];
}

export interface TradeSetup {
  id: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  type: 'LIQUIDITY_SWEEP' | 'RANGE_BREAKOUT' | 'REVERSAL' | 'RETEST';
  confidence: number;
  impulseHigh?: number;
  impulseLow?: number;
  impulseRange?: number;
  entryZone: { start: number; end: number };
  fibonacciLevel: string;
  stopPrice: number;
  targetPrice: number;
  riskReward: number;
  expectedR: number;
  bias4H: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  regime: MarketRegime;
  session: 'ASIA' | 'LONDON' | 'NEWYORK' | 'OVERLAP';
  liquiditySweep?: LiquiditySweep;
  isValid: boolean;
  detectedAt: Date;
  invalidatedAt?: Date;
  rationale: string;
}

/**
 * Minimal AETHERTrader stub for type compatibility
 * Use actual implementation from packages/trading-engine
 */
export class AETHERTrader {
  private symbol: string;
  private candles: OHLCV[] = [];

  constructor(symbol: string) {
    this.symbol = symbol;
  }

  addCandle(candle: OHLCV) {
    this.candles.push(candle);
    if (this.candles.length > 500) {
      this.candles.shift();
    }
  }

  calculateATR(period: number = 14): number {
    if (this.candles.length < period) return 0;
    let sumTR = 0;
    for (let i = this.candles.length - period; i < this.candles.length; i++) {
      const curr = this.candles[i];
      const prev = i > 0 ? this.candles[i - 1] : curr;
      const tr = Math.max(
        curr.high - curr.low,
        Math.abs(curr.high - prev.close),
        Math.abs(curr.low - prev.close)
      );
      sumTR += tr;
    }
    return sumTR / period;
  }

  scan(): TradeSetup[] {
    if (this.candles.length < 20) return [];

    // Placeholder: Return empty setups
    // Full implementation uses SetupEngine from aether-trader.ts
    return [];
  }

  getMarketState() {
    if (this.candles.length < 20) return null;
    const lastCandle = this.candles[this.candles.length - 1];
    const atrValue = this.calculateATR();
    return {
      symbol: this.symbol,
      lastPrice: lastCandle.close,
      atr: atrValue,
      candles: this.candles.length,
      lastUpdated: lastCandle.time,
    };
  }
}

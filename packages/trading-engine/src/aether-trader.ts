/**
 * ÆTHER-TRADER: Algorithmic Trading System
 *
 * A quantitative trading engine based on liquidity analysis, Fibonacci retracements,
 * RSI momentum, and session-based market structure.
 *
 * Core Philosophy:
 * 1. Establish Liquidity (session ranges, structural levels)
 * 2. Detect Liquidity Raids (sweeps, failed acceptance)
 * 3. Confirm Rejection/Acceptance (reversal structure, momentum)
 * 4. Expand to Next Objective (Fibonacci targets, liquidity pools)
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
  lastHigher: boolean; // Higher highs?
  lastLower: boolean; // Higher lows?
  rsiMomentum: 'rising' | 'falling' | 'neutral';
  volatilityLevel: 'low' | 'moderate' | 'high' | 'extreme';
}

export interface SessionLiquidity {
  session: 'ASIA' | 'LONDON' | 'NEWYORK';
  high: number;
  low: number;
  midpoint: number;
  range: number;
  volume: number;
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
  confidence: number; // 0-1

  // Structural
  impulseHigh?: number;
  impulseLow?: number;
  impulseRange?: number;

  // Fibonacci entry zone
  entryZone: { start: number; end: number };
  fibonacciLevel: string; // "0.382", "0.236", etc.

  // Risk/Reward
  stopPrice: number;
  targetPrice: number;
  riskReward: number;
  expectedR: number;

  // Context
  bias4H: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  regime: MarketRegime;
  session: 'ASIA' | 'LONDON' | 'NEWYORK' | 'OVERLAP';
  liquiditySweep?: LiquiditySweep;

  // Status
  isValid: boolean;
  detectedAt: Date;
  invalidatedAt?: Date;

  // Explanation
  rationale: string;
}

/**
 * MarketStructureEngine: Detect swings, impulses, and structural changes
 */
export class MarketStructureEngine {
  private swings: Swing[] = [];
  private minSwingSize: number;

  constructor(minSwingSize: number = 0.1) {
    this.minSwingSize = minSwingSize;
  }

  /**
   * Detect meaningful swings from OHLCV data
   * Returns the most significant swings (not micro-movements)
   */
  detectSwings(candles: OHLCV[]): Swing[] {
    if (candles.length < 3) return [];

    const swings: Swing[] = [];
    let currentTrend: 'up' | 'down' | null = null;

    for (let i = 1; i < candles.length - 1; i++) {
      const prev = candles[i - 1];
      const curr = candles[i];
      const next = candles[i + 1];

      // Detect swing high
      if (
        curr.high >= prev.high &&
        curr.high >= next.high &&
        this.isSignificantSwing(curr.high, swings)
      ) {
        swings.push({
          type: 'high',
          price: curr.high,
          time: curr.time,
          candle: curr,
        });
        currentTrend = 'down';
      }

      // Detect swing low
      if (
        curr.low <= prev.low &&
        curr.low <= next.low &&
        this.isSignificantSwing(curr.low, swings)
      ) {
        swings.push({
          type: 'low',
          price: curr.low,
          time: curr.time,
          candle: curr,
        });
        currentTrend = 'up';
      }
    }

    this.swings = swings;
    return swings;
  }

  private isSignificantSwing(price: number, existingSwings: Swing[]): boolean {
    if (existingSwings.length === 0) return true;

    const lastSwing = existingSwings[existingSwings.length - 1];
    const distance = Math.abs(price - lastSwing.price);
    return distance >= this.minSwingSize;
  }

  /**
   * Identify the most recent meaningful impulse range
   */
  getActiveImpulseRange(candles: OHLCV[], direction: 'LONG' | 'SHORT'): {
    low: number;
    high: number;
    start: Date;
    end: Date;
  } | null {
    if (this.swings.length < 2) return null;

    if (direction === 'LONG') {
      // Find most recent low followed by high
      for (let i = this.swings.length - 1; i >= 1; i--) {
        if (this.swings[i].type === 'high' && this.swings[i - 1].type === 'low') {
          return {
            low: this.swings[i - 1].price,
            high: this.swings[i].price,
            start: this.swings[i - 1].time,
            end: this.swings[i].time,
          };
        }
      }
    } else {
      // Find most recent high followed by low
      for (let i = this.swings.length - 1; i >= 1; i--) {
        if (this.swings[i].type === 'low' && this.swings[i - 1].type === 'high') {
          return {
            low: this.swings[i].price,
            high: this.swings[i - 1].price,
            start: this.swings[i - 1].time,
            end: this.swings[i].time,
          };
        }
      }
    }

    return null;
  }
}

/**
 * FibonacciEngine: Calculate Fibonacci retracements and extensions
 */
export class FibonacciEngine {
  private levels = [0, 0.236, 0.382, 0.5, 0.618, 1.0, 1.618];

  /**
   * Calculate Fibonacci levels from impulse range
   */
  calculateLevels(low: number, high: number): FibonacciLevels {
    const range = high - low;

    return {
      level0: low,
      level236: low + range * 0.236,
      level382: low + range * 0.382,
      level50: low + range * 0.5,
      level618: low + range * 0.618,
      level100: high,
      level162: low + range * 1.618,
    };
  }

  /**
   * Find the closest Fibonacci level to current price
   */
  getNearestLevel(
    price: number,
    levels: FibonacciLevels
  ): { level: string; price: number; distance: number } {
    const fibPrices = [
      { level: '0', price: levels.level0 },
      { level: '0.236', price: levels.level236 },
      { level: '0.382', price: levels.level382 },
      { level: '0.5', price: levels.level50 },
      { level: '0.618', price: levels.level618 },
      { level: '1.0', price: levels.level100 },
      { level: '1.618', price: levels.level162 },
    ];

    let nearest = fibPrices[0];
    let minDistance = Math.abs(price - nearest.price);

    for (const fib of fibPrices) {
      const distance = Math.abs(price - fib.price);
      if (distance < minDistance) {
        nearest = fib;
        minDistance = distance;
      }
    }

    return {
      level: nearest.level,
      price: nearest.price,
      distance: minDistance,
    };
  }

  /**
   * Determine if price is in discount or premium
   */
  getPremiumDiscountZone(
    price: number,
    levels: FibonacciLevels
  ): 'DEEP_DISCOUNT' | 'DISCOUNT' | 'EQUILIBRIUM' | 'PREMIUM' | 'DEEP_PREMIUM' {
    const midpoint = (levels.level0 + levels.level100) / 2;

    if (price < levels.level236) return 'DEEP_DISCOUNT';
    if (price < levels.level50) return 'DISCOUNT';
    if (price < levels.level618) return 'EQUILIBRIUM';
    if (price < levels.level100) return 'PREMIUM';
    return 'DEEP_PREMIUM';
  }
}

/**
 * RSIEngine: Analyze momentum and RSI structure
 */
export class RSIEngine {
  private rsiPeriod: number;

  constructor(period: number = 14) {
    this.rsiPeriod = period;
  }

  /**
   * Calculate RSI (Relative Strength Index)
   */
  calculateRSI(closes: number[]): number | null {
    if (closes.length < this.rsiPeriod + 1) return null;

    let gains = 0;
    let losses = 0;

    for (let i = closes.length - this.rsiPeriod; i < closes.length; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses += Math.abs(diff);
    }

    const avgGain = gains / this.rsiPeriod;
    const avgLoss = losses / this.rsiPeriod;

    if (avgLoss === 0) return avgGain > 0 ? 100 : 0;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  /**
   * Detect RSI divergence (bullish or bearish)
   */
  detectDivergence(
    closes: number[],
    highs: number[]
  ): 'BULLISH' | 'BEARISH' | 'NONE' {
    if (closes.length < 30) return 'NONE';

    const recentRSIs = closes.slice(-15).map(c => this.calculateRSI(closes.slice(0, closes.length - 15 + closes.indexOf(c)))!);

    // Simplified divergence detection
    // Bullish: Price makes lower low but RSI makes higher low
    // Bearish: Price makes higher high but RSI makes lower high

    return 'NONE'; // TODO: Implement full divergence logic
  }

  /**
   * Classify RSI state
   */
  getRSIState(
    rsi: number
  ): 'OVERBOUGHT' | 'OVERSOLD' | 'NEUTRAL' | 'RISING' | 'FALLING' {
    if (rsi > 70) return 'OVERBOUGHT';
    if (rsi < 30) return 'OVERSOLD';
    return 'NEUTRAL';
  }
}

/**
 * RegimeEngine: Classify market conditions
 */
export class RegimeEngine {
  /**
   * Detect market regime from price action
   */
  detectRegime(candles: OHLCV[], rsiValues: number[]): MarketRegime {
    if (candles.length < 2) {
      return {
        type: 'RANGING',
        confidence: 0.5,
        lastHigher: false,
        lastLower: false,
        rsiMomentum: 'neutral',
        volatilityLevel: 'moderate',
      };
    }

    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);

    // Check for higher highs/lows (uptrend) or lower highs/lows (downtrend)
    const lastHigher = highs[highs.length - 1] > highs[highs.length - 2];
    const lastLower = lows[lows.length - 1] > lows[lows.length - 2];

    // Detect volatility level
    const volatility = this.calculateVolatility(candles);
    let volatilityLevel: 'low' | 'moderate' | 'high' | 'extreme' = 'moderate';
    if (volatility < 0.5) volatilityLevel = 'low';
    else if (volatility < 1.5) volatilityLevel = 'moderate';
    else if (volatility < 3) volatilityLevel = 'high';
    else volatilityLevel = 'extreme';

    // Determine regime type
    let type: MarketRegime['type'] = 'RANGING';
    let confidence = 0.5;

    if (lastHigher && lastLower) {
      type = 'TRENDING_UP';
      confidence = 0.75;
    } else if (!lastHigher && !lastLower) {
      type = 'TRENDING_DOWN';
      confidence = 0.75;
    } else {
      type = 'RANGING';
      confidence = 0.6;
    }

    // RSI momentum
    const rsiMomentum = rsiValues[rsiValues.length - 1] > (rsiValues[rsiValues.length - 2] ?? 50)
      ? 'rising'
      : rsiValues[rsiValues.length - 1] < (rsiValues[rsiValues.length - 2] ?? 50)
      ? 'falling'
      : 'neutral';

    return {
      type,
      confidence,
      lastHigher,
      lastLower,
      rsiMomentum,
      volatilityLevel,
    };
  }

  private calculateVolatility(candles: OHLCV[]): number {
    if (candles.length < 2) return 0;

    let sumSqDiff = 0;
    const closes = candles.map(c => c.close);
    const avg = closes.reduce((a, b) => a + b, 0) / closes.length;

    for (const close of closes) {
      sumSqDiff += Math.pow(close - avg, 2);
    }

    return Math.sqrt(sumSqDiff / closes.length);
  }
}

/**
 * LiquidityEngine: Detect liquidity levels and sweeps
 */
export class LiquidityEngine {
  /**
   * Extract session liquidity from candles
   */
  getSessionLiquidity(
    candles: OHLCV[],
    sessionStart: Date,
    sessionEnd: Date
  ): SessionLiquidity | null {
    const sessionCandles = candles.filter(c => c.time >= sessionStart && c.time <= sessionEnd);

    if (sessionCandles.length === 0) return null;

    const highs = sessionCandles.map(c => c.high);
    const lows = sessionCandles.map(c => c.low);
    const volumes = sessionCandles.map(c => c.volume || 0);

    const high = Math.max(...highs);
    const low = Math.min(...lows);

    return {
      session: 'ASIA', // Placeholder
      high,
      low,
      midpoint: (high + low) / 2,
      range: high - low,
      volume: volumes.reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Detect liquidity sweep (raid of buy/sell side)
   */
  detectLiquiditySweep(
    candles: OHLCV[],
    liquidityLevel: number,
    atrValue: number,
    sweepThreshold: number = 1.2
  ): LiquiditySweep | null {
    if (candles.length < 3) return null;

    const recent = candles.slice(-10);
    const penetrationRequired = atrValue * sweepThreshold;

    // Look for price above liquidity level
    const sweepCandles = recent.filter(c => c.high > liquidityLevel);

    if (sweepCandles.length === 0) return null;

    const sweepStart = sweepCandles[0].time;
    const maxHigh = Math.max(...sweepCandles.map(c => c.high));
    const penetration = maxHigh - liquidityLevel;

    if (penetration < penetrationRequired) return null;

    // Check for rejection (close below liquidity)
    const lastCandle = recent[recent.length - 1];
    const rejectionConfirmed = lastCandle.close < liquidityLevel && lastCandle.close < lastCandle.open;

    return {
      type: 'BULLISH',
      liquidityLevel,
      sweepStart,
      sweepEnd: lastCandle.time,
      penetrationATR: penetration / atrValue,
      maxPenetration: penetration,
      rejectionConfirmed,
      exhaustionSignals: rejectionConfirmed ? ['close_below_liquidity', 'bearish_candle'] : [],
    };
  }
}

/**
 * SetupEngine: Generate trade setups
 */
export class SetupEngine {
  private structureEngine: MarketStructureEngine;
  private fibonacciEngine: FibonacciEngine;
  private rsiEngine: RSIEngine;
  private regimeEngine: RegimeEngine;
  private liquidityEngine: LiquidityEngine;

  constructor() {
    this.structureEngine = new MarketStructureEngine();
    this.fibonacciEngine = new FibonacciEngine();
    this.rsiEngine = new RSIEngine();
    this.regimeEngine = new RegimeEngine();
    this.liquidityEngine = new LiquidityEngine();
  }

  /**
   * Detect trade setups from market data
   */
  detectSetups(
    symbol: string,
    candles: OHLCV[],
    atrValue: number
  ): TradeSetup[] {
    const setups: TradeSetup[] = [];

    // Detect swings
    this.structureEngine.detectSwings(candles);

    // Detect market regime
    const closes = candles.map(c => c.close);
    const rsiValues = closes
      .map((_, i, arr) => this.rsiEngine.calculateRSI(arr.slice(0, i + 1)))
      .filter(v => v !== null) as number[];

    const regime = this.regimeEngine.detectRegime(candles, rsiValues);

    // Try LONG setups
    const longImpulse = this.structureEngine.getActiveImpulseRange(candles, 'LONG');
    if (longImpulse) {
      const setup = this.buildLongSetup(
        symbol,
        candles,
        longImpulse,
        atrValue,
        regime,
        rsiValues
      );
      if (setup) setups.push(setup);
    }

    // Try SHORT setups
    const shortImpulse = this.structureEngine.getActiveImpulseRange(candles, 'SHORT');
    if (shortImpulse) {
      const setup = this.buildShortSetup(
        symbol,
        candles,
        shortImpulse,
        atrValue,
        regime,
        rsiValues
      );
      if (setup) setups.push(setup);
    }

    return setups;
  }

  private buildLongSetup(
    symbol: string,
    candles: OHLCV[],
    impulse: { low: number; high: number; start: Date; end: Date },
    atrValue: number,
    regime: MarketRegime,
    rsiValues: number[]
  ): TradeSetup | null {
    const currentCandle = candles[candles.length - 1];
    const currentPrice = currentCandle.close;

    // Calculate Fibonacci levels
    const fibLevels = this.fibonacciEngine.calculateLevels(impulse.low, impulse.high);
    const nearestLevel = this.fibonacciEngine.getNearestLevel(currentPrice, fibLevels);
    const premiumDiscount = this.fibonacciEngine.getPremiumDiscountZone(currentPrice, fibLevels);

    // Only enter in discount
    if (!['DEEP_DISCOUNT', 'DISCOUNT'].includes(premiumDiscount)) {
      return null;
    }

    // Calculate targets
    const target1 = fibLevels.level100;
    const target2 = fibLevels.level162;

    // Risk/Reward
    const stop = impulse.low - atrValue * 0.5;
    const riskAmount = currentPrice - stop;
    const rewardAmount = target2 - currentPrice;
    const riskReward = rewardAmount / riskAmount;

    if (riskReward < 1.5) return null; // Minimum 1.5:1

    // Confidence scoring
    let confidence = 0.5;
    confidence += ['DEEP_DISCOUNT', 'DISCOUNT'].includes(premiumDiscount) ? 0.15 : 0;
    confidence += regime.type.includes('TRENDING_UP') ? 0.15 : 0;
    confidence += regime.rsiMomentum === 'rising' ? 0.1 : 0;
    confidence = Math.min(confidence, 1.0);

    return {
      id: `${symbol}-LONG-${Date.now()}`,
      symbol,
      direction: 'LONG',
      type: 'LIQUIDITY_SWEEP',
      confidence,
      impulseHigh: impulse.high,
      impulseLow: impulse.low,
      impulseRange: impulse.high - impulse.low,
      entryZone: {
        start: nearestLevel.price - atrValue * 0.25,
        end: nearestLevel.price + atrValue * 0.25,
      },
      fibonacciLevel: nearestLevel.level,
      stopPrice: stop,
      targetPrice: target2,
      riskReward,
      expectedR: (target2 - currentPrice) / riskAmount,
      bias4H: regime.type.includes('TRENDING_UP') ? 'BULLISH' : 'NEUTRAL',
      regime,
      session: 'LONDON', // Placeholder
      isValid: true,
      detectedAt: new Date(),
      rationale: `Long setup in ${premiumDiscount} zone at Fib ${nearestLevel.level}. Risk/Reward ${riskReward.toFixed(2)}:1. Regime: ${regime.type}`,
    };
  }

  private buildShortSetup(
    symbol: string,
    candles: OHLCV[],
    impulse: { low: number; high: number; start: Date; end: Date },
    atrValue: number,
    regime: MarketRegime,
    rsiValues: number[]
  ): TradeSetup | null {
    const currentCandle = candles[candles.length - 1];
    const currentPrice = currentCandle.close;

    // Calculate Fibonacci levels (inverted for short)
    const fibLevels = this.fibonacciEngine.calculateLevels(impulse.low, impulse.high);
    const nearestLevel = this.fibonacciEngine.getNearestLevel(currentPrice, fibLevels);
    const premiumDiscount = this.fibonacciEngine.getPremiumDiscountZone(currentPrice, fibLevels);

    // Only enter in premium
    if (!['DEEP_PREMIUM', 'PREMIUM'].includes(premiumDiscount)) {
      return null;
    }

    // Calculate targets
    const target1 = impulse.low;
    const target2 = impulse.low - (impulse.high - impulse.low) * 0.618;

    // Risk/Reward
    const stop = impulse.high + atrValue * 0.5;
    const riskAmount = stop - currentPrice;
    const rewardAmount = currentPrice - target2;
    const riskReward = rewardAmount / riskAmount;

    if (riskReward < 1.5) return null;

    // Confidence scoring
    let confidence = 0.5;
    confidence += ['DEEP_PREMIUM', 'PREMIUM'].includes(premiumDiscount) ? 0.15 : 0;
    confidence += regime.type.includes('TRENDING_DOWN') ? 0.15 : 0;
    confidence += regime.rsiMomentum === 'falling' ? 0.1 : 0;
    confidence = Math.min(confidence, 1.0);

    return {
      id: `${symbol}-SHORT-${Date.now()}`,
      symbol,
      direction: 'SHORT',
      type: 'LIQUIDITY_SWEEP',
      confidence,
      impulseHigh: impulse.high,
      impulseLow: impulse.low,
      impulseRange: impulse.high - impulse.low,
      entryZone: {
        start: nearestLevel.price - atrValue * 0.25,
        end: nearestLevel.price + atrValue * 0.25,
      },
      fibonacciLevel: nearestLevel.level,
      stopPrice: stop,
      targetPrice: target2,
      riskReward,
      expectedR: (currentPrice - target2) / riskAmount,
      bias4H: regime.type.includes('TRENDING_DOWN') ? 'BEARISH' : 'NEUTRAL',
      regime,
      session: 'LONDON', // Placeholder
      isValid: true,
      detectedAt: new Date(),
      rationale: `Short setup in ${premiumDiscount} zone at Fib ${nearestLevel.level}. Risk/Reward ${riskReward.toFixed(2)}:1. Regime: ${regime.type}`,
    };
  }
}

/**
 * AETHERTrader: Main trading system coordinator
 */
export class AETHERTrader {
  private setupEngine: SetupEngine;
  private symbol: string;
  private candles: OHLCV[] = [];

  constructor(symbol: string) {
    this.setupEngine = new SetupEngine();
    this.symbol = symbol;
  }

  /**
   * Feed market data
   */
  addCandle(candle: OHLCV) {
    this.candles.push(candle);
    // Keep only last 500 candles
    if (this.candles.length > 500) {
      this.candles.shift();
    }
  }

  /**
   * Calculate ATR (Average True Range)
   */
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

  /**
   * Scan for trade opportunities
   */
  scan(): TradeSetup[] {
    if (this.candles.length < 20) {
      return []; // Need minimum data
    }

    const atrValue = this.calculateATR();
    return this.setupEngine.detectSetups(this.symbol, this.candles, atrValue);
  }

  /**
   * Get current market state
   */
  getMarketState() {
    if (this.candles.length < 20) {
      return null;
    }

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

export default AETHERTrader;

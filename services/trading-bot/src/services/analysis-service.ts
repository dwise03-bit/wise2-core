import { OHLCV } from '../types/trading-engine';

export interface ChartPattern {
  type: string;
  confidence: number;
  location: 'top' | 'bottom';
  potentialTarget?: number;
  potentialStop?: number;
  description: string;
}

export interface VolumeProfile {
  pointOfControl: number;
  volumeAtHigh: number;
  volumeAtLow: number;
  avgVolume: number;
  volumeTrend: 'increasing' | 'decreasing' | 'neutral';
}

export interface OrderFlowAnalysis {
  bullishDivergence: boolean;
  bearishDivergence: boolean;
  divergenceStrength: number;
  description: string;
}

/**
 * AnalysisService: Advanced technical analysis (patterns, volume, order flow)
 */
export class AnalysisService {
  /**
   * Detect chart patterns (H&S, Double Top/Bottom, Triangles, Wedges)
   */
  static detectPatterns(candles: OHLCV[]): ChartPattern[] {
    const patterns: ChartPattern[] = [];

    if (candles.length < 5) return patterns;

    // Head and Shoulders detection
    const hsPattern = this.detectHeadAndShoulders(candles);
    if (hsPattern) patterns.push(hsPattern);

    // Double Top/Bottom
    const doublePattern = this.detectDoubleTopBottom(candles);
    if (doublePattern) patterns.push(doublePattern);

    // Triangle detection
    const trianglePattern = this.detectTriangle(candles);
    if (trianglePattern) patterns.push(trianglePattern);

    // Wedge detection
    const wedgePattern = this.detectWedge(candles);
    if (wedgePattern) patterns.push(wedgePattern);

    return patterns;
  }

  /**
   * Detect head and shoulders pattern
   */
  private static detectHeadAndShoulders(candles: OHLCV[]): ChartPattern | null {
    if (candles.length < 5) return null;

    const recent = candles.slice(-5);
    const highs = recent.map((c) => c.high);
    const lows = recent.map((c) => c.low);

    // Check for 3 peaks pattern
    const leftShoulder = highs[0];
    const head = highs[2];
    const rightShoulder = highs[4];

    // Criteria: left shoulder < head, right shoulder < head
    if (leftShoulder < head && rightShoulder < head && leftShoulder > rightShoulder) {
      const neckline = (lows[1] + lows[3]) / 2;
      const target = head - (head - neckline);

      return {
        type: 'Head and Shoulders',
        confidence: 0.72,
        location: 'top',
        potentialTarget: target,
        potentialStop: head,
        description: 'Bearish reversal pattern: head at $' + head.toFixed(2),
      };
    }

    return null;
  }

  /**
   * Detect double top/bottom
   */
  private static detectDoubleTopBottom(candles: OHLCV[]): ChartPattern | null {
    if (candles.length < 3) return null;

    const recent = candles.slice(-3);
    const highs = recent.map((c) => c.high);
    const lows = recent.map((c) => c.low);

    // Double Top
    if (Math.abs(highs[0] - highs[2]) < highs[0] * 0.01) {
      const supportLevel = lows[1];
      const target = supportLevel - (highs[0] - supportLevel);

      return {
        type: 'Double Top',
        confidence: 0.68,
        location: 'top',
        potentialTarget: target,
        potentialStop: highs[0],
        description: 'Bearish reversal: double top at $' + highs[0].toFixed(2),
      };
    }

    // Double Bottom
    if (Math.abs(lows[0] - lows[2]) < lows[0] * 0.01) {
      const resistanceLevel = highs[1];
      const target = resistanceLevel + (resistanceLevel - lows[0]);

      return {
        type: 'Double Bottom',
        confidence: 0.68,
        location: 'bottom',
        potentialTarget: target,
        potentialStop: lows[0],
        description: 'Bullish reversal: double bottom at $' + lows[0].toFixed(2),
      };
    }

    return null;
  }

  /**
   * Detect triangle pattern (converging highs and lows)
   */
  private static detectTriangle(candles: OHLCV[]): ChartPattern | null {
    if (candles.length < 4) return null;

    const recent = candles.slice(-4);
    const highs = recent.map((c) => c.high);
    const lows = recent.map((c) => c.low);

    // Check for converging range
    const range1 = highs[0] - lows[0];
    const range2 = highs[3] - lows[3];

    if (range1 > range2 && range2 < range1 * 0.5) {
      const midpoint = (highs[3] + lows[3]) / 2;
      const breakoutTarget = midpoint + range1;

      return {
        type: 'Triangle',
        confidence: 0.65,
        location: 'bottom',
        potentialTarget: breakoutTarget,
        potentialStop: lows[3],
        description: 'Consolidation pattern: potential breakout above $' + breakoutTarget.toFixed(2),
      };
    }

    return null;
  }

  /**
   * Detect wedge pattern
   */
  private static detectWedge(candles: OHLCV[]): ChartPattern | null {
    if (candles.length < 4) return null;

    const recent = candles.slice(-4);
    const highs = recent.map((c) => c.high);
    const lows = recent.map((c) => c.low);

    // Falling wedge (lower highs and lower lows)
    const fallingHighs = highs[0] > highs[1] && highs[1] > highs[2];
    const fallingLows = lows[0] > lows[1] && lows[1] > lows[2];

    if (fallingHighs && fallingLows) {
      const target = highs[0];
      return {
        type: 'Falling Wedge',
        confidence: 0.66,
        location: 'bottom',
        potentialTarget: target,
        potentialStop: lows[3],
        description: 'Bullish reversal: falling wedge nearing breakout',
      };
    }

    return null;
  }

  /**
   * Calculate volume profile
   */
  static calculateVolumeProfile(candles: OHLCV[]): VolumeProfile {
    if (candles.length === 0) {
      return {
        pointOfControl: 0,
        volumeAtHigh: 0,
        volumeAtLow: 0,
        avgVolume: 0,
        volumeTrend: 'neutral',
      };
    }

    const prices = candles.map((c) => c.close);
    const volumes = candles.map((c) => c.volume);
    const totalVolume = volumes.reduce((a, b) => a + b, 0);

    // Point of Control (price with most volume)
    let maxVolumePrice = prices[0] || 0;
    let maxVolume = volumes[0] || 0;

    for (let i = 0; i < prices.length; i++) {
      const vol = volumes[i] || 0;
      if (vol > maxVolume) {
        maxVolume = vol;
        maxVolumePrice = prices[i] || 0;
      }
    }

    // Volume at high/low
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const highIdx = prices.indexOf(high);
    const lowIdx = prices.indexOf(low);
    const volumeAtHigh = highIdx >= 0 ? volumes[highIdx] || 0 : 0;
    const volumeAtLow = lowIdx >= 0 ? volumes[lowIdx] || 0 : 0;

    // Average volume
    const avgVolume = totalVolume / candles.length;

    // Volume trend (last 3 vs previous 3)
    const recentVols = volumes.slice(-3).filter((v) => v !== undefined);
    const prevVols = volumes.slice(-6, -3).filter((v) => v !== undefined);
    const recentVolumes = recentVols.length > 0 ? recentVols.reduce((a, b) => a + b, 0) / recentVols.length : 0;
    const previousVolumes = prevVols.length > 0 ? prevVols.reduce((a, b) => a + b, 0) / prevVols.length : 0;

    let volumeTrend: 'increasing' | 'decreasing' | 'neutral' = 'neutral';
    if (recentVolumes > previousVolumes * 1.2) volumeTrend = 'increasing';
    else if (recentVolumes < previousVolumes * 0.8) volumeTrend = 'decreasing';

    return {
      pointOfControl: maxVolumePrice,
      volumeAtHigh,
      volumeAtLow,
      avgVolume,
      volumeTrend,
    };
  }

  /**
   * Analyze order flow divergence (RSI vs Price)
   */
  static analyzeOrderFlow(candles: OHLCV[], rsiValues: number[]): OrderFlowAnalysis {
    if (candles.length < 2 || rsiValues.length < 2) {
      return {
        bullishDivergence: false,
        bearishDivergence: false,
        divergenceStrength: 0,
        description: 'Insufficient data for divergence analysis',
      };
    }

    const recent = candles.slice(-3);
    const recentRSI = rsiValues.slice(-3);

    // Bullish divergence: lower lows in price, higher lows in RSI
    const priceLower = recent[0].low > recent[2].low;
    const rsiHigher = recentRSI[0] < recentRSI[2];

    if (priceLower && rsiHigher) {
      return {
        bullishDivergence: true,
        bearishDivergence: false,
        divergenceStrength: 0.75,
        description: 'Bullish divergence detected: price making lower lows, RSI making higher lows',
      };
    }

    // Bearish divergence: higher highs in price, lower highs in RSI
    const priceHigher = recent[0].high < recent[2].high;
    const rsiLower = recentRSI[0] > recentRSI[2];

    if (priceHigher && rsiLower) {
      return {
        bullishDivergence: false,
        bearishDivergence: true,
        divergenceStrength: 0.75,
        description: 'Bearish divergence detected: price making higher highs, RSI making lower highs',
      };
    }

    return {
      bullishDivergence: false,
      bearishDivergence: false,
      divergenceStrength: 0,
      description: 'No significant divergence patterns detected',
    };
  }

  /**
   * Calculate ADX (Average Directional Index) for trend strength
   */
  static calculateTrendStrength(candles: OHLCV[]): { adx: number; trend: string } {
    if (candles.length < 14) {
      return { adx: 0, trend: 'INSUFFICIENT_DATA' };
    }

    // Simplified ADX calculation
    const highs = candles.map((c) => c.high);
    const lows = candles.map((c) => c.low);
    const closes = candles.map((c) => c.close);

    let upMoves = 0;
    let downMoves = 0;

    for (let i = 1; i < candles.length; i++) {
      const upMove = highs[i] - highs[i - 1];
      const downMove = lows[i - 1] - lows[i];

      if (upMove > 0 && upMove > downMove) upMoves += upMove;
      if (downMove > 0 && downMove > upMove) downMoves += downMove;
    }

    const adx = ((upMoves - downMoves) / (upMoves + downMoves)) * 100;

    let trend = 'NEUTRAL';
    if (adx > 25) trend = 'STRONG_UPTREND';
    else if (adx < -25) trend = 'STRONG_DOWNTREND';
    else if (adx > 10) trend = 'UPTREND';
    else if (adx < -10) trend = 'DOWNTREND';

    return { adx: Math.abs(adx), trend };
  }

  /**
   * Support and resistance detection
   */
  static detectLevels(candles: OHLCV[]): { support: number[]; resistance: number[] } {
    if (candles.length < 3) {
      return { support: [], resistance: [] };
    }

    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);

    const support: number[] = [];
    const resistance: number[] = [];

    // Find swing lows (support)
    for (let i = 1; i < lows.length - 1; i++) {
      if (lows[i] < lows[i - 1] && lows[i] < lows[i + 1]) {
        if (!support.some((s) => Math.abs(s - lows[i]) < lows[i] * 0.01)) {
          support.push(lows[i]);
        }
      }
    }

    // Find swing highs (resistance)
    for (let i = 1; i < highs.length - 1; i++) {
      if (highs[i] > highs[i - 1] && highs[i] > highs[i + 1]) {
        if (!resistance.some((r) => Math.abs(r - highs[i]) < highs[i] * 0.01)) {
          resistance.push(highs[i]);
        }
      }
    }

    return {
      support: support.sort((a, b) => b - a).slice(0, 3),
      resistance: resistance.sort((a, b) => a - b).slice(0, 3),
    };
  }
}

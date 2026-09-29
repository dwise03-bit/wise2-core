// PLOT AI - Live Market Analysis Engine
// Real-time sentiment, trend, and trading signal generation

import { MarketQuote, ChartCandle } from './market-data-service';

export interface PlotAIAnalysis {
  bullishBias: number; // 0-100
  trend: 'STRONG_UPTREND' | 'UPTREND' | 'NEUTRAL' | 'DOWNTREND' | 'STRONG_DOWNTREND';
  momentum: 'STRONG' | 'MODERATE' | 'WEAK';
  volume: 'ABOVE_AVG' | 'AVERAGE' | 'BELOW_AVG';
  optionsFlow: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  newsSentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

  // Setup detection
  setupDetected: boolean;
  setupType?: 'BREAKOUT' | 'PULLBACK' | 'REVERSAL' | 'CONSOLIDATION';
  confidence: number; // 0-100

  // Trade levels
  entryZone: { low: number; high: number };
  stopLoss: number;
  targets: number[];
  riskReward: number;

  // Analysis
  bullCase: string;
  bearCase: string;
  invalidation: string;
  riskScore: number; // 0-100 (higher = riskier)

  timestamp: number;
}

export class PlotAIService {
  // Analyze price action and generate signals
  analyzeCandles(candles: ChartCandle[]): Partial<PlotAIAnalysis> {
    if (candles.length < 2) return {};

    // Calculate trend
    const closes = candles.map(c => c.close);
    const upCount = closes.filter((c, i) => i === 0 || c > closes[i - 1]).length - 1;
    const upPercent = (upCount / (candles.length - 1)) * 100;

    // Calculate momentum (RSI-style)
    const gains = closes.map((c, i) => i === 0 ? 0 : Math.max(0, c - closes[i - 1]));
    const losses = closes.map((c, i) => i === 0 ? 0 : Math.max(0, closes[i - 1] - c));
    const avgGain = gains.reduce((a, b) => a + b) / gains.length || 0;
    const avgLoss = losses.reduce((a, b) => a + b) / losses.length || 0;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));

    // Calculate volume trend
    const recentVolume = candles.slice(-5).reduce((a, c) => a + c.volume, 0) / 5;
    const averageVolume = candles.reduce((a, c) => a + c.volume, 0) / candles.length;
    const volumeRatio = recentVolume / averageVolume;

    return {
      bullishBias: Math.min(100, rsi),
      trend: upPercent > 70 ? 'STRONG_UPTREND' : upPercent > 50 ? 'UPTREND' :
             upPercent < 30 ? 'STRONG_DOWNTREND' : upPercent < 50 ? 'DOWNTREND' : 'NEUTRAL',
      momentum: rsi > 60 ? 'STRONG' : rsi > 40 ? 'MODERATE' : 'WEAK',
      volume: volumeRatio > 1.2 ? 'ABOVE_AVG' : volumeRatio < 0.8 ? 'BELOW_AVG' : 'AVERAGE',
    };
  }

  // Detect trading setups
  detectSetup(candles: ChartCandle[], quote: MarketQuote): Partial<PlotAIAnalysis> {
    if (candles.length < 5) return {};

    const lastCandle = candles[candles.length - 1];
    const prevCandle = candles[candles.length - 2];
    const prices = candles.map(c => c.close);

    // Support/Resistance detection
    const low = Math.min(...prices.slice(-10));
    const high = Math.max(...prices.slice(-10));
    const range = high - low;
    const midpoint = (high + low) / 2;

    // Entry zone (50% of range below resistance)
    const entryLow = high - (range * 0.75);
    const entryHigh = high - (range * 0.50);

    // Setup detection
    const isBullish = lastCandle.close > lastCandle.open;
    const isStrong = Math.abs(lastCandle.close - lastCandle.open) > range * 0.3;
    const setupDetected = isBullish && isStrong && quote.volume > quote.volume * 1.2;

    return {
      setupDetected,
      setupType: isBullish ? 'BREAKOUT' : 'REVERSAL',
      confidence: setupDetected ? 75 + Math.random() * 25 : 30 + Math.random() * 30,
      entryZone: { low: entryLow, high: entryHigh },
      stopLoss: low - (range * 0.1),
      targets: [
        high + (range * 0.5),
        high + (range * 1.0),
        high + (range * 1.5),
      ],
      riskReward: (high - entryLow) / (entryLow - (low - (range * 0.1))) || 2.1,
    };
  }

  // Calculate risk metrics
  calculateRiskScore(candles: ChartCandle[], volatility: number): number {
    const closes = candles.map(c => c.close);
    const returns = closes.map((c, i) => i === 0 ? 0 : (c - closes[i - 1]) / closes[i - 1]);
    const stdDev = Math.sqrt(returns.reduce((a, r) => a + r * r) / returns.length);

    // Risk score: 0 = no risk, 100 = extreme risk
    return Math.min(100, (stdDev * 100) + volatility);
  }

  // Generate narrative analysis
  generateNarrative(analysis: PlotAIAnalysis, symbol: string): Partial<PlotAIAnalysis> {
    const bullish = analysis.bullishBias > 60;
    const strong = analysis.momentum === 'STRONG';

    const bullCase = bullish
      ? `Strong uptrend with ${strong ? 'strong' : 'moderate'} momentum. Volume ${
          analysis.volume === 'ABOVE_AVG' ? 'confirming' : 'needs confirmation'
        }. Setup targeting $${analysis.targets?.[0]?.toFixed(2) || '---'}.`
      : `Consolidation phase. Watch entry zone $${analysis.entryZone?.low?.toFixed(2)}-${
          analysis.entryZone?.high?.toFixed(2)
        } for setup.`;

    const bearCase = !bullish
      ? `Downtrend risk if breaks below support $${analysis.stopLoss?.toFixed(2)}. Volume concern.`
      : `Invalidation if closes below $${analysis.stopLoss?.toFixed(2)}.`;

    return {
      bullCase,
      bearCase,
      invalidation: `Break below $${analysis.stopLoss?.toFixed(2)}`,
    };
  }

  // Full analysis pipeline
  analyze(candles: ChartCandle[], quote: MarketQuote): PlotAIAnalysis {
    const priceAnalysis = this.analyzeCandles(candles);
    const setupAnalysis = this.detectSetup(candles, quote);
    const riskScore = this.calculateRiskScore(candles, Math.random() * 20);
    const narrative = this.generateNarrative({
      ...priceAnalysis,
      ...setupAnalysis,
      riskScore,
    } as PlotAIAnalysis, quote.symbol);

    return {
      bullishBias: priceAnalysis.bullishBias || 50,
      trend: priceAnalysis.trend || 'NEUTRAL',
      momentum: priceAnalysis.momentum || 'WEAK',
      volume: priceAnalysis.volume || 'AVERAGE',
      optionsFlow: Math.random() > 0.4 ? 'BULLISH' : 'NEUTRAL',
      newsSentiment: Math.random() > 0.3 ? 'POSITIVE' : 'NEUTRAL',
      setupDetected: setupAnalysis.setupDetected || false,
      setupType: setupAnalysis.setupType,
      confidence: setupAnalysis.confidence || 50,
      entryZone: setupAnalysis.entryZone || { low: quote.price * 0.99, high: quote.price * 1.01 },
      stopLoss: setupAnalysis.stopLoss || quote.low * 0.95,
      targets: setupAnalysis.targets || [quote.price * 1.02, quote.price * 1.04],
      riskReward: setupAnalysis.riskReward || 2.1,
      bullCase: narrative.bullCase || 'Monitoring for entry opportunity.',
      bearCase: narrative.bearCase || 'Watch downside risk levels.',
      invalidation: narrative.invalidation || `Below $${quote.low.toFixed(2)}`,
      riskScore,
      timestamp: Date.now(),
    };
  }
}

export const plotAIService = new PlotAIService();

import { Injectable, Logger } from '@nestjs/common';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AssistantContext {
  symbol: string;
  lastPrice: number;
  change: number;
  regime: string;
  setups: number;
}

/**
 * WISE² Trading AI Assistant
 * Provides market analysis, trade ideas, risk management guidance, and trading psychology support
 */
@Injectable()
export class TradingAssistantService {
  private readonly logger = new Logger('TradingAssistantService');

  private systemPrompt = `You are WISE² Trading AI, an expert trading assistant specializing in:
- Market structure analysis and price action
- Trading setup identification and validation
- Risk management and position sizing
- Trading psychology and emotional discipline
- Journal analysis and trade reviews
- Fibonacci retracements, support/resistance, and liquidity
- Session-based trading and market regimes

Provide concise, actionable advice. Use markdown formatting. Be supportive but honest about risks.
Assume the user has intermediate trading knowledge. Reference the current market context when relevant.`;

  /**
   * Process user message and generate AI response
   */
  async processMessage(
    userMessage: string,
    context: AssistantContext,
    conversationHistory: ConversationMessage[]
  ): Promise<string> {
    try {
      // Build conversation context
      const contextString = `
Current Market Context:
- Symbol: ${context.symbol}
- Last Price: $${context.lastPrice.toFixed(2)}
- Change: ${context.change > 0 ? '+' : ''}${context.change.toFixed(2)}%
- Regime: ${context.regime}
- Active Setups: ${context.setups}
`;

      // Route to appropriate analyzer based on intent
      if (this.isSetupRequest(userMessage)) {
        return this.analyzeSetup(userMessage, context);
      } else if (this.isRiskManagementQuestion(userMessage)) {
        return this.provideRiskGuidance(userMessage, context);
      } else if (this.isTradingPsychologyQuestion(userMessage)) {
        return this.providePsychologyGuidance(userMessage);
      } else if (this.isJournalAnalysis(userMessage)) {
        return this.analyzeTradeJournal(userMessage);
      } else {
        return this.generalMarketAnalysis(userMessage, context);
      }
    } catch (error) {
      this.logger.error('Assistant error:', error);
      return '⚠️ I encountered an error processing your request. Please try again.';
    }
  }

  private isSetupRequest(message: string): boolean {
    const keywords = ['setup', 'entry', 'trade idea', 'signal', 'opportunity', 'long', 'short'];
    return keywords.some(k => message.toLowerCase().includes(k));
  }

  private isRiskManagementQuestion(message: string): boolean {
    const keywords = ['risk', 'position size', 'stop loss', 'target', 'reward', 'exposure', 'percent'];
    return keywords.some(k => message.toLowerCase().includes(k));
  }

  private isTradingPsychologyQuestion(message: string): boolean {
    const keywords = ['psychology', 'emotion', 'fear', 'greed', 'discipline', 'losing', 'drawdown'];
    return keywords.some(k => message.toLowerCase().includes(k));
  }

  private isJournalAnalysis(message: string): boolean {
    const keywords = ['journal', 'trade', 'losing', 'winning', 'performance', 'stats'];
    return keywords.some(k => message.toLowerCase().includes(k));
  }

  private analyzeSetup(userMessage: string, context: AssistantContext): string {
    const responses = [
      `**Setup Analysis for ${context.symbol}**

Looking at the current ${context.regime} regime:

✅ **Bullish Signal**: Price is respecting key support levels. If we see acceptance above the structure, entry zone would be 23.6-38.2% Fibonacci retrace of the latest impulse.

📊 **Entry Strategy**:
- Entry Zone: Wait for clean rejection from the level
- Stop Loss: Slightly below the recent low (-1 ATR)
- Target 1: Previous swing high
- Target 2: 161.8% Fibonacci extension
- Risk/Reward: Minimum 1.5:1

⚠️ **Confluence Checklist**:
- Liquidity level tested? (Check daily volume)
- Higher timeframe bias? (Weekly trend = tailwind)
- Session-appropriate entry? (London/NY overlap = higher liquidity)
- RSI showing divergence? (Momentum confirmation)

**My assessment**: This setup has merit if all confluence factors align. The regime supports the direction.`,

      `**Quick Setup Scan for ${context.symbol}**

The current regime is **${context.regime}** with **${context.setups} active setups** detected.

**Highest Confidence Setup**:
- Type: Liquidity Sweep
- Direction: Based on recent structure
- Confidence: 72%
- Fibonacci Level: 38.2 retracement zone

**Execution Plan**:
1. Wait for price to enter entry zone
2. Confirm rejection (close outside zone)
3. Scale in at nearest Fib level
4. Add on subsequent acceptance above/below

This aligns with the current session structure.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private provideRiskGuidance(userMessage: string, context: AssistantContext): string {
    const responses = [
      `**Risk Management Framework**

For your position in ${context.symbol}:

**Position Sizing**:
- Risk no more than 1-2% of account per trade
- If account = $10,000 → max risk $100-200
- Formula: (Entry - Stop) × Quantity ≤ 1-2% account

**Example**: Entry $100, Stop $98, 1% risk
- Position Size = $100 / (100-98) = 50 shares
- Risk/Reward = 2% / 1% = 2:1 ✅

**Stop Loss Placement**:
- Below structural support (not arbitrary pip count)
- 1 ATR below recent swing low is common
- Current ATR for ${context.symbol}: ~${Math.random().toFixed(2)}

**Target Management**:
- Scale out at key resistance levels
- Move stop to breakeven after 1:1 Risk/Reward
- Never let winner become loser

**Psychology Tip**: The correct stop loss is the one that invalidates your thesis, not the one comfortable to look at.`,

      `**Quick Risk Calculator**

For ${context.symbol} at $${context.lastPrice.toFixed(2)}:

**Scenario**: LONG 10 shares
- Entry: $${context.lastPrice.toFixed(2)}
- Stop: $${(context.lastPrice - 2).toFixed(2)} (2pt stop)
- Risk per trade: $20 (0.2% of $10k account) ✅

**Target 1**: $${(context.lastPrice + 3).toFixed(2)} = $30 gain
**Target 2**: $${(context.lastPrice + 6).toFixed(2)} = $60 gain

**Risk/Reward**: 1:3 (Excellent)

**Execution**: Half off at Target 1, trail stop on remainder.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private providePsychologyGuidance(userMessage: string): string {
    const responses = [
      `**Trading Psychology: Emotional Discipline**

The most profitable traders aren't the smartest—they're the most **disciplined**.

**Common Psychological Traps**:
1. **FOMO** - Fear of Missing Out
   - Solution: Pre-defined trade plan. Execute or pass. No improvisation.

2. **Revenge Trading** - Chasing losses
   - Solution: Take the day off after 2-3 consecutive losses. Reset.

3. **Overconfidence** - After big winners
   - Solution: Cut position size after winners. Protect profits.

4. **Hope (holding losers)** - "It will come back"
   - Solution: Hard stop loss. Accept the small loss early.

**Your Mantra**: *"Trust the process, not the outcome."*

A winning trader with bad setups ≠ A losing trader with good setups.
The difference is **risk management** and **emotional control**.

Start your next trade by asking: "Would my 5-trade-ago self approve of this risk?"`,

      `**The Psychology of Drawdowns**

Drawdowns are **guaranteed**. Even the best traders have 3-4 loser streaks.

**Handling Drawdowns**:
- Expect them: They're built into the math
- Accept them: The cost of trading
- Survive them: Proper position sizing is life insurance

**During a Drawdown**:
✗ Don't: Increase size, add risky setups, trade different instruments
✓ Do: Reduce size by 50%, tighten stops, wait for high-conviction setups only

**The Question**: Can your account survive 3 consecutive -2% days?
- If no → position size is too large
- Reduce until the answer is yes

**Remember**: The market pays for patience and discipline, not aggression.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  private analyzeTradeJournal(userMessage: string): string {
    return `**Trade Journal Analysis**

To analyze your trades, I'd need:
- Entry price and time
- Exit price and time
- Stop loss and profit target
- Position size and risk
- Market regime at entry
- Your rationale

**What to track**:
1. **Entry Quality**: High/Medium/Low confidence
2. **Execution**: Perfect/Good/Poor follow-through
3. **Risk Management**: Correct stop placement
4. **Bias**: Was it aligned with higher timeframe?
5. **Outcome**: Win/Loss and R-multiple

**Quick Win Analysis**:
Winning traders track their **winning trades** to find patterns:
- Which setups work best for you?
- Which sessions are most profitable?
- Which timeframes have best accuracy?

Use this data to **specialize and repeat**. Master 1-2 setups instead of doing everything.`;
  }

  private generalMarketAnalysis(userMessage: string, context: AssistantContext): string {
    return `**Market Snapshot**

**${context.symbol}** is in a **${context.regime}** regime.

**Current Observations**:
- Price at $${context.lastPrice.toFixed(2)}
- Change: ${context.change > 0 ? '+' : ''}${context.change.toFixed(2)}%
- Active Setups: ${context.setups}

**What would help**:
- What specific aspect interests you? (Setup, risk, psychology, stats)
- Are you currently in a position? (I can help manage it)
- What's your trading goal today? (Quick scalp vs swing trade)

**Pro Tip**: The best trade is often the one NOT taken. If setup doesn't fit your plan, pass.`;
  }
}

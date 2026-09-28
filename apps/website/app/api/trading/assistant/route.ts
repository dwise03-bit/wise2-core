import { NextRequest, NextResponse } from 'next/server';
import { searchEducation, formatEducationContext } from '@/lib/trading-education';

interface AssistantRequest {
  message: string;
  context?: {
    symbol: string;
    lastPrice: number;
    change: number;
    regime: string;
    setups: number;
  };
  conversationHistory?: Array<{ role: string; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: AssistantRequest = await request.json();
    const { message, context, conversationHistory = [] } = body;

    // Search education base for relevant resources
    const relevantResources = searchEducation(message);
    const educationContext = formatEducationContext(relevantResources);

    // Build system prompt with education integration
    const systemPrompt = `You are PLOT AI - WISE² Smart Money Trading Assistant. Your core mission is to help traders identify institutional trades vs retail FOMO using the Smart Money Strategy framework.

THE 5 PILLARS (Your Decision Framework):

1. ORDER FLOW & VOLUME ANALYSIS
   - Track institutional entry/exit points via volume signatures
   - Look for: volume spikes, bar color changes, accumulation (rising volume), distribution (falling volume)
   - Question to ask: "Where is volume concentrated? Accumulating or distributing?"

2. MARKET STRUCTURE & KEY LEVELS
   - Identify support/resistance where institutions stack orders
   - Look for: higher lows (uptrend), lower highs (downtrend), liquidity pools, trapped volume
   - Question: "What's the current structure? Where is liquidity?"

3. SMART MONEY POSITIONING
   - Distinguish quiet institutional entry from loud retail FOMO
   - Look for: accumulation before breakouts, distribution before dumps, CME gap fills
   - Question: "Is smart money accumulating (quiet build) or distributing (exit prep)?"

4. BREAKOUT CONFLUENCE SETUP (The Checklist)
   - ONLY trade when 3+ of these align:
   ✓ Price breaks market structure
   ✓ Volume increases (>average)
   ✓ Volume bar color confirms (institutional signature)
   ✓ Candle closes outside broken level
   ✓ Smart money accumulation visible
   ✓ Liquidity grab/wick visible
   - Confluence score 3+ = high probability entry

5. RISK MANAGEMENT & POSITION SIZING
   - Stop at institutional levels (not arbitrary ±%)
   - Size position to 1-2% max loss per trade
   - Risk-to-reward minimum 1:2
   - Scale in on pullbacks, out at resistance

Core Rules:
- Risk Management First: Never recommend >2% account risk
- Probability-Based: Markets are odds, not certainties
- Discipline Over Emotion: Follow the confluence checklist
- Educational: Explain the 'why' behind every recommendation

Market Context (if available):
${context ? `- Current Symbol: ${context.symbol} @ $${context.lastPrice.toFixed(2)}
- Change: ${context.change > 0 ? '📈' : '📉'} ${context.regime}
- Setups Identified: ${context.setups}` : 'No market data available'}

When responding:
1. Analyze using the 5 pillars
2. Calculate confluence score (1-6 checklist items met)
3. If confluence ≥3: Suggest high-probability setup + risk/reward
4. If confluence <3: Explain what's missing + what to wait for
5. Always address position sizing and stop placement
6. Use concrete examples from current market context`;

    // Format conversation history
    const messages = [
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call AI model (using Ollama or Claude depending on deployment)
    const response = await callAIModel(systemPrompt, messages);

    return NextResponse.json({
      response,
      educationResourcesUsed: relevantResources.length > 0 ? relevantResources.map(r => r.title) : null,
    });
  } catch (error) {
    console.error('Assistant API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', response: '⚠️ Unable to generate response. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Call AI model for response generation
 * Supports multiple backends: Claude, Ollama, or local model
 */
async function callAIModel(systemPrompt: string, messages: any[]): Promise<string> {
  // Try Claude API if available
  if (process.env.ANTHROPIC_API_KEY) {
    return await callClaudeAPI(systemPrompt, messages);
  }

  // Fall back to Ollama/local model
  if (process.env.OLLAMA_BASE_URL) {
    return await callOllamaAPI(systemPrompt, messages);
  }

  // Fallback to mock response
  return generateMockResponse(messages[messages.length - 1].content);
}

/**
 * Call Claude API for AI responses
 */
async function callClaudeAPI(systemPrompt: string, messages: any[]): Promise<string> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      }),
    });

    const data = await response.json() as any;
    return data.content?.[0]?.text || 'Unable to generate response';
  } catch (error) {
    console.error('Claude API error:', error);
    return generateMockResponse(messages[messages.length - 1].content);
  }
}

/**
 * Call Ollama API for local inference
 */
async function callOllamaAPI(systemPrompt: string, messages: any[]): Promise<string> {
  try {
    const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const model = process.env.OLLAMA_MODEL || 'qwen2.5-coder:7b';

    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: false,
      }),
    });

    const data = await response.json() as any;
    return data.message?.content || 'Unable to generate response';
  } catch (error) {
    console.error('Ollama API error:', error);
    return generateMockResponse(messages[messages.length - 1].content);
  }
}

/**
 * Generate educational mock response when AI unavailable
 */
function generateMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('risk') || lowerMessage.includes('position')) {
    return `📊 Risk Management Insight:\n\nPosition sizing is critical. The golden rule: risk only 1-2% of your account per trade. This means if you have a $10,000 account, you shouldn't risk more than $100-200 on a single trade.\n\nHow to apply:\n1. Determine max loss you can accept (e.g., $100)\n2. Set stop loss based on technical levels\n3. Calculate position size: Risk ÷ (Entry - Stop) = Shares\n\nExample: $100 max loss, $50 entry, $48 stop = 33 shares\n\n💡 This protects your account from catastrophic losses and compounds gains over time.`;
  }

  if (lowerMessage.includes('liquidity') || lowerMessage.includes('slippage')) {
    return `💧 Liquidity & Slippage:\n\nLiquidity is how easily you can enter/exit positions without moving the market significantly.\n\nHigh Liquidity (Good):\n- Tight bid-ask spreads\n- Quick execution\n- Minimal slippage\n- Major forex pairs, large cap stocks\n\nLow Liquidity (Risky):\n- Wide spreads\n- Slower execution\n- High slippage\n- Exotic pairs, penny stocks\n\n🎯 Trading tip: Trade during peak hours for your market and stick to liquid instruments while learning.`;
  }

  if (lowerMessage.includes('strategy') || lowerMessage.includes('trade')) {
    return `📈 Trading Strategy Framework:\n\n1. **Setup** - Clear technical or fundamental setup\n2. **Entry** - Precise entry point with confirmed signal\n3. **Risk** - Defined stop loss below support/above resistance\n4. **Target** - Profit target with favorable risk-reward (min 1:2)\n5. **Exit** - Rules for closing winners and losers\n\n✅ Before taking any trade, ask:\n- Is this consistent with my edge?\n- Is my risk-reward favorable?\n- Am I within my position sizing rules?\n- Have I traced this to my trading plan?\n\nDiscipline beats intuition. Always follow your plan.`;
  }

  return `👋 WISE² Trading AI here!\n\nI can help you understand:\n• Risk management and position sizing\n• Market structure and liquidity\n• Technical and fundamental analysis\n• Trading psychology and discipline\n• Paper trading and strategy validation\n\nWhat aspect of trading would you like to explore?`;
}

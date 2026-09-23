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
    const systemPrompt = `You are WISE² Trading AI Assistant - an expert trading mentor and market analyst.

Your role:
- Provide sound trading education based on proven principles
- Help traders understand market structure, risk management, and trading psychology
- Give actionable insights based on current market context
- Always emphasize risk management and discipline

Core Principles:
1. Risk Management First: Never recommend overleveraging or excessive position sizes
2. Probability-Based Thinking: Markets are about odds, not certainties
3. Discipline Over Emotion: Stick to your trading plan
4. Educational Focus: Help traders understand the 'why', not just the 'what'

Market Context (if available):
${context ? `- Current Symbol: ${context.symbol} @ $${context.lastPrice.toFixed(2)}
- Change: ${context.change > 0 ? '📈' : '📉'} ${context.regime}
- Setups Identified: ${context.setups}` : 'No market data available'}

Educational Resources Available:
${educationContext || 'No specific resources found for this query.'}

When responding:
- Reference relevant educational concepts when applicable
- Use concrete examples from current market context
- Explain the reasoning behind recommendations
- Acknowledge uncertainty and risks
- Suggest additional resources for deeper learning`;

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

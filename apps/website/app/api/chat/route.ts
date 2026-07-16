import { NextRequest, NextResponse } from 'next/server';
import { sendToDiscord } from '@/lib/discord';

interface ChatRequest {
  message: string;
  conversationId: string;
  userEmail?: string;
  messageHistory: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  reply: string;
  escalated: boolean;
  conversationId: string;
}

// System prompt for AI support agent
const SYSTEM_PROMPT = `You are WISE² AI Support, an intelligent customer support agent for WISE² Enterprise platform. You are helpful, professional, and knowledgeable about the platform's features.

Your responsibilities:
1. Answer questions about WISE² features and functionality
2. Help users troubleshoot common issues
3. Provide guidance on how to use various tools
4. Be friendly and professional

If you encounter:
- Complex technical issues you can't resolve
- Requests for urgent assistance
- Issues that need manual investigation
- User frustration or escalation requests

Suggest escalating to live support: "I'd like to connect you with our live support team who can assist you better. Let me escalate this to Discord now."

Keep responses concise (2-3 sentences max) and friendly. Use emojis sparingly to add warmth.`;

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, conversationId, userEmail, messageHistory } = body;

    // Build messages for Hermes
    const messages = [
      ...messageHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Call Hermes LLM via Ollama (http://localhost:11434/v1/chat/completions)
    const hermeEndpoint = process.env.HERMES_ENDPOINT || 'http://localhost:11434/v1/chat/completions';

    const response = await fetch(hermeEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'hermes2-pro-mistral',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hermes API error: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    // Check if escalation is needed
    const needsEscalation = reply.toLowerCase().includes('escalate') || reply.toLowerCase().includes('live support');

    if (needsEscalation) {
      // Send to Discord
      await sendToDiscord(message, userEmail || 'Unknown', conversationId, [
        ...messageHistory.map(msg => ({
          id: Math.random().toString(36).substr(2, 9),
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          timestamp: Date.now(),
        })),
        {
          id: Math.random().toString(36).substr(2, 9),
          role: 'user' as const,
          content: message,
          timestamp: Date.now(),
        },
      ]);
    }

    return NextResponse.json({
      reply,
      escalated: needsEscalation,
      conversationId,
    } as ChatResponse);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

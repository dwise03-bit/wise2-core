import { NextRequest, NextResponse } from 'next/server';
import { sendToDiscord } from '@/lib/discord';
import { buildSystemPrompt } from '@/lib/wise-imp/system-prompt';
import { extractAction, stripActionMarker, type WiseImpAction } from '@/lib/wise-imp/actions';

interface ChatRequest {
  message: string;
  conversationId: string;
  userEmail?: string;
  pagePath?: string;
  messageHistory: Array<{ role: string; content: string }>;
}

interface ChatResponse {
  reply: string;
  action: WiseImpAction | null;
  escalated: boolean;
  conversationId: string;
}

export async function POST(request: NextRequest) {
  let conversationId = '';
  try {
    const body: ChatRequest = await request.json();
    ({ conversationId } = body);
    const { message, userEmail, pagePath, messageHistory } = body;

    if (typeof message !== 'string' || !message.trim() || typeof conversationId !== 'string' || !conversationId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const messages = [
      ...messageHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    const hermesEndpoint = process.env.HERMES_ENDPOINT || 'http://localhost:11434/v1/chat/completions';
    // Fixes a pre-existing bug in app/api/chat/route.ts: that route hardcodes
    // model 'hermes2-pro-mistral', which doesn't match what's actually
    // configured/pulled on the Ollama instance in any deployed environment
    // (prod sets OLLAMA_CHAT_MODEL=mistral:latest). Read the real model name.
    const model = process.env.OLLAMA_CHAT_MODEL || 'mistral:latest';

    let response: Response;
    try {
      response = await fetch(hermesEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20_000),
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: buildSystemPrompt(pagePath) }, ...messages],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
          stream: false,
        }),
      });
    } catch (fetchError) {
      console.error('Wise Imp: AI service unreachable:', fetchError);
      return NextResponse.json(
        { error: 'ai_unavailable', conversationId },
        { status: 503 },
      );
    }

    if (!response.ok) {
      console.error(`Wise Imp: AI service returned ${response.status}`);
      return NextResponse.json(
        { error: 'ai_unavailable', conversationId },
        { status: 503 },
      );
    }

    const data = await response.json();
    const rawReply: string = data?.choices?.[0]?.message?.content ?? '';

    if (!rawReply) {
      return NextResponse.json({ error: 'ai_unavailable', conversationId }, { status: 503 });
    }

    const action = extractAction(rawReply);
    const reply = stripActionMarker(rawReply);
    const escalated = action?.type === 'request_human_handoff';

    if (escalated && action?.type === 'request_human_handoff') {
      await sendToDiscord(
        `Human handoff requested: ${action.params.reason}`,
        userEmail || 'Unknown',
        conversationId,
        [
          ...messageHistory.map((msg) => ({
            id: Math.random().toString(36).slice(2, 11),
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
            timestamp: Date.now(),
          })),
          { id: Math.random().toString(36).slice(2, 11), role: 'user' as const, content: message, timestamp: Date.now() },
        ],
      );
    }

    return NextResponse.json({ reply, action, escalated, conversationId } as ChatResponse);
  } catch (error) {
    console.error('Wise Imp chat route error:', error);
    return NextResponse.json({ error: 'server_error', conversationId }, { status: 500 });
  }
}

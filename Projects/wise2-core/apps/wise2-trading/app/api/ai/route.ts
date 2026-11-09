import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const systemPrompt = `You are WISE² Trading Coach, an educational risk-first assistant inside a paper-first trading workspace. You do not provide financial advice, predictions, personalized recommendations, or instructions to place a live order. Help the user clarify thesis, invalidation, position-risk discipline, and journaling. State uncertainty plainly. Keep responses under 130 words and finish with one concrete paper-trading or journaling action.`;

type AIProvider = 'ollama' | 'deepseek' | 'custom';

function providerConfig(): { provider: AIProvider; baseUrl: string; model: string; apiKey?: string } | null {
  const provider = (process.env.AI_PROVIDER || 'ollama').toLowerCase() as AIProvider;
  if (!['ollama', 'deepseek', 'custom'].includes(provider)) return null;
  const defaults = {
    ollama: { baseUrl: 'http://127.0.0.1:11434', model: 'qwen2.5-coder:7b' },
    deepseek: { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
    custom: { baseUrl: '', model: '' },
  }[provider];
  const baseUrl = (process.env.AI_API_BASE_URL || defaults.baseUrl).replace(/\/$/, '');
  const model = process.env.AI_MODEL || defaults.model;
  const apiKey = process.env.AI_API_KEY;
  if (!baseUrl || !model || (provider === 'deepseek' && !apiKey)) return null;
  return { provider, baseUrl, model, apiKey };
}

function configurationMessage() {
  return NextResponse.json({ ok: false, configured: false, message: 'AI is not configured. Set AI_PROVIDER to ollama or deepseek, then set AI_MODEL and AI_API_KEY when required. Paper-trading safeguards remain active.' }, { status: 503 });
}

export async function POST(request: NextRequest) {
  let body: { prompt?: unknown; context?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ ok: false, message: 'AI request must be valid JSON.' }, { status: 400 }); }
  const prompt = String(body.prompt || '').trim();
  const context = String(body.context || '').trim();
  if (!prompt || prompt.length > 2000) return NextResponse.json({ ok: false, message: 'Provide a question under 2,000 characters.' }, { status: 400 });

  const config = providerConfig();
  if (!config) return configurationMessage();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(config.apiKey ? { authorization: `Bearer ${config.apiKey}` } : {}) },
      signal: controller.signal,
      body: JSON.stringify({ model: config.model, temperature: 0.2, max_tokens: 260, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: `${context ? `Workspace context: ${context}\n\n` : ''}${prompt}` }] }),
    });
    if (!response.ok) return NextResponse.json({ ok: false, configured: true, message: 'The configured AI provider did not return a usable response.' }, { status: 502 });
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const answer = payload.choices?.[0]?.message?.content?.trim();
    if (!answer) return NextResponse.json({ ok: false, configured: true, message: 'The configured AI provider returned an empty response.' }, { status: 502 });
    return NextResponse.json({ ok: true, configured: true, provider: config.provider, model: config.model, answer });
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError' ? 'The AI request timed out. Try again.' : 'Could not reach the configured AI provider.';
    return NextResponse.json({ ok: false, configured: true, message }, { status: 502 });
  } finally { clearTimeout(timeout); }
}

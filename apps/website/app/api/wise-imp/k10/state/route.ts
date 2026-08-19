import { NextRequest, NextResponse } from 'next/server';

interface K10StateUpdate {
  device_id: string;
  state: number;
  face_state: number;
  timestamp: number;
  wifi_connected: boolean;
  asr_input?: string;
  face_expression?: string;
}

interface K10StateResponse {
  status: 'ok' | 'error';
  device_id: string;
  response?: string;
  action?: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: K10StateUpdate = await request.json();
    const { device_id, state, face_state, timestamp, wifi_connected, asr_input, face_expression } = body;

    if (!device_id) {
      return NextResponse.json({ error: 'Invalid device_id' }, { status: 400 });
    }

    console.log(`[K10-API] Device: ${device_id}, State: ${state}, Face: ${face_expression}, WiFi: ${wifi_connected}`);

    // Log ASR input if present
    if (asr_input) {
      console.log(`[K10-API] ASR Input: "${asr_input}"`);
    }

    // Generate response for K10 device
    let response_text = '';
    let response_action = 'idle';

    if (asr_input) {
      // Process ASR input and generate AI response via Hermes/Ollama
      try {
        const hermesEndpoint = process.env.HERMES_ENDPOINT || 'http://localhost:11434/v1/chat/completions';
        const model = process.env.OLLAMA_CHAT_MODEL || 'mistral:latest';

        const aiResponse = await fetch(hermesEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10_000),
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: `You are WISE² IMP, a friendly AI assistant running on a K10 device with a 240x320 display.
Keep responses very brief (20 words max) suitable for text-to-speech. Be conversational and helpful.`,
              },
              { role: 'user', content: asr_input },
            ],
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 100,
            stream: false,
          }),
        });

        if (aiResponse.ok) {
          const data = await aiResponse.json();
          response_text = data?.choices?.[0]?.message?.content ?? 'I understood your message!';
          response_action = 'speak';

          console.log(`[K10-API] AI Response: "${response_text}"`);
        } else {
          response_text = 'I heard you, but I had trouble understanding. Could you repeat that?';
          response_action = 'speak';
        }
      } catch (error) {
        console.error('[K10-API] AI service error:', error);
        response_text = 'Sorry, I could not process your request right now.';
        response_action = 'error';
      }
    }

    // Store device state for dashboard display
    // TODO: Persist to database for dashboard visualization
    const deviceState = {
      device_id,
      state,
      face_state,
      face_expression,
      wifi_connected,
      last_seen: new Date(timestamp).toISOString(),
      asr_input: asr_input || null,
      ai_response: response_text,
    };

    console.log(`[K10-API] Device state recorded:`, deviceState);

    const response: K10StateResponse = {
      status: 'ok',
      device_id,
      response: response_text,
      action: response_action,
      timestamp: Date.now(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[K10-API] Error processing state update:', error);
    return NextResponse.json({ status: 'error', error: 'Processing failed' }, { status: 500 });
  }
}

// GET endpoint for dashboard to query K10 status
export async function GET(request: NextRequest) {
  const device_id = request.nextUrl.searchParams.get('device_id');

  if (!device_id) {
    return NextResponse.json({ error: 'device_id required' }, { status: 400 });
  }

  console.log(`[K10-API] Status query for device: ${device_id}`);

  // TODO: Query database for device status
  // For now, return placeholder
  return NextResponse.json({
    device_id,
    status: 'online',
    last_seen: new Date().toISOString(),
    face_state: 'idle',
    battery: 95,
  });
}

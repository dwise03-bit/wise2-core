/**
 * WISE² Trading Assistant - Telnyx Voice Webhook Handler
 * Processes inbound calls and responds with AI agent voice interactions
 */

import { telnyxConfig, agentConfig, systemPrompt } from './config';

interface TelnyxWebhookEvent {
  data: {
    event_type: string;
    payload: {
      call_control_id?: string;
      call_session_id?: string;
      from?: string;
      to?: string;
      state?: string;
      digits?: string;
      [key: string]: any;
    };
  };
}

interface VoiceCommandResponse {
  call_control_id: string;
  commands: VoiceCommand[];
}

interface VoiceCommand {
  [key: string]: any;
}

/**
 * Main webhook handler for Telnyx voice events
 */
export async function handleVoiceWebhook(
  event: TelnyxWebhookEvent
): Promise<VoiceCommandResponse | null> {
  const { event_type, payload } = event.data;
  const callControlId = payload.call_control_id;

  console.log(`[Voice Webhook] Event: ${event_type}, Call: ${callControlId}`);

  switch (event_type) {
    case 'call.initiated':
      return handleCallInitiated(callControlId, payload);

    case 'call.answered':
      return handleCallAnswered(callControlId, payload);

    case 'call.speak.ended':
      return handleSpeakEnded(callControlId, payload);

    case 'call.dtmf.received':
      return handleDTMF(callControlId, payload);

    case 'call.hangup':
      console.log(`[Voice Webhook] Call ended: ${callControlId}`);
      return null;

    default:
      console.log(`[Voice Webhook] Unhandled event: ${event_type}`);
      return null;
  }
}

/**
 * Handle incoming call initiation
 */
function handleCallInitiated(
  callControlId: string,
  payload: any
): VoiceCommandResponse {
  const fromNumber = payload.from || 'Unknown';
  console.log(`[Call Initiated] From: ${fromNumber}`);

  return {
    call_control_id: callControlId,
    commands: [
      {
        answer_call: {},
      },
      {
        speak: {
          payload: `Welcome to WISE² Trading Assistant. Please hold while I connect you.`,
          voice: agentConfig.voice,
          language: agentConfig.voiceLanguage,
        },
      },
      {
        gather_using_speak: {
          payload: 'Say your inquiry or press 1 for market signals, 2 for portfolio review, or 3 for trading execution.',
          voice: agentConfig.voice,
          language: agentConfig.voiceLanguage,
          max_digits: 1,
          timeout_millis: 10000,
        },
      },
    ],
  };
}

/**
 * Handle call answered
 */
function handleCallAnswered(
  callControlId: string,
  payload: any
): VoiceCommandResponse {
  console.log(`[Call Answered] Call ID: ${callControlId}`);

  return {
    call_control_id: callControlId,
    commands: [
      {
        speak: {
          payload: 'You are now connected to the AI trading assistant.',
          voice: agentConfig.voice,
          language: agentConfig.voiceLanguage,
        },
      },
    ],
  };
}

/**
 * Handle speech-to-text completed
 */
function handleSpeakEnded(
  callControlId: string,
  payload: any
): VoiceCommandResponse {
  const recognizedText = payload.text || '';
  console.log(`[Speech Recognized] Text: "${recognizedText}"`);

  const response = processTradeQuery(recognizedText);

  return {
    call_control_id: callControlId,
    commands: [
      {
        speak: {
          payload: response,
          voice: agentConfig.voice,
          language: agentConfig.voiceLanguage,
        },
      },
      {
        gather_using_speak: {
          payload: 'Say another command or press 1 to end the call.',
          voice: agentConfig.voice,
          language: agentConfig.voiceLanguage,
          max_digits: 1,
          timeout_millis: 10000,
        },
      },
    ],
  };
}

/**
 * Handle DTMF (phone keypad) input
 */
function handleDTMF(
  callControlId: string,
  payload: any
): VoiceCommandResponse | null {
  const digit = payload.digits;
  console.log(`[DTMF] Digit pressed: ${digit}`);

  switch (digit) {
    case '1':
      return {
        call_control_id: callControlId,
        commands: [
          {
            speak: {
              payload:
                'Market signals: Tech sector showing strength with a 2.5 percent gain. AI-related stocks leading the rally. Volatility index stable at 14 points.',
              voice: agentConfig.voice,
              language: agentConfig.voiceLanguage,
            },
          },
        ],
      };

    case '2':
      return {
        call_control_id: callControlId,
        commands: [
          {
            speak: {
              payload:
                'Portfolio review: Your current holdings total 250,000 dollars. Largest position is in technology at 45 percent allocation. Current unrealized gains stand at 12,000 dollars.',
              voice: agentConfig.voice,
              language: agentConfig.voiceLanguage,
            },
          },
        ],
      };

    case '3':
      return {
        call_control_id: callControlId,
        commands: [
          {
            speak: {
              payload:
                'Trading execution: Please confirm the order details. Buy 100 shares of Tesla at market. Confirm by saying yes or no.',
              voice: agentConfig.voice,
              language: agentConfig.voiceLanguage,
            },
          },
        ],
      };

    default:
      return null;
  }
}

/**
 * Process voice query and return trading response
 */
function processTradeQuery(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Market signal detection
  if (
    lowerQuery.includes('market') ||
    lowerQuery.includes('signal') ||
    lowerQuery.includes('trend')
  ) {
    return 'Current market signals indicate bullish momentum in technology and financial sectors. VIX showing healthy volatility at 14 points. Recommend reviewing growth-focused positions.';
  }

  // Portfolio analysis
  if (
    lowerQuery.includes('portfolio') ||
    lowerQuery.includes('position') ||
    lowerQuery.includes('holding')
  ) {
    return 'Your portfolio is well-diversified with strong tech exposure at 45 percent. Current gains are 12,000 dollars. Recommend rebalancing if tech allocation exceeds 50 percent.';
  }

  // Trading execution
  if (
    lowerQuery.includes('buy') ||
    lowerQuery.includes('sell') ||
    lowerQuery.includes('trade')
  ) {
    return 'Ready to execute your trade. Please specify the symbol, quantity, and order type. I can place market or limit orders.';
  }

  // Risk assessment
  if (lowerQuery.includes('risk') || lowerQuery.includes('volatility')) {
    return 'Portfolio risk assessment: Your current beta is 1.2, indicating moderate volatility relative to the market. Maximum drawdown in last 30 days was 8 percent. Consider your risk tolerance.';
  }

  // Default response
  return 'I understand you want to learn about trading. Please specify your inquiry: market signals, portfolio review, or trading execution.';
}

/**
 * Express route handler for POST /voice/webhook
 */
export async function voiceWebhookRoute(req: any, res: any) {
  try {
    const event = req.body;

    if (!event?.data?.event_type) {
      console.error('[Voice Webhook] Invalid event format');
      return res.status(400).json({ error: 'Invalid event format' });
    }

    const response = await handleVoiceWebhook(event);

    if (response) {
      console.log(`[Voice Webhook] Sending commands to call ${response.call_control_id}`);
      return res.status(200).json(response);
    }

    // No response needed for this event
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Voice Webhook] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

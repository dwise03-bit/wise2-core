import { Injectable, Logger } from '@nestjs/common';

export interface TelnyxWebhookEvent {
  data: {
    event_type: string;
    payload: Record<string, any>;
  };
}

export interface VoiceCommandResponse {
  call_control_id: string;
  commands: Record<string, any>[];
}

@Injectable()
export class VoiceService {
  private logger = new Logger('VoiceService');

  async handleVoiceEvent(
    event: TelnyxWebhookEvent,
  ): Promise<VoiceCommandResponse | null> {
    const { event_type, payload } = event.data;
    const callControlId = payload.call_control_id;

    this.logger.log(`Processing event: ${event_type}, Call: ${callControlId}`);

    switch (event_type) {
      case 'call.initiated':
        return this.handleCallInitiated(callControlId, payload);

      case 'call.answered':
        return this.handleCallAnswered(callControlId, payload);

      case 'call.speak.ended':
        return this.handleSpeakEnded(callControlId, payload);

      case 'call.dtmf.received':
        return this.handleDTMF(callControlId, payload);

      case 'call.hangup':
        this.logger.log(`Call ended: ${callControlId}`);
        return null;

      default:
        this.logger.debug(`Unhandled event type: ${event_type}`);
        return null;
    }
  }

  private handleCallInitiated(
    callControlId: string,
    payload: Record<string, any>,
  ): VoiceCommandResponse {
    const fromNumber = payload.from || 'Unknown';
    this.logger.log(`Inbound call from: ${fromNumber}`);

    return {
      call_control_id: callControlId,
      commands: [
        { answer_call: {} },
        {
          speak: {
            payload:
              'Welcome to WISE² Trading Assistant. I can help you with market signals, portfolio analysis, or trading execution.',
            voice: 'Polly.Salli',
            language: 'en-US',
          },
        },
        {
          gather_using_speak: {
            payload:
              'Say your inquiry, or press 1 for market signals, 2 for portfolio review, 3 for trading execution.',
            voice: 'Polly.Salli',
            language: 'en-US',
            max_digits: 1,
            timeout_millis: 10000,
          },
        },
      ],
    };
  }

  private handleCallAnswered(
    callControlId: string,
    payload: Record<string, any>,
  ): VoiceCommandResponse {
    this.logger.log(`Call answered: ${callControlId}`);
    return {
      call_control_id: callControlId,
      commands: [
        {
          speak: {
            payload: 'Call connected. Processing your request.',
            voice: 'Polly.Salli',
            language: 'en-US',
          },
        },
      ],
    };
  }

  private handleSpeakEnded(
    callControlId: string,
    payload: Record<string, any>,
  ): VoiceCommandResponse {
    const recognizedText = payload.text || '';
    this.logger.log(`Speech recognized: "${recognizedText}"`);

    const response = this.processTradeQuery(recognizedText);

    return {
      call_control_id: callControlId,
      commands: [
        {
          speak: {
            payload: response,
            voice: 'Polly.Salli',
            language: 'en-US',
          },
        },
        {
          gather_using_speak: {
            payload:
              'Say another command, or press 1 to end the call.',
            voice: 'Polly.Salli',
            language: 'en-US',
            max_digits: 1,
            timeout_millis: 10000,
          },
        },
      ],
    };
  }

  private handleDTMF(
    callControlId: string,
    payload: Record<string, any>,
  ): VoiceCommandResponse | null {
    const digit = payload.digits;
    this.logger.log(`DTMF received: ${digit}`);

    switch (digit) {
      case '1':
        return {
          call_control_id: callControlId,
          commands: [
            {
              speak: {
                payload:
                  'Market signals: Tech sector showing strength with 2.5 percent gains. AI-related stocks leading. Volatility index stable at 14 points.',
                voice: 'Polly.Salli',
                language: 'en-US',
              },
            },
            {
              gather_using_speak: {
                payload: 'Press 1 for more signals, 2 for portfolio, or 3 to end.',
                voice: 'Polly.Salli',
                language: 'en-US',
                max_digits: 1,
                timeout_millis: 10000,
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
                  'Portfolio review: Your holdings total 250 thousand dollars. Tech allocation is 45 percent. Unrealized gains stand at 12 thousand dollars.',
                voice: 'Polly.Salli',
                language: 'en-US',
              },
            },
            {
              gather_using_speak: {
                payload: 'Press 1 for market signals, 2 for more details, or 3 to end.',
                voice: 'Polly.Salli',
                language: 'en-US',
                max_digits: 1,
                timeout_millis: 10000,
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
                  'Trading execution: Specify the symbol, quantity, and order type. Ready to place your order.',
                voice: 'Polly.Salli',
                language: 'en-US',
              },
            },
          ],
        };

      case '1':
        // Hangup
        return {
          call_control_id: callControlId,
          commands: [
            {
              speak: {
                payload:
                  'Thank you for using WISE² Trading Assistant. Goodbye.',
                voice: 'Polly.Salli',
                language: 'en-US',
              },
            },
            { hangup_call: {} },
          ],
        };

      default:
        return null;
    }
  }

  private processTradeQuery(query: string): string {
    const lower = query.toLowerCase();

    if (lower.includes('market') || lower.includes('signal')) {
      return 'Current market signals show bullish momentum in tech and financial sectors. VIX at 14. Recommend reviewing growth positions.';
    }

    if (lower.includes('portfolio') || lower.includes('position')) {
      return 'Portfolio is well-diversified with 45 percent tech exposure. Current gains are 12 thousand dollars. Consider rebalancing if tech exceeds 50 percent.';
    }

    if (lower.includes('buy') || lower.includes('sell')) {
      return 'Ready to execute trade. Specify symbol, quantity, and order type.';
    }

    if (lower.includes('risk')) {
      return 'Portfolio beta is 1.2, indicating moderate volatility. Max drawdown was 8 percent in last 30 days.';
    }

    return 'I can help with market signals, portfolio review, or trading execution. What would you like?';
  }
}

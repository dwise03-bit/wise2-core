import { VoiceModelProvider, ChatMessage, AIResponse, ToolDefinition } from './types';

export class VoiceModelMock implements VoiceModelProvider {
  readonly name = 'GPT-4o Mock';

  async chat(
    sessionId: string,
    systemPrompt: string,
    messages: ChatMessage[],
    tools: ToolDefinition[]
  ): Promise<AIResponse> {
    // Simulate AI decision-making based on conversation
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

    // Greeting
    if (messages.length === 1) {
      return {
        text: 'Hello! Thanks for calling. How can I help you today?',
        toolCalls: [],
        confidence: 0.95,
        stopReason: 'stop_sequence',
      };
    }

    // Identify customer
    if (lastMessage.includes('phone') || lastMessage.includes('account')) {
      return {
        text: "Let me look up your account with us.",
        toolCalls: [
          {
            id: '1',
            name: 'identify_customer',
            input: { phone: '+15551234567' },
          },
        ],
        confidence: 0.92,
        stopReason: 'tool_use',
      };
    }

    // Check availability for service
    if (
      lastMessage.includes('appointment') ||
      lastMessage.includes('book') ||
      lastMessage.includes('schedule')
    ) {
      return {
        text: "I'll check what times are available for you.",
        toolCalls: [
          {
            id: '2',
            name: 'check_availability',
            input: {
              serviceType: 'general_consultation',
              date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            },
          },
        ],
        confidence: 0.90,
        stopReason: 'tool_use',
      };
    }

    // Confirm booking
    if (lastMessage.includes('sounds good') || lastMessage.includes('yes')) {
      return {
        text: "Perfect! I'm booking that appointment for you. You'll get a confirmation shortly.",
        toolCalls: [
          {
            id: '3',
            name: 'create_booking',
            input: {
              customerId: 'cust_123',
              serviceType: 'general_consultation',
              startTime: new Date().toISOString(),
              endTime: new Date(Date.now() + 5400000).toISOString(),
            },
          },
        ],
        confidence: 0.88,
        stopReason: 'tool_use',
      };
    }

    // Transfer to agent
    if (
      lastMessage.includes('agent') ||
      lastMessage.includes('speak to') ||
      lastMessage.includes('human')
    ) {
      return {
        text: "I'll connect you with an agent right away.",
        toolCalls: [
          {
            id: '4',
            name: 'request_transfer',
            input: { reason: 'Customer requested human agent' },
          },
        ],
        confidence: 0.85,
        stopReason: 'tool_use',
      };
    }

    // Default response
    return {
      text: 'I understand. Can you tell me more about what you need?',
      toolCalls: [],
      confidence: 0.8,
      stopReason: 'stop_sequence',
    };
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    // Mock transcription
    return 'Mock transcribed audio text';
  }

  async synthesize(text: string): Promise<Buffer> {
    // Mock text-to-speech
    return Buffer.from('mock audio data');
  }
}

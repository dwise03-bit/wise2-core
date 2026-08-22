import { VoiceModelProvider, ChatMessage, AIResponse, ToolCall } from './types';
import { CallSessionManager } from './call-session';
import { ToolRegistry } from './tool-registry';

export class VoiceOrchestrator {
  private systemPrompt = `You are a helpful AI assistant for a service business. Your role is to:

1. Greet customers warmly
2. Identify if they're existing customers (use identify_customer tool)
3. Understand their service needs
4. Check availability for appointments (use check_availability tool)
5. Book appointments when appropriate (use create_booking tool)
6. Record consent for follow-up communication
7. Transfer to a human agent if needed for complex issues

Guidelines:
- Be concise and professional
- Ask clarifying questions to understand needs
- Suggest specific appointment times from available slots
- Always record consent before booking
- Offer to transfer to an agent if customer seems frustrated`;

  constructor(
    private voiceModel: VoiceModelProvider,
    private sessionManager: CallSessionManager,
    private toolRegistry: ToolRegistry
  ) {}

  async handleConversationTurn(
    sessionId: string,
    userMessage: string
  ): Promise<{ response: string; shouldTransfer: boolean }> {
    const session = this.sessionManager.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Add user message to transcript
    this.sessionManager.addMessage(sessionId, 'user', userMessage);

    // Build message history
    const messages: ChatMessage[] = [
      ...session.transcript.filter((m) => m.role !== 'user' || m.content !== userMessage),
      { role: 'user', content: userMessage },
    ];

    // Get AI response
    let aiResponse: AIResponse;
    try {
      aiResponse = await this.voiceModel.chat(
        sessionId,
        this.systemPrompt,
        messages,
        this.toolRegistry.getTools()
      );
    } catch (error) {
      throw new Error(
        `Voice model error: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Process tool calls
    for (const toolCall of aiResponse.toolCalls) {
      await this.executeTool(sessionId, toolCall);
    }

    // Add assistant response to transcript
    this.sessionManager.addMessage(sessionId, 'assistant', aiResponse.text);

    // Check if transfer is needed
    const shouldTransfer =
      this.sessionManager.shouldTransfer(sessionId) ||
      aiResponse.toolCalls.some((tc) => tc.name === 'request_transfer');

    return {
      response: aiResponse.text,
      shouldTransfer,
    };
  }

  private async executeTool(
    sessionId: string,
    toolCall: ToolCall
  ): Promise<void> {
    this.sessionManager.recordToolCall(sessionId, toolCall.name, toolCall.input);

    const result = await this.toolRegistry.executeTool(toolCall.name, toolCall.input);
    this.sessionManager.recordToolResult(sessionId, result);

    // Update session context based on tool results
    if (toolCall.name === 'identify_customer' && result.success && result.output) {
      const customer = result.output as any;
      const session = this.sessionManager.getSession(sessionId);
      if (session) {
        session.customerId = customer.id;
        this.sessionManager.updateContext(sessionId, {
          isExistingCustomer: true,
        });
      }
    }

    if (toolCall.name === 'check_availability' && result.success && result.output) {
      const slots = result.output as any[];
      if (slots.length > 0) {
        this.sessionManager.updateContext(sessionId, {
          bookingInProgress: {
            startAt: slots[0].start,
            endAt: slots[0].end,
          },
        });
      }
    }

    if (toolCall.name === 'request_transfer' && result.success) {
      this.sessionManager.updateContext(sessionId, {
        requiresTransfer: true,
        transferReason: (toolCall.input.reason as string) || 'Customer requested transfer',
      });
    }
  }
}

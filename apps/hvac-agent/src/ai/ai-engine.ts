import Anthropic from '@anthropic-ai/sdk';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class AIEngine {
  private client: Anthropic;
  private conversationHistory: Map<string, Message[]> = new Map();

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async respondToMessage(
    userMessage: string,
    sessionId: string,
    context: {
      jobId?: string;
      customerName?: string;
      address?: string;
      equipmentType?: string;
      fieldpieceReadings?: Record<string, number>;
      previousDiagnosis?: string;
    }
  ): Promise<string> {
    // Get or create conversation history
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }

    const history = this.conversationHistory.get(sessionId)!;

    // Build system prompt with context
    const systemPrompt = this.buildSystemPrompt(context);

    // Add user message to history
    history.push({
      role: 'user',
      content: userMessage,
    });

    // Call Claude
    const response = await this.client.messages.create({
      model: 'claude-opus-4-1-20250805',
      max_tokens: 1024,
      system: systemPrompt,
      messages: history,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Add assistant response to history
    history.push({
      role: 'assistant',
      content: assistantMessage,
    });

    // Keep history manageable (last 20 exchanges)
    if (history.length > 40) {
      history.splice(0, 20);
    }

    return assistantMessage;
  }

  private buildSystemPrompt(context: any): string {
    return `You are WISE² HVAC Agent, a professional field assistant for HVAC technicians.

Your role:
- Provide real-time diagnostics based on Fieldpiece readings
- Guide troubleshooting with clear, actionable steps
- Recommend parts and procedures
- Estimate repair complexity and time
- Help schedule follow-up calls
- Generate professional reports

Current Context:
${context.jobId ? `Job ID: ${context.jobId}` : ''}
${context.customerName ? `Customer: ${context.customerName}` : ''}
${context.address ? `Address: ${context.address}` : ''}
${context.equipmentType ? `Equipment: ${context.equipmentType}` : ''}
${context.fieldpieceReadings ? `Current Readings:\n${JSON.stringify(context.fieldpieceReadings, null, 2)}` : ''}
${context.previousDiagnosis ? `Previous Diagnosis: ${context.previousDiagnosis}` : ''}

Communication style:
- Professional but conversational (like ChatGPT)
- Use data to support recommendations
- Ask clarifying questions when needed
- Provide step-by-step guidance
- Include safety warnings for high-risk procedures
- Format responses with clear sections (Problem, Root Cause, Solution, Next Steps)

Be concise but thorough. Technician is in the field with limited time.`;
  }

  clearSession(sessionId: string): void {
    this.conversationHistory.delete(sessionId);
  }

  getSessionHistory(sessionId: string): Message[] {
    return this.conversationHistory.get(sessionId) || [];
  }
}

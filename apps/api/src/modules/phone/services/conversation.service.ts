/**
 * Conversation Engine
 * AI-powered conversation orchestration using Hermes/Ollama
 * Manages context, tool calls, and response generation
 */

import { Injectable, Logger } from '@nestjs/common';
import { CallSessionService } from './call-session.service';
import { STTService } from './stt.service';
import { TTSService } from './tts.service';
import { PrismaService } from '@shared/services/prisma.service';

export interface ConversationMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface AIResponse {
  text: string;
  confidence: number;
  toolCalls?: ToolCall[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'routine' | 'priority' | 'urgent' | 'emergency';
}

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private hermesUrl: string;
  private hermesModel: string;
  private hermesTimeout: number;

  constructor(
    private callSession: CallSessionService,
    private stt: STTService,
    private tts: TTSService,
    private prisma: PrismaService,
  ) {
    this.hermesUrl = process.env.HERMES_ENDPOINT || 'http://localhost:11435/v1/chat/completions';
    this.hermesModel = process.env.HERMES_CHAT_MODEL || 'hermes2-pro';
    this.hermesTimeout = parseInt(process.env.HERMES_TIMEOUT_MS || '90000');
  }

  /**
   * Process customer message and generate AI response
   */
  async processMessage(
    callSid: string,
    customerMessage: string
  ): Promise<AIResponse> {
    try {
      // Add customer message to conversation
      await this.callSession.addConversationTurn(callSid, 'customer', customerMessage);

      // Build conversation context
      const context = await this.callSession.getConversationContext(callSid);
      const systemPrompt = this.buildSystemPrompt();
      const messages = this.buildMessages(callSid, systemPrompt, context);

      this.logger.log(`Processing message for ${callSid}: ${customerMessage.substring(0, 50)}...`);

      // Call Hermes LLM
      const response = await this.callHermes(messages);

      // Parse response
      const aiResponse = this.parseResponse(response);

      // Add AI response to conversation
      await this.callSession.addConversationTurn(callSid, 'agent', aiResponse.text);

      // Handle tool calls (create lead, schedule appointment, etc.)
      if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
        await this.handleToolCalls(callSid, aiResponse.toolCalls);
      }

      // Store urgency assessment
      if (aiResponse.urgency) {
        const session = this.callSession.getSession(callSid);
        if (session) {
          session.metadata = session.metadata || {};
          session.metadata.urgency = aiResponse.urgency;
        }
      }

      return aiResponse;
    } catch (error) {
      this.logger.error(
        `Conversation processing failed: ${error.message}`,
        error.stack
      );

      // Fallback response
      return {
        text: "I'm having trouble understanding. Could you please repeat that?",
        confidence: 0.3,
      };
    }
  }

  /**
   * Build system prompt for HVAC phone assistant
   */
  private buildSystemPrompt(): string {
    return `You are WISE² HVAC Assistant, a professional and helpful customer service representative for WISE² HVAC Solutions.

Your role:
- Greet customers warmly and professionally
- Quickly identify the HVAC issue (cooling, heating, electrical, maintenance, etc.)
- Ask clarifying questions to understand the problem
- Assess urgency: routine, priority, urgent, or safety-critical
- For safety issues (smoke, strong gas smell, no heat in winter), escalate immediately to human
- Suggest simple checks only for safe actions (thermostat settings, filter condition, breaker check)
- Offer scheduling assistance and real appointments only
- Be concise and field-friendly for technician handoff

Current time: ${new Date().toISOString()}

If the customer reports a safety issue (smoke, burning smell, strong gas odor, no heat below freezing, electrical hazard), respond with urgent concern and recommend immediate action.

For standard service calls, capture:
1. Customer name and phone
2. Service address
3. HVAC equipment type (if known)
4. Issue description
5. When it started
6. Any parts already checked
7. Preferred appointment time

Always be ready to transfer to a human if the customer requests one.`;
  }

  /**
   * Build conversation messages for LLM
   */
  private buildMessages(
    callSid: string,
    systemPrompt: string,
    context: string
  ): ConversationMessage[] {
    const messages: ConversationMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'system',
        content: `Current call context:\n${context}`,
      },
    ];

    // Add conversation history
    const conversation = this.callSession.getConversation(callSid);
    for (const turn of conversation) {
      messages.push({
        role: turn.role === 'customer' ? 'user' : 'assistant',
        content: turn.text,
      });
    }

    return messages;
  }

  /**
   * Call Hermes/Ollama LLM
   */
  private async callHermes(messages: ConversationMessage[]): Promise<string> {
    try {
      const response = await fetch(this.hermesUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.hermesModel,
          messages,
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 500,
          stream: false,
        }),
        signal: AbortSignal.timeout(this.hermesTimeout),
      });

      if (!response.ok) {
        throw new Error(
          `Hermes API error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const assistantMessage = result.choices?.[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error('No response from Hermes');
      }

      return assistantMessage;
    } catch (error) {
      this.logger.error(`Hermes LLM call failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse AI response for text, tool calls, and metadata
   */
  private parseResponse(response: string): AIResponse {
    // Extract urgency markers
    const urgencyMap: Record<string, any> = {
      'emergency': 'emergency',
      'safety': 'emergency',
      'urgent': 'urgent',
      'asap': 'urgent',
      'soon': 'priority',
      'schedule': 'routine',
    };

    let urgency = 'routine' as any;
    for (const [marker, level] of Object.entries(urgencyMap)) {
      if (response.toLowerCase().includes(marker)) {
        urgency = level;
        break;
      }
    }

    // Extract tool calls (if LLM includes them in response)
    const toolCalls: ToolCall[] = [];
    const toolPattern = /\[TOOL:(\w+)\((.*?)\)\]/g;
    let match;
    while ((match = toolPattern.exec(response)) !== null) {
      toolCalls.push({
        name: match[1],
        arguments: this.parseToolArgs(match[2]),
      });
    }

    // Extract sentiment
    const sentiment =
      response.toLowerCase().includes('problem') ||
      response.toLowerCase().includes('issue')
        ? 'negative'
        : response.toLowerCase().includes('great') ||
          response.toLowerCase().includes('perfect')
        ? 'positive'
        : 'neutral';

    return {
      text: response.replace(toolPattern, '').trim(),
      confidence: 0.85,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      sentiment: sentiment as any,
      urgency: urgency as any,
    };
  }

  /**
   * Parse tool arguments from string format
   */
  private parseToolArgs(argsStr: string): Record<string, any> {
    try {
      // Simple parser for key=value,key=value format
      const args: Record<string, any> = {};
      const pairs = argsStr.split(',');
      for (const pair of pairs) {
        const [key, value] = pair.split('=').map((s) => s.trim());
        args[key] = value;
      }
      return args;
    } catch {
      return {};
    }
  }

  /**
   * Handle tool calls from AI (create leads, schedule appointments, etc.)
   */
  private async handleToolCalls(
    callSid: string,
    toolCalls: ToolCall[]
  ): Promise<void> {
    for (const toolCall of toolCalls) {
      try {
        switch (toolCall.name) {
          case 'create_lead':
            await this.createLead(callSid, toolCall.arguments);
            break;
          case 'schedule_appointment':
            await this.scheduleAppointment(callSid, toolCall.arguments);
            break;
          case 'create_work_order':
            await this.createWorkOrder(callSid, toolCall.arguments);
            break;
          case 'transfer_to_human':
            this.logger.log(`Transfer to human requested for ${callSid}`);
            break;
          default:
            this.logger.warn(`Unknown tool call: ${toolCall.name}`);
        }
      } catch (error) {
        this.logger.error(
          `Tool call failed: ${toolCall.name} - ${error.message}`
        );
      }
    }
  }

  /**
   * Create a lead/customer from call
   */
  private async createLead(callSid: string, args: Record<string, any>): Promise<void> {
    // TODO: Implement lead creation
    this.logger.log(`Lead creation requested for ${callSid}`);
  }

  /**
   * Schedule an appointment
   */
  private async scheduleAppointment(
    callSid: string,
    args: Record<string, any>
  ): Promise<void> {
    // TODO: Implement appointment scheduling
    this.logger.log(`Appointment scheduling requested for ${callSid}`);
  }

  /**
   * Create a work order
   */
  private async createWorkOrder(
    callSid: string,
    args: Record<string, any>
  ): Promise<void> {
    // TODO: Implement work order creation
    this.logger.log(`Work order creation requested for ${callSid}`);
  }

  /**
   * End conversation and generate summary
   */
  async endConversation(callSid: string): Promise<any> {
    const context = await this.callSession.getConversationContext(callSid);

    const summaryPrompt = `Summarize this HVAC customer service call in JSON format:
{
  "reason": "why customer called",
  "symptoms": ["list of symptoms"],
  "urgency": "routine/priority/urgent/emergency",
  "equipmentType": "if mentioned",
  "nextActions": ["recommended actions"],
  "needsFollowUp": true/false,
  "followUpDate": "if needed"
}

Call context:
${context}`;

    try {
      const response = await this.callHermes([
        {
          role: 'system',
          content: 'You are an expert HVAC business analyst. Respond only with valid JSON.',
        },
        { role: 'user', content: summaryPrompt },
      ]);

      const summary = JSON.parse(response);
      await this.callSession.summarizeConversation(callSid, summary);

      return summary;
    } catch (error) {
      this.logger.error(`Summary generation failed: ${error.message}`);
      return null;
    }
  }
}

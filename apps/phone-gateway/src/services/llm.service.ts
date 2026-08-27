/**
 * LLM Service
 * Interfaces with Hermes/Ollama for AI conversation
 */

import axios from 'axios';
import { logger } from '../logger';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateOptions {
  messages: Message[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
}

export interface GenerateResult {
  text: string;
  tokens: number;
  sentiment?: string;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export class LLMService {
  private endpoint: string;
  private model: string;
  private timeout: number;

  constructor(
    endpoint: string = process.env.HERMES_ENDPOINT || 'http://localhost:11435/v1/chat/completions',
    model: string = process.env.HERMES_CHAT_MODEL || 'hermes2-pro',
    timeout: number = parseInt(process.env.HERMES_TIMEOUT_MS || '90000')
  ) {
    this.endpoint = endpoint;
    this.model = model;
    this.timeout = timeout;
  }

  /**
   * Generate response from LLM
   */
  async generate(options: GenerateOptions): Promise<GenerateResult> {
    try {
      // Build message history
      let messages = options.messages;

      // Prepend system prompt if provided
      if (options.systemPrompt) {
        messages = [
          { role: 'system', content: options.systemPrompt },
          ...messages.filter((m) => m.role !== 'system'),
        ];
      }

      // Call Hermes API
      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages,
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.95,
          stream: false,
          tools: this.getAvailableTools(),
        },
        {
          timeout: this.timeout,
        }
      );

      const result = response.data.choices[0].message;

      // Parse tool calls if present
      const toolCalls = this.parseToolCalls(result.content);

      return {
        text: result.content,
        tokens: response.data.usage?.completion_tokens || 0,
        sentiment: this.detectSentiment(result.content),
        toolCalls,
      };
    } catch (error) {
      logger.error('LLM generation failed:', error);
      throw error;
    }
  }

  /**
   * Stream LLM response (for real-time interaction)
   */
  async *generateStream(options: GenerateOptions) {
    try {
      let messages = options.messages;

      if (options.systemPrompt) {
        messages = [
          { role: 'system', content: options.systemPrompt },
          ...messages.filter((m) => m.role !== 'system'),
        ];
      }

      const response = await axios.post(
        this.endpoint,
        {
          model: this.model,
          messages,
          max_tokens: options.maxTokens || 500,
          temperature: options.temperature || 0.7,
          stream: true,
        },
        {
          timeout: this.timeout,
          responseType: 'stream',
        }
      );

      let buffer = '';

      for await (const chunk of response.data) {
        const text = chunk.toString();
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (jsonStr === '[DONE]') {
              return;
            }

            try {
              const json = JSON.parse(jsonStr);
              const content = json.choices[0]?.delta?.content || '';
              if (content) {
                buffer += content;
                yield content;
              }
            } catch (e) {
              // Parse error, skip
            }
          }
        }
      }
    } catch (error) {
      logger.error('LLM stream generation failed:', error);
      throw error;
    }
  }

  /**
   * Get available tools the LLM can call
   */
  private getAvailableTools() {
    return [
      {
        type: 'function',
        function: {
          name: 'create_lead',
          description: 'Create a new customer lead in WISE² CRM',
          parameters: {
            type: 'object',
            properties: {
              phone: {
                type: 'string',
                description: 'Customer phone number',
              },
              name: {
                type: 'string',
                description: 'Customer name',
              },
              address: {
                type: 'string',
                description: 'Service address',
              },
              issue: {
                type: 'string',
                description: 'Description of HVAC issue',
              },
              urgency: {
                type: 'string',
                enum: ['routine', 'priority', 'urgent', 'emergency'],
                description: 'Urgency level',
              },
            },
            required: ['phone', 'name', 'issue'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'schedule_appointment',
          description: 'Schedule a service appointment',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID',
              },
              preferred_date: {
                type: 'string',
                description: 'Preferred date (YYYY-MM-DD)',
              },
              preferred_time: {
                type: 'string',
                description: 'Preferred time (HH:MM)',
              },
              service_type: {
                type: 'string',
                enum: ['cooling', 'heating', 'maintenance', 'emergency'],
                description: 'Type of service needed',
              },
            },
            required: ['customer_id', 'service_type'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_work_order',
          description: 'Create a work order for technician dispatch',
          parameters: {
            type: 'object',
            properties: {
              customer_id: {
                type: 'string',
                description: 'Customer ID',
              },
              issue_description: {
                type: 'string',
                description: 'Detailed issue description',
              },
              equipment_type: {
                type: 'string',
                description: 'HVAC equipment type',
              },
              urgency: {
                type: 'string',
                enum: ['routine', 'priority', 'urgent', 'emergency'],
                description: 'Urgency level',
              },
              estimated_time: {
                type: 'number',
                description: 'Estimated service time in minutes',
              },
            },
            required: ['customer_id', 'issue_description', 'urgency'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'transfer_to_human',
          description: 'Transfer the call to a human technician',
          parameters: {
            type: 'object',
            properties: {
              reason: {
                type: 'string',
                description: 'Reason for transfer',
              },
              priority: {
                type: 'string',
                enum: ['normal', 'high'],
                description: 'Transfer priority',
              },
            },
            required: ['reason'],
          },
        },
      },
    ];
  }

  /**
   * Parse tool calls from LLM response
   */
  private parseToolCalls(content: string): ToolCall[] {
    // Simple parsing for now; in production would use proper JSON extraction
    const tools: ToolCall[] = [];

    // Look for function call patterns
    const functionPattern = /\[FUNCTION_CALL\]\s*(\w+)\s*\((.*?)\)\s*\[\/FUNCTION_CALL\]/g;
    let match;

    while ((match = functionPattern.exec(content)) !== null) {
      const name = match[1];
      try {
        const argsStr = match[2];
        const args = JSON.parse(argsStr);
        tools.push({
          id: `tool_${Date.now()}`,
          name,
          args,
        });
      } catch (e) {
        logger.warn(`Failed to parse tool call: ${match[0]}`);
      }
    }

    return tools;
  }

  /**
   * Simple sentiment detection
   */
  private detectSentiment(text: string): string {
    const negativePhrases = [
      'sorry',
      'problem',
      'issue',
      'broken',
      'not working',
      'frustrated',
      'angry',
    ];
    const positivePhrases = [
      'great',
      'thanks',
      'perfect',
      'excellent',
      'happy',
      'helpful',
    ];

    const lowerText = text.toLowerCase();
    const negativeCount = negativePhrases.filter((p) =>
      lowerText.includes(p)
    ).length;
    const positiveCount = positivePhrases.filter((p) =>
      lowerText.includes(p)
    ).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Check LLM health
   */
  async health(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.endpoint.replace('/v1/chat/completions', '')}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

export default LLMService;

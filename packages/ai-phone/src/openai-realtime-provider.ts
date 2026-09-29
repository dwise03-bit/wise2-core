import OpenAI, { toFile } from 'openai';
import { VoiceModelProvider, ChatMessage, AIResponse, ToolDefinition } from './types';
import { VoiceModelMock } from './voice-model-mock';

interface OpenAIRealtimeConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  ttsVoice?: string;
}

export class OpenAIRealtimeProvider implements VoiceModelProvider {
  readonly name = 'OpenAI';
  private client: OpenAI;
  private model: string;
  private temperature: number;
  private ttsVoice: string;

  constructor(config: OpenAIRealtimeConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.model = config.model || process.env.OPENAI_PHONE_MODEL || 'gpt-4o-mini';
    this.temperature = config.temperature ?? 0.4;
    this.ttsVoice = config.ttsVoice || 'alloy';
  }

  async chat(
    sessionId: string,
    systemPrompt: string,
    messageHistory: ChatMessage[],
    tools: ToolDefinition[]
  ): Promise<AIResponse> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const toolDefinitions: OpenAI.Chat.ChatCompletionTool[] = tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema as OpenAI.FunctionParameters,
      },
    }));

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      messages,
      tools: toolDefinitions.length > 0 ? toolDefinitions : undefined,
      user: sessionId,
    });

    const choice = response.choices[0];
    const toolCalls = (choice?.message?.tool_calls ?? [])
      .filter((call) => call.type === 'function')
      .map((call) => {
        let input: Record<string, unknown> = {};
        try {
          input = JSON.parse(call.function.arguments || '{}') as Record<string, unknown>;
        } catch {
          input = {};
        }
        return {
          id: call.id,
          name: call.function.name,
          input,
        };
      });

    return {
      text: choice?.message?.content?.trim() || (toolCalls.length > 0 ? '' : 'How can I help you today?'),
      toolCalls,
      confidence: 0.9,
      stopReason: toolCalls.length > 0 ? 'tool_use' : 'stop_sequence',
    };
  }

  async transcribe(audioBuffer: Buffer): Promise<string> {
    const file = await toFile(audioBuffer, 'caller.wav');
    const result = await this.client.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    });
    return result.text;
  }

  async synthesize(text: string): Promise<Buffer> {
    const response = await this.client.audio.speech.create({
      model: 'tts-1',
      voice: this.ttsVoice as 'alloy',
      input: text,
    });
    return Buffer.from(await response.arrayBuffer());
  }
}

export function createVoiceModel(apiKey?: string): VoiceModelProvider {
  const key = apiKey ?? process.env.OPENAI_API_KEY;
  if (key) {
    return new OpenAIRealtimeProvider({ apiKey: key });
  }
  return new VoiceModelMock();
}

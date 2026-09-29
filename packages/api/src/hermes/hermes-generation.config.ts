/**
 * Hermes Generation Configuration
 * Centralizes reasoning profile settings (FAST, DEEP, AUTO)
 */

export type HermesProfile = 'fast' | 'deep' | 'auto';

export interface GenerationSettings {
  think: boolean;
  numCtx: number;
  numPredict: number;
  timeoutMs: number;
}

export interface HermesGenerationConfig {
  model: string;
  provider: string;
  profile: HermesProfile;
  fast: GenerationSettings;
  deep: GenerationSettings;
  selectedSettings: GenerationSettings;
}

export class HermesGenerationResolver {
  /**
   * Resolve generation settings based on environment and profile
   */
  static resolve(profile: HermesProfile = 'auto'): HermesGenerationConfig {
    const model = process.env.OLLAMA_CHAT_MODEL || 'wise2:latest';
    const provider = this.detectProvider();
    const endpoint = this.getEndpoint();

    const fast: GenerationSettings = {
      think: this.parseBoolean(process.env.HERMES_FAST_THINK, false),
      numCtx: parseInt(process.env.HERMES_FAST_NUM_CTX || '4096', 10),
      numPredict: parseInt(process.env.HERMES_FAST_NUM_PREDICT || '1024', 10),
      timeoutMs: parseInt(process.env.HERMES_TIMEOUT_MS || '90000', 10),
    };

    const deep: GenerationSettings = {
      think: this.parseBoolean(process.env.HERMES_DEEP_THINK, true),
      numCtx: parseInt(process.env.HERMES_DEEP_NUM_CTX || '16384', 10),
      numPredict: parseInt(process.env.HERMES_DEEP_NUM_PREDICT || '2048', 10),
      timeoutMs: parseInt(process.env.HERMES_TIMEOUT_MS || '90000', 10),
    };

    let resolvedProfile = profile;
    if (profile === 'auto') {
      resolvedProfile = 'fast'; // Default to fast (AUTO not yet used for this request)
    }

    const selectedSettings = resolvedProfile === 'deep' ? deep : fast;

    return {
      model,
      provider,
      profile: resolvedProfile,
      fast,
      deep,
      selectedSettings,
    };
  }

  /**
   * Auto-classify request complexity without calling an LLM
   * Returns 'fast' or 'deep' based on heuristics
   */
  static autoClassify(
    message: string,
    conversationLength: number,
    mode?: string,
  ): HermesProfile {
    const lowerMessage = message.toLowerCase();

    // Deep indicators (require more reasoning/context)
    const deepKeywords = [
      'analyze deeply',
      'full analysis',
      'debug this entire',
      'step by step',
      'compare all',
      'design the system',
      'investigate',
      'root cause',
      'reason through',
      'deep mode',
      'comprehensive',
      'detailed analysis',
      'strategic analysis',
    ];

    // Fast indicators (quick response) - higher priority than deep
    const fastKeywords = [
      'quick',
      'fast',
      'reply only',
      'briefly',
      'one line',
      'status check',
      'lookup',
      'simple',
    ];

    // Check message length (longer often requires more reasoning)
    const hasLongMessage = message.length > 500;

    // Check conversation history (longer conversations may need more context)
    const hasLongConversation = conversationLength > 8;

    // Check for deep keywords
    const hasDeepKeyword = deepKeywords.some((kw) => lowerMessage.includes(kw));

    // Check for fast keywords
    const hasFastKeyword = fastKeywords.some((kw) => lowerMessage.includes(kw));

    // Explicit fast request has highest priority
    if (hasFastKeyword) {
      return 'fast';
    }

    // Explicit deep request
    if (hasDeepKeyword) {
      return 'deep';
    }

    // Heuristic: long message + long conversation = deep
    if (hasLongMessage && hasLongConversation) {
      return 'deep';
    }

    // Heuristic: conversation-based modes with established context
    if (
      mode &&
      ['audit', 'systems', 'projects'].includes(mode) &&
      conversationLength > 6
    ) {
      return 'deep';
    }

    // Default to fast
    return 'fast';
  }

  /**
   * Build Ollama-native request body with generation settings
   */
  static buildOllamaBody(
    model: string,
    system: string,
    history: any[],
    userMessage: string,
    settings: GenerationSettings,
  ): Record<string, unknown> {
    return {
      model,
      stream: false,
      think: settings.think,
      options: {
        num_ctx: settings.numCtx,
        num_predict: settings.numPredict,
      },
      messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: userMessage },
      ],
    };
  }

  /**
   * Build OpenAI-compatible request body
   * (does not include Ollama-native think/options)
   */
  static buildOpenAiBody(
    model: string,
    system: string,
    history: any[],
    userMessage: string,
  ): Record<string, unknown> {
    return {
      model,
      stream: false,
      messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: userMessage },
      ],
    };
  }

  /**
   * Build Ollama-native streaming request body
   */
  static buildOllamaStreamBody(
    model: string,
    system: string,
    history: any[],
    userMessage: string,
    settings: GenerationSettings,
  ): Record<string, unknown> {
    return {
      model,
      stream: true,
      think: settings.think,
      options: {
        num_ctx: settings.numCtx,
        num_predict: settings.numPredict,
      },
      messages: [
        { role: 'system', content: system },
        ...history,
        { role: 'user', content: userMessage },
      ],
    };
  }

  private static detectProvider(): string {
    const endpoint =
      process.env.HERMES_ENDPOINT ||
      process.env.OLLAMA_BASE_URL ||
      'http://127.0.0.1:11434';
    return endpoint.includes('/v1/chat/completions')
      ? 'openai-compatible'
      : 'ollama';
  }

  private static getEndpoint(): string {
    const configuredEndpoint =
      process.env.HERMES_ENDPOINT ||
      process.env.OLLAMA_BASE_URL ||
      'http://127.0.0.1:11434';
    return configuredEndpoint.includes('/v1/chat/completions')
      ? configuredEndpoint
      : `${configuredEndpoint.replace(/\/+$/, '')}/api/chat`;
  }

  private static parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true' || value === '1';
  }
}

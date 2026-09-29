import pino from 'pino';
import { Intent } from '../intent/IntentDetector.js';
import { Context } from '../context/ContextRetriever.js';

const logger = pino();

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class PromptOptimizer {
  private systemPrompts: Map<string, string> = new Map();
  private templates: Map<string, string> = new Map();

  constructor() {
    this.initializeSystemPrompts();
    this.initializeTemplates();
  }

  private initializeSystemPrompts(): void {
    this.systemPrompts.set(
      'default',
      'You are WISE², an Enterprise AI Operating System. You combine military-grade precision with creative brilliance. ' +
        'Provide clear, actionable responses. Always think step-by-step.',
    );

    this.systemPrompts.set(
      'question',
      'You are an expert assistant. Answer the user\'s question comprehensively. ' +
        'Provide context, explain reasoning, and suggest related topics when relevant.',
    );

    this.systemPrompts.set(
      'command',
      'You are a technical assistant. Execute the user\'s command precisely. ' +
        'Provide clear steps, expected outcomes, and any warnings or prerequisites.',
    );

    this.systemPrompts.set(
      'creation',
      'You are a creative assistant. Generate high-quality content that meets the user\'s specifications. ' +
        'Ensure clarity, coherence, and professional quality.',
    );

    this.systemPrompts.set(
      'analysis',
      'You are an analytical assistant. Analyze the provided information thoroughly. ' +
        'Identify patterns, draw conclusions, and highlight key insights.',
    );
  }

  private initializeTemplates(): void {
    this.templates.set(
      'question',
      'Question: {query}\n\nContext:\n{context}\n\nProvide a comprehensive answer.',
    );

    this.templates.set(
      'command',
      'Execute this command: {query}\n\nContext:\n{context}\n\nProvide steps and expected outcomes.',
    );

    this.templates.set(
      'creation',
      'Create the following: {query}\n\nContext and guidelines:\n{context}\n\nEnsure quality and clarity.',
    );

    this.templates.set(
      'analysis',
      'Analyze the following: {query}\n\nProvided information:\n{context}\n\nIdentify patterns and insights.',
    );
  }

  /**
   * Optimize prompt based on intent, context, and conversation history
   */
  optimize(
    userQuery: string,
    context: Context,
    intent: Intent,
    conversationHistory: ConversationMessage[] = [],
  ): string {
    // Build system prompt
    const systemPrompt = this.buildSystemPrompt(intent, context);

    // Build context string
    const contextStr = this.buildContextString(context);

    // Get template for intent category
    const template = this.templates.get(intent.category) || this.templates.get('question')!;

    // Fill template
    let prompt = template
      .replace('{query}', userQuery)
      .replace('{context}', contextStr);

    // Add conversation history if relevant
    if (conversationHistory.length > 0 && intent.category === 'question') {
      const history = this.formatConversationHistory(conversationHistory);
      prompt += `\n\nPrevious conversation:\n${history}`;
    }

    // Add system prompt
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    logger.debug(`Prompt optimized (length: ${fullPrompt.length})`);

    return fullPrompt;
  }

  private buildSystemPrompt(intent: Intent, context: Context): string {
    const basePrompt = this.systemPrompts.get(intent.category) ||
      this.systemPrompts.get('default')!;

    // Enhance with context relevance
    if (context.relevanceScore > 0.8) {
      return `${basePrompt}\n\nYou have high-quality context available. Use it to provide more precise answers.`;
    }

    if (context.relevanceScore < 0.5) {
      return `${basePrompt}\n\nLimited context available. Make reasonable assumptions and ask for clarification if needed.`;
    }

    return basePrompt;
  }

  private buildContextString(context: Context): string {
    const lines: string[] = [];

    for (const source of context.sources) {
      lines.push(`[${source.type.toUpperCase()}] ${source.content.substring(0, 200)}`);
    }

    if (lines.length === 0) {
      return '(No relevant context available)';
    }

    return lines.join('\n\n');
  }

  private formatConversationHistory(history: ConversationMessage[]): string {
    const recentMessages = history.slice(-3); // Last 3 messages

    return recentMessages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Compress prompt for token efficiency
   */
  compressPrompt(prompt: string, maxTokens: number = 2000): string {
    if (prompt.length <= maxTokens * 4) {
      // Rough estimate: 1 token ≈ 4 chars
      return prompt;
    }

    logger.debug(`Compressing prompt (${prompt.length} chars → ${maxTokens * 4} chars)`);

    // Extract key sections
    const sections = prompt.split('\n\n');
    let compressed = '';
    let tokenCount = 0;

    for (const section of sections) {
      if (tokenCount + section.length <= maxTokens * 4) {
        compressed += section + '\n\n';
        tokenCount += section.length;
      } else {
        break;
      }
    }

    return compressed.trim();
  }

  /**
   * Add custom instructions to prompt
   */
  addInstructions(prompt: string, instructions: string[]): string {
    const instructionsStr = instructions.map((i, idx) => `${idx + 1}. ${i}`).join('\n');

    return `${prompt}\n\nAdditional Instructions:\n${instructionsStr}`;
  }

  /**
   * Add guardrails to prompt
   */
  addGuardrails(prompt: string): string {
    const guardrails = [
      'Do not provide medical advice.',
      'Do not share confidential information.',
      'Do not help with illegal activities.',
      'Be honest about limitations.',
    ];

    const guardrailsStr = guardrails.join('\n');

    return `${prompt}\n\nGuardrails:\n${guardrailsStr}`;
  }
}

import { EventEmitter } from 'events';
import pino from 'pino';
import axios from 'axios';

export interface AgentResponse {
  id: string;
  command: string;
  response: string;
  confidence: number;
  timestamp: number;
  executedActions?: string[];
}

export interface AgentConfig {
  modelName: string;
  modelPath: string;
  contextWindow: number;
  temperature: number;
  topP: number;
}

export class LocalAgent extends EventEmitter {
  private modelPath: string;
  private logger: pino.Logger;
  private initialized: boolean = false;
  private config: AgentConfig;
  private ollamaUrl: string = 'http://localhost:11434';
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private maxHistoryLength: number = 20;

  constructor(modelPath: string, logger: pino.Logger) {
    super();
    this.modelPath = modelPath;
    this.logger = logger;
    this.config = {
      modelName: 'mistral',
      modelPath,
      contextWindow: 4096,
      temperature: 0.7,
      topP: 0.9,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('LocalAgent already initialized');
      return;
    }

    try {
      // Check if Ollama is running
      await this.checkOllamaHealth();

      // Pull model if not already available
      await this.ensureModelAvailable();

      this.initialized = true;
      this.logger.info(
        { model: this.config.modelName },
        'LocalAgent initialized'
      );
    } catch (error) {
      this.logger.error(error, 'Failed to initialize LocalAgent');
      throw error;
    }
  }

  private async checkOllamaHealth(): Promise<void> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`, {
        timeout: 5000,
      });
      this.logger.info('Ollama is healthy');
      return;
    } catch (error) {
      this.logger.error(
        error,
        'Ollama not available - local inference will fail'
      );
      throw new Error('Ollama service is not running');
    }
  }

  private async ensureModelAvailable(): Promise<void> {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      const models = response.data.models || [];
      const modelNames = models.map((m: any) => m.name);

      if (!modelNames.includes(this.config.modelName)) {
        this.logger.info(
          { model: this.config.modelName },
          'Pulling model from registry'
        );
        await this.pullModel();
      }
    } catch (error) {
      this.logger.error(error, 'Failed to ensure model availability');
      throw error;
    }
  }

  private async pullModel(): Promise<void> {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/pull`,
        { name: this.config.modelName },
        { timeout: 300000 }
      );

      this.logger.info(
        { model: this.config.modelName },
        'Model pulled successfully'
      );
    } catch (error) {
      this.logger.error(error, 'Failed to pull model');
      throw error;
    }
  }

  async processCommand(command: string): Promise<AgentResponse> {
    if (!this.initialized) {
      throw new Error('LocalAgent not initialized');
    }

    try {
      // Add command to conversation history
      this.conversationHistory.push({ role: 'user', content: command });

      // Prepare system prompt for WISE² Edge context
      const systemPrompt = `You are WISE² Edge Assistant, running on a Raspberry Pi edge device.
Your capabilities:
- Local command processing and automation
- GPIO control and hardware interfacing
- Voice control and text-to-speech
- Offline-first operation with cloud sync
- Real-time automation triggers

Respond concisely and practically. When unclear, ask for clarification.
Current timestamp: ${new Date().toISOString()}`;

      // Get response from Ollama
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.config.modelName,
          prompt: this.formatPromptWithHistory(command, systemPrompt),
          stream: false,
          temperature: this.config.temperature,
          top_p: this.config.topP,
        },
        { timeout: 30000 }
      );

      const responseText = response.data.response || '';

      // Maintain conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: responseText,
      });

      // Trim history if too long
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }

      const agentResponse: AgentResponse = {
        id: `response_${Date.now()}`,
        command,
        response: responseText,
        confidence: 0.95, // Could be computed from model logits
        timestamp: Date.now(),
      };

      this.logger.info({ command, response: responseText }, 'Command processed');
      this.emit('command:processed', agentResponse);

      return agentResponse;
    } catch (error) {
      this.logger.error(error, 'Failed to process command');
      throw error;
    }
  }

  private formatPromptWithHistory(
    userMessage: string,
    systemPrompt: string
  ): string {
    let prompt = `${systemPrompt}\n\n`;

    // Add recent conversation history for context
    const recentHistory = this.conversationHistory.slice(-4);
    for (const msg of recentHistory) {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    }

    prompt += `User: ${userMessage}\nAssistant:`;
    return prompt;
  }

  async analyzeContext(context: Record<string, unknown>): Promise<unknown> {
    if (!this.initialized) {
      throw new Error('LocalAgent not initialized');
    }

    try {
      const contextStr = JSON.stringify(context);
      const prompt = `Analyze this edge device context and suggest optimizations:\n${contextStr}`;

      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.config.modelName,
          prompt,
          stream: false,
          temperature: 0.3,
        },
        { timeout: 20000 }
      );

      return response.data.response;
    } catch (error) {
      this.logger.error(error, 'Failed to analyze context');
      throw error;
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
    this.logger.debug('Conversation history cleared');
  }

  getConversationHistory(): Array<{ role: string; content: string }> {
    return [...this.conversationHistory];
  }

  async shutdown(): Promise<void> {
    try {
      this.clearHistory();
      this.initialized = false;
      this.logger.info('LocalAgent shut down');
    } catch (error) {
      this.logger.error(error, 'Error during LocalAgent shutdown');
      throw error;
    }
  }
}

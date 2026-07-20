import { Injectable, Logger } from '@nestjs/common';
import { aiManager } from './manager';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor() {
    this.logger.log('AIService initialized');
  }

  async chat(messages: any[], options?: any) {
    try {
      return await aiManager.chat(messages, options);
    } catch (error) {
      this.logger.error('Chat failed', error);
      throw error;
    }
  }

  async stream(messages: any[], onChunk: (event: any) => void, options?: any) {
    try {
      return await aiManager.stream(messages, onChunk, options);
    } catch (error) {
      this.logger.error('Stream failed', error);
      throw error;
    }
  }

  async getDashboardState() {
    return {
      status: 'operational',
      models: ['claude-opus', 'gpt-4', 'mistral'],
      timestamp: new Date().toISOString(),
    };
  }

  async getQuickStats() {
    return {
      totalModels: 3,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }

  async getRecentActivity() {
    return {
      status: 'healthy',
      lastUpdate: new Date().toISOString(),
    };
  }
}

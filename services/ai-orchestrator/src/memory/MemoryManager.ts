import pino from 'pino';
import { v4 as uuid } from 'uuid';
import { Intent } from '../intent/IntentDetector.js';
import { Context } from '../context/ContextRetriever.js';

const logger = pino();

export interface Memory {
  id: string;
  userId: string;
  sessionId: string;
  type: 'conversation' | 'preference' | 'knowledge' | 'skill';
  content: string;
  metadata: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  accessCount: number;
  relevanceScore: number;
}

export interface ConversationEntry {
  query: string;
  response: string;
  intent: Intent;
  context: Context;
}

export class MemoryManager {
  private shortTermMemory: Map<string, Memory[]> = new Map();
  private longTermMemory: Map<string, Memory[]> = new Map();
  private userSkills: Map<string, Set<string>> = new Map();
  private conversationStats: Map<string, any> = new Map();

  constructor() {
    logger.info('Memory Manager initialized');
  }

  /**
   * Update memory with new interaction
   */
  async updateMemory(
    userId: string,
    sessionId: string,
    entry: ConversationEntry,
    extractedKnowledge: any,
  ): Promise<void> {
    // Add to short-term memory
    await this.addToShortTermMemory(userId, sessionId, entry);

    // Update user skills
    this.updateSkills(userId, entry.intent);

    // Update conversation statistics
    this.updateConversationStats(userId, entry);

    // Extract and store knowledge
    if (extractedKnowledge) {
      await this.storeKnowledge(userId, extractedKnowledge);
    }

    logger.debug(`Memory updated for user: ${userId}`);
  }

  private async addToShortTermMemory(
    userId: string,
    sessionId: string,
    entry: ConversationEntry,
  ): Promise<void> {
    if (!this.shortTermMemory.has(userId)) {
      this.shortTermMemory.set(userId, []);
    }

    const memory: Memory = {
      id: uuid(),
      userId,
      sessionId,
      type: 'conversation',
      content: JSON.stringify(entry),
      metadata: {
        intent: entry.intent.primary,
        contextSources: entry.context.sources.length,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accessCount: 0,
      relevanceScore: entry.context.relevanceScore,
    };

    const userMemory = this.shortTermMemory.get(userId)!;
    userMemory.push(memory);

    // Keep only last 100 short-term memories
    if (userMemory.length > 100) {
      userMemory.shift();
    }

    // Move old memories to long-term
    if (userMemory.length % 20 === 0) {
      this.promoteToLongTermMemory(userId);
    }
  }

  private updateSkills(userId: string, intent: Intent): void {
    if (!this.userSkills.has(userId)) {
      this.userSkills.set(userId, new Set());
    }

    const skills = this.userSkills.get(userId)!;
    skills.add(intent.primary);
    skills.add(intent.category);

    logger.debug(`Skills updated for user: ${userId}`);
  }

  private updateConversationStats(userId: string, entry: ConversationEntry): void {
    if (!this.conversationStats.has(userId)) {
      this.conversationStats.set(userId, {
        totalInteractions: 0,
        intentCounts: {},
        avgResponseLength: 0,
        lastInteraction: Date.now(),
      });
    }

    const stats = this.conversationStats.get(userId);
    stats.totalInteractions++;
    stats.intentCounts[entry.intent.primary] = (stats.intentCounts[entry.intent.primary] || 0) + 1;
    stats.avgResponseLength =
      (stats.avgResponseLength * (stats.totalInteractions - 1) + entry.response.length) /
      stats.totalInteractions;
    stats.lastInteraction = Date.now();
  }

  private async storeKnowledge(userId: string, knowledge: any): Promise<void> {
    if (!this.longTermMemory.has(userId)) {
      this.longTermMemory.set(userId, []);
    }

    const memory: Memory = {
      id: uuid(),
      userId,
      sessionId: 'knowledge',
      type: 'knowledge',
      content: JSON.stringify(knowledge),
      metadata: {
        source: 'extracted',
        timestamp: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accessCount: 0,
      relevanceScore: 0.8,
    };

    this.longTermMemory.get(userId)!.push(memory);
  }

  private promoteToLongTermMemory(userId: string): void {
    const shortTerm = this.shortTermMemory.get(userId);
    if (!shortTerm || shortTerm.length === 0) return;

    const toPromote = shortTerm.slice(0, 10);
    const longTerm = this.longTermMemory.get(userId) || [];

    longTerm.push(...toPromote);
    this.longTermMemory.set(userId, longTerm);

    // Remove promoted items from short-term
    shortTerm.splice(0, 10);

    logger.debug(`Promoted 10 memories to long-term for user: ${userId}`);
  }

  /**
   * Retrieve user memories
   */
  getUserMemories(userId: string, type?: Memory['type']): Memory[] {
    const shortTerm = this.shortTermMemory.get(userId) || [];
    const longTerm = this.longTermMemory.get(userId) || [];

    let all = [...shortTerm, ...longTerm];

    if (type) {
      all = all.filter((m) => m.type === type);
    }

    // Sort by relevance and recency
    all.sort((a, b) => {
      const relevanceDiff = b.relevanceScore - a.relevanceScore;
      if (relevanceDiff !== 0) return relevanceDiff;
      return b.updatedAt - a.updatedAt;
    });

    return all;
  }

  /**
   * Get user stats
   */
  getUserStats(userId: string): Record<string, any> {
    const stats = this.conversationStats.get(userId) || {};
    const skills = this.userSkills.get(userId) || new Set();
    const memories = this.getUserMemories(userId);

    return {
      ...stats,
      skills: Array.from(skills),
      totalMemories: memories.length,
      lastInteraction: stats.lastInteraction,
    };
  }

  /**
   * Forget old memories
   */
  forgetOldMemories(userId: string, daysOld: number = 30): number {
    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    const shortTerm = this.shortTermMemory.get(userId) || [];
    const longTerm = this.longTermMemory.get(userId) || [];

    const removedCount = shortTerm.filter((m) => m.createdAt < cutoff).length +
      longTerm.filter((m) => m.createdAt < cutoff).length;

    this.shortTermMemory.set(userId, shortTerm.filter((m) => m.createdAt >= cutoff));
    this.longTermMemory.set(userId, longTerm.filter((m) => m.createdAt >= cutoff));

    logger.info(`Forgot ${removedCount} old memories for user: ${userId}`);

    return removedCount;
  }

  /**
   * Clear all user data
   */
  clearUserData(userId: string): void {
    this.shortTermMemory.delete(userId);
    this.longTermMemory.delete(userId);
    this.userSkills.delete(userId);
    this.conversationStats.delete(userId);

    logger.info(`Cleared all data for user: ${userId}`);
  }
}

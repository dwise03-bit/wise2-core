import pino from 'pino';
import { Intent } from '../intent/IntentDetector.js';

const logger = pino();

export interface Context {
  primary: string;
  sources: ContextSource[];
  relevanceScore: number;
  timestamp: number;
  compressed: boolean;
}

export interface ContextSource {
  id: string;
  type: 'memory' | 'knowledge' | 'conversation' | 'documentation';
  content: string;
  relevance: number;
  metadata: Record<string, any>;
}

export class ContextRetriever {
  private conversationHistory: Map<string, string[]> = new Map();
  private knowledgeBase: Map<string, ContextSource> = new Map();
  private userPreferences: Map<string, any> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase(): void {
    // Initialize with default knowledge sources
    logger.info('Knowledge base initialized');
  }

  /**
   * Retrieve relevant context for a query
   */
  async retrieve(
    userId: string,
    intent: Intent,
    query: string,
  ): Promise<Context> {
    const sources: ContextSource[] = [];

    // Retrieve conversation context
    const conversationSources = this.retrieveConversationContext(userId, intent);
    sources.push(...conversationSources);

    // Retrieve knowledge context
    const knowledgeSources = this.retrieveKnowledgeContext(query, intent);
    sources.push(...knowledgeSources);

    // Retrieve user preferences
    const preferenceSources = this.retrieveUserContext(userId, intent);
    sources.push(...preferenceSources);

    // Rank by relevance
    sources.sort((a, b) => b.relevance - a.relevance);

    // Take top 5 sources
    const topSources = sources.slice(0, 5);

    // Calculate overall relevance
    const relevanceScore = topSources.length > 0
      ? topSources.reduce((sum, s) => sum + s.relevance, 0) / topSources.length
      : 0;

    logger.debug(`Retrieved ${topSources.length} context sources (relevance: ${relevanceScore})`);

    return {
      primary: topSources[0]?.type || 'knowledge',
      sources: topSources,
      relevanceScore,
      timestamp: Date.now(),
      compressed: false,
    };
  }

  private retrieveConversationContext(userId: string, intent: Intent): ContextSource[] {
    const history = this.conversationHistory.get(userId) || [];

    if (history.length === 0) {
      return [];
    }

    // Return recent conversation messages as context
    const recentMessages = history.slice(-5);

    return [
      {
        id: `conv-${userId}`,
        type: 'conversation',
        content: recentMessages.join('\n'),
        relevance: 0.8,
        metadata: { messageCount: recentMessages.length },
      },
    ];
  }

  private retrieveKnowledgeContext(query: string, intent: Intent): ContextSource[] {
    const sources: ContextSource[] = [];

    // Search knowledge base for relevant entries
    for (const [id, source] of this.knowledgeBase.entries()) {
      const relevance = this.calculateRelevance(query, source.content, intent);

      if (relevance > 0.5) {
        sources.push({
          ...source,
          relevance,
        });
      }
    }

    return sources.slice(0, 3); // Return top 3 knowledge sources
  }

  private retrieveUserContext(userId: string, intent: Intent): ContextSource[] {
    const prefs = this.userPreferences.get(userId);

    if (!prefs) {
      return [];
    }

    return [
      {
        id: `pref-${userId}`,
        type: 'knowledge',
        content: JSON.stringify(prefs),
        relevance: 0.7,
        metadata: { type: 'user-preferences' },
      },
    ];
  }

  private calculateRelevance(query: string, content: string, intent: Intent): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();

    // Count matching words
    let matches = 0;
    for (const word of queryWords) {
      if (contentLower.includes(word) && word.length > 3) {
        matches++;
      }
    }

    // Calculate relevance score
    const wordMatchRelevance = Math.min(matches / queryWords.length, 1);

    // Boost for intent match
    let intentBoost = 0;
    if (contentLower.includes(intent.primary)) {
      intentBoost = 0.2;
    }

    return Math.round((wordMatchRelevance * 0.7 + intentBoost) * 100) / 100;
  }

  /**
   * Add to conversation history
   */
  addToHistory(userId: string, message: string): void {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }

    const history = this.conversationHistory.get(userId)!;
    history.push(message);

    // Keep only last 50 messages
    if (history.length > 50) {
      history.shift();
    }
  }

  /**
   * Compress context for long conversations
   */
  compressContext(context: Context): Context {
    if (context.sources.length <= 3) {
      return context;
    }

    // Summarize sources
    const compressed: ContextSource[] = [];
    for (const source of context.sources.slice(0, 3)) {
      compressed.push({
        ...source,
        content: this.summarizeContent(source.content),
      });
    }

    return {
      ...context,
      sources: compressed,
      compressed: true,
    };
  }

  private summarizeContent(content: string): string {
    // Simple summarization: take first 500 chars
    return content.length > 500 ? content.substring(0, 500) + '...' : content;
  }

  /**
   * Set user preferences
   */
  setUserPreferences(userId: string, preferences: Record<string, any>): void {
    this.userPreferences.set(userId, preferences);
  }

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): Record<string, any> {
    return this.userPreferences.get(userId) || {};
  }
}

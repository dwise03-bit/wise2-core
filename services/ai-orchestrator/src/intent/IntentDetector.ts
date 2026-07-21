import pino from 'pino';

const logger = pino();

export interface Intent {
  primary: string;
  secondary: string[];
  confidence: number;
  category: 'question' | 'command' | 'conversation' | 'creation' | 'analysis';
  entities: Entity[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
}

export class IntentDetector {
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private categoryPatterns: Map<string, RegExp> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    // Intent patterns for common queries
    this.intentPatterns.set('question', [
      /^what\s/i,
      /^how\s/i,
      /^where\s/i,
      /^when\s/i,
      /^why\s/i,
      /^who\s/i,
      /\?$/,
    ]);

    this.intentPatterns.set('command', [
      /^(create|make|build|generate|write|deploy)\s/i,
      /^(update|modify|change|edit)\s/i,
      /^(delete|remove|drop)\s/i,
      /^(run|execute|start|stop)\s/i,
    ]);

    this.intentPatterns.set('conversation', [
      /^(hello|hi|hey)\s/i,
      /^(thanks|thank you)\s/i,
      /^(ok|okay|sure|yes|no)\s/i,
      /^(tell me|talk about)\s/i,
    ]);

    this.intentPatterns.set('creation', [
      /^(write|compose|draft|author)\s/i,
      /^(design|plan|architect)\s/i,
      /^(generate|create|produce)\s/i,
    ]);

    this.intentPatterns.set('analysis', [
      /^(analyze|analyze|review|examine|assess)\s/i,
      /^(compare|contrast|difference)\s/i,
      /^(explain|describe|clarify)\s/i,
    ]);

    // Category patterns
    this.categoryPatterns.set('question', /[?!]$/);
    this.categoryPatterns.set('command', /^(please\s)?(create|make|build|run|deploy)\s/i);
    this.categoryPatterns.set('creation', /^(write|compose|generate|design)\s/i);
    this.categoryPatterns.set('analysis', /^(analyze|compare|review|examine)\s/i);
  }

  /**
   * Detect user intent from query
   */
  async detect(userQuery: string): Promise<Intent> {
    const query = userQuery.trim();

    // Determine primary intent
    const primary = this.detectPrimaryIntent(query);

    // Detect secondary intents
    const secondary = this.detectSecondaryIntents(query, primary);

    // Detect category
    const category = this.detectCategory(query);

    // Extract entities
    const entities = this.extractEntities(query);

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(query);

    // Calculate confidence based on pattern matching
    const confidence = this.calculateConfidence(query, primary);

    logger.debug(`Intent detected: primary=${primary}, category=${category}, confidence=${confidence}`);

    return {
      primary,
      secondary,
      confidence,
      category,
      entities,
      sentiment,
    };
  }

  private detectPrimaryIntent(query: string): string {
    // Check each intent pattern
    for (const [intent, patterns] of this.intentPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(query)) {
          return intent;
        }
      }
    }

    // Default to question if no pattern matches
    return 'question';
  }

  private detectSecondaryIntents(query: string, primary: string): string[] {
    const secondary: string[] = [];

    for (const [intent, patterns] of this.intentPatterns.entries()) {
      if (intent === primary) continue; // Skip primary intent

      for (const pattern of patterns) {
        if (pattern.test(query)) {
          secondary.push(intent);
          break;
        }
      }
    }

    return secondary.slice(0, 2); // Max 2 secondary intents
  }

  private detectCategory(query: string): Intent['category'] {
    if (this.categoryPatterns.get('question')?.test(query)) return 'question';
    if (this.categoryPatterns.get('command')?.test(query)) return 'command';
    if (this.categoryPatterns.get('creation')?.test(query)) return 'creation';
    if (this.categoryPatterns.get('analysis')?.test(query)) return 'analysis';
    return 'conversation';
  }

  private extractEntities(query: string): Entity[] {
    const entities: Entity[] = [];

    // Extract email entities
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = query.match(emailRegex) || [];
    entities.push(
      ...emails.map((email) => ({
        type: 'email',
        value: email,
        confidence: 0.95,
      })),
    );

    // Extract URL entities
    const urlRegex = /https?:\/\/[\w.-]+\.\w+[/\w.-]*/g;
    const urls = query.match(urlRegex) || [];
    entities.push(
      ...urls.map((url) => ({
        type: 'url',
        value: url,
        confidence: 0.95,
      })),
    );

    // Extract numbers
    const numberRegex = /\b\d+(\.\d+)?\b/g;
    const numbers = query.match(numberRegex) || [];
    entities.push(
      ...numbers.slice(0, 3).map((num) => ({
        type: 'number',
        value: num,
        confidence: 0.9,
      })),
    );

    return entities;
  }

  private analyzeSentiment(query: string): Intent['sentiment'] {
    const positiveWords = /\b(good|great|excellent|amazing|love|awesome|perfect|fantastic)\b/i;
    const negativeWords = /\b(bad|terrible|hate|awful|poor|horrible|useless)\b/i;

    if (negativeWords.test(query)) return 'negative';
    if (positiveWords.test(query)) return 'positive';
    return 'neutral';
  }

  private calculateConfidence(query: string, intent: string): number {
    const patterns = this.intentPatterns.get(intent) || [];
    let matches = 0;

    for (const pattern of patterns) {
      if (pattern.test(query)) {
        matches++;
      }
    }

    // Confidence increases with query length and pattern matches
    const lengthFactor = Math.min(query.length / 100, 1);
    const matchFactor = Math.min(matches / 3, 1);

    return Math.round((lengthFactor * 0.3 + matchFactor * 0.7) * 100) / 100;
  }
}

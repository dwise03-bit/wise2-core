/**
 * AgentContext - Shared context for agent execution
 */

export interface ContextData {
  userId?: string;
  agentId?: string;
  sessionId?: string;
  workspace?: string;
  [key: string]: unknown;
}

export class AgentContext {
  private data: Map<string, unknown> = new Map();
  private createdAt: Date = new Date();

  constructor(initialData?: ContextData) {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        this.data.set(key, value);
      });
    }
  }

  /**
   * Get context value
   */
  get(key: string): unknown {
    return this.data.get(key);
  }

  /**
   * Set context value
   */
  set(key: string, value: unknown): void {
    this.data.set(key, value);
  }

  /**
   * Check if key exists
   */
  has(key: string): boolean {
    return this.data.has(key);
  }

  /**
   * Get all context data
   */
  getAll(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    this.data.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Merge with other context
   */
  merge(other: AgentContext): AgentContext {
    const merged = new AgentContext(this.getAll() as ContextData);
    other.data.forEach((value, key) => {
      merged.set(key, value);
    });
    return merged;
  }

  /**
   * Clear context
   */
  clear(): void {
    this.data.clear();
  }

  /**
   * Get creation time
   */
  getCreatedAt(): Date {
    return this.createdAt;
  }
}


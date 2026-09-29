/**
 * AgentRegistry - Manages agent lifecycle and registration
 */

import { AgentConfig } from './types.js';

export class AgentRegistry {
  private agents: Map<string, AgentConfig> = new Map();
  private active: Map<string, unknown> = new Map();

  /**
   * Register an agent
   */
  register(config: AgentConfig): void {
    if (this.agents.has(config.id)) {
      console.warn(`Agent ${config.id} already registered, overwriting`);
    }
    this.agents.set(config.id, config);
  }

  /**
   * Get agent configuration
   */
  get(agentId: string): AgentConfig | undefined {
    return this.agents.get(agentId);
  }

  /**
   * List all registered agents
   */
  list(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  /**
   * Check if agent is registered
   */
  has(agentId: string): boolean {
    return this.agents.has(agentId);
  }

  /**
   * Mark agent as active
   */
  setActive(agentId: string, instance: unknown): void {
    this.active.set(agentId, instance);
  }

  /**
   * Get active agent instance
   */
  getActive(agentId: string): unknown | undefined {
    return this.active.get(agentId);
  }

  /**
   * Check if agent is active
   */
  isActive(agentId: string): boolean {
    return this.active.has(agentId);
  }

  /**
   * Deactivate agent
   */
  deactivate(agentId: string): void {
    this.active.delete(agentId);
  }

  /**
   * Get all active agents
   */
  getActiveAgents(): string[] {
    return Array.from(this.active.keys());
  }

  /**
   * Unregister an agent
   */
  unregister(agentId: string): boolean {
    this.deactivate(agentId);
    return this.agents.delete(agentId);
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.agents.clear();
    this.active.clear();
  }

  /**
   * Get registry statistics
   */
  getStats(): { total: number; active: number } {
    return {
      total: this.agents.size,
      active: this.active.size
    };
  }
}


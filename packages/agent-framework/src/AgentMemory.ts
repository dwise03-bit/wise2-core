/**
 * AgentMemory - Per-agent persistent state
 */

import { AgentState, ToolCall } from './types.js';

export class AgentMemory {
  private agentId: string;
  private state: AgentState = {};
  private toolHistory: ToolCall[] = [];
  private checkpoints: Map<string, AgentState> = new Map();
  private loaded: boolean = false;

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  /**
   * Load memory from storage
   */
  async load(): Promise<void> {
    // TODO: Implement loading from persistent storage
    this.loaded = true;
  }

  /**
   * Save memory to storage
   */
  async save(): Promise<void> {
    // TODO: Implement saving to persistent storage
  }

  /**
   * Add tool call to history
   */
  addToolCall(call: ToolCall): void {
    this.toolHistory.push(call);
  }

  /**
   * Get tool history
   */
  getToolHistory(): ToolCall[] {
    return this.toolHistory;
  }

  /**
   * Clear tool history
   */
  clearToolHistory(): void {
    this.toolHistory = [];
  }

  /**
   * Save checkpoint
   */
  checkpoint(name: string): void {
    this.checkpoints.set(name, JSON.parse(JSON.stringify(this.state)));
  }

  /**
   * Restore from checkpoint
   */
  restore(name: string): boolean {
    const checkpoint = this.checkpoints.get(name);
    if (checkpoint) {
      this.state = JSON.parse(JSON.stringify(checkpoint));
      return true;
    }
    return false;
  }

  /**
   * Get state
   */
  getState(): AgentState {
    return this.state;
  }

  /**
   * Update state
   */
  setState(updates: Partial<AgentState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Clear memory
   */
  async clear(): Promise<void> {
    this.state = {};
    this.toolHistory = [];
    this.checkpoints.clear();
  }

  /**
   * Check if loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }
}


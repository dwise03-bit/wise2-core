/**
 * BaseAgent - Abstract base class for all agents
 */

import { AgentConfig, AgentMessage, AgentResponse, AgentState, ToolCall } from './types.js';
import { AgentMemory } from './AgentMemory.js';
import { AgentTools } from './AgentTools.js';

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected memory: AgentMemory;
  protected tools: AgentTools;
  protected conversationHistory: AgentMessage[] = [];
  protected state: AgentState = {};

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = new AgentMemory(config.id);
    this.tools = new AgentTools(config.tools);
  }

  /**
   * Initialize agent (load prompt, set up tools)
   */
  async initialize(): Promise<void> {
    try {
      await this.memory.load();
      await this.tools.initialize();
      console.log(`Agent ${this.config.id} initialized`);
    } catch (error) {
      console.error(`Failed to initialize agent ${this.config.id}:`, error);
      throw error;
    }
  }

  /**
   * Process a user message and generate response
   */
  async process(userMessage: string): Promise<AgentResponse> {
    try {
      // Add to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Get response (implement in subclass)
      const response = await this.generateResponse(userMessage);

      // Add to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      });

      // Save memory
      await this.memory.save();

      return response;
    } catch (error) {
      console.error(`Error processing message in ${this.config.id}:`, error);
      throw error;
    }
  }

  /**
   * Generate response (implement in subclass)
   */
  protected abstract generateResponse(message: string): Promise<AgentResponse>;

  /**
   * Execute a tool call
   */
  protected async executeTool(toolName: string, args: Record<string, unknown>): Promise<ToolCall> {
    try {
      const result = await this.tools.execute(toolName, args);
      
      const toolCall: ToolCall = {
        tool: toolName,
        args,
        result
      };

      // Track in memory
      this.memory.addToolCall(toolCall);

      return toolCall;
    } catch (error) {
      console.error(`Tool execution failed: ${toolName}`, error);
      throw error;
    }
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }

  /**
   * Get conversation history
   */
  getHistory(): AgentMessage[] {
    return this.conversationHistory;
  }

  /**
   * Get current state
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
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Reset agent to initial state
   */
  async reset(): Promise<void> {
    this.conversationHistory = [];
    this.state = {};
    await this.memory.clear();
  }
}


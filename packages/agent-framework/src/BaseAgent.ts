import pino from 'pino';
import { v4 as uuid } from 'uuid';
import {
  AgentConfig,
  AgentRequest,
  AgentResponse,
  AgentMemory,
  ComposedPrompt,
  IntegratedContext,
  Tool,
} from './types';

const logger = pino();

/**
 * BaseAgent - Abstract base class for all WISE² agents
 *
 * All specialized agents (Developer, Infrastructure, Marketing, etc.)
 * inherit from this class and customize via PromptOS prompts.
 */
export abstract class BaseAgent {
  protected config: AgentConfig;
  protected memory: Map<string, AgentMemory> = new Map();
  protected tools: Map<string, Tool> = new Map();

  constructor(config: AgentConfig) {
    this.config = config;
    logger.info({ agent: config.name }, 'Agent initialized');
  }

  /**
   * Main entry point for agent execution
   */
  async execute(request: AgentRequest): Promise<AgentResponse> {
    const startTime = Date.now();

    try {
      logger.info({ agentName: this.config.name, requestId: request.id }, 'Executing agent request');

      // Load or create memory for this user
      const memory = this.loadMemory(request.userId, request.sessionId);

      // Get integrated context (knowledge graph, vault, sync state)
      const context = await this.getIntegratedContext(request.userId);

      // Compose prompt with memory + context
      const prompt = this.composePrompt(request, memory, context);

      // Execute the agent logic
      const response = await this.executePrompt(prompt, request);

      // Update memory with this interaction
      this.updateMemory(request.userId, request.sessionId, request, response);

      const executionTime = Date.now() - startTime;

      logger.info(
        { agentName: this.config.name, requestId: request.id, executionTime },
        'Agent execution complete',
      );

      return {
        id: uuid(),
        agentName: this.config.name,
        response,
        reasoning: 'See metadata.prompt for full reasoning',
        executionTime,
        toolsUsed: [],
      };
    } catch (error) {
      logger.error(
        { agentName: this.config.name, requestId: request.id, error },
        'Agent execution failed',
      );
      throw error;
    }
  }

  /**
   * Load or create agent memory for a user
   */
  protected loadMemory(userId: string, sessionId: string): AgentMemory {
    const key = `${userId}:${sessionId}`;

    if (!this.memory.has(key)) {
      this.memory.set(key, {
        userId,
        sessionId,
        shortTerm: [],
        longTerm: {},
        preferences: {},
      });
    }

    return this.memory.get(key)!;
  }

  /**
   * Update memory with new interaction
   */
  protected updateMemory(
    userId: string,
    sessionId: string,
    request: AgentRequest,
    response: string,
  ): void {
    const memory = this.loadMemory(userId, sessionId);

    // Add to short-term conversation history
    memory.shortTerm.push({
      role: 'user',
      content: request.query,
      timestamp: Date.now(),
    });

    memory.shortTerm.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    // Keep only last 10 interactions in short-term
    if (memory.shortTerm.length > 20) {
      memory.shortTerm = memory.shortTerm.slice(-20);
    }
  }

  /**
   * Get integrated context from WISE² services
   */
  protected async getIntegratedContext(userId: string): Promise<IntegratedContext> {
    // TODO: Integrate with Knowledge Graph, Second Brain, Memory Engine, Device Sync
    return {
      memory: this.loadMemory(userId, 'default'),
      knowledgeGraph: {},
      secondBrain: {},
      deviceSync: {},
    };
  }

  /**
   * Compose final prompt from modules, context, and conversation
   */
  protected composePrompt(
    request: AgentRequest,
    memory: AgentMemory,
    context: IntegratedContext,
  ): ComposedPrompt {
    // TODO: Load PromptOS modules and compose
    return {
      system: `You are the ${this.config.name} agent for WISE².`,
      messages: memory.shortTerm,
      context: {
        userPreferences: memory.preferences,
        knowledgeGraph: context.knowledgeGraph,
      },
    };
  }

  /**
   * Abstract method - implement in specialized agents
   */
  protected abstract executePrompt(prompt: ComposedPrompt, request: AgentRequest): Promise<string>;

  /**
   * Register a tool for this agent
   */
  protected registerTool(name: string, tool: Tool): void {
    this.tools.set(name, tool);
  }

  /**
   * Execute a tool
   */
  protected async useTool(name: string, params: Record<string, any>): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }

    return tool(params);
  }

  /**
   * Clean up agent resources
   */
  async shutdown(): Promise<void> {
    logger.info({ agent: this.config.name }, 'Agent shutting down');
    this.memory.clear();
  }
}

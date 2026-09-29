/**
 * AgentTools - Tool registration and execution
 */

import { ToolResult } from './types.js';

type ToolExecutor = (args: Record<string, unknown>) => Promise<ToolResult>;

export class AgentTools {
  private tools: Map<string, ToolExecutor> = new Map();
  private allowedTools: Set<string>;

  constructor(allowedTools: string[]) {
    this.allowedTools = new Set(allowedTools);
  }

  /**
   * Initialize tools
   */
  async initialize(): Promise<void> {
    // Register built-in tools
    this.registerBuiltins();
  }

  /**
   * Register a tool executor
   */
  registerTool(name: string, executor: ToolExecutor): void {
    if (!this.allowedTools.has(name)) {
      throw new Error(`Tool not allowed: ${name}`);
    }
    this.tools.set(name, executor);
  }

  /**
   * Execute a tool
   */
  async execute(toolName: string, args: Record<string, unknown>): Promise<ToolResult> {
    if (!this.allowedTools.has(toolName)) {
      return {
        success: false,
        error: `Tool not allowed: ${toolName}`
      };
    }

    const executor = this.tools.get(toolName);
    if (!executor) {
      return {
        success: false,
        error: `Tool not registered: ${toolName}`
      };
    }

    try {
      const start = performance.now();
      const result = await executor(args);
      const duration = performance.now() - start;
      
      return {
        ...result,
        duration: Math.round(duration)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Register built-in tools
   */
  private registerBuiltins(): void {
    // Read file tool
    if (this.allowedTools.has('read')) {
      this.registerTool('read', async (args) => {
        // Implementation would go here
        return { success: true, data: 'File content' };
      });
    }

    // Execute bash command tool
    if (this.allowedTools.has('bash')) {
      this.registerTool('bash', async (args) => {
        // Implementation would go here
        return { success: true, data: 'Command output' };
      });
    }

    // Git operations tool
    if (this.allowedTools.has('git')) {
      this.registerTool('git', async (args) => {
        // Implementation would go here
        return { success: true, data: 'Git result' };
      });
    }
  }

  /**
   * Get list of registered tools
   */
  listTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Check if tool is available
   */
  hasTool(name: string): boolean {
    return this.tools.has(name) && this.allowedTools.has(name);
  }

  /**
   * Check if tool is allowed
   */
  isAllowed(name: string): boolean {
    return this.allowedTools.has(name);
  }
}


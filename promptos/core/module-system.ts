/**
 * PromptOS Module System
 * Handles prompt module inheritance and composition
 */

import { PromptModule, AgentDefinition } from './types.js';
import { PromptRegistry } from './prompt-registry.js';

export class ModuleSystem {
  private registry: PromptRegistry;
  private moduleGraph: Map<string, Set<string>> = new Map();

  constructor(registry: PromptRegistry) {
    this.registry = registry;
  }

  /**
   * Load modules in inheritance order
   * Base → Shared → Specialized
   */
  async loadModulesForAgent(agentId: string): Promise<PromptModule[]> {
    const modules: PromptModule[] = [];

    // Get agent definition
    const agentPrompt = await this.registry.loadAgentPrompt(agentId);
    
    // Extract module references from agent prompt
    // Agent prompts typically start with "## Inherited Modules"
    const inheritedModules = this.extractModuleReferences(agentPrompt);

    // Load each module in order
    for (const moduleId of inheritedModules) {
      const module = await this.registry.loadModule(moduleId);
      modules.push(module);
      
      // Track in dependency graph
      if (!this.moduleGraph.has(agentId)) {
        this.moduleGraph.set(agentId, new Set());
      }
      this.moduleGraph.get(agentId)!.add(moduleId);
    }

    return modules;
  }

  /**
   * Extract module references from agent prompt
   */
  private extractModuleReferences(agentPrompt: string): string[] {
    const modules: string[] = [];
    
    // Look for "## Inherited Modules" section
    const inheritMatch = agentPrompt.match(
      /## Inherited Modules\n([\s\S]*?)(?=\n##|$)/
    );

    if (!inheritMatch) {
      return modules;
    }

    const section = inheritMatch[1];
    
    // Extract module paths in parentheses
    const regex = /modules\/(\w+)\.md/g;
    let match;
    
    while ((match = regex.exec(section)) !== null) {
      modules.push(match[1]);
    }

    return modules;
  }

  /**
   * Validate module dependencies (circular, missing)
   */
  async validateDependencies(agentId: string): Promise<string[]> {
    const errors: string[] = [];
    const visited = new Set<string>();
    
    async function visit(moduleId: string, path: string[]): Promise<void> {
      if (path.includes(moduleId)) {
        errors.push(`Circular dependency: ${path.join(' -> ')} -> ${moduleId}`);
        return;
      }

      if (visited.has(moduleId)) {
        return;
      }

      visited.add(moduleId);

      try {
        await this.registry.loadModule(moduleId);
      } catch (error) {
        errors.push(`Missing module: ${moduleId}`);
      }
    }

    const modules = await this.loadModulesForAgent(agentId);
    for (const module of modules) {
      await visit(module.id, []);
    }

    return errors;
  }

  /**
   * Get dependency graph for visualization
   */
  getDependencyGraph(): Record<string, string[]> {
    const graph: Record<string, string[]> = {};
    
    for (const [agent, deps] of this.moduleGraph.entries()) {
      graph[agent] = Array.from(deps);
    }

    return graph;
  }

  /**
   * Clear cached module dependencies
   */
  clearDependencies(): void {
    this.moduleGraph.clear();
  }
}


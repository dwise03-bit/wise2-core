/**
 * PromptOS Prompt Registry
 * Load, cache, and manage prompt files from filesystem
 */

import * as fs from 'fs';
import * as path from 'path';
import { PromptModule, AgentDefinition } from './types.js';

export class PromptRegistry {
  private promptsDir: string;
  private cache: Map<string, PromptModule> = new Map();
  private agentCache: Map<string, AgentDefinition> = new Map();
  private loadedAt: Map<string, Date> = new Map();

  constructor(promptsDir: string = './promptos') {
    this.promptsDir = promptsDir;
  }

  /**
   * Load a prompt module from filesystem
   */
  async loadModule(moduleId: string): Promise<PromptModule> {
    // Check cache first
    if (this.cache.has(moduleId)) {
      return this.cache.get(moduleId)!;
    }

    const modulePath = path.join(this.promptsDir, 'modules', `${moduleId}.md`);
    
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Module not found: ${moduleId} at ${modulePath}`);
    }

    const content = fs.readFileSync(modulePath, 'utf-8');
    const module: PromptModule = {
      id: moduleId,
      name: moduleId.replace(/-/g, ' ').toUpperCase(),
      content,
      updated: new Date(fs.statSync(modulePath).mtime),
      version: this.getFileHash(modulePath)
    };

    // Cache it
    this.cache.set(moduleId, module);
    this.loadedAt.set(moduleId, new Date());

    return module;
  }

  /**
   * Load an agent prompt
   */
  async loadAgentPrompt(agentId: string): Promise<string> {
    const agentPath = path.join(this.promptsDir, 'agents', `${agentId}.md`);
    
    if (!fs.existsSync(agentPath)) {
      throw new Error(`Agent not found: ${agentId} at ${agentPath}`);
    }

    return fs.readFileSync(agentPath, 'utf-8');
  }

  /**
   * Load base system prompt
   */
  async loadBasePrompt(): Promise<string> {
    const basePath = path.join(this.promptsDir, 'core', 'base-system-prompt.md');
    
    if (!fs.existsSync(basePath)) {
      throw new Error(`Base prompt not found at ${basePath}`);
    }

    return fs.readFileSync(basePath, 'utf-8');
  }

  /**
   * Get all available agents
   */
  async listAgents(): Promise<string[]> {
    const agentsDir = path.join(this.promptsDir, 'agents');
    
    if (!fs.existsSync(agentsDir)) {
      return [];
    }

    const files = fs.readdirSync(agentsDir);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  }

  /**
   * Get all available modules
   */
  async listModules(): Promise<string[]> {
    const modulesDir = path.join(this.promptsDir, 'modules');
    
    if (!fs.existsSync(modulesDir)) {
      return [];
    }

    const files = fs.readdirSync(modulesDir);
    return files
      .filter(f => f.endsWith('.md'))
      .map(f => f.replace('.md', ''));
  }

  /**
   * Clear cache for a specific module or all modules
   */
  clearCache(moduleId?: string): void {
    if (moduleId) {
      this.cache.delete(moduleId);
      this.loadedAt.delete(moduleId);
    } else {
      this.cache.clear();
      this.loadedAt.clear();
    }
  }

  /**
   * Check if a module is cached
   */
  isCached(moduleId: string): boolean {
    return this.cache.has(moduleId);
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      cachedModules: this.cache.size,
      cachedAgents: this.agentCache.size,
      cacheSize: `${Array.from(this.cache.values()).reduce((s, m) => s + m.content.length, 0)} bytes`
    };
  }

  /**
   * Simple file hash for version tracking
   */
  private getFileHash(filePath: string): string {
    const stat = fs.statSync(filePath);
    return `v${stat.mtime.getTime()}`;
  }
}


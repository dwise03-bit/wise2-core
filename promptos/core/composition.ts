/**
 * PromptOS Composition Engine
 * Composes complete prompts from modules
 */

import { PromptComposition, AgentDefinition, PromptModule } from './types.js';
import { PromptRegistry } from './prompt-registry.js';
import { ModuleSystem } from './module-system.js';

export class PromptComposer {
  private registry: PromptRegistry;
  private moduleSystem: ModuleSystem;

  constructor(registry: PromptRegistry, moduleSystem: ModuleSystem) {
    this.registry = registry;
    this.moduleSystem = moduleSystem;
  }

  /**
   * Compose complete prompt for an agent
   */
  async composePrompt(agentId: string): Promise<PromptComposition> {
    // Load base prompt
    const basePrompt = await this.registry.loadBasePrompt();

    // Load agent prompt
    const agentPrompt = await this.registry.loadAgentPrompt(agentId);

    // Load inherited modules
    const modules = await this.moduleSystem.loadModulesForAgent(agentId);

    // Validate dependencies
    const errors = await this.moduleSystem.validateDependencies(agentId);
    if (errors.length > 0) {
      throw new Error(`Dependency validation failed:\n${errors.join('\n')}`);
    }

    // Build full prompt
    const sections: string[] = [
      this.sectionHeader('PROMPTOS CORE FOUNDATION'),
      basePrompt,
      this.sectionHeader('INHERITED MODULES')
    ];

    for (const module of modules) {
      sections.push(this.sectionHeader(`MODULE: ${module.id.toUpperCase()}`));
      sections.push(module.content);
    }

    sections.push(this.sectionHeader(`AGENT: ${agentId.toUpperCase()}`));
    sections.push(agentPrompt);

    const fullPrompt = sections.join('\n\n');

    const composition: PromptComposition = {
      agent: {
        id: agentId,
        name: agentId.replace(/-/g, ' ').toUpperCase(),
        role: this.extractRole(agentPrompt),
        specializations: this.extractSpecializations(agentPrompt),
        modules: modules.map(m => m.id),
        tools: []
      },
      basePrompt,
      modules,
      fullPrompt,
      composed: new Date()
    };

    return composition;
  }

  /**
   * Extract role from agent prompt
   */
  private extractRole(agentPrompt: string): string {
    const match = agentPrompt.match(/\*\*Role\*\*:\s*([^\n]+)/);
    return match ? match[1] : 'Unknown role';
  }

  /**
   * Extract specializations from agent prompt
   */
  private extractSpecializations(agentPrompt: string): string[] {
    const match = agentPrompt.match(/\*\*Specialization\*\*:\s*([^\n]+)/);
    if (!match) return [];
    
    return match[1].split(',').map(s => s.trim());
  }

  /**
   * Format section header
   */
  private sectionHeader(title: string): string {
    return `\n${'='.repeat(70)}\n${title}\n${'='.repeat(70)}\n`;
  }

  /**
   * Get prompt statistics
   */
  getPromptStats(composition: PromptComposition): {
    totalTokens: number;
    totalWords: number;
    totalSections: number;
  } {
    const words = composition.fullPrompt.split(/\s+/).length;
    // Rough estimate: ~4 characters per token
    const tokens = Math.ceil(composition.fullPrompt.length / 4);

    return {
      totalTokens: tokens,
      totalWords: words,
      totalSections: 1 + composition.modules.length + 1 // base + modules + agent
    };
  }

  /**
   * Format prompt for display
   */
  formatForDisplay(composition: PromptComposition): string {
    const stats = this.getPromptStats(composition);

    return `
PROMPT COMPOSITION
==================

Agent: ${composition.agent.id}
Role: ${composition.agent.role}
Specializations: ${composition.agent.specializations.join(', ')}

Modules Loaded: ${composition.modules.length}
- ${composition.modules.map(m => m.id).join('\n- ')}

Statistics:
- Total Tokens (estimated): ${stats.totalTokens.toLocaleString()}
- Total Words: ${stats.totalWords.toLocaleString()}
- Total Sections: ${stats.totalSections}
- Composed: ${composition.composed.toISOString()}

Ready to use.
    `.trim();
  }
}


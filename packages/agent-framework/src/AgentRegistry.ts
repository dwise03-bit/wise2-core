import pino from 'pino';
import { BaseAgent } from './BaseAgent';
import { AgentConfig } from './types';

const logger = pino();

/**
 * AgentRegistry - Manages agent lifecycle and registration
 */
export class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();
  private configs: Map<string, AgentConfig> = new Map();

  /**
   * Register an agent
   */
  register(name: string, agent: BaseAgent, config: AgentConfig): void {
    this.agents.set(name, agent);
    this.configs.set(name, config);
    logger.info({ agent: name }, 'Agent registered');
  }

  /**
   * Get an agent by name
   */
  getAgent(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * Get agent config
   */
  getConfig(name: string): AgentConfig | undefined {
    return this.configs.get(name);
  }

  /**
   * List all registered agents
   */
  listAgents(): string[] {
    return Array.from(this.agents.keys());
  }

  /**
   * Unregister an agent
   */
  unregister(name: string): boolean {
    const removed = this.agents.delete(name);
    this.configs.delete(name);
    if (removed) {
      logger.info({ agent: name }, 'Agent unregistered');
    }
    return removed;
  }

  /**
   * Check if agent is registered
   */
  has(name: string): boolean {
    return this.agents.has(name);
  }

  /**
   * Shutdown all agents
   */
  async shutdownAll(): Promise<void> {
    const shutdownPromises = Array.from(this.agents.values()).map(agent =>
      agent.shutdown().catch(error => {
        logger.error({ error }, 'Error shutting down agent');
      }),
    );

    await Promise.all(shutdownPromises);
    this.agents.clear();
    this.configs.clear();
    logger.info('All agents shut down');
  }
}

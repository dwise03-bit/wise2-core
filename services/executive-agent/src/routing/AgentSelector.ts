/**
 * Agent Selector - Choose which specialist agents to use
 */

export class AgentSelector {
  /**
   * Select agents for goals
   */
  async selectAgents(goals: string[]): Promise<any[]> {
    // Placeholder: would match goals to agents
    return [
      { agent: 'developer', task: 'Build feature' },
      { agent: 'qa', task: 'Test feature' }
    ];
  }
}


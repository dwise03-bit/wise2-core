import pino from 'pino';
import { AgentRequest, AgentRouterResult } from './types';

const logger = pino();

/**
 * AgentRouter - Routes requests to appropriate agents based on intent
 */
export class AgentRouter {
  private agentKeywords: Map<string, { agent: string; weight: number }> = new Map();

  constructor() {
    this.initializeRouting();
  }

  private initializeRouting(): void {
    // Developer agent keywords
    const devKeywords = [
      'build', 'code', 'implement', 'fix', 'debug', 'refactor', 'test',
      'architecture', 'design', 'api', 'database', 'optimization',
    ];
    devKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'developer', weight: 3 }));

    // Infrastructure agent keywords
    const infraKeywords = [
      'deploy', 'server', 'infrastructure', 'ops', 'docker', 'kubernetes',
      'ci', 'cd', 'monitoring', 'scaling', 'performance',
    ];
    infraKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'infrastructure', weight: 3 }));

    // Raspberry Pi agent keywords
    const piKeywords = [
      'edge', 'device', 'automation', 'pi', 'raspberry', 'iot', 'offline',
      'sync', 'hardware', 'gpio', 'sensor',
    ];
    piKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'raspberry-pi', weight: 3 }));

    // Discord agent keywords
    const discordKeywords = [
      'discord', 'notification', 'message', 'announcement', 'alert', 'channel',
    ];
    discordKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'discord', weight: 3 }));

    // Marketing agent keywords
    const marketingKeywords = [
      'marketing', 'campaign', 'content', 'brand', 'social', 'email', 'promotion',
    ];
    marketingKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'marketing', weight: 3 }));

    // Sales agent keywords
    const salesKeywords = [
      'sales', 'deal', 'customer', 'pipeline', 'forecast', 'revenue', 'pricing',
    ];
    salesKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'sales', weight: 3 }));

    // Finance agent keywords
    const financeKeywords = [
      'finance', 'budget', 'cost', 'expense', 'revenue', 'forecast', 'contract',
    ];
    financeKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'finance', weight: 3 }));

    // Research agent keywords
    const researchKeywords = [
      'research', 'analyze', 'data', 'analysis', 'competitive', 'market', 'insight',
    ];
    researchKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'research', weight: 3 }));

    // Security agent keywords
    const securityKeywords = [
      'security', 'compliance', 'access', 'permission', 'audit', 'vulnerability',
    ];
    securityKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'security', weight: 3 }));

    // QA agent keywords
    const qaKeywords = [
      'test', 'qa', 'quality', 'verification', 'validation', 'regression',
    ];
    qaKeywords.forEach(k => this.agentKeywords.set(k, { agent: 'qa', weight: 3 }));

    logger.info('Agent routing initialized');
  }

  /**
   * Route a request to the appropriate agent(s)
   */
  route(request: AgentRequest): AgentRouterResult {
    const scores: Map<string, number> = new Map();

    // Score each agent based on keywords
    const query = request.query.toLowerCase();
    const tokens = query.split(/\s+/);

    for (const token of tokens) {
      const match = this.agentKeywords.get(token);
      if (match) {
        const current = scores.get(match.agent) || 0;
        scores.set(match.agent, current + match.weight);
      }
    }

    // If no match found, default to Executive
    if (scores.size === 0) {
      logger.info({ query }, 'No agent keyword match, routing to Executive');
      return {
        agent: 'executive',
        confidence: 0.5,
        reasoning: 'No specific agent keywords found, routing to Executive for decision',
      };
    }

    // Find best match
    let bestAgent = 'executive';
    let bestScore = 0;

    for (const [agent, score] of scores.entries()) {
      if (score > bestScore) {
        bestAgent = agent;
        bestScore = score;
      }
    }

    const confidence = Math.min(bestScore / 10, 1);

    logger.info(
      { query, selectedAgent: bestAgent, confidence },
      'Request routed to agent',
    );

    return {
      agent: bestAgent,
      confidence,
      reasoning: `Matched keywords indicate ${bestAgent} is appropriate for this request`,
    };
  }
}

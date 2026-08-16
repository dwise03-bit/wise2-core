/**
 * AgentRouter - Route requests to appropriate agents
 */

import { AgentRegistry } from './AgentRegistry.js';

interface RoutingScore {
  agent: string;
  score: number;
  keywords: string[];
}

export class AgentRouter {
  private registry: AgentRegistry;
  private keywordMap: Map<string, string[]> = new Map();

  constructor(registry: AgentRegistry) {
    this.registry = registry;
    this.initializeKeywordMap();
  }

  /**
   * Route a request to the best agent
   */
  route(request: string): string {
    const scores = this.scoreAgents(request);
    
    if (scores.length === 0) {
      return 'executive'; // Default fallback
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    return scores[0].agent;
  }

  /**
   * Get top N agents for a request
   */
  routeTop(request: string, n: number = 3): RoutingScore[] {
    const scores = this.scoreAgents(request);
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, n);
  }

  /**
   * Score all agents against a request
   */
  private scoreAgents(request: string): RoutingScore[] {
    const scores: RoutingScore[] = [];
    const requestLower = request.toLowerCase();

    for (const agent of this.registry.list()) {
      const keywords = this.keywordMap.get(agent.id) || [];
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const keyword of keywords) {
        if (requestLower.includes(keyword)) {
          score += 1;
          matchedKeywords.push(keyword);
        }
      }

      if (score > 0) {
        scores.push({
          agent: agent.id,
          score,
          keywords: matchedKeywords
        });
      }
    }

    return scores;
  }

  /**
   * Initialize keyword map for routing
   */
  private initializeKeywordMap(): void {
    // Agent routing keywords
    this.keywordMap.set('developer', [
      'build', 'code', 'fix', 'debug', 'refactor', 'test', 'write', 'implement'
    ]);

    this.keywordMap.set('infrastructure', [
      'deploy', 'server', 'infrastructure', 'docker', 'kubernetes', 'database', 'scale'
    ]);

    this.keywordMap.set('deployment', [
      'release', 'ci', 'cd', 'pipeline', 'rollout', 'rollback', 'version'
    ]);

    this.keywordMap.set('executive', [
      'decide', 'strategy', 'plan', 'prioritize', 'coordinate', 'orchestrate'
    ]);

    this.keywordMap.set('qa', [
      'test', 'quality', 'verify', 'validate', 'check', 'gate', 'coverage'
    ]);

    this.keywordMap.set('research', [
      'research', 'analyze', 'compare', 'competitive', 'market', 'data', 'fact'
    ]);

    this.keywordMap.set('marketing', [
      'campaign', 'content', 'marketing', 'brand', 'message', 'audience', 'promotion'
    ]);

    this.keywordMap.set('sales', [
      'deal', 'customer', 'pipeline', 'proposal', 'sales', 'negotiate', 'close'
    ]);

    this.keywordMap.set('security', [
      'security', 'compliance', 'vulnerability', 'access', 'permission', 'audit'
    ]);

    this.keywordMap.set('voice', [
      'voice', 'speech', 'language', 'conversation', 'dialog', 'nlp'
    ]);

    this.keywordMap.set('vision', [
      'image', 'visual', 'design', 'screenshot', 'diagram', 'vision'
    ]);

    this.keywordMap.set('documentation', [
      'document', 'guide', 'wiki', 'knowledge', 'reference', 'tutorial'
    ]);

    this.keywordMap.set('automation', [
      'automate', 'workflow', 'trigger', 'schedule', 'job', 'automation'
    ]);

    this.keywordMap.set('discord', [
      'notify', 'message', 'communication', 'announce', 'alert', 'discord'
    ]);

    this.keywordMap.set('raspberry-pi', [
      'edge', 'device', 'iot', 'offline', 'inference', 'local', 'raspberry'
    ]);

    this.keywordMap.set('finance', [
      'budget', 'finance', 'forecast', 'roi', 'cost', 'payment', 'money'
    ]);

    this.keywordMap.set('crm', [
      'customer', 'account', 'relationship', 'crm', 'contact', 'opportunity'
    ]);
  }
}


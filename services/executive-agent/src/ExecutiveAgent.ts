/**
 * Executive Agent - COO of WISE²
 * Strategic decision-making and cross-agent orchestration
 */

import { BaseAgent } from '@wise2/agent-framework';
import { AgentConfig, AgentResponse } from '@wise2/agent-framework';
import { BusinessLogic } from './reasoning/BusinessLogic.js';
import { GoalPlanning } from './reasoning/GoalPlanning.js';
import { AgentSelector } from './routing/AgentSelector.js';
import { ExecutiveMemory } from './memory/ExecutiveMemory.js';

export class ExecutiveAgent extends BaseAgent {
  private businessLogic: BusinessLogic;
  private goalPlanning: GoalPlanning;
  private agentSelector: AgentSelector;
  private executiveMemory: ExecutiveMemory;

  constructor(config: AgentConfig) {
    super(config);
    this.businessLogic = new BusinessLogic();
    this.goalPlanning = new GoalPlanning();
    this.agentSelector = new AgentSelector();
    this.executiveMemory = new ExecutiveMemory();
  }

  /**
   * Initialize executive agent
   */
  override async initialize(): Promise<void> {
    await super.initialize();
    await this.executiveMemory.load();
    console.log('Executive Agent initialized - COO mode active');
  }

  /**
   * Generate response (executive logic)
   */
  protected async generateResponse(message: string): Promise<AgentResponse> {
    try {
      // 1. Load business context
      const context = await this.executiveMemory.getBusinessContext();

      // 2. Analyze request
      const analysis = this.businessLogic.analyze(message, context);

      // 3. Determine if this is a decision, delegation, or coordination task
      if (analysis.isDecision) {
        return this.handleDecision(message, analysis);
      } else if (analysis.isDelegation) {
        return this.handleDelegation(message, analysis);
      } else {
        return this.handleCoordination(message, analysis);
      }
    } catch (error) {
      console.error('Executive Agent error:', error);
      throw error;
    }
  }

  /**
   * Handle decision-making
   */
  private async handleDecision(message: string, analysis: any): Promise<AgentResponse> {
    // Generate decision options
    const options = this.businessLogic.generateOptions(message, 3);

    // Evaluate trade-offs
    const evaluation = this.businessLogic.evaluateOptions(options, analysis.criteria);

    // Make decision
    const decision = this.businessLogic.decide(options, evaluation);

    // Log decision
    await this.executiveMemory.logDecision(decision);

    return {
      content: this.formatDecisionResponse(decision, options, evaluation),
      tokens: undefined
    };
  }

  /**
   * Handle task delegation
   */
  private async handleDelegation(message: string, analysis: any): Promise<AgentResponse> {
    // Break down goals
    const goals = this.goalPlanning.decompose(message);

    // Select agents
    const assignments = await this.agentSelector.selectAgents(goals);

    // Create plan
    const plan = this.goalPlanning.createPlan(goals, assignments);

    return {
      content: this.formatDelegationResponse(plan, assignments),
      tokens: undefined
    };
  }

  /**
   * Handle coordination (multi-agent sync)
   */
  private async handleCoordination(message: string, analysis: any): Promise<AgentResponse> {
    // Get status from all agents
    const status = await this.executiveMemory.getTeamStatus();

    // Identify blockers
    const blockers = this.businessLogic.identifyBlockers(status);

    // Coordinate resolution
    const coordination = this.businessLogic.coordinateResolution(blockers);

    return {
      content: this.formatCoordinationResponse(status, coordination),
      tokens: undefined
    };
  }

  /**
   * Format decision response
   */
  private formatDecisionResponse(decision: any, options: any[], evaluation: any): string {
    return `
EXECUTIVE DECISION
==================

Situation: ${decision.situation}

Options Considered:
${options.map((o, i) => `${i + 1}. ${o.description}`).join('\n')}

Decision: ${decision.choice}

Rationale:
${decision.rationale}

Next Steps:
${decision.nextSteps?.map((s: string) => `- ${s}`).join('\n')}
    `.trim();
  }

  /**
   * Format delegation response
   */
  private formatDelegationResponse(plan: any, assignments: any[]): string {
    return `
WORK DELEGATION PLAN
====================

Goals: ${plan.goals.map((g: string) => `✓ ${g}`).join(', ')}

Agent Assignments:
${assignments.map(a => `- ${a.agent}: ${a.task}`).join('\n')}

Timeline: ${plan.timeline}

Checkpoints:
${plan.checkpoints?.map((c: string) => `- ${c}`).join('\n')}
    `.trim();
  }

  /**
   * Format coordination response
   */
  private formatCoordinationResponse(status: any, coordination: any): string {
    return `
TEAM COORDINATION STATUS
========================

Active Projects: ${status.activeProjects}

Team Status:
${Object.entries(status.agents || {}).map(([agent, state]: [string, any]) => 
  `- ${agent}: ${state}`
).join('\n')}

Blockers & Resolution:
${Object.entries(coordination.blockerResolution || {}).map(([blocker, resolution]: [string, any]) => 
  `- ${blocker}: ${resolution}`
).join('\n')}
    `.trim();
  }
}


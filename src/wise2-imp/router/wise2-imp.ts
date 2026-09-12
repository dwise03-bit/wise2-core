/**
 * WISE² IMP - Intent Management Platform
 *
 * Core routing engine that orchestrates intent classification,
 * policy enforcement, and multi-executor dispatch.
 *
 * This is the brain that turns iMessage requests into coordinated
 * actions across Mac Hermes, VPS Hermes, GPU nodes, and Claude Code.
 */

import {
  Intent,
  RiskLevel,
  ExecutionNode,
  Job,
  JobStatus,
  ImpRequest,
  ImpResponse,
  RoutingDecision,
  AuthorizedSender,
  NodeCapability,
} from '../types';

import {
  classifyIntent,
  getPrimaryIntent,
  intentMatches,
} from './intent-classifier';

import {
  classifyRiskLevel,
  verifySender,
  determineExecutionPath,
  generateConfirmationToken,
  verifyConfirmationToken,
  consumeConfirmationToken,
  validateNodeForIntent,
  loadAuthorizedSenders,
} from '../policy/risk-policy';

// ─────────────────────────────────────────────────────────────────────
// WISE² IMP STATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

class WISE2IMP {
  private jobs: Map<string, Job> = new Map();
  private nodeCapabilities: Map<ExecutionNode, NodeCapability> = new Map();
  private authorizedSenders: Map<string, AuthorizedSender> = new Map();
  private requestCounter = 0;

  constructor() {
    this.initializeDefaultNodes();
  }

  /**
   * Initialize known WISE² nodes
   */
  private initializeDefaultNodes(): void {
    this.nodeCapabilities.set(ExecutionNode.MAC_HERMES, {
      node: ExecutionNode.MAC_HERMES,
      capabilities: ['hermes', 'claude-code', 'codex', 'local-ollama', 'imessage'],
      available: true,
      last_heartbeat: new Date().toISOString(),
      role: 'interactive-primary',
    });

    this.nodeCapabilities.set(ExecutionNode.VPS_HERMES, {
      node: ExecutionNode.VPS_HERMES,
      capabilities: ['hermes', 'postgres', 'redis', 'workers', 'api', 'automation'],
      available: true,
      last_heartbeat: new Date().toISOString(),
      role: 'always-on-remote',
    });

    this.nodeCapabilities.set(ExecutionNode.GPU_NODE, {
      node: ExecutionNode.GPU_NODE,
      capabilities: ['ollama', 'heavy-inference', 'embedding'],
      available: true,
      last_heartbeat: new Date().toISOString(),
      role: 'heavy-inference',
    });

    this.nodeCapabilities.set(ExecutionNode.EDGE_NODE, {
      node: ExecutionNode.EDGE_NODE,
      capabilities: ['local-control', 'automation', 'sensors'],
      available: true,
      last_heartbeat: new Date().toISOString(),
      role: 'edge-device',
    });
  }

  /**
   * Initialize authorized senders (typically from .env or secure config)
   */
  public setAuthorizedSenders(senders: AuthorizedSender[]): void {
    this.authorizedSenders.clear();
    loadAuthorizedSenders(senders);
    for (const sender of senders) {
      this.authorizedSenders.set(sender.e164_number, sender);
    }
  }

  /**
   * Process an incoming request (from iMessage, Discord, etc.)
   */
  public async processRequest(request: ImpRequest): Promise<ImpResponse> {
    const jobId = this.generateJobId();

    // Step 1: Verify sender is authorized
    const sender = verifySender(request.sender_e164);
    if (!sender) {
      return {
        job_id: jobId,
        text: 'WISE² - Unauthorized sender. Contact the system owner to authorize your number.',
        status: 'executed',
      };
    }

    // Step 2: Classify intent
    const intents = classifyIntent(request.text);
    const primaryIntent = intents.length > 0 ? intents[0] : Intent.CHAT;

    // Step 3: Classify risk level
    const riskLevel = classifyRiskLevel(primaryIntent, ExecutionNode.AUTO);

    // Step 4: Determine execution path
    const execPath = determineExecutionPath(sender, primaryIntent, riskLevel);
    if (!execPath.canExecuteImmediately && !execPath.requiresConfirmation) {
      return {
        job_id: jobId,
        text: `WISE² - Insufficient permissions for this operation. Contact an administrator.`,
        status: 'executed',
      };
    }

    // Step 5: Route to appropriate executor
    const routing = this.determineRouting(primaryIntent, ExecutionNode.AUTO);

    // Step 6: Create job record
    const job: Job = {
      id: jobId,
      source: request.source,
      sender: sender.id,
      sender_role: sender.role,
      intent: primaryIntent,
      executor_node: routing.executor_node,
      executor_type: routing.executor_type,
      risk_level: riskLevel,
      status: execPath.requiresConfirmation
        ? JobStatus.PENDING_CONFIRMATION
        : JobStatus.QUEUED,
      title: this.generateJobTitle(primaryIntent),
      description: request.text,
      payload: { original_request: request.text },
      context: { intents, routing },
      created_at: new Date().toISOString(),
      audit_log: [
        {
          timestamp: new Date().toISOString(),
          action: 'created',
          user: sender.id,
        },
      ],
    };

    // Step 7: Generate confirmation if needed
    if (execPath.requiresConfirmation) {
      const token = generateConfirmationToken(jobId);
      job.confirmation_token = token;
      job.confirmation_expires_at = new Date(
        Date.now() + 5 * 60 * 1000
      ).toISOString();

      this.jobs.set(jobId, job);

      return {
        job_id: jobId,
        text: `${job.title}\n\n⚠️ ${execPath.confirmationText}\n\nCode: ${token}`,
        status: 'pending_confirmation',
        confirmation_code: token,
      };
    }

    // Step 8: Store job and execute
    this.jobs.set(jobId, job);
    job.status = JobStatus.RUNNING;
    job.started_at = new Date().toISOString();

    // Note: Actual execution happens in executor service
    return {
      job_id: jobId,
      text: `✅ ${job.title}\nJob queued for execution.`,
      status: 'queued',
    };
  }

  /**
   * Confirm and execute a pending job
   */
  public async confirmAndExecute(
    token: string,
    senderE164: string
  ): Promise<ImpResponse> {
    // Verify sender
    const sender = verifySender(senderE164);
    if (!sender) {
      return {
        job_id: 'unknown',
        text: 'WISE² - Unauthorized sender.',
        status: 'executed',
      };
    }

    // Verify confirmation token
    const jobId = consumeConfirmationToken(token);
    if (!jobId) {
      return {
        job_id: 'unknown',
        text: 'WISE² - Invalid or expired confirmation code.',
        status: 'executed',
      };
    }

    // Get job
    const job = this.jobs.get(jobId);
    if (!job) {
      return {
        job_id: jobId,
        text: 'WISE² - Job not found.',
        status: 'executed',
      };
    }

    // Confirm and queue for execution
    job.status = JobStatus.CONFIRMED;
    job.started_at = new Date().toISOString();
    job.audit_log.push({
      timestamp: new Date().toISOString(),
      action: 'confirmed',
      user: sender.id,
    });

    return {
      job_id: jobId,
      text: `✅ Confirmed. Executing ${job.title}...`,
      status: 'queued',
    };
  }

  /**
   * Determine optimal routing for an intent
   */
  private determineRouting(intent: Intent, preferredNode: ExecutionNode): RoutingDecision {
    const targetNode = this.selectExecutionNode(intent, preferredNode);

    // Validate node can execute this intent
    if (!validateNodeForIntent(intent, targetNode)) {
      // Fall back to MAC_HERMES for any intent
      return {
        intent,
        executor_node: ExecutionNode.MAC_HERMES,
        executor_type: 'hermes',
        risk_level: classifyRiskLevel(intent, ExecutionNode.MAC_HERMES),
        requires_confirmation: false,
        policies_applied: ['node_isolation_override'],
      };
    }

    return {
      intent,
      executor_node: targetNode,
      executor_type: this.selectExecutorType(intent, targetNode),
      risk_level: classifyRiskLevel(intent, targetNode),
      requires_confirmation: false,
      policies_applied: ['routing_engine'],
    };
  }

  /**
   * Select best execution node based on intent and availability
   */
  private selectExecutionNode(intent: Intent, preferred: ExecutionNode): ExecutionNode {
    // If preferredNode is AUTO, choose intelligently
    if (preferred === ExecutionNode.AUTO) {
      // Code/dev work on Mac
      if ([Intent.CODE, Intent.BUILD, Intent.TEST, Intent.DEBUG, Intent.REVIEW].includes(intent)) {
        return this.isNodeAvailable(ExecutionNode.MAC_HERMES)
          ? ExecutionNode.MAC_HERMES
          : ExecutionNode.VPS_HERMES;
      }

      // Production/server work on VPS
      if ([Intent.DEPLOY, Intent.INFRASTRUCTURE, Intent.DATABASE, Intent.MONITORING].includes(intent)) {
        return ExecutionNode.VPS_HERMES;
      }

      // Heavy AI on GPU if available
      if (intent === Intent.LOCAL_AI && this.isNodeAvailable(ExecutionNode.GPU_NODE)) {
        return ExecutionNode.GPU_NODE;
      }

      // Default to Mac Hermes (interactive/primary)
      return this.isNodeAvailable(ExecutionNode.MAC_HERMES)
        ? ExecutionNode.MAC_HERMES
        : ExecutionNode.VPS_HERMES;
    }

    // Use preferred node if available
    return this.isNodeAvailable(preferred) ? preferred : ExecutionNode.MAC_HERMES;
  }

  /**
   * Select appropriate executor service for a node
   */
  private selectExecutorType(intent: Intent, node: ExecutionNode): string {
    // Code work uses Claude/Codex
    if (intent === Intent.CODE || intent === Intent.REVIEW) {
      return 'claude-code';
    }

    if (intent === Intent.DEBUG) {
      return 'codex';
    }

    // Local AI
    if (intent === Intent.LOCAL_AI && node === ExecutionNode.GPU_NODE) {
      return 'ollama';
    }

    // Default to Hermes
    return 'hermes';
  }

  /**
   * Check if a node is available
   */
  private isNodeAvailable(node: ExecutionNode): boolean {
    const cap = this.nodeCapabilities.get(node);
    return cap?.available ?? false;
  }

  /**
   * Generate a human-readable job title
   */
  private generateJobTitle(intent: Intent): string {
    const titles: Record<Intent, string> = {
      [Intent.CHAT]: '💬 Chat',
      [Intent.STATUS]: '📊 System Status',
      [Intent.HEALTH]: '🏥 Health Check',
      [Intent.SEARCH]: '🔍 Search',
      [Intent.MEMORY]: '🧠 Memory',
      [Intent.REPORT]: '📈 Report',
      [Intent.CUSTOMER]: '👥 Customer Query',
      [Intent.LEAD]: '📞 Lead',
      [Intent.CRM]: '📋 CRM',
      [Intent.DEMO]: '🎬 Demo',
      [Intent.CONTENT]: '📝 Content',
      [Intent.CODE]: '💻 Code',
      [Intent.REVIEW]: '👀 Review',
      [Intent.DEBUG]: '🐛 Debug',
      [Intent.BUILD]: '🏗️ Build',
      [Intent.TEST]: '✅ Test',
      [Intent.LOCAL_AI]: '🤖 Local AI',
      [Intent.REMOTE_AI]: '☁️ Remote AI',
      [Intent.REASONING]: '💭 Reasoning',
      [Intent.DEVOPS]: '⚙️ DevOps',
      [Intent.DEPLOY]: '🚀 Deploy',
      [Intent.INFRASTRUCTURE]: '🌐 Infrastructure',
      [Intent.DATABASE]: '🗄️ Database',
      [Intent.MONITORING]: '📡 Monitoring',
      [Intent.HVAC]: '❄️ HVAC',
      [Intent.DEFENSE]: '🛡️ Defense',
      [Intent.TRADING]: '📈 Trading',
      [Intent.SOUND_LAB]: '🎵 Sound Lab',
      [Intent.JINGLE_LAB]: '🎼 Jingle Lab',
      [Intent.LIVE_STUDIO]: '📹 Live Studio',
      [Intent.ADMIN]: '👑 Admin',
      [Intent.SECURITY]: '🔐 Security',
      [Intent.HELP]: '❓ Help',
    };

    return titles[intent] || '⚡ Task';
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    const timestamp = Date.now().toString(36);
    const counter = (++this.requestCounter).toString(36).padStart(4, '0');
    return `job_${timestamp}_${counter}`;
  }

  /**
   * Get job status
   */
  public getJob(jobId: string): Job | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * List recent jobs
   */
  public listJobs(limit = 50): Job[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  /**
   * Get node capabilities
   */
  public getNodeCapabilities(node: ExecutionNode): NodeCapability | null {
    return this.nodeCapabilities.get(node) || null;
  }

  /**
   * Update node heartbeat
   */
  public updateNodeHeartbeat(node: ExecutionNode, available: boolean): void {
    const cap = this.nodeCapabilities.get(node);
    if (cap) {
      cap.available = available;
      cap.last_heartbeat = new Date().toISOString();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────
// SINGLETON INSTANCE
// ─────────────────────────────────────────────────────────────────────

let instance: WISE2IMP | null = null;

/**
 * Get the WISE² IMP singleton
 */
export function getWISE2IMP(): WISE2IMP {
  if (!instance) {
    instance = new WISE2IMP();
  }
  return instance;
}

/**
 * Initialize WISE² IMP (call once at startup)
 */
export function initializeWISE2IMP(senders: AuthorizedSender[]): WISE2IMP {
  const imp = getWISE2IMP();
  imp.setAuthorizedSenders(senders);
  return imp;
}

export { WISE2IMP };

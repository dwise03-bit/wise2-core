/**
 * Risk Policy Engine - Determines authorization and execution rules
 *
 * Applies WISE² policy to every request:
 * - Authenticates sender
 * - Classifies risk
 * - Determines confirmation requirements
 * - Applies role-based access control
 */

import {
  Intent,
  RiskLevel,
  AuthorizedSender,
  RoutingDecision,
  ExecutionNode,
  Job,
} from '../types';

// ─────────────────────────────────────────────────────────────────────
// RISK CLASSIFICATION RULES
// ─────────────────────────────────────────────────────────────────────

// LEVEL 0: Read-only operations (safe to execute immediately)
const LEVEL_0_INTENTS = new Set([
  Intent.CHAT,
  Intent.STATUS,
  Intent.HEALTH,
  Intent.SEARCH,
  Intent.MEMORY,
  Intent.REPORT,
  Intent.CUSTOMER,
  Intent.LEAD,
  Intent.HELP,
]);

// LEVEL 1: Reversible operations (safe to auto-execute)
const LEVEL_1_INTENTS = new Set([
  Intent.BUILD,
  Intent.TEST,
  Intent.DEMO,
]);

// LEVEL 2: Mutating operations (require confirmation)
const LEVEL_2_INTENTS = new Set([
  Intent.DEPLOY, // Only staging
  Intent.DATABASE, // Only reads/non-destructive
  Intent.CODE,
  Intent.REVIEW,
  Intent.DEBUG,
  Intent.CRM,
  Intent.CONTENT,
]);

// LEVEL 3: Destructive operations (explicit confirmation + token)
const LEVEL_3_INTENTS = new Set([
  Intent.ADMIN,
  Intent.SECURITY,
  Intent.INFRASTRUCTURE, // Major changes
]);

/**
 * Determine risk level for an intent
 */
export function classifyRiskLevel(
  intent: Intent,
  node: ExecutionNode,
  isDestructive = false
): RiskLevel {
  if (isDestructive || LEVEL_3_INTENTS.has(intent)) {
    return RiskLevel.LEVEL_3;
  }
  if (LEVEL_2_INTENTS.has(intent)) {
    return RiskLevel.LEVEL_2;
  }
  if (LEVEL_1_INTENTS.has(intent)) {
    return RiskLevel.LEVEL_1;
  }
  return RiskLevel.LEVEL_0;
}

/**
 * Role-based access control matrix
 */
export interface RolePermission {
  viewer: boolean;
  operator: boolean;
  owner: boolean;
}

const ROLE_MATRIX: Record<RiskLevel, RolePermission> = {
  [RiskLevel.LEVEL_0]: { viewer: true, operator: true, owner: true },
  [RiskLevel.LEVEL_1]: { viewer: false, operator: true, owner: true },
  [RiskLevel.LEVEL_2]: { viewer: false, operator: true, owner: true },
  [RiskLevel.LEVEL_3]: { viewer: false, operator: false, owner: true }, // Owner only
};

/**
 * Check if a role can execute at a given risk level
 */
export function canExecuteAtRisk(
  role: 'owner' | 'operator' | 'viewer',
  riskLevel: RiskLevel
): boolean {
  const permissions = ROLE_MATRIX[riskLevel];
  return permissions[role] === true;
}

// ─────────────────────────────────────────────────────────────────────
// SENDER AUTHORIZATION
// ─────────────────────────────────────────────────────────────────────

let authorizedSenders: Map<string, AuthorizedSender> = new Map();

/**
 * Initialize authorized senders from environment or file
 */
export function loadAuthorizedSenders(senders: AuthorizedSender[]): void {
  authorizedSenders.clear();
  for (const sender of senders) {
    authorizedSenders.set(sender.e164_number, sender);
  }
}

/**
 * Verify if a sender is authorized
 */
export function verifySender(e164: string): AuthorizedSender | null {
  return authorizedSenders.get(e164) || null;
}

/**
 * Add a new authorized sender (admin operation)
 */
export function addAuthorizedSender(sender: AuthorizedSender): void {
  authorizedSenders.set(sender.e164_number, sender);
}

/**
 * List all authorized senders (redacted)
 */
export function listAuthorizedSenders(): Array<{ id: string; role: string; added: string }> {
  return Array.from(authorizedSenders.values()).map((s) => ({
    id: s.id,
    role: s.role,
    added: s.created_at,
  }));
}

// ─────────────────────────────────────────────────────────────────────
// CONFIRMATION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────

interface PendingConfirmation {
  job_id: string;
  token: string;
  created_at: number;
  expires_at: number;
}

const pendingConfirmations = new Map<string, PendingConfirmation>();
const CONFIRMATION_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a confirmation token for a job
 */
export function generateConfirmationToken(jobId: string): string {
  const token = Math.random().toString(36).substring(2, 15);
  const now = Date.now();

  pendingConfirmations.set(token, {
    job_id: jobId,
    token,
    created_at: now,
    expires_at: now + CONFIRMATION_TTL_MS,
  });

  return token;
}

/**
 * Verify a confirmation token
 */
export function verifyConfirmationToken(token: string): string | null {
  const conf = pendingConfirmations.get(token);
  if (!conf) return null;

  if (Date.now() > conf.expires_at) {
    pendingConfirmations.delete(token);
    return null;
  }

  return conf.job_id;
}

/**
 * Consume a confirmation token (one-time use)
 */
export function consumeConfirmationToken(token: string): string | null {
  const jobId = verifyConfirmationToken(token);
  if (jobId) {
    pendingConfirmations.delete(token);
  }
  return jobId;
}

// ─────────────────────────────────────────────────────────────────────
// EXECUTION POLICY
// ─────────────────────────────────────────────────────────────────────

/**
 * Determine if a request can execute immediately or requires confirmation
 */
export function determineExecutionPath(
  sender: AuthorizedSender,
  intent: Intent,
  riskLevel: RiskLevel
): {
  canExecuteImmediately: boolean;
  requiresConfirmation: boolean;
  confirmationText?: string;
} {
  // Check role-based access
  if (!canExecuteAtRisk(sender.role, riskLevel)) {
    return {
      canExecuteImmediately: false,
      requiresConfirmation: false, // Blocked entirely
    };
  }

  // LEVEL 0: Execute immediately
  if (riskLevel === RiskLevel.LEVEL_0) {
    return {
      canExecuteImmediately: true,
      requiresConfirmation: false,
    };
  }

  // LEVEL 1: Can auto-execute for operators/owners
  if (riskLevel === RiskLevel.LEVEL_1) {
    return {
      canExecuteImmediately: sender.role === 'operator' || sender.role === 'owner',
      requiresConfirmation: false,
    };
  }

  // LEVEL 2 & 3: Always require confirmation
  return {
    canExecuteImmediately: false,
    requiresConfirmation: true,
    confirmationText: getConfirmationPrompt(intent, riskLevel),
  };
}

/**
 * Generate a confirmation prompt for the user
 */
function getConfirmationPrompt(intent: Intent, risk: RiskLevel): string {
  const riskText = risk === RiskLevel.LEVEL_3 ? 'destructive' : 'significant';
  const confirmWord = risk === RiskLevel.LEVEL_3 ? 'CONFIRM' : 'confirm';

  return `This is a ${riskText} operation. Reply "${confirmWord} <token>" to proceed.`;
}

// ─────────────────────────────────────────────────────────────────────
// NODE ISOLATION
// ─────────────────────────────────────────────────────────────────────

/**
 * Enforce node-based isolation rules
 *
 * Certain intents must only run on specific nodes for security.
 */
const INTENT_NODE_CONSTRAINTS: Record<Intent, ExecutionNode[]> = {
  [Intent.CHAT]: [ExecutionNode.AUTO],
  [Intent.STATUS]: [ExecutionNode.AUTO],
  [Intent.HEALTH]: [ExecutionNode.VPS_HERMES, ExecutionNode.MAC_HERMES],
  [Intent.DEPLOY]: [ExecutionNode.VPS_HERMES], // Production deploys on VPS only
  [Intent.ADMIN]: [ExecutionNode.MAC_HERMES], // Admin ops on primary node
  [Intent.SECURITY]: [ExecutionNode.VPS_HERMES], // Security on always-on node
  [Intent.DATABASE]: [ExecutionNode.VPS_HERMES], // DB access on VPS
  [Intent.INFRASTRUCTURE]: [ExecutionNode.VPS_HERMES],
  [Intent.CODE]: [ExecutionNode.MAC_HERMES], // Dev on Mac
  [Intent.LOCAL_AI]: [ExecutionNode.MAC_HERMES, ExecutionNode.GPU_NODE],
  [Intent.REMOTE_AI]: [ExecutionNode.MAC_HERMES],
  [Intent.DEMO]: [ExecutionNode.AUTO],
  [Intent.HVAC]: [ExecutionNode.AUTO],
  [Intent.DEFENSE]: [ExecutionNode.AUTO],
  [Intent.TRADING]: [ExecutionNode.AUTO],
  [Intent.SOUND_LAB]: [ExecutionNode.AUTO],
  [Intent.JINGLE_LAB]: [ExecutionNode.AUTO],
  [Intent.LIVE_STUDIO]: [ExecutionNode.AUTO],
  [Intent.CUSTOMER]: [ExecutionNode.VPS_HERMES],
  [Intent.LEAD]: [ExecutionNode.VPS_HERMES],
  [Intent.CRM]: [ExecutionNode.VPS_HERMES],
  [Intent.SEARCH]: [ExecutionNode.AUTO],
  [Intent.MEMORY]: [ExecutionNode.AUTO],
  [Intent.REPORT]: [ExecutionNode.AUTO],
  [Intent.DEVOPS]: [ExecutionNode.VPS_HERMES],
  [Intent.MONITORING]: [ExecutionNode.VPS_HERMES],
  [Intent.REVIEW]: [ExecutionNode.MAC_HERMES],
  [Intent.DEBUG]: [ExecutionNode.MAC_HERMES],
  [Intent.BUILD]: [ExecutionNode.MAC_HERMES],
  [Intent.TEST]: [ExecutionNode.MAC_HERMES],
  [Intent.REASONING]: [ExecutionNode.AUTO],
  [Intent.CONTENT]: [ExecutionNode.AUTO],
  [Intent.HELP]: [ExecutionNode.AUTO],
};

/**
 * Validate that a node can execute an intent
 */
export function validateNodeForIntent(intent: Intent, node: ExecutionNode): boolean {
  const allowed = INTENT_NODE_CONSTRAINTS[intent] || [ExecutionNode.AUTO];
  return allowed.includes(node) || allowed.includes(ExecutionNode.AUTO);
}

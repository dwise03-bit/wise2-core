/**
 * WISE² Workspace Types
 * Multi-tenant workspace data structures
 */

export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer' | 'guest';
export type WorkspaceStatus = 'active' | 'archived' | 'deleted';
export type WorkspaceType = 'business' | 'demo' | 'template';

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  description?: string;
  ownerId: number;
  status: WorkspaceStatus;
  workspaceType: WorkspaceType;
  config: Record<string, any>;
  theme: {
    mode: 'dark' | 'light';
    palette: string;
  };
  features: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface WorkspaceMember {
  id: number;
  workspaceId: number;
  userId: number;
  role: WorkspaceRole;
  permissions: string[];
  joinedAt: Date;
  lastAccessedAt?: Date;
}

export interface WorkspaceModule {
  id: number;
  workspaceId: number;
  moduleName: string;
  enabled: boolean;
  config?: Record<string, any>;
  installedAt: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  action: string;
  conditions?: Record<string, any>;
  dataTransform?: Record<string, any>;
  autoApprove?: boolean;
  nextStep?: string;
  errorHandler?: string;
}

export interface WorkflowDefinition {
  id: number;
  workspaceId: number;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  templateId?: string;
  triggerType?: string;
  enabled: boolean;
  automationEnabled: boolean;
  approvalRequired: boolean;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecution {
  id: number;
  workspaceId: number;
  workflowDefinitionId: number;
  triggerData: Record<string, any>;
  currentStep: number;
  status: 'active' | 'completed' | 'failed' | 'paused';
  results: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
}

export interface WorkspaceIssue {
  id: number;
  workspaceId: number;
  category: 'infrastructure' | 'business' | 'automation' | 'security' | 'ux';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  impactDescription?: string;
  impactMetric?: number;
  recommendedAction: string;
  autoFixAvailable: boolean;
  fixAutomationId?: number;
  status: 'open' | 'acknowledged' | 'fixing' | 'fixed' | 'dismissed';
  detectedAt: Date;
  resolvedAt?: Date;
}

export interface AIAgentStatus {
  id: number;
  workspaceId: number;
  agentName: string;
  agentType: 'orchestrator' | 'creative' | 'finance' | 'inventory' | 'support' | 'infrastructure';
  status: 'ready' | 'working' | 'error' | 'offline';
  currentTask?: string;
  taskProgress: number;
  queueSize: number;
  successRate: number;
  uptimePercentage: number;
  lastActivity: Date;
  lastError?: string;
}

export interface WorkspaceContext {
  workspace: Workspace | null;
  member: WorkspaceMember | null;
  role: WorkspaceRole | null;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canManageModules: boolean;
  isOwner: boolean;
}

export interface WorkspaceConfig {
  modules: {
    crm: boolean;
    projects: boolean;
    automation: boolean;
    analytics: boolean;
    documents: boolean;
    communications: boolean;
    invoices: boolean;
    knowledge: boolean;
  };
  theme: {
    primaryColor: string;
    accentColor: string;
    mode: 'dark' | 'light';
  };
  automation: {
    autoApprovalEnabled: boolean;
    retryPolicy: {
      maxRetries: number;
      backoffMs: number;
      exponential: boolean;
    };
  };
}

export interface WorkspaceAnalytics {
  revenue: number;
  activeWorkflows: number;
  pendingApprovals: number;
  aiTasksCompleted: number;
  automationsRun: number;
  uptime: number;
}

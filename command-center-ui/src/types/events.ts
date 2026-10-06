/**
 * WISE² Command Graph event schema.
 *
 * Events are the single source of truth for everything the graph animates.
 * Backend services (Hermes, agents, tools) publish these; the frontend
 * consumes them via an EventSource adapter.
 *
 * Never put raw credentials or secrets in `metadata`.
 */

export type NodeKind = 'hermes' | 'agent' | 'tool' | 'approval' | 'device' | 'project';

export type NodeStatus =
  | 'ONLINE'
  | 'IDLE'
  | 'THINKING'
  | 'EXECUTING'
  | 'WAITING'
  | 'APPROVAL'
  | 'PAUSED'
  | 'WARNING'
  | 'FAILED'
  | 'OFFLINE';

export type PacketKind =
  | 'TASK'
  | 'MESSAGE'
  | 'TOOL_CALL'
  | 'RESULT'
  | 'MEMORY'
  | 'APPROVAL'
  | 'EVENT'
  | 'DEPLOYMENT'
  | 'SECURITY_ALERT';

export interface AgentEvent {
  event_id: string;
  timestamp: number;
  event_type:
    | 'node.status'
    | 'edge.activate'
    | 'edge.deactivate'
    | 'packet.send'
    | 'execution.start'
    | 'execution.step'
    | 'execution.complete'
    | 'execution.fail'
    | 'approval.request'
    | 'approval.resolve';
  source_node?: string;
  target_node?: string;
  packet_kind?: PacketKind;
  task_id?: string;
  execution_id?: string;
  workflow_id?: string;
  project_id?: string;
  tenant_id?: string;
  status?: NodeStatus;
  message?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  status: NodeStatus;
  role?: string;
  model?: string;
  current_task?: string;
  project?: string;
  tools?: string[];
  parent?: string;
  children?: string[];
  tokens?: number;
  cost?: number;
  uptime_s?: number;
  recent_events?: AgentEvent[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  kind: 'communication' | 'tool' | 'approval' | 'spawn' | 'result';
  active: boolean;
  label?: string;
  last_activity?: number;
  message_count?: number;
}

export interface ExecutionStep {
  node_id: string;
  task_id: string;
  started_at: number;
  completed_at?: number;
  outcome?: 'success' | 'failure' | 'pending';
}

export interface Execution {
  id: string;
  started_at: number;
  completed_at?: number;
  steps: ExecutionStep[];
  status: 'running' | 'success' | 'failure' | 'awaiting_approval';
  command?: string;
}

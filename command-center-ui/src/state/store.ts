import { create } from 'zustand';
import type {
  AgentEvent,
  Execution,
  ExecutionStep,
  GraphEdge,
  GraphNode,
  NodeStatus,
} from '../types/events';

/**
 * Initial topology for the first-slice vertical.
 * Hermes + five registered agents + two auxiliary nodes
 * (tool node for the GitHub call, approval, deploy).
 */
const initialNodes: GraphNode[] = [
  { id: 'hermes', label: 'Hermes', kind: 'hermes', status: 'ONLINE', role: 'Router', model: 'wise2-core' },
  { id: 'planner', label: 'Planner', kind: 'agent', status: 'IDLE', role: 'Planning', model: 'claude-opus-4-7' },
  { id: 'claude', label: 'Claude Agent', kind: 'agent', status: 'IDLE', role: 'Dev', model: 'claude-opus-4-7' },
  { id: 'qa', label: 'QA', kind: 'agent', status: 'IDLE', role: 'Quality', model: 'claude-sonnet-5-5' },
  { id: 'deploy', label: 'Deploy', kind: 'agent', status: 'IDLE', role: 'Infra', model: 'wise2-core' },
  { id: 'github', label: 'GitHub', kind: 'tool', status: 'IDLE', role: 'Repo' },
  { id: 'approval', label: 'Approval', kind: 'approval', status: 'IDLE', role: 'Daniel' },
];

const initialEdges: GraphEdge[] = [
  { id: 'hermes-planner', source: 'hermes', target: 'planner', kind: 'communication', active: false },
  { id: 'planner-claude', source: 'planner', target: 'claude', kind: 'communication', active: false },
  { id: 'claude-github', source: 'claude', target: 'github', kind: 'tool', active: false },
  { id: 'github-claude', source: 'github', target: 'claude', kind: 'result', active: false },
  { id: 'claude-qa', source: 'claude', target: 'qa', kind: 'communication', active: false },
  { id: 'qa-approval', source: 'qa', target: 'approval', kind: 'approval', active: false },
  { id: 'approval-deploy', source: 'approval', target: 'deploy', kind: 'approval', active: false },
];

export interface Packet {
  id: string;
  edgeId: string;
  kind: AgentEvent['packet_kind'];
  startedAt: number;
  durationMs: number;
}

export type ReplayMode = 'live' | 'replay';

interface State {
  nodes: GraphNode[];
  edges: GraphEdge[];
  packets: Packet[];
  history: AgentEvent[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  followExecution: string | null;
  mode: ReplayMode;
  replayCursor: number;
  replaySpeed: number;
  replayPlaying: boolean;
  currentExecution: Execution | null;

  ingest(event: AgentEvent): void;
  selectNode(id: string | null): void;
  selectEdge(id: string | null): void;
  setFollow(executionId: string | null): void;
  pausePacket(id: string): void;
  setMode(mode: ReplayMode): void;
  setReplayCursor(index: number): void;
  setReplaySpeed(speed: number): void;
  setReplayPlaying(playing: boolean): void;
  resetReplay(): void;
}

const edgeKey = (source: string, target: string) => `${source}-${target}`;

const applyEvent = (state: State, event: AgentEvent): Partial<State> => {
  const patch: Partial<State> = {};
  const nextHistory = [...state.history, event].slice(-500);
  patch.history = nextHistory;

  // Node status mutations
  if (event.event_type === 'node.status' && event.source_node && event.status) {
    patch.nodes = state.nodes.map((n) =>
      n.id === event.source_node ? { ...n, status: event.status as NodeStatus } : n,
    );
  }

  // Packet events + edge activation
  if (event.event_type === 'packet.send' && event.source_node && event.target_node) {
    const id = edgeKey(event.source_node, event.target_node);
    const packet: Packet = {
      id: `${event.event_id}`,
      edgeId: id,
      kind: event.packet_kind ?? 'MESSAGE',
      startedAt: performance.now(),
      durationMs: 900,
    };
    patch.packets = [...state.packets, packet];
    patch.edges = state.edges.map((e) =>
      e.id === id
        ? {
            ...e,
            active: true,
            last_activity: event.timestamp,
            message_count: (e.message_count ?? 0) + 1,
          }
        : e,
    );
  }

  // Approval request
  if (event.event_type === 'approval.request' && event.source_node && event.target_node) {
    const id = edgeKey(event.source_node, event.target_node);
    patch.edges = state.edges.map((e) =>
      e.id === id ? { ...e, active: true, last_activity: event.timestamp } : e,
    );
    patch.nodes = state.nodes.map((n) =>
      n.id === event.target_node ? { ...n, status: 'APPROVAL' as NodeStatus } : n,
    );
  }

  // Approval resolve -> edge from approval to downstream
  if (event.event_type === 'approval.resolve' && event.source_node && event.target_node) {
    const id = edgeKey(event.source_node, event.target_node);
    const packet: Packet = {
      id: `${event.event_id}`,
      edgeId: id,
      kind: 'APPROVAL',
      startedAt: performance.now(),
      durationMs: 900,
    };
    patch.packets = [...state.packets, packet];
    patch.edges = state.edges.map((e) =>
      e.id === id ? { ...e, active: true, last_activity: event.timestamp } : e,
    );
    patch.nodes = state.nodes.map((n) =>
      n.id === event.source_node ? { ...n, status: 'ONLINE' as NodeStatus } : n,
    );
  }

  // Execution start / step / complete tracking
  if (event.event_type === 'execution.start' && event.execution_id) {
    const execution: Execution = {
      id: event.execution_id,
      started_at: event.timestamp,
      steps: event.source_node
        ? [
            {
              node_id: event.source_node,
              task_id: event.task_id ?? event.execution_id,
              started_at: event.timestamp,
              outcome: 'pending',
            },
          ]
        : [],
      status: 'running',
      command: event.message,
    };
    patch.currentExecution = execution;
    patch.followExecution = event.execution_id;
  }

  if (event.event_type === 'packet.send' && state.currentExecution && event.target_node) {
    const step: ExecutionStep = {
      node_id: event.target_node,
      task_id: event.task_id ?? state.currentExecution.id,
      started_at: event.timestamp,
      outcome: 'pending',
    };
    patch.currentExecution = {
      ...state.currentExecution,
      steps: [...state.currentExecution.steps, step],
    };
  }

  if (event.event_type === 'execution.complete' && state.currentExecution) {
    patch.currentExecution = {
      ...state.currentExecution,
      completed_at: event.timestamp,
      status: 'success',
    };
    // Return every agent/tool to idle except Hermes
    patch.nodes = state.nodes.map((n) =>
      n.id === 'hermes'
        ? n
        : { ...n, status: n.kind === 'approval' ? 'IDLE' : 'IDLE' },
    );
    patch.edges = state.edges.map((e) => ({ ...e, active: false }));
  }

  return patch;
};

export const useGraphStore = create<State>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  packets: [],
  history: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  followExecution: null,
  mode: 'live',
  replayCursor: 0,
  replaySpeed: 1,
  replayPlaying: false,
  currentExecution: null,

  ingest(event) {
    if (get().mode === 'replay') return;
    set((state) => applyEvent(state as State, event));
    // Clean up finished packets opportunistically
    const now = performance.now();
    const current = get().packets;
    const alive = current.filter((p) => now - p.startedAt < p.durationMs + 400);
    if (alive.length !== current.length) set({ packets: alive });
  },

  selectNode(id) {
    set({ selectedNodeId: id, selectedEdgeId: null });
  },
  selectEdge(id) {
    set({ selectedEdgeId: id, selectedNodeId: null });
  },
  setFollow(executionId) {
    set({ followExecution: executionId });
  },
  pausePacket(id) {
    set({ packets: get().packets.filter((p) => p.id !== id) });
  },
  setMode(mode) {
    set({ mode, replayPlaying: false, replayCursor: 0 });
    if (mode === 'live') {
      set({
        nodes: initialNodes,
        edges: initialEdges,
        packets: [],
      });
    }
  },
  setReplayCursor(index) {
    set({ replayCursor: index });
  },
  setReplaySpeed(speed) {
    set({ replaySpeed: speed });
  },
  setReplayPlaying(playing) {
    set({ replayPlaying: playing });
  },
  resetReplay() {
    set({
      nodes: initialNodes,
      edges: initialEdges,
      packets: [],
      replayCursor: 0,
    });
  },
}));

import { useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '../state/store';
import { HermesNode } from './nodes/HermesNode';
import { AgentNode } from './nodes/AgentNode';
import { AnimatedEdge } from './edges/AnimatedEdge';
import type { GraphNode as WGraphNode } from '../types/events';
import './graph.css';

const nodeTypes = { hermes: HermesNode, agent: AgentNode, tool: AgentNode, approval: AgentNode };
const edgeTypes = { animated: AnimatedEdge };

const layout: Record<string, { x: number; y: number }> = {
  hermes: { x: 0, y: 0 },
  planner: { x: 280, y: -160 },
  claude: { x: 560, y: -160 },
  github: { x: 840, y: -240 },
  qa: { x: 560, y: 80 },
  approval: { x: 280, y: 180 },
  deploy: { x: 0, y: 240 },
};

function FollowCamera() {
  const rf = useReactFlow();
  const follow = useGraphStore((s) => s.followExecution);
  const execution = useGraphStore((s) => s.currentExecution);
  const nodes = useGraphStore((s) => s.nodes);
  useEffect(() => {
    if (!follow || !execution) return;
    const lastStep = execution.steps[execution.steps.length - 1];
    if (!lastStep) return;
    const match = nodes.find((n) => n.id === lastStep.node_id);
    if (!match) return;
    const pos = layout[match.id] ?? { x: 0, y: 0 };
    rf.setCenter(pos.x + 80, pos.y + 20, { zoom: Math.max(rf.getZoom(), 0.9), duration: 650 });
  }, [follow, execution, nodes, rf]);
  return null;
}

function GraphInner() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectNode = useGraphStore((s) => s.selectNode);
  const selectEdge = useGraphStore((s) => s.selectEdge);

  const rfNodes = useMemo<Node[]>(() => {
    return nodes.map(
      (n) =>
        ({
          id: n.id,
          type: n.kind === 'hermes' ? 'hermes' : n.kind,
          position: layout[n.id] ?? { x: 0, y: 0 },
          data: n as unknown as Record<string, unknown>,
          selected: n.id === selectedNodeId,
          draggable: true,
        }) as Node,
    );
  }, [nodes, selectedNodeId]);

  const rfEdges = useMemo<Edge[]>(() => {
    return edges.map(
      (e) =>
        ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'animated',
          data: e as unknown as Record<string, unknown>,
          animated: false,
        }) as Edge,
    );
  }, [edges]);

  const onNodeClick: NodeMouseHandler = (_evt, node) => selectNode(node.id);
  const onEdgeClick: EdgeMouseHandler = (_evt, edge) => selectEdge(edge.id);
  const onPaneClick = () => selectNode(null);

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onPaneClick={onPaneClick}
      fitView
      minZoom={0.3}
      maxZoom={2.4}
      proOptions={{ hideAttribution: true }}
      panOnScroll
      selectionOnDrag
    >
      <FollowCamera />
      <Background color="#1b2a44" gap={28} size={1} />
      <MiniMap
        pannable
        zoomable
        maskColor="rgba(4,7,13,0.78)"
        nodeColor={(n) => nodeMiniColor(n.data as unknown as WGraphNode)}
        nodeStrokeColor="#0b1423"
        style={{ background: '#070d17', border: '1px solid var(--line)' }}
      />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
}

export function CommandGraph() {
  return (
    <div className="graph-root">
      <ReactFlowProvider>
        <GraphInner />
      </ReactFlowProvider>
    </div>
  );
}

function nodeMiniColor(n: WGraphNode): string {
  switch (n.status) {
    case 'EXECUTING':
    case 'THINKING':
      return '#4ab8ff';
    case 'APPROVAL':
      return '#f4c661';
    case 'FAILED':
      return '#ff7888';
    case 'OFFLINE':
      return '#4a5568';
    default:
      return '#30f591';
  }
}

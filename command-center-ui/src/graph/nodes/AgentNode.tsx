import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { GraphNode } from '../../types/events';
import './nodes.css';

type WiseNode = Node<Record<string, unknown>, 'agent' | 'tool' | 'approval'>;
type Props = NodeProps<WiseNode>;

const kindGlyph: Record<GraphNode['kind'], string> = {
  hermes: 'H',
  agent: 'A',
  tool: 'T',
  approval: '?',
  device: 'D',
  project: 'P',
};

export function AgentNode({ data, selected }: Props) {
  const node = data as unknown as GraphNode;
  const stateClass = `status-${node.status.toLowerCase()}`;
  return (
    <div
      className={`agent-node kind-${node.kind} ${stateClass}${selected ? ' selected' : ''}`}
      aria-label={`${node.label}, status ${node.status}`}
    >
      <div className="agent-ring" />
      <div className="agent-core">
        <div className="agent-glyph">{kindGlyph[node.kind]}</div>
        <div className="agent-text">
          <div className="agent-label">{node.label.toUpperCase()}</div>
          <div className="agent-status">{node.status}</div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import type { GraphNode } from '../../types/events';
import './nodes.css';

type WiseNode = Node<Record<string, unknown>, 'hermes'>;
type Props = NodeProps<WiseNode>;

export function HermesNode({ data, selected }: Props) {
  const node = data as unknown as GraphNode;
  const intense = node.status === 'THINKING' || node.status === 'EXECUTING';
  return (
    <div
      className={`hermes-node status-${node.status.toLowerCase()}${selected ? ' selected' : ''}${
        intense ? ' intense' : ''
      }`}
      aria-label={`Hermes router, status ${node.status}`}
    >
      <div className="hermes-core">
        <div className="ring ring-1" />
        <div className="ring ring-2" />
        <div className="ring ring-3" />
        <div className="hermes-glyph">H</div>
      </div>
      <div className="hermes-meta">
        <div className="hermes-label">HERMES</div>
        <div className="hermes-sub">{node.status}</div>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
      <Handle type="source" position={Position.Top} id="top" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}

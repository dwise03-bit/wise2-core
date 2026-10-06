import { useGraphStore } from '../state/store';
import './inspector.css';

export function Inspector() {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const node = useGraphStore((s) => s.nodes.find((n) => n.id === selectedNodeId));
  const edge = useGraphStore((s) => s.edges.find((e) => e.id === selectedEdgeId));
  const history = useGraphStore((s) =>
    s.history.filter((event) => {
      if (selectedNodeId) return event.source_node === selectedNodeId || event.target_node === selectedNodeId;
      if (selectedEdgeId && edge) return event.source_node === edge.source && event.target_node === edge.target;
      return false;
    }).slice(-20).reverse(),
  );
  const clear = useGraphStore((s) => () => { s.selectNode(null); s.selectEdge(null); });

  const open = Boolean(node ?? edge);
  if (!open) return null;

  return (
    <aside className="inspector" aria-live="polite">
      <header>
        <div className="inspector-title">{node ? node.label : edge ? `${edge.source} → ${edge.target}` : ''}</div>
        <button className="inspector-close" onClick={clear} aria-label="Close inspector">✕</button>
      </header>
      {node && (
        <div className="section">
          <div className="row"><span>Type</span><span>{node.kind}</span></div>
          <div className="row"><span>Status</span><span className={`chip chip-${node.status.toLowerCase()}`}>{node.status}</span></div>
          {node.role && <div className="row"><span>Role</span><span>{node.role}</span></div>}
          {node.model && <div className="row"><span>Model</span><span>{node.model}</span></div>}
          {node.current_task && <div className="row"><span>Task</span><span>{node.current_task}</span></div>}
          {node.project && <div className="row"><span>Project</span><span>{node.project}</span></div>}
          {typeof node.tokens === 'number' && <div className="row"><span>Tokens</span><span>{node.tokens.toLocaleString()}</span></div>}
          {typeof node.cost === 'number' && <div className="row"><span>Cost</span><span>${node.cost.toFixed(4)}</span></div>}
        </div>
      )}
      {edge && (
        <div className="section">
          <div className="row"><span>Kind</span><span>{edge.kind}</span></div>
          <div className="row"><span>Active</span><span>{edge.active ? 'yes' : 'no'}</span></div>
          <div className="row"><span>Messages</span><span>{edge.message_count ?? 0}</span></div>
          {edge.last_activity && (
            <div className="row"><span>Last activity</span><span>{new Date(edge.last_activity).toLocaleTimeString()}</span></div>
          )}
        </div>
      )}
      <div className="section">
        <h3>Recent events</h3>
        {history.length === 0 ? (
          <p className="empty">No events yet.</p>
        ) : (
          <ul className="event-list">
            {history.map((event) => (
              <li key={event.event_id}>
                <span className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
                <span className="event-type">{event.event_type}</span>
                {event.packet_kind && <span className="event-kind">{event.packet_kind}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}

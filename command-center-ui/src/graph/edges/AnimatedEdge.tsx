import { useMemo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import { useGraphStore, type Packet } from '../../state/store';
import type { GraphEdge } from '../../types/events';
import './edges.css';

/**
 * Custom edge: draws the base bezier and overlays live traveling packets.
 * Each packet rides the SAME path as the edge via `animateMotion` + `mpath`.
 *
 * Selectors subscribe to the raw store collections; derived filters live in
 * `useMemo` so React doesn't see a fresh array identity every render.
 */
export function AnimatedEdge(props: EdgeProps) {
  const [path] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  const packetsAll = useGraphStore((s) => s.packets);
  const edges = useGraphStore((s) => s.edges);
  const packets = useMemo(
    () => packetsAll.filter((p) => p.edgeId === props.id),
    [packetsAll, props.id],
  );
  const graphEdge = useMemo(
    () => edges.find((e) => e.id === props.id) as GraphEdge | undefined,
    [edges, props.id],
  );

  const active = graphEdge?.active ?? false;
  const edgeKind = graphEdge?.kind ?? 'communication';
  const pathId = `path-${props.id}`;

  return (
    <>
      <defs>
        <path id={pathId} d={path} fill="none" />
      </defs>
      <BaseEdge
        id={props.id}
        path={path}
        className={`edge-base kind-${edgeKind}${active ? ' active' : ''}${props.selected ? ' selected' : ''}`}
        interactionWidth={16}
      />
      {packets.map((packet) => (
        <PacketDot key={packet.id} packet={packet} pathId={pathId} />
      ))}
    </>
  );
}

function PacketDot({ packet, pathId }: { packet: Packet; pathId: string }) {
  const kindClass = `packet-${(packet.kind ?? 'MESSAGE').toLowerCase()}`;
  return (
    <g className={`packet ${kindClass}`}>
      <circle r={5}>
        <animateMotion dur={`${packet.durationMs}ms`} fill="freeze" rotate="auto">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      <circle r={9} className="packet-halo">
        <animateMotion dur={`${packet.durationMs}ms`} fill="freeze" rotate="auto">
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
    </g>
  );
}

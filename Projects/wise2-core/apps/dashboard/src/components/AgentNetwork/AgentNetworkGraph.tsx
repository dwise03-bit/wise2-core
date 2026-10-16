import React, { useEffect, useRef, useState } from 'react';
import styles from './AgentNetworkGraph.module.css';

/**
 * Agent Network Visualization
 * Displays 37 AI agents in a hierarchical ring structure
 * with connections to central hub
 */

interface AgentNode {
  id: string;
  name: string;
  type: 'hub' | 'ring1' | 'ring2' | 'ring3' | 'ring4';
  role: string;
  status: 'active' | 'idle' | 'error';
  connections: string[];
}

interface AgentNetworkGraphProps {
  agents: AgentNode[];
  selectedAgent?: string;
  onAgentSelect?: (agentId: string) => void;
  interactive?: boolean;
}

export const AgentNetworkGraph: React.FC<AgentNetworkGraphProps> = ({
  agents = defaultAgents,
  selectedAgent,
  onAgentSelect,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  const COLORS = {
    background: '#050607',
    grid: 'rgba(0, 217, 255, 0.1)',
    line: '#00D9FF',
    lineSecondary: '#FF00FF',
    nodeActive: '#00D9FF',
    nodeIdle: '#666666',
    nodeError: '#FF4444',
    text: '#FFFFFF',
  };

  const RING_RADIUS = [
    0,      // hub at center
    120,    // ring 1
    240,    // ring 2
    360,    // ring 3
    480,    // ring 4
  ];

  const NODE_RADIUS = 24;
  const AGENT_ICONS_PER_RING = [1, 8, 10, 12, 6]; // approx distribution for 37 total

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx, width, height, centerX, centerY);

    // Draw connections (lines to hub)
    drawConnections(ctx, centerX, centerY, agents);

    // Draw nodes
    drawNodes(ctx, centerX, centerY, agents, selectedAgent, hoveredAgent);

    // Draw labels
    drawLabels(ctx, centerX, centerY, agents);
  }, [agents, selectedAgent, hoveredAgent, scale, pan]);

  const drawGrid = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    centerX: number,
    centerY: number
  ) => {
    const gridSize = 20;
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawConnections = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    agents: AgentNode[]
  ) => {
    ctx.strokeStyle = COLORS.line;
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]); // dotted line

    agents.forEach((agent) => {
      if (agent.type === 'hub') return;

      const pos = getNodePosition(agent, centerX, centerY);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    });

    ctx.setLineDash([]);
  };

  const drawNodes = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    agents: AgentNode[],
    selectedAgent?: string,
    hoveredAgent?: string | null
  ) => {
    agents.forEach((agent) => {
      const pos = getNodePosition(agent, centerX, centerY);
      const isSelected = agent.id === selectedAgent;
      const isHovered = agent.id === hoveredAgent;

      // Node circle
      const nodeColor = {
        active: COLORS.nodeActive,
        idle: COLORS.nodeIdle,
        error: COLORS.nodeError,
      }[agent.status];

      ctx.fillStyle = agent.type === 'hub' ? COLORS.nodeActive : nodeColor;
      ctx.strokeStyle = isSelected ? COLORS.nodeActive : COLORS.line;
      ctx.lineWidth = isSelected ? 3 : isHovered ? 2 : 1;

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Icon (person symbol)
      if (agent.type === 'hub') {
        drawHubIcon(ctx, pos.x, pos.y);
      } else {
        drawAgentIcon(ctx, pos.x, pos.y);
      }

      // Selection ring
      if (isSelected) {
        ctx.strokeStyle = COLORS.nodeActive;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, NODE_RADIUS + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  };

  const drawLabels = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    agents: AgentNode[]
  ) => {
    ctx.fillStyle = COLORS.text;
    ctx.font = '12px -apple-system, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    agents.forEach((agent) => {
      if (agent.type === 'hub') return;

      const pos = getNodePosition(agent, centerX, centerY);
      const textY = pos.y + NODE_RADIUS + 8;

      ctx.fillText(agent.role, pos.x, textY);
    });
  };

  const drawHubIcon = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    // Draw center dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawAgentIcon = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number
  ) => {
    // Simple person icon
    ctx.fillStyle = '#FFFFFF';
    // Head
    ctx.beginPath();
    ctx.arc(x, y - 6, 4, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.fillRect(x - 3, y - 2, 6, 8);
  };

  const getNodePosition = (
    agent: AgentNode,
    centerX: number,
    centerY: number
  ) => {
    const ringIndex = parseInt(agent.type.replace('ring', '') || '0');
    const radius = RING_RADIUS[ringIndex];

    // Get position in ring
    const agentsInRing = AGENT_ICONS_PER_RING[ringIndex];
    const indexInRing = agents
      .filter((a) => a.type === agent.type)
      .indexOf(agent);
    const angle = (indexInRing / agentsInRing) * Math.PI * 2 - Math.PI / 2;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedAgent = findAgentAtPosition(x, y);
    if (clickedAgent) {
      onAgentSelect?.(clickedAgent.id);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const hoveredNode = findAgentAtPosition(x, y);
    setHoveredAgent(hoveredNode?.id || null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };

  const findAgentAtPosition = (x: number, y: number): AgentNode | null => {
    const centerX = canvasRef.current?.width ?? 0 / 2;
    const centerY = canvasRef.current?.height ?? 0 / 2;

    for (const agent of agents) {
      const pos = getNodePosition(agent, centerX, centerY);
      const distance = Math.sqrt(
        Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2)
      );

      if (distance <= NODE_RADIUS + 4) {
        return agent;
      }
    }

    return null;
  };

  return (
    <div className={styles.container}>
      <canvas
        ref={canvasRef}
        width={1000}
        height={800}
        className={styles.canvas}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredAgent(null)}
      />
    </div>
  );
};

const defaultAgents: AgentNode[] = [
  { id: 'hub', name: 'Central Hub', type: 'hub', role: 'Coordinator', status: 'active', connections: [] },
  // Ring 1 (8 agents)
  { id: 'a1', name: 'Agent 1', type: 'ring1', role: 'Data Agent', status: 'active', connections: ['hub'] },
  { id: 'a2', name: 'Agent 2', type: 'ring1', role: 'Market Agent', status: 'active', connections: ['hub'] },
  // ... add more agents
];

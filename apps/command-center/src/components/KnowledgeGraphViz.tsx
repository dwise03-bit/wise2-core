'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Node {
  id: string;
  label: string;
  type: 'entity' | 'concept' | 'document' | 'agent';
  size: number;
}

interface Edge {
  source: string;
  target: string;
  label: string;
  weight: number;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

export const KnowledgeGraphViz: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      const response = await fetch('/api/knowledge-graph');
      const data = await response.json();
      setGraph(data);
      setLoading(false);

      // Draw graph after loading
      if (containerRef.current) {
        drawGraph(data);
      }
    } catch (error) {
      console.error('Failed to fetch graph data', error);
      setLoading(false);
    }
  };

  const drawGraph = (graphData: GraphData) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Simple force-directed layout simulation
    const positions = simulateLayout(graphData);

    // Draw edges
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;

    graphData.edges.forEach((edge) => {
      const source = positions[edge.source];
      const target = positions[edge.target];

      if (source && target) {
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    graphData.nodes.forEach((node) => {
      const pos = positions[node.id];
      if (!pos) return;

      const isSelected = selectedNode?.id === node.id;
      const radius = node.size + (isSelected ? 5 : 0);

      // Node circle
      ctx.fillStyle = getNodeColor(node.type);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
      ctx.fill();

      // Node label
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label.substring(0, 15), pos.x, pos.y);
    });
  };

  const simulateLayout = (graphData: GraphData) => {
    const positions: Record<string, { x: number; y: number }> = {};

    // Initialize random positions
    graphData.nodes.forEach((node) => {
      positions[node.id] = {
        x: Math.random() * (canvasRef.current?.width || 800),
        y: Math.random() * (canvasRef.current?.height || 600),
      };
    });

    // Simple spring layout (few iterations for performance)
    for (let iteration = 0; iteration < 10; iteration++) {
      graphData.edges.forEach((edge) => {
        const source = positions[edge.source];
        const target = positions[edge.target];

        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          const force = (distance - 100) * 0.01 * edge.weight;
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;

          source.x += fx;
          source.y += fy;
          target.x -= fx;
          target.y -= fy;
        }
      });
    }

    return positions;
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'entity':
        return '#3b82f6';
      case 'concept':
        return '#10b981';
      case 'document':
        return '#f59e0b';
      case 'agent':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !graph) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked node
    const positions = simulateLayout(graph);

    for (const node of graph.nodes) {
      const pos = positions[node.id];
      if (!pos) continue;

      const distance = Math.sqrt(
        (x - pos.x) ** 2 + (y - pos.y) ** 2
      );

      if (distance < node.size + 10) {
        setSelectedNode(node);
        return;
      }
    }

    setSelectedNode(null);
  };

  if (loading) {
    return <div className="p-6">Loading knowledge graph...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Knowledge Graph Explorer</h2>

      <div className="flex gap-4">
        <div className="flex-1">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            className="border rounded-lg cursor-pointer"
          />
        </div>

        <div className="w-80">
          <div className="border rounded-lg p-4 bg-white shadow-md">
            <h3 className="font-bold mb-3">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span>Entity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Concept</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span>Document</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full" />
                <span>Agent</span>
              </div>
            </div>
          </div>

          {selectedNode && (
            <div className="border rounded-lg p-4 bg-white shadow-md mt-4">
              <h3 className="font-bold mb-2">{selectedNode.label}</h3>
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> {selectedNode.type}
              </p>
              <p className="text-sm text-gray-600">
                <strong>ID:</strong> {selectedNode.id}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Size:</strong> {selectedNode.size}
              </p>
            </div>
          )}

          <div className="border rounded-lg p-4 bg-white shadow-md mt-4">
            <h3 className="font-bold mb-2">Graph Stats</h3>
            {graph && (
              <div className="text-sm space-y-1">
                <p>Nodes: {graph.nodes.length}</p>
                <p>Edges: {graph.edges.length}</p>
                <p>Density: {(graph.edges.length / (graph.nodes.length * (graph.nodes.length - 1))).toFixed(3)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphViz;

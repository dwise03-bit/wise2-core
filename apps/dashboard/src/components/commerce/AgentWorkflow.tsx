'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  Clock,
  Loader2,
  AlertCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface AgentWorkflowProps {
  businessId: string;
}

const AGENTS = [
  {
    id: 'market-intel',
    name: 'Market Intelligence',
    description: 'Analyzes trends, demand, and market gaps',
    status: 'complete',
    progress: 100,
    result: {
      trends: ['Sustainable products', 'Direct-to-consumer', 'Subscription model'],
      demandScore: 85,
      competitionLevel: 'medium',
      opportunities: ['Premium segment', 'Eco-conscious audience', 'Subscription model'],
    },
  },
  {
    id: 'competitor',
    name: 'Competitor Analysis',
    description: 'Identifies competitors, positioning, and gaps',
    status: 'complete',
    progress: 100,
    result: {
      topCompetitors: ['Competitor A', 'Competitor B', 'Competitor C'],
      gaps: ['Better customer service', 'Unique positioning', 'Premium packaging'],
      advantages: ['Superior quality', 'Better brand story', 'Recurring revenue model'],
    },
  },
  {
    id: 'psychology',
    name: 'Customer Psychology',
    description: 'Generates avatars, triggers, and messaging',
    status: 'waiting_approval',
    progress: 100,
    result: {
      primaryAvatar: 'Sustainability-focused professionals aged 25-45',
      emotionalTriggers: ['Environmental impact', 'Premium quality', 'Convenience'],
      objections: ['Price', 'Delivery time', 'Quality concerns'],
    },
  },
  {
    id: 'brand',
    name: 'Brand Architect',
    description: 'Creates brand identity, colors, positioning',
    status: 'idle',
    progress: 0,
  },
  {
    id: 'product',
    name: 'Product Validator',
    description: 'Validates product viability and margins',
    status: 'idle',
    progress: 0,
  },
  {
    id: 'store',
    name: 'Store Builder',
    description: 'Generates store architecture and pages',
    status: 'idle',
    progress: 0,
  },
];

export default function AgentWorkflow({ businessId }: AgentWorkflowProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [approvedAgents, setApprovedAgents] = useState<string[]>([]);

  const handleApprove = (agentId: string) => {
    setApprovedAgents([...approvedAgents, agentId]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'working':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'waiting_approval':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-50';
      case 'working':
        return 'bg-blue-50';
      case 'waiting_approval':
        return 'bg-yellow-50';
      default:
        return 'bg-muted/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Workflow Status</CardTitle>
          <CardDescription>
            AI agents working in sequence to build your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Agents Complete</p>
              <p className="text-3xl font-bold">3/6</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Awaiting Approval</p>
              <p className="text-3xl font-bold">1</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Estimated Time</p>
              <p className="text-3xl font-bold">2-3 hrs</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Timeline */}
      <div className="space-y-3">
        {AGENTS.map((agent, idx) => (
          <div
            key={agent.id}
            className={`p-4 rounded-lg border ${getStatusColor(agent.status)}`}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                setExpandedAgent(expandedAgent === agent.id ? null : agent.id)
              }
            >
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(agent.status)}
                <div>
                  <p className="font-semibold text-foreground">{agent.name}</p>
                  <p className="text-sm text-muted-foreground">{agent.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    agent.status === 'complete'
                      ? 'default'
                      : agent.status === 'waiting_approval'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {agent.status === 'complete'
                    ? 'Complete'
                    : agent.status === 'working'
                      ? 'Working...'
                      : agent.status === 'waiting_approval'
                        ? 'Needs Approval'
                        : 'Ready'}
                </Badge>
                <span className="text-2xl">
                  {expandedAgent === agent.id ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {/* Progress */}
            {agent.progress > 0 && (
              <div className="mt-3">
                <Progress value={agent.progress} className="h-2" />
              </div>
            )}

            {/* Expanded Content */}
            {expandedAgent === agent.id && agent.result && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="text-sm space-y-2">
                  {Object.entries(agent.result).map(([key, value]) => (
                    <div key={key}>
                      <p className="font-medium text-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-muted-foreground">
                        {Array.isArray(value)
                          ? value.join(', ')
                          : typeof value === 'object'
                            ? JSON.stringify(value)
                            : String(value)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                {agent.status === 'waiting_approval' && !approvedAgents.includes(agent.id) && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(agent.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Request Changes
                    </Button>
                  </div>
                )}

                {approvedAgents.includes(agent.id) && (
                  <div className="text-sm text-green-600">✓ Approved and proceeding</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          Pause Workflow
        </Button>
        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
          Continue Workflow
        </Button>
      </div>
    </div>
  );
}

/**
 * Workforce Grid Component
 * Display all AI agents with detailed information
 */

'use client';

import { WorkforceAgentCard } from './WorkforceAgentCard';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: 'ready' | 'working' | 'offline' | 'error';
  uptime: number;
  currentTask?: string;
  tasksCompleted: number;
  avgResponseTime: string;
  specialties: string[];
  availability: number;
}

export function WorkforceGrid() {
  const agents: Agent[] = [
    {
      id: '1',
      name: 'Hermes',
      role: 'Executive AI',
      icon: '👑',
      status: 'ready',
      uptime: 99.9,
      currentTask: 'Orchestrating workflow queue',
      tasksCompleted: 1247,
      avgResponseTime: '0.8s',
      specialties: ['Orchestration', 'Decision Making', 'Delegation'],
      availability: 95,
    },
    {
      id: '2',
      name: 'Creative AI',
      role: 'Design & Content',
      icon: '🎨',
      status: 'working',
      uptime: 99.5,
      currentTask: 'Generating design mockups',
      tasksCompleted: 856,
      avgResponseTime: '2.1s',
      specialties: ['Design', 'Content', 'Copywriting'],
      availability: 78,
    },
    {
      id: '3',
      name: 'Marketing AI',
      role: 'Campaign & Growth',
      icon: '📢',
      status: 'ready',
      uptime: 99.7,
      currentTask: undefined,
      tasksCompleted: 623,
      avgResponseTime: '1.3s',
      specialties: ['Campaigns', 'Analytics', 'Growth'],
      availability: 92,
    },
    {
      id: '4',
      name: 'Inventory AI',
      role: 'Supply Chain',
      icon: '📦',
      status: 'working',
      uptime: 99.8,
      currentTask: 'Optimizing stock levels',
      tasksCompleted: 1089,
      avgResponseTime: '0.9s',
      specialties: ['Inventory', 'Forecasting', 'Optimization'],
      availability: 88,
    },
    {
      id: '5',
      name: 'Finance AI',
      role: 'Accounting & Reports',
      icon: '💰',
      status: 'ready',
      uptime: 100,
      currentTask: undefined,
      tasksCompleted: 542,
      avgResponseTime: '1.5s',
      specialties: ['Accounting', 'Forecasting', 'Analysis'],
      availability: 100,
    },
    {
      id: '6',
      name: 'Support AI',
      role: 'Customer Service',
      icon: '💬',
      status: 'working',
      uptime: 99.4,
      currentTask: 'Processing support tickets',
      tasksCompleted: 2156,
      avgResponseTime: '0.6s',
      specialties: ['Support', 'Resolution', 'Satisfaction'],
      availability: 85,
    },
    {
      id: '7',
      name: 'Sales AI',
      role: 'Revenue & Pipeline',
      icon: '💼',
      status: 'ready',
      uptime: 99.6,
      currentTask: undefined,
      tasksCompleted: 734,
      avgResponseTime: '1.1s',
      specialties: ['Sales', 'Negotiation', 'Forecasting'],
      availability: 90,
    },
    {
      id: '8',
      name: 'Analytics AI',
      role: 'Data & Insights',
      icon: '📊',
      status: 'working',
      uptime: 99.9,
      currentTask: 'Running daily analytics',
      tasksCompleted: 1045,
      avgResponseTime: '3.2s',
      specialties: ['Analytics', 'Reporting', 'Insights'],
      availability: 92,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm text-wise-text-secondary">
        Showing {agents.length} agents
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => (
          <WorkforceAgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

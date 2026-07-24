import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tags = searchParams.get('tags')?.split(',') || [];

  const services = [
    {
      id: 'strategy-001',
      name: 'AI Strategy & Roadmap',
      category: 'Strategy',
      description: 'Develop comprehensive AI implementation strategy for your organization',
      price: 4400,
      duration: 120,
      consultant: { id: 'c1', name: 'Daniel Wise', title: 'AI Strategy Lead' },
      tags: ['AI', 'Strategy', 'Enterprise'],
      availability: ['2026-07-28', '2026-07-29', '2026-07-30'],
    },
    {
      id: 'automation-002',
      name: 'Automation Workflow Design',
      category: 'Implementation',
      description: 'Design and implement AI-powered automation workflows',
      price: 3080,
      duration: 90,
      consultant: { id: 'c2', name: 'Sarah Chen', title: 'Automation Specialist' },
      tags: ['Automation', 'Workflow', 'AI'],
      availability: ['2026-07-28', '2026-07-30', '2026-07-31'],
    },
    {
      id: 'integration-003',
      name: 'AI System Integration',
      category: 'Implementation',
      description: 'Integrate WISE² platform with your existing systems',
      price: 3520,
      duration: 120,
      consultant: { id: 'c3', name: 'Marcus Johnson', title: 'Integration Expert' },
      tags: ['Integration', 'AI', 'Enterprise'],
      availability: ['2026-07-29', '2026-07-31', '2026-08-01'],
    },
    {
      id: 'training-004',
      name: 'Team Training & Enablement',
      category: 'Training',
      description: 'Train your team on AI consulting and automation tools',
      price: 2200,
      duration: 180,
      consultant: { id: 'c4', name: 'Lisa Rodriguez', title: 'Training Director' },
      tags: ['Training', 'Enablement', 'AI'],
      availability: ['2026-07-28', '2026-07-29', '2026-07-30', '2026-07-31'],
    },
    {
      id: 'audit-005',
      name: 'AI Readiness Audit',
      category: 'Assessment',
      description: 'Comprehensive assessment of your organization\'s AI readiness',
      price: 2640,
      duration: 120,
      consultant: { id: 'c1', name: 'Daniel Wise', title: 'AI Strategy Lead' },
      tags: ['Audit', 'Assessment', 'AI'],
      availability: ['2026-07-28', '2026-07-29', '2026-07-30'],
    },
  ];

  // Filter by tags if provided
  let filtered = services;
  if (tags.length > 0) {
    filtered = services.filter(s => tags.some(tag => s.tags.includes(tag)));
  }

  return NextResponse.json({
    services: filtered,
    total: filtered.length,
    timestamp: new Date().toISOString(),
  });
}

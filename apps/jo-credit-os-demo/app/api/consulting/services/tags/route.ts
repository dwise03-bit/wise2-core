import { NextResponse } from 'next/server';

export async function GET() {
  const tags = [
    { name: 'AI', count: 5, color: '#2CD588' },
    { name: 'Strategy', count: 2, color: '#2CD588' },
    { name: 'Automation', count: 2, color: '#2CD588' },
    { name: 'Enterprise', count: 3, color: '#2CD588' },
    { name: 'Integration', count: 1, color: '#2CD588' },
    { name: 'Training', count: 1, color: '#2CD588' },
    { name: 'Assessment', count: 1, color: '#2CD588' },
    { name: 'Workflow', count: 1, color: '#2CD588' },
    { name: 'Enablement', count: 1, color: '#2CD588' },
    { name: 'Audit', count: 1, color: '#2CD588' },
    { name: 'Implementation', count: 2, color: '#2CD588' },
  ];

  return NextResponse.json({
    tags,
    total: tags.length,
    timestamp: new Date().toISOString(),
  });
}

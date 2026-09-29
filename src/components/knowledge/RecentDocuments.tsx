/**
 * Recent Documents Component
 */

'use client';

interface Document {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  relevance: number;
}

export function RecentDocuments() {
  const documents: Document[] = [
    {
      id: '1',
      title: 'Customer Onboarding Process',
      category: 'Operations',
      lastUpdated: '2 days ago',
      relevance: 98,
    },
    {
      id: '2',
      title: 'Product Roadmap Q3-Q4 2026',
      category: 'Strategy',
      lastUpdated: '1 week ago',
      relevance: 87,
    },
    {
      id: '3',
      title: 'API Documentation & Integrations',
      category: 'Technical',
      lastUpdated: '3 days ago',
      relevance: 92,
    },
    {
      id: '4',
      title: 'Sales Playbook & Methodologies',
      category: 'Sales',
      lastUpdated: '1 week ago',
      relevance: 85,
    },
    {
      id: '5',
      title: 'Company Values & Culture',
      category: 'Culture',
      lastUpdated: '2 months ago',
      relevance: 76,
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-wise-text-primary">Knowledge Base</h2>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="rounded-lg bg-wise-surface-1 border border-wise-border p-4 hover:border-wise-blue-electric/50 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-wise-text-primary hover:text-wise-blue-electric transition-colors">
                  {doc.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-wise-surface-2 rounded text-wise-text-secondary">
                    {doc.category}
                  </span>
                  <span className="text-xs text-wise-text-secondary">
                    Updated {doc.lastUpdated}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-wise-green-neon">
                    {doc.relevance}%
                  </div>
                  <div className="text-xs text-wise-text-secondary">Relevant</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

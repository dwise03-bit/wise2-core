/**
 * Knowledge & Brain Page
 * Second Brain access, search, and learning interface
 */

'use client';

import React from 'react';
import { KnowledgeHeader } from '@/src/components/knowledge/KnowledgeHeader';
import { KnowledgeSearch } from '@/src/components/knowledge/KnowledgeSearch';
import { BrainStats } from '@/src/components/knowledge/BrainStats';
import { RecentDocuments } from '@/src/components/knowledge/RecentDocuments';

export default function KnowledgePage() {
  return (
    <div className="p-6 space-y-6">
      <KnowledgeHeader />
      <KnowledgeSearch />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentDocuments />
        </div>
        <div>
          <BrainStats />
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { SectionScaffold } from '../../../src/components/revenue-os';

export default function RevenueConversationsPage() {
  return (
    <SectionScaffold
      title="Conversations"
      description="Calls, texts, and chats handled by the AI workforce"
      plannedEndpoint="GET /api/revenue-os/conversations — not in the current contract"
      links={[
        {
          label: 'AI Workforce',
          href: '/revenue-os/agents',
          description: 'Status of the agents that run these conversations',
        },
        {
          label: 'Hermes',
          href: '/dashboard/ai',
          description: 'Live AI assistant and context',
        },
      ]}
    />
  );
}

import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AgentNetworkDashboard } from './AgentNetworkDashboard';
import { AgentNetworkGraph } from './AgentNetworkGraph';
import { AgentCard } from './AgentCard';
import { ProfileCarousel } from './ProfileCarousel';

/**
 * Storybook stories for Agent Network components
 * Run with: npm run storybook
 */

// AgentNetworkDashboard Stories
const DashboardMeta: Meta<typeof AgentNetworkDashboard> = {
  title: 'WISE²/Agent Network/Dashboard',
  component: AgentNetworkDashboard,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'ipad',
    },
  },
};

export default DashboardMeta;

export const FullDashboard: StoryObj<typeof AgentNetworkDashboard> = {
  render: () => <AgentNetworkDashboard />,
  parameters: {
    docs: {
      description: {
        story: 'Complete Agent Network Dashboard with all components integrated',
      },
    },
  },
};

// AgentCard Stories
const CardMeta: Meta<typeof AgentCard> = {
  title: 'WISE²/Agent Network/Agent Card',
  component: AgentCard,
  parameters: {
    layout: 'padded',
  },
};

export { CardMeta };

const mockCardData = {
  id: 'agent-knowledge-hygiene',
  category: 'TECH',
  title: 'Knowledge Hygiene',
  description: 'A part-time knowledge-base janitor that never keeps up.',
  ladder: {
    humanLed:
      'You set what "healthy" means. It enforces the rules and reports the score.',
    humanAssisted: 'It lists the broken links and orphans; you triage.',
    fullyAutonomous:
      'It walks every file, scores each folder, and tracks fix-ups to done.',
  },
  humanRole:
    'You set what "healthy" means. It enforces the rules and reports the score.',
  doneBy: {
    agent: 'Markdown Auditor',
    type: 'AI agent',
    ratio: '1:1',
  },
  sop: [
    {
      step: 1,
      description: 'Walk every markdown file in clue-agent/brain-store',
    },
    {
      step: 2,
      description: 'Flag broken wiki-links, orphan notes and stale frontmatter',
    },
    {
      step: 3,
      description:
        'Check generated org docs still match the live agents, SOPs and tools',
    },
    { step: 4, description: 'Write the health report with per-folder scores' },
  ],
};

export const DefaultCard: StoryObj<typeof AgentCard> = {
  render: () => <AgentCard {...mockCardData} />,
};

export const SelectedCard: StoryObj<typeof AgentCard> = {
  render: () => <AgentCard {...mockCardData} selected={true} />,
};

export const CardWithHover: StoryObj<typeof AgentCard> = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      <AgentCard {...mockCardData} />
      <AgentCard {...mockCardData} selected={true} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Card in default and selected states',
      },
    },
  },
};

// ProfileCarousel Stories
const CarouselMeta: Meta<typeof ProfileCarousel> = {
  title: 'WISE²/Agent Network/Profile Carousel',
  component: ProfileCarousel,
  parameters: {
    layout: 'fullscreen',
  },
};

export { CarouselMeta };

const mockProfiles = [
  {
    id: 'profile-self',
    name: 'Your story',
    imageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=56&h=56&fit=crop',
    gradient: 'red' as const,
    isStory: true,
  },
  {
    id: 'profile-moaaan',
    name: 'moaaan__',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=56&h=56&fit=crop',
    gradient: 'magenta' as const,
  },
  {
    id: 'profile-jackson',
    name: 'jacksondupree',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop',
    gradient: 'orange' as const,
  },
  {
    id: 'profile-dominic',
    name: 'dominicand',
    imageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=56&h=56&fit=crop',
    gradient: 'yellow' as const,
  },
];

export const DefaultCarousel: StoryObj<typeof ProfileCarousel> = {
  render: () => (
    <ProfileCarousel
      profiles={mockProfiles}
      onProfileSelect={(id) => console.log('Selected:', id)}
      onAddStory={() => console.log('Add story clicked')}
    />
  ),
};

export const CarouselInteractive: StoryObj<typeof ProfileCarousel> = {
  render: (args) => {
    const [selected, setSelected] = React.useState<string | null>(null);
    return (
      <div>
        <ProfileCarousel {...args} onProfileSelect={setSelected} />
        {selected && <p>Selected profile: {selected}</p>}
      </div>
    );
  },
  args: {
    profiles: mockProfiles,
  },
};

// AgentNetworkGraph Stories
const GraphMeta: Meta<typeof AgentNetworkGraph> = {
  title: 'WISE²/Agent Network/Network Graph',
  component: AgentNetworkGraph,
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'ipad',
    },
  },
};

export { GraphMeta };

const mockAgents = [
  {
    id: 'hub',
    name: 'Central Hub',
    type: 'hub' as const,
    role: 'Coordinator',
    status: 'active' as const,
    connections: ['a1', 'a2', 'a3', 'a4', 'a5'],
  },
  // Ring 1 (8 agents)
  {
    id: 'a1',
    name: 'Data Agent',
    type: 'ring1' as const,
    role: 'Data',
    status: 'active' as const,
    connections: ['hub'],
  },
  {
    id: 'a2',
    name: 'Market Agent',
    type: 'ring1' as const,
    role: 'Market',
    status: 'active' as const,
    connections: ['hub'],
  },
  {
    id: 'a3',
    name: 'Research Agent',
    type: 'ring1' as const,
    role: 'Research',
    status: 'idle' as const,
    connections: ['hub'],
  },
  {
    id: 'a4',
    name: 'Sales Agent',
    type: 'ring1' as const,
    role: 'Sales',
    status: 'active' as const,
    connections: ['hub'],
  },
  {
    id: 'a5',
    name: 'Audit Agent',
    type: 'ring1' as const,
    role: 'Audit',
    status: 'error' as const,
    connections: ['hub'],
  },
];

export const DefaultGraph: StoryObj<typeof AgentNetworkGraph> = {
  render: () => (
    <div style={{ width: '100%', height: '600px' }}>
      <AgentNetworkGraph agents={mockAgents} interactive={true} />
    </div>
  ),
};

export const SelectedAgentGraph: StoryObj<typeof AgentNetworkGraph> = {
  render: (args) => {
    const [selected, setSelected] = React.useState<string | null>('a1');
    return (
      <div style={{ width: '100%', height: '600px' }}>
        <AgentNetworkGraph
          agents={mockAgents}
          selectedAgent={selected}
          onAgentSelect={setSelected}
          interactive={true}
        />
        <p style={{ marginTop: '16px' }}>Selected: {selected}</p>
      </div>
    );
  },
};

/**
 * Manual Testing Guide
 *
 * 1. Run Storybook: npm run storybook
 * 2. Navigate to each story
 * 3. Test interactions:
 *    - Click profile rings → should show selection effect
 *    - Click add button → should trigger callback
 *    - Click agent nodes → should select and highlight
 *    - Hover over cards → should show hover effect
 * 4. Verify responsive behavior by resizing
 * 5. Check color accuracy against design system
 */

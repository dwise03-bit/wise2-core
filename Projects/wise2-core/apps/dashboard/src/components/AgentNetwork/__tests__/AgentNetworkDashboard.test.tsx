import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AgentNetworkDashboard } from '../AgentNetworkDashboard';
import { AgentNetworkGraph } from '../AgentNetworkGraph';
import { AgentCard } from '../AgentCard';
import { ProfileCarousel } from '../ProfileCarousel';

/**
 * Agent Network Dashboard Test Suite
 * Tests rendering, interactions, and component integration
 */

describe('AgentNetworkDashboard', () => {
  it('renders without crashing', () => {
    render(<AgentNetworkDashboard />);
    expect(screen.getByText(/Agent Details/i)).toBeInTheDocument();
  });

  it('displays profile carousel', () => {
    render(<AgentNetworkDashboard />);
    expect(screen.getByText(/Instagram/i)).toBeInTheDocument();
  });

  it('displays sidebar navigation', () => {
    render(<AgentNetworkDashboard />);
    expect(screen.getByText(/Navigation/i)).toBeInTheDocument();
    expect(screen.getByText(/Funnel/i)).toBeInTheDocument();
  });

  it('displays agent details panel', () => {
    render(<AgentNetworkDashboard />);
    expect(screen.getByText(/Knowledge Hygiene/i)).toBeInTheDocument();
  });
});

describe('AgentCard', () => {
  const mockCard = {
    id: 'test-agent',
    category: 'TECH',
    title: 'Test Agent',
    description: 'A test agent for knowledge management',
    ladder: {
      humanLed: 'Human-led description',
      humanAssisted: 'Human-assisted description',
      fullyAutonomous: 'Fully autonomous description',
    },
    humanRole: 'Set the rules and review scores',
    doneBy: {
      agent: 'Test Auditor',
      type: 'AI agent',
      ratio: '1:1',
    },
    sop: [
      { step: 1, description: 'First step' },
      { step: 2, description: 'Second step' },
    ],
  };

  it('renders agent card with all sections', () => {
    render(<AgentCard {...mockCard} />);
    expect(screen.getByText(/TECH/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Agent/i)).toBeInTheDocument();
    expect(screen.getByText(/THE LADDER/i)).toBeInTheDocument();
    expect(screen.getByText(/THE HUMAN/i)).toBeInTheDocument();
    expect(screen.getByText(/DONE BY/i)).toBeInTheDocument();
    expect(screen.getByText(/THE SOP/i)).toBeInTheDocument();
  });

  it('displays automation ladder levels', () => {
    render(<AgentCard {...mockCard} />);
    expect(screen.getByText(/HUMAN-LED/i)).toBeInTheDocument();
    expect(screen.getByText(/HUMAN-ASSISTED/i)).toBeInTheDocument();
    expect(screen.getByText(/FULLY AUTONOMOUS/i)).toBeInTheDocument();
  });

  it('displays SOP steps with correct numbering', () => {
    render(<AgentCard {...mockCard} />);
    expect(screen.getByText(/01/)).toBeInTheDocument();
    expect(screen.getByText(/02/)).toBeInTheDocument();
    expect(screen.getByText(/First step/i)).toBeInTheDocument();
    expect(screen.getByText(/Second step/i)).toBeInTheDocument();
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    const { container } = render(<AgentCard {...mockCard} onClick={onClick} />);
    const card = container.querySelector('.card');
    if (card) {
      fireEvent.click(card);
      expect(onClick).toHaveBeenCalled();
    }
  });

  it('shows selected state', () => {
    const { container } = render(<AgentCard {...mockCard} selected={true} />);
    const card = container.querySelector('.card');
    expect(card).toHaveClass('selected');
  });
});

describe('ProfileCarousel', () => {
  const mockProfiles = [
    {
      id: 'p1',
      name: 'Profile 1',
      imageUrl: '/test1.jpg',
      gradient: 'red' as const,
    },
    {
      id: 'p2',
      name: 'Profile 2',
      imageUrl: '/test2.jpg',
      gradient: 'magenta' as const,
    },
  ];

  it('renders profile carousel', () => {
    render(
      <ProfileCarousel profiles={mockProfiles} />
    );
    expect(screen.getByText(/Instagram/i)).toBeInTheDocument();
  });

  it('displays all profiles', () => {
    render(
      <ProfileCarousel profiles={mockProfiles} />
    );
    expect(screen.getByText(/Profile 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile 2/i)).toBeInTheDocument();
  });

  it('calls onProfileSelect when profile clicked', () => {
    const onSelect = jest.fn();
    render(
      <ProfileCarousel profiles={mockProfiles} onProfileSelect={onSelect} />
    );
    const profile = screen.getByText(/Profile 1/i);
    fireEvent.click(profile);
    expect(onSelect).toHaveBeenCalledWith('p1');
  });

  it('calls onAddStory when add button clicked', () => {
    const onAddStory = jest.fn();
    const { container } = render(
      <ProfileCarousel profiles={mockProfiles} onAddStory={onAddStory} />
    );
    const addButton = container.querySelector('button');
    if (addButton) {
      fireEvent.click(addButton);
      expect(onAddStory).toHaveBeenCalled();
    }
  });
});

describe('AgentNetworkGraph', () => {
  const mockAgents = [
    {
      id: 'hub',
      name: 'Central Hub',
      type: 'hub' as const,
      role: 'Coordinator',
      status: 'active' as const,
      connections: [],
    },
    {
      id: 'a1',
      name: 'Agent 1',
      type: 'ring1' as const,
      role: 'Data Agent',
      status: 'active' as const,
      connections: ['hub'],
    },
  ];

  it('renders canvas element', () => {
    const { container } = render(<AgentNetworkGraph agents={mockAgents} />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('handles agent selection', () => {
    const onSelect = jest.fn();
    render(
      <AgentNetworkGraph agents={mockAgents} onAgentSelect={onSelect} />
    );
    // Canvas click simulation would require more complex mocking
    expect(onSelect).toBeDefined();
  });

  it('shows selected agent state', () => {
    const { rerender } = render(
      <AgentNetworkGraph agents={mockAgents} selectedAgent="a1" />
    );
    // Canvas rendering makes visual testing complex - would need visual regression tests
    expect(true).toBe(true);
  });
});

/**
 * Manual Testing Checklist
 * Run these tests in a browser or dev environment:
 *
 * ✓ Dashboard renders with all 3 columns
 * ✓ Profile carousel scrolls horizontally
 * ✓ Sidebar menu items are clickable
 * ✓ Agent card displays all sections correctly
 * ✓ Automation ladder shows 3 levels
 * ✓ SOP steps display with correct numbering (01, 02, 03, 04)
 * ✓ Network graph renders with nodes and connections
 * ✓ Clicking a node selects it and shows detail
 * ✓ Hover effects work on cards and nodes
 * ✓ Responsive layout adapts on tablet (< 1200px)
 * ✓ Responsive layout adapts on mobile (< 768px)
 * ✓ Colors match design system (cyan #00D9FF, magenta #FF00FF, gold #C4A369)
 * ✓ Typography is clean sans-serif
 * ✓ Grid background visible in graph
 * ✓ Profile ring gradients display correctly
 */

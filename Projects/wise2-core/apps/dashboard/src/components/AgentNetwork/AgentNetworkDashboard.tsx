import React, { useState } from 'react';
import { AgentNetworkGraph } from './AgentNetworkGraph';
import { AgentCard } from './AgentCard';
import { ProfileCarousel } from './ProfileCarousel';
import styles from './AgentNetworkDashboard.module.css';

/**
 * Complete Agent Network Dashboard
 * Combines all components: profile carousel, network graph, agent cards, sidebar
 */

interface DashboardProps {
  agentData?: any;
}

export const AgentNetworkDashboard: React.FC<DashboardProps> = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  // Mock data
  const mockProfiles = [
    {
      id: 'profile1',
      name: 'Your story',
      imageUrl: '/api/placeholder/56/56',
      gradient: 'red' as const,
      isStory: true,
    },
    {
      id: 'profile2',
      name: 'moaaan__',
      imageUrl: '/api/placeholder/56/56',
      gradient: 'magenta' as const,
    },
    {
      id: 'profile3',
      name: 'jacksondupree',
      imageUrl: '/api/placeholder/56/56',
      gradient: 'orange' as const,
    },
    {
      id: 'profile4',
      name: 'dominicand',
      imageUrl: '/api/placeholder/56/56',
      gradient: 'yellow' as const,
    },
  ];

  const mockAgentCard = {
    id: 'agent-tech',
    category: 'TECH',
    title: 'Knowledge Hygiene',
    description:
      'A part-time knowledge-base janitor that never keeps up.',
    ladder: {
      humanLed: 'You set what "healthy" means. It enforces the rules and reports the score.',
      humanAssisted: 'It lists the broken links and orphans; you triage.',
      fullyAutonomous: 'It walks every file, scores each folder, and tracks fix-ups to done.',
    },
    humanRole:
      'You set what "healthy" means. It enforces the rules and reports the score.',
    doneBy: {
      agent: 'Markdown Auditor',
      type: 'AI agent',
      ratio: '1:1',
    },
    sop: [
      { step: 1, description: 'Walk every markdown file in clue-agent/brain-store' },
      { step: 2, description: 'Flag broken wiki-links, orphan notes and stale frontmatter' },
      { step: 3, description: 'Check generated org docs still match the live agents, SOPs and tools' },
      { step: 4, description: 'Write the health report with per-folder scores' },
    ],
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <ProfileCarousel profiles={mockProfiles} />

      <div className={styles.mainLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.menu}>
            <div className={styles.menuSection}>
              <h3 className={styles.menuTitle}>Navigation</h3>
              <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>⏳</span>
                  <span>Funnel</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>↔️</span>
                  <span>Workflows</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>👥</span>
                  <span>Social</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>📝</span>
                  <span>Content</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>💰</span>
                  <span>Finances</span>
                </li>
              </ul>
            </div>

            <div className={styles.menuSection}>
              <h3 className={styles.menuTitle}>Assets</h3>
              <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>🤖</span>
                  <span>Agents</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>✓</span>
                  <span>Tasks</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>📦</span>
                  <span>Projects</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>📊</span>
                  <span>Org Chart</span>
                </li>
              </ul>
            </div>

            <div className={styles.menuSection}>
              <h3 className={styles.menuTitle}>Intelligence</h3>
              <ul className={styles.menuList}>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>⚙️</span>
                  <span>Optimal Engine</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>🔍</span>
                  <span>Doctor</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>🔗</span>
                  <span>Integrations</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>🌐</span>
                  <span>Connections</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>🛣️</span>
                  <span>Roadmap</span>
                </li>
                <li className={styles.menuItem}>
                  <span className={styles.icon}>📈</span>
                  <span>Analytics</span>
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        {/* Detail Panel */}
        <div className={styles.detailPanel}>
          <div className={styles.detailContent}>
            <h2>Agent Details</h2>
            <AgentCard {...mockAgentCard} selected={selectedAgent === mockAgentCard.id} />
          </div>
        </div>

        {/* Network Graph */}
        <div className={styles.graphContainer}>
          <AgentNetworkGraph
            selectedAgent={selectedAgent}
            onAgentSelect={setSelectedAgent}
          />
        </div>
      </div>
    </div>
  );
};

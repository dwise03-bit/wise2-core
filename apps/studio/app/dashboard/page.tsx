'use client';

import { useState } from 'react';

type ProjectStatus = 'in-progress' | 'review' | 'approved' | 'completed';

interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  statusLabel: string;
  progress: number;
  manager: string;
  team: string;
  startDate: string;
  dueDate: string;
  budget: string;
  lastUpdate: string;
  feedback: Array<{ id: number; author: string; text: string; timestamp: string; type: 'comment' | 'revision' }>;
  timeline: Array<{ name: string; date: string; completed: boolean }>;
  deliverables: Array<{ id: number; name: string; icon: string; size: string }>;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
}

const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Design System v2.0',
    description: 'Complete redesign of component library',
    status: 'review',
    statusLabel: 'Awaiting Feedback',
    progress: 85,
    manager: 'Sarah Chen',
    team: 'Sarah, Mike, 2 others',
    startDate: 'Jan 15, 2024',
    dueDate: 'Mar 30, 2024',
    budget: '$12,500',
    lastUpdate: 'Updated 2 hours ago',
    feedback: [
      { id: 1, author: 'You', text: 'Color palette looks great! Consider adjusting button contrast.', timestamp: 'Yesterday', type: 'comment' },
      { id: 2, author: 'Sarah Chen', text: 'Will update the buttons by tomorrow.', timestamp: '6 hours ago', type: 'revision' },
    ],
    timeline: [
      { name: 'Kickoff & Discovery', date: 'Jan 15 - Jan 22', completed: true },
      { name: 'Design Concepts', date: 'Jan 29 - Feb 12', completed: true },
      { name: 'Client Review & Feedback', date: 'Feb 19 - Mar 5', completed: false },
      { name: 'Final Revisions', date: 'Mar 12 - Mar 26', completed: false },
    ],
    deliverables: [],
  },
  {
    id: 2,
    name: 'Mobile App Redesign',
    description: 'iOS and Android experience overhaul',
    status: 'approved',
    statusLabel: 'Approved',
    progress: 100,
    manager: 'Alex Rodriguez',
    team: 'Alex, Lisa, Emma',
    startDate: 'Jan 22, 2024',
    dueDate: 'Mar 15, 2024',
    budget: '$18,000',
    lastUpdate: 'Completed 1 day ago',
    feedback: [
      { id: 1, author: 'You', text: 'Love the navigation flow! Ready to go.', timestamp: '1 day ago', type: 'comment' },
    ],
    timeline: [
      { name: 'Kickoff & Strategy', date: 'Jan 22 - Feb 5', completed: true },
      { name: 'Wireframes & Prototypes', date: 'Feb 12 - Feb 26', completed: true },
      { name: 'High-Fidelity Design', date: 'Mar 4 - Mar 12', completed: true },
      { name: 'Final Approval', date: 'Mar 13 - Mar 15', completed: true },
    ],
    deliverables: [
      { id: 1, name: 'iOS Design Files (Figma)', icon: '🎨', size: '245 MB' },
      { id: 2, name: 'Android Assets (ZIP)', icon: '📦', size: '189 MB' },
      { id: 3, name: 'Design Specs & Handoff', icon: '📄', size: '12 MB' },
    ],
  },
  {
    id: 3,
    name: 'Marketing Website',
    description: 'Homepage and landing pages redesign',
    status: 'in-progress',
    statusLabel: 'In Progress',
    progress: 65,
    manager: 'Jordan Lee',
    team: 'Jordan, Emma, 2 others',
    startDate: 'Feb 1, 2024',
    dueDate: 'Apr 10, 2024',
    budget: '$9,500',
    lastUpdate: 'Updated 3 hours ago',
    feedback: [
      { id: 1, author: 'You', text: 'Hero section animation is smooth!', timestamp: '2 days ago', type: 'comment' },
    ],
    timeline: [
      { name: 'Discovery & Strategy', date: 'Feb 1 - Feb 12', completed: true },
      { name: 'Design Concepts', date: 'Feb 19 - Mar 5', completed: true },
      { name: 'Development & Implementation', date: 'Mar 12 - Apr 2', completed: false },
      { name: 'Testing & Launch', date: 'Apr 3 - Apr 10', completed: false },
    ],
    deliverables: [],
  },
  {
    id: 4,
    name: 'Brand Guidelines',
    description: 'Updated typography, colors, and standards',
    status: 'completed',
    statusLabel: 'Ready to Download',
    progress: 100,
    manager: 'Casey Park',
    team: 'Casey',
    startDate: 'Jan 8, 2024',
    dueDate: 'Feb 28, 2024',
    budget: '$5,000',
    lastUpdate: 'Completed 5 days ago',
    feedback: [],
    timeline: [
      { name: 'Audit & Analysis', date: 'Jan 8 - Jan 22', completed: true },
      { name: 'Design Guidelines', date: 'Jan 29 - Feb 12', completed: true },
      { name: 'Documentation', date: 'Feb 19 - Feb 26', completed: true },
      { name: 'Delivery', date: 'Feb 28', completed: true },
    ],
    deliverables: [
      { id: 1, name: 'Brand Guidelines PDF', icon: '📘', size: '24 MB' },
      { id: 2, name: 'Color Palette (ASE/Figma)', icon: '🎨', size: '3 MB' },
      { id: 3, name: 'Typography Files', icon: '✍️', size: '8 MB' },
    ],
  },
];

const mockNotifications: Notification[] = [
  { id: 1, title: 'Design System v2.0', message: 'Ready for your review. Please share feedback.', timestamp: '2 hours ago' },
  { id: 2, title: 'Mobile App Redesign', message: 'Approved! Ready for download.', timestamp: '1 day ago' },
];

export default function DashboardPage() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<Record<number, string>>({});
  const [feedbackMode, setFeedbackMode] = useState<Record<number, boolean>>({});
  const [newFeedback, setNewFeedback] = useState<Record<number, string>>({});
  const [projects, setProjects] = useState<Project[]>(mockProjects);

  const toggleExpand = (id: number) => {
    setExpandedProject(expandedProject === id ? null : id);
    setDetailTab((prev) => ({ ...prev, [id]: 'overview' }));
  };

  const toggleFeedback = (id: number) => {
    setFeedbackMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const submitFeedback = (projectId: number) => {
    const feedback = newFeedback[projectId];
    if (!feedback?.trim()) return;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              feedback: [
                { id: p.feedback.length + 1, author: 'You', text: feedback, timestamp: 'just now', type: 'comment' as const },
                ...p.feedback,
              ],
            }
          : p
      )
    );

    setNewFeedback((prev) => ({ ...prev, [projectId]: '' }));
    setFeedbackMode((prev) => ({ ...prev, [projectId]: false }));
  };

  const inProgressCount = projects.filter((p) => p.status === 'in-progress').length;
  const reviewCount = projects.filter((p) => p.status === 'review').length;
  const approvedCount = projects.filter((p) => p.status === 'approved').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;

  const getStatusColor = (status: ProjectStatus): { bg: string; border: string; text: string } => {
    switch (status) {
      case 'completed':
        return { bg: 'rgba(244,67,54,.2)', border: 'rgba(244,67,54,.4)', text: '#f44336' };
      case 'approved':
        return { bg: 'rgba(76,175,80,.2)', border: 'rgba(76,175,80,.4)', text: '#4cb050' };
      case 'review':
        return { bg: 'rgba(255,193,7,.2)', border: 'rgba(255,193,7,.4)', text: '#ffc107' };
      default:
        return { bg: 'rgba(57,255,20,.2)', border: 'rgba(57,255,20,.4)', text: '#39FF14' };
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Rajdhani', sans-serif", color: '#e6e6e6' }}>
      <style>{`
        @keyframes w2slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes w2fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(57,255,20,.15)', background: 'linear-gradient(180deg,rgba(57,255,20,.08),rgba(57,255,20,.02))', padding: '16px 32px', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, fontFamily: "'Orbitron', sans-serif", fontSize: '20px', color: '#39FF14', letterSpacing: '3px', fontWeight: 900 }}>YOUR PROJECTS</h1>
          <div style={{ height: '28px', width: '1px', background: 'linear-gradient(180deg,transparent,rgba(57,255,20,.3),transparent)' }}></div>
          <span style={{ fontSize: '11px', color: '#888' }}>{projects.length} active</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(76,175,80,.1)', border: '1px solid rgba(76,175,80,.2)', borderRadius: '6px', padding: '8px 12px' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <span style={{ fontSize: '11px', color: '#4cb050', fontWeight: 700 }}>{mockNotifications.length} Updates</span>
          </div>
          <button onClick={() => {}} style={{ background: 'rgba(57,255,20,.06)', border: '1px solid rgba(57,255,20,.15)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', cursor: 'pointer' }}>
            👤
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'linear-gradient(135deg,#050505,#0a0a0a)' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          {/* Status Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            <div style={{ background: 'linear-gradient(135deg,rgba(57,255,20,.08),rgba(57,255,20,.02))', border: '1px solid rgba(57,255,20,.15)', borderRadius: '10px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '28px', color: '#39FF14', fontWeight: 900, marginBottom: '4px' }}>{inProgressCount}</div>
              <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>In Progress</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,rgba(255,193,7,.08),rgba(255,193,7,.02))', border: '1px solid rgba(255,193,7,.15)', borderRadius: '10px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.3s', animation: 'w2slideIn 0.7s ease' }}>
              <div style={{ fontSize: '28px', color: '#ffc107', fontWeight: 900, marginBottom: '4px' }}>{reviewCount}</div>
              <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Awaiting Feedback</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,rgba(76,175,80,.08),rgba(76,175,80,.02))', border: '1px solid rgba(76,175,80,.15)', borderRadius: '10px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.3s', animation: 'w2slideIn 0.8s ease' }}>
              <div style={{ fontSize: '28px', color: '#4cb050', fontWeight: 900, marginBottom: '4px' }}>{approvedCount}</div>
              <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Approved</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg,rgba(244,67,54,.08),rgba(244,67,54,.02))', border: '1px solid rgba(244,67,54,.15)', borderRadius: '10px', padding: '16px', textAlign: 'center', backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.3s', animation: 'w2slideIn 0.9s ease' }}>
              <div style={{ fontSize: '28px', color: '#f44336', fontWeight: 900, marginBottom: '4px' }}>{completedCount}</div>
              <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Ready to Download</div>
            </div>
          </div>

          {/* Recent Notifications */}
          {mockNotifications.length > 0 && (
            <div style={{ background: 'linear-gradient(135deg,rgba(76,175,80,.06),rgba(76,175,80,.01))', border: '1px solid rgba(76,175,80,.15)', borderRadius: '12px', padding: '16px', marginBottom: '32px', backdropFilter: 'blur(10px)' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '11px', color: '#4cb050', fontWeight: 700, textTransform: 'uppercase' }}>📢 Recent Updates</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {mockNotifications.slice(0, 3).map((notif) => (
                  <div key={notif.id} style={{ background: 'rgba(76,175,80,.05)', borderLeft: '2px solid rgba(76,175,80,.4)', borderRadius: '6px', padding: '12px', fontSize: '10px' }}>
                    <div style={{ color: '#fff', fontWeight: 700, marginBottom: '2px' }}>{notif.title}</div>
                    <div style={{ color: '#bbb' }}>{notif.message}</div>
                    <div style={{ color: '#666', marginTop: '4px', fontSize: '9px' }}>{notif.timestamp}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects List */}
          <h2 style={{ margin: '0 0 16px', fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Active Projects</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projects.map((project) => (
              <div key={project.id}>
                <div
                  style={{
                    background: 'linear-gradient(135deg,rgba(57,255,20,.06),rgba(57,255,20,.01))',
                    border: expandedProject === project.id ? '1px solid rgba(57,255,20,.4)' : '1px solid rgba(57,255,20,.15)',
                    borderRadius: '12px',
                    padding: '20px',
                    backdropFilter: 'blur(10px)',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    animation: 'w2fadeIn 0.5s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '12px' }} onClick={() => toggleExpand(project.id)}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 700 }}>{project.name}</h2>
                        <div
                          style={{
                            background: getStatusColor(project.status).bg,
                            border: `1px solid ${getStatusColor(project.status).border}`,
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '9px',
                            fontWeight: 700,
                            color: getStatusColor(project.status).text,
                            textTransform: 'uppercase',
                          }}
                        >
                          {project.statusLabel}
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>{project.description}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '24px', color: '#39FF14', fontWeight: 900 }}>{project.progress}%</div>
                      <div style={{ fontSize: '9px', color: '#666' }}>Complete</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ background: 'rgba(57,255,20,.1)', borderRadius: '8px', height: '6px', marginBottom: '12px', overflow: 'hidden' }}>
                    <div style={{ background: 'linear-gradient(90deg,#39FF14,#4cd964)', height: '100%', borderRadius: '8px', width: `${project.progress}%`, transition: 'all 0.3s' }}></div>
                  </div>

                  {/* Quick Info */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#888', marginBottom: '12px' }}>
                    <div>👥 {project.team}</div>
                    <div>📅 Due: {project.dueDate}</div>
                    <div>{project.lastUpdate}</div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleExpand(project.id)}
                      style={{
                        flex: 1,
                        background: 'rgba(57,255,20,.1)',
                        border: '1px solid rgba(57,255,20,.2)',
                        borderRadius: '6px',
                        padding: '8px',
                        fontSize: '10px',
                        color: '#39FF14',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      {expandedProject === project.id ? '▼' : '▶'} {expandedProject === project.id ? 'Hide Details' : 'View Details'}
                    </button>
                    {project.status === 'completed' && (
                      <button
                        onClick={() => alert(`Downloading project #${project.id}...`)}
                        style={{
                          flex: 1,
                          background: 'rgba(244,67,54,.1)',
                          border: '1px solid rgba(244,67,54,.2)',
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '10px',
                          color: '#f44336',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        📥 Download
                      </button>
                    )}
                    {project.status === 'review' && (
                      <button
                        onClick={() => toggleFeedback(project.id)}
                        style={{
                          flex: 1,
                          background: 'rgba(255,193,7,.1)',
                          border: '1px solid rgba(255,193,7,.2)',
                          borderRadius: '6px',
                          padding: '8px',
                          fontSize: '10px',
                          color: '#ffc107',
                          cursor: 'pointer',
                          fontWeight: 700,
                        }}
                      >
                        💬 Send Feedback
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedProject === project.id && (
                  <div style={{ background: 'rgba(57,255,20,.03)', border: '1px solid rgba(57,255,20,.1)', borderRadius: '12px', padding: '20px', marginTop: '-8px', marginBottom: '8px', animation: 'w2slideIn 0.4s ease' }}>
                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(57,255,20,.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                      {['overview', 'timeline', 'feedback', ...(project.status === 'completed' ? ['deliverables'] : [])].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setDetailTab((prev) => ({ ...prev, [project.id]: tab }))}
                          style={{
                            background: detailTab[project.id] === tab ? 'rgba(57,255,20,.15)' : 'transparent',
                            border: 'none',
                            color: detailTab[project.id] === tab ? '#39FF14' : '#888',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: '6px 12px',
                            borderRadius: '4px',
                          }}
                        >
                          {tab === 'feedback' && `Feedback (${project.feedback.length})`}
                          {tab === 'overview' && 'Overview'}
                          {tab === 'timeline' && 'Timeline'}
                          {tab === 'deliverables' && 'Deliverables'}
                        </button>
                      ))}
                    </div>

                    {/* Overview Tab */}
                    {(detailTab[project.id] || 'overview') === 'overview' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Client Manager</div>
                          <div style={{ fontSize: '11px', color: '#fff' }}>{project.manager}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Start Date</div>
                          <div style={{ fontSize: '11px', color: '#fff' }}>{project.startDate}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Due Date</div>
                          <div style={{ fontSize: '11px', color: '#fff' }}>{project.dueDate}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '9px', color: '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>Budget</div>
                          <div style={{ fontSize: '11px', color: '#fff' }}>{project.budget}</div>
                        </div>
                      </div>
                    )}

                    {/* Timeline Tab */}
                    {detailTab[project.id] === 'timeline' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {project.timeline.map((milestone) => (
                          <div key={milestone.name} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: milestone.completed ? '#4cb050' : 'rgba(57,255,20,.2)',
                                border: `2px solid ${milestone.completed ? '#4cb050' : 'rgba(57,255,20,.4)'}`,
                                marginTop: '4px',
                                flexShrink: 0,
                              }}
                            ></div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{milestone.name}</div>
                              <div style={{ fontSize: '9px', color: '#888' }}>{milestone.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Feedback Tab */}
                    {detailTab[project.id] === 'feedback' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                        {project.feedback.map((item) => (
                          <div key={item.id} style={{ background: 'rgba(255,193,7,.05)', borderLeft: '2px solid rgba(255,193,7,.3)', borderRadius: '6px', padding: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <div style={{ fontSize: '10px', fontWeight: 700, color: '#fff' }}>{item.author}</div>
                              <div style={{ fontSize: '8px', color: '#666' }}>{item.timestamp}</div>
                            </div>
                            <div style={{ fontSize: '10px', color: '#bbb' }}>{item.text}</div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <span
                                style={{
                                  background: item.type === 'revision' ? 'rgba(244,67,54,.2)' : 'rgba(255,193,7,.2)',
                                  color: item.type === 'revision' ? '#f44336' : '#ffc107',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '8px',
                                  fontWeight: 700,
                                }}
                              >
                                {item.type}
                              </span>
                            </div>
                          </div>
                        ))}

                        {feedbackMode[project.id] && (
                          <>
                            <textarea
                              placeholder="Share your feedback…"
                              value={newFeedback[project.id] || ''}
                              onChange={(e) => setNewFeedback((prev) => ({ ...prev, [project.id]: e.target.value }))}
                              style={{
                                background: 'rgba(57,255,20,.08)',
                                border: '1px solid rgba(57,255,20,.15)',
                                borderRadius: '6px',
                                padding: '10px',
                                color: '#ddd',
                                fontSize: '10px',
                                fontFamily: "'Rajdhani', sans-serif",
                                minHeight: '60px',
                                resize: 'none',
                                outline: 'none',
                              }}
                            ></textarea>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => submitFeedback(project.id)}
                                style={{
                                  flex: 1,
                                  background: 'rgba(255,193,7,.2)',
                                  border: '1px solid rgba(255,193,7,.3)',
                                  borderRadius: '6px',
                                  padding: '8px',
                                  color: '#ffc107',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  fontWeight: 700,
                                }}
                              >
                                Submit Feedback
                              </button>
                              <button
                                onClick={() => toggleFeedback(project.id)}
                                style={{
                                  background: 'rgba(57,255,20,.1)',
                                  border: '1px solid rgba(57,255,20,.2)',
                                  borderRadius: '6px',
                                  padding: '8px 12px',
                                  color: '#888',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Deliverables Tab */}
                    {detailTab[project.id] === 'deliverables' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {project.deliverables.map((file) => (
                          <div key={file.id} style={{ background: 'rgba(244,67,54,.05)', border: '1px solid rgba(244,67,54,.1)', borderRadius: '6px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <div style={{ fontSize: '18px' }}>{file.icon}</div>
                              <div>
                                <div style={{ fontSize: '10px', color: '#fff', fontWeight: 700 }}>{file.name}</div>
                                <div style={{ fontSize: '9px', color: '#888' }}>{file.size}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => alert(`Downloading file #${file.id}...`)}
                              style={{ background: '#f44336', border: 'none', borderRadius: '6px', padding: '8px 12px', color: '#fff', fontSize: '10px', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ↓ Download
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

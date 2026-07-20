'use client';

import { useState, useMemo } from 'react';

interface GoogleApp {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  connected: boolean;
  status: string;
  dataSize: string;
}

const mockApps: GoogleApp[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    icon: '📧',
    description: 'Email management and messaging',
    features: ['Compose', 'Search', 'Labels', 'Filters'],
    connected: true,
    status: 'Synced 2 min ago',
    dataSize: '2.3 GB',
  },
  {
    id: 'drive',
    name: 'Google Drive',
    icon: '☁️',
    description: 'Cloud storage and file sharing',
    features: ['Upload', 'Share', 'Organize', 'Sync'],
    connected: true,
    status: 'Synced 5 min ago',
    dataSize: '15.7 GB',
  },
  {
    id: 'docs',
    name: 'Google Docs',
    icon: '📝',
    description: 'Document creation and collaboration',
    features: ['Create', 'Edit', 'Comment', 'Export'],
    connected: false,
    status: 'Offline',
    dataSize: '0 B',
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    icon: '📊',
    description: 'Spreadsheet and data analysis',
    features: ['Formulas', 'Charts', 'Pivot Tables', 'Automation'],
    connected: true,
    status: 'Synced 10 min ago',
    dataSize: '892 MB',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: '📅',
    description: 'Event scheduling and management',
    features: ['Events', 'Reminders', 'Sharing', 'Integrations'],
    connected: true,
    status: 'Synced 1 min ago',
    dataSize: '45 MB',
  },
  {
    id: 'tasks',
    name: 'Google Tasks',
    icon: '✓',
    description: 'Task management and productivity',
    features: ['Lists', 'Subtasks', 'Due Dates', 'Priority'],
    connected: false,
    status: 'Offline',
    dataSize: '0 B',
  },
  {
    id: 'contacts',
    name: 'Google Contacts',
    icon: '👥',
    description: 'Contact management and sync',
    features: ['Groups', 'Export', 'Backup', 'Sync'],
    connected: true,
    status: 'Synced 15 min ago',
    dataSize: '23 MB',
  },
  {
    id: 'meet',
    name: 'Google Meet',
    icon: '📹',
    description: 'Video conferencing and meetings',
    features: ['Calls', 'Screen Share', 'Recording', 'Chat'],
    connected: false,
    status: 'Offline',
    dataSize: '0 B',
  },
];

export default function AppsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>(
    mockApps.reduce((acc, app) => ({ ...acc, [app.id]: app.connected }), {})
  );

  const handleConnect = (appId: string) => {
    setConnectedApps((prev) => ({ ...prev, [appId]: !prev[appId] }));
  };

  const removeApp = (appId: string) => {
    setConnectedApps((prev) => ({ ...prev, [appId]: false }));
  };

  const filteredApps = useMemo(() => {
    return mockApps.map((app) => ({
      ...app,
      connected: connectedApps[app.id],
    })).filter((app) => app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.description.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, connectedApps]);

  const activeConnectedApps = Object.entries(connectedApps)
    .filter(([, connected]) => connected)
    .map(([appId]) => mockApps.find((app) => app.id === appId)!)
    .filter(Boolean);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', fontFamily: "'Rajdhani', sans-serif", color: '#e6e6e6' }}>
      <style>{`
        @keyframes w2rise {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: none; }
        }
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: '1px solid #1a1a1a', background: 'linear-gradient(180deg,rgba(57,255,20,.08),transparent)', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontSize: '13px', color: '#39FF14', letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>WISE2</div>
          <div style={{ height: '20px', width: '1px', background: '#2a2a2a' }}></div>
          <div style={{ fontSize: '12px', color: '#bbb' }}>Google Workspace</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services…"
            style={{
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#ddd',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '11px',
              outline: 'none',
              width: '200px',
            }}
          />
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#bbb',
              fontSize: '11px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              fontWeight: 700,
              transition: 'all 0.2s',
            }}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'linear-gradient(135deg,#0a0a0a,#050505)' }}>
        {showSettings ? (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', color: '#fff', fontWeight: 700 }}>Settings</h2>
            <div style={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={syncEnabled}
                  onChange={(e) => setSyncEnabled(e.target.checked)}
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '12px' }}>Auto-sync enabled</div>
                  <div style={{ fontSize: '11px', color: '#888' }}>Sync every 30 seconds</div>
                </div>
              </label>
              <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '12px' }}>Notifications</div>
                    <div style={{ fontSize: '11px', color: '#888' }}>Get alerts for shared docs</div>
                  </div>
                </label>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: '#39FF14',
                  color: '#050505',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '8px',
                  transition: 'filter 0.2s',
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 24px', fontSize: '16px', color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Services</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  style={{
                    textAlign: 'left',
                    background: '#0a0a0a',
                    border: '1px solid #1a1a1a',
                    borderRadius: '10px',
                    padding: '20px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    animation: 'w2rise 0.3s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '40px' }}>{app.icon}</div>
                    <span
                      style={{
                        background: app.connected ? 'rgba(57,255,20,.3)' : 'rgba(255,100,100,.2)',
                        color: app.connected ? '#39FF14' : '#ff6464',
                        fontSize: '9px',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      {app.connected ? 'Connected' : 'Offline'}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#fff', fontWeight: 700 }}>{app.name}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>{app.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {app.features.map((feature) => (
                      <span key={feature} style={{ background: 'rgba(57,255,20,.1)', color: '#39FF14', fontSize: '9px', padding: '3px 8px', borderRadius: '10px' }}>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => handleConnect(app.id)}
                    style={{
                      background: app.connected ? '#1a1a1a' : '#39FF14',
                      color: app.connected ? '#bbb' : '#050505',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: '8px',
                      transition: 'filter 0.2s',
                    }}
                  >
                    {app.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>

            {activeConnectedApps.length > 0 && (
              <>
                <h2 style={{ margin: '40px 0 24px', fontSize: '16px', color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Active Connections</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  {activeConnectedApps.map((app) => (
                    <div key={app.id} style={{ background: '#0a0a0a', border: '1px solid rgba(57,255,20,.2)', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                        <div style={{ fontSize: '32px' }}>{app.icon}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff', fontSize: '13px' }}>{app.name}</div>
                          <div style={{ fontSize: '11px', color: '#888' }}>{app.status}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <span style={{ background: 'rgba(57,255,20,.15)', color: '#39FF14', fontSize: '10px', padding: '6px 10px', borderRadius: '6px', fontWeight: 700 }}>{app.dataSize}</span>
                        <button
                          onClick={() => removeApp(app.id)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #3a1a1a',
                            color: '#ff6464',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            fontWeight: 700,
                            transition: 'all 0.2s',
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';

interface PageGroup {
  name: string;
  description: string;
  pages: Array<{ path: string; label: string; status: 'active' | 'demo' | 'legacy'; description?: string }>;
}

export default function SitemapPage() {
  const pageGroups: PageGroup[] = [
    {
      name: 'Main Applications',
      description: 'Core production apps',
      pages: [
        { path: '/studio', label: 'Creative Studio', status: 'active', description: 'Main app with 7 modules (CC, SL, LV, JL, VL, CF, SH)' },
        { path: '/soundlab', label: 'Sound Lab (Phase 2)', status: 'active', description: 'Professional audio production' },
      ],
    },
    {
      name: 'Demos & Testing',
      description: 'Demo pages for features',
      pages: [
        { path: '/soundlab/demo', label: 'Sound Lab Demo', status: 'demo', description: 'Phase 2.1 integration showcase' },
        { path: '/demo/meters', label: 'Meter Demo', status: 'demo', description: 'Phase 1 meter system' },
        { path: '/meter-demo', label: 'Meter Demo (Legacy)', status: 'legacy', description: 'Old path, use /demo/meters' },
      ],
    },
    {
      name: 'Support Pages',
      description: 'Account & shop',
      pages: [
        { path: '/auth', label: 'Authentication', status: 'active', description: 'Login & signup' },
        { path: '/dashboard', label: 'Dashboard', status: 'active', description: 'User dashboard' },
        { path: '/pricing', label: 'Pricing', status: 'active', description: 'Pricing information' },
        { path: '/shop', label: 'Shop', status: 'active', description: 'Purchase credits' },
      ],
    },
    {
      name: '⚠️ Deprecated Pages (Remove)',
      description: 'These pages should be removed',
      pages: [
        { path: '/creative-studio', label: 'Creative Studio (Old)', status: 'legacy', description: 'Use /studio instead' },
        { path: '/live-studio', label: 'Live Studio (Old)', status: 'legacy', description: 'Now LV module at /studio' },
        { path: '/live-streaming', label: 'Live Streaming', status: 'legacy', description: 'Deprecated' },
        { path: '/jingle-lab', label: 'Jingle Lab (Old)', status: 'legacy', description: 'Now JL module at /studio' },
        { path: '/voice-lab', label: 'Voice Lab (Old)', status: 'legacy', description: 'Now VL module at /studio' },
        { path: '/content-factory', label: 'Content Factory (Old)', status: 'legacy', description: 'Now CF module at /studio' },
        { path: '/showcase', label: 'Client Showcase (Old)', status: 'legacy', description: 'Now SH module at /studio' },
        { path: '/apps', label: 'Apps Page', status: 'legacy', description: 'Unclear purpose - review' },
        { path: '/webstore', label: 'Webstore', status: 'legacy', description: 'Consolidate with /shop' },
        { path: '/workspace', label: 'Workspace', status: 'legacy', description: 'Unclear purpose - review' },
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#22c55e'; // green
      case 'demo':
        return '#0ea5e9'; // blue
      case 'legacy':
        return '#ef4444'; // red
      default:
        return '#888';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '✓ Active';
      case 'demo':
        return '🧪 Demo';
      case 'legacy':
        return '⚠️ Legacy';
      default:
        return '?';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: '"Rajdhani", sans-serif',
        padding: '40px 20px',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#39FF14' }}>WISE² Studio Sitemap</h1>
          <p style={{ color: '#888', margin: '0 0 20px 0' }}>All pages and modules organized</p>
          <Link
            href="/studio"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: '#39FF14',
              color: '#000',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            ← Back to Studio
          </Link>
        </div>

        {/* Page Groups */}
        {pageGroups.map((group) => (
          <div key={group.name} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#39FF14', marginBottom: '5px' }}>{group.name}</h2>
            <p style={{ color: '#666', fontSize: '12px', marginBottom: '15px' }}>{group.description}</p>

            <div
              style={{
                display: 'grid',
                gap: '8px',
              }}
            >
              {group.pages.map((page) => (
                <div
                  key={page.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(57, 255, 20, 0.05)',
                    border: `1px solid rgba(57, 255, 20, 0.1)`,
                    borderRadius: '6px',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Link
                      href={page.path}
                      style={{
                        color: '#39FF14',
                        textDecoration: 'none',
                        fontWeight: 600,
                        marginRight: '10px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {page.label}
                    </Link>
                    <code style={{ color: '#666', fontSize: '11px', marginRight: '15px' }}>
                      {page.path}
                    </code>
                    {page.description && (
                      <p style={{ color: '#888', fontSize: '12px', margin: '5px 0 0 0' }}>
                        {page.description}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 8px',
                      background: `${getStatusColor(page.status)}20`,
                      color: getStatusColor(page.status),
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getStatusLabel(page.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Summary */}
        <div
          style={{
            marginTop: '40px',
            padding: '20px',
            background: 'rgba(57, 255, 20, 0.05)',
            border: '1px solid rgba(57, 255, 20, 0.2)',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', color: '#39FF14' }}>✅ Page Organization</h3>
          <ul style={{ margin: '0', paddingLeft: '20px', color: '#888', fontSize: '13px', lineHeight: '1.8' }}>
            <li>Root (/) now redirects to /studio</li>
            <li>All 7 Creative Studio modules work via Zustand state management</li>
            <li>Sound Lab is properly organized at /soundlab with demo</li>
            <li>Demo pages organized under /demo/ prefix</li>
            <li>Legacy/deprecated pages listed for removal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { CommandCenterLayout, KPICard, Chart, Table, Modal, showToast, type TableColumn } from './index';
import {
  Activity,
  Zap,
  Users,
  TrendingUp,
  Database,
  AlertTriangle,
  BarChart3,
  Clock,
} from 'lucide-react';

interface SampleDataRow {
  id: number;
  name: string;
  status: 'active' | 'pending' | 'completed';
  value: number;
  timestamp: string;
}

const sampleData: SampleDataRow[] = [
  { id: 1, name: 'Process Alpha', status: 'active', value: 847, timestamp: '2 mins ago' },
  { id: 2, name: 'System Backup', status: 'completed', value: 2340, timestamp: '15 mins ago' },
  { id: 3, name: 'API Sync', status: 'active', value: 1200, timestamp: '5 mins ago' },
  { id: 4, name: 'Data Validation', status: 'pending', value: 450, timestamp: '32 mins ago' },
  { id: 5, name: 'Cache Clear', status: 'completed', value: 890, timestamp: '1 hour ago' },
];

const chartData = Array.from({ length: 24 }, (_, i) => ({
  x: `${i}:00`,
  y: Math.floor(Math.random() * 100) + 30,
}));

const tableColumns: TableColumn<SampleDataRow>[] = [
  { key: 'name', label: 'Process Name', sortable: true },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'active'
            ? 'bg-green-500/20 text-green-400'
            : value === 'pending'
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-cyan-500/20 text-cyan-400'
        }`}
      >
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </span>
    ),
  },
  { key: 'value', label: 'Data Points', sortable: true },
  { key: 'timestamp', label: 'Last Updated' },
];

export function CommandCenterDemoPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<SampleDataRow[]>([]);

  const handleShowToast = (type: 'success' | 'error' | 'warning' | 'info' | 'loading') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'An error occurred. Please try again.',
      warning: 'This action requires confirmation.',
      info: 'Here is some important information.',
      loading: 'Processing your request...',
    };
    showToast(messages[type], type, type === 'loading' ? 0 : 4000);
  };

  return (
    <CommandCenterLayout>
      <div className="space-y-8">
        {/* Hero section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">
            WISE² Command Center
          </h1>
          <p className="text-lg text-gray-400">
            4K Maximum Impact Dashboard — Production-ready components with glassmorphism, neon accents, and micro-interactions
          </p>
        </div>

        {/* KPI Grid */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard
              title="Active Operations"
              value="2,847"
              unit="ops/min"
              trend={{ value: 12, direction: 'up' }}
              status="success"
              icon={<Activity size={24} />}
              sparkline={[45, 52, 48, 61, 55, 67, 72]}
              onClick={() => showToast('Opened Active Operations dashboard', 'info')}
            />
            <KPICard
              title="System Energy"
              value="87"
              unit="%"
              trend={{ value: 5, direction: 'down' }}
              status="info"
              icon={<Zap size={24} />}
              sparkline={[85, 87, 86, 88, 85, 87, 89]}
            />
            <KPICard
              title="User Sessions"
              value="1,234"
              trend={{ value: 8, direction: 'up' }}
              status="success"
              icon={<Users size={24} />}
              sparkline={[60, 65, 70, 75, 78, 82, 85]}
            />
            <KPICard
              title="Data Pipeline"
              value="847.3"
              unit="GB/hr"
              trend={{ value: 3, direction: 'down' }}
              status="warning"
              icon={<Database size={24} />}
              sparkline={[72, 75, 73, 76, 74, 72, 70]}
            />
          </div>
        </div>

        {/* Charts section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart title="System Load (24h)" data={chartData} color="#00D9FF" />
          <Chart
            title="API Response Time"
            data={chartData.map((d) => ({ ...d, y: d.y + 20 }))}
            color="#00FF7F"
          />
        </div>

        {/* Table section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Operations Log</h2>
          <Table<SampleDataRow>
            title="Recent Processes"
            columns={tableColumns}
            data={sampleData}
            selectable
            onSelectionChange={setSelectedRows}
            onRowClick={(row) => showToast(`Selected: ${row.name}`, 'info')}
          />
        </div>

        {/* Demo actions */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Interactive Components</h2>
          <div className="glass-medium rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Test Toast Notifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <button
                onClick={() => handleShowToast('success')}
                className="btn-primary text-sm"
              >
                Success
              </button>
              <button
                onClick={() => handleShowToast('error')}
                className="btn-primary text-sm"
                style={{ background: '#ef4444' }}
              >
                Error
              </button>
              <button
                onClick={() => handleShowToast('warning')}
                className="btn-primary text-sm"
                style={{ background: '#f59e0b', color: '#000' }}
              >
                Warning
              </button>
              <button
                onClick={() => handleShowToast('info')}
                className="btn-primary text-sm"
              >
                Info
              </button>
              <button
                onClick={() => handleShowToast('loading')}
                className="btn-primary text-sm"
              >
                Loading
              </button>
            </div>
          </div>

          <div className="glass-medium rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">Test Modal</h3>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary"
            >
              Open Modal Dialog
            </button>
          </div>
        </div>

        {/* Features section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Design Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Glassmorphism',
                description: 'Frosted glass effect with backdrop blur and layered transparency',
                icon: '🔮',
              },
              {
                title: 'Neon Accents',
                description: 'Cyan, green, and gold with glow effects for active states',
                icon: '✨',
              },
              {
                title: 'Micro-interactions',
                description: 'Smooth animations for hover, click, and loading states',
                icon: '⚡',
              },
              {
                title: 'Responsive Design',
                description: 'Mobile-first approach with tablet and desktop optimizations',
                icon: '📱',
              },
              {
                title: 'Dark Theme',
                description: 'Navy background with cyan gridlines for maximum readability',
                icon: '🌙',
              },
              {
                title: 'Production Ready',
                description: 'Type-safe React with Tailwind CSS and GSAP animations',
                icon: '🚀',
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-light rounded-lg p-4 space-y-2">
                <div className="text-3xl">{feature.icon}</div>
                <h4 className="font-semibold text-white">{feature.title}</h4>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal demo */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Command Center Demo Modal"
        size="lg"
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setModalOpen(false);
              showToast('Modal closed', 'info');
            },
            variant: 'secondary',
          },
          {
            label: 'Confirm Action',
            onClick: () => {
              setModalOpen(false);
              showToast('Action confirmed!', 'success');
            },
            variant: 'primary',
          },
        ]}
      >
        <div className="space-y-4">
          <p className="text-white">
            This is a production-ready modal with glassmorphic design, backdrop blur, and smooth animations.
          </p>
          <div className="glass-light rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-white">Selected Rows</h4>
            {selectedRows.length > 0 ? (
              <div className="space-y-2">
                {selectedRows.map((row) => (
                  <div key={row.id} className="text-sm text-gray-400">
                    • {row.name} ({row.status})
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No rows selected in the table above</p>
            )}
          </div>
        </div>
      </Modal>
    </CommandCenterLayout>
  );
}

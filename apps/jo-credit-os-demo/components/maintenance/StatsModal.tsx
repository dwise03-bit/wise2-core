'use client';

interface StatsModalProps {
  stats: any;
  onClose: () => void;
}

export default function StatsModal({ stats, onClose }: StatsModalProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0a0a0a',
          border: '1px solid #262626',
          borderRadius: '8px',
          padding: '28px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 20px 60px rgba(0,0,0,.9)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{
            margin: 0,
            fontFamily: '"Orbitron", sans-serif',
            fontSize: '20px',
            fontWeight: 700,
            color: '#39FF14'
          }}>
            Statistics
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatCard
            icon="📋"
            label="Total Tasks"
            value={stats.totalTasks || 0}
          />
          <StatCard
            icon="✅"
            label="Completed This Month"
            value={`${stats.completedThisMonth || 0} (${stats.successRate || 0}%)`}
          />
          <StatCard
            icon="⏳"
            label="Pending"
            value={stats.pending || 0}
          />
          <StatCard
            icon="🔄"
            label="In Progress"
            value={stats.inProgress || 0}
          />
          <StatCard
            icon="🔴"
            label="Overdue"
            value={stats.overdue || 0}
          />
          <StatCard
            icon="⏱️"
            label="Avg Duration"
            value={`${stats.avgDuration || 0} min`}
          />
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '10px',
            background: 'rgba(57,255,20,.15)',
            border: '1px solid #39FF14',
            color: '#39FF14',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: '"Rajdhani", sans-serif',
            fontWeight: 600
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#060606',
        border: '1px solid #1f1f1f',
        borderRadius: '6px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px' }}>{icon}</span>
        <span style={{ fontSize: '13px', color: '#888' }}>{label}</span>
      </div>
      <span style={{ fontSize: '16px', fontWeight: 700, color: '#39FF14' }}>
        {value}
      </span>
    </div>
  );
}

'use client';

interface StatusBadgeProps {
  status: 'scheduled' | 'in-progress' | 'complete' | 'overdue' | 'failed';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    complete: { icon: '✅', label: 'Complete', color: '#00ff00', bg: 'rgba(0, 255, 0, 0.1)' },
    'in-progress': { icon: '🔄', label: 'In Progress', color: '#0099ff', bg: 'rgba(0, 153, 255, 0.1)' },
    scheduled: { icon: '⏳', label: 'Scheduled', color: '#999999', bg: 'rgba(153, 153, 153, 0.1)' },
    overdue: { icon: '🔴', label: 'Overdue', color: '#ff0000', bg: 'rgba(255, 0, 0, 0.1)' },
    failed: { icon: '❌', label: 'Failed', color: '#ff6600', bg: 'rgba(255, 102, 0, 0.1)' },
  };

  const config = statusConfig[status];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      background: config.bg,
      border: `1px solid ${config.color}`,
      borderRadius: '4px',
      fontSize: '11px',
      fontWeight: 600,
      color: config.color,
      whiteSpace: 'nowrap'
    }}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </div>
  );
}

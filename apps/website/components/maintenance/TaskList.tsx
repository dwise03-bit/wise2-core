'use client';

import StatusBadge from './StatusBadge';

interface TaskListProps {
  tasks: any[];
  onSelectTask: (task: any) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskList({ tasks, onSelectTask, onCompleteTask, onDeleteTask }: TaskListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      background: '#0a0a0a',
      border: '1px solid #262626',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 150px 120px 80px',
        gap: '16px',
        padding: '12px 16px',
        background: '#0f0f0f',
        borderBottom: '1px solid #1f1f1f',
        fontWeight: 600,
        fontSize: '12px',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <div>Time</div>
        <div>Task</div>
        <div>Recurrence</div>
        <div>Status</div>
        <div>Actions</div>
      </div>

      {/* Rows */}
      {sortedTasks.length > 0 ? (
        sortedTasks.map(task => (
          <div
            key={task.id}
            onClick={() => onSelectTask(task)}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 150px 120px 80px',
              gap: '16px',
              padding: '12px 16px',
              background: '#060606',
              borderBottom: '1px solid #1f1f1f',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = '#0a0a0a';
              el.style.borderBottomColor = '#39FF14';
              el.style.boxShadow = '0 0 12px rgba(57,255,20,.1)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.background = '#060606';
              el.style.borderBottomColor = '#1f1f1f';
              el.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600 }}>
              {new Date(task.dateTime).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontWeight: 600, color: '#e6e6e6' }}>
                {task.title}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                {task.description}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#888', textTransform: 'capitalize' }}>
              {task.recurrence}
            </div>
            <StatusBadge status={task.status} />
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                gap: '6px',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => onCompleteTask(task.id)}
                style={{
                  padding: '4px 8px',
                  background: '#0d0d0d',
                  border: '1px solid #333',
                  color: '#888',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: '"Rajdhani", sans-serif'
                }}
              >
                ✓
              </button>
              <button
                onClick={() => onDeleteTask(task.id)}
                style={{
                  padding: '4px 8px',
                  background: '#0d0d0d',
                  border: '1px solid #333',
                  color: '#888',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontFamily: '"Rajdhani", sans-serif'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        ))
      ) : (
        <div style={{
          padding: '40px 16px',
          textAlign: 'center',
          color: '#888'
        }}>
          No tasks found
        </div>
      )}
    </div>
  );
}

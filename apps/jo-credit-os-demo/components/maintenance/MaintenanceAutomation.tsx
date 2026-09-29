'use client';

import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import TaskList from './TaskList';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailsModal from './TaskDetailsModal';
import StatsModal from './StatsModal';
import { useMaintenance } from '@/lib/maintenance';

export default function MaintenanceAutomation() {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { tasks, stats, createTask, completeTask, deleteTask, rescheduleTask, updateTask } = useMaintenance();

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTask = (taskData: any) => {
    createTask({
      id: `task-${Date.now()}`,
      ...taskData,
      createdAt: new Date(),
    });
    setShowCreateModal(false);
  };

  const handleSelectTask = (task: any) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      completeTask(selectedTask.id);
      setShowDetailsModal(false);
      setSelectedTask(null);
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setShowDetailsModal(false);
      setSelectedTask(null);
    }
  };

  const handleRescheduleTask = (newDateTime: Date) => {
    if (selectedTask) {
      rescheduleTask(selectedTask.id, newDateTime);
      setShowDetailsModal(false);
      setSelectedTask(null);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: '#050505',
      color: '#e6e6e6',
      fontFamily: '"Rajdhani", sans-serif',
      fontSize: '15px',
      overflow: 'hidden'
    }}>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; background: #050505; }
        @keyframes w2pulse { 0%, 100% { box-shadow: 0 0 6px rgba(57,255,20,.35); } 50% { box-shadow: 0 0 18px rgba(57,255,20,.7); } }
        @keyframes w2blink { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
        @keyframes w2rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .status-complete { color: #00ff00; background: rgba(0, 255, 0, 0.1); }
        .status-in-progress { color: #0099ff; background: rgba(0, 153, 255, 0.1); }
        .status-pending { color: #999999; background: rgba(153, 153, 153, 0.1); }
        .status-overdue { color: #ff0000; background: rgba(255, 0, 0, 0.1); }
      `}</style>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '72px',
        padding: '0 28px',
        background: 'linear-gradient(180deg,#111,#0a0a0a)',
        borderBottom: '1px solid #262626'
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: 900,
            fontSize: '28px',
            letterSpacing: '1px',
            background: 'linear-gradient(180deg,#fff 25%,#6f6f6f)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase'
          }}>
            Maintenance Automation
          </h1>
          <p style={{
            margin: '4px 0 0 0',
            fontSize: '12px',
            color: '#888',
            letterSpacing: '0.5px'
          }}>
            Schedule and manage system maintenance tasks
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '6px', background: '#0d0d0d', border: '1px solid #262626', borderRadius: '6px', padding: '4px' }}>
            {(['month', 'week', 'list'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: viewMode === mode ? '1px solid #39FF14' : '1px solid transparent',
                  background: viewMode === mode ? 'rgba(57,255,20,.1)' : 'transparent',
                  color: viewMode === mode ? '#39FF14' : '#888',
                  cursor: 'pointer',
                  fontFamily: '"Rajdhani", sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '8px 12px',
              background: '#0d0d0d',
              border: '1px solid #262626',
              borderRadius: '6px',
              color: '#e6e6e6',
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: '13px',
              width: '200px'
            }}
          />

          {/* Quick Actions */}
          <button
            onClick={() => setShowStatsModal(true)}
            style={{
              padding: '8px 12px',
              background: '#0d0d0d',
              border: '1px solid #262626',
              borderRadius: '6px',
              color: '#888',
              cursor: 'pointer',
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: '13px'
            }}
          >
            📊 Stats
          </button>

          {/* Create Task */}
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '8px 14px',
              background: 'rgba(57,255,20,.1)',
              border: '1px solid rgba(57,255,20,.35)',
              borderRadius: '6px',
              color: '#39FF14',
              cursor: 'pointer',
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: '13px',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}
          >
            + New Task
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px' }}>
        {viewMode === 'month' && (
          <Calendar
            tasks={filteredTasks}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSelectTask={handleSelectTask}
            onCreateTask={() => setShowCreateModal(true)}
          />
        )}

        {viewMode === 'week' && (
          <div style={{ color: '#888', padding: '40px', textAlign: 'center' }}>
            Week view coming soon...
          </div>
        )}

        {viewMode === 'list' && (
          <TaskList
            tasks={filteredTasks}
            onSelectTask={handleSelectTask}
            onCompleteTask={completeTask}
            onDeleteTask={deleteTask}
          />
        )}
      </div>

      {/* MODALS */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
          initialDate={selectedDate}
        />
      )}

      {showDetailsModal && selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setShowDetailsModal(false)}
          onComplete={handleCompleteTask}
          onDelete={handleDeleteTask}
          onReschedule={handleRescheduleTask}
          onUpdate={updateTask}
        />
      )}

      {showStatsModal && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  );
}

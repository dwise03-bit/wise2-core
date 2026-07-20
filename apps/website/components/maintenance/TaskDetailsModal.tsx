'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';

interface TaskDetailsModalProps {
  task: any;
  onClose: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onReschedule: (date: Date) => void;
  onUpdate: (task: any) => void;
}

export default function TaskDetailsModal({
  task,
  onClose,
  onComplete,
  onDelete,
  onReschedule,
  onUpdate
}: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const taskDate = new Date(task.dateTime);
  const nextRun = new Date(task.nextRunAt || task.dateTime);

  const handleSave = () => {
    onUpdate(editedTask);
    setIsEditing(false);
  };

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
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,.9)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2 style={{
              margin: '0 0 8px 0',
              fontFamily: '"Orbitron", sans-serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#e6e6e6'
            }}>
              {editedTask.title}
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              Status: {editedTask.status}
            </p>
          </div>
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

        {/* Status */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <StatusBadge status={editedTask.status} />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onComplete}
              style={{
                padding: '6px 12px',
                background: 'rgba(0,255,0,.1)',
                border: '1px solid rgba(0,255,0,.3)',
                color: '#00ff00',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              ✓ Mark Complete
            </button>
            <button
              onClick={onDelete}
              style={{
                padding: '6px 12px',
                background: 'rgba(255,0,0,.1)',
                border: '1px solid rgba(255,0,0,.3)',
                color: '#ff0000',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Description */}
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#888',
              textTransform: 'uppercase'
            }}>
              Description
            </h3>
            {isEditing ? (
              <textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0d0d0d',
                  border: '1px solid #262626',
                  borderRadius: '6px',
                  color: '#e6e6e6',
                  fontFamily: '"Rajdhani", sans-serif',
                  fontSize: '13px',
                  resize: 'none'
                }}
              />
            ) : (
              <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>
                {editedTask.description}
              </p>
            )}
          </div>

          {/* Scheduling */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#888',
                textTransform: 'uppercase'
              }}>
                Scheduled
              </h3>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#e6e6e6',
                fontWeight: 600
              }}>
                {taskDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: '#e6e6e6',
                fontWeight: 600
              }}>
                {taskDate.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#888',
                textTransform: 'uppercase'
              }}>
                Next Run
              </h3>
              <p style={{
                margin: 0,
                fontSize: '13px',
                color: '#39FF14'
              }}>
                {nextRun.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: '#39FF14'
              }}>
                {nextRun.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#888',
              textTransform: 'uppercase'
            }}>
              Duration
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>
              {editedTask.estimatedDurationMinutes} minutes
            </p>
          </div>

          {/* Recurrence */}
          <div>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#888',
              textTransform: 'uppercase'
            }}>
              Recurrence
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#aaa', textTransform: 'capitalize' }}>
              {editedTask.recurrence}
            </p>
          </div>

          {/* Assignment */}
          {editedTask.assignedTo && (
            <div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#888',
                textTransform: 'uppercase'
              }}>
                Assigned To
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#aaa' }}>
                {editedTask.assignedTo}
              </p>
            </div>
          )}

          {/* History */}
          {editedTask.history && editedTask.history.length > 0 && (
            <div>
              <h3 style={{
                margin: '0 0 12px 0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#888',
                textTransform: 'uppercase'
              }}>
                History
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {editedTask.history.slice(0, 5).map((entry: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#060606',
                      border: '1px solid #1f1f1f',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <span style={{ color: '#aaa' }}>
                      {new Date(entry.date).toLocaleDateString()}
                    </span>
                    <span style={{ color: '#39FF14', fontWeight: 600 }}>
                      {entry.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid #1f1f1f' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px',
              background: '#0d0d0d',
              border: '1px solid #262626',
              color: '#888',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: '"Rajdhani", sans-serif',
              fontWeight: 600
            }}
          >
            Close
          </button>
          {isEditing && (
            <button
              onClick={handleSave}
              style={{
                flex: 1,
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
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

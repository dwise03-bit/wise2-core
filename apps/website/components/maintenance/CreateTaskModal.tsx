'use client';

import { useState } from 'react';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreate: (task: any) => void;
  initialDate?: Date;
}

export default function CreateTaskModal({ onClose, onCreate, initialDate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(initialDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState('30');
  const [recurrence, setRecurrence] = useState<'once' | 'daily' | 'weekly' | 'monthly' | 'custom'>('once');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [assignee, setAssignee] = useState('');
  const [notifyBefore, setNotifyBefore] = useState(true);
  const [notifyOnStart, setNotifyOnStart] = useState(true);
  const [notifyOnComplete, setNotifyOnComplete] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dateTime = new Date(`${date}T${time}`);

    onCreate({
      title,
      description,
      dateTime,
      estimatedDurationMinutes: parseInt(duration),
      status: 'scheduled',
      recurrence,
      recurrencePattern: recurrence === 'weekly' ? { daysOfWeek: recurrenceDays } : undefined,
      assignedTo: assignee || undefined,
      notifyBefore: notifyBefore ? 15 : undefined,
      notifyOnStart,
      notifyOnComplete,
      createdAt: new Date(),
    });
  };

  const days = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
  ];

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
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,.9)'
        }}
      >
        <h2 style={{
          margin: '0 0 20px 0',
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '20px',
          fontWeight: 700,
          color: '#39FF14'
        }}>
          New Maintenance Task
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>
              Task Name *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Database Backup"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0d0d0d',
                border: '1px solid #262626',
                borderRadius: '6px',
                color: '#e6e6e6',
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task details..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0d0d0d',
                border: '1px solid #262626',
                borderRadius: '6px',
                color: '#e6e6e6',
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: '14px',
                resize: 'none'
              }}
            />
          </div>

          {/* Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0d0d0d',
                  border: '1px solid #262626',
                  borderRadius: '6px',
                  color: '#e6e6e6',
                  fontFamily: '"Rajdhani", sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>
                Time *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: '#0d0d0d',
                  border: '1px solid #262626',
                  borderRadius: '6px',
                  color: '#e6e6e6',
                  fontFamily: '"Rajdhani", sans-serif',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0d0d0d',
                border: '1px solid #262626',
                borderRadius: '6px',
                color: '#e6e6e6',
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Recurrence */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
              Recurrence Pattern
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['once', 'daily', 'weekly', 'monthly'] as const).map(type => (
                <label
                  key={type}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    background: recurrence === type ? 'rgba(57,255,20,.15)' : '#0d0d0d',
                    border: `1px solid ${recurrence === type ? '#39FF14' : '#262626'}`,
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: recurrence === type ? '#39FF14' : '#888'
                  }}
                >
                  <input
                    type="radio"
                    name="recurrence"
                    value={type}
                    checked={recurrence === type}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Weekly Days */}
          {recurrence === 'weekly' && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                Days of Week
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {days.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      if (recurrenceDays.includes(day.value)) {
                        setRecurrenceDays(recurrenceDays.filter(d => d !== day.value));
                      } else {
                        setRecurrenceDays([...recurrenceDays, day.value]);
                      }
                    }}
                    style={{
                      padding: '6px 10px',
                      background: recurrenceDays.includes(day.value) ? 'rgba(57,255,20,.15)' : '#0d0d0d',
                      border: `1px solid ${recurrenceDays.includes(day.value) ? '#39FF14' : '#262626'}`,
                      borderRadius: '4px',
                      color: recurrenceDays.includes(day.value) ? '#39FF14' : '#888',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignee */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '6px', textTransform: 'uppercase' }}>
              Assign To
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: '#0d0d0d',
                border: '1px solid #262626',
                borderRadius: '6px',
                color: '#e6e6e6',
                fontFamily: '"Rajdhani", sans-serif',
                fontSize: '14px'
              }}
            >
              <option value="">— No one —</option>
              <option value="dwise">@dwise</option>
              <option value="dev">@dev</option>
              <option value="ops">@ops</option>
            </select>
          </div>

          {/* Notifications */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
              Notifications
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyBefore}
                  onChange={(e) => setNotifyBefore(e.target.checked)}
                />
                <span style={{ fontSize: '13px', color: '#aaa' }}>Notify 15 minutes before</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyOnStart}
                  onChange={(e) => setNotifyOnStart(e.target.checked)}
                />
                <span style={{ fontSize: '13px', color: '#aaa' }}>Notify on start</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyOnComplete}
                  onChange={(e) => setNotifyOnComplete(e.target.checked)}
                />
                <span style={{ fontSize: '13px', color: '#aaa' }}>Notify on completion</span>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '12px' }}>
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
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(57,255,20,.15)',
                border: '1px solid #39FF14',
                color: '#39FF14',
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: '"Rajdhani", sans-serif',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

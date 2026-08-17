'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';

interface CalendarProps {
  tasks: any[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onSelectTask: (task: any) => void;
  onCreateTask: () => void;
}

export default function Calendar({ tasks, selectedDate, onSelectDate, onSelectTask, onCreateTask }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dateTime);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => null);
  const allDays = [...emptyDays, ...monthDays];
  const weeks = Array.from({ length: Math.ceil(allDays.length / 7) }, (_, i) =>
    allDays.slice(i * 7, (i + 1) * 7)
  );

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
  const isCurrentMonth = currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Month Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: '#0a0a0a',
        border: '1px solid #262626',
        borderRadius: '8px'
      }}>
        <button
          onClick={handlePrevMonth}
          style={{
            padding: '6px 12px',
            background: '#0d0d0d',
            border: '1px solid #333',
            color: '#888',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: '"Rajdhani", sans-serif'
          }}
        >
          ← Prev
        </button>
        <h2 style={{
          margin: 0,
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '18px',
          fontWeight: 700,
          color: '#fff'
        }}>
          {monthName}
        </h2>
        <button
          onClick={handleNextMonth}
          style={{
            padding: '6px 12px',
            background: '#0d0d0d',
            border: '1px solid #333',
            color: '#888',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: '"Rajdhani", sans-serif'
          }}
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '8px',
        background: '#0a0a0a',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #262626'
      }}>
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              padding: '12px 8px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#888',
              textTransform: 'uppercase',
              borderBottom: '1px solid #1a1a1a'
            }}
          >
            {day}
          </div>
        ))}

        {/* Day Cells */}
        {weeks.map((week, weekIdx) =>
          week.map((day, dayIdx) => {
            const date = day ? new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) : null;
            const dayTasks = date ? getTasksForDate(date) : [];
            const isSelected = date?.toDateString() === selectedDate.toDateString();
            const isToday = date?.toDateString() === new Date().toDateString();

            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                onClick={() => date && onSelectDate(date)}
                style={{
                  minHeight: '120px',
                  padding: '8px',
                  background: isSelected
                    ? 'rgba(57,255,20,.15)'
                    : isToday
                    ? 'rgba(57,255,20,.05)'
                    : '#060606',
                  border: isSelected
                    ? '2px solid #39FF14'
                    : '#1f1f1f solid 1px',
                  borderRadius: '6px',
                  cursor: date ? 'pointer' : 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  opacity: day ? 1 : 0.3
                }}
                onMouseEnter={(e) => {
                  if (day) {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = '#39FF14';
                    el.style.boxShadow = '0 0 12px rgba(57,255,20,.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (day) {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = isSelected ? '#39FF14' : '#1f1f1f';
                    el.style.boxShadow = 'none';
                  }
                }}
              >
                {day && (
                  <>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isSelected ? '#39FF14' : isToday ? '#39FF14' : '#e6e6e6'
                    }}>
                      {day}
                    </div>

                    {/* Task Count */}
                    {dayTasks.length > 0 && (
                      <div style={{ fontSize: '11px', color: '#888' }}>
                        {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                      </div>
                    )}

                    {/* Show up to 2 task previews */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minHeight: 0 }}>
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTask(task);
                          }}
                          style={{
                            padding: '4px 6px',
                            background: 'rgba(57,255,20,.08)',
                            border: '1px solid rgba(57,255,20,.2)',
                            borderRadius: '3px',
                            fontSize: '10px',
                            color: '#aaa',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.background = 'rgba(57,255,20,.15)';
                            el.style.color = '#39FF14';
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget as HTMLDivElement;
                            el.style.background = 'rgba(57,255,20,.08)';
                            el.style.color = '#aaa';
                          }}
                        >
                          {task.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Selected Date Tasks */}
      <div style={{
        background: '#0a0a0a',
        border: '1px solid #262626',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontFamily: '"Orbitron", sans-serif',
          fontSize: '14px',
          fontWeight: 700,
          color: '#39FF14'
        }}>
          {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h3>

        {getTasksForDate(selectedDate).length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {getTasksForDate(selectedDate).map(task => (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  background: '#060606',
                  border: '1px solid #1f1f1f',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = '#39FF14';
                  el.style.boxShadow = '0 0 12px rgba(57,255,20,.15)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.borderColor = '#1f1f1f';
                  el.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#e6e6e6' }}>
                    {new Date(task.dateTime).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })} — {task.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    {task.description}
                  </div>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        ) : (
          <button
            onClick={onCreateTask}
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(57,255,20,.1)',
              border: '1px dashed rgba(57,255,20,.3)',
              color: '#39FF14',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: '"Rajdhani", sans-serif',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            + Create task for this date
          </button>
        )}
      </div>
    </div>
  );
}

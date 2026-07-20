'use client';

import { useState, useCallback, useEffect } from 'react';

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
  estimatedDurationMinutes: number;
  status: 'scheduled' | 'in-progress' | 'complete' | 'overdue' | 'failed';
  recurrence: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrencePattern?: {
    daysOfWeek?: number[];
    interval?: number;
    endDate?: Date;
  };
  assignedTo?: string;
  notifyBefore?: number;
  notifyOnStart?: boolean;
  notifyOnComplete?: boolean;
  createdAt: Date;
  nextRunAt?: Date;
  history?: { date: Date; status: string; duration?: number }[];
}

export interface MaintenanceStats {
  totalTasks: number;
  completedThisMonth: number;
  overdue: number;
  inProgress: number;
  pending: number;
  successRate: number;
  avgDuration: number;
}

const MOCK_TASKS: MaintenanceTask[] = [
  {
    id: '1',
    title: 'Database Backup',
    description: 'Run full DB backup & verify integrity',
    dateTime: new Date(new Date().setHours(14, 0, 0, 0)),
    estimatedDurationMinutes: 30,
    status: 'complete',
    recurrence: 'daily',
    assignedTo: 'ops-team',
    notifyBefore: 15,
    notifyOnStart: true,
    notifyOnComplete: true,
    createdAt: new Date(),
    history: [
      { date: new Date(Date.now() - 86400000), status: 'complete', duration: 28 },
      { date: new Date(Date.now() - 172800000), status: 'complete', duration: 29 },
    ]
  },
  {
    id: '2',
    title: 'Server Health Check',
    description: 'CPU, memory, disk, network status',
    dateTime: new Date(new Date().setHours(9, 0, 0, 0)),
    estimatedDurationMinutes: 10,
    status: 'in-progress',
    recurrence: 'daily',
    assignedTo: 'dev-team',
    notifyBefore: 5,
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'API Performance Audit',
    description: 'Review slow endpoints, optimize queries',
    dateTime: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 10, 10, 0, 0),
    estimatedDurationMinutes: 120,
    status: 'overdue',
    recurrence: 'monthly',
    assignedTo: 'dev-team',
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Cache Clear',
    description: 'Clear Redis cache and warm up popular keys',
    dateTime: new Date(new Date().setHours(16, 0, 0, 0)),
    estimatedDurationMinutes: 15,
    status: 'scheduled',
    recurrence: 'daily',
    notifyBefore: 10,
    createdAt: new Date(),
  },
];

function calculateNextRun(task: MaintenanceTask): Date {
  const current = new Date();
  const taskTime = new Date(task.dateTime);

  switch (task.recurrence) {
    case 'once':
      return taskTime;
    case 'daily':
      if (taskTime < current) {
        const next = new Date(taskTime);
        next.setDate(next.getDate() + 1);
        return next;
      }
      return taskTime;
    case 'weekly': {
      if (!task.recurrencePattern?.daysOfWeek) return taskTime;
      const daysOfWeek = task.recurrencePattern.daysOfWeek;
      const next = new Date(current);
      let attempts = 0;
      while (attempts < 14) {
        if (daysOfWeek.includes(next.getDay())) {
          const taskNext = new Date(next);
          taskNext.setHours(taskTime.getHours(), taskTime.getMinutes(), taskTime.getSeconds(), 0);
          if (taskNext > current) return taskNext;
        }
        next.setDate(next.getDate() + 1);
        attempts++;
      }
      return taskTime;
    }
    case 'monthly': {
      const next = new Date(current);
      next.setMonth(next.getMonth() + 1);
      next.setDate(taskTime.getDate());
      next.setHours(taskTime.getHours(), taskTime.getMinutes(), taskTime.getSeconds(), 0);
      return next;
    }
    default:
      return taskTime;
  }
}

function calculateStats(tasks: MaintenanceTask[]): MaintenanceStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const thisMonthTasks = tasks.filter(t => {
    const taskDate = new Date(t.dateTime);
    return taskDate >= monthStart && taskDate <= monthEnd;
  });

  const completedThisMonth = thisMonthTasks.filter(t => t.status === 'complete').length;
  const overdue = tasks.filter(t => t.status === 'overdue').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = tasks.filter(t => t.status === 'scheduled').length;

  const successRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === 'complete').length / tasks.length) * 100)
    : 0;

  const avgDuration = tasks.length > 0
    ? Math.round(tasks.reduce((sum, t) => sum + t.estimatedDurationMinutes, 0) / tasks.length)
    : 0;

  return {
    totalTasks: tasks.length,
    completedThisMonth,
    overdue,
    inProgress,
    pending,
    successRate,
    avgDuration,
  };
}

export function useMaintenance() {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(MOCK_TASKS);

  // Calculate stats
  const stats = calculateStats(tasks);

  // Update task statuses based on current time
  useEffect(() => {
    const checkOverdue = () => {
      const now = new Date();
      setTasks(prevTasks =>
        prevTasks.map(task => {
          const taskTime = new Date(task.dateTime);
          if (task.status === 'scheduled' && taskTime < now) {
            return { ...task, status: 'overdue' };
          }
          return task;
        })
      );
    };

    checkOverdue();
    const interval = setInterval(checkOverdue, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const createTask = useCallback((task: MaintenanceTask) => {
    const newTask = {
      ...task,
      nextRunAt: calculateNextRun(task),
    };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((updatedTask: MaintenanceTask) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === updatedTask.id
          ? { ...updatedTask, nextRunAt: calculateNextRun(updatedTask) }
          : task
      )
    );
  }, []);

  const completeTask = useCallback((taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const completedTask = {
            ...task,
            status: 'complete' as const,
            history: [
              ...(task.history || []),
              { date: new Date(), status: 'complete' }
            ]
          };

          // If recurring, create next instance
          if (task.recurrence !== 'once') {
            const nextTask = {
              ...task,
              id: `${task.id}-${Date.now()}`,
              dateTime: calculateNextRun(task),
              status: 'scheduled' as const,
            };
            setTasks(prevTasks => [...prevTasks, nextTask]);
          }

          return completedTask;
        }
        return task;
      })
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const rescheduleTask = useCallback((taskId: string, newDateTime: Date) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              dateTime: newDateTime,
              nextRunAt: calculateNextRun({ ...task, dateTime: newDateTime }),
              status: 'scheduled'
            }
          : task
      )
    );
  }, []);

  return {
    tasks,
    stats,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    rescheduleTask,
  };
}

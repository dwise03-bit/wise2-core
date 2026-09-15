'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

let toastId = 0;
let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: ToastType = 'info', duration = 4000) {
  const id = `toast-${toastId++}`;
  const toast: Toast = { id, message, type, duration };

  toastListeners.forEach((listener) => listener(toast));

  if (duration) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
}

export function removeToast(id: string) {
  // This will be handled by the component
}

export function onToast(listener: (toast: Toast) => void) {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter((l) => l !== listener);
  };
}

interface SingleToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function SingleToast({ toast, onRemove }: SingleToastProps) {
  const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    warning: <AlertTriangle size={20} className="text-yellow-400" />,
    info: <Info size={20} className="text-cyan-400" />,
    loading: <div className="spinner-neon" style={{ width: '20px', height: '20px' }} />,
  };

  const bgColors = {
    success: 'bg-green-500/10 border-green-500/30',
    error: 'bg-red-500/10 border-red-500/30',
    warning: 'bg-yellow-500/10 border-yellow-500/30',
    info: 'bg-cyan-500/10 border-cyan-500/30',
    loading: 'bg-cyan-500/10 border-cyan-500/30',
  };

  const glowClass = {
    success: 'animate-glow-pulse-green',
    error: 'glow-blue',
    warning: 'animate-glow-pulse-gold',
    info: 'animate-glow-pulse',
    loading: 'animate-glow-pulse',
  };

  return (
    <div
      className={`
        glass-medium ${bgColors[toast.type]} border rounded-lg p-4 max-w-md
        animate-slide-in-up shadow-lg ${glowClass[toast.type]}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 pt-0.5">{icons[toast.type]}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{toast.message}</p>
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Close toast"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = onToast((toast) => {
      setToasts((prev) => [...prev, toast]);
    });

    return unsubscribe;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-6 right-6 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

'use client';

/**
 * Toast/Snackbar UI for displaying errors, warnings, and success messages
 * Displays at the bottom of the screen with auto-dismiss and manual close
 */

import React, { useState, useEffect } from 'react';
import { useErrorHandler, type ErrorInfo } from '../hooks/useErrorHandler';

export function ErrorToastContainer() {
  const { notifications, dismissNotification } = useErrorHandler();
  const [visibleErrors, setVisibleErrors] = useState<ErrorInfo[]>([]);

  // Update visible errors when notifications change
  useEffect(() => {
    setVisibleErrors(notifications);
  }, [notifications]);

  if (visibleErrors.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2 max-w-md pointer-events-none">
      {visibleErrors.map((error) => (
        <ErrorToast
          key={error.id}
          error={error}
          onClose={() => dismissNotification(error.id)}
        />
      ))}
    </div>
  );
}

interface ErrorToastProps {
  error: ErrorInfo;
  onClose: () => void;
}

function ErrorToast({ error, onClose }: ErrorToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  const getToastStyles = () => {
    const baseClass =
      'pointer-events-auto flex items-start gap-4 p-4 rounded-lg border backdrop-blur-sm shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-4';

    switch (error.type) {
      case 'error':
        return `${baseClass} bg-wise-accent-red/10 border-wise-accent-red text-wise-accent-red`;
      case 'warning':
        return `${baseClass} bg-wise-accent-orange/10 border-wise-accent-orange text-wise-accent-orange`;
      case 'success':
        return `${baseClass} bg-wise-accent-green/10 border-wise-accent-green text-wise-accent-green`;
      default:
        return `${baseClass} bg-wise-surface-secondary border-wise-medium text-wise-text-primary`;
    }
  };

  const getIconColor = () => {
    switch (error.type) {
      case 'error':
        return 'text-wise-accent-red';
      case 'warning':
        return 'text-wise-accent-orange';
      case 'success':
        return 'text-wise-accent-green';
      default:
        return 'text-wise-text-primary';
    }
  };

  const getIcon = () => {
    switch (error.type) {
      case 'error':
        return '⚠️';
      case 'warning':
        return '⚡';
      case 'success':
        return '✓';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`${getToastStyles()} ${
        isExiting ? 'opacity-0 slide-out-to-bottom-4' : ''
      }`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 text-xl mt-0.5 ${getIconColor()}`}>
        {getIcon()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm leading-tight mb-1">{error.title}</h3>
        <p className="text-sm opacity-90 leading-snug">{error.message}</p>

        {/* Retry Button */}
        {error.retry && (
          <button
            onClick={() => {
              error.retry?.();
              handleClose();
            }}
            className="mt-2 text-xs font-semibold opacity-75 hover:opacity-100 transition-opacity underline"
          >
            Retry
          </button>
        )}

        {/* Error Code (development only) */}
        {process.env.NODE_ENV === 'development' && error.code && (
          <p className="text-xs opacity-50 mt-1 font-mono">{error.code}</p>
        )}
      </div>

      {/* Close Button */}
      {error.dismissible && (
        <button
          onClick={handleClose}
          className="flex-shrink-0 mt-0.5 text-lg opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Close error message"
        >
          ✕
        </button>
      )}
    </div>
  );
}

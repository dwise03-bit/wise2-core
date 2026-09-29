'use client';

/**
 * Error handling hook for SoundLabs Studio
 */

import { useCallback, useState } from 'react';

export interface ErrorNotification {
  id: string;
  type: 'error' | 'warning' | 'success';
  code: string;
  title: string;
  message: string;
  timestamp: number;
  timeout?: number;
  dismissible?: boolean;
  retry?: () => void;
}

export type ErrorInfo = ErrorNotification;

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  'audio-context-not-supported': {
    title: 'Web Audio API Not Supported',
    message: 'Your browser does not support Web Audio API. Please use a modern browser.',
  },
  'audio-context-initialization-failed': {
    title: 'Audio Engine Failed',
    message: 'Failed to initialize audio engine. Please refresh the page.',
  },
  'recording-failed': {
    title: 'Recording Failed',
    message: 'An error occurred while recording. Please try again.',
  },
  'recording-permission-denied': {
    title: 'Microphone Access Denied',
    message: 'Please allow microphone access to record audio.',
  },
  'playback-failed': {
    title: 'Playback Failed',
    message: 'An error occurred during playback.',
  },
  'track-add-failed': {
    title: 'Failed to Add Track',
    message: 'Could not add a new track. Please try again.',
  },
  'track-remove-failed': {
    title: 'Failed to Remove Track',
    message: 'Could not remove the track.',
  },
  'file-too-large': {
    title: 'File Too Large',
    message: 'The audio file is too large. Maximum size is 500MB.',
  },
};

export function useErrorHandler() {
  const [notifications, setNotifications] = useState<ErrorNotification[]>([]);

  const addNotification = useCallback(
    (
      type: 'error' | 'warning' | 'success',
      code: string,
      message?: string,
      options?: { timeout?: number; dismissible?: boolean; retry?: () => void }
    ) => {
      const id = `${code}-${Date.now()}-${Math.random()}`;
      const errorInfo = ERROR_MESSAGES[code];
      const title = errorInfo?.title || code;
      const defaultMessage = errorInfo?.message || message || 'An error occurred';

      const notification: ErrorNotification = {
        id,
        type,
        code,
        title,
        message: message || defaultMessage,
        timestamp: Date.now(),
        timeout: options?.timeout ?? (type === 'success' ? 3000 : 5000),
        dismissible: options?.dismissible ?? true,
        retry: options?.retry,
      };

      setNotifications(prev => [...prev, notification]);

      if (notification.timeout && notification.timeout > 0) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }, notification.timeout);
      }

      return id;
    },
    []
  );

  const addError = useCallback(
    (code: string, message?: string, options?: any) => {
      return addNotification('error', code, message, options);
    },
    [addNotification]
  );

  const addWarning = useCallback(
    (code: string, message?: string, options?: any) => {
      return addNotification('warning', code, message, options);
    },
    [addNotification]
  );

  const addSuccess = useCallback(
    (title: string, message?: string) => {
      const id = `success-${Date.now()}-${Math.random()}`;
      const notification: ErrorNotification = {
        id,
        type: 'success',
        code: 'success',
        title,
        message: message || '',
        timestamp: Date.now(),
        timeout: 3000,
        dismissible: true,
      };

      setNotifications(prev => [...prev, notification]);

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 3000);

      return id;
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const wrapAsync = useCallback(
    async <T,>(
      fn: () => Promise<T>,
      errorCode: string,
      onSuccess?: (result: T) => void
    ): Promise<T | null> => {
      try {
        const result = await fn();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (error) {
        addError(errorCode, error instanceof Error ? error.message : 'An error occurred');
        return null;
      }
    },
    [addError]
  );

  return {
    notifications,
    addError,
    addWarning,
    addSuccess,
    dismissNotification,
    wrapAsync,
  };
}

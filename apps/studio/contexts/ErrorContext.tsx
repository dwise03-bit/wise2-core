'use client';

/**
 * Error Context Provider
 * Makes the error handler available throughout the entire app
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useErrorHandler, type ErrorInfo } from '../hooks/useErrorHandler';

interface ErrorContextType {
  errors: ErrorInfo[];
  hasError: boolean;
  lastError: ErrorInfo | null;
  addError: (
    errorCode: string,
    customMessage?: string,
    options?: {
      dismissible?: boolean;
      timeout?: number;
      retryFn?: () => Promise<void>;
    }
  ) => string;
  addWarning: (
    title: string,
    message: string,
    options?: {
      dismissible?: boolean;
      timeout?: number;
    }
  ) => string;
  addSuccess: (
    title: string,
    message: string,
    options?: {
      timeout?: number;
    }
  ) => string;
  removeError: (errorId: string) => void;
  clearErrors: () => void;
  retryLastError: () => Promise<void>;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const errorHandler = useErrorHandler();

  return (
    <ErrorContext.Provider value={errorHandler}>
      {children}
    </ErrorContext.Provider>
  );
}

/**
 * Hook to access error handler from anywhere in the app
 */
export function useError() {
  const context = useContext(ErrorContext);

  if (context === undefined) {
    throw new Error('useError must be used within ErrorProvider');
  }

  return context;
}

/**
 * Error Boundary Component
 * Gracefully catches and handles errors in component tree
 * Provides recovery options and error reporting
 */

'use client';

import React, { ReactNode, ReactElement } from 'react';
import {
  AppError,
  ErrorType,
  ErrorSeverity,
  ErrorLogger,
  RecoveryAction,
} from '@/lib/error-handling';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (props: { error: AppError; retry: () => void }) => ReactElement;
  onError?: (error: AppError) => void;
  isolate?: boolean; // If true, only catch errors in this component
}

interface ErrorBoundaryState {
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
  hasError: boolean;
  retryCount: number;
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({
  error,
  retry,
}: {
  error: AppError;
  retry: () => void;
}): ReactElement {
  const isCritical = error.severity === ErrorSeverity.CRITICAL;
  const canRetry = error.isRetryable() && error.retryCount < error.maxRetries;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
      role="alert"
      aria-live="assertive"
    >
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isCritical
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : 'bg-orange-100 dark:bg-orange-900/30'
              }`}
            >
              <svg
                className={`w-8 h-8 ${
                  isCritical ? 'text-red-600' : 'text-orange-600'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">
            {isCritical ? 'Critical Error' : 'Oops, Something Went Wrong'}
          </h1>

          {/* Error Type */}
          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-4">
            Error Type: <code className="text-xs">{error.type}</code>
          </p>

          {/* Error Message */}
          <p className="text-center text-slate-700 dark:text-slate-300 mb-6">
            {error.getUserMessage()}
          </p>

          {/* Debug Info (development only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-6 p-3 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-400">
              <summary className="cursor-pointer font-semibold mb-2">
                Debug Information
              </summary>
              <pre className="overflow-auto max-h-48 whitespace-pre-wrap break-words">
                {JSON.stringify(
                  {
                    message: error.message,
                    code: error.code,
                    type: error.type,
                    severity: error.severity,
                    context: error.context,
                    recoveryActions: error.recoveryActions,
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}

          {/* Recovery Actions */}
          <div className="space-y-3">
            {canRetry && (
              <button
                onClick={retry}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Try Again (Attempt {error.retryCount + 1}/{error.maxRetries})
              </button>
            )}

            {error.recoveryActions.includes(RecoveryAction.REAUTHORIZE) && (
              <button
                onClick={() => {
                  // Redirect to login/auth
                  window.location.href = '/auth/login';
                }}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Re-authorize
              </button>
            )}

            {error.type === ErrorType.DISK_FULL && (
              <p className="text-sm text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded">
                Please free up disk space and try again.
              </p>
            )}

            {/* Reload page option */}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Reload Page
            </button>
          </div>

          {/* Support info */}
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Error Boundary Component
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      error: null,
      errorInfo: null,
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error:
        error instanceof AppError
          ? error
          : new AppError(
              error.message,
              ErrorType.UNKNOWN,
              ErrorSeverity.ERROR,
              { context: { originalError: error.toString() } }
            ),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error
    const appError =
      error instanceof AppError
        ? error
        : new AppError(
            error.message,
            ErrorType.UNKNOWN,
            ErrorSeverity.ERROR,
            {
              context: {
                originalError: error.toString(),
                componentStack: errorInfo.componentStack,
              },
            }
          );

    ErrorLogger.log(appError);

    // Call custom error handler
    this.props.onError?.(appError);

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(appError, errorInfo);
    }
  }

  private reportErrorToService(
    error: AppError,
    errorInfo: React.ErrorInfo
  ): void {
    try {
      // Send to error tracking service (e.g., Sentry, LogRocket)
      fetch('/api/errors/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toJSON(),
          componentStack: errorInfo.componentStack,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          timestamp: new Date().toISOString(),
        }),
      }).catch((err) => {
        console.error('Failed to report error:', err);
      });
    } catch (err) {
      console.error('Error reporting failed:', err);
    }
  }

  private handleRetry = (): void => {
    const { error, retryCount } = this.state;

    if (!error || retryCount >= error.maxRetries) {
      return;
    }

    error.incrementRetry();
    this.setState({
      error,
      hasError: false,
      errorInfo: null,
      retryCount: retryCount + 1,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      const errorFallback = fallback || DefaultErrorFallback;

      return errorFallback({ error, retry: this.handleRetry });
    }

    return children;
  }
}

/**
 * Hook for using ErrorBoundary with async operations
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<AppError | null>(null);

  const handleError = React.useCallback((err: unknown) => {
    const appError =
      err instanceof AppError
        ? err
        : new AppError(
            err instanceof Error ? err.message : String(err),
            ErrorType.UNKNOWN,
            ErrorSeverity.ERROR
          );

    ErrorLogger.log(appError);
    setError(appError);
    throw appError;
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    fallback?: (props: { error: AppError; retry: () => void }) => ReactElement;
    onError?: (error: AppError) => void;
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={options?.fallback} onError={options?.onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}

'use client';

/**
 * React Error Boundary for catching component crashes
 * Prevents the "white screen of death" when JavaScript errors occur
 */

import React, { ReactNode, ReactElement } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Log to external service (e.g., Sentry) if available
    if (typeof window !== 'undefined' && (window as any).reportErrorToService) {
      (window as any).reportErrorToService(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-wise-bg text-wise-text-primary flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-wise-surface border border-wise-medium rounded-lg p-8 shadow-2xl">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-wise-accent-red/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-2xl font-bold text-center mb-3 text-wise-accent-red">
              Something Went Wrong
            </h1>

            {/* Error Message */}
            <p className="text-wise-text-secondary text-center mb-6">
              The application encountered an unexpected error. Don't worry, we can recover from this.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-wise-surface-secondary rounded border border-wise-medium overflow-auto max-h-40">
                <p className="text-xs font-mono text-wise-accent-red mb-2">Error Details:</p>
                <p className="text-xs font-mono text-wise-text-muted break-words">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <div className="mt-2">
                    <p className="text-xs font-mono text-wise-accent-red mb-1">Component Stack:</p>
                    <pre className="text-xs font-mono text-wise-text-muted whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded font-semibold transition"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-3 bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-primary rounded font-semibold transition border border-wise-medium"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-wise-surface hover:bg-wise-surface-secondary text-wise-text-primary rounded font-semibold transition border border-wise-medium text-sm"
              >
                Refresh Page
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-wise-text-muted text-center mt-6 leading-relaxed">
              If the problem persists, check the browser console (F12) for more information or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

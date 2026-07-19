'use client';

/**
 * React Error Boundary - catches and displays errors
 */

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-wise-bg p-4">
          <div className="max-w-md w-full bg-wise-surface border border-wise-accent-red rounded-lg p-6">
            <h2 className="text-xl font-bold text-wise-accent-red mb-2">Something went wrong</h2>
            <p className="text-wise-text-secondary mb-4">
              An error occurred in the application. Please try refreshing the page.
            </p>
            {this.state.error && (
              <p className="text-xs text-wise-text-muted font-mono bg-wise-bg p-2 rounded mb-4 break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-wise-primary hover:bg-wise-primary-hover text-white rounded font-semibold transition"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

'use client'

import React from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <motion.div
            className="hud-panel-accent p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-500 flex-shrink-0 mt-1" size={20} />
              <div className="flex-1">
                <h3 className="text-heading text-red-500 mb-2">Something went wrong</h3>
                <p className="text-sm text-chrome-dark mb-4">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-electric text-white rounded-lg hover:bg-opacity-90 transition-all duration-200"
                  aria-label="Retry"
                >
                  <RotateCcw size={16} />
                  Try again
                </button>
              </div>
            </div>
          </motion.div>
        )
      )
    }

    return this.props.children
  }
}

/** Async error boundary - wraps async components */
export function AsyncErrorFallback() {
  return (
    <motion.div
      className="hud-panel-accent p-6 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="text-amber-500" size={20} />
        <div>
          <p className="text-sm font-medium text-chrome-light">Unable to load component</p>
          <p className="text-xs text-chrome-dark mt-1">Please refresh the page</p>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * WISE² Spinner Component
 *
 * Loading indicator with multiple sizes.
 */

import React, { HTMLAttributes, forwardRef } from 'react'

type SpinnerSize = 'sm' | 'md' | 'lg'

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize
  label?: string
}

const sizeStyles: Record<SpinnerSize, { container: string; spinner: string }> = {
  sm: {
    container: 'w-4 h-4',
    spinner: 'border-2',
  },
  md: {
    container: 'w-8 h-8',
    spinner: 'border-3',
  },
  lg: {
    container: 'w-12 h-12',
    spinner: 'border-4',
  },
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', label, className, ...props }, ref) => {
    const styles = sizeStyles[size]

    return (
      <div ref={ref} className={`flex flex-col items-center gap-2 ${className || ''}`} {...props}>
        <div
          className={`
            ${styles.container}
            border-wise-primary/30 border-t-wise-primary
            ${styles.spinner}
            rounded-full
            animate-spin
          `}
          role="status"
          aria-label={label || 'Loading'}
        >
          <span className="sr-only">{label || 'Loading'}</span>
        </div>
        {label && <span className="text-sm text-wise-text-muted">{label}</span>}
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

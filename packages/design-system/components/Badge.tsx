/**
 * WISE² Badge Component
 *
 * Compact labeling component for tags, statuses, and highlights.
 */

import React, { HTMLAttributes, forwardRef } from 'react'

type BadgeVariant = 'info' | 'success' | 'warning' | 'danger' | 'neutral'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  info: 'bg-wise-primary/20 text-wise-primary border border-wise-primary/30',
  success: 'bg-wise-success/20 text-wise-success border border-wise-success/30',
  warning: 'bg-wise-warning/20 text-wise-warning border border-wise-warning/30',
  danger: 'bg-wise-danger/20 text-wise-danger border border-wise-danger/30',
  neutral: 'bg-wise-surface-2 text-wise-text-secondary border border-wise-border-medium',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs font-semibold',
  md: 'px-3 py-1.5 text-sm font-semibold',
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'info', size = 'md', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center gap-1
          rounded-full
          whitespace-nowrap
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className || ''}
        `}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

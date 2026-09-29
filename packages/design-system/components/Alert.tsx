/**
 * WISE² Alert Component
 *
 * Reusable alert/notification for messages, errors, and status updates.
 */

import React, { HTMLAttributes, forwardRef } from 'react'

type AlertVariant = 'info' | 'success' | 'warning' | 'danger'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title?: string
  closable?: boolean
  onClose?: () => void
  icon?: React.ReactNode
}

const variantStyles: Record<AlertVariant, { bg: string; border: string; text: string; icon: string }> = {
  info: {
    bg: 'bg-wise-primary/10',
    border: 'border-wise-primary/30',
    text: 'text-wise-text-primary',
    icon: 'text-wise-primary',
  },
  success: {
    bg: 'bg-wise-success/10',
    border: 'border-wise-success/30',
    text: 'text-wise-text-primary',
    icon: 'text-wise-success',
  },
  warning: {
    bg: 'bg-wise-warning/10',
    border: 'border-wise-warning/30',
    text: 'text-wise-text-primary',
    icon: 'text-wise-warning',
  },
  danger: {
    bg: 'bg-wise-danger/10',
    border: 'border-wise-danger/30',
    text: 'text-wise-text-primary',
    icon: 'text-wise-danger',
  },
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', title, closable = false, onClose, icon, className, children, ...props }, ref) => {
    const styles = variantStyles[variant]

    return (
      <div
        ref={ref}
        className={`
          flex gap-3 p-4 rounded-base
          border ${styles.border}
          ${styles.bg} ${styles.text}
          transition-all duration-200
          ${className || ''}
        `}
        {...props}
      >
        {icon && <div className={`flex-shrink-0 ${styles.icon}`}>{icon}</div>}

        <div className="flex-1">
          {title && <h3 className="font-semibold text-sm mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>

        {closable && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-wise-text-muted hover:text-wise-text-primary transition-colors"
            aria-label="Close alert"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Alert.displayName = 'Alert'

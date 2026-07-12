import * as React from 'react'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant
  size?: BadgeSize
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-700 text-chrome',
  success: 'bg-success/20 text-success border border-success/30',
  warning: 'bg-warning/20 text-warning border border-warning/30',
  error: 'bg-error/20 text-error border border-error/30',
  info: 'bg-info/20 text-info border border-info/30',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-1 text-xs font-medium rounded',
  md: 'px-3 py-1.5 text-sm font-medium rounded-md',
  lg: 'px-4 py-2 text-base font-medium rounded-lg',
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className = '', ...props }, ref) => {
    const computedClassName = `inline-flex items-center ${variantStyles[variant]} ${sizeStyles[size]} ${className}`

    return <div ref={ref} className={computedClassName} {...props} />
  }
)

Badge.displayName = 'Badge'

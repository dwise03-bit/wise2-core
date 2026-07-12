import * as React from 'react'
import { Icon, IconProps } from '../atoms/Icon'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: keyof typeof import('lucide-react')
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center py-12 text-center ${className}`}
        {...props}
      >
        {icon && (
          <Icon
            name={icon}
            size={48}
            className="mb-4 text-chrome opacity-50"
          />
        )}
        <h3 className="text-lg font-semibold text-chrome">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-chrome/75">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    )
  }
)

EmptyState.displayName = 'EmptyState'

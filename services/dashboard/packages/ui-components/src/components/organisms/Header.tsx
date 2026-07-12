import * as React from 'react'

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  logo?: React.ReactNode
  title?: string
  actions?: React.ReactNode
}

export const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  ({ logo, title, actions, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`sticky top-0 z-30 border-b border-gray-700 bg-black ${className}`}
        role="banner"
        {...props}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-4">
            {logo && <div className="flex-shrink-0">{logo}</div>}
            {title && (
              <h1 className="text-lg font-semibold text-chrome">{title}</h1>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    )
  }
)

Header.displayName = 'Header'

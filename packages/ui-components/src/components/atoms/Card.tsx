import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  elevated?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, elevated = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          p-md bg-gray-900 rounded-lg border border-gray-800
          transition-shadow duration-200
          ${elevated ? 'shadow-lg hover:shadow-xl' : 'shadow-md'}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-chrome mb-sm">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-md py-sm font-base border rounded-md
            bg-gray-900 text-chrome placeholder-gray-500
            transition-colors duration-200
            focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20
            ${error ? 'border-red-500' : 'border-gray-600'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-xs text-sm text-red-500">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-xs text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

/**
 * WISE² Input Component
 *
 * Reusable form input with design system styling.
 */

import React, { InputHTMLAttributes, forwardRef } from 'react'

type InputType = 'text' | 'email' | 'password' | 'search' | 'number' | 'tel' | 'url'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: InputType
  error?: boolean
  errorMessage?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type = 'text', error, errorMessage, label, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-wise-text-primary mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-2 rounded-sm
            bg-wise-surface border
            text-wise-text-primary placeholder-wise-text-muted
            transition-colors duration-200
            focus:outline-none focus:border-wise-primary
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              error
                ? 'border-wise-danger focus:border-wise-danger'
                : 'border-wise-border-medium hover:border-wise-border-strong'
            }
            ${className || ''}
          `}
          {...props}
        />
        {error && errorMessage && (
          <p className="mt-1 text-xs text-wise-danger">{errorMessage}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

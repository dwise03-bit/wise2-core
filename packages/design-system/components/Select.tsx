/**
 * WISE² Select Component
 *
 * Dropdown/select input for choosing from options.
 */

import React, { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
  error?: boolean
  errorMessage?: string
  label?: string
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, error, errorMessage, label, placeholder, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-wise-text-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-2 rounded-sm
              bg-wise-surface border
              text-wise-text-primary
              appearance-none cursor-pointer
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
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-wise-surface text-wise-text-primary"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-wise-text-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {error && errorMessage && (
          <p className="mt-1 text-xs text-wise-danger">{errorMessage}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

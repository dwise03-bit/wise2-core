/**
 * WISE² TextArea Component
 *
 * Multi-line text input with character counter support.
 */

import React, { TextareaHTMLAttributes, forwardRef, useState } from 'react'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  errorMessage?: string
  label?: string
  maxLength?: number
  showCharCount?: boolean
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ error, errorMessage, label, maxLength, showCharCount = false, className, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-wise-text-primary mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          maxLength={maxLength}
          onChange={handleChange}
          className={`
            w-full px-4 py-2 rounded-sm
            bg-wise-surface border
            text-wise-text-primary placeholder-wise-text-muted
            font-mono resize-none
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
        <div className="flex justify-between items-start mt-2 min-h-5">
          {error && errorMessage && <p className="text-xs text-wise-danger">{errorMessage}</p>}
          {showCharCount && maxLength && (
            <p className="ml-auto text-xs text-wise-text-muted">
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'

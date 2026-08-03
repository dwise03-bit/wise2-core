/**
 * WISE² Toggle Component
 *
 * On/off switch for boolean values.
 */

import React, { InputHTMLAttributes, forwardRef } from 'react'

interface ToggleProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={props.checked}
          onClick={() => {
            if (ref && typeof ref !== 'function' && ref.current) {
              ref.current.checked = !ref.current.checked
              ref.current.dispatchEvent(new Event('change', { bubbles: true }))
            }
          }}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0
            rounded-full border-2 border-transparent
            transition-colors duration-200
            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wise-primary
            ${props.checked ? 'bg-wise-primary' : 'bg-wise-surface-2'}
            ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5
              transform rounded-full bg-wise-surface
              transition-transform duration-200
              ${props.checked ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>

        {/* Hidden input for form submission */}
        <input ref={ref} type="checkbox" className="hidden" {...props} />

        {/* Label */}
        {label && (
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-wise-text-primary cursor-pointer">
              {label}
            </label>
            {description && <p className="text-xs text-wise-text-muted">{description}</p>}
          </div>
        )}
      </div>
    )
  }
)

Toggle.displayName = 'Toggle'

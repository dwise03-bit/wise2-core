'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helpText?: string
  maxLength?: number
  showCharCount?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helpText,
      maxLength,
      showCharCount = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [charCount, setCharCount] = React.useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      props.onChange?.(e)
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-wise-text-primary mb-2.5">
            {label}
            {props.required && <span className="text-wise-danger ml-1">*</span>}
          </label>
        )}

        <motion.textarea
          ref={ref}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          animate={{
            borderColor: error
              ? 'rgba(255, 0, 64, 0.6)'
              : isFocused
                ? 'rgba(0, 85, 255, 0.6)'
                : 'rgba(0, 85, 255, 0.15)',
            backgroundColor: isFocused
              ? 'rgba(13, 17, 23, 0.8)'
              : 'rgba(13, 17, 23, 0.5)',
            boxShadow: error
              ? '0 0 12px rgba(255, 0, 64, 0.2), inset 0 0 8px rgba(255, 0, 64, 0.05)'
              : isFocused
                ? '0 0 24px rgba(0, 85, 255, 0.3), inset 0 0 12px rgba(0, 85, 255, 0.1)'
                : 'inset 0 0 8px rgba(0, 0, 0, 0.2)',
          }}
          transition={{ duration: 0.2 }}
          className={`
            w-full
            backdrop-blur-sm
            border
            rounded-lg
            px-4
            py-3
            text-base
            text-wise-text-primary
            placeholder-wise-text-muted/60
            transition-all
            duration-200
            min-h-28
            resize-vertical
            focus-visible:outline-none
            disabled:opacity-50
            disabled:cursor-not-allowed
            font-sans
            ${className}
          `}
          {...props}
        />

        <div className="flex justify-between items-start mt-2 gap-2">
          <div className="flex-1">
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm text-wise-danger flex items-center gap-1"
                role="alert"
              >
                <span className="text-lg">⚠</span>
                {error}
              </motion.p>
            )}

            {helpText && !error && (
              <p className="text-sm text-wise-text-muted">{helpText}</p>
            )}
          </div>

          {showCharCount && maxLength && (
            <p
              className={`text-sm whitespace-nowrap ${
                charCount > maxLength * 0.9
                  ? 'text-wise-warning'
                  : 'text-wise-text-muted'
              }`}
            >
              {charCount} / {maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Option {
  value: string | number
  label: string
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: Option[]
  label?: string
  error?: string
  helpText?: string
  placeholder?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      label,
      error,
      helpText,
      placeholder,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [selectedValue, setSelectedValue] = React.useState<string | number>(
      props.value || ''
    )
    const [isFocused, setIsFocused] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (value: string | number) => {
      setSelectedValue(value)
      setIsOpen(false)
      props.onChange?.({
        target: { value: String(value) },
      } as React.ChangeEvent<HTMLSelectElement>)
    }

    const selectedLabel = options.find((opt) => opt.value === selectedValue)?.label || placeholder

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label className="block text-sm font-medium text-wise-text-primary mb-2">
            {label}
            {props.required && <span className="text-wise-accent-red ml-1">*</span>}
          </label>
        )}

        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={{
            borderColor: error
              ? '#FF0040'
              : isFocused
                ? '#0055FF'
                : 'rgb(19, 25, 34)',
            boxShadow: error
              ? '0 0 0 3px rgba(255, 0, 64, 0.1)'
              : isFocused
                ? '0 0 12px rgba(0, 85, 255, 0.3)'
                : 'none',
          }}
          transition={{ duration: 0.2 }}
          className={`
            w-full
            bg-wise-surface/50
            border-2
            rounded-lg
            px-3
            py-3
            text-base
            text-left
            text-wise-text-primary
            transition-all
            duration-200
            min-h-11
            focus-visible:outline-none
            disabled:opacity-50
            disabled:cursor-not-allowed
            flex
            items-center
            justify-between
            gap-2
            ${className}
          `}
          disabled={props.disabled}
        >
          <span className={selectedValue ? '' : 'text-wise-text-muted'}>
            {selectedLabel}
          </span>
          <motion.svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-wise-text-muted"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="
                absolute
                z-50
                w-full
                mt-2
                bg-wise-surface-2
                border
                border-wise-surface
                rounded-lg
                overflow-hidden
                shadow-lg
              "
            >
              {options.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  whileHover={{ backgroundColor: 'rgba(0, 85, 255, 0.1)' }}
                  className={`
                    w-full
                    px-3
                    py-3
                    text-base
                    text-left
                    transition-colors
                    duration-200
                    ${
                      selectedValue === option.value
                        ? 'bg-wise-primary/20 text-wise-primary'
                        : 'text-wise-text-primary hover:bg-wise-surface'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {selectedValue === option.value && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 8L6 12L14 4"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                    {option.label}
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 text-sm text-wise-accent-red"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        {helpText && !error && (
          <p className="mt-2 text-sm text-wise-text-muted">{helpText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select

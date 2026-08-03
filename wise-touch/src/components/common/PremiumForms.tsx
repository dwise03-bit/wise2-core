'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LucideIcon, AlertCircle, CheckCircle } from 'lucide-react'

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  icon?: LucideIcon
  success?: boolean
}

export const PremiumInput = React.forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, helper, icon: Icon, success, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {label && (
          <motion.label
            className="block text-sm font-medium text-chrome-light"
            htmlFor={props.id}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </motion.label>
        )}

        <div className="relative">
          {Icon && (
            <motion.div
              className="absolute left-4 top-1/2 -translate-y-1/2 text-chrome-dark/40 pointer-events-none"
              animate={{
                color: isFocused ? 'rgb(0, 148, 255)' : 'rgba(142, 142, 142, 0.4)',
                scale: isFocused ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon size={18} />
            </motion.div>
          )}

          <input
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg text-chrome-light
              bg-bg-tertiary/40 backdrop-blur-sm
              border border-steel/30
              transition-all duration-200
              ${Icon ? 'pl-12' : ''}
              ${error ? 'border-red-500/50 bg-red-500/5' : ''}
              ${success ? 'border-green-500/50 bg-green-500/5' : ''}
              focus:outline-none
            `}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {success && (
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle size={18} />
            </motion.div>
          )}

          {error && (
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <AlertCircle size={18} />
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              className="text-xs text-red-400 font-medium"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {error}
            </motion.p>
          )}

          {helper && !error && (
            <motion.p
              key="helper"
              className="text-xs text-chrome-dark/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {helper}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

PremiumInput.displayName = 'PremiumInput'

interface PremiumTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
}

export const PremiumTextarea = React.forwardRef<HTMLTextAreaElement, PremiumTextareaProps>(
  ({ label, error, helper, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [charCount, setCharCount] = useState(0)

    return (
      <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {label && (
          <motion.label
            className="block text-sm font-medium text-chrome-light"
            htmlFor={props.id}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </motion.label>
        )}

        <textarea
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg text-chrome-light resize-none
            bg-bg-tertiary/40 backdrop-blur-sm
            border border-steel/30
            transition-all duration-200
            focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20
            ${error ? 'border-red-500/50 bg-red-500/5' : ''}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => {
            setCharCount(e.target.value.length)
            props.onChange?.(e)
          }}
          {...props}
        />

        <div className="flex items-end justify-between">
          <AnimatePresence mode="wait">
            {error && (
              <motion.p
                key="error"
                className="text-xs text-red-400 font-medium"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                {error}
              </motion.p>
            )}

            {helper && !error && (
              <motion.p
                key="helper"
                className="text-xs text-chrome-dark/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {helper}
              </motion.p>
            )}
          </AnimatePresence>

          {props.maxLength && (
            <motion.p
              className="text-xs text-chrome-dark/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {charCount} / {props.maxLength}
            </motion.p>
          )}
        </div>
      </motion.div>
    )
  }
)

PremiumTextarea.displayName = 'PremiumTextarea'

interface PremiumSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export const PremiumSelect = React.forwardRef<HTMLSelectElement, PremiumSelectProps>(
  ({ label, error, options, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <motion.div className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {label && (
          <motion.label
            className="block text-sm font-medium text-chrome-light"
            htmlFor={props.id}
          >
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </motion.label>
        )}

        <motion.div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-4 py-2.5 rounded-lg text-chrome-light appearance-none
              bg-bg-tertiary/40 backdrop-blur-sm
              border border-steel/30
              transition-all duration-200
              cursor-pointer
              focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20
              ${error ? 'border-red-500/50 bg-red-500/5' : ''}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          >
            <option value="" disabled>
              Select an option...
            </option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-bg-secondary text-chrome-light"
              >
                {option.label}
              </option>
            ))}
          </select>

          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-chrome-dark/40"
            animate={{ rotate: isFocused ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key="error"
              className="text-xs text-red-400 font-medium"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
)

PremiumSelect.displayName = 'PremiumSelect'

interface PremiumCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const PremiumCheckbox = React.forwardRef<HTMLInputElement, PremiumCheckboxProps>(
  ({ label, ...props }, ref) => {
    return (
      <motion.div className="flex items-center gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <input
            ref={ref}
            type="checkbox"
            className={`
              w-5 h-5 rounded-md accent-blue-electric cursor-pointer
              appearance-none
              bg-bg-tertiary/40 border border-steel/30
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-electric
              checked:bg-blue-electric checked:border-blue-electric
            `}
            {...props}
          />

          {props.checked && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.div>
          )}
        </motion.div>

        {label && (
          <motion.label
            htmlFor={props.id}
            className="text-sm text-chrome-light cursor-pointer select-none"
          >
            {label}
          </motion.label>
        )}
      </motion.div>
    )
  }
)

PremiumCheckbox.displayName = 'PremiumCheckbox'

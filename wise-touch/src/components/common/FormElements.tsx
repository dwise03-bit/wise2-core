'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  isLoading?: boolean
  children: React.ReactNode
}

/** Reusable button component */
export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 inline-flex items-center gap-2 cursor-pointer'

  const variantStyles = {
    primary: 'bg-blue-electric text-white hover:bg-opacity-90 active:scale-95',
    secondary: 'bg-bg-tertiary text-chrome-light hover:bg-opacity-80 active:scale-95',
    outline: 'border border-blue-electric text-blue-electric hover:bg-blue-electric/10 active:scale-95',
    ghost: 'text-chrome-light hover:bg-white/5 active:scale-95',
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </button>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  icon?: LucideIcon
}

/** Reusable input component */
export function Input({
  label,
  error,
  helper,
  icon: Icon,
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-chrome-light">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-chrome-dark pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`w-full px-4 py-2 ${Icon ? 'pl-10' : ''} rounded-lg bg-bg-tertiary border transition-colors focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 text-chrome-light placeholder-chrome-dark ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-bg-secondary'
          }`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {helper && !error && (
        <p className="text-xs text-chrome-dark">{helper}</p>
      )}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helper?: string
  rows?: number
}

/** Reusable textarea component */
export function Textarea({
  label,
  error,
  helper,
  rows = 4,
  ...props
}: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-chrome-light">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full px-4 py-2 rounded-lg bg-bg-tertiary border transition-colors focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 text-chrome-light placeholder-chrome-dark resize-none ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-bg-secondary'
        }`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
      {helper && !error && (
        <p className="text-xs text-chrome-dark">{helper}</p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{
    value: string
    label: string
    disabled?: boolean
  }>
}

/** Reusable select component */
export function Select({
  label,
  error,
  options,
  ...props
}: SelectProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-chrome-light">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-4 py-2 rounded-lg bg-bg-tertiary border transition-colors focus:outline-none focus:border-blue-electric focus:ring-2 focus:ring-blue-electric/20 text-chrome-light appearance-none cursor-pointer ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
            : 'border-bg-secondary'
        }`}
        {...props}
      >
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
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

/** Reusable checkbox component */
export function Checkbox({
  label,
  error,
  id,
  ...props
}: CheckboxProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={id}
          className="w-4 h-4 accent-blue-electric cursor-pointer rounded"
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm text-chrome-light cursor-pointer">
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}

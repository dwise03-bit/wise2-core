'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

/* ============================================================================
   TEXT INPUT
   ============================================================================ */
export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function FormInput({
  label,
  error,
  className = '',
  ...props
}: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wide">
          {label}
        </label>
      )}
      <input
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-transparent border-b-2 ${
          error ? 'border-red-500' : focused ? 'border-[#00D9FF]' : 'border-gray-600'
        } text-white placeholder-gray-600 focus:outline-none transition py-2 ${className}`}
        style={{
          textShadow: focused ? '0 0 10px rgba(0, 217, 255, 0.2)' : 'none',
        }}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================================================
   TEXTAREA
   ============================================================================ */
export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function FormTextarea({
  label,
  error,
  className = '',
  ...props
}: FormTextareaProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wide">
          {label}
        </label>
      )}
      <textarea
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-transparent border-2 ${
          error ? 'border-red-500' : focused ? 'border-[#00D9FF]' : 'border-gray-600'
        } text-white placeholder-gray-600 focus:outline-none transition p-3 rounded-sm resize-none ${className}`}
        style={{
          textShadow: focused ? '0 0 10px rgba(0, 217, 255, 0.2)' : 'none',
        }}
        rows={4}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================================================
   CHECKBOX (Poster-style with colored square)
   ============================================================================ */
export interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  accentColor?: 'blue' | 'red';
}

export function FormCheckbox({
  label,
  accentColor = 'blue',
  id,
  ...props
}: FormCheckboxProps) {
  const [checked, setChecked] = useState(props.checked as boolean || false);
  const colorClass = accentColor === 'blue' ? 'text-[#00D9FF]' : 'text-[#FF4D4D]';
  const borderClass = accentColor === 'blue' ? 'border-[#00D9FF]' : 'border-[#FF4D4D]';

  return (
    <label className="flex items-start space-x-3 cursor-pointer group">
      <div className={`flex-shrink-0 w-5 h-5 border-2 ${borderClass} rounded-sm mt-0.5 flex items-center justify-center transition`}
        style={{
          backgroundColor: checked ? colorClass.split('-')[1] === 'blue' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255, 77, 77, 0.1)' : 'transparent',
        }}
      >
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="sr-only peer"
          {...props}
        />
        {checked && (
          <span className={`text-sm font-black ${colorClass}`}
          >
            ✓
          </span>
        )}
      </div>
      <span className="text-sm text-gray-300 group-hover:text-white transition flex-1">
        {label}
      </span>
    </label>
  );
}

/* ============================================================================
   SELECT / DROPDOWN
   ============================================================================ */
export interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export function FormSelect({
  label,
  error,
  options,
  className = '',
  ...props
}: FormSelectProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wide">
          {label}
        </label>
      )}
      <select
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full bg-black/50 border-b-2 ${
          error ? 'border-red-500' : focused ? 'border-[#00D9FF]' : 'border-gray-600'
        } text-white placeholder-gray-600 focus:outline-none transition py-2 ${className}`}
        {...props}
      >
        <option value="" className="bg-black text-white">
          Select an option...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-black text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-red-500"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/* ============================================================================
   CHECKBOX GROUP (Multiple options)
   ============================================================================ */
export interface CheckboxOption {
  value: string;
  label: string;
}

export interface FormCheckboxGroupProps {
  label?: string;
  options: CheckboxOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  accentColor?: 'blue' | 'red';
}

export function FormCheckboxGroup({
  label,
  options,
  selected,
  onChange,
  accentColor = 'blue',
}: FormCheckboxGroupProps) {
  const handleChange = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="text-xs uppercase font-bold text-gray-400 tracking-wide block">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <FormCheckbox
            key={option.value}
            label={option.label}
            checked={selected.includes(option.value)}
            onChange={() => handleChange(option.value)}
            accentColor={accentColor}
          />
        ))}
      </div>
    </div>
  );
}

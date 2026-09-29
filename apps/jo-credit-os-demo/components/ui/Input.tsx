'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg
            bg-[#101114] text-[#F5F5F5] border border-[#1A1A1A]
            placeholder-[#727272]
            focus:outline-none focus:border-[#2CD588] focus:ring-2 focus:ring-[#2CD588]/20
            transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20' : ''}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-[#EF4444]">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-[#A0A0A0]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

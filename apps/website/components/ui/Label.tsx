'use client';

import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ required = false, className = '', children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={`block text-sm font-medium text-[#F5F5F5] mb-2 ${className}`}
        {...props}
      >
        {children}
        {required && <span className="text-[#EF4444] ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = 'Label';

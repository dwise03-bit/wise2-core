'use client';

import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const variantStyles = {
      success: 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30',
      warning: 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30',
      danger: 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30',
      info: 'bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/30',
      default: 'bg-[#1A1A1A] text-[#A0A0A0] border border-[#1A1A1A]',
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

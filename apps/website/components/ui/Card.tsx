'use client';

import React from 'react';

type CardVariant = 'default' | 'elevated' | 'metric' | 'action';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-4 sm:p-6',
      elevated: 'bg-[#101114] border border-[#1A1A1A] rounded-xl p-6 shadow-card',
      metric: 'bg-[#050505] border border-[#1A1A1A] rounded-lg p-4 text-center',
      action: 'bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-6 hover:bg-[#101114] hover:border-[#2CD588] transition-all duration-150 cursor-pointer',
    };

    return (
      <div
        ref={ref}
        className={`${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-wise-electric text-wise-black hover:bg-[var(--wise-electric-hover)] active:bg-[var(--wise-electric-active)] shadow-blue-glow hover:shadow-blue-glow-md',
  secondary: 'border border-border-medium text-text-secondary hover:text-text-primary hover:bg-wise-electric/10 hover:border-wise-electric/40',
  ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger: 'bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 hover:border-danger/40',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-medium',
  md: 'px-4 py-2 text-sm font-semibold',
  lg: 'px-6 py-3 text-base font-semibold',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wise-electric disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
};

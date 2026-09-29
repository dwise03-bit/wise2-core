'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'px-3 py-2 text-sm min-h-[40px]',
  md: 'px-5 py-3 text-base min-h-[44px]',
  lg: 'px-6 py-3.5 text-lg min-h-[48px]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}) => {
  const variantClasses = {
    primary:
      'bg-cc-gold text-cc-dark hover:bg-yellow-600 focus-visible:ring-2 focus-visible:ring-cc-purple focus-visible:ring-offset-2',
    secondary:
      'bg-cc-purple text-white hover:bg-purple-800 focus-visible:ring-2 focus-visible:ring-cc-gold focus-visible:ring-offset-2',
    outline:
      'bg-white text-cc-purple border-2 border-cc-purple hover:bg-cc-lilac focus-visible:ring-2 focus-visible:ring-cc-purple focus-visible:ring-offset-2',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg font-poppins font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

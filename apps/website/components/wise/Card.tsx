import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'bordered' | 'flat';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hover = true,
}) => {
  const baseStyles = 'backdrop-blur-md transition-all duration-300';

  const variantStyles = {
    default: 'bg-wise-bg-card border border-wise-accent-green-border rounded-lg',
    bordered: 'bg-transparent border-2 border-wise-accent-green rounded-lg',
    flat: 'bg-wise-bg-secondary rounded-lg',
  };

  const hoverStyles = hover ? 'hover:border-wise-accent-green hover:shadow-lg' : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

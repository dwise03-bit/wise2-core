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
  const baseStyles = 'relative rounded-xl overflow-hidden transition-all duration-500';

  const variantStyles = {
    default: 'group',
    bordered: 'group',
    flat: 'group',
  };

  const hoverClass = hover ? 'hover:scale-105' : '';

  const getCardContent = () => {
    switch (variant) {
      case 'bordered':
        return (
          <>
            <div className="absolute inset-0 bg-transparent" />
            <div className="absolute inset-0 backdrop-blur-xl bg-white/0 group-hover:bg-white/5 transition-all duration-500" />
            <div className="absolute inset-0 rounded-xl border-2 border-wise-accent-green/40 group-hover:border-wise-accent-green/70 transition-colors duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-wise-accent-green/0 via-wise-accent-green/5 to-wise-accent-green/0 rounded-xl blur-2xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
            <div className="relative z-10 p-6">{children}</div>
          </>
        );
      case 'flat':
        return (
          <>
            <div className="absolute inset-0 bg-wise-bg-secondary" />
            <div className="absolute inset-0 backdrop-blur-sm bg-white/2 group-hover:bg-white/4 transition-all duration-500" />
            <div className="absolute inset-0 rounded-xl border border-wise-accent-green/20 group-hover:border-wise-accent-green/40 transition-colors duration-500" />
            <div className="relative z-10 p-6">{children}</div>
          </>
        );
      default:
        return (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-wise-accent-green/8 via-wise-bg-secondary/60 to-wise-bg-primary" />
            <div className="absolute inset-0 backdrop-blur-xl bg-white/8 group-hover:bg-white/12 transition-all duration-500" />
            <div className="absolute inset-0 rounded-xl border border-wise-accent-green/40 group-hover:border-wise-accent-green/60 transition-colors duration-500" />
            <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-white/8 to-transparent rounded-xl pointer-events-none" />
            <div className="absolute -inset-1 bg-gradient-to-r from-wise-accent-green/0 via-wise-accent-green/5 to-wise-accent-green/0 rounded-xl blur-2xl -z-10 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
            <div className="relative z-10 p-6">{children}</div>
          </>
        );
    }
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverClass} ${className}`}>
      {getCardContent()}
    </div>
  );
};

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  href,
  external = false,
  className = '',
  ...props
}) => {
  const baseStyles = 'font-bold tracking-wide transition-all duration-300 font-display';

  const variantStyles = {
    primary: 'bg-wise-accent-green text-wise-bg-primary hover:shadow-lg hover:brightness-110 border border-wise-accent-green',
    secondary: 'bg-transparent border border-wise-accent-green text-wise-accent-green hover:bg-wise-accent-green hover:text-wise-bg-primary',
    ghost: 'bg-transparent text-wise-text-primary border border-wise-text-muted hover:border-wise-accent-green hover:text-wise-accent-green',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={`inline-flex items-center justify-center ${combinedClassName}`}
      >
        {children}
      </a>
    );
  }

  return (
    <button className={`inline-flex items-center justify-center ${combinedClassName}`} {...props}>
      {children}
    </button>
  );
};

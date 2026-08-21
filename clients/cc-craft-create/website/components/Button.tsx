import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseClass = 'font-semibold px-6 py-3 rounded-lg transition-colors font-poppins';
  const variantClass =
    variant === 'primary'
      ? 'bg-cc-gold text-cc-dark hover:bg-yellow-600'
      : 'bg-cc-purple text-white hover:bg-purple-800';

  return (
    <button className={`${baseClass} ${variantClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

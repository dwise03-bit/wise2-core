'use client';

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
  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? '#D4AF37' : '#6D2DBD';
  const textColor = isPrimary ? '#29233D' : '#FFFFFF';

  return (
    <button
      style={{
        backgroundColor: bgColor,
        color: textColor,
        fontWeight: 600,
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '16px',
        fontFamily: 'var(--font-poppins)',
        transition: 'all 0.3s ease',
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  children: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-black',
  secondary: 'bg-purple-500 hover:bg-purple-400 active:bg-purple-600 text-black',
  tertiary: 'bg-transparent border border-chrome hover:bg-gray-900 text-chrome',
  danger: 'bg-red-500 hover:bg-red-400 active:bg-red-600 text-black',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-sm py-xs text-sm h-8',
  md: 'px-md py-sm text-base h-10',
  lg: 'px-lg py-md text-lg h-12',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center font-medium rounded-md
          transition-all duration-200 ease-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${loading ? 'opacity-75' : ''}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block mr-2 w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

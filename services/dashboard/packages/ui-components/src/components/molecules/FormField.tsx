import * as React from 'react';

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  children: React.ReactNode
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div ref={ref} className={`flex flex-col gap-1.5 ${className}`} {...props}>
        {label && (
          <label className="text-sm font-medium text-chrome">
            {label}
            {required && <span className="text-error"> *</span>}
          </label>
        )}
        {children}
        {error && (
          <p className="text-xs font-medium text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-chrome/60">{helperText}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

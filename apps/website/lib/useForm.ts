/**
 * useForm Hook
 * Handles form state, validation, submission, and error display
 */

import { useState, useCallback } from 'react';
import { apiClient } from './api-client';

export interface FormField {
  value: any;
  error?: string;
  touched?: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

export interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

export interface UseFormOptions {
  initialValues: Record<string, any>;
  validationRules?: ValidationRules;
  onSubmit?: (values: Record<string, any>) => Promise<any>;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useForm(options: UseFormOptions) {
  const { initialValues, validationRules = {}, onSubmit, onSuccess, onError } = options;

  const [formState, setFormState] = useState<FormState>(
    Object.entries(initialValues).reduce((acc, [key, value]) => {
      acc[key] = { value, error: undefined, touched: false };
      return acc;
    }, {} as FormState)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateField = useCallback((name: string, value: any): string | null => {
    const validator = validationRules[name];
    if (!validator) return null;
    return validator(value);
  }, [validationRules]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value: finalValue,
        error: validateField(name, finalValue),
      },
    }));
  }, [validateField]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched: true,
      },
    }));
  }, []);

  const setValue = useCallback((name: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: validateField(name, value),
      },
    }));
  }, [validateField]);

  const getValues = useCallback(() => {
    return Object.entries(formState).reduce((acc, [key, field]) => {
      acc[key] = field.value;
      return acc;
    }, {} as Record<string, any>);
  }, [formState]);

  const hasErrors = useCallback(() => {
    return Object.values(formState).some(field => field.error);
  }, [formState]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    // Mark all fields as touched for validation display
    setFormState(prev =>
      Object.entries(prev).reduce((acc, [key, field]) => {
        acc[key] = { ...field, touched: true };
        return acc;
      }, {} as FormState)
    );

    if (hasErrors()) {
      setSubmitError('Please fix all errors before submitting');
      onError?.('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    try {
      const values = getValues();
      const result = onSubmit ? await onSubmit(values) : values;
      onSuccess?.(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      setSubmitError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [hasErrors, getValues, onSubmit, onSuccess, onError]);

  const reset = useCallback(() => {
    setFormState(
      Object.entries(initialValues).reduce((acc, [key, value]) => {
        acc[key] = { value, error: undefined, touched: false };
        return acc;
      }, {} as FormState)
    );
    setSubmitError(null);
  }, [initialValues]);

  return {
    formState,
    isSubmitting,
    submitError,
    handleChange,
    handleBlur,
    handleSubmit,
    setValue,
    getValues,
    hasErrors,
    reset,
  };
}

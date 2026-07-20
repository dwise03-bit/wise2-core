'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { wise2Content } from '@/data/wise2-content';

interface FormData {
  name: string;
  business: string;
  email: string;
  phone: string;
  website: string;
  services: string;
  budget: string;
  file: File | null;
  description: string;
  startDate: string;
}

interface FormErrors {
  [key: string]: string;
}

interface InteractiveIntakeFormProps {
  onSubmit?: (data: FormData) => void;
}

const FORM_STEPS = [
  { id: 'contact', title: 'Contact Info', fields: ['name', 'email', 'phone'] },
  { id: 'business', title: 'Business Details', fields: ['business', 'website', 'services'] },
  { id: 'project', title: 'Project Details', fields: ['budget', 'startDate', 'description'] },
  { id: 'attachments', title: 'Materials', fields: ['file'] },
];

export const InteractiveIntakeForm: React.FC<InteractiveIntakeFormProps> = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fieldFocus, setFieldFocus] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState<FormData>({
    name: '',
    business: '',
    email: '',
    phone: '',
    website: '',
    services: '',
    budget: '',
    file: null,
    description: '',
    startDate: '',
  });

  // Validate individual fields
  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'name':
        if (!value?.trim()) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return null;
      case 'email':
        if (!value?.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email';
        return null;
      case 'phone':
        if (!value?.trim()) return 'Phone is required';
        if (!/^[\d\s\+\-\(\)]+$/.test(value)) return 'Invalid phone number format';
        return null;
      case 'business':
        if (!value?.trim()) return 'Business name is required';
        return null;
      case 'services':
        if (!value) return 'Please select a service';
        return null;
      case 'budget':
        if (!value) return 'Please select a budget range';
        return null;
      case 'startDate':
        if (!value) return 'Please select a start date';
        return null;
      case 'description':
        if (!value?.trim()) return 'Please describe your vision';
        if (value.length < 10) return 'Description must be at least 10 characters';
        return null;
      default:
        return null;
    }
  };

  // Handle field change with real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    const error = validateField(name, value);
    setErrors((prev) => {
      const updated = { ...prev };
      if (error) {
        updated[name] = error;
      } else {
        delete updated[name];
        setCompletedFields((prev) => new Set([...prev, name]));
      }
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
    if (file) {
      setCompletedFields((prev) => new Set([...prev, 'file']));
    }
  };

  // Validate current step
  const validateStep = (stepId: string): boolean => {
    const step = FORM_STEPS.find((s) => s.id === stepId);
    if (!step) return false;

    let isValid = true;
    const newErrors: FormErrors = {};

    step.fields.forEach((field) => {
      const error = validateField(field, formData[field as keyof FormData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return isValid;
  };

  // Navigate steps
  const goToNextStep = () => {
    const currentStepData = FORM_STEPS[currentStep];
    if (validateStep(currentStepData.id)) {
      if (currentStep < FORM_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Handle final submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all steps
    let allValid = true;
    const allErrors: FormErrors = {};

    FORM_STEPS.forEach((step) => {
      step.fields.forEach((field) => {
        const error = validateField(field, formData[field as keyof FormData]);
        if (error) {
          allErrors[field] = error;
          allValid = false;
        }
      });
    });

    if (!allValid) {
      setErrors(allErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (onSubmit) {
        onSubmit(formData);
      } else {
        const response = await fetch('/api/intake', {
          method: 'POST',
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Submission failed');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setFormData({
          name: '',
          business: '',
          email: '',
          phone: '',
          website: '',
          services: '',
          budget: '',
          file: null,
          description: '',
          startDate: '',
        });
        setCurrentStep(0);
        setCompletedFields(new Set());
        setErrors({});
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 rounded-lg border border-green-500/30 bg-wise-bg-secondary text-center animate-pulse">
        <div className="text-6xl mb-4 animate-bounce">✓</div>
        <h3 className="text-3xl font-bold font-display text-green-400 mb-2">
          Thank You!
        </h3>
        <p className="text-wise-text-muted mb-4">
          We've received your project details. Our team will review and be in touch within 24-48 hours.
        </p>
        <p className="text-xs text-wise-text-muted">Redirecting...</p>
      </div>
    );
  }

  const currentStepData = FORM_STEPS[currentStep];
  const progressPercent = ((currentStep + 1) / FORM_STEPS.length) * 100;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-8">
      {/* Progress Indicator */}
      <div className="space-y-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-wise-text-primary">
            {currentStepData.title}
          </h3>
          <span className="text-sm text-wise-text-muted">
            Step {currentStep + 1} of {FORM_STEPS.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-wise-bg-secondary rounded-full overflow-hidden border border-green-500/20">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex gap-2">
          {FORM_STEPS.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => index < currentStep && setCurrentStep(index)}
              className={`h-2 flex-1 rounded-full transition-all ${
                index <= currentStep
                  ? index === currentStep
                    ? 'bg-green-500'
                    : 'bg-green-500/50'
                  : 'bg-wise-bg-secondary border border-green-500/20'
              }`}
              disabled={index > currentStep}
            />
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentStepData.fields.map((fieldName) => {
          const isCompleted = completedFields.has(fieldName);
          const hasError = !!errors[fieldName];

          return (
            <div
              key={fieldName}
              className={`${fieldName === 'description' ? 'md:col-span-2' : ''} relative transition-all duration-200`}
              onFocus={() => setFieldFocus(fieldName)}
              onBlur={() => setFieldFocus(null)}
            >
              {/* Label with completion indicator */}
              <div className="flex justify-between items-center mb-2">
                <label className={`text-sm font-bold transition-colors ${
                  isCompleted ? 'text-green-400' : 'text-wise-text-primary'
                }`}>
                  {fieldName === 'name' && 'Your Name *'}
                  {fieldName === 'email' && 'Email *'}
                  {fieldName === 'phone' && 'Phone Number *'}
                  {fieldName === 'business' && 'Business Name *'}
                  {fieldName === 'website' && 'Website or Portfolio (optional)'}
                  {fieldName === 'services' && 'Primary Service Needed *'}
                  {fieldName === 'budget' && 'Budget Range *'}
                  {fieldName === 'startDate' && 'Desired Start Date *'}
                  {fieldName === 'description' && 'Tell Us About Your Vision *'}
                  {fieldName === 'file' && 'Upload Reference Materials (optional)'}
                </label>
                {isCompleted && !hasError && <span className="text-green-400 text-xs">✓</span>}
              </div>

              {/* Input Field */}
              {fieldName === 'description' ? (
                <textarea
                  name={fieldName}
                  value={formData[fieldName as keyof FormData] as string}
                  onChange={handleChange}
                  required={true}
                  rows={5}
                  className={`w-full px-4 py-3 rounded bg-wise-bg-secondary border transition-all resize-none placeholder-wise-text-muted text-wise-text-primary focus:outline-none ${
                    hasError
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : fieldFocus === fieldName
                        ? 'border-green-500 focus:ring-1 focus:ring-green-500'
                        : isCompleted
                          ? 'border-green-500/50'
                          : 'border-green-500/20 hover:border-green-500/40'
                  }`}
                  placeholder="Describe your project, goals, and any specific requirements..."
                />
              ) : fieldName === 'file' ? (
                <input
                  type="file"
                  name={fieldName}
                  onChange={handleFileChange}
                  className={`w-full px-4 py-3 rounded bg-wise-bg-secondary border transition-all placeholder-wise-text-muted text-wise-text-primary focus:outline-none file:bg-green-500 file:text-wise-bg-primary file:border-0 file:px-4 file:py-2 file:rounded file:font-bold file:cursor-pointer hover:file:bg-green-600 ${
                    hasError
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : fieldFocus === fieldName
                        ? 'border-green-500 focus:ring-1 focus:ring-green-500'
                        : isCompleted
                          ? 'border-green-500/50'
                          : 'border-green-500/20 hover:border-green-500/40'
                  }`}
                />
              ) : fieldName === 'services' || fieldName === 'budget' ? (
                <select
                  name={fieldName}
                  value={formData[fieldName as keyof FormData] as string}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 rounded bg-wise-bg-secondary border transition-all text-wise-text-primary focus:outline-none appearance-none cursor-pointer ${
                    hasError
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : fieldFocus === fieldName
                        ? 'border-green-500 focus:ring-1 focus:ring-green-500'
                        : isCompleted
                          ? 'border-green-500/50'
                          : 'border-green-500/20 hover:border-green-500/40'
                  }`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2339FF14' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 1rem center',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value="">
                    {fieldName === 'services' ? 'Select a service...' : 'Select a budget range...'}
                  </option>
                  {(fieldName === 'services' ? wise2Content.serviceOptions : wise2Content.budgetOptions).map(
                    (option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    )
                  )}
                </select>
              ) : (
                <input
                  type={fieldName === 'email' ? 'email' : fieldName === 'startDate' ? 'date' : 'text'}
                  name={fieldName}
                  value={formData[fieldName as keyof FormData] as string}
                  onChange={handleChange}
                  required={fieldName !== 'website'}
                  className={`w-full px-4 py-3 rounded bg-wise-bg-secondary border transition-all placeholder-wise-text-muted text-wise-text-primary focus:outline-none ${
                    hasError
                      ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                      : fieldFocus === fieldName
                        ? 'border-green-500 focus:ring-1 focus:ring-green-500'
                        : isCompleted
                          ? 'border-green-500/50'
                          : 'border-green-500/20 hover:border-green-500/40'
                  }`}
                  placeholder={
                    fieldName === 'name'
                      ? 'Darrin Johnson'
                      : fieldName === 'email'
                        ? 'darrin@wise2.com'
                        : fieldName === 'phone'
                          ? '+1 (615) 555-0123'
                          : fieldName === 'business'
                            ? 'WISE² Defense LLC'
                            : 'https://wise2.com'
                  }
                />
              )}

              {/* Error Message with animation */}
              {hasError && (
                <p className="mt-2 text-sm text-red-400 animate-pulse">
                  {errors[fieldName]}
                </p>
              )}

              {/* Help Text */}
              {!hasError && fieldFocus === fieldName && (
                <p className="mt-2 text-xs text-wise-text-muted animate-fade-in">
                  {fieldName === 'name' && 'Your full name helps us personalize communication'}
                  {fieldName === 'email' && "We'll send updates to this email"}
                  {fieldName === 'phone' && 'For quick project coordination'}
                  {fieldName === 'business' && 'Your company or organization'}
                  {fieldName === 'website' && 'Optional: helps us understand your current presence'}
                  {fieldName === 'services' && 'Select the primary service your project needs'}
                  {fieldName === 'budget' && 'Helps us understand project scope'}
                  {fieldName === 'startDate' && 'When are you ready to begin?'}
                  {fieldName === 'description' && 'The more detail, the better our proposal'}
                  {fieldName === 'file' && 'PDF, Word, images (up to 5MB)'}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 pt-6">
        <Button
          type="button"
          onClick={goToPrevStep}
          disabled={currentStep === 0}
          variant="secondary"
          className="flex-1"
        >
          ← Previous
        </Button>

        {currentStep === FORM_STEPS.length - 1 ? (
          <Button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
            variant="primary"
            className="flex-1"
          >
            {isLoading ? 'Submitting...' : '✓ Submit Project Brief'}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={goToNextStep}
            variant="primary"
            className="flex-1"
          >
            Next →
          </Button>
        )}
      </div>

      {/* Footer */}
      <p className="text-xs text-wise-text-muted text-center">
        * Required fields • Your data is secure and confidential
      </p>

      {/* Submit Error Message */}
      {errors.submit && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
          {errors.submit}
        </div>
      )}
    </form>
  );
};

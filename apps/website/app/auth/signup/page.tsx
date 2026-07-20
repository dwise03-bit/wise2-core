'use client';

import { FormEvent, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { validateEmail, validatePassword, validatePasswordConfirm, getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/validation';
import { analytics } from '@/lib/analytics';
import { createVerificationToken } from '@/lib/email';
import { apiClient } from '@/lib/api-client';
import { useStore } from '@/lib/useStore';

interface FormErrors {
  email?: string;
  password?: string;
  confirm?: string;
}

export default function SignupPage() {
  const router = useRouter();
  const { setAuth } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Track page view
  useEffect(() => {
    analytics.track('page_view', { page: 'signup' });
  }, []);

  // Update password strength
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password));
  }, [password]);

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirm':
        return validatePasswordConfirm(password, value);
      default:
        return null;
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, field === 'email' ? email : field === 'password' ? password : confirm);
    if (error) {
      setErrors({ ...errors, [field]: error });
      analytics.track('form_error', { field, error });
    } else {
      const newErrors = { ...errors };
      delete newErrors[field as keyof FormErrors];
      setErrors(newErrors);
      analytics.track('form_field_blur', { field, valid: true });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validatePasswordConfirm(password, confirm);
    if (confirmError) newErrors.confirm = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    analytics.track('form_submit', { form: 'signup' });
    setSubmitError(null);

    if (!validateForm()) {
      analytics.track('form_error', { form: 'signup', reason: 'validation_failed' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call signup API
      const result = await apiClient.post('/api/v1/auth/signup', {
        email,
        password,
      });

      if (!result.success) {
        const errorMessage = result.error || 'Signup failed. Please try again.';
        setSubmitError(errorMessage);
        analytics.track('form_error', { form: 'signup', reason: errorMessage });
        setIsSubmitting(false);
        return;
      }

      // Store auth data
      if (result.data?.user && result.data?.tokens?.accessToken) {
        setAuth(result.data.user, result.data.tokens.accessToken);
        localStorage.setItem('auth_token', result.data.tokens.accessToken);
      }

      analytics.track('signup_complete', { email });
      analytics.flush();

      // Navigate to dashboard
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setSubmitError(errorMessage);
      console.error('Signup error:', error);
      analytics.track('form_error', { form: 'signup', reason: 'submission_failed' });
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-wise flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h1 className="text-3xl font-bold text-wise-primary mb-2">Account created!</h1>
          <p className="text-wise-muted mb-2">We've sent a verification email to:</p>
          <p className="text-wise-primary font-semibold mb-6">{email}</p>
          <p className="text-sm text-wise-muted mb-6">
            Click the link in the email to verify your account and unlock all features.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wise flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-wise-primary mb-2">WISE²</h1>
          <p className="text-wise-muted">Create your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Error Alert */}
          {submitError && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-md text-red-500 text-sm">
              {submitError}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-wise-primary mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`w-full px-4 py-2 bg-wise-surface border rounded-md text-wise-primary placeholder-wise-muted focus:outline-none transition-colors ${
                  touched.email && errors.email
                    ? 'border-red-500 focus:border-red-500'
                    : touched.email
                    ? 'border-green-500 focus:border-wise-primary'
                    : 'border-wise-subtle focus:border-wise-primary'
                }`}
                placeholder="you@example.com"
              />
              {touched.email && !errors.email && (
                <span className="absolute right-3 top-2.5 text-green-500">✓</span>
              )}
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-wise-primary mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`w-full px-4 py-2 bg-wise-surface border rounded-md text-wise-primary placeholder-wise-muted focus:outline-none transition-colors ${
                  touched.password && errors.password
                    ? 'border-red-500 focus:border-red-500'
                    : touched.password
                    ? 'border-green-500 focus:border-wise-primary'
                    : 'border-wise-subtle focus:border-wise-primary'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-wise-muted hover:text-wise-primary"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            {password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-wise-muted">Password strength:</span>
                  <span className={`text-xs font-semibold ${getPasswordStrengthColor(passwordStrength)}`}>
                    {getPasswordStrengthLabel(passwordStrength)}
                  </span>
                </div>
                <div className="w-full h-1 bg-wise-subtle rounded overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength <= 1
                        ? 'w-1/5 bg-red-500'
                        : passwordStrength <= 2
                        ? 'w-2/5 bg-orange-500'
                        : passwordStrength <= 3
                        ? 'w-3/5 bg-yellow-500'
                        : passwordStrength <= 4
                        ? 'w-4/5 bg-green-500'
                        : 'w-full bg-green-600'
                    }`}
                  />
                </div>
              </div>
            )}

            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-wise-primary mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onBlur={() => handleBlur('confirm')}
                className={`w-full px-4 py-2 bg-wise-surface border rounded-md text-wise-primary placeholder-wise-muted focus:outline-none transition-colors ${
                  touched.confirm && errors.confirm
                    ? 'border-red-500 focus:border-red-500'
                    : touched.confirm && password && confirm
                    ? 'border-green-500 focus:border-wise-primary'
                    : 'border-wise-subtle focus:border-wise-primary'
                }`}
                placeholder="••••••••"
              />
              {touched.confirm && !errors.confirm && password && confirm && (
                <span className="absolute right-3 top-2.5 text-green-500">✓</span>
              )}
            </div>
            {touched.confirm && errors.confirm && (
              <p className="mt-1 text-sm text-red-500">{errors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="w-full py-2 bg-wise-primary hover:bg-wise-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-wise-muted text-sm">
            Already have an account?{' '}
            <a href="/auth/login" className="text-wise-primary hover:text-wise-primary-hover font-semibold">
              Sign in
            </a>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-wise-subtle">
          <button className="w-full py-2 border border-wise-subtle hover:border-wise-primary text-wise-primary rounded-md transition-colors">
            Continue with Google
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-wise-muted">
          <a href="/" className="hover:text-wise-primary">← Back to home</a>
        </div>
      </div>
    </div>
  );
}

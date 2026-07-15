'use client';

import { FormEvent, useState, useEffect } from 'react';
import { validateEmail, validatePassword } from '@/lib/validation';
import { analytics } from '@/lib/analytics';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Track page view
  useEffect(() => {
    analytics.track('page_view', { page: 'login' });
  }, []);

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      default:
        return null;
    }
  };

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, field === 'email' ? email : password);
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    analytics.track('form_submit', { form: 'login', rememberMe });

    if (!validateForm()) {
      analytics.track('form_error', { form: 'login', reason: 'validation_failed' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      analytics.track('login_complete', { email });
      analytics.flush();

      setSubmitted(true);
    } catch (error) {
      console.error('Login error:', error);
      analytics.track('form_error', { form: 'login', reason: 'submission_failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-wise flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4 animate-bounce">✅</div>
          <h1 className="text-3xl font-bold text-wise-primary mb-2">Welcome back!</h1>
          <p className="text-wise-muted mb-6">You have been signed in successfully.</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
          >
            Go to Dashboard
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
          <p className="text-wise-muted">Sign in to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-wise-primary">
                Password
              </label>
              <a href="#" className="text-xs text-wise-primary hover:text-wise-primary-hover">
                Forgot?
              </a>
            </div>
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
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 bg-wise-surface border border-wise-subtle rounded cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-wise-muted cursor-pointer">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || Object.keys(errors).length > 0}
            className="w-full py-2 bg-wise-primary hover:bg-wise-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-wise font-semibold rounded-md transition-colors shadow-glow-blue-sm hover:shadow-glow-blue-md"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin mr-2">⏳</span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-wise-muted text-sm">
            Don't have an account?{' '}
            <a href="/auth/signup" className="text-wise-primary hover:text-wise-primary-hover font-semibold">
              Create one
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

'use client';

export const dynamic = 'force-dynamic';

import { FormEvent, useState, useEffect } from 'react';
import { validateEmail, validatePassword, validatePasswordConfirm, getPasswordStrength, getPasswordStrengthLabel, getPasswordStrengthColor } from '@/lib/validation';
import { analytics } from '@/lib/analytics';
import { apiClient } from '@/lib/api-client';

interface FormErrors {
  email?: string;
  password?: string;
  confirm?: string;
}

export default function SignupPage() {
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

      // Signup does NOT return auth tokens — the account requires email
      // verification before login. Show the "check your email" confirmation
      // screen rather than routing to a dashboard the user can't access yet.
      analytics.track('signup_complete', { email });
      analytics.flush();
      setIsSubmitting(false);
      setSubmitted(true);
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

        {/* OAuth Options */}
        <div className="mb-6 space-y-3">
          <a
            href="/api/auth/google/authorize"
            className="flex items-center justify-center gap-3 w-full py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </a>
          <a
            href="/api/auth/discord/authorize"
            className="flex items-center justify-center gap-3 w-full py-3 bg-[#5865F2] text-white font-semibold rounded-lg hover:bg-[#4752C4] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.3671a19.8015 19.8015 0 00-4.8851-1.5152.074.074 0 00-.0784.0371c-.211.3671-.4447.8465-.6083 1.2242a18.353 18.353 0 00-5.487 0 12.64 12.64 0 00-.6177-1.2242.077.077 0 00-.0785-.037 19.7163 19.7163 0 00-4.8852 1.515.07.07 0 00-.0330.0287C.5338 9.0957.1338 13.5007 1.9577 17.6503a.082.082 0 00.0313.0355 19.9054 19.9054 0 005.9527 3.092.08.08 0 00.087-.0276c.461-.6032.8692-1.2356 1.2171-1.8265a.081.081 0 00-.0044-.1231 12.997 12.997 0 01-1.8383-.876.083.083 0 01-.008-.138 8.678 8.678 0 00.316-.237.075.075 0 01.0784-.0109c3.856 1.7623 8.037 1.7623 11.86 0a.075.075 0 01.0785.0088c.1006.08.2091.164.316.237a.083.083 0 01-.009.138 12.926 12.926 0 01-1.8387.875.083.083 0 00-.004.1231c.3489.593.7571 1.225 1.2178 1.8265a.08.08 0 00.0867.0275 19.892 19.892 0 005.9616-3.0921.083.083 0 00.0313-.0356c1.9241-4.1044 1.3543-8.4095-.2035-12.3471a.080.080 0 00-.0331-.0287zM8.02 15.3312c-1.1825 0-2.1569-.9718-2.1569-2.1771 0-1.2052.9524-2.1771 2.1569-2.1771 1.2047 0 2.1779.9719 2.1569 2.1771 0 1.2053-.9524 2.1771-2.1569 2.1771zm7.9748 0c-1.1837 0-2.1569-.9718-2.1569-2.1771 0-1.2052.9487-2.1771 2.1569-2.1771 1.204 0 2.1746.9719 2.1569 2.1771 0 1.2053-.1529 2.1771-2.1569 2.1771z"/>
            </svg>
            Sign up with Discord
          </a>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-wise-subtle"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-wise text-wise-muted">Or continue with email</span>
          </div>
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
            <a href="/auth/signin" className="text-wise-primary hover:text-wise-primary-hover font-semibold">
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

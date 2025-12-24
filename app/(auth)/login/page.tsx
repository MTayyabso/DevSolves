'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginSchema, getZodErrors, type LoginFormData } from '@/lib/validations/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if user just registered
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.');
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Clear success message on input
    if (successMessage) setSuccessMessage('');
  };

  const validateForm = (): boolean => {
    const validationErrors = getZodErrors(loginSchema, formData);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        if (data.errors) {
          setErrors({
            ...(data.errors.email && { email: data.errors.email }),
            ...(data.errors.password && { password: data.errors.password }),
          });
        } else {
          setErrors({ general: data.message || 'Login failed. Please try again.' });
        }
        return;
      }

      // Success! Store user data and redirect
      // TODO: Integrate with proper auth state (NextAuth, context, etc.)
      localStorage.setItem('user', JSON.stringify(data.data));

      // Redirect to dashboard
      router.push('/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] shadow-lg mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome back</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">Sign in to continue your coding journey</p>
      </div>

      {/* Success message (from registration) */}
      {successMessage && (
        <div className="mb-6 p-4 bg-[var(--color-success-50)] border border-[var(--color-success-500)] rounded-lg">
          <p className="text-sm text-[var(--color-success-600)] text-center">{successMessage}</p>
        </div>
      )}

      {/* General error message */}
      {errors.general && (
        <div className="mb-6 p-4 bg-[var(--color-error-50)] border border-[var(--color-error-500)] rounded-lg">
          <p className="text-sm text-[var(--color-error-500)] text-center">{errors.general}</p>
        </div>
      )}

      <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-6 sm:p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 ${errors.email ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all focus:outline-none focus:border-[var(--color-primary-500)]`}
            />
            {errors.email && <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full h-12 px-4 pr-12 bg-[var(--bg-secondary)] border-2 ${errors.password ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] transition-all focus:outline-none focus:border-[var(--color-primary-500)]`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange} className="w-4 h-4 rounded" />
              <span className="text-sm text-[var(--text-secondary)]">Remember me</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-[var(--color-primary-600)] hover:underline">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-[var(--color-primary-600)] hover:underline">Create free account</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

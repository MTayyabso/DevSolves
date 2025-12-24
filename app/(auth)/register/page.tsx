'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerStep1Schema, registerStep2Schema, getZodErrors } from '@/lib/validations/auth';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface ApiError {
  email?: string;
  password?: string;
  name?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
    }
  };

  const validateStep1 = (): boolean => {
    const validationErrors = getZodErrors(registerStep1Schema, { name: formData.name, email: formData.email });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const validationErrors = getZodErrors(registerStep2Schema, { password: formData.password, confirmPassword: formData.confirmPassword, acceptTerms: formData.acceptTerms });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleNext = () => { if (validateStep1()) { setStep(2); setErrors({}); } };
  const handleBack = () => { setStep(1); setErrors({}); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API errors
        if (data.errors) {
          const apiErrors: ApiError = data.errors;
          setErrors({
            ...(apiErrors.email && { email: apiErrors.email }),
            ...(apiErrors.password && { password: apiErrors.password }),
            ...(apiErrors.name && { name: apiErrors.name }),
            ...(apiErrors.general && { general: apiErrors.general }),
          });

          // If email error, go back to step 1
          if (apiErrors.email) {
            setStep(1);
          }
        } else {
          setErrors({ general: data.message || 'Registration failed. Please try again.' });
        }
        return;
      }

      // Success!
      setSuccessMessage('Account created successfully! Redirecting to login...');

      // Redirect to login after short delay
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { strength: 0, label: '', color: '' };
    let s = 0;
    if (p.length >= 8) s++;
    if (/[a-z]/.test(p)) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^a-zA-Z\d]/.test(p)) s++;
    if (s <= 2) return { strength: 33, label: 'Weak', color: 'var(--color-error-500)' };
    if (s <= 3) return { strength: 66, label: 'Medium', color: 'var(--color-warning-500)' };
    return { strength: 100, label: 'Strong', color: 'var(--color-success-500)' };
  };

  const passwordStrength = getPasswordStrength();

  // Success state
  if (successMessage) {
    return (
      <div className="w-full">
        <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-6 sm:p-8 shadow-xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-success-500)] to-[var(--color-success-600)] flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Welcome to DevSolve!</h1>
          <p className="text-[var(--text-secondary)] mb-6">{successMessage}</p>
          <div className="flex justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-600)] shadow-lg mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Create your account</h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">Join thousands of developers worldwide</p>
      </div>

      {/* General error message */}
      {errors.general && (
        <div className="mb-6 p-4 bg-[var(--color-error-50)] border border-[var(--color-error-500)] rounded-lg">
          <p className="text-sm text-[var(--color-error-500)] text-center">{errors.general}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 mb-8">
        <div className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center ${step >= 1 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>1</div>
        <div className={`w-16 h-1 rounded-full ${step >= 2 ? 'bg-[var(--color-primary-500)]' : 'bg-[var(--bg-tertiary)]'}`} />
        <div className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center ${step >= 2 ? 'bg-[var(--color-primary-500)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'}`}>2</div>
      </div>

      <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-6 sm:p-8 shadow-xl">
        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Full Name</label>
              <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange}
                className={`w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 ${errors.name ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)]`} />
              {errors.name && <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Email Address</label>
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange}
                className={`w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 ${errors.email ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)]`} />
              {errors.email && <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.email}</p>}
            </div>
            <button type="button" onClick={handleNext} className="w-full h-12 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-lg transition-all">Continue</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <button type="button" onClick={handleBack} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-4">← Back</button>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Create a strong password" value={formData.password} onChange={handleChange}
                  className={`w-full h-12 px-4 pr-12 bg-[var(--bg-secondary)] border-2 ${errors.password ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)]`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">{showPassword ? '🙈' : '👁️'}</button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.password}</p>}
              {formData.password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${passwordStrength.strength}%`, backgroundColor: passwordStrength.color }} />
                  </div>
                  <p className="text-xs mt-1" style={{ color: passwordStrength.color }}>{passwordStrength.label} password</p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange}
                className={`w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 ${errors.confirmPassword ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)]`} />
              {errors.confirmPassword && <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.confirmPassword}</p>}
            </div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" name="acceptTerms" checked={formData.acceptTerms} onChange={handleChange} className="mt-1 w-4 h-4" />
              <span className="text-sm text-[var(--text-secondary)]">I agree to the <Link href="/terms" className="text-[var(--color-primary-600)] hover:underline">Terms</Link> and <Link href="/privacy" className="text-[var(--color-primary-600)] hover:underline">Privacy Policy</Link></span>
            </label>
            {errors.acceptTerms && <p className="text-sm text-[var(--color-error-500)]">{errors.acceptTerms}</p>}
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
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        )}
        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">Already have an account? <Link href="/login" className="font-semibold text-[var(--color-primary-600)] hover:underline">Sign in</Link></p>
      </div>
    </div>
  );
}

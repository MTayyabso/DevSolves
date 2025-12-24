'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!token) {
            setErrors({ general: 'Invalid reset token' });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Reset failed' });
                }
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login?reset=true');
            }, 3000);

        } catch {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="w-full">
                <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-8 shadow-xl text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-error-50)] flex items-center justify-center">
                        <svg className="w-10 h-10 text-[var(--color-error-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Invalid Reset Link</h1>
                    <p className="text-[var(--text-secondary)] mb-6">This password reset link is invalid or has expired.</p>
                    <Link href="/forgot-password" className="inline-block h-12 px-8 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-lg transition-all leading-[48px]">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="w-full">
                <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-8 shadow-xl text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-success-500)] to-[var(--color-success-600)] flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Password Reset!</h1>
                    <p className="text-[var(--text-secondary)] mb-6">Your password has been reset successfully. Redirecting to login...</p>
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
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-primary-600)] shadow-lg mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-2">Reset your password</h1>
                <p className="text-sm sm:text-base text-[var(--text-secondary)]">Enter your new password below</p>
            </div>

            {errors.general && (
                <div className="mb-6 p-4 bg-[var(--color-error-50)] border border-[var(--color-error-500)] rounded-lg">
                    <p className="text-sm text-[var(--color-error-500)] text-center">{errors.general}</p>
                </div>
            )}

            <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-6 sm:p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">New Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="Enter new password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full h-12 px-4 pr-12 bg-[var(--bg-secondary)] border-2 ${errors.password ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)]`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                        {errors.password && <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full h-12 px-4 bg-[var(--bg-secondary)] border-2 ${errors.confirmPassword ? 'border-[var(--color-error-500)]' : 'border-[var(--border-light)]'} rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)]`}
                        />
                        {errors.confirmPassword && <p className="mt-2 text-sm text-[var(--color-error-500)]">{errors.confirmPassword}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-12 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-50 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Resetting...
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </button>
                </form>
            </div>

            <div className="mt-8 text-center">
                <Link href="/login" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">← Back to login</Link>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full" /></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

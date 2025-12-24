'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided');
            return;
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`/api/auth/verify-email?token=${token}`);
                const data = await response.json();

                if (response.ok) {
                    setStatus('success');
                    setMessage(data.message);
                } else {
                    setStatus('error');
                    setMessage(data.message || 'Verification failed');
                }
            } catch {
                setStatus('error');
                setMessage('An error occurred. Please try again.');
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="w-full">
            <div className="bg-[var(--bg-primary)]/80 backdrop-blur-xl rounded-2xl border border-[var(--border-light)] p-8 shadow-xl text-center">
                {status === 'loading' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center">
                            <div className="animate-spin h-10 w-10 border-4 border-[var(--color-primary-500)] border-t-transparent rounded-full" />
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Verifying your email...</h1>
                        <p className="text-[var(--text-secondary)]">Please wait while we verify your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-success-500)] to-[var(--color-success-600)] flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Email Verified!</h1>
                        <p className="text-[var(--text-secondary)] mb-6">{message}</p>
                        <Link
                            href="/login"
                            className="inline-block h-12 px-8 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-lg transition-all leading-[48px]"
                        >
                            Sign In
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--color-error-500)] to-[var(--color-error-600)] flex items-center justify-center">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Verification Failed</h1>
                        <p className="text-[var(--text-secondary)] mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                href="/login"
                                className="block w-full h-12 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white font-semibold rounded-lg transition-all leading-[48px]"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

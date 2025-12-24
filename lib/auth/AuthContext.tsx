'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    reputation: number;
    isVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message: string; requiresVerification?: boolean }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch current user on mount
    const refreshUser = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');

            if (response.ok) {
                const data = await response.json();
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // Login
    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setUser(data.data);
                return { success: true, message: 'Login successful' };
            }

            return {
                success: false,
                message: data.message || 'Login failed',
                requiresVerification: data.requiresVerification,
            };
        } catch {
            return { success: false, message: 'An error occurred' };
        }
    };

    // Register
    const register = async (name: string, email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Don't set user - they need to verify email first
                return { success: true, message: data.message };
            }

            return { success: false, message: data.message || 'Registration failed' };
        } catch {
            return { success: false, message: 'An error occurred' };
        }
    };

    // Logout
    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } finally {
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

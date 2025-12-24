'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, X, ChevronDown, LogOut } from 'lucide-react';
import Logo from '@/app/components/ui/Logo';
import { ModeToggle } from '@/app/components/darkmode';

interface NavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

export default function Navbar({ onMenuToggle, isSidebarOpen }: NavbarProps) {
  const router = useRouter();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-light)]">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left Section - Logo & Menu Toggle */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo size="sm" showText className="hidden sm:flex" />
            <Logo size="sm" showText={false} className="sm:hidden" />
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl hidden sm:block">
          <div className={`relative transition-all duration-200 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Search questions, tags, users..."
              className="w-full h-10 pl-11 pr-4 bg-[var(--bg-secondary)] border-2 border-transparent rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:bg-[var(--bg-primary)] transition-all"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Search */}
          <button className="sm:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-primary-500)] rounded-full" />
          </button>

          {/* Dark Mode Toggle */}
          <ModeToggle />

          {/* Ask Question Button */}
          <Link
            href="/dashboard/ask"
            className="hidden md:flex items-center gap-2 h-9 px-4 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Ask Question
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-600)] flex items-center justify-center text-white font-semibold text-sm">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <ChevronDown className={`w-4 h-4 text-[var(--text-tertiary)] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-[var(--bg-primary)] rounded-xl shadow-xl border border-[var(--border-light)] z-20">
                  <div className="px-4 py-2 border-b border-[var(--border-light)]">
                    <p className="font-medium text-[var(--text-primary)]">{user?.name || 'User'}</p>
                    <p className="text-sm text-[var(--text-tertiary)]">{user?.email || 'user@example.com'}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                      Your Profile
                    </Link>
                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors">
                      Settings
                    </Link>
                  </div>
                  <div className="border-t border-[var(--border-light)] pt-1">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--color-error-500)] hover:bg-[var(--bg-secondary)] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <LogOut className="w-4 h-4" />
                      {isLoggingOut ? 'Signing out...' : 'Sign out'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

import React from 'react';
import Link from 'next/link';
import Logo from '@/app/components/ui/Logo';
import { ModeToggle } from '@/app/components/darkmode';

export default function LandingPage() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Ask Questions',
      description: 'Get help from experienced developers worldwide. Our community is always ready to assist.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI Assistant',
      description: 'Get instant help from our AI-powered assistant that understands code context.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Active Community',
      description: 'Join thousands of developers sharing knowledge and solving problems together.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      title: 'Tag System',
      description: 'Organize and find content easily with our comprehensive tagging system.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      title: 'Reputation System',
      description: 'Build your reputation by helping others and get recognized for your contributions.',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Fast & Reliable',
      description: 'Built with modern technologies ensuring fast load times and reliable performance.',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Developers' },
    { value: '100K+', label: 'Questions' },
    { value: '250K+', label: 'Answers' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-primary)]/95 backdrop-blur-md border-b border-[var(--border-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Features
              </Link>
              <Link href="#community" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Community
              </Link>
              <Link href="/login" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                Sign In
              </Link>
              <ModeToggle />
              <Link
                href="/register"
                className="h-9 px-4 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-sm font-medium rounded-lg transition-colors flex items-center"
              >
                Get Started
              </Link>
            </div>
            <div className="md:hidden flex items-center gap-3">
              <ModeToggle />
              <Link href="/login" className="text-sm font-medium text-[var(--color-primary-600)]">
                Sign In
              </Link>
              <Link
                href="/register"
                className="h-9 px-4 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-sm font-medium rounded-lg transition-colors flex items-center"
              >
                Join
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-50)] via-transparent to-[var(--color-accent-50)] opacity-50" />

        {/* Animated Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-primary-500)] rounded-full opacity-10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-accent-500)] rounded-full opacity-10 blur-3xl animate-float delay-200" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-100)] text-[var(--color-primary-700)] text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-[var(--color-primary-500)] rounded-full animate-pulse" />
              Now with AI-powered assistance
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
              Where developers
              <span className="block bg-gradient-to-r from-[var(--color-primary-600)] to-[var(--color-accent-600)] bg-clip-text text-transparent">
                solve problems together
              </span>
            </h1>

            {/* Subheading */}
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-[var(--text-secondary)] mb-10">
              Join the international coding Q&A platform with AI-powered assistance.
              Ask questions, share knowledge, and build your reputation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto h-12 px-8 bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-base font-semibold rounded-lg shadow-lg shadow-[var(--color-primary-500)]/25 transition-all flex items-center justify-center gap-2"
              >
                Start for Free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto h-12 px-8 border-2 border-[var(--border-light)] hover:border-[var(--color-primary-400)] text-[var(--text-primary)] text-base font-semibold rounded-lg transition-all flex items-center justify-center"
              >
                Explore Dashboard
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center justify-center gap-4">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-[var(--color-primary-400)] to-[var(--color-accent-500)] flex items-center justify-center text-white text-xs font-bold"
                    style={{ zIndex: 5 - i }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">50,000+</span> developers already joined
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-[var(--color-primary-600)]">{stat.value}</div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Everything you need to code better
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-[var(--text-secondary)]">
              Powerful features designed to help you learn, share, and grow as a developer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-light)] hover:border-[var(--color-primary-400)] hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-accent-600)] flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-[var(--text-secondary)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-[var(--color-primary-600)] to-[var(--color-accent-700)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to start solving problems?
          </h2>
          <p className="text-lg text-white/80 mb-10">
            Join thousands of developers who are already sharing knowledge and growing together.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-white/90 text-[var(--color-primary-600)] text-base font-semibold rounded-lg transition-all flex items-center justify-center"
            >
              Create Free Account
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto h-12 px-8 border-2 border-white/30 hover:bg-white/10 text-white text-base font-semibold rounded-lg transition-all flex items-center justify-center"
            >
              Explore Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--bg-secondary)] border-t border-[var(--border-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
              <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
              <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">
              © 2024 DevSolve. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

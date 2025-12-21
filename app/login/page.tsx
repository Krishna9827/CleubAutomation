import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Login - Cleub Automation',
  description: 'Sign in or create an account to access Cleub Automation luxury home automation planning tools and project management.',
  keywords: [
    'login',
    'sign in',
    'account',
    'home automation login',
    'Cleub Automation',
  ],
  openGraph: {
    title: 'Login - Cleub Automation',
    description: 'Sign in or create an account to access Cleub Automation luxury home automation planning tools.',
    url: 'https://www.cleub.com/login',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.cleub.com/login',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-[#F5F5F3] text-sm tracking-[0.2em] uppercase">Loading...</div>
      </div>
    }>
      <LoginClient />
    </Suspense>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import RequirementsClient from './RequirementsClient';

export const metadata: Metadata = {
  title: 'Requirements | Cleub Automation',
  description: 'Configure room requirements for your smart home automation project.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RequirementsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <RequirementsClient />
    </Suspense>
  );
}

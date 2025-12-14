import type { Metadata } from 'next';
import { Suspense } from 'react';
import RoomSelectionClient from './RoomSelectionClient';

export const metadata: Metadata = {
  title: 'Room Selection | Cleub Automation',
  description: 'Select rooms for your smart home automation project.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RoomSelectionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <RoomSelectionClient />
    </Suspense>
  );
}

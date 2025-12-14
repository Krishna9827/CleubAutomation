import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Project History | Cleub Automation',
  description: 'View your project history.',
  robots: {
    index: false,
    follow: false,
  },
};

// Redirect to my-projects
export default function HistoryPage() {
  redirect('/my-projects');
}

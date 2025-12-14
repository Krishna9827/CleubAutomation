import type { Metadata } from 'next';
import FinalReviewClient from './FinalReviewClient';

export const metadata: Metadata = {
  title: 'Final Review | Cleub Automation',
  description: 'Review and finalize your smart home automation project.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function FinalReviewPage() {
  return <FinalReviewClient />;
}

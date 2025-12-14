import type { Metadata } from 'next';
import PlannerClient from './PlannerClient';

export const metadata: Metadata = {
  title: 'Planner | Cleub Automation',
  description: 'Plan and configure rooms for your smart home automation project.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PlannerPage() {
  return <PlannerClient />;
}

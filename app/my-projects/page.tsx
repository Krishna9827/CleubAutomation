import type { Metadata } from 'next';
import MyProjectsClient from './MyProjectsClient';

export const metadata: Metadata = {
  title: 'My Projects | Cleub Automation',
  description: 'View and manage your smart home automation projects.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MyProjectsPage() {
  return <MyProjectsClient />;
}

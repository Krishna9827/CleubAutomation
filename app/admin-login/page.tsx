import type { Metadata } from 'next';
import AdminLoginClient from './AdminLoginClient';

export const metadata: Metadata = {
  title: 'Admin Login | Cleub Automation',
  description: 'Admin login portal for Cleub Automation management system.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLoginPage() {
  return <AdminLoginClient />;
}

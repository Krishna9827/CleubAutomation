import type { Metadata } from 'next';
import CookiePolicyClient from './CookiePolicyClient';

export const metadata: Metadata = {
  title: 'Cookie Policy - Cleub Automation',
  description: 'Learn how Cleub Automation uses cookies and digital identifiers to ensure flawless interaction, security, and a premium user experience on our luxury home automation platform.',
  keywords: [
    'cookie policy',
    'cookies',
    'digital identifiers',
    'home automation cookies',
    'Cleub Automation privacy',
    'browser cookies',
    'session management',
  ],
  openGraph: {
    title: 'Cookie Policy - Cleub Automation',
    description: 'Learn how Cleub Automation uses cookies to ensure flawless interaction and security on our luxury home automation platform.',
    url: 'https://www.cleub.com/cookie-policy',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.cleub.com/cookie-policy',
  },
};

// JSON-LD for Cookie Policy Page
const cookieSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Cookie Policy - Cleub Automation',
  description: 'Cookie Policy for Cleub Automation luxury home automation platform.',
  publisher: {
    '@type': 'Organization',
    name: 'Cleub Automation',
    url: 'https://www.cleub.com',
  },
  mainEntity: {
    '@type': 'WebPage',
    name: 'Cookie Policy',
    dateModified: '2025-02-12',
    inLanguage: 'en-US',
  },
};

export default function CookiePolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(cookieSchema) }}
      />
      <CookiePolicyClient />
    </>
  );
}

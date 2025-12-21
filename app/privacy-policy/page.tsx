import type { Metadata } from 'next';
import PrivacyPolicyClient from './PrivacyPolicyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy - Cleub Automation',
  description: 'Your privacy is our priority. Learn how Cleub Automation protects your personal and project data with industry-leading security protocols for luxury home automation systems.',
  keywords: [
    'privacy policy',
    'data protection',
    'home automation privacy',
    'Cleub Automation privacy',
    'smart home security',
    'data security',
    'GDPR compliance',
  ],
  openGraph: {
    title: 'Privacy Policy - Cleub Automation',
    description: 'Your privacy is our priority. Learn how Cleub Automation protects your personal and project data with industry-leading security protocols.',
    url: 'https://www.cleub.com/privacy-policy',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.cleub.com/privacy-policy',
  },
};

// JSON-LD for Privacy Policy Page
const privacySchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy - Cleub Automation',
  description: 'Privacy Policy for Cleub Automation luxury home automation services.',
  publisher: {
    '@type': 'Organization',
    name: 'Cleub Automation',
    url: 'https://www.cleub.com',
  },
  mainEntity: {
    '@type': 'WebPage',
    name: 'Privacy Policy',
    dateModified: '2025-02-12',
    inLanguage: 'en-US',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }}
      />
      <PrivacyPolicyClient />
    </>
  );
}

import type { Metadata } from 'next';
import TermsClient from './TermsClient';

export const metadata: Metadata = {
  title: 'Terms & Conditions - Cleub Automation',
  description: 'Read the Terms and Conditions governing the use of Cleub Automation luxury home automation services, digital properties, and advisory services.',
  keywords: [
    'terms and conditions',
    'terms of service',
    'home automation terms',
    'Cleub Automation terms',
    'service agreement',
    'legal terms',
  ],
  openGraph: {
    title: 'Terms & Conditions - Cleub Automation',
    description: 'Read the Terms and Conditions governing the use of Cleub Automation luxury home automation services.',
    url: 'https://cleubautomation.com/terms',
    type: 'website',
  },
  alternates: {
    canonical: 'https://cleubautomation.com/terms',
  },
};

// JSON-LD for Terms Page
const termsSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms & Conditions - Cleub Automation',
  description: 'Terms and Conditions for Cleub Automation luxury home automation services.',
  publisher: {
    '@type': 'Organization',
    name: 'Cleub Automation',
    url: 'https://cleubautomation.com',
  },
  mainEntity: {
    '@type': 'WebPage',
    name: 'Terms and Conditions',
    dateModified: '2025-02-12',
    inLanguage: 'en-US',
  },
};

export default function TermsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }}
      />
      <TermsClient />
    </>
  );
}

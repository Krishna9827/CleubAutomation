import type { Metadata } from 'next';
import InquiryClient from './InquiryClient';

export const metadata: Metadata = {
  title: 'Inquiry - Get a Quote | Cleub Automation',
  description: 'Submit an inquiry for luxury home automation, smart security systems, or premium audio-visual installations. Get personalized consultation from Cleub Automation experts.',
  keywords: [
    'home automation quote',
    'smart home inquiry',
    'automation consultation',
    'luxury home automation pricing',
    'Cleub Automation contact',
    'get a quote',
  ],
  openGraph: {
    title: 'Inquiry - Get a Quote | Cleub Automation',
    description: 'Submit an inquiry for luxury home automation and smart home solutions. Get personalized consultation from our experts.',
    url: 'https://www.cleub.com/inquiry',
    type: 'website',
  },
  alternates: {
    canonical: 'https://www.cleub.com/inquiry',
  },
};

// JSON-LD for Contact/Inquiry Page
const inquirySchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Inquiry - Cleub Automation',
  description: 'Submit an inquiry for luxury home automation services.',
  mainEntity: {
    '@type': 'Organization',
    name: 'Cleub Automation',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9667603999',
      contactType: 'sales',
      email: 'support@cleub.com',
      areaServed: 'IN',
      availableLanguage: ['English', 'Hindi'],
    },
  },
};

export default function InquiryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(inquirySchema) }}
      />
      <InquiryClient />
    </>
  );
}

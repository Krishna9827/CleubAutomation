import type { Metadata } from 'next';
import AboutUsClient from './AboutUsClient';

export const metadata: Metadata = {
  title: 'About Cleub - Leading Luxury Home Automation Experts',
  description: 'Pioneers in AI-driven home automation with 8+ years of excellence. Delivering seamless intelligent living for ultra-luxury estates across India. KNX Certified, Crestron, Control4, Savant integration specialists.',
  keywords: [
    'home automation experts',
    'luxury automation company',
    'smart home pioneers',
    'Cleub Automation about',
    'KNX certified',
    'Crestron specialists',
    'Control4 integration',
    'Savant systems',
    'The Cleub Standard',
  ],
  openGraph: {
    title: 'About Cleub - Leading Luxury Home Automation Experts',
    description: 'Pioneers in AI-driven home automation with 8+ years of excellence. Certified System Architects delivering The Cleub Standard.',
    url: 'https://cleubautomation.com/about',
    type: 'website',
  },
  alternates: {
    canonical: 'https://cleubautomation.com/about',
  },
};

// JSON-LD for About Page (Organization with more detail)
const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  mainEntity: {
    '@type': 'Organization',
    name: 'Cleub Automation',
    alternateName: 'The Cleub Standard',
    description: 'Certified System Architects delivering bespoke luxury home automation, intelligent security systems, and premium audio-visual experiences for ultra-luxury estates.',
    foundingDate: '2017',
    slogan: 'Effortless life, engineered beyond doubt.',
    knowsAbout: [
      'KNX Automation Systems',
      'Crestron Integration',
      'Control4 Systems',
      'Savant Smart Home',
      'DALI Lighting Control',
      'Home Theater Design',
      'Dolby Atmos Installation',
      'THX Certified Systems',
      'Smart Security Systems',
      'Lifecycle Planning',
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'certification',
        name: 'KNX Certified Partner',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'certification',
        name: 'LOXONE Certified',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'certification',
        name: 'Crestron Certified',
      },
    ],
    areaServed: {
      '@type': 'Country',
      name: 'India',
    },
  },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutUsClient />
    </>
  );
}

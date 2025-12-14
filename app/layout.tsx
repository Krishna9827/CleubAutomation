import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Montserrat } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { Providers } from './providers';

// Optimize fonts with Next.js font system
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
  weight: ['300', '400', '500', '600', '700'],
});

// Default metadata for all pages - can be overridden per page
export const metadata: Metadata = {
  metadataBase: new URL('https://cleubautomation.com'),
  title: {
    default: 'Cleub Automation - Bespoke Luxury Home Automation & Intelligent Living',
    template: '%s | Cleub Automation',
  },
  description: 'Seamless AI-driven home automation, intelligent security systems, and premium audio-visual theatres for discerning clients. Experience effortless luxury with Cleub\'s bespoke smart home solutions.',
  keywords: [
    'luxury home automation',
    'smart home systems',
    'intelligent security',
    'premium home theater',
    'AI-driven automation',
    'bespoke lighting control',
    'smart access systems',
    'ultra-luxury estates',
    'KNX certified',
    'Crestron',
    'Control4',
    'Savant',
  ],
  authors: [{ name: 'Cleub Automation', url: 'https://cleubautomation.com' }],
  creator: 'Cleub Automation',
  publisher: 'Cleub Automation',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cleubautomation.com',
    siteName: 'Cleub Automation',
    title: 'Cleub Automation - Bespoke Luxury Home Automation',
    description: 'Seamless AI-driven home automation, intelligent security, and premium audio-visual experiences for ultra-luxury estates. Effortless life, engineered beyond doubt.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cleub Automation - Luxury Home Automation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cleubautomation',
    creator: '@cleubautomation',
    title: 'Cleub Automation - Bespoke Luxury Home Automation',
    description: 'Seamless intelligent home automation with AI-driven security and premium audio-visual systems for discerning clients.',
    images: ['/images/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://cleubautomation.com',
  },
  category: 'Technology',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0A0A',
};

// JSON-LD Structured Data for Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Cleub Automation',
  alternateName: 'Cleub',
  url: 'https://cleubautomation.com',
  logo: 'https://cleubautomation.com/logo.png',
  description: 'Certified System Architects delivering bespoke luxury home automation, intelligent security systems, and premium audio-visual experiences for ultra-luxury estates.',
  foundingDate: '2017',
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    minValue: 50,
    maxValue: 100,
  },
  slogan: 'Effortless life, engineered beyond doubt.',
  knowsAbout: [
    'Home Automation',
    'KNX Systems',
    'Crestron Integration',
    'Control4',
    'Savant',
    'DALI Lighting',
    'Smart Security Systems',
    'Home Theater Design',
    'Audio-Visual Integration',
  ],
  sameAs: [
    'https://www.instagram.com/cleubautomation',
    'https://www.linkedin.com/company/cleubautomation',
    'https://twitter.com/cleubautomation',
    'https://www.facebook.com/cleubautomation',
  ],
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: 'Katra Chowk',
      addressLocality: 'Katra',
      addressRegion: 'Jammu & Kashmir',
      postalCode: '182301',
      addressCountry: 'IN',
    },
    {
      '@type': 'PostalAddress',
      addressLocality: 'Noida',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    {
      '@type': 'PostalAddress',
      addressLocality: 'Gurgaon',
      addressRegion: 'Haryana',
      addressCountry: 'IN',
    },
    {
      '@type': 'PostalAddress',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      addressCountry: 'IN',
    },
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-9667603999',
    contactType: 'customer service',
    email: 'support@cleub.com',
    availableLanguage: ['English', 'Hindi'],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '4000',
    bestRating: '5',
    worstRating: '1',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      className={`${playfairDisplay.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}

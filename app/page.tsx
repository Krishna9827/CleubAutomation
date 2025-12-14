import { getPublishedTestimonials } from '@/lib/data/testimonials';
import PremiumLandingClient from './PremiumLandingClient';

// This page is statically generated at build time
// Testimonials are fetched server-side and passed to client component
export const revalidate = 3600; // Revalidate every hour for ISR

// Service schema for JSON-LD
const servicesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Cleub Automation Services',
  description: 'Premium home automation services for luxury estates',
  itemListElement: [
    {
      '@type': 'Service',
      position: 1,
      name: 'Home Automation',
      description: 'Intelligent home control systems with KNX, Crestron, Control4, and Savant integration for seamless living.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Home Automation',
      areaServed: 'India',
    },
    {
      '@type': 'Service',
      position: 2,
      name: 'Audio-Video Theatres',
      description: 'Cinema-grade home theater systems with Dolby Atmos and THX-certified installations.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Home Entertainment',
    },
    {
      '@type': 'Service',
      position: 3,
      name: 'Smart Lighting & Switches',
      description: 'DALI and KNX certified smart lighting with adaptive control and scene management.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Lighting Control',
    },
    {
      '@type': 'Service',
      position: 4,
      name: 'Security & Surveillance',
      description: 'AI-powered security systems with 24/7 intelligent monitoring and analytics.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Security Systems',
    },
    {
      '@type': 'Service',
      position: 5,
      name: 'Digital Locks',
      description: 'Biometric and smart access control systems for enhanced security.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Access Control',
    },
    {
      '@type': 'Service',
      position: 6,
      name: 'Networking',
      description: 'Robust connectivity infrastructure with enterprise-grade networking.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Network Infrastructure',
    },
    {
      '@type': 'Service',
      position: 7,
      name: 'Curtain & Gate Motor',
      description: 'Automated window treatments and motorized gates with smart control.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Motorization',
    },
    {
      '@type': 'Service',
      position: 8,
      name: 'Expert Consultation',
      description: 'Unbiased advisory services with System Audit and Lifecycle Planning.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Consulting',
    },
  ],
};

// FAQ Schema for common questions
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is luxury home automation?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Luxury home automation integrates intelligent systems for lighting, security, entertainment, and climate control into a seamless experience. At Cleub Automation, we use KNX, Crestron, Control4, and Savant systems to deliver The Cleub Standard of high-reliability automation.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why choose wired automation over WiFi-based systems?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wired systems like KNX provide true local control that works even without internet connectivity. Unlike WiFi systems that fail when connectivity drops, KNX Twisted Pair and Ethernet backbones ensure your home operates flawlessly 24/7.',
      },
    },
    {
      '@type': 'Question',
      name: 'What areas does Cleub Automation serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cleub Automation serves ultra-luxury estates across India, with offices in New Delhi, Gurgaon, Noida, and Katra (Jammu & Kashmir). We work with discerning homeowners, architects, and builders nationwide.',
      },
    },
  ],
};

export default async function HomePage() {
  // Fetch testimonials server-side (this runs at build time for SSG)
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      {/* Inject structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      {/* Pass server-fetched data to client component */}
      <PremiumLandingClient initialTestimonials={testimonials} />
    </>
  );
}

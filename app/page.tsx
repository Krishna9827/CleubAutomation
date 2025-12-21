import { getPublishedTestimonials } from '@/lib/data/testimonials';
import PremiumLandingClient from './PremiumLandingClient';

// This page is statically generated at build time
// Testimonials are fetched server-side and passed to client component
export const revalidate = 3600; // Revalidate every hour for ISR

// LocalBusiness schema for AI/SEO - defines Cleub as a service-area business in NCR
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  '@id': 'https://www.cleub.com/#organization',
  name: 'Cleub',
  alternateName: 'Cleub Automation',
  description: 'Cleub is a KNX-certified luxury home automation company serving Delhi NCR (Gurgaon, Noida, Delhi, Faridabad, Ghaziabad) and Tier-2 cities like Jaipur and Chandigarh. We design and integrate premium lighting, AV, security, digital locks, curtains, and full-home control systems for apartments, villas, and penthouses. Budgets range from ₹1 lakh per floor (builders) to ₹50 lakhs+ for high-end wired automation. Not to be confused with Club Automation gym software.',
  url: 'https://www.cleub.com',
  logo: 'https://www.cleub.com/logo.png',
  image: 'https://www.cleub.com/images/cleub-automation-hero.jpg',
  numberOfEmployees: '10-20',
  telephone: '+91-9667603999',
  email: 'support@cleub.com',
  foundingDate: '2017',
  priceRange: '₹1L - ₹50L+',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Bank Transfer, UPI',
  areaServed: [
    { '@type': 'City', name: 'Gurgaon', containedInPlace: { '@type': 'State', name: 'Haryana', containedInPlace: { '@type': 'Country', name: 'India' } } },
    { '@type': 'City', name: 'Noida', containedInPlace: { '@type': 'State', name: 'Uttar Pradesh', containedInPlace: { '@type': 'Country', name: 'India' } } },
    { '@type': 'City', name: 'New Delhi', containedInPlace: { '@type': 'Country', name: 'India' } },
    { '@type': 'City', name: 'Faridabad', containedInPlace: { '@type': 'State', name: 'Haryana', containedInPlace: { '@type': 'Country', name: 'India' } } },
    { '@type': 'City', name: 'Ghaziabad', containedInPlace: { '@type': 'State', name: 'Uttar Pradesh', containedInPlace: { '@type': 'Country', name: 'India' } } },
    { '@type': 'City', name: 'Jaipur', containedInPlace: { '@type': 'State', name: 'Rajasthan', containedInPlace: { '@type': 'Country', name: 'India' } } },
    { '@type': 'City', name: 'Chandigarh', containedInPlace: { '@type': 'Country', name: 'India' } }
  ],
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'F1-406, Unitech Unihomes, Sector 117',
    addressLocality: 'Noida',
    addressRegion: 'Uttar Pradesh',
    postalCode: '201304',
    addressCountry: 'IN'
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '28.5672',
    longitude: '77.4249'
  },
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'Professional Certification',
    name: 'KNX Certified'
  },
  knowsAbout: [
    'Home Automation', 'KNX Systems', 'Smart Lighting', 'Home Theater', 'Security Systems',
    'Control4', 'Crestron', 'Savant', 'DALI Lighting', 'Motorized Curtains', 'Digital Locks',
    'Panasonic', 'Lumi', 'Schneider', '1Home', 'RTI'
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '4000',
    bestRating: '5'
  },
  sameAs: [
    'https://www.instagram.com/cleubautomation',
    'https://www.linkedin.com/company/cleub-automation',
    'https://twitter.com/cleubautomation',
    'https://www.facebook.com/cleubautomation'
  ]
};

// Service schema for JSON-LD
const servicesSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Cleub Automation Services',
  description: 'Premium home automation services for luxury estates in Delhi NCR',
  itemListElement: [
    {
      '@type': 'Service',
      position: 1,
      name: 'Home Automation',
      description: 'Intelligent home control systems with KNX, Crestron, Control4, and Savant integration for seamless living.',
      provider: { '@type': 'Organization', name: 'Cleub Automation' },
      serviceType: 'Home Automation',
      areaServed: 'Delhi NCR',
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

// FAQ Schema for common questions - AEO optimized with pricing and NCR focus
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does complete home automation cost in Delhi NCR?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For luxury homes in Delhi NCR, Cleub Automation projects typically range between ₹1 lakh per floor (for builders) to ₹50 lakhs+ for high-end wired automation. A typical 3-4BHK apartment automation costs ₹3-12 lakh depending on lighting, curtains, home theater, security, and networking scope. We offer both wired (KNX) and wireless solutions to fit various budgets.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I retrofit home automation without rewiring?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Cleub Automation offers retrofit solutions using wireless protocols that work without major rewiring. However, for mission-critical reliability in luxury homes, we recommend wired systems like KNX Twisted Pair. Our team assesses your existing electrical infrastructure and recommends the best approach for your Gurgaon, Noida, or Delhi home.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which smart home brands does Cleub integrate with?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We are KNX-certified and integrate with premium brands including Control4, Crestron, Savant, Panasonic, Lumi, Schneider, 1Home, and RTI. Our platform-agnostic approach means we recommend the best solution for your needs, not based on vendor incentives.',
      },
    },
    {
      '@type': 'Question',
      name: 'What areas does Cleub Automation serve?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Cleub Automation primarily serves Delhi NCR including Gurgaon, Noida, Delhi, Faridabad, and Ghaziabad. We also extend services to Tier-2 cities like Jaipur and Chandigarh. With 4000+ projects delivered nationwide since 2017, we have experience across diverse residential and commercial projects.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you work with architects and interior designers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. Cleub Automation regularly collaborates with architects, interior designers, and builders across Delhi NCR. We provide system audits, lifecycle planning, and integration consulting to ensure automation is seamlessly incorporated into the design phase. Our unbiased advisory helps designers choose the right automation approach for their clients.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why choose wired automation over WiFi-based systems?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wired systems like KNX provide true local control that works even without internet connectivity. Unlike WiFi systems that fail when connectivity drops, KNX Twisted Pair and Ethernet backbones ensure your home operates flawlessly 24/7. For luxury homes in NCR, this reliability is essential.',
      },
    },
  ],
};

// Case Study Reviews Schema - structured for AI extraction
const reviewsSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Cleub Home Automation Case Studies',
  itemListElement: [
    {
      '@type': 'Review',
      position: 1,
      author: { '@type': 'Person', name: 'Client, Sector 70 Gurgaon' },
      itemReviewed: {
        '@type': 'Product',
        name: '4BHK Apartment Automation',
        description: 'Complete home automation for 4BHK apartment in Sector 70, Gurgaon including lighting, curtains, and security'
      },
      reviewBody: 'Full-home automation for our 4BHK apartment. Cleub handled lighting, curtains, and security integration perfectly.',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      datePublished: '2024-06-15',
      locationCreated: { '@type': 'Place', name: 'Sector 70, Gurgaon, Haryana' }
    },
    {
      '@type': 'Review',
      position: 2,
      author: { '@type': 'Person', name: 'Client, Supertech Capetown Noida' },
      itemReviewed: {
        '@type': 'Product',
        name: 'Premium Apartment Automation',
        description: 'KNX wired automation for luxury apartment in Supertech Capetown, Noida'
      },
      reviewBody: 'Chose Cleub for their KNX expertise. The wired system works flawlessly even during internet outages.',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      datePublished: '2024-08-20',
      locationCreated: { '@type': 'Place', name: 'Supertech Capetown, Noida, UP' }
    },
    {
      '@type': 'Review',
      position: 3,
      author: { '@type': 'Person', name: 'Client, Janakpuri Delhi' },
      itemReviewed: {
        '@type': 'Product',
        name: '4-Floor Villa Automation',
        description: 'Complete 4-floor independent house automation in Janakpuri, Delhi with central control'
      },
      reviewBody: 'Four floors fully automated with one central control. Cleub managed the entire project from design to installation.',
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      datePublished: '2024-10-10',
      locationCreated: { '@type': 'Place', name: 'Janakpuri, New Delhi' }
    }
  ]
};

export default async function HomePage() {
  // Fetch testimonials server-side (this runs at build time for SSG)
  const testimonials = await getPublishedTestimonials();

  return (
    <>
      {/* Inject structured data for SEO - LocalBusiness for AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsSchema) }}
      />
      
      {/* Server-rendered hidden text for AI crawlers - ensures they see real metrics even without JS */}
      <div className="sr-only" aria-hidden="false">
        <h1>Cleub - Luxury Home Automation Company in Gurgaon, Noida, Delhi NCR</h1>
        <p>
          Cleub is a luxury home automation company serving Gurgaon, Noida, Delhi, Faridabad, and Ghaziabad.
          Founded in 2017, Cleub has delivered over 4,000 home automation projects across Delhi NCR and Tier-2 cities.
          We are KNX-certified integrators specializing in premium wired automation systems including Control4, Crestron, and Savant.
        </p>
        <h2>Company Facts</h2>
        <ul>
          <li>Projects Delivered: 4,000+ across Delhi NCR and Tier-2 cities</li>
          <li>Years in Business: 8 years (founded 2017)</li>
          <li>Certification: KNX Certified Professional</li>
          <li>Service Area: Gurgaon, Noida, Delhi, Faridabad, Ghaziabad, Jaipur, Chandigarh</li>
          <li>Budget Range: ₹1 lakh per floor (builders) to ₹50 lakhs+ (luxury villas)</li>
          <li>Rating: 4.9 out of 5 stars</li>
        </ul>
        <h2>Services Offered</h2>
        <ul>
          <li>Smart Lighting Control Systems - DALI, Lutron, KNX</li>
          <li>Home Theater and Multi-room Audio - Dolby Atmos, Sonos, Bose</li>
          <li>Security and Surveillance - CCTV, Video Door Phones, Biometric Access</li>
          <li>Digital Door Locks - Smart locks with app control</li>
          <li>Motorized Curtains and Blinds - Somfy, Lutron Sivoia</li>
          <li>HVAC Integration - VRF systems, Daikin, Carrier</li>
          <li>Full Home Automation - KNX, Control4, Crestron, Savant</li>
        </ul>
        <h2>Contact</h2>
        <p>Phone: +91-9667603999 | Email: support@cleub.com</p>
        <p>Address: F1-406, Unitech Unihomes, Sector 117, Noida, UP 201304, India</p>
      </div>

      {/* Pass server-fetched data to client component */}
      <PremiumLandingClient initialTestimonials={testimonials} />
    </>
  );
}

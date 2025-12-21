import type { Metadata } from 'next';
import FaqClient from './FaqClient';
import { adminService } from '@/supabase/adminService';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Cleub Automation - Home Automation Delhi NCR',
  description: 'Find answers to common questions about luxury home automation costs, retrofit options, KNX systems, and our services in Gurgaon, Noida, Delhi, and NCR. Budget ranges from ₹1L to ₹50L+.',
  keywords: ['home automation FAQ', 'smart home questions', 'Cleub Automation support', 'luxury automation help', 'home automation cost Delhi NCR', 'KNX automation India', 'retrofit smart home'],
  openGraph: {
    title: 'Frequently Asked Questions | Cleub Automation',
    description: 'Find answers to common questions about luxury home automation in Delhi NCR.',
    type: 'website',
  },
};

async function getPublishedFaqs() {
  try {
    // Get general FAQs (not linked to any blog)
    const faqs = await adminService.getPublishedFaqs();
    return faqs;
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return [];
  }
}

// Generate dynamic FAQPage schema from fetched FAQs
function generateFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();
  const faqSchema = generateFaqSchema(faqs);

  return (
    <>
      {/* Dynamic FAQPage schema for AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FaqClient faqs={faqs} />
    </>
  );
}

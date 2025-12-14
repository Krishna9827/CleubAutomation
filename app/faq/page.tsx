import type { Metadata } from 'next';
import FaqClient from './FaqClient';
import { adminService } from '@/supabase/adminService';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Cleub Automation',
  description: 'Find answers to common questions about luxury home automation, our services, installation process, and support at Cleub Automation.',
  keywords: ['home automation FAQ', 'smart home questions', 'Cleub Automation support', 'luxury automation help'],
  openGraph: {
    title: 'Frequently Asked Questions | Cleub Automation',
    description: 'Find answers to common questions about luxury home automation.',
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

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();

  return <FaqClient faqs={faqs} />;
}

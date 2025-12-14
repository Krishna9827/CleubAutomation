import { createClient } from '@/lib/supabase/server';

export interface Testimonial {
  id: string;
  clientName: string;
  propertyType: string;
  location: string;
  date: string;
  quote: string;
  projectDetails?: string;
  features?: string[];
  results?: string[];
  videoUrl?: string;
  is_published?: boolean;
}

// Default testimonials for fallback
export const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    clientName: "A. Sharma, Luxury Villa Owner",
    propertyType: "Smart Luxury Villa",
    location: "New Delhi",
    date: "September 2025",
    quote: "Flawless installation and the most responsive support team we've worked with.",
    projectDetails: "A comprehensive home automation project for a 10,000 sq ft villa featuring cutting-edge technology integration across lighting, security, entertainment, and climate control systems.",
    features: ["Voice-Controlled Lighting", "Smart Security System", "Home Theater", "Climate Control", "Automated Curtains", "Smart Door Locks"],
    results: ["40% reduction in energy consumption", "Enhanced security with 24/7 monitoring", "Seamless integration of all home systems", "Increased property value"],
    videoUrl: "/videos/curtain2.mp4"
  },
  {
    id: '2',
    clientName: "R. Kapoor, Studio Owner",
    propertyType: "Professional Recording Studio",
    location: "Mumbai",
    date: "August 2025",
    quote: "The audio-visual integration is perfect. Every detail was considered in the setup.",
    projectDetails: "Complete studio automation with professional-grade audio systems and acoustic optimization.",
    features: ["Professional Audio Setup", "Acoustic Treatment", "Lighting Control", "Recording Systems"],
    results: ["Studio-quality sound", "Seamless workflow integration", "Professional-grade output"],
    videoUrl: "/videos/setup.mp4"
  },
  {
    id: '3',
    clientName: "M. Patel, Tech Entrepreneur",
    propertyType: "Smart Penthouse",
    location: "Bangalore",
    date: "July 2025",
    quote: "True innovation. My home now responds to my every need before I even ask.",
    projectDetails: "AI-powered penthouse automation with predictive systems and seamless voice control.",
    features: ["AI Integration", "Voice Control", "Predictive Automation", "Smart Appliances"],
    results: ["50% energy savings", "Fully automated daily routines", "Enhanced security"],
    videoUrl: "/videos/automation.mp4"
  }
];

/**
 * Fetch published testimonials from Supabase
 * Used for SSG on the homepage
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    
    // Try to fetch all testimonials (is_published column may not exist)
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching testimonials:', error);
      return defaultTestimonials;
    }

    if (!data || data.length === 0) {
      return defaultTestimonials;
    }

    // Transform database format to component format
    return data.map(item => ({
      id: item.id,
      clientName: item.client_name || 'Valued Client',
      propertyType: item.property_type || 'Luxury Estate',
      location: item.location || 'India',
      date: item.date || new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      quote: item.quote || '',
      projectDetails: item.project_details,
      features: item.features || [],
      results: item.results || [],
      videoUrl: item.video_url,
      is_published: item.is_published,
    }));
  } catch (error) {
    console.error('Error in getPublishedTestimonials:', error);
    return defaultTestimonials;
  }
}

import type { Metadata } from 'next';
import BlogListClient from './BlogListClient';
import { adminService } from '@/supabase/adminService';

export const metadata: Metadata = {
  title: 'Journals & Insights | Cleub Automation',
  description: 'Explore expert insights on luxury home automation, smart living trends, and bespoke technology solutions for ultra-luxury estates.',
  keywords: ['luxury home automation blog', 'smart home insights', 'home automation trends', 'Cleub Automation'],
  openGraph: {
    title: 'Journals & Insights | Cleub Automation',
    description: 'Expert insights on luxury home automation and intelligent living.',
    type: 'website',
  },
};

async function getPublishedBlogs() {
  try {
    const blogs = await adminService.getPublishedBlogs();
    return blogs;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getPublishedBlogs();

  return <BlogListClient blogs={blogs} />;
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';
import { adminService } from '@/supabase/adminService';

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogBySlug(slug: string) {
  try {
    const blog = await adminService.getBlogBySlug(slug);
    return blog;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

async function getBlogFaqs(blogId: string) {
  try {
    const faqs = await adminService.getFaqsByBlogId(blogId);
    return faqs;
  } catch (error) {
    console.error('Error fetching blog FAQs:', error);
    return [];
  }
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Not Found | Cleub Automation',
    };
  }

  return {
    title: blog.meta_title || `${blog.title} | Cleub Automation`,
    description: blog.meta_description || blog.excerpt || 'Read this article on Cleub Automation',
    keywords: blog.keywords || [],
    openGraph: {
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt || '',
      type: 'article',
      publishedTime: blog.published_at,
      authors: ['Cleub Automation'],
      images: blog.cover_image_url ? [blog.cover_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt || '',
      images: blog.cover_image_url ? [blog.cover_image_url] : [],
    },
    alternates: {
      canonical: blog.canonical_url || `https://cleubautomation.com/blog/${slug}`,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.is_published) {
    notFound();
  }

  const faqs = await getBlogFaqs(blog.id);

  return <BlogDetailClient blog={blog} faqs={faqs} />;
}

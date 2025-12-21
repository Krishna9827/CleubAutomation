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

// Generate Article schema for blog posts - critical for AEO/E-E-A-T
function generateArticleSchema(blog: {
  title: string;
  excerpt?: string;
  content?: string;
  published_at?: string;
  updated_at?: string;
  cover_image_url?: string;
  keywords?: string[];
  meta_description?: string;
}, slug: string) {
  const wordCount = blog.content ? blog.content.split(/\s+/).length : 0;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.meta_description || blog.excerpt || `Read about ${blog.title} on Cleub Automation Blog`,
    image: blog.cover_image_url || 'https://www.cleub.com/images/blog/default-cover.jpg',
    datePublished: blog.published_at,
    dateModified: blog.updated_at || blog.published_at,
    wordCount: wordCount,
    keywords: blog.keywords?.join(', ') || 'home automation, smart home, Delhi NCR',
    url: `https://www.cleub.com/blog/${slug}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.cleub.com/blog/${slug}`
    },
    author: {
      '@type': 'Organization',
      name: 'Cleub Automation Team',
      url: 'https://www.cleub.com',
      logo: 'https://www.cleub.com/logo.png',
      description: 'KNX-certified luxury home automation integrator serving Delhi NCR since 2017'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Cleub Automation',
      url: 'https://www.cleub.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.cleub.com/logo.png'
      }
    },
    about: {
      '@type': 'Thing',
      name: 'Home Automation',
      description: 'Smart home automation systems for luxury residences in Delhi NCR including Gurgaon, Noida, Delhi, Faridabad, and Ghaziabad'
    },
    isPartOf: {
      '@type': 'Blog',
      name: 'Cleub Automation Blog',
      url: 'https://www.cleub.com/blog',
      description: 'Insights on luxury home automation, smart home trends, and integration guides for Delhi NCR homeowners'
    }
  };
}

// Generate FAQPage schema for blog-specific FAQs
function generateBlogFaqSchema(faqs: { question: string; answer: string }[]) {
  if (faqs.length === 0) return null;
  
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
      authors: ['Cleub Automation Team'],
      images: blog.cover_image_url ? [blog.cover_image_url] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.meta_title || blog.title,
      description: blog.meta_description || blog.excerpt || '',
      images: blog.cover_image_url ? [blog.cover_image_url] : [],
    },
    alternates: {
      canonical: blog.canonical_url || `https://www.cleub.com/blog/${slug}`,
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
  
  // Generate schemas
  const articleSchema = generateArticleSchema(blog, slug);
  const faqSchema = generateBlogFaqSchema(faqs);

  return (
    <>
      {/* Article schema for E-E-A-T and AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {/* Blog-specific FAQ schema if FAQs exist */}
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <BlogDetailClient blog={blog} faqs={faqs} />
    </>
  );
}

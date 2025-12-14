// ============================================
// BLOG & FAQ CONTENT TYPES
// Matches Supabase schema from 020_blogs_faqs_schema.sql
// ============================================

export type BlogPost = {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_markdown: string;
  cover_image_url: string | null;
  author_id: string | null;
  // SEO Fields
  meta_title: string | null;
  meta_description: string | null;
  keywords: string[] | null;
  canonical_url: string | null;
  // Status
  is_published: boolean;
  published_at: string | null;
  reading_time_minutes: number | null;
};

export type FAQ = {
  id: string;
  created_at: string;
  updated_at: string;
  question: string;
  answer: string;
  is_published: boolean;
  order_index: number;
  blog_id: string | null;
  category: string | null;
};

// Form types for creating/updating
export type BlogPostInput = Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'published_at'>;

export type FAQInput = Omit<FAQ, 'id' | 'created_at' | 'updated_at'>;

// Blog with author info (for display)
export type BlogPostWithAuthor = BlogPost & {
  author?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
};

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Fetch published blog posts
  const { data: blogPosts, error } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Static URLs with their settings
  const staticUrls = [
    { url: '/', changefreq: 'daily', priority: '1.0', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/about', changefreq: 'monthly', priority: '0.8', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/blog', changefreq: 'weekly', priority: '0.9', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/faq', changefreq: 'monthly', priority: '0.8', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/inquiry', changefreq: 'monthly', priority: '0.9', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/login', changefreq: 'monthly', priority: '0.6', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/intake', changefreq: 'weekly', priority: '0.8', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/room-selection', changefreq: 'weekly', priority: '0.7', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/requirements', changefreq: 'weekly', priority: '0.7', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/final-review', changefreq: 'weekly', priority: '0.7', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/planner', changefreq: 'weekly', priority: '0.7', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/history', changefreq: 'daily', priority: '0.6', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/privacy-policy', changefreq: 'yearly', priority: '0.4', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/terms', changefreq: 'yearly', priority: '0.4', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/cookie-policy', changefreq: 'yearly', priority: '0.3', lastmod: new Date().toISOString().split('T')[0] },
  ];

  // Dynamic blog URLs
  const blogUrls = blogPosts?.map((post) => ({
    url: `/blog/${post.slug}`,
    changefreq: 'weekly',
    priority: '0.7',
    lastmod: new Date(post.updated_at).toISOString().split('T')[0],
  })) || [];

  // Combine all URLs
  const allUrls = [...staticUrls, ...blogUrls];

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>https://www.cleub.com${item.url}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}

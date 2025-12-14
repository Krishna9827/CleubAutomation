'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Clock, Calendar, ChevronDown } from 'lucide-react';
import type { BlogPost, FAQ } from '@/types/content';

// Luxury easing curve
const luxuryEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface BlogDetailClientProps {
  blog: BlogPost;
  faqs: FAQ[];
}

export default function BlogDetailClient({ blog, faqs }: BlogDetailClientProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { scrollY } = useScroll();
  
  // Debug: Log blog content
  useEffect(() => {
    console.log('📝 Blog content_markdown:', blog.content_markdown);
    console.log('📝 Blog content length:', blog.content_markdown?.length);
  }, [blog]);
  
  // Parallax effect for hero
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Hero Section with Parallax */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {/* Background Image with Parallax */}
        <motion.div
          style={{ y: heroY }}
          className="absolute inset-0 -top-[100px]"
        >
          {blog.cover_image_url ? (
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="w-full h-[120%] object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-900/30 via-slate-900 to-[#0A0A0A]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/50 to-transparent" />
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: luxuryEase }}
          className="absolute top-8 left-8 z-20"
        >
          <Link
            href="/blog"
            className="flex items-center gap-2 text-[#F5F5F3]/60 hover:text-[#F5F5F3] transition-colors duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm uppercase tracking-wider">Back to Journals</span>
          </Link>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="absolute inset-0 flex items-end z-10"
        >
          <div className="max-w-4xl mx-auto px-6 pb-16 w-full">
            {/* Meta */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: luxuryEase }}
              className="flex items-center gap-6 text-[#F5F5F3]/50 text-sm mb-6"
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(blog.published_at || blog.created_at)}
              </span>
              {blog.reading_time_minutes && (
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {blog.reading_time_minutes} min read
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 1, ease: luxuryEase }}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#F5F5F3] tracking-wide leading-tight"
            >
              {blog.title}
            </motion.h1>

            {/* Excerpt */}
            {blog.excerpt && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: luxuryEase }}
                className="mt-6 text-xl text-[#F5F5F3]/60 font-light max-w-2xl"
              >
                {blog.excerpt}
              </motion.p>
            )}
          </div>
        </motion.div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: luxuryEase }}
          style={{ color: 'white' }}
          className="
            [&_h1]:text-white [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:mt-12 [&_h1]:mb-6 [&_h1]:leading-tight
            [&_h2]:text-white [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-5 [&_h2]:leading-tight
            [&_h3]:text-white [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-4
            [&_h4]:text-white [&_h4]:text-xl [&_h4]:font-bold [&_h4]:mt-6 [&_h4]:mb-3
            [&_h5]:text-white [&_h5]:text-lg [&_h5]:font-bold [&_h5]:mt-6 [&_h5]:mb-3
            [&_h6]:text-white [&_h6]:text-base [&_h6]:font-bold [&_h6]:mt-4 [&_h6]:mb-2
            
            [&_p]:text-white [&_p]:text-base [&_p]:leading-[1.75] [&_p]:mb-5 [&_p]:mt-0
            
            [&_a]:text-white [&_a]:underline [&_a]:decoration-white/50
            
            [&_strong]:text-white [&_strong]:font-bold
            [&_em]:text-white [&_em]:italic
            [&_b]:text-white [&_b]:font-bold
            [&_i]:text-white [&_i]:italic
            
            [&_blockquote]:border-l-4 [&_blockquote]:border-white/30
            [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:my-6
            [&_blockquote]:text-white [&_blockquote]:italic
            
            [&_code]:text-white [&_code]:bg-white/10 
            [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:text-sm
            
            [&_pre]:bg-white/5 [&_pre]:border [&_pre]:border-white/10 
            [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-6 [&_pre]:overflow-x-auto
            [&_pre]:text-white
            [&_pre_code]:bg-transparent [&_pre_code]:p-0
            
            [&_ul]:my-6 [&_ul]:pl-6 [&_ul]:space-y-2 [&_ul]:list-disc [&_ul]:text-white
            [&_ul_li]:text-white [&_ul_li]:leading-[1.75] [&_ul_li]:marker:text-white
            
            [&_ol]:my-6 [&_ol]:pl-6 [&_ol]:space-y-2 [&_ol]:list-decimal [&_ol]:text-white
            [&_ol_li]:text-white [&_ol_li]:leading-[1.75] [&_ol_li]:marker:text-white
            
            [&_ul_ul]:mt-2 [&_ul_ul]:mb-0 [&_ul_ul]:list-[circle]
            [&_ol_ol]:mt-2 [&_ol_ol]:mb-0
            
            [&_img]:rounded-lg [&_img]:my-8 [&_img]:border [&_img]:border-white/10 [&_img]:w-full
            
            [&_hr]:border-white/20 [&_hr]:my-10
            
            [&_table]:text-white [&_table]:border [&_table]:border-white/10 [&_table]:w-full [&_table]:my-6
            [&_thead]:border-white/20
            [&_th]:text-white [&_th]:font-semibold [&_th]:border [&_th]:border-white/10 [&_th]:px-4 [&_th]:py-3 [&_th]:bg-white/5
            [&_td]:text-white [&_td]:border [&_td]:border-white/10 [&_td]:px-4 [&_td]:py-3
          "
        >
          {blog.content_markdown ? (
            <ReactMarkdown>{blog.content_markdown}</ReactMarkdown>
          ) : (
            <div className="text-white/50 text-center py-12">
              No content available.
            </div>
          )}
        </motion.div>
      </article>

      {/* Blog-specific FAQs */}
      {faqs.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: luxuryEase }}
          >
            <h2 className="font-serif text-3xl text-[#F5F5F3] tracking-wide mb-8">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: luxuryEase }}
                  className="border border-white/10 rounded-xl overflow-hidden 
                    hover:border-white/20 transition-colors duration-500"
                >
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="text-[#F5F5F3] font-medium pr-4">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openFaqIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.4, ease: luxuryEase }}
                    >
                      <ChevronDown className="w-5 h-5 text-amber-400/60 flex-shrink-0" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {openFaqIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: luxuryEase }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-[#F5F5F3]/60 font-light leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* Back to Blog Link */}
      <section className="max-w-3xl mx-auto px-6 py-16 border-t border-white/10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-amber-400/80 hover:text-amber-300 
            transition-colors duration-300 uppercase tracking-wider text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Journals
        </Link>
      </section>
    </div>
  );
}

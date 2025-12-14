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
      <article className="max-w-3xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: luxuryEase }}
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-serif prose-headings:tracking-wide prose-headings:text-[#F5F5F3]
            prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
            prose-p:text-[#F5F5F3]/80 prose-p:leading-relaxed prose-p:font-light
            prose-a:text-amber-400 prose-a:no-underline hover:prose-a:text-amber-300
            prose-strong:text-[#F5F5F3] prose-strong:font-medium
            prose-blockquote:border-l-amber-500/50 prose-blockquote:bg-white/[0.02] 
            prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
            prose-blockquote:text-[#F5F5F3]/70 prose-blockquote:font-light prose-blockquote:italic
            prose-code:text-amber-400 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-white/[0.03] prose-pre:border prose-pre:border-white/10
            prose-ul:text-[#F5F5F3]/70 prose-ol:text-[#F5F5F3]/70
            prose-li:marker:text-amber-500/50
          "
        >
          <ReactMarkdown>{blog.content_markdown}</ReactMarkdown>
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

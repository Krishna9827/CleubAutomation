'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Clock, Calendar } from 'lucide-react';
import type { BlogPost } from '@/types/content';

// Luxury easing curve
const luxuryEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface BlogListClientProps {
  blogs: BlogPost[];
}

export default function BlogListClient({ blogs }: BlogListClientProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Back to Home */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#F5F5F3]/60 hover:text-[#F5F5F3] transition-colors duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm uppercase tracking-wider">Back to Home</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative py-32 px-6 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: luxuryEase }}
            className="text-center"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-amber-400/80 uppercase tracking-[0.3em] text-sm mb-6"
            >
              Insights & Perspectives
            </motion.p>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-[#F5F5F3] tracking-wide mb-6">
              Journals & Insights
            </h1>
            <p className="text-[#F5F5F3]/60 text-lg md:text-xl max-w-2xl mx-auto font-light">
              Discover the art of intelligent living through expert perspectives on luxury automation, 
              design philosophy, and the future of bespoke technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid - Bento Layout */}
      <section className="px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          {blogs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-20"
            >
              <p className="text-[#F5F5F3]/40 text-lg">
                New insights coming soon. Stay tuned.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, index) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.1 * index, 
                    duration: 0.8, 
                    ease: luxuryEase 
                  }}
                  className={index === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                >
                  <Link href={`/blog/${blog.slug}`}>
                    <article
                      className={`group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 
                        hover:border-amber-500/30 transition-all duration-700 ease-out
                        ${index === 0 ? 'h-full min-h-[500px]' : 'h-[320px]'}
                      `}
                    >
                      {/* Cover Image */}
                      {blog.cover_image_url ? (
                        <div className="absolute inset-0">
                          <img
                            src={blog.cover_image_url}
                            alt={blog.title}
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 
                              group-hover:scale-[1.02] transition-all duration-700 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent" />
                      )}

                      {/* Content */}
                      <div className="relative h-full flex flex-col justify-end p-8">
                        {/* Meta */}
                        <div className="flex items-center gap-4 text-[#F5F5F3]/40 text-sm mb-4">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {formatDate(blog.published_at || blog.created_at)}
                          </span>
                          {blog.reading_time_minutes && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {blog.reading_time_minutes} min read
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h2 className={`font-serif text-[#F5F5F3] tracking-wide mb-3 
                          group-hover:text-amber-100 transition-colors duration-500
                          ${index === 0 ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-xl md:text-2xl'}
                        `}>
                          {blog.title}
                        </h2>

                        {/* Excerpt */}
                        {blog.excerpt && (
                          <p className={`text-[#F5F5F3]/50 font-light leading-relaxed mb-6
                            ${index === 0 ? 'text-lg line-clamp-3' : 'text-sm line-clamp-2'}
                          `}>
                            {blog.excerpt}
                          </p>
                        )}

                        {/* Read More */}
                        <div className="flex items-center gap-2 text-amber-400/80 text-sm 
                          group-hover:text-amber-300 transition-colors duration-500"
                        >
                          <span className="uppercase tracking-wider">Read Article</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                        </div>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700
                        bg-gradient-to-t from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                    </article>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronDown, MessageCircle, ArrowLeft } from 'lucide-react';
import type { FAQ } from '@/types/content';

// Luxury easing curve
const luxuryEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface FaqClientProps {
  faqs: FAQ[];
}

export default function FaqClient({ faqs }: FaqClientProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Group FAQs by category
  const groupedFaqs = faqs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  const categories = Object.keys(groupedFaqs);

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
        
        <div className="max-w-4xl mx-auto relative z-10">
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
              Support & Guidance
            </motion.p>
            <h1 className="font-serif text-5xl md:text-7xl text-[#F5F5F3] tracking-wide mb-6">
              Frequently Asked
              <br />
              <span className="text-amber-400/90">Questions</span>
            </h1>
            <p className="text-[#F5F5F3]/60 text-lg md:text-xl max-w-2xl mx-auto font-light">
              Everything you need to know about our luxury home automation services, 
              installation process, and ongoing support.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-6 pb-32">
        <div className="max-w-3xl mx-auto">
          {faqs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center py-20"
            >
              <p className="text-[#F5F5F3]/40 text-lg">
                FAQs coming soon. In the meantime, feel free to contact us directly.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-12">
              {categories.map((category, categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.2 + categoryIndex * 0.1, 
                    duration: 0.8, 
                    ease: luxuryEase 
                  }}
                >
                  {/* Category Header */}
                  {categories.length > 1 && (
                    <h2 className="font-serif text-2xl text-[#F5F5F3] tracking-wide mb-6">
                      {category}
                    </h2>
                  )}

                  {/* FAQ Items */}
                  <div className="space-y-4">
                    {groupedFaqs[category].map((faq, faqIndex) => {
                      const globalIndex = faqs.findIndex(f => f.id === faq.id);
                      
                      return (
                        <motion.div
                          key={faq.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: 0.3 + faqIndex * 0.05, 
                            duration: 0.6, 
                            ease: luxuryEase 
                          }}
                          className={`
                            border rounded-xl overflow-hidden transition-all duration-500
                            ${openIndex === globalIndex 
                              ? 'border-amber-500/30 bg-white/[0.02]' 
                              : 'border-white/10 hover:border-white/20'
                            }
                          `}
                        >
                          <button
                            onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                            className="w-full flex items-center justify-between p-6 text-left group"
                          >
                            <span className={`
                              font-medium pr-4 transition-colors duration-300
                              ${openIndex === globalIndex 
                                ? 'text-amber-100' 
                                : 'text-[#F5F5F3] group-hover:text-amber-100'
                              }
                            `}>
                              {faq.question}
                            </span>
                            <motion.div
                              animate={{ rotate: openIndex === globalIndex ? 180 : 0 }}
                              transition={{ duration: 0.4, ease: luxuryEase }}
                              className="flex-shrink-0"
                            >
                              <ChevronDown className={`
                                w-5 h-5 transition-colors duration-300
                                ${openIndex === globalIndex 
                                  ? 'text-amber-400' 
                                  : 'text-amber-400/50 group-hover:text-amber-400/80'
                                }
                              `} />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {openIndex === globalIndex && (
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
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: luxuryEase }}
          className="max-w-3xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/20 via-slate-900/50 to-slate-900/50 
            border border-amber-500/20 p-12 text-center"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent" />
            
            <div className="relative z-10">
              <MessageCircle className="w-12 h-12 text-amber-400/60 mx-auto mb-6" />
              <h3 className="font-serif text-2xl md:text-3xl text-[#F5F5F3] tracking-wide mb-4">
                Still have questions?
              </h3>
              <p className="text-[#F5F5F3]/60 font-light mb-8 max-w-md mx-auto">
                Our team of experts is ready to discuss your unique requirements and answer any questions.
              </p>
              <Link
                href="/inquiry"
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 
                  text-black font-medium rounded-full transition-all duration-300
                  hover:shadow-lg hover:shadow-amber-500/20"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

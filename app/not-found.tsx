'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const luxuryEasing = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: luxuryEasing }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-8">
      {/* Fixed Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-8 lg:px-16 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: luxuryEasing }}
      >
        <div className="flex justify-between items-center">
          <Link href="/">
            <motion.h1 
              className="font-serif text-2xl text-[#F5F5F3] cursor-pointer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: luxuryEasing }}
            >
              Cleub
            </motion.h1>
          </Link>
          <motion.p 
            className="text-[10px] tracking-[0.35em] uppercase text-[#F5F5F3]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: luxuryEasing }}
          >
            Page Not Found
          </motion.p>
        </div>
      </motion.nav>

      <motion.div 
        className="text-center max-w-2xl"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <motion.p 
            className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
            variants={fadeInUp}
          >
            Error 404
          </motion.p>

          <motion.h1 
            className="font-serif text-[clamp(3rem,10vw,8rem)] leading-[0.9] text-[#F5F5F3] mb-8"
            variants={fadeInUp}
          >
            Lost in the Ether
          </motion.h1>

          <motion.p 
            className="text-[#F5F5F3]/60 text-base lg:text-lg leading-relaxed mb-12 max-w-[600px] mx-auto"
            variants={fadeInUp}
          >
            The page you're seeking has either been relocated, removed, or never existed. 
            Our systems are designed for precision — this detour is unexpected.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={fadeInUp}
          >
            <Link href="/">
              <motion.button
                className="px-12 py-4 rounded-full border-2 border-[#F5F5F3] text-[#F5F5F3] text-xs tracking-[0.2em] uppercase hover:bg-[#F5F5F3] hover:text-[#0A0A0A] transition-all duration-500 shadow-[0_0_40px_rgba(245,245,243,0.1)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Return Home
              </motion.button>
            </Link>

            <Link href="/inquiry">
              <motion.button
                className="px-12 py-4 rounded-full border border-[#F5F5F3]/20 text-[#F5F5F3] text-xs tracking-[0.2em] uppercase hover:border-[#F5F5F3]/40 transition-all duration-500"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Contact Us
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Background decorative element */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40vw] font-serif text-[#F5F5F3]/[0.02] select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          404
        </motion.div>
      </div>
    </div>
  );
}

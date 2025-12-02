import { useState, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const luxuryEasing: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1.2, ease: luxuryEasing }
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2
    }
  }
};

const textReveal: Variants = {
  hidden: { y: "120%", opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 1.4, ease: luxuryEasing }
  }
};

const AnimatedSection = ({ 
  children, 
  className = '', 
  dark = true,
  id = ''
}: { 
  children: React.ReactNode; 
  className?: string; 
  dark?: boolean;
  id?: string;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.section
      id={id}
      ref={ref}
      className={`${dark ? 'bg-[#0A0A0A] text-[#F5F5F3]' : 'bg-[#F5F5F3] text-[#0A0A0A]'} ${className}`}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {children}
    </motion.section>
  );
};

const LuxuryButton = ({ 
  children, 
  onClick, 
  variant = 'dark',
  className = ''
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'dark' | 'light';
  className?: string;
}) => (
  <motion.button
    onClick={onClick}
    className={`
      px-8 py-4 rounded-full border transition-all duration-500 ease-out
      font-sans text-xs tracking-[0.2em] uppercase
      ${variant === 'dark' 
        ? 'border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F5F5F3]' 
        : 'border-[#F5F5F3] text-[#F5F5F3] hover:bg-[#F5F5F3] hover:text-[#0A0A0A]'
      }
      ${className}
    `}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    {children}
  </motion.button>
);

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans">
      
      {/* ============================================ */}
      {/* FIXED NAVIGATION */}
      {/* ============================================ */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, ease: luxuryEasing as any, delay: 0.5 }}
      >
        <div className="max-w-[1800px] mx-auto px-8 lg:px-12 py-8 flex justify-between items-center">
          <motion.button 
            onClick={() => navigate('/')}
            className="text-[#F5F5F3] font-serif text-2xl tracking-tight"
            whileHover={{ opacity: 0.6 }}
            transition={{ duration: 0.4 }}
          >
            Cleub Automation
          </motion.button>
          <div className="hidden md:flex items-center gap-16">
            {[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/#services' },
              { label: 'Contact', href: '/#contact' },
            ].map((link) => (
              <motion.button
                key={link.label}
                onClick={() => navigate(link.href)}
                className="text-[#F5F5F3] text-[10px] tracking-[0.35em] uppercase hover:opacity-50 transition-opacity duration-500"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3 }}
              >
                {link.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.nav>

      <main>
        {/* ============================================ */}
        {/* HERO SECTION */}
        {/* ============================================ */}
        <section className="min-h-screen flex items-center pt-32 pb-16">
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16 w-full">
            <motion.div
              className="max-w-[95%] lg:max-w-[85%]"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.p 
                className="text-[#F5F5F3]/40 text-[10px] tracking-[0.4em] uppercase mb-8"
                variants={textReveal}
              >
                About Us
              </motion.p>

              <div className="overflow-hidden mb-4">
                <motion.h1 
                  className="font-serif text-[clamp(2.5rem,7vw,7rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                  variants={textReveal}
                >
                  The Cleub Automation Standard.
                </motion.h1>
              </div>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base lg:text-lg leading-relaxed max-w-[800px] mt-8"
                variants={fadeInUp}
              >
                <span className="font-serif text-xl lg:text-2xl text-[#F5F5F3] block mb-4">
                  The Certainty of Seamless Living.
                </span>
                Cleub Automation was founded on a simple premise: True luxury is effortless. In a fragmented market where complexity and cheap solutions often lead to disappointment, we provide the definitive answer. We don't chase trends; we establish standards. We are the system integrators who remove the guesswork, ensuring that the technology in your exclusive space is felt only in its perfection, never in its failure.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CORE PRINCIPLE SECTION */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%]" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
                variants={fadeInUp}
              >
                Our Core Principle
              </motion.p>

              <div className="overflow-hidden mb-12">
                <motion.h2 
                  className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                  variants={textReveal}
                >
                  Beyond Connectivity. Beyond Compromise.
                </motion.h2>
              </div>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base leading-relaxed mb-16 max-w-[700px]"
                variants={fadeInUp}
              >
                The automation market is riddled with systems that fail the moment the Wi-Fi falters—leaving high-end spaces vulnerable to daily friction. Our clients demand discretion, reliability, and control that mirrors their own discerning standards.
              </motion.p>
            </motion.div>

            {/* Principles Table */}
            <motion.div className="space-y-1" variants={staggerContainer}>
              {[
                {
                  title: "Integrity Over Incentive",
                  problem: "We understand the industry's reliance on commissions and proprietary systems.",
                  solution: "We offer unbiased expertise—integrating the best-in-class wired and hybrid platforms, independent of architectural or vendor incentives. Your estate's longevity is our only objective."
                },
                {
                  title: "True Local Control",
                  problem: "Most systems hold your home hostage to the cloud, risking privacy and uptime.",
                  solution: "Our solutions are engineered for uninterrupted local control, ensuring your critical systems operate flawlessly, with or without external internet, securing both your convenience and privacy."
                },
                {
                  title: "Future-Proof Systems",
                  problem: "Conventional technology quickly becomes obsolete, requiring costly replacements.",
                  solution: "We specialize in future-ready, high-compatibility integration, designing systems that evolve gracefully. Your investment today is a reliable asset for decades."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 lg:p-12 group hover:border-[#F5F5F3]/20 transition-colors duration-500"
                  variants={fadeInUp}
                >
                  <h3 className="font-serif text-xl lg:text-2xl text-[#F5F5F3] mb-6">{item.title}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">The Problem</p>
                      <p className="text-[#F5F5F3]/60 text-sm leading-relaxed">{item.problem}</p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">The Cleub Solution</p>
                      <p className="text-[#F5F5F3]/70 text-sm leading-relaxed">{item.solution}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* AUTHORITY SECTION */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-20" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60 mb-8"
                variants={fadeInUp}
              >
                Our Authority
              </motion.p>

              <div className="overflow-hidden mb-12">
                <motion.h2 
                  className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] text-[#0A0A0A] tracking-tight"
                  variants={textReveal}
                >
                  Engineered by Experts. Validated In-House.
                </motion.h2>
              </div>

              <motion.p 
                className="text-[#6B6B6B] text-base leading-relaxed mb-12 max-w-[700px]"
                variants={fadeInUp}
              >
                We are not resellers; we are system architects. The confidence we offer is built on rigorous, continuous validation.
              </motion.p>

              {/* In-House R&D */}
              <motion.div className="space-y-8" variants={staggerContainer}>
                <div variants={fadeInUp}>
                  <h3 className="font-serif text-2xl text-[#0A0A0A] mb-3">In-House R&D</h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-[600px]">
                    Every component, every protocol, and every integration method is put through demanding scrutiny by our dedicated R&D team. We deliver systems that are proven under pressure, far exceeding standard certifications.
                  </p>
                </div>

                <div variants={fadeInUp}>
                  <h3 className="font-serif text-2xl text-[#0A0A0A] mb-3">The White-Glove Process</h3>
                  <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-[600px]">
                    From the initial, detailed site audit to the final hand-off, our service is meticulous and discreet. We align with discerning homeowners, architects, and builders who understand that excellence is in the detail.
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Expertise Pillars */}
            <motion.div className="space-y-1" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60 mb-6"
                variants={fadeInUp}
              >
                Our Expertise Pillars
              </motion.p>
              {[
                {
                  title: "Home Automation",
                  desc: "Robust Wired and Hybrid systems for flawless app, voice, and scene control."
                },
                {
                  title: "Private Entertainment",
                  desc: "Cinema-Grade acoustic design and premium AVR setups for immersive home theaters."
                },
                {
                  title: "Bespoke Production",
                  desc: "State-of-the-art professional studios and creator spaces built to exact professional specifications."
                },
                {
                  title: "Expert Consultation",
                  desc: "Unbiased advisory services that provide clarity and certainty in a fragmented market."
                }
              ].map((pillar, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white border border-[#E5E5E5] p-8 group hover:bg-[#0A0A0A] hover:text-[#F5F5F3] transition-all duration-700"
                  variants={fadeInUp}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full border-2 border-[#0A0A0A] group-hover:border-[#F5F5F3] group-hover:bg-[#F5F5F3] flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-700">
                      <Check className="w-3 h-3 text-[#0A0A0A] group-hover:text-[#0A0A0A]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-xl text-[#0A0A0A] group-hover:text-[#F5F5F3] mb-2 transition-colors duration-700">{pillar.title}</h3>
                      <p className="text-[#6B6B6B] group-hover:text-[#F5F5F3]/70 text-sm leading-relaxed transition-colors duration-700">{pillar.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* CTA SECTION - THE NEXT STEP */}
        {/* ============================================ */}
        <AnimatedSection className="py-40" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left - Heading and Context */}
              <motion.div variants={staggerContainer}>
                <motion.p 
                  className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
                  variants={fadeInUp}
                >
                  The Next Step
                </motion.p>

                <div className="overflow-hidden mb-12">
                  <motion.h2 
                    className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                    variants={textReveal}
                  >
                    Your Estate Deserves the Cleub Standard.
                  </motion.h2>
                </div>

                <motion.p 
                  className="text-[#F5F5F3]/70 text-base leading-relaxed max-w-[600px]"
                  variants={fadeInUp}
                >
                  If your vision demands technology that is invisible, powerful, and utterly reliable, it's time to speak with our experts. We solve the problems others overlook.
                </motion.p>
              </motion.div>

              {/* Right - CTA */}
              <motion.div 
                className="flex flex-col justify-center"
                variants={staggerContainer}
              >
                <motion.p 
                  className="font-serif text-2xl lg:text-3xl text-[#F5F5F3] mb-12"
                  variants={fadeInUp}
                >
                  Ready to Replace Doubt with Certainty?
                </motion.p>

                <motion.div variants={fadeInUp}>
                  <LuxuryButton 
                    onClick={() => navigate('/inquiry')} 
                    variant="light" 
                    className="shadow-[0_0_40px_rgba(245,245,243,0.3),0_0_80px_rgba(245,245,243,0.15)] border-2 w-full sm:w-auto"
                  >
                    Secure Your Expert Review
                  </LuxuryButton>
                </motion.div>

                <motion.p 
                  className="text-[8px] tracking-[0.3em] uppercase text-[#F5F5F3]/30 mt-12"
                  variants={fadeInUp}
                >
                  White-glove consultation • Unbiased expertise • Future-ready systems
                </motion.p>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* ============================================ */}
      {/* FOOTER */}
      {/* ============================================ */}
      <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A] py-16 lg:py-20">
        <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
          <div className="flex justify-between items-end">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="font-serif text-3xl text-[#F5F5F3] mb-2">Cleub Automation</h3>
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30">
                Premium Home Automation
              </p>
            </motion.div>
            <motion.p 
              className="text-[9px] tracking-[0.35em] text-[#F5F5F3]/20"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              &copy; {new Date().getFullYear()} Cleub Automation. All rights reserved.
            </motion.p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

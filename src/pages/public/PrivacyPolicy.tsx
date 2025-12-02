import { useState, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { Lock, Mail, Phone } from 'lucide-react';
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

const PrivacyPolicy = () => {
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
              { label: 'About Us', href: '/about' },
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
              <motion.div className="flex items-center gap-3 mb-8" variants={fadeInUp}>
                <Lock className="w-5 h-5 text-[#F5F5F3]/40" />
                <p className="text-[#F5F5F3]/40 text-[10px] tracking-[0.4em] uppercase">
                  Privacy & Security
                </p>
              </motion.div>

              <div className="overflow-hidden mb-4">
                <motion.h1 
                  className="font-serif text-[clamp(2.5rem,7vw,7rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                  variants={textReveal}
                >
                  The Assurance of Discretion.
                </motion.h1>
              </div>

              <motion.p 
                className="text-[#F5F5F3]/60 text-sm tracking-[0.3em] uppercase mt-8"
                variants={fadeInUp}
              >
                Last Updated: 12/2/2025
              </motion.p>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base lg:text-lg leading-relaxed max-w-[800px] mt-8"
                variants={fadeInUp}
              >
                At Cleub Automation, our commitment to excellence extends to the discretion and security of your information. We recognize that true luxury is knowing your private world remains private. This policy outlines our absolute commitment to protecting the highly sensitive data associated with your estate and your lifestyle.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ============================================ */}
        {/* INFORMATION WE COLLECT */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-20" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
                variants={fadeInUp}
              >
                Information We Discretely Collect
              </motion.p>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base leading-relaxed mb-12 max-w-[700px]"
                variants={fadeInUp}
              >
                We categorize our data collection based on its criticality to system performance and design integrity. We never compromise the confidentiality of your home's unique data.
              </motion.p>
            </motion.div>

            {/* Data Categories */}
            <motion.div className="space-y-1" variants={staggerContainer}>
              {[
                {
                  title: "Personal & Identity Data",
                  subtitle: "(Direct Input)",
                  items: [
                    "Identity: Name, title, contact details (email, phone).",
                    "Access: Property address and contact roles necessary for secure site visits and installation.",
                    "Financial: Billing information for service and supply contracts."
                  ]
                },
                {
                  title: "Project Data",
                  subtitle: "(System Architecture)",
                  items: [
                    "System Requirements: Room configurations, structural plans (if shared), budget parameters, and automation wish lists.",
                    "Configuration Files: Non-public technical data required to calibrate and maintain your unique automation ecosystem."
                  ]
                },
                {
                  title: "Operational Data",
                  subtitle: "(Usage & Integrity)",
                  items: [
                    "System Health Logs: Non-identifiable data on system uptime, error reports, and hardware performance. We do not track specific user behaviors unless necessary for troubleshooting.",
                    "Security & Access Logs: IP address, device type, and login timestamps to prevent unauthorized access to your remote management portal."
                  ]
                }
              ].map((category, idx) => (
                <motion.div
                  key={idx}
                  className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 lg:p-12 group hover:border-[#F5F5F3]/20 transition-colors duration-500"
                  variants={fadeInUp}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F3]/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Lock className="w-4 h-4 text-[#F5F5F3]/40" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-xl lg:text-2xl text-[#F5F5F3] mb-1">{category.title}</h3>
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-4">{category.subtitle}</p>
                      <ul className="space-y-2">
                        {category.items.map((item, i) => (
                          <li key={i} className="text-[#F5F5F3]/60 text-sm leading-relaxed flex gap-3">
                            <span className="text-[#F5F5F3]/30 flex-shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* HOW WE USE YOUR INFORMATION */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-20" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60 mb-8"
                variants={fadeInUp}
              >
                How We Secure & Utilize Your Information
              </motion.p>

              <motion.p 
                className="text-[#6B6B6B] text-base leading-relaxed mb-12 max-w-[700px]"
                variants={fadeInUp}
              >
                We utilize your data strictly to deliver and perfect the seamless experience you expect from Cleub Automation.
              </motion.p>
            </motion.div>

            {/* Usage Table */}
            <motion.div className="space-y-1" variants={staggerContainer}>
              {[
                {
                  title: "System Integrity",
                  commitment: "We use Project and Operational data to guarantee uninterrupted functionality and predict maintenance needs, proactively preserving your investment.",
                  nudge: "The system reports on itself so you never have to."
                },
                {
                  title: "Bespoke Service",
                  commitment: "We use Personal and Project data to ensure every recommendation and service call is tailored and relevant to your unique architectural and lifestyle requirements.",
                  nudge: "Your needs are meticulously understood before we act."
                },
                {
                  title: "Compliance & Trust",
                  commitment: "We retain data only as long as necessary to uphold contract terms, provide service guarantees, and satisfy stringent legal obligations.",
                  nudge: "We prioritize long-term certainty over short-term data hoarding."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white border border-[#E5E5E5] p-8 lg:p-12 group hover:bg-[#0A0A0A] hover:text-[#F5F5F3] transition-all duration-700"
                  variants={fadeInUp}
                >
                  <h3 className="font-serif text-xl text-[#0A0A0A] group-hover:text-[#F5F5F3] mb-4 transition-colors duration-700">{item.title}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] group-hover:text-[#F5F5F3]/40 mb-3 transition-colors duration-700">Cleub Commitment</p>
                      <p className="text-[#6B6B6B] group-hover:text-[#F5F5F3]/70 text-sm leading-relaxed transition-colors duration-700">{item.commitment}</p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] group-hover:text-[#F5F5F3]/40 mb-3 transition-colors duration-700">The Nudge</p>
                      <p className="text-[#6B6B6B] group-hover:text-[#F5F5F3]/70 text-sm leading-relaxed font-serif transition-colors duration-700 italic">{item.nudge}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* DATA SHARING & DISCRETION */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-16" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
                variants={fadeInUp}
              >
                Data Sharing & Discretion
              </motion.p>

              <div className="overflow-hidden mb-12">
                <motion.h2 
                  className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                  variants={textReveal}
                >
                  The Absolute Guarantee.
                </motion.h2>
              </div>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base leading-relaxed mb-8 max-w-[700px]"
                variants={fadeInUp}
              >
                Cleub Automation does not and will not sell, lease, or monetize your Personal or Project Data. Our business model is based purely on superior service and integration expertise.
              </motion.p>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base leading-relaxed max-w-[700px]"
                variants={fadeInUp}
              >
                We share data only under these highly controlled circumstances:
              </motion.p>
            </motion.div>

            {/* Sharing Circumstances */}
            <motion.div className="space-y-4 max-w-[700px]" variants={staggerContainer}>
              {[
                {
                  title: "Vetted Partners",
                  desc: "With trusted, contractually bound service providers (e.g., manufacturers or specialized installation teams) who require data solely to complete a task on our behalf."
                },
                {
                  title: "Express Consent",
                  desc: "When you provide explicit, written consent for a specific, collaborative project (e.g., integrating your system with an interior design firm)."
                },
                {
                  title: "Legal Necessity",
                  desc: "In the rare and absolute event required by law or to defend our legal rights against malicious parties."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-[#0A0A0A] border border-[#1A1A1A] p-6 group hover:border-[#F5F5F3]/20 transition-colors duration-500"
                  variants={fadeInUp}
                >
                  <h3 className="font-serif text-lg text-[#F5F5F3] mb-2">{item.title}</h3>
                  <p className="text-[#F5F5F3]/60 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* YOUR RIGHTS */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-16" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60 mb-8"
                variants={fadeInUp}
              >
                Your Rights
              </motion.p>

              <div className="overflow-hidden mb-12">
                <motion.h2 
                  className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[#0A0A0A] tracking-tight"
                  variants={textReveal}
                >
                  Total Control Over Your Data.
                </motion.h2>
              </div>

              <motion.p 
                className="text-[#6B6B6B] text-base leading-relaxed max-w-[700px]"
                variants={fadeInUp}
              >
                As a Cleub client, you retain absolute control over your information. We ensure a rapid and discreet process for all data requests.
              </motion.p>
            </motion.div>

            {/* Rights List */}
            <motion.div className="space-y-4 max-w-[700px]" variants={staggerContainer}>
              {[
                {
                  title: "Access and Rectification",
                  desc: "You have the right to review, update, or correct the personal and project data we hold."
                },
                {
                  title: "Erasure (The Right to be Forgotten)",
                  desc: "You may request the deletion of your Personal Data, subject only to essential legal retention requirements for warranty and tax purposes."
                },
                {
                  title: "Communication Preferences",
                  desc: "You maintain the right to opt-out of all non-essential marketing and promotional communication."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white border border-[#E5E5E5] p-6 group hover:bg-[#0A0A0A] hover:text-[#F5F5F3] transition-all duration-700"
                  variants={fadeInUp}
                >
                  <h3 className="font-serif text-lg text-[#0A0A0A] group-hover:text-[#F5F5F3] mb-2 transition-colors duration-700">{item.title}</h3>
                  <p className="text-[#6B6B6B] group-hover:text-[#F5F5F3]/70 text-sm leading-relaxed transition-colors duration-700">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* SECURITY */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%]" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
                variants={fadeInUp}
              >
                Security
              </motion.p>

              <div className="overflow-hidden mb-12">
                <motion.h2 
                  className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                  variants={textReveal}
                >
                  The Architecture of Protection.
                </motion.h2>
              </div>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base leading-relaxed max-w-[700px]"
                variants={fadeInUp}
              >
                We treat your data with the same rigorous security protocol we apply to your home automation system. We employ end-to-end encryption for all remote access portals, store configuration files on secure, audited servers, and conduct continuous security reviews. While total security is an industry myth, we aim for the highest practical standard of defense, commensurate with the exclusivity of your data.
              </motion.p>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* CONTACT SECTION */}
        {/* ============================================ */}
        <AnimatedSection className="py-40" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left - Heading */}
              <motion.div variants={staggerContainer}>
                <motion.p 
                  className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60 mb-8"
                  variants={fadeInUp}
                >
                  Contact Us
                </motion.p>

                <div className="overflow-hidden mb-12">
                  <motion.h2 
                    className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[#0A0A0A] tracking-tight"
                    variants={textReveal}
                  >
                    Questions Treated With Urgency.
                  </motion.h2>
                </div>

                <motion.p 
                  className="text-[#6B6B6B] text-base leading-relaxed max-w-[600px]"
                  variants={fadeInUp}
                >
                  Questions regarding your privacy are treated with the utmost urgency and discretion. Reach out directly to our Chief Discretion Officer.
                </motion.p>
              </motion.div>

              {/* Right - Contact Info */}
              <motion.div className="space-y-6" variants={staggerContainer}>
                <motion.p 
                  className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60"
                  variants={fadeInUp}
                >
                  Chief Discretion Officer (CDO) / Privacy Office
                </motion.p>

                <motion.a 
                  href="mailto:privacy@cleub.com"
                  className="block group"
                  variants={fadeInUp}
                >
                  <div className="flex items-center gap-4 p-6 bg-white border border-[#E5E5E5] group-hover:bg-[#0A0A0A] group-hover:text-[#F5F5F3] transition-all duration-700">
                    <Mail className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#F5F5F3] transition-colors duration-700" />
                    <div className="flex-1">
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] group-hover:text-[#F5F5F3]/40 transition-colors duration-700 mb-1">Email (Encrypted Preferred)</p>
                      <p className="font-serif text-lg text-[#0A0A0A] group-hover:text-[#F5F5F3] transition-colors duration-700">privacy@cleub.com</p>
                    </div>
                  </div>
                </motion.a>

                <motion.a 
                  href="tel:+919667603999"
                  className="block group"
                  variants={fadeInUp}
                >
                  <div className="flex items-center gap-4 p-6 bg-white border border-[#E5E5E5] group-hover:bg-[#0A0A0A] group-hover:text-[#F5F5F3] transition-all duration-700">
                    <Phone className="w-5 h-5 text-[#6B6B6B] group-hover:text-[#F5F5F3] transition-colors duration-700" />
                    <div className="flex-1">
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] group-hover:text-[#F5F5F3]/40 transition-colors duration-700 mb-1">Phone (Direct Line)</p>
                      <p className="font-serif text-lg text-[#0A0A0A] group-hover:text-[#F5F5F3] transition-colors duration-700">+91 9667603999</p>
                    </div>
                  </div>
                </motion.a>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* FOOTER CTA */}
        {/* ============================================ */}
        <AnimatedSection className="py-20" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
              <motion.button
                onClick={() => navigate('/')}
                className="text-[#F5F5F3] text-[10px] tracking-[0.35em] uppercase hover:opacity-50 transition-opacity duration-500"
                variants={fadeInUp}
              >
                Back to Home
              </motion.button>
              <motion.p 
                className="text-[9px] tracking-[0.35em] text-[#F5F5F3]/30"
                variants={fadeInUp}
              >
                © 2025 Cleub Automation. The standard in system certainty.
              </motion.p>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
};

export default PrivacyPolicy;

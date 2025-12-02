import { useState, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import { Cookie, Mail, Phone } from 'lucide-react';
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

const CookiePolicy = () => {
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
                <Cookie className="w-5 h-5 text-[#F5F5F3]/40" />
                <p className="text-[#F5F5F3]/40 text-[10px] tracking-[0.4em] uppercase">
                  Cookie Protocol
                </p>
              </motion.div>

              <div className="overflow-hidden mb-4">
                <motion.h1 
                  className="font-serif text-[clamp(2.5rem,7vw,7rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                  variants={textReveal}
                >
                  Ensuring Flawless Interaction.
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
                At Cleub Automation, every digital touchpoint is engineered for uninterrupted performance and absolute security. This Cookie Protocol outlines the highly controlled use of digital identifiers on your device. We use these essential tools to ensure the reliability of your service portal and to provide the bespoke, high-fidelity experience you demand.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CATEGORIES OF IDENTIFIERS */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-20" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
                variants={fadeInUp}
              >
                Categories of Digital Identifiers
              </motion.p>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base leading-relaxed mb-12 max-w-[700px]"
                variants={fadeInUp}
              >
                Our use of cookies is strictly tied to reliability, security, and the integrity of your system management portal.
              </motion.p>
            </motion.div>

            {/* Cookies Table */}
            <motion.div className="space-y-1" variants={staggerContainer}>
              {[
                {
                  title: "Integrity & Security Cookies",
                  role: "Mandatory for service access. These secure your user session, authenticate your identity, and safeguard your account from unauthorized access.",
                  technical: "Authentication Tokens, Session Management, Fraud Prevention."
                },
                {
                  title: "System Precision Cookies",
                  role: "These identifiers ensure the precise functionality and consistency of your project tools and preferences. They remember your custom settings.",
                  technical: "Language Selection, Saved Project Preferences, High-Fidelity UI Customization."
                },
                {
                  title: "Performance Assurance Cookies",
                  role: "Used strictly for internal performance auditing. These anonymously track system bottlenecks, page load integrity, and error reporting.",
                  technical: "Page Load Metrics, Error Trapping, System Uptime Analysis."
                },
                {
                  title: "Authority Validation Cookies (Third-Party)",
                  role: "We leverage highly vetted third-party services for essential operations, ensuring the absolute security and stability of our platform backbone.",
                  technical: "Firebase Authentication, Supabase Data Integrity Checks, Secure Analytics Providers."
                }
              ].map((cookie, idx) => (
                <motion.div
                  key={idx}
                  className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 lg:p-12 group hover:border-[#F5F5F3]/20 transition-colors duration-500"
                  variants={fadeInUp}
                >
                  <h3 className="font-serif text-xl lg:text-2xl text-[#F5F5F3] mb-4">{cookie.title}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Role in Your Experience</p>
                      <p className="text-[#F5F5F3]/60 text-sm leading-relaxed">{cookie.role}</p>
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Technical Assurance</p>
                      <p className="text-[#F5F5F3]/60 text-sm leading-relaxed">Example: {cookie.technical}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* ARCHITECTURE OF CONSENT */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-16" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60 mb-8"
                variants={fadeInUp}
              >
                Consent & Control
              </motion.p>

              <div className="overflow-hidden mb-12">
                <motion.h2 
                  className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[#0A0A0A] tracking-tight"
                  variants={textReveal}
                >
                  The Architecture of Consent.
                </motion.h2>
              </div>

              <motion.p 
                className="text-[#6B6B6B] text-base leading-relaxed mb-12 max-w-[700px]"
                variants={fadeInUp}
              >
                By accessing the Cleub Automation portal, you acknowledge the necessity of these digital identifiers to facilitate the secure and seamless service we provide.
              </motion.p>
            </motion.div>

            {/* Consent Pillars */}
            <motion.div className="space-y-4 max-w-[900px]" variants={staggerContainer}>
              {[
                {
                  title: "Zero Monetization",
                  desc: "Cleub Automation does not monetize or sell any cookie-derived data. All information is used exclusively for internal service provision, security, and optimization."
                },
                {
                  title: "Third-Party Oversight",
                  desc: "We vet our third-party partners (e.g., Firebase, Supabase) for their adherence to stringent data security protocols. We choose partners who reflect our commitment to discretion and technical excellence."
                },
                {
                  title: "Your Digital Control",
                  desc: "You maintain the right to manage cookies, though disabling them will critically compromise your ability to use our secured management portal and certain essential service features."
                },
                {
                  title: "Browser Management",
                  desc: "You can modify your browser settings to decline most non-essential cookies. Instructions are available via your specific browser's preferences panel."
                }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white border border-[#E5E5E5] p-6 lg:p-8 group hover:bg-[#0A0A0A] hover:text-[#F5F5F3] transition-all duration-700"
                  variants={fadeInUp}
                >
                  <h3 className="font-serif text-lg text-[#0A0A0A] group-hover:text-[#F5F5F3] mb-3 transition-colors duration-700">{item.title}</h3>
                  <p className="text-[#6B6B6B] group-hover:text-[#F5F5F3]/70 text-sm leading-relaxed transition-colors duration-700">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* COOKIE DURATION */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-16" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
                variants={fadeInUp}
              >
                Duration & Persistence
              </motion.p>

              <motion.p 
                className="text-[#F5F5F3]/70 text-base leading-relaxed max-w-[700px]"
                variants={fadeInUp}
              >
                We use Session Cookies (temporary, essential for login) and Persistent Cookies (remain to remember your preferences for seamless repeat visits).
              </motion.p>
            </motion.div>

            {/* Duration Types */}
            <motion.div className="space-y-4 max-w-[700px]" variants={staggerContainer}>
              {[
                {
                  title: "Session Cookies",
                  desc: "Temporary cookies that expire when you close your browser. Used primarily for authentication and navigation."
                },
                {
                  title: "Persistent Cookies",
                  desc: "Remain on your device for a set period or until you delete them. Used to remember your preferences and improve your experience on repeat visits."
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
        {/* PROTOCOL UPDATES */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <motion.div className="max-w-[85%] lg:max-w-[75%] mb-12" variants={staggerContainer}>
              <motion.p 
                className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60 mb-8"
                variants={fadeInUp}
              >
                Policy Updates
              </motion.p>

              <motion.p 
                className="text-[#6B6B6B] text-base leading-relaxed max-w-[700px]"
                variants={fadeInUp}
              >
                We reserve the right to refine this protocol as technology or security standards evolve. Any significant changes will be communicated clearly and posted on this page with a revised date.
              </motion.p>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* CONTACT SECTION */}
        {/* ============================================ */}
        <AnimatedSection className="py-40" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8 lg:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              {/* Left - Heading */}
              <motion.div variants={staggerContainer}>
                <motion.p 
                  className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/40 mb-8"
                  variants={fadeInUp}
                >
                  Contact Us
                </motion.p>

                <div className="overflow-hidden mb-12">
                  <motion.h2 
                    className="font-serif text-[clamp(2rem,5vw,4rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                    variants={textReveal}
                  >
                    Questions About Our Protocol.
                  </motion.h2>
                </div>

                <motion.p 
                  className="text-[#F5F5F3]/70 text-base leading-relaxed max-w-[600px]"
                  variants={fadeInUp}
                >
                  For questions regarding our Digital Protocol, please contact our Chief Discretion Officer (CDO) directly.
                </motion.p>
              </motion.div>

              {/* Right - Contact Info */}
              <motion.div className="space-y-6" variants={staggerContainer}>
                <motion.a 
                  href="mailto:privacy@cleub.com"
                  className="block group"
                  variants={fadeInUp}
                >
                  <div className="flex items-center gap-4 p-6 bg-[#0A0A0A] border border-[#1A1A1A] group-hover:border-[#F5F5F3]/20 transition-all duration-700">
                    <Mail className="w-5 h-5 text-[#F5F5F3]/40 group-hover:text-[#F5F5F3] transition-colors duration-700" />
                    <div className="flex-1">
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-1">Email</p>
                      <p className="font-serif text-lg text-[#F5F5F3]">privacy@cleub.com</p>
                    </div>
                  </div>
                </motion.a>

                <motion.a 
                  href="tel:+919667603999"
                  className="block group"
                  variants={fadeInUp}
                >
                  <div className="flex items-center gap-4 p-6 bg-[#0A0A0A] border border-[#1A1A1A] group-hover:border-[#F5F5F3]/20 transition-all duration-700">
                    <Phone className="w-5 h-5 text-[#F5F5F3]/40 group-hover:text-[#F5F5F3] transition-colors duration-700" />
                    <div className="flex-1">
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-1">Phone (Direct Line)</p>
                      <p className="font-serif text-lg text-[#F5F5F3]">+91 9667603999</p>
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
                onClick={() => {
                  navigate('/');
                  setTimeout(() => window.scrollTo(0, 0), 50);
                }}
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

export default CookiePolicy;

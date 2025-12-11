import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, Variants } from 'framer-motion';
import { Film, Headphones, Cpu, Star, Phone, Mail, Lightbulb, Settings, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandLogos } from "@/components/features";
import { TestimonialDialog } from "@/components/features";
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/supabase/adminService';
import ProfileMenu from '@/components/ui/profile-menu';

// ============================================
// ANIMATION VARIANTS - LUXURY EASING
// ============================================
const luxuryEasing: [number, number, number, number] = [0.22, 1, 0.36, 1]; // Slow, deliberate, expensive motion

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

const scaleIn: Variants = {
  hidden: { scale: 1.1, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 1.8, ease: luxuryEasing }
  }
};

const shimmer: Variants = {
  initial: { opacity: 0.9 },
  animate: { 
    opacity: [0.9, 1, 0.9],
    transition: { 
      duration: 3, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  }
};

// ============================================
// ANIMATED COUNTER COMPONENT
// ============================================
const AnimatedCounter = ({ end, suffix = '', duration = 2 }: { end: number; suffix?: string; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);
  
  return <span ref={ref}>{count}{suffix}</span>;
};

// ============================================
// LUXURY PILL BUTTON COMPONENT
// ============================================
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

// ============================================
// SECTION WRAPPER WITH ANIMATION
// ============================================
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

// ============================================
// TESTIMONIALS SECTION WITH HORIZONTAL SCROLL
// ============================================
const TestimonialsSection = ({ 
  testimonials, 
  isLoading 
}: { 
  testimonials: any[]; 
  isLoading: boolean;
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"]
  });

  // Transform scroll to horizontal movement - starts before section enters, ends smoothly
  const cardWidth = 450;
  const totalWidth = cardWidth * testimonials.length;
  const x = useTransform(scrollYProgress, [0, 0.85], [100, -totalWidth]);

  return (
    <section 
      ref={sectionRef}
      id="testimonials" 
      className="relative bg-[#0A0A0A]"
      style={{ height: `${Math.max(2.5, testimonials.length) * 100}vh` }}
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Fixed Title - Centered Over Cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Star className="w-4 h-4 text-[#F5F5F3]/30" />
            <span className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30">Featured Case Studies</span>
          </div>
          <h2 className="font-serif text-[clamp(3rem,6vw,7rem)] leading-[0.9] text-[#F5F5F3] tracking-tight">
            Client Stories
          </h2>
        </div>

        {/* Horizontal Scrolling Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-[#F5F5F3]/30 text-sm tracking-[0.3em] uppercase">
              Loading testimonials...
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center">
            <motion.div 
              className="flex gap-8 lg:gap-12 absolute left-0 pl-8 lg:pl-[45%]"
              style={{ x }}
            >
              {testimonials.map((testimonial: any, index: number) => (
                <div 
                  key={index} 
                  className="flex-shrink-0 w-[70vw] md:w-[350px] lg:w-[400px]"
                >
                  <TestimonialDialog testimonial={testimonial} />
                </div>
              ))}
              {/* Spacer at end */}
              <div className="w-[50vw] flex-shrink-0" />
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const PremiumLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show nav if at top or scrolling up
      if (currentScrollY < 50 || currentScrollY < lastScrollY) {
        setIsNavVisible(true);
      } 
      // Hide nav if scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const data = await adminService.getAllTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Error loading testimonials:', error);
        setTestimonials([]);
      } finally {
        setIsLoadingTestimonials(false);
      }
    };
    loadTestimonials();
  }, []);

  // Video data - keeping your existing sources
  const videoFeatures = [
    { src: "/videos/curtain2.mp4", title: "Smart Curtains", description: "Smart, Voice, App curtain control"},
    { src: "/videos/Dynamic_lighting.mp4", title: "Dynamic Lighting", description: "Dynamic Smart lighting"},
    { src: "/videos/Home_theater.mp4", title: "Home Theater", description: "Cinema-grade experience" },
    { src: "/videos/automation.mp4", title: "Full Automation", description: "Complete smart control"},
    { src: "/videos/setup.mp4", title: "Studio Setup", description: "Professional audio/video"},
    { src: "/videos/curtain.mp4", title: "Smart Curtains", description: "Automated curtain control"}
  ];

  // Services data - keeping your existing content
  const services = [
    { icon: <Lightbulb className='w-6 h-6' />, title: 'Home Automation', desc: 'Wired/Hybrid systems, app/voice, scene control.' },
    { icon: <Headphones className='w-6 h-6' />, title: 'Home Theaters', desc: 'Acoustics, AVR, immersive setups.' },
    { icon: <Cpu className='w-6 h-6' />, title: 'Studios', desc: 'Production, podcast, creator studios.' },
    { icon: <Settings className='w-6 h-6' />, title: 'Consult & Supply', desc: 'Advisory, site audits, premium products.' }
  ];

  // Why Choose Us data
  const whyChooseUs = [
    { title: 'In‑house R&D', desc: 'Tested, validated technologies beyond standard WiFi.' },
    { title: 'Superior Tech', desc: 'Robust, reliable systems designed for luxury builds.' },
    { title: 'Exceptional Support', desc: 'White‑glove consultation, install and after‑sales.' }
  ];

  // Audience data
  const audiences = ['Ultra‑Luxury Homes', 'Designers & Architects', 'Builders & Developers', 'Tech Enthusiasts'];

  // Default testimonials
  const defaultTestimonials = [
    {
      clientName: "A. Sharma, Luxury Villa Owner",
      propertyType: "Smart Luxury Villa",
      location: "New Delhi",
      date: "September 2025",
      quote: "Flawless installation and the most responsive support team we've worked with.",
      projectDetails: "A comprehensive home automation project for a 10,000 sq ft villa featuring cutting-edge technology integration across lighting, security, entertainment, and climate control systems.",
      features: ["Voice-Controlled Lighting", "Smart Security System", "Home Theater", "Climate Control", "Automated Curtains", "Smart Door Locks"],
      results: ["40% reduction in energy consumption", "Enhanced security with 24/7 monitoring", "Seamless integration of all home systems", "Increased property value"],
      videoUrl: "/videos/curtain2.mp4"
    },
    {
      clientName: "R. Kapoor, Studio Owner",
      propertyType: "Professional Recording Studio",
      location: "Mumbai",
      date: "August 2025",
      quote: "The audio-visual integration is perfect. Every detail was considered in the setup.",
      projectDetails: "State-of-the-art recording studio setup with advanced acoustic treatment, professional-grade equipment installation, and smart control systems.",
      features: ["Professional Audio Setup", "Acoustic Treatment", "Smart Lighting Control", "Climate Control", "Sound Isolation", "Remote Monitoring"],
      results: ["Studio meets international recording standards", "Perfect acoustic environment achieved", "Flexible control system for different recording scenarios", "Energy-efficient operation"],
      videoUrl: "/videos/setup.mp4"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans">
      
      {/* ============================================ */}
      {/* UNDERSTATED NAVIGATION */}
      {/* ============================================ */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
        initial={{ y: -100 }}
        animate={{ 
          opacity: isNavVisible ? 1 : 0,
          y: isNavVisible ? 0 : -100,
          pointerEvents: isNavVisible ? 'auto' : 'none'
        }}
        transition={{ duration: 0.4, ease: luxuryEasing as any }}
      >
        <div className="max-w-[1800px] mx-auto px-8 lg:px-12 py-8 flex justify-between items-center">
          <motion.a 
            href="#home"
            className="text-[#F5F5F3] font-serif text-2xl tracking-tight"
            whileHover={{ opacity: 0.6 }}
            transition={{ duration: 0.4 }}
          >
            Cleub Automation
          </motion.a>
          <div className="hidden md:flex items-center gap-16">
            {[
              { label: 'Home', href: '#home' },
              { label: 'Services', href: '#services' },
              { label: 'Testimonials', href: '#testimonials' },
              { label: 'Contact', href: '#contact' },
            ].map((link) => (
              <motion.a
                key={link.label}
                href={link.href}
                className="text-[#F5F5F3] text-[10px] tracking-[0.35em] uppercase hover:opacity-50 transition-opacity duration-500"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3 }}
              >
                {link.label}
              </motion.a>
            ))}
            {user ? (
              <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
                <ProfileMenu />
              </motion.div>
            ) : (
              <motion.button
                onClick={() => navigate('/login')}
                className="text-[#F5F5F3] text-[10px] tracking-[0.35em] uppercase hover:opacity-50 transition-opacity duration-500"
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3 }}
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </motion.nav>

      <main>
        {/* ============================================ */}
        {/* HERO SECTION - CINEMATIC FULL SCREEN */}
        {/* ============================================ */}
        <section id="home" ref={heroRef} className="relative h-screen overflow-hidden bg-[#0A0A0A]">
          {/* Background Video with Parallax */}
          <motion.div 
            className="absolute inset-0"
            style={{ y: heroY }}
          >
            <video 
              className="w-full h-[120%] object-cover opacity-40"
              autoPlay 
              muted 
              loop 
              playsInline
            >
              <source src="/videos/automation.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A]" />
          </motion.div>

          {/* Hero Content - Asymmetric Layout */}
          <motion.div 
            className="relative z-10 h-full flex items-center px-4 md:px-12 lg:px-20 pt-24 pb-32"
            style={{ opacity: heroOpacity }}
          >
            <motion.div
              className="max-w-[1800px] w-full mx-auto"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {/* Overline - Small, Wide Sans-Serif */}
              <motion.p 
                className="text-[#F5F5F3]/40 text-[10px] tracking-[0.4em] uppercase mb-12"
                variants={textReveal}
              >
                Premium Home Automation
              </motion.p>

              {/* Main Title - Extreme Scale Contrast (10:1 ratio) */}
              <div className="max-w-[95%] lg:max-w-[80%]">
                {/* Line 1: "Effortless Life." - Bold, Massive Serif */}
                <div className="overflow-hidden mb-2">
                  <motion.h1 
                    className="font-serif text-[#F5F5F3] text-[clamp(2.5rem,8vw,8.5rem)] leading-[0.95] tracking-tight"
                    variants={textReveal}
                  >
                    Effortless Life.
                  </motion.h1>
                </div>
                
                {/* Line 2: "Engineered Beyond Doubt." - Smaller Italic Serif (Contrast) */}
                <div className="overflow-hidden mb-2 pb-1">
                  <motion.h1 
                    className="font-serif text-[#F5F5F3]/85 text-[clamp(1.5rem,4.5vw,5.5rem)] leading-[1.1] italic tracking-tight"
                    variants={textReveal}
                    style={{ marginLeft: '5%' }}
                  >
                    Engineered Beyond Doubt.
                  </motion.h1>
                </div>
                
                {/* Line 3: "Absolute Discretion." - Bold, Massive Serif */}
                <div className="overflow-hidden">
                  <motion.h1 
                    className="font-serif text-[#F5F5F3] text-[clamp(2.5rem,8vw,8.5rem)] leading-[0.95] tracking-tight"
                    variants={textReveal}
                  >
                    Absolute Discretion.
                  </motion.h1>
                </div>
              </div>

              {/* Value Proposition - Focused Pain Point */}
              <motion.div 
                className="mt-8 lg:mt-12 max-w-[520px] lg:ml-[35%]"
                variants={fadeInUp}
              >
                <p className="text-[#F5F5F3]/70 text-sm leading-relaxed tracking-wide">
                  In a fragmented market, certainty is the ultimate luxury. We provide unbiased, white‑glove expertise—integrating wired and wireless systems to ensure your estate is simply, perfectly automated.
                </p>
              </motion.div>

              {/* CTA Button - Centered with Glowing Arrows */}
              <motion.div 
                className="flex items-center justify-center gap-6 mt-8 lg:mt-10"
                variants={fadeInUp}
              >
                {/* Left Arrow - Pointing Inward */}
                <motion.svg
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  className="hidden sm:block"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <motion.path
                    d="M 10 30 Q 20 15, 40 25"
                    stroke="rgba(245, 245, 243, 0.6)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    animate={{
                      opacity: [0.6, 1, 0.6],
                      strokeWidth: [2, 2.5, 2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.path
                    d="M 40 25 L 37 21 M 40 25 L 36 28"
                    stroke="rgba(245, 245, 243, 0.6)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    filter="url(#glow)"
                    animate={{
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                </motion.svg>

                {/* Primary CTA: Centered with Enhanced Glow */}
                <motion.div
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                >
                  <LuxuryButton 
                    onClick={() => navigate('/inquiry')} 
                    variant="light" 
                    className="shadow-[0_0_40px_rgba(245,245,243,0.3),0_0_80px_rgba(245,245,243,0.15)] border-2"
                  >
                    Secure Your Expert Review
                  </LuxuryButton>
                </motion.div>

                {/* Right Arrow - Pointing Inward */}
                <motion.svg
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  className="hidden sm:block"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 1 }}
                >
                  <motion.path
                    d="M 50 30 Q 40 15, 20 25"
                    stroke="rgba(245, 245, 243, 0.6)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#glow2)"
                    animate={{
                      opacity: [0.6, 1, 0.6],
                      strokeWidth: [2, 2.5, 2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.path
                    d="M 20 25 L 23 21 M 20 25 L 24 28"
                    stroke="rgba(245, 245, 243, 0.6)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    filter="url(#glow2)"
                    animate={{
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <defs>
                    <filter id="glow2">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                </motion.svg>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              className="absolute bottom-12 left-1/2 -translate-x-1/2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
            >
              <motion.div 
                className="w-[1px] h-16 bg-gradient-to-b from-[#F5F5F3]/50 to-transparent"
                animate={{ scaleY: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* ============================================ */}
        {/* VIDEO FEATURES - HORIZONTAL STICKY SCROLL */}
        {/* ============================================ */}
        <AnimatedSection id="services" className="py-32" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8">
            <motion.div className="flex items-center gap-4 mb-16" variants={fadeInUp}>
              <Film className="w-4 h-4 text-[#F5F5F3]/40" />
              <span className="text-[10px] tracking-[0.4em] uppercase text-[#F5F5F3]/40">Experience the Difference</span>
            </motion.div>
            
            <div className="overflow-x-auto no-scrollbar -mx-8 px-8">
              <motion.div 
                className="flex gap-8 min-w-max pb-4"
                variants={staggerContainer}
              >
                {videoFeatures.map((video, i) => (
                  <motion.div 
                    key={i} 
                    className="relative group cursor-pointer"
                    variants={scaleIn}
                    style={{ width: i === 0 ? '550px' : '450px' }}
                  >
                    {/* Video Container with Offset Effect */}
                    <div className={`h-[320px] overflow-hidden bg-[#1A1A1A] ${i % 2 === 0 ? 'mt-8' : ''}`}>
                      <motion.video 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 1.2, ease: luxuryEasing }}
                      >
                        <source src={video.src} type="video/mp4" />
                      </motion.video>
                    </div>
                    
                    {/* Title Overlay - Massive Serif */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <h3 className="font-serif text-[clamp(2.5rem,4vw,4rem)] text-[#F5F5F3] text-center px-8 leading-tight">
                        {video.title}
                      </h3>
                    </div>
                    
                    {/* Description - Small Sans-Serif Bottom Right */}
                    <div className="mt-4 text-right">
                      <p className="text-[9px] tracking-[0.35em] uppercase text-[#F5F5F3]/50">
                        {video.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* SERVICES - ASYMMETRIC SPLIT LAYOUT */}
        {/* ============================================ */}
        <AnimatedSection className="py-32" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8">
            {/* 35/65 Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
              {/* Left Side - 35% Width - Title + Context */}
              <motion.div className="lg:col-span-4" variants={staggerContainer}>
                <div className="lg:sticky lg:top-32">
                  <motion.div className="overflow-hidden mb-3" variants={textReveal}>
                    <h2 className="font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.95] text-[#0A0A0A] tracking-tight">
                      Services
                    </h2>
                  </motion.div>
                  <motion.p 
                    className="text-[#6B6B6B] text-[9px] tracking-[0.4em] uppercase mb-8"
                    variants={fadeInUp}
                  >
                    Comprehensive automation solutions
                  </motion.p>
                  <motion.p 
                    className="text-sm text-[#6B6B6B] leading-relaxed max-w-[400px]"
                    variants={fadeInUp}
                  >
                    From concept to completion, we deliver integrated systems that anticipate your needs and adapt to your lifestyle.
                  </motion.p>
                </div>
              </motion.div>
              
              {/* Right Side - 65% Width - Service Cards with Offset */}
              <motion.div className="lg:col-span-8" variants={staggerContainer}>
                <div className="space-y-1">
                  {services.map((s, idx) => (
                    <motion.div 
                      key={idx} 
                      className="group bg-[#FAFAFA] hover:bg-[#0A0A0A] transition-all duration-700 cursor-pointer border-b border-[#0A0A0A]/5"
                      variants={fadeInUp}
                      style={{ 
                        marginLeft: idx % 2 === 0 ? '0' : '8%',
                        padding: '3rem 2.5rem'
                      }}
                    >
                      <div className="flex items-start gap-6">
                        <div className="text-[#6B6B6B] group-hover:text-[#F5F5F3] transition-colors duration-700 mt-1">
                          {s.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif text-[clamp(1.5rem,3vw,2.5rem)] mb-3 text-[#0A0A0A] group-hover:text-[#F5F5F3] transition-colors duration-700 leading-tight">
                            {s.title}
                          </h3>
                          <p className="text-sm text-[#6B6B6B] leading-relaxed group-hover:text-[#F5F5F3]/60 transition-colors duration-700">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* WHY CHOOSE US - "A VISION OF INSPIRED LIVING" SPLIT */}
        {/* ============================================ */}
        <AnimatedSection className="py-0" dark={true}>
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
            {/* Left - Image (40% on desktop) with Parallax */}
            <motion.div 
              className="relative h-[50vh] lg:h-auto overflow-hidden lg:col-span-5"
              variants={scaleIn}
            >
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src="/videos/Dynamic_lighting.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]/40" />
            </motion.div>
            
            {/* Right - Content (60% on desktop) - Dark Background with Discretion */}
            <div className="lg:col-span-7 bg-[#0A0A0A] flex flex-col p-8 lg:p-20">
              <motion.div variants={staggerContainer}>
                {/* Large Serif Heading */}
                <div className="overflow-hidden mb-16">
                  <motion.h2 
                    className="font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92] text-[#F5F5F3] tracking-tight"
                    variants={textReveal}
                  >
                    Our Beliefs
                  </motion.h2>
                </div>
                
                <motion.p 
                  className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30 mb-12"
                  variants={fadeInUp}
                >
                  Excellence in every detail
                </motion.p>
              </motion.div>
              
              {/* Dense Text Block - Under Headline */}
              <motion.div 
                className="max-w-[450px] space-y-8"
                variants={staggerContainer}
              >
                {whyChooseUs.map((w, idx) => (
                  <motion.div 
                    key={idx} 
                    className="group"
                    variants={fadeInUp}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <Star className="w-3 h-3 text-[#F5F5F3]/30 mt-1 flex-shrink-0" />
                      <h3 className="font-serif text-xl text-[#F5F5F3] leading-tight">{w.title}</h3>
                    </div>
                    <p className="text-[#F5F5F3]/50 text-xs leading-relaxed pl-6">
                      {w.desc}
                    </p>
                  </motion.div>
                ))}
                
                {/* CTA - Book a Visit */}
                <motion.div className="pt-8" variants={fadeInUp}>
                  <LuxuryButton onClick={() => navigate('/inquiry')} variant="light" className="w-full sm:w-auto">
                    Book a Consultation
                  </LuxuryButton>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* STATS SECTION - ASYMMETRIC VISUAL ART */}
        {/* ============================================ */}
        <AnimatedSection className="py-40" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8">
            {/* Asymmetric Grid - Force Eye Travel */}
            <div className="relative h-[600px] md:h-[700px]">
              {/* Large Number - Bottom Left */}
              <motion.div 
                className="absolute bottom-0 left-0 md:left-[5%]"
                variants={fadeInUp}
              >
                <div className="font-serif text-[clamp(6rem,15vw,18rem)] leading-none text-[#0A0A0A] tracking-tight">
                  <AnimatedCounter end={4000} suffix="+" duration={2.5} />
                </div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] mt-2 ml-2">
                  Projects Delivered
                </p>
              </motion.div>

              {/* Medium Number - Top Right */}
              <motion.div 
                className="absolute top-[10%] right-[5%] md:right-[15%]"
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
              >
                <div className="font-serif text-[clamp(4rem,10vw,12rem)] leading-none text-[#0A0A0A] tracking-tight">
                  <AnimatedCounter end={98} suffix="%" duration={2.5} />
                </div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] mt-2 ml-2">
                  Client Satisfaction
                </p>
              </motion.div>

              {/* Small Number - Middle Right */}
              <motion.div 
                className="absolute top-[50%] right-0 md:right-[8%]"
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
              >
                <div className="font-serif text-[clamp(3rem,8vw,9rem)] leading-none text-[#0A0A0A] tracking-tight">
                  <AnimatedCounter end={8} suffix="+" duration={2.5} />
                </div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] mt-2 ml-2">
                  Years Experience
                </p>
              </motion.div>

              {/* Functional Number - Top Center (moved up to avoid overlap) */}
              <motion.div 
                className="absolute top-[35%] left-[50%] -translate-x-1/2"
                variants={fadeInUp}
                transition={{ delay: 0.9 }}
              >
                <div className="font-serif text-[clamp(3.5rem,9vw,10rem)] leading-none text-[#0A0A0A] tracking-tight">
                  <AnimatedCounter end={24} suffix="/7" duration={2.5} />
                </div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] mt-2 text-center">
                  Concierge Support
                </p>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* TESTIMONIALS - HORIZONTAL STICKY SCROLL */}
        {/* ============================================ */}
        <TestimonialsSection 
          testimonials={testimonials.length > 0 ? testimonials : defaultTestimonials}
          isLoading={isLoadingTestimonials}
        />

        {/* ============================================ */}
        {/* BRAND LOGOS */}
        {/* ============================================ */}
        <AnimatedSection className="py-24 overflow-hidden" dark={false}>
          <BrandLogos />
        </AnimatedSection>

        {/* ============================================ */}
        {/* AUDIENCE - ASYMMETRIC BENTO */}
        {/* ============================================ */}
        <AnimatedSection className="py-40" dark={true}>
          <div className="max-w-[1800px] mx-auto px-8">
            <div className="overflow-hidden mb-20 text-center">
              <motion.h2 
                className="font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.95] text-[#F5F5F3] tracking-tight"
                variants={textReveal}
              >
                For Whom
              </motion.h2>
            </div>
            
            {/* Asymmetric Uneven Grid */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-[#1A1A1A]/50"
              variants={staggerContainer}
            >
              {audiences.map((t, idx) => (
                <motion.div 
                  key={idx} 
                  className={`
                    bg-[#0A0A0A] group hover:bg-[#1A1A1A] transition-all duration-700 cursor-pointer
                    ${idx === 0 ? 'md:col-span-2 p-16 lg:p-24' : 'p-12 lg:p-16'}
                  `}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <span className={`
                    font-serif text-[#F5F5F3] block leading-tight
                    ${idx === 0 ? 'text-[clamp(2rem,4vw,4rem)]' : 'text-[clamp(1.5rem,3vw,2.5rem)]'}
                  `}>
                    {t}
                  </span>
                  <div className="mt-4 w-12 h-[1px] bg-[#F5F5F3]/20 group-hover:w-24 transition-all duration-700" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* CONTACT CTA - ASYMMETRIC SPLIT */}
        {/* ============================================ */}
        <AnimatedSection id="contact" className="py-40" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8">
            {/* 40/60 Asymmetric Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
              {/* Left - Heading (40%) */}
              <motion.div className="lg:col-span-5" variants={staggerContainer}>
                <div className="overflow-hidden mb-6">
                  <motion.h2 
                    className="font-serif text-[clamp(3rem,7vw,7rem)] leading-[0.92] text-[#0A0A0A] tracking-tight"
                    variants={textReveal}
                  >
                    Ready to Elevate Your Space?
                  </motion.h2>
                </div>
                <motion.p 
                  className="text-[9px] tracking-[0.4em] uppercase text-[#6B6B6B]/60 mt-8"
                  variants={fadeInUp}
                >
                  Connect with our experts
                </motion.p>
              </motion.div>
              
              {/* Right - CTAs + Contact (60%) with Offset */}
              <motion.div 
                className="lg:col-span-7 flex flex-col justify-center lg:pl-12"
                variants={staggerContainer}
              >
                <motion.p 
                  className="text-[#6B6B6B] text-sm leading-relaxed mb-12 max-w-[500px]"
                  variants={fadeInUp}
                >
                  Connect with our experts for personalized guidance or start building your automation plan. We provide white-glove consultation for every project.
                </motion.p>
                
                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  variants={staggerContainer}
                >
                  <motion.div variants={fadeInUp}>
                    <motion.div
                      variants={shimmer}
                      initial="initial"
                      animate="animate"
                    >
                      <LuxuryButton 
                        onClick={() => navigate('/inquiry')} 
                        variant="dark"
                        className="w-full shadow-[0_0_25px_rgba(10,10,10,0.1)]"
                      >
                        Get a Consultation
                      </LuxuryButton>
                    </motion.div>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <LuxuryButton 
                      onClick={() => navigate('/project-planning')} 
                      variant="dark"
                      className="w-full opacity-70 hover:opacity-100"
                    >
                      Start Project
                    </LuxuryButton>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <LuxuryButton 
                      onClick={() => window.location.href = 'mailto:support@cleub.com'} 
                      variant="dark"
                      className="w-full"
                    >
                      <Mail className="w-4 h-4 mr-2 inline" /> Email Us
                    </LuxuryButton>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <LuxuryButton 
                      onClick={() => window.location.href = 'tel:+919667603999'} 
                      variant="dark"
                      className="w-full"
                    >
                      <Phone className="w-4 h-4 mr-2 inline" /> +91 9667603999
                    </LuxuryButton>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* ============================================ */}
      {/* FOOTER - UNDERSTATED LUXURY */}
      {/* ============================================ */}
      <footer className="bg-[#0A0A0A] border-t border-[#1A1A1A] py-16 lg:py-20">
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left - Brand (35%) */}
            <motion.div 
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: luxuryEasing as any }}
            >
              <h3 className="font-serif text-3xl text-[#F5F5F3] mb-4">Cleub Automation</h3>
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30">
                Premium Home Automation
              </p>
            </motion.div>
            
            {/* Right - Locations Grid (65%) */}
            <motion.div 
              className="lg:col-span-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: luxuryEasing as any, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Jammu & Kashmir Corporate Office */}
                <motion.div 
                  className="bg-[#1A1A1A]/30 border border-[#1A1A1A] p-6 group hover:border-[#F5F5F3]/20 transition-all duration-500"
                  variants={fadeInUp}
                >
                  <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Corporate Office</p>
                  <p className="font-serif text-sm text-[#F5F5F3] mb-2 leading-tight">M/S Cleub Automation Private Limited</p>
                  <p className="text-[10px] leading-relaxed text-[#F5F5F3]/60">
                    Cabin A Academic Block Second Floor<br/>
                    Shri Mata Vaishno Devi University<br/>
                    Katra, Jammu and Kashmir 182320<br/>
                    India
                  </p>
                </motion.div>

                {/* Noida Corporate Office */}
                <motion.div 
                  className="bg-[#1A1A1A]/30 border border-[#1A1A1A] p-6 group hover:border-[#F5F5F3]/20 transition-all duration-500"
                  variants={fadeInUp}
                >
                  <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Corporate Office</p>
                  <p className="font-serif text-sm text-[#F5F5F3] mb-2 leading-tight">Unitech Unihomes</p>
                  <p className="text-[10px] leading-relaxed text-[#F5F5F3]/60">
                    F1-406, Sector 117<br/>
                    Noida 201304<br/>
                    Uttar Pradesh, India
                  </p>
                </motion.div>

                {/* Gurgaon Experience Centre */}
                <motion.div 
                  className="bg-[#1A1A1A]/30 border border-[#1A1A1A] p-6 group hover:border-[#F5F5F3]/20 transition-all duration-500"
                  variants={fadeInUp}
                >
                  <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Experience Centre</p>
                  <p className="font-serif text-sm text-[#F5F5F3] mb-2 leading-tight">Akashneem Marg</p>
                  <p className="text-[10px] leading-relaxed text-[#F5F5F3]/60">
                    78 Akashneem Marg, DLF Phase 2<br/>
                    Gurgaon, Haryana<br/>
                    (Second Floor), India
                  </p>
                </motion.div>

                {/* Delhi Experience Centre */}
                <motion.div 
                  className="bg-[#1A1A1A]/30 border border-[#1A1A1A] p-6 group hover:border-[#F5F5F3]/20 transition-all duration-500"
                  variants={fadeInUp}
                >
                  <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Experience Centre</p>
                  <p className="font-serif text-sm text-[#F5F5F3] mb-2 leading-tight">Saket Location</p>
                  <p className="text-[10px] leading-relaxed text-[#F5F5F3]/60">
                    M-50, Block M, Saket<br/>
                    New Delhi 110017<br/>
                    (Basement), India
                  </p>
                </motion.div>
              </div>

              {/* Footer Links */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 pt-8 border-t border-[#1A1A1A]">
                {[
                  { label: 'About Us', path: '/about' },
                  { label: 'Privacy Policy', path: '/privacy-policy' },
                  { label: 'Cookie Policy', path: '/cookie-policy' },
                  { label: 'Terms & Conditions', path: '/terms' },
                ].map((link) => (
                  <motion.button
                    key={link.label}
                    onClick={() => {
                      navigate(link.path);
                      setTimeout(() => window.scrollTo(0, 0), 50);
                    }}
                    className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/30 hover:text-[#F5F5F3]/70 transition-colors duration-500"
                    whileHover={{ y: -1 }}
                  >
                    {link.label}
                  </motion.button>
                ))}
              </div>
              
              <div className="text-right mt-8">
                <p className="text-[9px] tracking-[0.35em] text-[#F5F5F3]/20">
                  &copy; {new Date().getFullYear()} Cleub Automation. All rights reserved.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PremiumLanding;



'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, Variants } from 'framer-motion';
import { Film, Star, Phone, Mail, Lightbulb, Settings, Zap, Volume2, Lock, Wifi, Grid3x3, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandLogos } from "@/components/features";
import { TestimonialDialog } from "@/components/features";
import { useAuth } from '@/contexts/AuthContext';
import ProfileMenu from '@/components/ui/profile-menu';
import { Testimonial } from '@/lib/data/testimonials';

// ============================================
// ANIMATION VARIANTS - LUXURY EASING
// ============================================
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
// Uses suppressHydrationWarning to show static value on server, animate on client
// ============================================
const AnimatedCounter = ({ end, suffix = '', duration = 2, label = '' }: { end: number; suffix?: string; duration?: number; label?: string }) => {
  const [count, setCount] = useState(end); // Start with end value for SSR
  const [isMounted, setIsMounted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (!isMounted || !isInView) return;
    
    // Reset to 0 and animate
    setCount(0);
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, isMounted, end, duration]);
  
  return (
    <span ref={ref} aria-label={label || `${end}${suffix}`} suppressHydrationWarning>
      {count}{suffix}
    </span>
  );
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
  testimonials 
}: { 
  testimonials: Testimonial[];
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"]
  });

  const cardWidth = 450;
  const totalWidth = cardWidth * testimonials.length;
  const x = useTransform(scrollYProgress, [0, 0.85], [100, -totalWidth]);

  if (testimonials.length === 0) return null;

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
        <div className="w-full h-full flex items-center">
          <motion.div 
            className="flex gap-8 lg:gap-12 absolute left-0 pl-8 lg:pl-[45%]"
            style={{ x }}
          >
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="flex-shrink-0 w-[70vw] md:w-[350px] lg:w-[400px]"
              >
                <TestimonialDialog testimonial={testimonial} />
              </div>
            ))}
            <div className="w-[50vw] flex-shrink-0" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// PROPS TYPE
// ============================================
interface PremiumLandingClientProps {
  initialTestimonials: Testimonial[];
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function PremiumLandingClient({ initialTestimonials }: PremiumLandingClientProps) {
  const router = useRouter();
  const { user } = useAuth();
  const testimonials = initialTestimonials;
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const heroRef = useRef(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const whyVideoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Handle video autoplay on mount
  useEffect(() => {
    const playVideo = async (videoElement: HTMLVideoElement | null) => {
      if (!videoElement) return;
      
      try {
        videoElement.muted = true; // Ensure muted for autoplay
        await videoElement.play();
      } catch (error) {
        console.log('Video autoplay blocked, will play on user interaction');
        
        // Add one-time click listener to play video
        const playOnInteraction = async () => {
          try {
            await videoElement.play();
          } catch (err) {
            console.log('Could not play video:', err);
          }
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('scroll', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
        };
        
        document.addEventListener('click', playOnInteraction, { once: true });
        document.addEventListener('scroll', playOnInteraction, { once: true, passive: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true, passive: true });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      playVideo(heroVideoRef.current);
      playVideo(whyVideoRef.current);
      
      // Also handle all video feature cards
      const allVideos = document.querySelectorAll<HTMLVideoElement>('video');
      allVideos.forEach(video => playVideo(video));
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 50 || currentScrollY < lastScrollY) {
        setIsNavVisible(true);
      } 
      else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Video data
  const videoFeatures = [
    { src: "/videos/curtain2.mp4", title: "Smart Curtains", description: "Smart, Voice, App curtain control"},
    { src: "/videos/Dynamic_lighting.mp4", title: "Dynamic Lighting", description: "Dynamic Smart lighting"},
    { src: "/videos/Home_theater.mp4", title: "Home Theater", description: "Cinema-grade experience" },
    { src: "/videos/automation.mp4", title: "Full Automation", description: "Complete smart control"},
    { src: "/videos/setup.mp4", title: "Studio Setup", description: "Professional audio/video"},
    { src: "/videos/curtain.mp4", title: "Smart Curtains", description: "Automated curtain control"}
  ];

  // Services data
  const services = [
    { icon: <Zap className='w-7 h-7' />, title: 'Automation', desc: 'Intelligent home control systems for seamless integration.' },
    { icon: <Volume2 className='w-7 h-7' />, title: 'Audio-Video Theatres', desc: 'Cinema-grade systems with premium acoustics.' },
    { icon: <Lightbulb className='w-7 h-7' />, title: 'Lighting & Switches', desc: 'Smart lighting with adaptive control.' },
    { icon: <Lock className='w-7 h-7' />, title: 'Digital Locks', desc: 'Biometric and smart access control systems.' },
    { icon: <Wifi className='w-7 h-7' />, title: 'Networking', desc: 'Robust connectivity infrastructure.' },
    { icon: <Grid3x3 className='w-7 h-7' />, title: 'Curtain & Gate Motor', desc: 'Automated window treatments and gates.' },
    { icon: <Camera className='w-7 h-7' />, title: 'Security & Surveillance', desc: '24/7 monitoring with intelligent analytics.' },
    { icon: <Settings className='w-7 h-7' />, title: 'Consult & Supply', desc: 'Expert advisory and premium product sourcing.' }
  ];

  // Why Choose Us data
  const whyChooseUs = [
    { title: 'In‑house R&D', desc: 'Tested, validated technologies beyond standard WiFi.' },
    { title: 'Superior Tech', desc: 'Robust, reliable systems designed for luxury builds.' },
    { title: 'Exceptional Support', desc: 'White‑glove consultation, install and after‑sales.' }
  ];

  // Audience data
  const audiences = ['Ultra‑Luxury Homes', 'Designers & Architects', 'Builders & Developers', 'Tech Enthusiasts'];

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
        transition={{ duration: 0.4, ease: luxuryEasing }}
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
              <Link
                href="/login"
                className="text-[#F5F5F3] text-[10px] tracking-[0.35em] uppercase hover:opacity-50 transition-opacity duration-500"
              >
                Sign In
              </Link>
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
              ref={heroVideoRef}
              className="w-full h-[120%] object-cover opacity-40"
              autoPlay 
              muted 
              loop 
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              preload="auto"
              onContextMenu={(e) => e.preventDefault()}
              onCanPlay={(e) => {
                const video = e.target as HTMLVideoElement;
                video.play().catch(() => {});
              }}
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
              {/* Overline with Entity */}
              <motion.p 
                className="text-[#F5F5F3]/40 text-[10px] tracking-[0.4em] uppercase mb-12"
                variants={textReveal}
              >
                Luxury Home Automation · Gurgaon · Noida · Delhi NCR
              </motion.p>

              {/* Main Title - Extreme Scale Contrast */}
              <div className="max-w-[95%] lg:max-w-[80%]">
                <div className="overflow-hidden mb-2">
                  <motion.h1 
                    className="font-serif text-[#F5F5F3] text-[clamp(2.5rem,8vw,8.5rem)] leading-[0.95] tracking-tight"
                    variants={textReveal}
                  >
                    Effortless Life.
                  </motion.h1>
                </div>
                
                <div className="overflow-hidden mb-2 pb-1">
                  <motion.h1 
                    className="font-serif text-[#F5F5F3]/85 text-[clamp(1.5rem,4.5vw,5.5rem)] leading-[1.1] italic tracking-tight"
                    variants={textReveal}
                    style={{ marginLeft: '5%' }}
                  >
                    Engineered Beyond Doubt.
                  </motion.h1>
                </div>
                
                <div className="overflow-hidden">
                  <motion.h1 
                    className="font-serif text-[#F5F5F3] text-[clamp(2.5rem,8vw,8.5rem)] leading-[0.95] tracking-tight"
                    variants={textReveal}
                  >
                    Absolute Discretion.
                  </motion.h1>
                </div>
              </div>

              {/* Value Proposition - Concise */}
              <motion.div 
                className="mt-10 lg:mt-14 max-w-[480px]"
                variants={fadeInUp}
              >
                <p className="text-[#F5F5F3]/60 text-sm leading-relaxed tracking-wide">
                  Unbiased, white‑glove expertise. KNX-certified integrators delivering premium wired & wireless automation for discerning homeowners.
                </p>
              </motion.div>

              {/* CTA Button */}
              <motion.div 
                className="flex items-center justify-center gap-6 mt-10 lg:mt-12"
                variants={fadeInUp}
              >
                <motion.div
                  variants={shimmer}
                  initial="initial"
                  animate="animate"
                >
                  <LuxuryButton 
                    onClick={() => router.push('/inquiry')} 
                    variant="light" 
                    className="shadow-[0_0_40px_rgba(245,245,243,0.3),0_0_80px_rgba(245,245,243,0.15)] border-2"
                  >
                    Secure Your Expert Review
                  </LuxuryButton>
                </motion.div>
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
                    <div className={`h-[320px] overflow-hidden bg-[#1A1A1A] ${i % 2 === 0 ? 'mt-8' : ''}`}>
                      <motion.video 
                        className="w-full h-full object-cover" 
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                        disablePictureInPicture
                        disableRemotePlayback
                        preload="auto"
                        onContextMenu={(e: React.MouseEvent<HTMLVideoElement>) => e.preventDefault()}
                        onCanPlay={(e: React.SyntheticEvent<HTMLVideoElement>) => {
                          const video = e.target as HTMLVideoElement;
                          video.play().catch(() => {});
                        }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 1.2, ease: luxuryEasing }}
                      >
                        <source src={video.src} type="video/mp4" />
                      </motion.video>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <h3 className="font-serif text-[clamp(2.5rem,4vw,4rem)] text-[#F5F5F3] text-center px-8 leading-tight">
                        {video.title}
                      </h3>
                    </div>
                    
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
        {/* SERVICES - ASYMMETRIC MASONRY LAYOUT */}
        {/* ============================================ */}
        <AnimatedSection className="py-40" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8">
            {/* Header */}
            <motion.div className="mb-24" variants={staggerContainer}>
              <motion.div className="overflow-hidden mb-3" variants={textReveal}>
                <h2 className="font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.95] text-[#0A0A0A] tracking-tight">
                  Our Services
                </h2>
              </motion.div>
              <motion.p 
                className="text-[#6B6B6B] text-[9px] tracking-[0.4em] uppercase mb-4"
                variants={fadeInUp}
              >
                Comprehensive Automation Solutions
              </motion.p>
              <motion.p 
                className="text-sm text-[#6B6B6B] leading-relaxed max-w-[600px]"
                variants={fadeInUp}
              >
                From intelligent automation to premium audio-visual systems, we integrate cutting-edge technologies seamlessly into your lifestyle.
              </motion.p>
            </motion.div>

            {/* Masonry Grid */}
            <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-6 gap-3 auto-rows-[minmax(140px,auto)]">
              {/* Automation - Large Dark */}
              <motion.div 
                className="col-span-2 row-span-2 bg-[#0A0A0A] text-[#F5F5F3] rounded-2xl p-5 md:p-6 lg:p-8 cursor-pointer group overflow-hidden relative flex flex-col justify-between min-h-[200px] md:min-h-[280px]"
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5F5F3]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl bg-[#F5F5F3]/10 flex items-center justify-center group-hover:bg-[#F5F5F3]/25 transition-colors duration-500 mb-3 md:mb-4">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[#F5F5F3]" />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl lg:text-2xl text-[#F5F5F3] mb-2 leading-tight">
                    {services[0].title}
                  </h3>
                  <p className="text-[10px] md:text-[11px] text-[#F5F5F3]/70 leading-relaxed line-clamp-3">
                    {services[0].desc}
                  </p>
                </div>
                <div className="text-[#F5F5F3]/30 text-[9px] md:text-[10px] uppercase tracking-wider">Premium</div>
              </motion.div>

              {/* Audio-Video */}
              <motion.div 
                className="col-span-1 row-span-1 bg-white border border-[#0A0A0A]/10 rounded-2xl p-4 md:p-5 cursor-pointer group hover:border-[#0A0A0A]/30 transition-all duration-500 flex flex-col justify-between min-h-[140px]"
                variants={fadeInUp}
                whileHover={{ scale: 1.04, y: -2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#F5F5F3] flex items-center justify-center group-hover:bg-[#0A0A0A] transition-colors duration-500 mb-2 md:mb-3">
                  <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-[#0A0A0A] group-hover:text-[#F5F5F3] transition-colors duration-500" />
                </div>
                <div>
                  <h3 className="font-serif text-xs lg:text-sm text-[#0A0A0A] mb-1 leading-tight">
                    {services[1].title}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-[#6B6B6B] leading-relaxed line-clamp-2">
                    {services[1].desc}
                  </p>
                </div>
              </motion.div>

              {/* Security */}
              <motion.div 
                className="col-span-1 row-span-1 bg-white border border-[#0A0A0A]/10 rounded-2xl p-4 md:p-5 cursor-pointer group hover:border-[#0A0A0A]/30 transition-all duration-500 flex flex-col justify-between min-h-[140px]"
                variants={fadeInUp}
                whileHover={{ scale: 1.04, y: -2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#F5F5F3] flex items-center justify-center group-hover:bg-[#0A0A0A] transition-colors duration-500 mb-2 md:mb-3">
                  <Camera className="w-4 h-4 md:w-5 md:h-5 text-[#0A0A0A] group-hover:text-[#F5F5F3] transition-colors duration-500" />
                </div>
                <div>
                  <h3 className="font-serif text-xs lg:text-sm text-[#0A0A0A] mb-1 leading-tight">
                    {services[6].title}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-[#6B6B6B] leading-relaxed line-clamp-2">
                    {services[6].desc}
                  </p>
                </div>
              </motion.div>

              {/* Lighting - Large */}
              <motion.div 
                className="col-span-2 row-span-2 bg-white border-2 border-[#0A0A0A] rounded-2xl p-5 md:p-6 lg:p-8 cursor-pointer group hover:bg-[#0A0A0A] transition-all duration-700 overflow-hidden relative flex flex-col justify-between min-h-[200px] md:min-h-[280px]"
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#F5F5F3]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-full -mr-20 -mt-20" />
                <div className="relative z-10">
                  <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl bg-[#0A0A0A]/10 flex items-center justify-center group-hover:bg-[#F5F5F3]/20 transition-colors duration-500 mb-3 md:mb-4">
                    <Lightbulb className="w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-[#0A0A0A] group-hover:text-[#F5F5F3] transition-colors duration-500" />
                  </div>
                  <h3 className="font-serif text-lg md:text-xl lg:text-2xl text-[#0A0A0A] group-hover:text-[#F5F5F3] mb-2 leading-tight transition-colors duration-700">
                    {services[2].title}
                  </h3>
                  <p className="text-[10px] md:text-[11px] text-[#6B6B6B] group-hover:text-[#F5F5F3]/70 leading-relaxed line-clamp-3 transition-colors duration-700">
                    {services[2].desc}
                  </p>
                </div>
                <div className="text-[#0A0A0A] group-hover:text-[#F5F5F3]/30 text-[9px] md:text-[10px] uppercase tracking-wider transition-colors duration-700">Lighting</div>
              </motion.div>

              {/* Digital Locks */}
              <motion.div 
                className="col-span-1 row-span-1 bg-white border border-[#0A0A0A]/10 rounded-2xl p-4 md:p-5 cursor-pointer group hover:border-[#0A0A0A]/30 transition-all duration-500 flex flex-col justify-between min-h-[140px]"
                variants={fadeInUp}
                whileHover={{ scale: 1.04, y: -2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#F5F5F3] flex items-center justify-center group-hover:bg-[#0A0A0A] transition-colors duration-500 mb-2 md:mb-3">
                  <Lock className="w-4 h-4 md:w-5 md:h-5 text-[#0A0A0A] group-hover:text-[#F5F5F3] transition-colors duration-500" />
                </div>
                <div>
                  <h3 className="font-serif text-xs lg:text-sm text-[#0A0A0A] mb-1 leading-tight">
                    {services[3].title}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-[#6B6B6B] leading-relaxed line-clamp-2">
                    {services[3].desc}
                  </p>
                </div>
              </motion.div>

              {/* Curtain & Gate */}
              <motion.div 
                className="col-span-1 row-span-1 bg-white border border-[#0A0A0A]/10 rounded-2xl p-4 md:p-5 cursor-pointer group hover:border-[#0A0A0A]/30 transition-all duration-500 flex flex-col justify-between min-h-[140px]"
                variants={fadeInUp}
                whileHover={{ scale: 1.04, y: -2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#F5F5F3] flex items-center justify-center group-hover:bg-[#0A0A0A] transition-colors duration-500 mb-2 md:mb-3">
                  <Grid3x3 className="w-4 h-4 md:w-5 md:h-5 text-[#0A0A0A] group-hover:text-[#F5F5F3] transition-colors duration-500" />
                </div>
                <div>
                  <h3 className="font-serif text-xs lg:text-sm text-[#0A0A0A] mb-1 leading-tight">
                    {services[5].title}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-[#6B6B6B] leading-relaxed line-clamp-2">
                    {services[5].desc}
                  </p>
                </div>
              </motion.div>

              {/* Networking - Horizontal Dark */}
              <motion.div 
                className="col-span-2 md:col-span-3 row-span-1 bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-[#F5F5F3] rounded-2xl p-4 md:p-5 lg:p-6 cursor-pointer group overflow-hidden relative flex items-center justify-between min-h-[120px] md:min-h-[140px]"
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 100 }}
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#F5F5F3]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative z-10 flex-1">
                  <h3 className="font-serif text-sm md:text-base lg:text-lg text-[#F5F5F3] mb-1 leading-tight">
                    {services[4].title}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-[#F5F5F3]/70 leading-relaxed line-clamp-2">
                    {services[4].desc}
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#F5F5F3]/10 flex items-center justify-center group-hover:bg-[#F5F5F3]/25 transition-colors duration-500 ml-3 md:ml-4 flex-shrink-0">
                  <Wifi className="w-5 h-5 md:w-6 md:h-6 text-[#F5F5F3]" />
                </div>
              </motion.div>

              {/* Consult & Supply - Horizontal Light */}
              <motion.div 
                className="col-span-2 md:col-span-3 row-span-1 bg-gradient-to-br from-[#F5F5F3] via-[#FAFAFA] to-[#F0F0F0] rounded-2xl p-4 md:p-5 lg:p-6 cursor-pointer group hover:shadow-2xl transition-all duration-500 border border-[#0A0A0A]/5 flex items-center justify-between min-h-[120px] md:min-h-[140px]"
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
              >
                <div className="flex-1">
                  <h3 className="font-serif text-sm md:text-base lg:text-lg text-[#0A0A0A] mb-1 leading-tight">
                    {services[7].title}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-[#6B6B6B] leading-relaxed line-clamp-2">
                    {services[7].desc}
                  </p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#0A0A0A] flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#0A0A0A] group-hover:to-[#1A1A1A] transition-all duration-500 ml-3 md:ml-4 flex-shrink-0">
                  <Settings className="w-5 h-5 md:w-6 md:h-6 text-[#F5F5F3]" />
                </div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* WHY CHOOSE US - SPLIT LAYOUT */}
        {/* ============================================ */}
        <AnimatedSection className="py-0" dark={true}>
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
            {/* Left - Video */}
            <motion.div 
              className="relative h-[50vh] lg:h-auto overflow-hidden lg:col-span-5"
              variants={scaleIn}
            >
              <video 
                ref={whyVideoRef}
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                preload="auto"
                onContextMenu={(e) => e.preventDefault()}
                onCanPlay={(e) => {
                  const video = e.target as HTMLVideoElement;
                  video.play().catch(() => {});
                }}
              >
                <source src="/videos/Dynamic_lighting.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A]/40" />
            </motion.div>
            
            {/* Right - Content */}
            <div className="lg:col-span-7 bg-[#0A0A0A] flex flex-col p-8 lg:p-20">
              <motion.div variants={staggerContainer}>
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
                
                <motion.div className="pt-8" variants={fadeInUp}>
                  <LuxuryButton onClick={() => router.push('/inquiry')} variant="light" className="w-full sm:w-auto">
                    Book a Consultation
                  </LuxuryButton>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* STATS SECTION - ASYMMETRIC VISUAL */}
        {/* ============================================ */}
        <AnimatedSection className="py-40" dark={false}>
          <div className="max-w-[1800px] mx-auto px-8">
            {/* Noscript fallback for crawlers that don't execute JS */}
            <noscript>
              <div style={{ position: 'absolute', top: 0, left: 0, padding: '20px', background: '#F5F5F3', color: '#0A0A0A' }}>
                <h2>Cleub Home Automation - NCR Statistics</h2>
                <p><strong>4000+</strong> luxury home automation projects delivered across Delhi NCR since 2017.</p>
                <p><strong>8 years</strong> of experience in premium home automation.</p>
                <p><strong>KNX Certified</strong> team serving Gurgaon, Noida, Delhi, Faridabad, Ghaziabad.</p>
                <p>Budget range: ₹1 lakh per floor to ₹50 lakh+ for high-end wired automation.</p>
              </div>
            </noscript>
            
            <div className="relative h-[600px] md:h-[700px]">
              {/* Large Number - Bottom Left */}
              <motion.div 
                className="absolute bottom-0 left-0 md:left-[5%]"
                variants={fadeInUp}
              >
                <div className="font-serif text-[clamp(6rem,15vw,18rem)] leading-none text-[#0A0A0A] tracking-tight">
                  <AnimatedCounter end={4000} suffix="+" duration={2.5} label="4000+ projects delivered" />
                </div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] mt-2 ml-2">
                  Projects Delivered
                </p>
              </motion.div>

              {/* KNX Certified Badge - Top Right */}
              <motion.div 
                className="absolute top-[10%] right-[5%] md:right-[15%]"
                variants={fadeInUp}
              >
                <div className="font-serif text-[clamp(3rem,8vw,9rem)] leading-none text-[#0A0A0A] tracking-tight">
                  KNX
                </div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] mt-2 ml-2">
                  Certified Team
                </p>
              </motion.div>

              {/* Years Experience - Middle Right */}
              <motion.div 
                className="absolute top-[50%] right-0 md:right-[8%]"
                variants={fadeInUp}
              >
                <div className="font-serif text-[clamp(3rem,8vw,9rem)] leading-none text-[#0A0A0A] tracking-tight">
                  <AnimatedCounter end={8} suffix="" duration={2.5} label="8 years experience since 2017" />
                </div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] mt-2 ml-2">
                  Years Since 2017
                </p>
              </motion.div>

              {/* NCR Service Area - Top Center */}
              <motion.div 
                className="absolute top-[35%] left-[50%] -translate-x-1/2"
                variants={fadeInUp}
              >
                <div className="font-serif text-[clamp(2.5rem,6vw,7rem)] leading-none text-[#0A0A0A] tracking-tight text-center">
                  NCR
                </div>
                <p className="text-[9px] tracking-[0.35em] uppercase text-[#6B6B6B] mt-2 text-center">
                  Delhi • Gurgaon • Noida
                </p>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        {/* ============================================ */}
        {/* TESTIMONIALS - HORIZONTAL STICKY SCROLL */}
        {/* ============================================ */}
        <TestimonialsSection testimonials={testimonials} />

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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
              {/* Left - Heading */}
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
              
              {/* Right - CTAs */}
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
                        onClick={() => router.push('/inquiry')} 
                        variant="dark"
                        className="w-full shadow-[0_0_25px_rgba(10,10,10,0.1)]"
                      >
                        Get a Consultation
                      </LuxuryButton>
                    </motion.div>
                  </motion.div>
                  <motion.div variants={fadeInUp}>
                    <LuxuryButton 
                      onClick={() => {
                        if (user) {
                          router.push('/project-planning');
                        } else {
                          router.push('/login?returnTo=/project-planning');
                        }
                      }} 
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
            {/* Left - Brand */}
            <motion.div 
              className="lg:col-span-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: luxuryEasing }}
            >
              <h3 className="font-serif text-3xl text-[#F5F5F3] mb-4">Cleub Automation</h3>
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30">
                Premium Home Automation
              </p>
            </motion.div>
            
            {/* Right - Locations */}
            <motion.div 
              className="lg:col-span-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: luxuryEasing, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
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
                  { label: 'Blog', path: '/blog' },
                  { label: 'FAQ', path: '/faq' },
                  { label: 'Privacy Policy', path: '/privacy-policy' },
                  { label: 'Cookie Policy', path: '/cookie-policy' },
                  { label: 'Terms & Conditions', path: '/terms' },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.path}
                    className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/30 hover:text-[#F5F5F3]/70 transition-colors duration-500"
                  >
                    {link.label}
                  </Link>
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
}

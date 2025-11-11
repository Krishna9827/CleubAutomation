import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Film, Headphones, Cpu, Star, Quote, Phone, Mail, Sparkles, Lightbulb, Settings, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandLogos } from "@/components/features";
import SiteNav from '@/components/ui/site-nav';
import { TestimonialDialog } from "@/components/features";
import { useAuth } from '@/contexts/AuthContext';


const PremiumLanding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState(() => 
    JSON.parse(localStorage.getItem('testimonials') || '[]')
  );

  useEffect(() => {
    const handleStorageChange = () => {
      const updatedTestimonials = JSON.parse(localStorage.getItem('testimonials') || '[]');
      setTestimonials(updatedTestimonials);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <SiteNav
        brand="Cleub Automation"
        links={[
          { label: 'Home', href: '#home' },
          { label: 'Services', href: '#services' },
          { label: 'Testimonials', href: '#testimonials' },
          { label: 'Contact Us', href: '#contact' },
        ]}
      />
      <main>
        {/* Hero */}
        <section id="home" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.15),transparent_40%),radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.15),transparent_40%)]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-white to-slate-300
            ">
              Premium Wireless. Beyond WiFi. Future‑Ready. Local Control.
            </h1>
            <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">
              Local Controls, High Compatibility, superior non‑WiFi solutions, and white‑glove service for ultra‑luxury spaces.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button onClick={() => navigate('/inquiry')} className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white">
                Get a Consultation
              </Button>
              <Button 
                onClick={() => user ? navigate('/project-planning') : navigate('/login')} 
                variant="outline" 
                className="border-teal-600 text-teal-400 hover:bg-teal-600/10"
              >
                {user ? 'Start a Project' : 'Sign In'}
              </Button>
            </div>
          </div>
        </section>

        {/* Video Features - Horizontal scroll */}
        {/* Enhanced Video Features with Titles */}
        <section id="services" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-teal-400" />
              <h3 className="text-xl font-semibold text-white">Experience the Difference</h3>
            </div>
            <div className="overflow-x-auto no-scrollbar">
              <div className="flex gap-4 min-w-max">
                {[
                  { src: "/videos/curtain2.mp4", title: "Smart Curtains", description: "Smart, Voice, App curtain control"},
                  { src: "/videos/Dynamic_lighting.mp4", title: "Dynamic Lighting", description: "Dynamic Smart lighting"},
                  { src: "/videos/Home_theater.mp4", title: "Home Theater", description: "Cinema-grade experience" },
                  { src: "/videos/automation.mp4", title: "Full Automation", description: "Complete smart control"},
                  { src: "/videos/setup.mp4", title: "Studio Setup", description: "Professional audio/video"},
                  { src: "/videos/curtain.mp4", title: "Smart Curtains", description: "Automated curtain control"}
                ].map((video, i) => (
                  <div key={i} className="w-[320px] h-[180px] rounded-xl overflow-hidden bg-slate-800/60 border border-slate-700 shadow-lg hover:shadow-2xl transition-all relative group">
                    <video className="w-full h-full object-cover" autoPlay muted loop playsInline>
                      <source src={video.src} type="video/mp4" />
                    </video>
                    {/* Optional overlay title */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">{video.title}</p>
                      <p className="text-slate-400 text-xs mt-1">{video.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="testimonials" className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-semibold text-white mb-6">Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{icon:<Lightbulb className='w-5 h-5' />,title:'Home Automation',desc:'Wired/Hybrid systems, app/voice, scene control.'},
                {icon:<Headphones className='w-5 h-5' />,title:'Home Theaters',desc:'Acoustics, AVR, immersive setups.'},
                {icon:<Cpu className='w-5 h-5' />,title:'Studios',desc:'Production, podcast, creator studios.'},
                {icon:<Settings className='w-5 h-5' />,title:'Consult & Supply',desc:'Advisory, site audits, premium products.'}].map((s,idx)=> (
                <Card key={idx} className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-teal-900/40 text-teal-300 flex items-center justify-center mb-3">{s.icon}</div>
                    <div className="font-semibold text-slate-100">{s.title}</div>
                    <div className="text-sm text-slate-400 mt-1">{s.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-semibold text-white mb-6">Why Choose Us</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[{title:'In‑house R&D',desc:'Tested, validated technologies beyond standard WiFi.'},
                {title:'Superior Tech',desc:'Robust, reliable systems designed for luxury builds.'},
                {title:'Exceptional Support',desc:'White‑glove consultation, install and after‑sales.'}].map((w,idx)=> (
                <Card key={idx} className="bg-slate-900/60 border border-slate-800 backdrop-blur shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-teal-400"><Star className="w-4 h-4" /> <span className="font-semibold text-slate-100">{w.title}</span></div>
                    <div className="text-sm text-slate-400 mt-2">{w.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-5 h-5 text-teal-400" />
              <h3 className="text-xl font-semibold text-white">Featured Case Studies</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(testimonials.length > 0 ? testimonials : [
                  {
                    clientName: "A. Sharma, Luxury Villa Owner",
                    propertyType: "Smart Luxury Villa",
                    location: "New Delhi",
                    date: "September 2025",
                    quote: "Flawless installation and the most responsive support team we've worked with.",
                    projectDetails: "A comprehensive home automation project for a 10,000 sq ft villa featuring cutting-edge technology integration across lighting, security, entertainment, and climate control systems.",
                    features: [
                      "Voice-Controlled Lighting",
                      "Smart Security System",
                      "Home Theater",
                      "Climate Control",
                      "Automated Curtains",
                      "Smart Door Locks"
                    ],
                    results: [
                      "40% reduction in energy consumption",
                      "Enhanced security with 24/7 monitoring",
                      "Seamless integration of all home systems",
                      "Increased property value",
                    ],
                    videoUrl: "/videos/curtain2.mp4"
                  },
                  {
                    clientName: "R. Kapoor, Studio Owner",
                    propertyType: "Professional Recording Studio",
                    location: "Mumbai",
                    date: "August 2025",
                    quote: "The audio-visual integration is perfect. Every detail was considered in the setup.",
                    projectDetails: "State-of-the-art recording studio setup with advanced acoustic treatment, professional-grade equipment installation, and smart control systems.",
                    features: [
                      "Professional Audio Setup",
                      "Acoustic Treatment",
                      "Smart Lighting Control",
                      "Climate Control",
                      "Sound Isolation",
                      "Remote Monitoring"
                    ],
                    results: [
                      "Studio meets international recording standards",
                      "Perfect acoustic environment achieved",
                      "Flexible control system for different recording scenarios",
                      "Energy-efficient operation"
                    ],
                    videoUrl: "/videos/setup.mp4"
                  }
                ]).map((testimonial, index) => (
                <TestimonialDialog key={index} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Brand Logos */}
        <section className="py-12 overflow-hidden">
          <BrandLogos />
        </section>

        {/* Audience */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl font-semibold text-white mb-6">For Whom</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Ultra‑Luxury Homes','Designers & Architects','Builders & Developers','Tech Enthusiasts'].map((t,idx)=> (
                <div key={idx} className="rounded-xl px-4 py-6 text-center bg-slate-900/60 backdrop-blur border border-slate-800 shadow">
                  <div className="font-medium text-slate-100">{t}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section id="contact" className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h3 className="text-2xl font-bold text-white">Ready to Elevate Your Space?</h3>
            <p className="text-slate-400 mt-2">Connect with our experts for personalized guidance or start building your automation plan.</p>
            <div className="mt-6 flex justify-center gap-3 flex-wrap">
              <Button onClick={() => navigate('/inquiry')} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">Get a Consultation</Button>
              <Button onClick={() => navigate('/project-planning')} variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-600/10">Start Project</Button>
              <Button variant="outline" onClick={() => window.location.href = 'mailto:support@cleub.com'}><Mail className="w-4 h-4 mr-2" /> Email Us</Button>
              <Button variant="outline" onClick={() => window.location.href = 'tel:+919667603999'}><Phone className="w-4 h-4 mr-2 " /> +91 9667603999</Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Home Automation Planning System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PremiumLanding;



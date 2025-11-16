import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Home, Target, Award, Users } from 'lucide-react';
import SiteNav from '@/components/ui/site-nav';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <SiteNav
        brand="Cleub Automation"
        links={[
          { label: 'Home', href: '/' },
          { label: 'Services', href: '/#services' },
          { label: 'Contact', href: '/#contact' },
        ]}
        rightActions={
          <Button onClick={() => navigate('/inquiry')} size="sm" className="bg-teal-600 hover:bg-teal-700">
            Get Started
          </Button>
        }
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-white to-slate-300 mb-4">
            About Cleub Automation
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Pioneering premium wireless home automation solutions with local control, superior technology, and unmatched reliability.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-slate-900/70 backdrop-blur-sm border border-slate-800">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-900/40 text-teal-300 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                To deliver ultra-premium, future-ready home automation solutions that go beyond conventional WiFi technology, ensuring local control, superior reliability, and seamless integration for luxury residential and commercial spaces.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/70 backdrop-blur-sm border border-slate-800">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-teal-900/40 text-teal-300 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Our Vision</h2>
              </div>
              <p className="text-slate-300 leading-relaxed">
                To become the leading provider of intelligent automation solutions that redefine modern living through innovation, quality, and exceptional customer service, setting new standards in the smart home industry.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Who We Are */}
        <Card className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 mb-12">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-teal-900/40 text-teal-300 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Who We Are</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                Cleub Automation is a premier provider of cutting-edge home automation, home theater, and professional studio solutions. With a focus on ultra-luxury installations, we specialize in delivering robust, reliable, and future-ready systems that transcend traditional WiFi-based automation.
              </p>
              <p>
                Our in-house R&D team rigorously tests and validates every technology we implement, ensuring that our clients receive only the most advanced and dependable solutions. From comprehensive home automation systems to immersive home theaters and professional-grade studios, we bring expertise, innovation, and white-glove service to every project.
              </p>
              <p>
                We serve discerning homeowners, architects, designers, builders, and tech enthusiasts who demand excellence in every detail. Our commitment to superior technology, local control, and high compatibility sets us apart in the industry.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Our Expertise */}
        <Card className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Our Expertise</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold text-teal-400 mb-3">Home Automation</h3>
                <p className="text-slate-300 leading-relaxed">
                  Wired and hybrid systems featuring app and voice control, advanced scene management, and seamless integration across all devices for ultimate convenience and control.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-teal-400 mb-3">Home Theaters</h3>
                <p className="text-slate-300 leading-relaxed">
                  Cinema-grade acoustic design, premium AVR systems, and immersive audio-visual setups that transform your space into a private entertainment sanctuary.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-teal-400 mb-3">Professional Studios</h3>
                <p className="text-slate-300 leading-relaxed">
                  State-of-the-art production facilities, podcast setups, and creator studios equipped with professional-grade audio, video, and smart control systems.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-teal-400 mb-3">Consultation & Supply</h3>
                <p className="text-slate-300 leading-relaxed">
                  Expert advisory services, comprehensive site audits, and access to premium products and components from globally trusted brands.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why Choose Us */}
        <Card className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Why Choose Cleub Automation</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-900/40 text-teal-300 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">In-House R&D</h3>
                  <p className="text-slate-300">Rigorously tested and validated technologies that go beyond standard WiFi solutions.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-900/40 text-teal-300 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Superior Technology</h3>
                  <p className="text-slate-300">Robust, reliable systems engineered specifically for luxury builds and high-end installations.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-900/40 text-teal-300 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Exceptional Support</h3>
                  <p className="text-slate-300">White-glove consultation, professional installation, and comprehensive after-sales support.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-teal-900/40 text-teal-300 flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Local Control</h3>
                  <p className="text-slate-300">Systems designed to function seamlessly with or without internet connectivity, ensuring uninterrupted operation.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Transform Your Space?</h2>
          <p className="text-slate-400 mb-6">
            Let's discuss how we can bring cutting-edge automation to your home or business.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate('/inquiry')} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
              Get a Consultation
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-600/10">
              Back to Home
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-xl py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} Cleub Automation. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

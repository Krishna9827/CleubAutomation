import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/supabase/adminService';

// Luxury easing
const luxuryEasing = [0.22, 1, 0.36, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 1, ease: luxuryEasing }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const Inquiry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    firstName: userProfile?.first_name || '',
    lastName: userProfile?.last_name || '',
    email: user?.email || '',
    phone: userProfile?.phone_number || '',
    propertyType: '',
    propertySize: '',
    location: '',
    budget: '',
    requirements: '',
    timeline: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      toast({
        title: 'Error',
        description: 'Phone number must be 10 digits',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create comprehensive message with all details (for backward compatibility)
      const detailedMessage = `
Property Type: ${formData.propertyType || 'Not specified'}
Property Size: ${formData.propertySize || 'Not specified'} sq ft
Location: ${formData.location || 'Not specified'}
Budget: ${formData.budget || 'Not specified'}
Timeline: ${formData.timeline || 'Not specified'}
Requirements: ${formData.requirements || 'Not specified'}
      `.trim();

      // Set a timeout for the submission
      const submissionTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Submission timed out. Please check your internet connection and try again.')), 20000)
      );

      // Save inquiry to Supabase with all fields
      const inquiryPromise = adminService.createInquiry({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        property_type: formData.propertyType || null,
        property_size: formData.propertySize || null,
        location: formData.location || null,
        budget: formData.budget || null,
        requirements: formData.requirements || null,
        timeline: formData.timeline || null,
        message: detailedMessage,
        status: 'pending',
      });

      const inquiryId = await Promise.race([inquiryPromise, submissionTimeout]) as string;

      console.log('✅ Inquiry saved to Supabase successfully. Inquiry ID:', inquiryId);
      toast({
        title: 'Success!',
        description: 'Your inquiry has been submitted. We will contact you soon.',
      });

      // Reset form
      setFormData({
        firstName: userProfile?.first_name || '',
        lastName: userProfile?.last_name || '',
        email: user?.email || '',
        phone: userProfile?.phone_number || '',
        propertyType: '',
        propertySize: '',
        location: '',
        budget: '',
        requirements: '',
        timeline: '',
      });

      // Redirect after delay
      setTimeout(() => navigate('/'), 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit inquiry',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Understated Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 mix-blend-difference"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 1.2, ease: luxuryEasing as any, delay: 0.3 }}
      >
        <div className="max-w-[1800px] mx-auto px-8 lg:px-12 py-8 flex justify-between items-center">
          <motion.button
            onClick={() => navigate('/')}
            className="text-[#F5F5F3] font-serif text-2xl tracking-tight hover:opacity-60 transition-opacity duration-500"
          >
            Cleub Automation
          </motion.button>
          <motion.button 
            onClick={() => navigate('/')}
            className="text-[#F5F5F3] text-[10px] tracking-[0.35em] uppercase hover:opacity-50 transition-opacity duration-500 flex items-center gap-2"
            whileHover={{ x: -4 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </motion.button>
        </div>
      </motion.nav>

      <main className="pt-32 pb-20">
        {/* Hero Title - Asymmetric */}
        <motion.div 
          className="max-w-[1800px] mx-auto px-8 lg:px-16 mb-20"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p 
            className="text-[#F5F5F3]/30 text-[9px] tracking-[0.4em] uppercase mb-6"
            variants={fadeInUp}
          >
            Expert Consultation
          </motion.p>
          <div className="max-w-[75%]">
            <motion.h1 
              className="font-serif text-[#F5F5F3] text-[clamp(3rem,8vw,8rem)] leading-[0.95] tracking-tight mb-8"
              variants={fadeInUp}
            >
              Tell Us About Your Vision.
            </motion.h1>
            <motion.p 
              className="text-[#F5F5F3]/60 text-sm leading-loose tracking-wide max-w-[600px]"
              variants={fadeInUp}
            >
              Share your project details with our expert team. Whether you're automating a residence, building a studio, or transforming a commercial space—we provide tailored solutions with white-glove service.
            </motion.p>
          </div>
        </motion.div>

        {/* Inquiry Form - 35/65 Asymmetric Grid */}
        <motion.div 
          className="max-w-[1800px] mx-auto px-8 lg:px-16"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Left Sidebar - 35% - Form Labels & Context */}
            <motion.div className="lg:col-span-4 lg:sticky lg:top-32 lg:h-fit" variants={fadeInUp}>
              <p className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30 mb-8">
                Confidential Inquiry
              </p>
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-[#F5F5F3] text-2xl mb-2">Personal Details</h3>
                  <p className="text-[#F5F5F3]/40 text-xs tracking-wide">Your information remains secure</p>
                </div>
                <div>
                  <h3 className="font-serif text-[#F5F5F3] text-2xl mb-2">Project Scope</h3>
                  <p className="text-[#F5F5F3]/40 text-xs tracking-wide">Help us understand your vision</p>
                </div>
                <div>
                  <h3 className="font-serif text-[#F5F5F3] text-2xl mb-2">Timeline & Budget</h3>
                  <p className="text-[#F5F5F3]/40 text-xs tracking-wide">Planning for excellence</p>
                </div>
              </div>
            </motion.div>

            {/* Right Form Area - 65% */}
            <motion.div className="lg:col-span-8" variants={fadeInUp}>
              <form onSubmit={handleSubmit} className="space-y-12">
              {/* Personal Information - Minimalist Inputs */}
              <div className="space-y-6 pb-12 border-b border-[#1A1A1A]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="email" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                      Phone Number * (10 digits)
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.slice(0, 10))}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Project Details - Luxury Selects & Inputs */}
              <div className="space-y-6 pb-12 border-b border-[#1A1A1A]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="propertyType" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                      Property Type
                    </Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                      <SelectTrigger className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-[#1A1A1A]">
                        <SelectItem value="villa">Villa / Standalone House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="studio">Studio / Creative Space</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="hotel">Hotel / Hospitality</SelectItem>
                        <SelectItem value="retail">Retail / Commercial</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="propertySize" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                      Property Size (sq ft)
                    </Label>
                    <Input
                      id="propertySize"
                      type="text"
                      placeholder="e.g., 5000"
                      value={formData.propertySize}
                      onChange={(e) => handleInputChange('propertySize', e.target.value)}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                      Location / City
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Bangalore"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                      Budget Range (INR)
                    </Label>
                    <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border-[#1A1A1A]">
                        <SelectItem value="<5L">Less than 5 Lakhs</SelectItem>
                        <SelectItem value="5L-10L">5 - 10 Lakhs</SelectItem>
                        <SelectItem value="10L-25L">10 - 25 Lakhs</SelectItem>
                        <SelectItem value="25L-50L">25 - 50 Lakhs</SelectItem>
                        <SelectItem value=">50L">Above 50 Lakhs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Requirements & Timeline */}
              <div className="space-y-6 pb-12">
                <div>
                  <Label htmlFor="requirements" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                    Project Requirements
                  </Label>
                  <Textarea
                    id="requirements"
                    placeholder="Describe your automation needs, preferences, and any specific requirements..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border border-[#F5F5F3]/20 rounded-none px-4 py-4 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500 min-h-[150px] resize-none"
                  />
                </div>
                <div>
                  <Label htmlFor="timeline" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 mb-3 block">
                    Project Timeline
                  </Label>
                  <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                    <SelectTrigger className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-[#1A1A1A]">
                      <SelectItem value="immediate">Immediate (Next 2 weeks)</SelectItem>
                      <SelectItem value="1month">Within 1 Month</SelectItem>
                      <SelectItem value="2-3months">2-3 Months</SelectItem>
                      <SelectItem value="4-6months">4-6 Months</SelectItem>
                      <SelectItem value="6+months">6+ Months</SelectItem>
                      <SelectItem value="exploring">Just Exploring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button - Luxury Style */}
              <div className="flex items-center justify-center pt-8">
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="px-12 py-4 rounded-full border-2 border-[#F5F5F3] text-[#F5F5F3] text-xs tracking-[0.2em] uppercase hover:bg-[#F5F5F3] hover:text-[#0A0A0A] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(245,245,243,0.2)]"
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                >
                  {isLoading ? 'Submitting...' : 'Submit Inquiry'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </motion.div>

        {/* Contact Information - Minimalist Cards */}
        <motion.div 
          className="max-w-[1800px] mx-auto px-8 lg:px-16 mt-32"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30 mb-12 text-center" variants={fadeInUp}>
            Alternative Contact Methods
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-1 bg-[#1A1A1A]/30">
            <motion.a 
              href="mailto:support@cleub.com"
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 text-center group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <Mail className="w-5 h-5 text-[#F5F5F3]/30 mx-auto mb-3 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-2">Email</p>
              <p className="text-[#F5F5F3]/60 text-xs">support@cleub.com</p>
            </motion.a>
            <motion.a 
              href="tel:+919667603999"
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 text-center group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <Phone className="w-5 h-5 text-[#F5F5F3]/30 mx-auto mb-3 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-2">Phone</p>
              <p className="text-[#F5F5F3]/60 text-xs">+91 9667603999</p>
            </motion.a>
            <motion.div 
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 text-center group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <MapPin className="w-5 h-5 text-[#F5F5F3]/30 mx-auto mb-3 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-2">Jammu & Kashmir</p>
              <p className="text-[#F5F5F3]/60 text-xs">Corporate Office</p>
            </motion.div>
            <motion.div 
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 text-center group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <MapPin className="w-5 h-5 text-[#F5F5F3]/30 mx-auto mb-3 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-2">Delhi</p>
              <p className="text-[#F5F5F3]/60 text-xs">Experience Centre</p>
            </motion.div>
            <motion.div 
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 text-center group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <MapPin className="w-5 h-5 text-[#F5F5F3]/30 mx-auto mb-3 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-2">Haryana</p>
              <p className="text-[#F5F5F3]/60 text-xs">Experience Centre</p>
            </motion.div>
            <motion.div 
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-8 text-center group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <MapPin className="w-5 h-5 text-[#F5F5F3]/30 mx-auto mb-3 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-2">Noida</p>
              <p className="text-[#F5F5F3]/60 text-xs">Corporate Office</p>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Footer - Understated */}
      <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A] py-12 mt-32">
        <div className="max-w-[1800px] mx-auto px-8 lg:px-16 text-center">
          <p className="text-[9px] tracking-[0.35em] text-[#F5F5F3]/20 uppercase">
            &copy; {new Date().getFullYear()} Cleub Automation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Inquiry;

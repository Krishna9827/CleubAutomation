
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, Lightbulb, ChevronRight, Settings } from 'lucide-react';
import { projectService } from '@/supabase/projectService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ProfileMenu from '@/components/ui/profile-menu';
import SiteNav from '@/components/ui/site-nav';

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

const ProjectPlanning = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout, loading } = useAuth();
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    architectName: '',
    designerName: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Redirect if not logged in (only after auth state is loaded)
  if (!loading && !user) {
    navigate('/login', { replace: true });
    return null;
  }

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5F5F3]"></div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartPlanning = async () => {
    // User is guaranteed to be authenticated at this point
    if (!formData.projectName.trim() || !formData.clientName.trim()) {
      toast({
        title: 'Error',
        description: 'Project name and client name are required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('🚀 Creating project for user:', user?.id);
      
      // Create project with Supabase
      const projectId = await projectService.createProject({
        client_info: {
          name: formData.clientName,
          email: formData.clientEmail,
          phone: formData.clientPhone,
          address: formData.clientAddress,
        },
        property_details: {
          type: '',
          size: 0,
          budget: 0,
        }
      }, user!.id);

      // Store project ID for next page
      localStorage.setItem('currentProjectId', projectId);

      toast({
        title: 'Success',
        description: 'Project created successfully'
      });

      navigate('/room-selection', { state: { projectId } });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.projectName.trim() && formData.clientName.trim();

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Smart Navigation - Hides on scroll down, shows on scroll up */}
      <motion.nav 
        className="fixed top-0 left-0 w-full z-50 mix-blend-difference px-8 lg:px-16 py-6"
        initial={{ opacity: 1, y: 0 }}
        animate={{ 
          opacity: isNavVisible ? 1 : 0,
          y: isNavVisible ? 0 : -100,
          pointerEvents: isNavVisible ? 'auto' : 'none'
        }}
        transition={{ duration: 0.4, ease: luxuryEasing }}
      >
        <div className="flex justify-between items-center">
          <motion.button
            onClick={() => navigate('/')}
            className="font-serif text-2xl text-[#F5F5F3]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: luxuryEasing }}
          >
            Cleub
          </motion.button>
          <div className="flex items-center gap-8">
            <motion.button
              onClick={() => navigate('/my-projects')}
              className="text-[10px] tracking-[0.35em] uppercase text-[#F5F5F3] hover:opacity-60 transition-opacity duration-500"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: luxuryEasing }}
            >
              Project History
            </motion.button>
            {/* User Profile Menu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: luxuryEasing }}
            >
              <ProfileMenu />
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-screen pt-32 pb-16">
        <div className="max-w-[1800px] mx-auto px-8 lg:px-16 w-full">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p 
              className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30 mb-8"
              variants={fadeInUp}
            >
              Begin Your Journey
            </motion.p>
            <motion.h2 
              className="font-serif text-[clamp(2.5rem,6vw,6rem)] leading-[0.95] text-[#F5F5F3] mb-6"
              variants={fadeInUp}
            >
              Plan Your<br />Smart Home.
            </motion.h2>
            <motion.p 
              className="text-[#F5F5F3]/60 max-w-2xl mx-auto text-sm"
              variants={fadeInUp}
            >
              Start by providing some basic project details to begin planning your home automation setup.
            </motion.p>
          </motion.div>

          {/* Features */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-[#1A1A1A]/30 mb-16"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div 
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-12 group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <Users className="w-8 h-8 text-[#F5F5F3]/30 mb-6 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Feature 01</p>
              <h3 className="text-lg text-[#F5F5F3] mb-3 font-serif">Manage Clients</h3>
              <p className="text-[#F5F5F3]/60 text-sm">Keep track of your clients and their project requirements efficiently.</p>
            </motion.div>
            <motion.div 
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-12 group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <Lightbulb className="w-8 h-8 text-[#F5F5F3]/30 mb-6 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Feature 02</p>
              <h3 className="text-lg text-[#F5F5F3] mb-3 font-serif">Appliance Planning</h3>
              <p className="text-[#F5F5F3]/60 text-sm">Plan and manage all the appliances and electrical components in your project.</p>
            </motion.div>
            <motion.div 
              className="bg-[#0A0A0A] border border-[#1A1A1A] p-12 group hover:border-[#F5F5F3]/20 transition-colors duration-500"
              variants={fadeInUp}
            >
              <Settings className="w-8 h-8 text-[#F5F5F3]/30 mb-6 group-hover:text-[#F5F5F3]/60 transition-colors duration-500" />
              <p className="text-[8px] tracking-[0.35em] uppercase text-[#F5F5F3]/40 mb-3">Feature 03</p>
              <h3 className="text-lg text-[#F5F5F3] mb-3 font-serif">Customizable Settings</h3>
              <p className="text-[#F5F5F3]/60 text-sm">Customize appliance types, wattage presets, and export formats.</p>
            </motion.div>
          </motion.div>

          {/* Form */}
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p 
              className="text-[9px] tracking-[0.4em] uppercase text-[#F5F5F3]/30 mb-8 text-center"
              variants={fadeInUp}
            >
              Project Information
            </motion.p>
            <motion.form 
              className="space-y-8"
              variants={fadeInUp}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="projectName" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                    Project Name *
                  </Label>
                  <Input
                    type="text"
                    id="projectName"
                    placeholder="Enter project name"
                    value={formData.projectName}
                    onChange={(e) => handleInputChange('projectName', e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="clientName" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                    Client Name *
                  </Label>
                  <Input
                    type="text"
                    id="clientName"
                    placeholder="Enter client name"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="clientEmail" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                    Client Email
                  </Label>
                  <Input
                    type="email"
                    id="clientEmail"
                    placeholder="client@email.com"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="clientPhone" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                    Client Phone
                  </Label>
                  <Input
                    type="tel"
                    id="clientPhone"
                    placeholder="+91 9876543210"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="clientAddress" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                  Client Address
                </Label>
                <Input
                  type="text"
                  id="clientAddress"
                  placeholder="Enter client address"
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                  className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="architectName" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                    Architect Name
                  </Label>
                  <Input
                    type="text"
                    id="architectName"
                    placeholder="Architect name"
                    value={formData.architectName}
                    onChange={(e) => handleInputChange('architectName', e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="designerName" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                    Interior Designer
                  </Label>
                  <Input
                    type="text"
                    id="designerName"
                    placeholder="Designer name"
                    value={formData.designerName}
                    onChange={(e) => handleInputChange('designerName', e.target.value)}
                    className="bg-transparent text-[#F5F5F3] border-0 border-b border-[#F5F5F3]/20 rounded-none px-0 py-3 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes" className="text-[9px] tracking-[0.3em] uppercase text-[#F5F5F3]/40 block">
                  Project Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes or requirements..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-transparent text-[#F5F5F3] border border-[#F5F5F3]/20 rounded-none px-4 py-4 placeholder:text-[#F5F5F3]/20 focus-visible:ring-0 focus-visible:border-[#F5F5F3]/60 transition-colors duration-500 min-h-[120px] resize-none"
                />
              </div>

              <div className="flex justify-center pt-8">
                <motion.button
                  type="button"
                  onClick={handleStartPlanning}
                  disabled={!isFormValid || isLoading}
                  className="px-16 py-4 rounded-full border-2 border-[#F5F5F3] text-[#F5F5F3] text-xs tracking-[0.2em] uppercase hover:bg-[#F5F5F3] hover:text-[#0A0A0A] transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(245,245,243,0.2)]"
                  whileHover={{ scale: (!isFormValid || isLoading) ? 1 : 1.02 }}
                  whileTap={{ scale: (!isFormValid || isLoading) ? 1 : 0.98 }}
                >
                  {isLoading ? 'Creating Project...' : 'Start Planning'}
                </motion.button>
              </div>
            </motion.form>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A] py-12">
        <div className="max-w-[1800px] mx-auto px-8 lg:px-16 text-center">
          <p className="text-[9px] tracking-[0.35em] text-[#F5F5F3]/20 uppercase">
            &copy; {new Date().getFullYear()} Cleub Automation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProjectPlanning;

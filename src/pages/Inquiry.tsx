import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Building2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/supabase/adminService';

const Inquiry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: '',
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
      // Save inquiry to Supabase
      await adminService.createInquiry({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        message: `Property Type: ${formData.propertyType}\nProperty Size: ${formData.propertySize}\nLocation: ${formData.location}\nBudget: ${formData.budget}\nRequirements: ${formData.requirements}\nTimeline: ${formData.timeline}`,
        status: 'pending',
      });

      console.log('✅ Inquiry saved to Firebase');
      toast({
        title: 'Success!',
        description: 'Your inquiry has been submitted. We will contact you soon.',
      });

      // Reset form
      setFormData({
        firstName: user?.displayName?.split(' ')[0] || '',
        lastName: user?.displayName?.split(' ').slice(1).join(' ') || '',
        email: user?.email || '',
        phone: '',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div 
            className="text-white font-semibold tracking-wide cursor-pointer flex items-center gap-2" 
            onClick={() => navigate('/')}
          >
            <Building2 className="w-6 h-6 text-teal-600" />
            <span>Cleub Automation</span>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-slate-300 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Tell Us About Your Project
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Share your vision with our expert team. Whether you're looking to automate a home, build a studio, or upgrade your space, we're here to help.
          </p>
        </div>

        {/* Inquiry Form */}
        <Card className="bg-black/40 backdrop-blur-sm shadow-2xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Project Inquiry Form</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">First Name *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400 mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400 mt-1"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400 mt-1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number * (10 digits)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value.slice(0, 10))}
                      className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400 mt-1"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="propertyType" className="text-white">Property Type</Label>
                    <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                      <SelectTrigger className="bg-slate-800/50 text-white border-slate-700 mt-1">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
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
                    <Label htmlFor="propertySize" className="text-white">Property Size (sq ft)</Label>
                    <Input
                      id="propertySize"
                      type="text"
                      placeholder="e.g., 5000"
                      value={formData.propertySize}
                      onChange={(e) => handleInputChange('propertySize', e.target.value)}
                      className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400 mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label htmlFor="location" className="text-white">Location / City</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="e.g., Bangalore"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budget" className="text-white">Budget Range (INR)</Label>
                    <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                      <SelectTrigger className="bg-slate-800/50 text-white border-slate-700 mt-1">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
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
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Requirements & Timeline</h3>
                <div className="mb-4">
                  <Label htmlFor="requirements" className="text-white">What are you looking for?</Label>
                  <Textarea
                    id="requirements"
                    placeholder="Describe your automation needs, preferences, and any specific requirements..."
                    value={formData.requirements}
                    onChange={(e) => handleInputChange('requirements', e.target.value)}
                    className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400 mt-1 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="timeline" className="text-white">Timeline</Label>
                  <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                    <SelectTrigger className="bg-slate-800/50 text-white border-slate-700 mt-1">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
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

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
                >
                  {isLoading ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="border-slate-600 text-slate-300 hover:text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Mail className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Email Us</h4>
              <a href="mailto:support@cleub.com" className="text-slate-300 hover:text-teal-400 transition-colors text-sm">
                support@cleub.com
              </a>
            </CardContent>
          </Card>
          <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <Phone className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Call Us</h4>
              <a href="tel:+919667603999" className="text-slate-300 hover:text-teal-400 transition-colors text-sm">
                +91 9667603999
              </a>
            </CardContent>
          </Card>
          <Card className="bg-black/40 backdrop-blur-sm border border-white/10">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-teal-400 mx-auto mb-3" />
              <h4 className="text-white font-semibold mb-2">Office</h4>
              <p className="text-slate-300 text-sm">
                Bangalore, India
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-300">
          &copy; {new Date().getFullYear()} Cleub Automation. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Inquiry;

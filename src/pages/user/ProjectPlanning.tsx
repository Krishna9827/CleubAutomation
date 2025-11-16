
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, Lightbulb, ChevronRight, Settings } from 'lucide-react';
import { projectService } from '@/supabase/projectService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import SiteNav from '@/components/ui/site-nav';

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartPlanning = async () => {
    // Check if user is authenticated
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a new project',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

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
      console.log('🚀 Creating project for user:', user.id);
      
      // Create project with Supabase (using user.id not user.uid - Supabase Auth uses .id)
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
      }, user.id);

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
    <div>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col transition-colors">
      <SiteNav
        brand="Cleub Automation"
        links={[
          { label: 'Home', href: '/' },
        ]}
      />

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Plan Your Smart Home with Ease
            </h2>
            <p className="mt-3 text-slate-300">
              Start by providing some basic project details to begin planning your home automation setup.
            </p>
          </div>

          {/* Features */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-black/40 backdrop-blur-sm shadow-xl border border-white/10 hover:shadow-2xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl mb-4 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Manage Clients</h3>
                <p className="text-slate-300">Keep track of your clients and their project requirements efficiently.</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 backdrop-blur-sm shadow-xl border border-white/10 hover:shadow-2xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-900 text-blue-400 rounded-xl mb-4 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Appliance Planning</h3>
                <p className="text-slate-300">Plan and manage all the appliances and electrical components in your project.</p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 backdrop-blur-sm shadow-xl border border-white/10 hover:shadow-2xl transition-shadow">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-xl mb-4 flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Customizable Settings</h3>
                <p className="text-slate-300">Customize appliance types, wattage presets, and export formats.</p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="mt-12 bg-black/40 backdrop-blur-sm shadow-xl border border-white/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName" className="text-white">Project Name</Label>
                <Input
                  type="text"
                  id="projectName"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                  className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="clientName" className="text-white">Client Name</Label>
                <Input
                  type="text"
                  id="clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail" className="text-white">Client Email (Optional)</Label>
                <Input
                  type="email"
                  id="clientEmail"
                  placeholder="Enter client email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone" className="text-white">Client Phone (Optional)</Label>
                <Input
                  type="tel"
                  id="clientPhone"
                  placeholder="Enter client phone"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress" className="text-white">Client Address (Optional)</Label>
                <Input
                  type="text"
                  id="clientAddress"
                  placeholder="Enter client address"
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                  className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="architectName" className="text-white">Architect Name (Optional)</Label>
                <Input
                  type="text"
                  id="architectName"
                  placeholder="Enter architect name"
                  value={formData.architectName}
                  onChange={(e) => handleInputChange('architectName', e.target.value)}
                  className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="designerName" className="text-white">Interior Designer (Optional)</Label>
                <Input
                  type="text"
                  id="designerName"
                  placeholder="Enter designer name"
                  value={formData.designerName}
                  onChange={(e) => handleInputChange('designerName', e.target.value)}
                  className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400"
                />
              </div>
              <div>
                <Label htmlFor="notes" className="text-white">Project Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any project notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="bg-slate-800/50 text-white border-slate-700 placeholder:text-slate-400"
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                onClick={handleStartPlanning}
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? 'Creating Project...' : 'Start Planning'}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-300">
          &copy; {new Date().getFullYear()} Home Automation Planning System. All rights reserved.
        </div>
      </footer>
      </div>
    </div>
  );
};

export default ProjectPlanning;

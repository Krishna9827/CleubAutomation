
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, Users, Lightbulb, ChevronRight, Settings, History } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    clientName: '',
    architectName: '',
    designerName: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStartPlanning = () => {
    if (!formData.projectName.trim() || !formData.clientName.trim()) {
      return;
    }
    localStorage.setItem('projectData', JSON.stringify(formData));
    localStorage.removeItem('projectRooms');
    navigate('/room-selection');
  };

  const isFormValid = formData.projectName.trim() && formData.clientName.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Home Automation Planner</h1>
                <p className="text-sm text-slate-600">Professional electrical & appliance planning</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/admin')}
                className="hidden sm:flex"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Plan Your Smart Home with Ease
            </h2>
            <p className="mt-3 text-slate-600">
              Start by providing some basic project details to begin planning your home automation setup.
            </p>
          </div>

          {/* Features */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl mb-4 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Manage Clients</h3>
                <p className="text-slate-600">Keep track of your clients and their project requirements efficiently.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl mb-4 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Appliance Planning</h3>
                <p className="text-slate-600">Plan and manage all the appliances and electrical components in your project.</p>
              </CardContent>
            </Card>
            <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-0">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl mb-4 flex items-center justify-center">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Customizable Settings</h3>
                <p className="text-slate-600">Customize appliance types, wattage presets, and export formats.</p>
              </CardContent>
            </Card>
          </div>

          {/* Form */}
          <Card className="mt-12 bg-white/70 backdrop-blur-sm shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-slate-900">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  type="text"
                  id="projectName"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange('projectName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  type="text"
                  id="clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="architectName">Architect Name (Optional)</Label>
                <Input
                  type="text"
                  id="architectName"
                  placeholder="Enter architect name"
                  value={formData.architectName}
                  onChange={(e) => handleInputChange('architectName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="designerName">Interior Designer (Optional)</Label>
                <Input
                  type="text"
                  id="designerName"
                  placeholder="Enter designer name"
                  value={formData.designerName}
                  onChange={(e) => handleInputChange('designerName', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="notes">Project Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any project notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                onClick={handleStartPlanning}
                disabled={!isFormValid}
              >
                Start Planning
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Home Automation Planning System. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
// Duplicate export removed

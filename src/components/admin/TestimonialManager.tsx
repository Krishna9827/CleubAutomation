import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { adminService } from '@/supabase/adminService';
import { useToast } from '@/hooks/use-toast';

interface Testimonial {
  id: string;
  clientName: string;
  propertyType: string;
  location: string;
  date: string;
  quote: string;
  projectDetails: string;
  features: string[];
  results: string[];
  videoUrl: string;
}

const TestimonialManager = () => {
  const { toast } = useToast();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Testimonial>>({
    clientName: '',
    propertyType: '',
    location: '',
    date: '',
    quote: '',
    projectDetails: '',
    features: [],
    results: [],
    videoUrl: ''
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const loadTestimonials = async () => {
    try {
      const data = await adminService.getAllTestimonials();
      setTestimonials(data as any);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load testimonials',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof Testimonial, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'features' | 'results', value: string) => {
    const items = value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await adminService.updateTestimonial(editingId, formData as any);
        toast({
          title: 'Success',
          description: 'Testimonial updated successfully'
        });
      } else {
        await adminService.createTestimonial(formData as any);
        toast({
          title: 'Success',
          description: 'Testimonial created successfully'
        });
      }
      await loadTestimonials();
      setEditingId(null);
      setFormData({
        clientName: '',
        propertyType: '',
        location: '',
        date: '',
        quote: '',
        projectDetails: '',
        features: [],
        results: [],
        videoUrl: ''
      });
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to save testimonial',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setFormData({
      ...testimonial,
      features: testimonial.features,
      results: testimonial.results
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteTestimonial(id);
      toast({
        title: 'Success',
        description: 'Testimonial deleted successfully'
      });
      await loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete testimonial',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            {editingId ? 'Edit Testimonial' : 'Add New Testimonial'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Client Name"
              value={formData.clientName}
              onChange={e => handleInputChange('clientName', e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
            <Input
              placeholder="Property Type"
              value={formData.propertyType}
              onChange={e => handleInputChange('propertyType', e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
            <Input
              placeholder="Location"
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
            <Input
              placeholder="Date (e.g., September 2025)"
              value={formData.date}
              onChange={e => handleInputChange('date', e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          <Textarea
            placeholder="Client Quote"
            value={formData.quote}
            onChange={e => handleInputChange('quote', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
          <Textarea
            placeholder="Project Details"
            value={formData.projectDetails}
            onChange={e => handleInputChange('projectDetails', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Features (one per line)</label>
              <Textarea
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                value={formData.features?.join('\n')}
                onChange={e => handleArrayInputChange('features', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                rows={5}
              />
            </div>
            <div>
              <label className="text-sm text-slate-300 mb-2 block">Results (one per line)</label>
              <Textarea
                placeholder="Result 1&#10;Result 2&#10;Result 3"
                value={formData.results?.join('\n')}
                onChange={e => handleArrayInputChange('results', e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                rows={5}
              />
            </div>
          </div>
          <Input
            placeholder="Video URL"
            value={formData.videoUrl}
            onChange={e => handleInputChange('videoUrl', e.target.value)}
            className="bg-white/10 border-white/20 text-white"
          />
          <Button 
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            {editingId ? 'Update Testimonial' : 'Add Testimonial'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Existing Testimonials</h2>
        {testimonials.map(testimonial => (
          <Card key={testimonial.id} className="bg-white/5 border-white/10">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-white">{testimonial.clientName}</h3>
                  <p className="text-sm text-slate-300">
                    {testimonial.propertyType} • {testimonial.location} • {testimonial.date}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(testimonial)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                    className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="text-sm text-slate-300 space-y-2">
                <p className="italic">"{testimonial.quote}"</p>
                <p>{testimonial.projectDetails}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">Features</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {testimonial.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Results</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {testimonial.results.map((result, i) => (
                        <li key={i}>{result}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TestimonialManager;
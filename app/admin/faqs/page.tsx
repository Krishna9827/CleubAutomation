'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, Edit2, GripVertical, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { adminService } from '@/supabase/adminService';
import { useToast } from '@/hooks/use-toast';
import type { FAQ } from '@/types/content';

export default function AdminFaqsPage() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<Partial<FAQ>>({
    question: '',
    answer: '',
    category: 'General',
    is_published: true,
    order_index: 0
  });

  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      const data = await adminService.getAllFaqs();
      setFaqs(data as FAQ[]);
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load FAQs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'General',
      is_published: true,
      order_index: faqs.length
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.question?.trim() || !formData.answer?.trim()) {
      toast({
        title: 'Error',
        description: 'Question and answer are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingId) {
        await adminService.updateFaq(editingId, formData);
        toast({
          title: 'Success',
          description: 'FAQ updated successfully'
        });
      } else {
        await adminService.createFaq({
          ...formData,
          order_index: faqs.length
        });
        toast({
          title: 'Success',
          description: 'FAQ created successfully'
        });
      }
      
      await loadFaqs();
      resetForm();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save FAQ',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (faq: FAQ) => {
    setFormData(faq);
    setEditingId(faq.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) {
      return;
    }

    try {
      await adminService.deleteFaq(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      toast({
        title: 'Success',
        description: 'FAQ deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete FAQ',
        variant: 'destructive'
      });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const newFaqs = [...faqs];
    [newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]];
    setFaqs(newFaqs);
    
    try {
      await adminService.reorderFaqs(newFaqs.map(f => f.id));
    } catch (error) {
      console.error('Error reordering FAQs:', error);
      loadFaqs(); // Reload on error
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === faqs.length - 1) return;
    
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
    setFaqs(newFaqs);
    
    try {
      await adminService.reorderFaqs(newFaqs.map(f => f.id));
    } catch (error) {
      console.error('Error reordering FAQs:', error);
      loadFaqs();
    }
  };

  const togglePublished = async (faq: FAQ) => {
    try {
      await adminService.updateFaq(faq.id, { is_published: !faq.is_published });
      setFaqs(prev => prev.map(f => 
        f.id === faq.id ? { ...f, is_published: !f.is_published } : f
      ));
    } catch (error) {
      console.error('Error toggling FAQ:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ Management</h1>
          <p className="text-slate-300">Manage frequently asked questions.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ Management</h1>
          <p className="text-slate-300">Manage frequently asked questions for your website.</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-amber-500 hover:bg-amber-600 text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          New FAQ
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-white/5 border-white/10 border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Edit FAQ' : 'Add New FAQ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label className="text-white">Question</Label>
                <Input
                  placeholder="Enter the question..."
                  value={formData.question}
                  onChange={e => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Category</Label>
                <Input
                  placeholder="General"
                  value={formData.category || ''}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">Answer</Label>
              <Textarea
                placeholder="Enter the answer..."
                value={formData.answer}
                onChange={e => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                className="bg-white/10 border-white/20 text-white"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_published}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, is_published: checked }))}
                />
                <Label className="text-slate-300">Published</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {editingId ? 'Update' : 'Create'} FAQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ List */}
      {faqs.length === 0 && !showForm ? (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="w-12 h-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No FAQs yet</h3>
            <p className="text-slate-400 mb-4">Get started by creating your first FAQ.</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card
              key={faq.id}
              className={`bg-white/5 border-white/10 transition-all ${
                !faq.is_published ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Reorder Controls */}
                  <div className="flex flex-col gap-1 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="h-6 w-6 p-0 text-slate-500 hover:text-white disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === faqs.length - 1}
                      className="h-6 w-6 p-0 text-slate-500 hover:text-white disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-1">{faq.question}</p>
                        <p className="text-slate-400 text-sm line-clamp-2">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {faq.category && (
                          <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                            {faq.category}
                          </Badge>
                        )}
                        <Badge
                          className={faq.is_published
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                          }
                        >
                          {faq.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(faq)}
                      className="text-slate-400 hover:text-amber-400 hover:bg-amber-500/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(faq.id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {faqs.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <span>{faqs.length} total FAQ{faqs.length !== 1 ? 's' : ''}</span>
          <span>{faqs.filter(f => f.is_published).length} published</span>
          <span>{faqs.filter(f => !f.is_published).length} draft{faqs.filter(f => !f.is_published).length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}

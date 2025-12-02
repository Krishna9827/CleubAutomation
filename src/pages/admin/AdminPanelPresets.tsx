import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, ArrowLeft, Edit2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PANEL_SIZES, PANEL_COMPONENT_TYPES, calculatePanelModulesUsed, isPanelConfigValid, generatePanelName } from '@/constants/panelModules';
import { panelService } from '@/supabase/panelService';
import { supabase } from '@/supabase/config';
import type { PanelPreset, PanelComponentConfig } from '@/types/project';

const AdminPanelPresets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading } = useAuth();

  // Auth check
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/');
      } else if (!isAdmin) {
        toast({
          title: 'Access Denied',
          description: 'You do not have admin access.',
          variant: 'destructive',
        });
        navigate('/');
      }
    }
  }, [user, isAdmin, loading, navigate, toast]);

  // State
  const [presets, setPresets] = useState<PanelPreset[]>([]);
  const [loading2, setLoading2] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    moduleSize: 2 | 4 | 6 | 8 | 12;
    components: PanelComponentConfig[];
    brand: string;
    price: number;
    notes?: string;
  }>({
    name: '',
    moduleSize: 6,
    components: [
      { type: 'on_off', quantity: 2, modulesPerPair: 2, totalModulesUsed: 2 },
    ],
    brand: '',
    price: 0,
    notes: '',
  });

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      setLoading2(true);
      const data = await panelService.getAllPanelPresets();
      setPresets(data);
      console.log('✅ Panel presets loaded:', data.length);
    } catch (error) {
      console.error('❌ Error loading presets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load panel presets',
        variant: 'destructive',
      });
    } finally {
      setLoading2(false);
    }
  };

  const handleAddComponent = () => {
    if (formData.components.length < 5) {
      setFormData(prev => ({
        ...prev,
        components: [
          ...prev.components,
          { type: 'on_off', quantity: 1, modulesPerPair: 2, totalModulesUsed: 2 },
        ],
      }));
    }
  };

  const handleRemoveComponent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      components: prev.components.filter((_, i) => i !== index),
    }));
  };

  const handleComponentChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newComponents = [...prev.components];
      if (field === 'type') {
        newComponents[index] = { ...newComponents[index], type: value };
      } else if (field === 'quantity') {
        const qty = parseInt(value) || 1;
        const totalModules = qty * 2;
        newComponents[index] = { ...newComponents[index], quantity: qty, totalModulesUsed: totalModules };
      }
      return { ...prev, components: newComponents };
    });
  };

  const getTotalModules = () => {
    return formData.components.reduce((sum, comp) => sum + comp.totalModulesUsed, 0);
  };

  const isFormValid = () => {
    return formData.name.trim() && formData.components.length > 0 && getTotalModules() <= formData.moduleSize;
  };

  const handleSave = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields (name, brand, price) and ensure total modules ≤ panel size',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.brand.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a brand name',
        variant: 'destructive',
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid price',
        variant: 'destructive',
      });
      return;
    }

    try {
      const totalModules = getTotalModules();
      
      // Generate preset name in format "6M-4S-1ST-1F"
      const componentAbbreviations: Record<string, string> = {
        'on_off': 'S',
        'socket': 'ST',
        'fan_speed': 'F',
        'scene_controller': 'SC',
        'dimmer': 'D'
      };
      
      const componentStr = formData.components
        .map(c => `${c.quantity}${componentAbbreviations[c.type] || c.type.charAt(0).toUpperCase()}`)
        .join('-');
      
      const presetName = `${formData.moduleSize}M-${componentStr}`;

      console.log('💾 Saving panel preset with inventory link:', presetName);
      
      // Step 1: Create inventory entry with vendor_tags for pricing linkage
      const inventoryData = {
        product_name: presetName,
        category: 'Touch Panels',
        subcategory: formData.brand,
        vendor: formData.brand,
        price_per_unit: formData.price,
        wattage: 0,
        protocol: 'Wireless',
        vendor_tags: [formData.brand], // Tag with brand name for filtering in BOQ
        notes: `Touch panel preset: ${componentStr}`,
      };

      const { data: inventoryItem, error: inventoryError } = await (supabase
        .from('inventory') as any)
        .insert([inventoryData])
        .select();

      if (inventoryError) {
        console.error('❌ Error creating inventory entry:', inventoryError);
        throw new Error(`Failed to create inventory entry: ${inventoryError.message}`);
      }

      const linkedInventoryId = inventoryItem?.[0]?.id;
      console.log('✅ Inventory entry created:', linkedInventoryId);

      // Step 2: Create panel_presets record linked to inventory
      const panelPresetData = {
        name: presetName,
        module_size: formData.moduleSize,
        total_modules_used: totalModules,
        is_full: totalModules === formData.moduleSize,
        components: formData.components,
        brand_vendor: formData.brand,
        price_per_unit: formData.price,
        linked_inventory_id: linkedInventoryId,
        notes: formData.notes || null,
        metadata: { 
          created_via: 'admin_panel',
          vendor_tags: [formData.brand]
        },
      };

      const { data: preset, error: presetError } = await (supabase
        .from('panel_presets') as any)
        .insert([panelPresetData])
        .select();

      if (presetError) {
        console.error('❌ Error saving to panel_presets:', presetError);
        throw new Error(`Failed to create panel preset: ${presetError.message}`);
      }

      const presetId = preset?.[0]?.id;
      console.log('✅ Panel preset created:', presetId);

      // Create local preset object
      const newPreset: PanelPreset = {
        id: presetId || linkedInventoryId || Date.now().toString(),
        name: presetName,
        moduleSize: formData.moduleSize,
        totalModulesUsed: totalModules,
        isFull: totalModules === formData.moduleSize,
        components: formData.components,
        notes: formData.notes,
        linkedInventoryId,
      };

      if (editingId) {
        setPresets(prev => prev.map(p => p.id === editingId ? newPreset : p));
        setEditingId(null);
        console.log('✅ Panel preset updated:', presetName);
        toast({
          title: 'Success',
          description: `Panel preset "${presetName}" updated`,
        });
      } else {
        setPresets(prev => [...prev, newPreset]);
        console.log('✅ Panel preset created:', presetName);
        toast({
          title: 'Success',
          description: `Panel preset "${presetName}" created`,
        });
      }

      setShowForm(false);
      resetForm();
      // Reload presets
      await loadPresets();
    } catch (error: any) {
      console.error('❌ Error saving preset:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save panel preset',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id: string) => {
    setPresets(prev => prev.filter(p => p.id !== id));
    toast({
      title: 'Deleted',
      description: 'Panel preset removed',
    });
  };

  const handleEdit = (preset: PanelPreset) => {
    setFormData({
      name: preset.name,
      moduleSize: preset.moduleSize,
      components: preset.components,
      brand: '',
      price: 0,
      notes: preset.notes,
    });
    setEditingId(preset.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      moduleSize: 6,
      components: [{ type: 'on_off', quantity: 2, modulesPerPair: 2, totalModulesUsed: 2 }],
      brand: '',
      price: 0,
      notes: '',
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate('/admin')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Panel Presets</h1>
                  <p className="text-sm text-slate-400">Manage touch panel configurations</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Preset
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {loading2 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
              <p className="text-slate-300 mt-4">Loading presets...</p>
            </div>
          ) : presets.length === 0 ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="pt-12 text-center">
                <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                <p className="text-slate-300 mb-6">No panel presets configured yet.</p>
                <Button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="bg-gradient-to-r from-teal-500 to-teal-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Preset
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <Card key={preset.id} className="border-white/10 bg-white/5 hover:bg-white/10 transition">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white">{preset.name}</CardTitle>
                        <p className="text-sm text-slate-400 mt-1">{preset.moduleSize}M Panel</p>
                      </div>
                      <Badge
                        variant={preset.isFull ? 'default' : 'outline'}
                        className={`ml-2 ${preset.isFull ? 'bg-orange-500' : 'border-teal-500 text-teal-300'}`}
                      >
                        {preset.totalModulesUsed}/{preset.moduleSize}M
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Components Summary */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-slate-300">Components:</p>
                      <div className="space-y-1">
                        {preset.components.map((comp, idx) => (
                          <div key={idx} className="text-xs text-slate-400 flex justify-between">
                            <span>{comp.type.replace('_', ' ')}</span>
                            <span className="text-teal-300">{comp.quantity}x • {comp.totalModulesUsed}M</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {preset.notes && (
                      <div className="text-xs text-slate-500 bg-white/5 p-2 rounded">
                        {preset.notes}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(preset)}
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(preset.id)}
                        className="flex-1 border-red-500/20 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* Create/Edit Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-2xl bg-slate-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingId ? 'Edit Panel Preset' : 'Create New Panel Preset'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label className="text-slate-300">Preset Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Living Room Panel"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              {/* Module Size */}
              <div className="space-y-2">
                <Label className="text-slate-300">Panel Size (Modules)</Label>
                <Select value={String(formData.moduleSize)} onValueChange={(val) => setFormData(prev => ({ ...prev, moduleSize: parseInt(val) as any }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    {PANEL_SIZES.map(size => (
                      <SelectItem key={size} value={String(size)}>
                        {size}M Panel
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  Total Modules Used: {getTotalModules()} / {formData.moduleSize}M
                  {getTotalModules() > formData.moduleSize && (
                    <span className="text-red-400 ml-2">⚠️ Exceeds panel size</span>
                  )}
                </p>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label className="text-slate-300">Brand/Vendor</Label>
                <Input
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="e.g., Schneider Electric, Legrand, Siemens"
                  className="bg-white/5 border-white/10 text-white placeholder-slate-500"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label className="text-slate-300">Price per Unit (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  placeholder="e.g., 5000"
                  className="bg-white/5 border-white/10 text-white placeholder-slate-500"
                />
              </div>

              {/* Components */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300">Components</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddComponent}
                    disabled={formData.components.length >= 5}
                    className="border-white/20 text-teal-300 hover:bg-white/5"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Component
                  </Button>
                </div>

                <div className="space-y-3 bg-white/5 p-4 rounded-lg">
                  {formData.components.map((comp, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-3 items-end">
                      <div>
                        <Label className="text-xs text-slate-400">Type</Label>
                        <Select value={comp.type} onValueChange={(val) => handleComponentChange(idx, 'type', val)}>
                          <SelectTrigger className="bg-white/10 border-white/20 text-white h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10">
                            {Object.keys(PANEL_COMPONENT_TYPES).map(key => (
                              <SelectItem key={key} value={key}>
                                {PANEL_COMPONENT_TYPES[key as keyof typeof PANEL_COMPONENT_TYPES].name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-slate-400">Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={comp.quantity}
                          onChange={(e) => handleComponentChange(idx, 'quantity', e.target.value)}
                          className="bg-white/10 border-white/20 text-white h-9"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-sm text-slate-300 flex-1">
                          {comp.totalModulesUsed}M
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveComponent(idx)}
                          disabled={formData.components.length === 1}
                          className="h-9 border-red-500/20 text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-slate-300">Notes (Optional)</Label>
                <Input
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g., Premium variant, suitable for master bedroom"
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!isFormValid()}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Preset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPanelPresets;

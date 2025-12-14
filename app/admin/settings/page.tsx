'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/supabase/adminService';

interface DefaultSettings {
  applianceCategories: string[];
  wattagePresets: number[];
  exportFormats: string[];
  sheetsWebhookUrl?: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin, loading } = useAuth();
  const [saving, setSaving] = useState(false);

  // Check if user is admin, if not redirect to home
  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('⚠️ User not authenticated, redirecting to login');
        router.push('/');
      } else if (!isAdmin) {
        console.log('⚠️ User is not an admin, redirecting to home');
        toast({
          title: 'Access Denied',
          description: 'You do not have admin access.',
          variant: 'destructive',
        });
        router.push('/');
      }
    }
  }, [user, isAdmin, loading, router, toast]);

  const [settings, setSettings] = useState<DefaultSettings>({
    applianceCategories: ['Lights', 'Fans', 'HVAC', 'Smart Devices', 'Curtain & Blinds', 'Security'],
    wattagePresets: [3, 6, 9, 12, 15, 18, 24, 36, 50, 100],
    exportFormats: ['PDF', 'Excel', 'Word']
  });
  
  const [newCategory, setNewCategory] = useState('');
  const [newWattage, setNewWattage] = useState('');

  // Load admin settings from Supabase
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const loadedSettings = await adminService.getSettings('general');
        if (loadedSettings && Object.keys(loadedSettings).length > 0) {
          console.log('✅ Loaded admin settings from Supabase');
          setSettings({ ...settings, ...loadedSettings });
        } else {
          console.log('🔄 No admin settings found, using defaults');
          // Save default settings to Supabase
          await adminService.updateSettings('general', settings);
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    };

    loadAdminSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = async () => {
    try {
      setSaving(true);
      // Save to Supabase
      await adminService.updateSettings('general', {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Admin settings saved to Supabase');
      
      // Also save to localStorage as backup
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings Saved",
        description: "Admin settings have been updated successfully."
      });
    } catch (error) {
      console.error('Error saving admin settings:', error);
      
      // Fallback to localStorage only
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings Saved Locally",
        description: "Settings saved to browser storage (Supabase error).",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (newCategory.trim() && !settings.applianceCategories.includes(newCategory.trim())) {
      setSettings(prev => ({
        ...prev,
        applianceCategories: [...prev.applianceCategories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      applianceCategories: prev.applianceCategories.filter(c => c !== category)
    }));
  };

  const addWattage = () => {
    const wattage = parseInt(newWattage);
    if (!isNaN(wattage) && wattage > 0 && !settings.wattagePresets.includes(wattage)) {
      setSettings(prev => ({
        ...prev,
        wattagePresets: [...prev.wattagePresets, wattage].sort((a, b) => a - b)
      }));
      setNewWattage('');
    }
  };

  const removeWattage = (wattage: number) => {
    setSettings(prev => ({
      ...prev,
      wattagePresets: prev.wattagePresets.filter(w => w !== wattage)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-teal-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-sm text-slate-400">Configure system defaults</p>
          </div>
        </div>
        <Button
          onClick={saveSettings}
          disabled={saving}
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-8">
        {/* Webhook / Sheets Integration */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Integrations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-300">Google Sheets / Webhook URL</Label>
              <Input
                placeholder="https://script.google.com/..."
                value={settings.sheetsWebhookUrl || ''}
                onChange={(e) => {
                  const url = e.target.value;
                  setSettings(prev => ({ ...prev, sheetsWebhookUrl: url }));
                }}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
              <div className="text-xs text-slate-400 mt-1">Optional: Data will POST here on export/send.</div>
            </div>
          </CardContent>
        </Card>

        {/* Appliance Categories */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Default Appliance Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings.applianceCategories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 group cursor-pointer transition-colors"
                  onClick={() => removeCategory(category)}
                >
                  {category}
                  <Trash2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 text-red-400" />
                </Badge>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Enter new category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
              <Button onClick={addCategory} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wattage Presets */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Default Wattage Presets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings.wattagePresets.map((wattage) => (
                <Badge
                  key={wattage}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-red-500/20 group cursor-pointer transition-colors"
                  onClick={() => removeWattage(wattage)}
                >
                  {wattage}W
                  <Trash2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 text-red-400" />
                </Badge>
              ))}
            </div>
            
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="Enter wattage"
                value={newWattage}
                onChange={(e) => setNewWattage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addWattage()}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
              <Button onClick={addWattage} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Formats */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-lg text-white">Export Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {settings.exportFormats.map((format) => (
                <Badge key={format} variant="outline" className="bg-white/10 border-white/20 text-white">
                  {format}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

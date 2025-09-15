
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  touchPanelTypes,
  touchPanelModules,
  touchPanelChannelOptions
} from './inventory/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

import type { TouchPanelChannelConfig } from './inventory/types';
interface Appliance {
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  wattage?: number;
  specifications: Record<string, any>;
  // Touch panel specific fields (optional)
  panelType?: string;
  moduleChannels?: number;
  channelConfig?: TouchPanelChannelConfig[];
}

interface AddApplianceDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (appliance: Appliance) => void;
  roomName: string;
}

const applianceCategories = {
  'Lights': {
    subcategories: ['ON/OFF', 'Dimmable', 'Tunable White', 'RGB', 'RGBW', 'Strip Lights'],
    commonWattages: [3, 6, 9, 12, 15, 18, 24]
  },
  'Fans': {
    subcategories: ['Ceiling Fan', 'Exhaust Fan', 'Table Fan', 'Wall Fan'],
    commonWattages: [25, 35, 50, 75, 100]
  },
  'HVAC': {
    subcategories: ['Split AC', 'Window AC', 'Central AC', 'Heat Pump'],
    commonWattages: [1500, 2000, 2500, 3000, 3500]
  },
  'Smart Devices': {
    subcategories: ['Motion Sensor', 'Door Sensor', 'Temperature Sensor', 'Smart Switch', 'Smart Plug'],
    commonWattages: [2, 5, 10, 15]
  },
  'Curtain & Blinds': {
    subcategories: ['Track', 'Motor', 'Roller Blind', 'Venetian Blind'],
    commonWattages: [15, 25, 35, 50]
  },
  'Security': {
    subcategories: ['Camera', 'DVR/NVR', 'Access Control', 'Intercom'],
    commonWattages: [5, 10, 15, 25, 50]
  },
  'Touch Panels': {
    subcategories: ['2 Channel', '4 Channel', '6 Channel', '8 Channel', '12 Channel', 'Tactile Panel', 'Touch Screen', 'Dialer Knob', 'IR Blaster'],
    commonWattages: [5, 10, 15, 20]
  },
  'Retrofit Relays': {
    subcategories: ['1 Channel 10A', '2 Channel 10A', '4 Channel 10A', '1 Channel 16A', '2 Channel 16A', '1 Channel 40A', 'Dimmer Module'],
    commonWattages: [5, 10, 15]
  },
  'Panel Finishes': {
    subcategories: ['Glass', 'Acrylic', 'Plastic'],
    commonWattages: []
  },
  'Others': {
    subcategories: ['Custom Device'],
    commonWattages: []
  }
};


const AddApplianceDialog = ({ open, onClose, onAdd, roomName }: AddApplianceDialogProps) => {
  const [appliance, setAppliance] = useState<Appliance>({
    name: '',
    category: '',
    subcategory: '',
    quantity: 1,
    wattage: undefined,
    specifications: {}
  });
  const [customWattage, setCustomWattage] = useState('');
  const [notes, setNotes] = useState('');
  // Touch panel specific state
  const [panelType, setPanelType] = useState<string>('');
  const [moduleChannels, setModuleChannels] = useState<number | null>(null);
  const [channelConfig, setChannelConfig] = useState<{ label: string; details: string }[]>([]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (appliance.name.trim() && appliance.category) {
      let finalAppliance = {
        ...appliance,
        wattage: customWattage ? parseInt(customWattage) : appliance.wattage,
        specifications: {
          ...appliance.specifications,
          notes: notes.trim() || undefined
        }
      };
      // If Touch Panel, add extra config
      if (appliance.category === 'Touch Panels') {
        finalAppliance = {
          ...finalAppliance,
          panelType: panelType || undefined,
          moduleChannels: moduleChannels || undefined,
          channelConfig: channelConfig.map((c, idx) => ({
            channelNumber: idx + 1,
            label: c.label,
            details: c.details
          }))
        };
      }
      onAdd(finalAppliance);
      resetForm();
    }
  };


  const resetForm = () => {
    setAppliance({
      name: '',
      category: '',
      subcategory: '',
      quantity: 1,
      wattage: undefined,
      specifications: {}
    });
    setCustomWattage('');
    setNotes('');
    setPanelType('');
    setModuleChannels(null);
    setChannelConfig([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };


  const handleCategoryChange = (category: string) => {
    setAppliance(prev => ({
      ...prev,
      category,
      subcategory: '',
      wattage: undefined
    }));
    setCustomWattage('');
    // Reset touch panel config if switching away
    if (category !== 'Touch Panels') {
      setPanelType('');
      setModuleChannels(null);
      setChannelConfig([]);
    }
  };


  const handleSubcategoryChange = (subcategory: string) => {
    setAppliance(prev => ({
      ...prev,
      subcategory,
      name: prev.name || `${subcategory} - ${roomName}`
    }));
    // If subcategory is a channel module, auto-set moduleChannels
    if (appliance.category === 'Touch Panels') {
      const match = subcategory.match(/(\d+) Channel/);
      if (match) {
        const num = parseInt(match[1]);
        setModuleChannels(num);
        setChannelConfig(Array(num).fill({ label: '', details: '' }));
      } else {
        setModuleChannels(null);
        setChannelConfig([]);
      }
    }
  };

  const currentCategory = applianceCategories[appliance.category as keyof typeof applianceCategories];


  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-white border-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Add Appliance to {roomName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-800">Category & Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Category</Label>
                  <Select value={appliance.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="border-slate-300 focus:border-teal-500">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {Object.keys(applianceCategories).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {appliance.category && currentCategory && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Type</Label>
                    <Select value={appliance.subcategory} onValueChange={handleSubcategoryChange}>
                      <SelectTrigger className="border-slate-300 focus:border-teal-500">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {currentCategory.subcategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {/* Touch Panel Extra Config */}
              {appliance.category === 'Touch Panels' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Panel Type</Label>
                    <Select value={panelType} onValueChange={setPanelType}>
                      <SelectTrigger className="border-slate-300 focus:border-teal-500">
                        <SelectValue placeholder="Select panel type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {touchPanelTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Module (Channels)</Label>
                    <Select
                      value={moduleChannels ? String(moduleChannels) : ''}
                      onValueChange={(val) => {
                        const num = parseInt(val);
                        setModuleChannels(num);
                        setChannelConfig(Array(num).fill({ label: '', details: '' }));
                      }}
                    >
                      <SelectTrigger className="border-slate-300 focus:border-teal-500">
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {touchPanelModules.map((mod) => (
                          <SelectItem key={mod} value={String(mod)}>{mod} Channel</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {/* Per-Channel Config */}
              {appliance.category === 'Touch Panels' && moduleChannels && (
                <div className="mt-4">
                  <Label className="text-slate-700 font-medium mb-2 block">Channel Configuration</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: moduleChannels }).map((_, idx) => (
                      <div key={idx} className="flex flex-col gap-2 border p-2 rounded-md bg-slate-50">
                        <span className="font-semibold text-slate-700">Channel {idx + 1}</span>
                        <Select
                          value={channelConfig[idx]?.label || ''}
                          onValueChange={(val) => {
                            setChannelConfig((prev) => {
                              const arr = [...prev];
                              arr[idx] = { ...arr[idx], label: val };
                              return arr;
                            });
                          }}
                        >
                          <SelectTrigger className="border-slate-300 focus:border-teal-500">
                            <SelectValue placeholder="Select device" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-200">
                            {touchPanelChannelOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Details (e.g., 12W LED, TV Brand)"
                          value={channelConfig[idx]?.details || ''}
                          onChange={(e) => {
                            setChannelConfig((prev) => {
                              const arr = [...prev];
                              arr[idx] = { ...arr[idx], details: e.target.value };
                              return arr;
                            });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Appliance Details */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-800">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Appliance Name</Label>
                <Input
                  placeholder="e.g., LED Downlight, Ceiling Fan"
                  value={appliance.name}
                  onChange={(e) => setAppliance(prev => ({ ...prev, name: e.target.value }))}
                  className="border-slate-300 focus:border-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={appliance.quantity}
                    onChange={(e) => setAppliance(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="border-slate-300 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Wattage (Optional)</Label>
                  <div className="space-y-2">
                    {currentCategory && currentCategory.commonWattages.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {currentCategory.commonWattages.map((wattage) => (
                          <Badge
                            key={wattage}
                            variant={appliance.wattage === wattage ? "default" : "outline"}
                            className={`cursor-pointer ${
                              appliance.wattage === wattage 
                                ? 'bg-teal-500 hover:bg-teal-600' 
                                : 'hover:bg-slate-100'
                            }`}
                            onClick={() => {
                              setAppliance(prev => ({ ...prev, wattage }));
                              setCustomWattage('');
                            }}
                          >
                            {wattage}W
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Input
                      placeholder="Custom wattage"
                      value={customWattage}
                      onChange={(e) => {
                        setCustomWattage(e.target.value);
                        setAppliance(prev => ({ ...prev, wattage: undefined }));
                      }}
                      className="border-slate-300 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Additional Notes</Label>
                <Textarea
                  placeholder="Specifications, brand preferences, special requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-slate-300 focus:border-teal-500"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!appliance.name.trim() || !appliance.category || (appliance.category === 'Touch Panels' && (!panelType || !moduleChannels || channelConfig.some(c => !c.label)))}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              Add Appliance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddApplianceDialog;

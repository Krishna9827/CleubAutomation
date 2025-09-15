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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TouchPanel {
  id: string;
  name: string;
  type: string;
  channels?: number;
  quantity: number;
  finish?: string;
}

interface TouchPanelDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (touchPanel: TouchPanel) => void;
  roomName: string;
}

const touchPanelTypes = {
  'Touch Panel': {
    variants: ['2 Channel', '4 Channel', '6 Channel', '8 Channel', '12 Channel'],
    channels: [2, 4, 6, 8, 12]
  },
  'Tactile Panel': {
    variants: ['2 Button', '4 Button', '6 Button', '8 Button'],
    channels: [2, 4, 6, 8]
  },
  'Touch Screen': {
    variants: ['4 inch', '7 inch', '10 inch'],
    channels: [0]
  },
  'Dialer Knob': {
    variants: ['Single Knob', 'Dual Knob'],
    channels: [1, 2]
  },
  'IR Blaster': {
    variants: ['Standard'],
    channels: [0]
  }
};

const finishOptions = ['Glass', 'Acrylic', 'Plastic'];

const TouchPanelDialog = ({ open, onClose, onAdd, roomName }: TouchPanelDialogProps) => {
  const [touchPanel, setTouchPanel] = useState<TouchPanel>({
    id: '',
    name: '',
    type: '',
    channels: 0,
    quantity: 1,
    finish: 'Glass'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (touchPanel.name.trim() && touchPanel.type) {
      const finalTouchPanel = {
        ...touchPanel,
        id: Date.now().toString(),
        name: touchPanel.name || `${touchPanel.type} - ${roomName}`
      };
      onAdd(finalTouchPanel);
      resetForm();
    }
  };

  const resetForm = () => {
    setTouchPanel({
      id: '',
      name: '',
      type: '',
      channels: 0,
      quantity: 1,
      finish: 'Glass'
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTypeChange = (type: string) => {
    setTouchPanel(prev => ({
      ...prev,
      type,
      name: `${type} - ${roomName}`,
      channels: 0
    }));
  };

  const handleVariantChange = (variant: string) => {
    const currentType = touchPanelTypes[touchPanel.type as keyof typeof touchPanelTypes];
    const variantIndex = currentType?.variants.indexOf(variant);
    const channels = variantIndex !== -1 ? currentType?.channels[variantIndex] || 0 : 0;
    
    setTouchPanel(prev => ({
      ...prev,
      name: `${variant} ${touchPanel.type} - ${roomName}`,
      channels
    }));
  };

  const currentType = touchPanelTypes[touchPanel.type as keyof typeof touchPanelTypes];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-white border-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Add Touch Panel to {roomName}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Panel Type Selection */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-800">Panel Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Panel Type</Label>
                  <Select value={touchPanel.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="border-slate-300 focus:border-teal-500">
                      <SelectValue placeholder="Select panel type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {Object.keys(touchPanelTypes).map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {touchPanel.type && currentType && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Variant</Label>
                    <Select onValueChange={handleVariantChange}>
                      <SelectTrigger className="border-slate-300 focus:border-teal-500">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200">
                        {currentType.variants.map((variant) => (
                          <SelectItem key={variant} value={variant}>
                            {variant}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {touchPanel.type && ['Touch Panel', 'Tactile Panel'].includes(touchPanel.type) && (
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Panel Finish</Label>
                  <Select value={touchPanel.finish} onValueChange={(value) => setTouchPanel(prev => ({ ...prev, finish: value }))}>
                    <SelectTrigger className="border-slate-300 focus:border-teal-500">
                      <SelectValue placeholder="Select finish" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {finishOptions.map((finish) => (
                        <SelectItem key={finish} value={finish}>
                          {finish}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel Details */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-800">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Panel Name</Label>
                <Input
                  placeholder="e.g., Main Touch Panel, Bedside Control"
                  value={touchPanel.name}
                  onChange={(e) => setTouchPanel(prev => ({ ...prev, name: e.target.value }))}
                  className="border-slate-300 focus:border-teal-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-medium">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={touchPanel.quantity}
                    onChange={(e) => setTouchPanel(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    className="border-slate-300 focus:border-teal-500"
                  />
                </div>
                
                {touchPanel.channels > 0 && (
                  <div className="space-y-2">
                    <Label className="text-slate-700 font-medium">Available Channels</Label>
                    <div className="flex items-center">
                      <Badge className="bg-teal-100 text-teal-800">
                        {touchPanel.channels} Channels
                      </Badge>
                    </div>
                  </div>
                )}
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
              disabled={!touchPanel.name.trim() || !touchPanel.type}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              Add Touch Panel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TouchPanelDialog;
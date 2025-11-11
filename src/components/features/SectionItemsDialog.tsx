import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export interface SectionItem {
  category: string;
  customCategory?: string;
  type?: string;
  customType?: string;
  quantity: number;
  voltage?: string;
  customVoltage?: string;
  module?: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (items: SectionItem[]) => void;
  sectionName: string;
  initialItems?: SectionItem[];
}

const defaultItem: SectionItem = { category: 'Lights', type: '', quantity: 1, voltage: '', module: '', notes: '' };

const CATEGORY_MAP: Record<string, { types: string[]; voltages: string[] }> = {
  Lights: {
    types: ['ON/OFF', 'Dimmable', 'Tunable White', 'RGB', 'RGBW', 'Strip', 'COB', 'Other'],
    voltages: ['230V AC', '24V DC', '12V DC', 'Custom'],
  },
  Fans: {
    types: ['Ceiling', 'Exhaust', 'Table', 'Wall', 'BLDC', 'Other'],
    voltages: ['230V AC', 'Custom'],
  },
  'AC/TV': {
    types: ['TV', 'AC', 'Set-top', 'AVR', 'Other'],
    voltages: ['230V AC', '12V DC', 'PoE', 'Custom'],
  },
  HVAC: {
    types: ['Split AC', 'Window AC', 'Central AC', 'VRV/VRF', 'Other'],
    voltages: ['230V AC', '415V 3-Phase', 'Custom'],
  },
  'Smart Devices': {
    types: ['Smart Plug', 'Smart Switch', 'Smart Socket', 'Temperature Sensor', 'Door Sensor', 'Motion Sensor', 'Light Sensor', 'Other'],
    voltages: ['230V AC', '24V DC', 'Battery', 'Custom'],
  },
  'Curtains & Blinds': {
    types: ['Track', 'Motor', 'Roller Blind', 'Venetian Blind', 'Other'],
    voltages: ['230V AC', '24V DC', 'Custom'],
  },
  Security: {
    types: ['Camera', 'DVR/NVR', 'Access Control', 'Intercom', 'Other'],
    voltages: ['12V DC', '24V DC', 'PoE', '230V AC', 'Custom'],
  },
  Other: {
    types: ['Other'],
    voltages: ['Custom'],
  }
};

const SectionItemsDialog = ({ open, onClose, onSave, sectionName, initialItems }: Props) => {
  const [items, setItems] = useState<SectionItem[]>([{ ...defaultItem }]);

  useEffect(() => {
    if (open) {
      setItems(initialItems && initialItems.length > 0 ? initialItems : [{ ...defaultItem }]);
    }
  }, [open, initialItems]);

  const updateItem = (idx: number, field: keyof SectionItem, value: any) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const addRow = () => setItems(prev => [...prev, { ...defaultItem }]);
  const removeRow = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const handleSave = () => {
    onSave(items);
    onClose();
    setItems([{ ...defaultItem }]);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-3xl bg-black/80 text-white border-white/10 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Configure Items for {sectionName}</DialogTitle>
          <DialogDescription className="text-slate-400">Add or modify appliances, switches, and devices for this section</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {items.map((item, idx) => {
            const schema = CATEGORY_MAP[item.category] || CATEGORY_MAP['Other'];
            return (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-7 gap-3 border border-white/10 p-3 rounded-lg bg-white/5">
              <div>
                <Label className="text-slate-300">Category</Label>
                <Select value={item.category} onValueChange={(v) => { updateItem(idx, 'category', v); updateItem(idx, 'type', ''); updateItem(idx, 'voltage', ''); }}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(CATEGORY_MAP).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Type</Label>
                <Select value={item.type || ''} onValueChange={(v) => updateItem(idx, 'type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {schema.types.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {item.type === 'Other' && (
                  <Input className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-slate-400" placeholder="Enter custom type" value={item.customType || ''} onChange={(e) => updateItem(idx, 'customType', e.target.value)} />
                )}
              </div>
              <div>
                <Label className="text-slate-300">Qty</Label>
                <Input type="number" min="1" className="bg-white/10 border-white/20 text-white" value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <Label className="text-slate-300">Module</Label>
                <Select value={item.module || ''} onValueChange={(v) => updateItem(idx, 'module', v)}>
                  <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Module</SelectItem>
                    <SelectItem value="4">4 Module</SelectItem>
                    <SelectItem value="6">6 Module</SelectItem>
                    <SelectItem value="8">8 Module</SelectItem>
                    <SelectItem value="10">10 Module</SelectItem>
                    <SelectItem value="12">12 Module</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Voltage</Label>
                <Select value={item.voltage || ''} onValueChange={(v) => updateItem(idx, 'voltage', v)}>
                  <SelectTrigger><SelectValue placeholder="Select voltage" /></SelectTrigger>
                  <SelectContent>
                    {schema.voltages.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {item.voltage === 'Custom' && (
                  <Input className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-slate-400" placeholder="Enter custom voltage (e.g., 48V DC)" value={item.customVoltage || ''} onChange={(e) => updateItem(idx, 'customVoltage', e.target.value)} />
                )}
              </div>
              <div className="md:col-span-2">
                <Label className="text-slate-300">Notes</Label>
                <Textarea className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" value={item.notes || ''} onChange={(e) => updateItem(idx, 'notes', e.target.value)} placeholder="Any details" />
              </div>
              <div className="md:col-span-7 flex justify-end">
                {items.length > 1 && (
                  <Button variant="outline" onClick={() => removeRow(idx)} className="text-red-400 border-red-400/30 hover:bg-red-500/10">Remove</Button>
                )}
              </div>
            </div>
          )})}
          <div className="flex justify-between">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={addRow}>Add Item</Button>
            <div className="flex gap-2">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave} className="bg-white/10 text-white hover:bg-white/20">Save</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SectionItemsDialog;



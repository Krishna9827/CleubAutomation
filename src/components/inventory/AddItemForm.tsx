
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { categories } from './constants';
const subcategoryOptions = [
  'Wired',
  'Wireless',
  'Dali',
  'Actuator',
  'Smart',
  'With Driver',
  'Without Driver',
];
import type { NewItemForm } from './types';

interface AddItemFormProps {
  newItem: NewItemForm;
  setNewItem: (item: NewItemForm) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const AddItemForm = ({ newItem, setNewItem, onSave, onCancel }: AddItemFormProps) => {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg text-slate-800">Add New Price Item</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(newItem.category === 'Other' || newItem.category === 'Others') && (
            <div>
              <Label htmlFor="customName">Custom Name</Label>
              <Input
                id="customName"
                value={newItem.subcategory}
                onChange={(e) => setNewItem({ ...newItem, subcategory: e.target.value })}
                placeholder="Enter custom item name"
              />
            </div>
          )}
          <div>
            <Label htmlFor="subcategory">Type/Variant</Label>
            <div className="flex gap-2">
              <div className="w-1/2">
                <Select
                  value={subcategoryOptions.includes(newItem.subcategory) ? newItem.subcategory : ''}
                  onValueChange={(value) => setNewItem({ ...newItem, subcategory: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategoryOptions.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/2">
                <Input
                  id="subcategory"
                  value={newItem.subcategory && !subcategoryOptions.includes(newItem.subcategory) ? newItem.subcategory : ''}
                  onChange={(e) => setNewItem({ ...newItem, subcategory: e.target.value })}
                  placeholder="Custom subcategory"
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="wattage">Wattage</Label>
            <Input
              id="wattage"
              type="number"
              value={newItem.wattage}
              onChange={(e) => setNewItem({...newItem, wattage: e.target.value})}
              placeholder="e.g., 12"
            />
          </div>
          <div>
            <Label htmlFor="price">Price per Unit *</Label>
            <Input
              id="price"
              type="number"
              value={newItem.pricePerUnit}
              onChange={(e) => setNewItem({...newItem, pricePerUnit: e.target.value})}
              placeholder="e.g., 250"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={newItem.notes}
              onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
              placeholder="Optional notes"
            />
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <Button onClick={onSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={onCancel} size="sm">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

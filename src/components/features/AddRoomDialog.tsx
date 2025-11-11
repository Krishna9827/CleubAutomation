
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
import { Separator } from '@/components/ui/separator';
import { Home, Zap } from 'lucide-react';

interface AddRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, type: string) => void;
  onAddTemplate: (template: RoomTemplate[]) => void;
}

interface RoomTemplate {
  name: string;
  type: string;
}

const roomTypes = [
  'Living Room',
  'Bedroom',
  'Master Bedroom',
  'Guest Bedroom',
  'Kitchen',
  'Dining Room',
  'Bathroom',
  'Master Bathroom',
  'Home Office',
  'Study Room',
  'Balcony',
  'Terrace',
  'Garden',
  'Garage',
  'Basement',
  'Attic',
  'Laundry Room',
  'Storage Room',
  'Hallway',
  'Stairway',
  'Utility Room',
  'Other'
];

const apartmentTemplates = {
  '1BHK': [
    { name: 'Living Room', type: 'Living Room' },
    { name: 'Kitchen', type: 'Kitchen' },
    { name: 'Bedroom 1', type: 'Bedroom' },
    { name: 'Bathroom', type: 'Bathroom' }
  ],
  '2BHK': [
    { name: 'Living Room', type: 'Living Room' },
    { name: 'Kitchen', type: 'Kitchen' },
    { name: 'Bedroom 1', type: 'Master Bedroom' },
    { name: 'Bedroom 2', type: 'Bedroom' },
    { name: 'Bathroom 1', type: 'Master Bathroom' },
    { name: 'Bathroom 2', type: 'Bathroom' }
  ],
  '3BHK': [
    { name: 'Living Room', type: 'Living Room' },
    { name: 'Kitchen', type: 'Kitchen' },
    { name: 'Bedroom 1', type: 'Master Bedroom' },
    { name: 'Bedroom 2', type: 'Bedroom' },
    { name: 'Bedroom 3', type: 'Bedroom' },
    { name: 'Bathroom 1', type: 'Master Bathroom' },
    { name: 'Bathroom 2', type: 'Bathroom' },
    { name: 'Bathroom 3', type: 'Bathroom' }
  ],
  '4BHK': [
    { name: 'Living Room', type: 'Living Room' },
    { name: 'Kitchen', type: 'Kitchen' },
    { name: 'Bedroom 1', type: 'Master Bedroom' },
    { name: 'Bedroom 2', type: 'Bedroom' },
    { name: 'Bedroom 3', type: 'Bedroom' },
    { name: 'Bedroom 4', type: 'Guest Bedroom' },
    { name: 'Bathroom 1', type: 'Master Bathroom' },
    { name: 'Bathroom 2', type: 'Bathroom' },
    { name: 'Bathroom 3', type: 'Bathroom' },
    { name: 'Bathroom 4', type: 'Bathroom' },
    { name: 'Balcony', type: 'Balcony' },
    { name: 'Utility Room', type: 'Utility Room' }
  ],
  '5BHK': [
    { name: 'Living Room', type: 'Living Room' },
    { name: 'Kitchen', type: 'Kitchen' },
    { name: 'Bedroom 1', type: 'Master Bedroom' },
    { name: 'Bedroom 2', type: 'Bedroom' },
    { name: 'Bedroom 3', type: 'Bedroom' },
    { name: 'Bedroom 4', type: 'Guest Bedroom' },
    { name: 'Bedroom 5', type: 'Bedroom' },
    { name: 'Bathroom 1', type: 'Master Bathroom' },
    { name: 'Bathroom 2', type: 'Bathroom' },
    { name: 'Bathroom 3', type: 'Bathroom' },
    { name: 'Bathroom 4', type: 'Bathroom' },
    { name: 'Bathroom 5', type: 'Bathroom' },
    { name: 'Balcony', type: 'Balcony' },
    { name: 'Utility Room', type: 'Utility Room' },
    { name: 'Study Room', type: 'Study Room' }
  ]
};

const AddRoomDialog = ({ open, onClose, onAdd, onAddTemplate }: AddRoomDialogProps) => {
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName.trim() && roomType) {
      onAdd(roomName.trim(), roomType);
      setRoomName('');
      setRoomType('');
    }
  };

  const handleClose = () => {
    setRoomName('');
    setRoomType('');
    onClose();
  };

  const handleTypeSelect = (type: string) => {
    setRoomType(type);
    if (!roomName.trim()) {
      setRoomName(type);
    }
  };

  const handleTemplateSelect = (templateKey: keyof typeof apartmentTemplates) => {
    const template = apartmentTemplates[templateKey];
    onAddTemplate(template);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Add Rooms to Your Project
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Quick Templates Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-teal-600" />
              <h3 className="text-lg font-medium text-slate-900">Quick Templates</h3>
            </div>
            <p className="text-sm text-slate-600">
              Get started quickly with common apartment configurations
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(apartmentTemplates).map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  onClick={() => handleTemplateSelect(template as keyof typeof apartmentTemplates)}
                  className="h-auto p-4 flex flex-col items-center space-y-2 border-slate-300 hover:border-teal-500 hover:bg-teal-50"
                >
                  <Home className="w-6 h-6 text-teal-600" />
                  <span className="font-medium">{template}</span>
                  <span className="text-xs text-slate-500">
                    {apartmentTemplates[template as keyof typeof apartmentTemplates].length} rooms
                  </span>
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Manual Room Addition Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-900">Add Individual Room</h3>
            <p className="text-sm text-slate-600">
              Add rooms one by one for custom configurations
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="roomType" className="text-slate-700 font-medium">
                  Room Type
                </Label>
                <Select value={roomType} onValueChange={handleTypeSelect}>
                  <SelectTrigger className="border-slate-300 focus:border-teal-500 focus:ring-teal-500">
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 max-h-60">
                    {roomTypes.map((type) => (
                      <SelectItem key={type} value={type} className="hover:bg-slate-50">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="roomName" className="text-slate-700 font-medium">
                  Room Name
                </Label>
                <Input
                  id="roomName"
                  placeholder="e.g., Master Bedroom, Kitchen"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                />
                <p className="text-xs text-slate-500">
                  You can customize the name or keep the default room type
                </p>
              </div>
              
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
                  disabled={!roomName.trim() || !roomType}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                >
                  Add Room
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddRoomDialog;

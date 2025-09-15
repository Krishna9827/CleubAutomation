import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';

const ROOM_PACKAGES = {
  '2BHK': [
    { name: 'Living Room', type: 'Living' },
    { name: 'Bedroom 1', type: 'Bedroom' },
    { name: 'Bedroom 2', type: 'Bedroom' },
    { name: 'Kitchen', type: 'Kitchen' },
    { name: 'Bathroom 1', type: 'Bathroom' },
    { name: 'Bathroom 2', type: 'Bathroom' },
  ],
  '3BHK': [
    { name: 'Living Room', type: 'Living' },
    { name: 'Bedroom 1', type: 'Bedroom' },
    { name: 'Bedroom 2', type: 'Bedroom' },
    { name: 'Bedroom 3', type: 'Bedroom' },
    { name: 'Kitchen', type: 'Kitchen' },
    { name: 'Bathroom 1', type: 'Bathroom' },
    { name: 'Bathroom 2', type: 'Bathroom' },
    { name: 'Bathroom 3', type: 'Bathroom' },
  ],
  '4BHK': [
    { name: 'Living Room', type: 'Living' },
    { name: 'Bedroom 1', type: 'Bedroom' },
    { name: 'Bedroom 2', type: 'Bedroom' },
    { name: 'Bedroom 3', type: 'Bedroom' },
    { name: 'Bedroom 4', type: 'Bedroom' },
    { name: 'Kitchen', type: 'Kitchen' },
    { name: 'Bathroom 1', type: 'Bathroom' },
    { name: 'Bathroom 2', type: 'Bathroom' },
    { name: 'Bathroom 3', type: 'Bathroom' },
    { name: 'Bathroom 4', type: 'Bathroom' },
  ],
};

const RoomSelection = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('');

  const addPackage = (pkg) => {
    setRooms(prev => [...prev, ...ROOM_PACKAGES[pkg]]);
  };

  const addCustomRoom = () => {
    if (!customName.trim() || !customType.trim()) return;
    setRooms(prev => [...prev, { name: customName, type: customType }]);
    setCustomName('');
    setCustomType('');
  };

  const removeRoom = (idx) => {
    setRooms(prev => prev.filter((_, i) => i !== idx));
  };

  const [useNewVersion, setUseNewVersion] = useState(false);

  const handleContinue = () => {
    localStorage.setItem('projectRooms', JSON.stringify(rooms));
    navigate(useNewVersion ? '/requirements-v2' : '/requirements');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">Select Rooms</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Add Rooms by Package</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {Object.keys(ROOM_PACKAGES).map(pkg => (
              <Button key={pkg} onClick={() => addPackage(pkg)}>{pkg}</Button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Add Custom Room</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 items-end">
            <Input placeholder="Room Name" value={customName} onChange={e => setCustomName(e.target.value)} />
            <Input placeholder="Room Type" value={customType} onChange={e => setCustomType(e.target.value)} />
            <Button onClick={addCustomRoom}><Plus className="w-4 h-4" /></Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Selected Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? <div className="text-slate-500">No rooms added yet.</div> : (
              <ul className="space-y-2">
                {rooms.map((room, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span>{room.name} ({room.type})</span>
                    <Button variant="outline" size="sm" onClick={() => removeRoom(idx)}><Trash2 className="w-3 h-3" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Choose Requirements Sheet Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                variant={!useNewVersion ? "default" : "outline"} 
                onClick={() => setUseNewVersion(false)}
              >
                Version 1 (Original)
              </Button>
              <Button 
                variant={useNewVersion ? "default" : "outline"} 
                onClick={() => setUseNewVersion(true)}
              >
                Version 2 (Independent Rooms)
              </Button>
            </div>
          </CardContent>
        </Card>
        <Button 
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700" 
          onClick={handleContinue} 
          disabled={rooms.length === 0}
        >
          Continue to Requirements {useNewVersion ? 'v2' : 'v1'}
        </Button>
      </div>
    </div>
  );
};

export default RoomSelection;

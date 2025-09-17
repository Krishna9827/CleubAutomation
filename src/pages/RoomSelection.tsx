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

  const [useNewVersion, setUseNewVersion] = useState(true);

  const handleContinue = () => {
    localStorage.setItem('projectRooms', JSON.stringify(rooms));
    navigate('/requirements-v2');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">Select Rooms</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Add Rooms by Package</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            {Object.keys(ROOM_PACKAGES).map(pkg => (
              <Button key={pkg} onClick={() => addPackage(pkg)} className="border-white/20 text-white bg-white/10 hover:bg-white/20" variant="outline">{pkg}</Button>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Add Custom Room</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2 items-end">
            <Input className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" placeholder="Room Name" value={customName} onChange={e => setCustomName(e.target.value)} />
            <Input className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" placeholder="Room Type" value={customType} onChange={e => setCustomType(e.target.value)} />
            <Button onClick={addCustomRoom} className="border-white/20 text-white bg-white/10 hover:bg-white/20" variant="outline"><Plus className="w-4 h-4" /></Button>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Selected Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.length === 0 ? <div className="text-slate-400">No rooms added yet.</div> : (
              <ul className="space-y-2">
                {rooms.map((room, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-white">
                    <span>{room.name} ({room.type})</span>
                    <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10" onClick={() => removeRoom(idx)}><Trash2 className="w-3 h-3" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        {/* Requirements Sheet Version selection removed: v2 is the default */}
        <Button 
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700" 
          onClick={handleContinue} 
          disabled={rooms.length === 0}
        >
          Continue to Requirements
        </Button>
      </div>
    </div>
  );
};

export default RoomSelection;

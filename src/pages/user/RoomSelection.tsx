import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { projectService } from '@/supabase/projectService';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
  type: string;
  features: string[];
  appliances: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

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
  const location = useLocation();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Get project ID from navigation state or localStorage
    const stateProjectId = (location.state as any)?.projectId;
    const storedProjectId = localStorage.getItem('currentProjectId');
    const id = stateProjectId || storedProjectId;
    
    if (id) {
      setProjectId(id);
      console.log('✅ Project ID loaded:', id);
    } else {
      console.warn('⚠️ No project ID found');
    }
    
    setIsLoading(false);
  }, [location]);

  const addPackage = (pkg: keyof typeof ROOM_PACKAGES) => {
    const newRooms = ROOM_PACKAGES[pkg].map(room => ({
      ...room,
      id: Math.random().toString(36).substr(2, 9),
      features: [],
      appliances: []
    }));
    setRooms(prev => [...prev, ...newRooms]);
  };

  const addCustomRoom = () => {
    if (!customName.trim() || !customType.trim()) return;
    const newRoom = {
      id: Math.random().toString(36).substr(2, 9),
      name: customName,
      type: customType,
      features: [],
      appliances: []
    };
    setRooms(prev => [...prev, newRoom]);
    setCustomName('');
    setCustomType('');
  };

  const removeRoom = (id: string) => {
    setRooms(prev => prev.filter(room => room.id !== id));
  };

  const handleContinue = async () => {
    if (rooms.length === 0) return;

    try {
      setIsSaving(true);
      
      if (!projectId) {
        console.error('❌ No project ID found');
        toast({
          title: 'Error',
          description: 'Project ID not found. Please start from the beginning.',
          variant: 'destructive'
        });
        setIsSaving(false);
        return;
      }

      // Create abort controller for 30-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('⏱️ Room selection save timeout after 30s');
      }, 30000);

      try {
        console.log('💾 Starting room selection save...');
        // Save rooms to Supabase
        await projectService.saveRoomSelection(projectId, rooms);
        clearTimeout(timeoutId);
        console.log('✅ Room selection saved successfully');
        
        // Keep project ID for next page
        localStorage.setItem('currentProjectId', projectId);
        
        toast({
          title: 'Success',
          description: 'Room selection saved successfully'
        });
        
        navigate('/requirements', { state: { projectId } });
      } catch (saveError: any) {
        clearTimeout(timeoutId);
        console.error('❌ Room selection save failed:', {
          code: saveError.code,
          message: saveError.message,
          status: saveError.status,
          details: saveError
        });

        // Check if it's a timeout
        if (saveError.name === 'AbortError') {
          toast({
            title: 'Timeout',
            description: 'Save operation took too long. Please check your connection and try again.',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Save Failed',
            description: `Failed to save room selection: ${saveError.message || 'Unknown error'}.`,
            variant: 'destructive'
          });
        }
        
        // Allow proceeding after showing error
        setTimeout(() => {
          navigate('/requirements');
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Unexpected error in handleContinue:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">Select Rooms</h1>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {isLoading ? (
          <div className="text-center text-white">Loading...</div>
        ) : (
          <>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Add Rooms by Package</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-4">
                {(Object.keys(ROOM_PACKAGES) as Array<keyof typeof ROOM_PACKAGES>).map(pkg => (
                  <Button 
                    key={pkg} 
                    onClick={() => addPackage(pkg)} 
                    className="border-white/20 text-white bg-white/10 hover:bg-white/20" 
                    variant="outline"
                  >
                    {pkg}
                  </Button>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Add Custom Room</CardTitle>
              </CardHeader>
              <CardContent className="flex gap-2 items-end">
                <Input 
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" 
                  placeholder="Room Name" 
                  value={customName} 
                  onChange={e => setCustomName(e.target.value)} 
                />
                <Input 
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" 
                  placeholder="Room Type" 
                  value={customType} 
                  onChange={e => setCustomType(e.target.value)} 
                />
                <Button 
                  onClick={addCustomRoom} 
                  className="border-white/20 text-white bg-white/10 hover:bg-white/20" 
                  variant="outline"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Selected Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                {rooms.length === 0 ? (
                  <div className="text-slate-400">No rooms added yet.</div>
                ) : (
                  <ul className="space-y-2">
                    {rooms.map((room) => (
                      <li key={room.id} className="flex items-center gap-2 text-white">
                        <span>{room.name} ({room.type})</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-white/20 text-white hover:bg-white/10" 
                          onClick={() => removeRoom(room.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Button 
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700" 
              onClick={handleContinue} 
              disabled={rooms.length === 0 || isSaving}
            >
              {isSaving ? 'Saving...' : 'Continue to Requirements'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default RoomSelection;

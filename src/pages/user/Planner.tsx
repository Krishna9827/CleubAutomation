import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, ChevronRight, Home, Eye, Save, Calculator, X, Zap } from 'lucide-react';
import { RoomCard } from "@/components/features";
import { AddRoomDialog } from "@/components/features";
import { ProjectSummary } from "@/components/features";
import { EstimatedCost } from "@/components/features";
// import { AutomationBilling } from "@/components/features";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/supabase/projectService';

interface ProjectData {
  projectName: string;
  clientName: string;
  architectName: string;
  designerName: string;
  notes: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
  appliances: Appliance[];
}

interface Appliance {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  wattage?: number;
  specifications: Record<string, any>;
}

const Planner = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  // const [showAutomationBilling, setShowAutomationBilling] = useState(false);

  useEffect(() => {
    const savedProject = localStorage.getItem('projectData');
    if (savedProject) {
      setProjectData(JSON.parse(savedProject));
    } else {
      navigate('/');
    }

    const savedRooms = localStorage.getItem('projectRooms');
    if (savedRooms) {
      setRooms(JSON.parse(savedRooms));
    }
  }, [navigate]);

  const saveRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    localStorage.setItem('projectRooms', JSON.stringify(updatedRooms));
  };

  const addRoom = (name: string, type: string) => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name,
      type,
      appliances: []
    };
    const updatedRooms = [...rooms, newRoom];
    saveRooms(updatedRooms);
    setShowAddRoom(false);
  };

  const addRoomsFromTemplate = (template: { name: string; type: string }[]) => {
    const newRooms: Room[] = template.map((room, index) => ({
      id: `${Date.now()}-${index}`,
      name: room.name,
      type: room.type,
      appliances: []
    }));
    const updatedRooms = [...rooms, ...newRooms];
    saveRooms(updatedRooms);
    setShowAddRoom(false);
  };

  const updateRoom = (roomId: string, updatedRoom: Room) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId ? updatedRoom : room
    );
    saveRooms(updatedRooms);
  };

  const deleteRoom = (roomId: string) => {
    const updatedRooms = rooms.filter(room => room.id !== roomId);
    saveRooms(updatedRooms);
  };

  const getTotalAppliances = () => {
    return rooms.reduce((total, room) => total + room.appliances.length, 0);
  };

  const getTotalRooms = () => rooms.length;

  const saveProject = async () => {
    if (!projectData || !user?.id) return;

    try {
      const projectToSave = {
        client_info: {
          name: projectData.clientName || 'Client',
          email: '',
          phone: '',
          address: '',
        },
        property_details: {
          type: 'home',
          size: 0,
          budget: 0,
        },
        rooms: rooms.map(room => ({
          id: room.id,
          name: room.name,
          type: room.type,
          features: [],
          appliances: room.appliances.map(app => ({
            id: app.id,
            name: app.name,
            quantity: app.quantity,
            price: 0,
          }))
        })),
        status: 'draft' as const,
      };

      // Create project using Supabase
      const projectId = await projectService.createProject(projectToSave, user.id);
      
      console.log('✅ Project saved to Supabase:', projectId);

      // Also save to localStorage for offline access
      const projectHistory = JSON.parse(localStorage.getItem('projectHistory') || '[]');
      projectHistory.unshift({
        id: projectId,
        ...projectToSave,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      localStorage.setItem('projectHistory', JSON.stringify(projectHistory));

      toast({
        title: "Project Saved",
        description: `Your project has been saved successfully`
      });
    } catch (error: any) {
      console.error('❌ Error saving project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save project",
        variant: "destructive"
      });
    }
  };

  if (!projectData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2 text-white hover:text-white"
              >
                <Building2 className="w-6 h-6 text-teal-600" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">{projectData.projectName}</h1>
                <p className="text-sm text-slate-300">Client: {projectData.clientName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-4 mr-4">
                <Badge variant="outline" className="text-white border-white/50">
                  <Home className="w-3 h-3 mr-1" />
                  {getTotalRooms()} Rooms
                </Badge>
                <Badge variant="outline" className="text-white border-white/50">
                  {getTotalAppliances()} Items
                </Badge>
              </div>
              
              <Button
                variant="outline"
                onClick={saveProject}
                className="hidden sm:flex border-green-200/50 text-white hover:bg-green-900/50"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              

              
              <Button
                variant="outline"
                onClick={() => setShowSummary(true)}
                className="hidden sm:flex text-white border-white/50 hover:bg-white/10"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              
              <Button
                onClick={() => setShowAddRoom(true)}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center text-sm text-slate-300">
          <span>Projects</span>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="text-white font-medium">{projectData.projectName}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {rooms.length === 0 ? (
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Rooms Added Yet</h3>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                Start by adding your first room or zone to begin planning your home automation setup.
              </p>
              <Button
                onClick={() => setShowAddRoom(true)}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onUpdate={updateRoom}
                onDelete={deleteRoom}
              />
            ))}
          </div>
        )}
        
        {/* Mobile Buttons */}
        {rooms.length > 0 && (
          <>
            <div className="sm:hidden fixed bottom-32 right-6">
              <Button
                onClick={saveProject}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg rounded-full"
              >
                <Save className="w-5 h-5 mr-2" />
                Save
              </Button>
            </div>
            

            
            <div className="sm:hidden fixed bottom-6 right-6">
              <Button
                onClick={() => setShowSummary(true)}
                size="lg"
                className="bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-lg rounded-full"
              >
                <Eye className="w-5 h-5 mr-2" />
                Summary
              </Button>
            </div>
          </>
        )}
      </div>

      <AddRoomDialog
        open={showAddRoom}
        onClose={() => setShowAddRoom(false)}
        onAdd={addRoom}
        onAddTemplate={addRoomsFromTemplate}
      />

      <ProjectSummary
        open={showSummary}
        onClose={() => setShowSummary(false)}
        projectData={projectData}
        rooms={rooms}
      />


    </div>
  );
};

export default Planner;

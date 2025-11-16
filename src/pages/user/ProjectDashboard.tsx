import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Save, FileDown, Eye, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RoomCard } from "@/components/features";
import { AddRoomDialog } from "@/components/features";
import { ProjectSummary } from "@/components/features";
import { generatePDF } from '@/utils/pdfExport';

interface Room {
  id: string;
  name: string;
  type: string;
  appliances: any[];
}

const MasterPlan = () => {
  const { toast } = useToast();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectData, setProjectData] = useState({
    projectName: '',
    clientName: '',
    architectName: '',
    designerName: '',
    notes: ''
  });

  // Load projects on mount
  useEffect(() => {
    // Projects are loaded from Supabase in the actual component
    // This is a fallback component - should fetch from Supabase service
  }, []);

  const addRoom = (name: string, type: string) => {
    const newRoom = {
      id: Date.now().toString(),
      name,
      type,
      appliances: []
    };
    setRooms([...rooms, newRoom]);
  };

  const addRoomsFromTemplate = (template: { name: string; type: string }[]) => {
    const newRooms = template.map((room, index) => ({
      id: `${Date.now()}-${index}`,
      name: room.name,
      type: room.type,
      appliances: []
    }));
    setRooms([...rooms, ...newRooms]);
  };

  const updateRoom = (roomId: string, updatedRoom: Room) => {
    setRooms(rooms.map(room => 
      room.id === roomId ? updatedRoom : room
    ));
  };

  const deleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
  };

  const handleSave = () => {
    if (!projectData.projectName.trim() || !projectData.clientName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide project name and client name.",
        variant: "destructive"
      });
      return;
    }

    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      rooms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMasterPlan: true
    };

    // Update projects list  
    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);

    toast({
      title: "Master Plan Saved",
      description: "The project has been saved successfully."
    });

    // Generate PDF
    generatePDF(projectData, rooms);
  };

  const loadProject = (project: any) => {
    setSelectedProject(project);
    setRooms(project.rooms || []);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Project History */}
          <div className="lg:w-1/3 space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center text-xl text-slate-800">
                  <Clock className="w-5 h-5 mr-2 text-teal-600" />
                  Project History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-12rem)]">
                  <div className="space-y-4">
                    {projects.filter(p => p.isMasterPlan).map((project) => (
                      <Card
                        key={project.id}
                        className={`border-slate-200 hover:shadow-md transition-shadow cursor-pointer ${
                          selectedProject?.id === project.id ? 'ring-2 ring-teal-500' : ''
                        }`}
                        onClick={() => loadProject(project)}
                      >
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-slate-900">{project.projectName}</h3>
                          <p className="text-sm text-slate-600">{project.clientName}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="bg-white">
                              {project.rooms?.length || 0} Rooms
                            </Badge>
                            <Badge variant="outline" className="bg-white">
                              Master Plan
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Planning Area */}
          <div className="lg:w-2/3 space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-xl text-slate-800">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-teal-600" />
                    Master Planning
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowSummary(true)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Summary
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleSave}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Plan
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Project Details Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        value={projectData.projectName}
                        onChange={(e) => setProjectData(prev => ({ ...prev, projectName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={projectData.clientName}
                        onChange={(e) => setProjectData(prev => ({ ...prev, clientName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="architectName">Architect Name</Label>
                      <Input
                        id="architectName"
                        value={projectData.architectName}
                        onChange={(e) => setProjectData(prev => ({ ...prev, architectName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="designerName">Designer Name</Label>
                      <Input
                        id="designerName"
                        value={projectData.designerName}
                        onChange={(e) => setProjectData(prev => ({ ...prev, designerName: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Rooms Section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-slate-800">Rooms</h3>
                      <Button onClick={() => setShowAddRoom(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Room
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rooms.map((room) => (
                        <RoomCard
                          key={room.id}
                          room={room}
                          onUpdate={updateRoom}
                          onDelete={deleteRoom}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Dialogs */}
        <AddRoomDialog
          open={showAddRoom}
          onClose={() => setShowAddRoom(false)}
          onAdd={addRoom}
          onAddTemplate={addRoomsFromTemplate}
        />

        {showSummary && (
          <ProjectSummary
            open={showSummary}
            onClose={() => setShowSummary(false)}
            projectData={projectData}
            rooms={rooms}
          />
        )}
      </div>
    </div>
  );
};

export default MasterPlan;

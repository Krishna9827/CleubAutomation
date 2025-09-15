import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet } from '@/components/ui/sheet';
import { Building2, Plus, Trash2, Save, ArrowLeft, Package, User, Home, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InventoryManagement from '@/components/InventoryManagement';
import AutomationBilling from '@/components/AutomationBilling';
import { defaultPrices } from '@/components/inventory/constants';
import RoomCard from '@/components/RoomCard';
import AddRoomDialog from '@/components/AddRoomDialog';
import ProjectSummary from '@/components/ProjectSummary';

interface DefaultSettings {
  applianceCategories: string[];
  wattagePresets: number[];
  exportFormats: string[];
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  // Project selection and management state
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectData, setProjectData] = useState<any | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Room management functions
  const saveRooms = (updatedRooms: any[]) => {
    setRooms(updatedRooms);
    if (selectedProjectId && projectData) {
      const updatedProjects = projects.map(p => 
        p.id === selectedProjectId ? { ...p, rooms: updatedRooms } : p
      );
      setProjects(updatedProjects);
      localStorage.setItem('projectHistory', JSON.stringify(updatedProjects));
    }
  };

  const addRoom = (name: string, type: string) => {
    const newRoom = {
      id: Date.now().toString(),
      name,
      type,
      appliances: []
    };
    saveRooms([...rooms, newRoom]);
    setShowAddRoom(false);
  };

  const addRoomsFromTemplate = (template: { name: string; type: string }[]) => {
    const newRooms = template.map((room, index) => ({
      id: `${Date.now()}-${index}`,
      name: room.name,
      type: room.type,
      appliances: []
    }));
    saveRooms([...rooms, ...newRooms]);
    setShowAddRoom(false);
  };

  const updateRoom = (roomId: string, updatedRoom: any) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId ? updatedRoom : room
    );
    saveRooms(updatedRooms);
  };

  const deleteRoom = (roomId: string) => {
    const updatedRooms = rooms.filter(room => room.id !== roomId);
    saveRooms(updatedRooms);
  };

  // Load projects on component mount
  useEffect(() => {
    try {
      console.log('Loading projects from localStorage');
      const savedProjects = localStorage.getItem('projectHistory');
      console.log('Saved projects:', savedProjects);
      if (savedProjects) {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed)) {
          console.log('Setting projects:', parsed);
          setProjects(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }, []);

  // Reset project selection when switching to automation tab
  useEffect(() => {
    if (activeTab === 'automation' && projects.length > 0 && !selectedProjectId) {
      console.log('Setting initial project selection');
      setSelectedProjectId(projects[0].id);
    }
  }, [activeTab, projects, selectedProjectId]);

  // Handle project selection changes
  const handleProjectSelect = (projectId: string) => {
    console.log('Selecting project:', projectId);
    setSelectedProjectId(projectId);
    
    if (!projectId) {
      setProjectData(null);
      setRooms([]);
      return;
    }

    const selectedProj = projects.find(p => p.id === projectId);
    if (selectedProj) {
      console.log('Found project:', selectedProj);
      
      // Ensure we have all required fields
      setProjectData({
        ...selectedProj,
        projectName: selectedProj.projectName || '',
        clientName: selectedProj.clientName || '',
        architectName: selectedProj.architectName || '',
        designerName: selectedProj.designerName || '',
        notes: selectedProj.notes || ''
      });

      // Ensure rooms have proper structure
      const processedRooms = (selectedProj.rooms || []).map(room => ({
        ...room,
        id: room.id || String(Date.now()),
        name: room.name || '',
        type: room.type || '',
        appliances: Array.isArray(room.appliances) ? room.appliances : []
      }));
      
      setRooms(processedRooms);
      console.log('Processed rooms:', processedRooms);
    }
  };

  // Update project data when selection changes
  useEffect(() => {
    if (selectedProjectId && projects.length > 0) {
      handleProjectSelect(selectedProjectId);
    }
  }, [selectedProjectId, projects]);
  const [settings, setSettings] = useState<DefaultSettings>({
    applianceCategories: ['Lights', 'Fans', 'HVAC', 'Smart Devices', 'Curtain & Blinds', 'Security'],
    wattagePresets: [3, 6, 9, 12, 15, 18, 24, 36, 50, 100],
    exportFormats: ['PDF', 'Excel', 'Word']
  });
  
  const [newCategory, setNewCategory] = useState('');
  const [newWattage, setNewWattage] = useState('');

  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveSettings = () => {
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    toast({
      title: "Settings Saved",
      description: "Admin settings have been updated successfully."
    });
  };

  const addCategory = () => {
    if (newCategory.trim() && !settings.applianceCategories.includes(newCategory.trim())) {
      setSettings(prev => ({
        ...prev,
        applianceCategories: [...prev.applianceCategories, newCategory.trim()]
      }));
      setNewCategory('');
    }
  };

  const removeCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      applianceCategories: prev.applianceCategories.filter(c => c !== category)
    }));
  };

  const addWattage = () => {
    const wattage = parseInt(newWattage);
    if (!isNaN(wattage) && wattage > 0 && !settings.wattagePresets.includes(wattage)) {
      setSettings(prev => ({
        ...prev,
        wattagePresets: [...prev.wattagePresets, wattage].sort((a, b) => a - b)
      }));
      setNewWattage('');
    }
  };

  const removeWattage = (wattage: number) => {
    setSettings(prev => ({
      ...prev,
      wattagePresets: prev.wattagePresets.filter(w => w !== wattage)
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')} 
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-teal-600" />
                <h1 className="text-xl font-bold text-slate-900">Admin Settings</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={saveSettings}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="ml-2 border-slate-300"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
  <div className="flex space-x-1 mb-8 bg-white p-1 rounded-lg border border-slate-200">
          <Button
            variant={activeTab === 'general' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('general')}
            className="flex-1"
          >
            General Settings
          </Button>
          <Button
            variant={activeTab === 'inventory' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('inventory')}
            className="flex-1"
          >
            <Package className="w-4 h-4 mr-2" />
            Inventory Management
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="flex-1"
          >
            <span className="mr-2">📜</span>
            Project History
          </Button>
          <Button
            variant={activeTab === 'billing' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('billing')}
            className="flex-1"
          >
            <span className="mr-2">⚡</span>
            Automation Billing
          </Button>
          <Button
            variant={activeTab === 'planning' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('planning')}
            className="flex-1"
          >
            <span className="mr-2">🎯</span>
            Project Planning
          </Button>
        </div>

  {activeTab === 'general' ? (
          <div className="space-y-8">
            {/* Appliance Categories */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Default Appliance Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {settings.applianceCategories.map((category) => (
                    <Badge
                      key={category}
                      variant="outline"
                      className="bg-white hover:bg-red-50 group cursor-pointer"
                      onClick={() => removeCategory(category)}
                    >
                      {category}
                      <Trash2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 text-red-500" />
                    </Badge>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter new category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <Button onClick={addCategory} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wattage Presets */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Default Wattage Presets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {settings.wattagePresets.map((wattage) => (
                    <Badge
                      key={wattage}
                      variant="outline"
                      className="bg-white hover:bg-red-50 group cursor-pointer"
                      onClick={() => removeWattage(wattage)}
                    >
                      {wattage}W
                      <Trash2 className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 text-red-500" />
                    </Badge>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Enter wattage"
                    value={newWattage}
                    onChange={(e) => setNewWattage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addWattage()}
                  />
                  <Button onClick={addWattage} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Formats */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Export Formats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {settings.exportFormats.map((format) => (
                    <Badge key={format} variant="outline" className="bg-white">
                      {format}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'inventory' ? (
          <InventoryManagement />
        ) : activeTab === 'history' ? (
          <div className="bg-white rounded-lg shadow">
            <div className="max-w-6xl mx-auto">
              {/* Remove header from History component since we're in AdminSettings */}
              <div className="space-y-6">
                {projects.length === 0 ? (
                  <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-12 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                        <Package className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">No Projects Yet</h3>
                      <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Projects will appear here once they are created and saved.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Card key={project.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-slate-900 mb-1">
                                {project.projectName}
                              </CardTitle>
                              <div className="flex items-center text-sm text-slate-600 mb-2">
                                <User className="w-3 h-3 mr-1" />
                                {project.clientName}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const updatedProjects = projects.filter(p => p.id !== project.id);
                                setProjects(updatedProjects);
                                localStorage.setItem('projectHistory', JSON.stringify(updatedProjects));
                                toast({
                                  title: "Project Deleted",
                                  description: "Project has been removed from history."
                                });
                              }}
                              className="text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="bg-white">
                              <Home className="w-3 h-3 mr-1" />
                              {project.rooms.length} Rooms
                            </Badge>
                            <Badge variant="outline" className="bg-white">
                              {project.rooms.reduce((total, room) => total + (room.appliances?.length || 0), 0)} Items
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-500">
                            <div>Created: {new Date(project.createdAt).toLocaleDateString()}</div>
                            <div>Updated: {new Date(project.updatedAt).toLocaleDateString()}</div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedProjectId(project.id)}
                              className="flex-1"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'planner' ? (
          <div className="space-y-6">
            {/* Project Selection */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Select Project to Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center p-6">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <div className="text-slate-500 mb-2">No projects available for planning</div>
                    <div className="text-sm text-slate-400">
                      Create a new project to start planning.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <select
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={selectedProjectId}
                      onChange={e => handleProjectSelect(e.target.value)}
                    >
                      <option value="">Select a project...</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.projectName} — {proj.clientName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Planning Interface */}
            {projectData && rooms && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">{projectData.projectName}</h2>
                    <p className="text-sm text-slate-600">Client: {projectData.clientName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddRoom(true)}
                      className="bg-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Room
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSummary(true)}
                      className="bg-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>

                {/* Room Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            )}

            {/* Room Management Dialogs */}
              <AddRoomDialog
                open={showAddRoom}
                onClose={() => setShowAddRoom(false)}
                onAdd={addRoom}
                onAddTemplate={addRoomsFromTemplate}
              />            {projectData && (
              <ProjectSummary
                open={showSummary}
                onClose={() => setShowSummary(false)}
                projectData={projectData}
                rooms={rooms}
              />
            )}
          </div>
        ) : (
          <div>
            <Card className="mb-6 border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">Select Project for Billing</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center p-6">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <div className="text-slate-500 mb-2">No saved projects found.</div>
                    <div className="text-sm text-slate-400">
                      Create and save some projects first to generate billing estimates.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <select
                      className="w-full border border-slate-300 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                      value={selectedProjectId}
                      onChange={e => handleProjectSelect(e.target.value)}
                    >
                      <option value="">Select a project...</option>
                      {projects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.projectName} — {proj.clientName} ({proj.rooms?.length || 0} rooms)
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 text-sm text-slate-500">
                      {projects.length} project(s) available
                    </div>
                    {selectedProjectId && !projectData && (
                      <div className="text-amber-600 text-sm">
                        Loading project data...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
            {projectData ? (
              <div className="space-y-4">
                {rooms && Array.isArray(rooms) && rooms.length > 0 ? (
                  <AutomationBilling 
                    projectData={{
                      projectName: projectData.projectName,
                      clientName: projectData.clientName,
                      architectName: projectData.architectName || '',
                      designerName: projectData.designerName || '',
                      notes: projectData.notes || ''
                    }}
                    rooms={rooms.map(room => ({
                      ...room,
                      appliances: room.appliances || []
                    }))}
                    onClose={() => setActiveTab('general')} 
                  />
                ) : (
                  <Card className="border-slate-200">
                    <CardContent className="text-center p-6">
                      <div className="text-amber-600">
                        This project doesn't have any rooms configured. Add some rooms to generate a billing estimate.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-slate-200">
                <CardContent className="text-center p-6">
                  <div className="text-slate-500">
                    Select a project to view its automation billing estimate.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;

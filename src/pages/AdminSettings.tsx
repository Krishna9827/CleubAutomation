import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Sheet } from '@/components/ui/sheet';
import { Building2, Plus, Trash2, Save, ArrowLeft, Package, User, Home, Eye, Edit, Moon, Sun, ChevronDown, MessageSquare } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import InventoryManagement from '@/components/InventoryManagement';
import AutomationBilling from '@/components/AutomationBilling';
import { defaultPrices } from '@/components/inventory/constants';
import RoomCard from '@/components/RoomCard';
import AddRoomDialog from '@/components/AddRoomDialog';
import ProjectSummary from '@/components/ProjectSummary';
import TestimonialManager from '../components/admin/TestimonialManager';
import { db } from '@/firebase/config';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, setDoc, getDoc, getDocs, addDoc } from 'firebase/firestore';

interface DefaultSettings {
  applianceCategories: string[];
  wattagePresets: number[];
  exportFormats: string[];
  sheetsWebhookUrl?: string;
}

interface Inquiry {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyType: string;
  propertySize: string;
  location: string;
  budget: string;
  requirements: string;
  timeline: string;
  status: 'new' | 'contacted' | 'proposal_sent' | 'closed';
  createdAt: any;
  updatedAt: any;
}

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  // Check if user is logged in, if not redirect to admin login
  useEffect(() => {
    if (!loading && !user) {
      console.log('⚠️ User not logged in, redirecting to admin login');
      navigate('/admin-login');
    }
  }, [user, loading, navigate]);
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

  // Track activeTab changes
  useEffect(() => {
    console.log('activeTab changed to:', activeTab);
  }, [activeTab]);

  // Load projects from Firebase instead of localStorage
  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log('Loading projects from Firebase...');
        const projectsCol = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsCol);
        const projectsList = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('✅ Loaded projects from Firebase:', projectsList.length);
        setProjects(projectsList);
      } catch (error) {
        console.error('❌ Error loading projects from Firebase:', error);
        
        // Fallback to localStorage
        try {
          console.log('🔄 Falling back to localStorage');
          const savedProjects = localStorage.getItem('projectHistory');
          if (savedProjects) {
            const parsed = JSON.parse(savedProjects);
            if (Array.isArray(parsed)) {
              console.log('Setting projects from localStorage:', parsed.length);
              setProjects(parsed);
            }
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      }
    };

    loadProjects();
  }, []);

  // Load inquiries from Firebase in real-time
  useEffect(() => {
    try {
      const inquiriesQuery = query(
        collection(db, 'inquiries'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(inquiriesQuery, (snapshot) => {
        const inquiriesList: Inquiry[] = [];
        snapshot.forEach((doc) => {
          inquiriesList.push({
            id: doc.id,
            ...doc.data(),
          } as Inquiry);
        });
        console.log('✅ Loaded inquiries from Firebase:', inquiriesList.length);
        setInquiries(inquiriesList);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error loading inquiries:', error);
    }
  }, []);

  // Reset project selection when switching to automation tab
  useEffect(() => {
    if (activeTab === 'automation' && projects.length > 0 && !selectedProjectId) {
      console.log('Setting initial project selection');
      setSelectedProjectId(projects[0].id);
    }
  }, [activeTab, projects, selectedProjectId]);

  // Refresh projects when opening History tab to reflect latest saved data
  useEffect(() => {
    if (activeTab === 'history') {
      try {
        const savedProjects = localStorage.getItem('projectHistory');
        if (savedProjects) {
          const parsed = JSON.parse(savedProjects);
          if (Array.isArray(parsed)) {
            setProjects(parsed);
          }
        }
      } catch (error) {
        console.error('Error refreshing projects for history:', error);
      }
    }
  }, [activeTab]);

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

  // Load admin settings from Firebase
  useEffect(() => {
    const loadAdminSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'adminSettings', 'general'));
        if (settingsDoc.exists()) {
          console.log('✅ Loaded admin settings from Firebase');
          setSettings({ ...settings, ...settingsDoc.data() });
        } else {
          console.log('🔄 No admin settings found, using defaults');
          // Save default settings to Firebase
          await setDoc(doc(db, 'adminSettings', 'general'), settings);
        }
      } catch (error) {
        console.error('Error loading admin settings:', error);
        // Fallback to localStorage
        const savedSettings = localStorage.getItem('adminSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
    };

    loadAdminSettings();
  }, []);

  const saveSettings = async () => {
    try {
      // Save to Firebase
      await setDoc(doc(db, 'adminSettings', 'general'), {
        ...settings,
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ Admin settings saved to Firebase');
      
      // Also save to localStorage as backup
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings Saved",
        description: "Admin settings have been updated successfully."
      });
    } catch (error: any) {
      console.error('Error saving admin settings:', error);
      
      // Fallback to localStorage only
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      toast({
        title: "Settings Saved Locally",
        description: "Settings saved to browser storage (Firebase error).",
        variant: "destructive"
      });
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="text-white font-semibold tracking-wide cursor-pointer" onClick={() => navigate('/')}>Cleub Automation</div>
          <nav className="flex-1 flex items-center justify-center gap-4 text-sm z-50 relative">
            <button className="text-slate-300 hover:text-white whitespace-nowrap" onClick={() => navigate('/')}>Home</button>
            <button className={`text-slate-300 hover:text-white whitespace-nowrap ${activeTab==='general'?'text-white':''}`} onClick={() => setActiveTab('general')}>General Settings</button>
            <button className={`text-slate-300 hover:text-white whitespace-nowrap ${activeTab==='inventory'?'text-white':''}`} onClick={() => setActiveTab('inventory')}>Inventory Management</button>
            <button className="text-slate-300 hover:text-white whitespace-nowrap" onClick={() => navigate('/admin/projects')}>Project History</button>
            <button className={`text-slate-300 hover:text-white whitespace-nowrap ${activeTab==='billing'?'text-white':''}`} onClick={() => setActiveTab('billing')}>Automation Billing</button>
            <button 
              className={`text-slate-300 hover:text-white whitespace-nowrap ${activeTab==='testimonials'?'text-white':''}`} 
              onClick={() => {
                console.log('Setting activeTab to testimonials');
                setActiveTab('testimonials');
                console.log('New activeTab value:', 'testimonials');
              }}
            >
              Testimonials
            </button>
            <button 
              className={`text-slate-300 hover:text-white whitespace-nowrap ${activeTab==='inquiries'?'text-white':''}`} 
              onClick={() => setActiveTab('inquiries')}
            >
              <MessageSquare className="w-4 h-4 mr-1 inline" />
              Inquiries
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger className={`text-slate-300 hover:text-white whitespace-nowrap inline-flex items-center gap-1 z-50 ${activeTab==='finalplan' || activeTab==='planning' ? 'text-white' : ''}`}>
                Planning <ChevronDown className="w-4 h-4 opacity-70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/80 backdrop-blur-xl border-white/10 text-white z-50">
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white" onClick={() => setActiveTab('finalplan')}>Summary → Master Plan</DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-white/10 focus:text-white" onClick={() => setActiveTab('planning')}>Project Planning</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
          <div className="flex items-center gap-2">
            <Button onClick={saveSettings} className="bg-white/10 text-white hover:bg-white/20 z-40"><Save className="w-4 h-4 mr-2" />Save</Button>
            <Button variant="outline" onClick={handleLogout} className="border-white/20 text-white hover:bg-white/10 z-40">Logout</Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

  {activeTab === 'inquiries' ? (
          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">Customer Inquiries ({inquiries.length})</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {inquiries.length === 0 ? (
                  <div className="text-center p-8">
                    <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <div className="text-slate-400">No inquiries yet</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <Card key={inquiry.id} className="border-white/10 bg-black/20">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-slate-400 mb-1">Contact</div>
                              <div className="font-semibold text-white">
                                {inquiry.firstName} {inquiry.lastName}
                              </div>
                              <div className="text-sm text-slate-300">{inquiry.email}</div>
                              <div className="text-sm text-slate-300">{inquiry.phone}</div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400 mb-1">Property Details</div>
                              <div className="text-white">{inquiry.propertyType} • {inquiry.propertySize || 'Size not specified'} sq ft</div>
                              <div className="text-sm text-slate-300">{inquiry.location}</div>
                              <div className="text-sm text-slate-300">Budget: {inquiry.budget}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-sm text-slate-400 mb-1">Requirements</div>
                              <div className="text-sm text-slate-300 bg-black/30 p-2 rounded max-h-16 overflow-y-auto">
                                {inquiry.requirements || 'No specific requirements'}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-slate-400 mb-1">Timeline & Status</div>
                              <div className="text-sm text-slate-300 mb-2">Timeline: {inquiry.timeline}</div>
                              <select
                                value={inquiry.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as Inquiry['status'];
                                  updateDoc(doc(db, 'inquiries', inquiry.id), { status: newStatus })
                                    .then(() => {
                                      toast({
                                        title: 'Status Updated',
                                        description: `Inquiry marked as ${newStatus}`,
                                      });
                                    });
                                }}
                                className="w-full text-sm bg-slate-700 text-white border border-slate-600 rounded px-2 py-1"
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="proposal_sent">Proposal Sent</option>
                                <option value="closed">Closed</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <div>Submitted: {inquiry.createdAt?.toDate?.().toLocaleDateString() || 'N/A'}</div>
                            <Badge 
                              variant="outline"
                              className={`${
                                inquiry.status === 'new' ? 'bg-blue-500/20 text-blue-300' :
                                inquiry.status === 'contacted' ? 'bg-yellow-500/20 text-yellow-300' :
                                inquiry.status === 'proposal_sent' ? 'bg-purple-500/20 text-purple-300' :
                                'bg-green-500/20 text-green-300'
                              }`}
                            >
                              {inquiry.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'testimonials' ? (
          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Testimonials Management</CardTitle>
              </CardHeader>
              <CardContent>
                <TestimonialManager />
              </CardContent>
            </Card>
          </div>
        ) : activeTab === 'general' ? (
          <div className="space-y-8">
            {/* Webhook / Sheets Integration */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-slate-300">Google Sheets / Webhook URL</Label>
                  <Input
                    placeholder="https://script.google.com/..."
                    value={settings.sheetsWebhookUrl || localStorage.getItem('sheetsWebhookUrl') || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      setSettings(prev => ({ ...prev, sheetsWebhookUrl: url }));
                      localStorage.setItem('sheetsWebhookUrl', url);
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                  <div className="text-xs text-slate-400 mt-1">Optional: Data will POST here on export/send.</div>
                </div>
              </CardContent>
            </Card>

            {/* Appliance Categories */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Default Appliance Categories</CardTitle>
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
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                  <Button onClick={addCategory} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wattage Presets */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Default Wattage Presets</CardTitle>
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
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                  />
                  <Button onClick={addWattage} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Export Formats */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Export Formats</CardTitle>
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
                      <p className="text-slate-300 mb-6 max-w-md mx-auto">
                        Projects will appear here once they are created and saved.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <Card key={project.id} className="border-white/10 bg-white/5 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg text-slate-900 mb-1">
                                {project.projectName}
                              </CardTitle>
                              <div className="flex items-center text-sm text-slate-300 mb-2">
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
                              {(project.rooms?.length || 0)} Rooms
                            </Badge>
                            <Badge variant="outline" className="bg-white">
                              {(project.rooms || []).reduce((total, room) => total + (room.appliances?.length || 0), 0)} Items
                            </Badge>
                          </div>
                          <div className="text-xs text-slate-400">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                localStorage.setItem('projectData', JSON.stringify({
                                  projectName: project.projectName || '',
                                  clientName: project.clientName || '',
                                  architectName: project.architectName || '',
                                  designerName: project.designerName || '',
                                  notes: project.notes || ''
                                }));
                                localStorage.setItem('projectRooms', JSON.stringify(project.rooms || []));
                                navigate('/planner');
                              }}
                              className="flex-1"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
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
        ) : activeTab === 'planning' ? (
          <div className="space-y-6">
            {/* Project Selection */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Select Project to Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center p-6">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <div className="text-slate-400 mb-2">No projects available for planning</div>
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
                    <p className="text-sm text-slate-300">Client: {projectData.clientName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        try {
                          // Save to Firebase
                          const newProject = {
                            projectName: projectData.projectName || '',
                            clientName: projectData.clientName || '',
                            architectName: projectData.architectName || '',
                            designerName: projectData.designerName || '',
                            notes: projectData.notes || '',
                            rooms,
                            userId: 'admin',
                            status: 'draft',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };

                          const projectsCol = collection(db, 'projects');
                          const docRef = await addDoc(projectsCol, newProject);
                          
                          // Also save to localStorage as backup
                          const history = JSON.parse(localStorage.getItem('projectHistory') || '[]');
                          localStorage.setItem('projectHistory', JSON.stringify([{ id: docRef.id, ...newProject }, ...history]));
                          
                          setProjects([{ id: docRef.id, ...newProject }, ...projects]);
                          
                          toast({ 
                            title: 'Project Saved', 
                            description: 'Project saved to Firebase successfully.' 
                          });
                        } catch (error: any) {
                          console.error('Error saving project:', error);
                          
                          // Fallback to localStorage only
                          const newProject = {
                            id: Date.now().toString(),
                            projectName: projectData.projectName || '',
                            clientName: projectData.clientName || '',
                            architectName: projectData.architectName || '',
                            designerName: projectData.designerName || '',
                            notes: projectData.notes || '',
                            rooms,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                          const history = JSON.parse(localStorage.getItem('projectHistory') || '[]');
                          localStorage.setItem('projectHistory', JSON.stringify([newProject, ...history]));
                          setProjects([newProject, ...projects]);
                          
                          toast({ 
                            title: 'Project Saved Locally', 
                            description: 'Saved to browser storage (Firebase error).',
                            variant: 'destructive'
                          });
                        }
                      }}
                      className="bg-white"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
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
            <Card className="mb-6 border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Select Project for Billing</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center p-6">
                    <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <div className="text-slate-400 mb-2">No saved projects found.</div>
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
                    <div className="mt-2 text-sm text-slate-400">
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
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="text-center p-6">
                      <div className="text-amber-600">
                        This project doesn't have any rooms configured. Add some rooms to generate a billing estimate.
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="border-white/10 bg-white/5">
                <CardContent className="text-center p-6">
                  <div className="text-slate-400">
                    Select a project to view its automation billing estimate.
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
        {activeTab === 'finalplan' && (
          <div className="space-y-6">
            {/* Project Selection */}
            <Card className="border-white/10 bg-white/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Select Project for Summary and Master Plan</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <div className="text-center p-6">
                    <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <div className="text-slate-400 mb-2">No projects available</div>
                    <div className="text-sm text-slate-400">Create a project in Planning first.</div>
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

            {/* Split View: Left Summary, Right Editable Plan */}
            {projectData && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary (Inline) */}
                <Card className="border-white/10 bg-white/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">Project Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-sm text-slate-300">Project Name</div>
                      <div className="font-semibold text-slate-900">{projectData.projectName}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-slate-300">Client</div>
                      <div className="font-semibold text-slate-900">{projectData.clientName}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div className="text-center p-3 bg-teal-50 rounded">
                        <div className="text-xl font-bold text-teal-700">{rooms.length}</div>
                        <div className="text-xs text-teal-600">Rooms</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <div className="text-xl font-bold text-blue-700">{rooms.reduce((t, r) => t + (r.appliances?.length || 0), 0)}</div>
                        <div className="text-xs text-blue-600">Items</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded">
                        <div className="text-xl font-bold text-purple-700">{rooms.reduce((sum, r) => sum + r.appliances.reduce((s: number, a: any) => s + ((a.wattage || 0) * (a.quantity || 0)), 0), 0)}W</div>
                        <div className="text-xs text-purple-600">Total Power</div>
                      </div>
                    </div>

                    {/* Category Summary */}
                    <div className="mt-4 space-y-2">
                      {Object.keys((rooms || []).reduce((acc: Record<string, number>, room: any) => {
                        (room.appliances || []).forEach((a: any) => { acc[a.category] = (acc[a.category] || 0) + a.quantity; });
                        return acc;
                      }, {} as Record<string, number>)).length > 0 && (
                        <div className="space-y-2">
                          {(Object.entries((rooms || []).reduce((acc: Record<string, number>, room: any) => {
                            (room.appliances || []).forEach((a: any) => { acc[a.category] = (acc[a.category] || 0) + a.quantity; });
                            return acc;
                          }, {} as Record<string, number>)) as [string, number][]).map(([cat, count]) => (
                            <div key={cat} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-white/10 bg-white/5">
                              <div className="font-medium text-white">{cat}</div>
                              <div className="text-slate-300">{count} items</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={async () => {
                          try {
                            const newProject = {
                              projectName: projectData.projectName,
                              clientName: projectData.clientName,
                              architectName: projectData.architectName || '',
                              designerName: projectData.designerName || '',
                              notes: projectData.notes || '',
                              rooms,
                              userId: 'admin',
                              status: 'master_plan',
                              isMasterPlan: true,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                            };

                            // Save to Firebase
                            const projectsCol = collection(db, 'projects');
                            const docRef = await addDoc(projectsCol, newProject);
                            
                            // Also save to localStorage as backup
                            const history = JSON.parse(localStorage.getItem('projectHistory') || '[]');
                            localStorage.setItem('projectHistory', JSON.stringify([{ id: docRef.id, ...newProject }, ...history]));
                            
                            setProjects([{ id: docRef.id, ...newProject }, ...projects]);
                            
                            toast({ 
                              title: 'Master Plan Saved', 
                              description: 'Saved to Firebase as Master Plan.' 
                            });
                          } catch (error) {
                            console.error('Error saving master plan:', error);
                            
                            // Fallback to localStorage
                            const newProject = {
                              id: Date.now().toString(),
                              projectName: projectData.projectName,
                              clientName: projectData.clientName,
                              architectName: projectData.architectName || '',
                              designerName: projectData.designerName || '',
                              notes: projectData.notes || '',
                              rooms,
                              createdAt: new Date().toISOString(),
                              updatedAt: new Date().toISOString(),
                              isMasterPlan: true,
                            };
                            const history = JSON.parse(localStorage.getItem('projectHistory') || '[]');
                            localStorage.setItem('projectHistory', JSON.stringify([newProject, ...history]));
                            setProjects([newProject, ...projects]);
                            
                            toast({ 
                              title: 'Master Plan Saved Locally', 
                              description: 'Saved to browser storage (Firebase error).',
                              variant: 'destructive'
                            });
                          }
                        }}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                      >
                        Save Master Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Editable Plan (reuse Room UI) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Edit Rooms</h3>
                    <Button variant="outline" onClick={() => setShowAddRoom(true)} className="bg-white">
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
            )}

            {/* Dialog reused */}
            <AddRoomDialog
              open={showAddRoom}
              onClose={() => setShowAddRoom(false)}
              onAdd={addRoom}
              onAddTemplate={addRoomsFromTemplate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;

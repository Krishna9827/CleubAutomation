import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { projectService } from '@/supabase/projectService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ChevronDown, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SectionItemsDialog, type SectionItem, ProjectDetailsModal } from '@/components/features';
import PanelConfigUI from '@/components/features/PanelConfigUI';
import { panelService } from '@/supabase/panelService';
import type { PanelPreset } from '@/types/project';

const defaultRoomReq = {
  curtains: false,
  ethernet: false,
  curtainMotor: false,
  panelChange: false,
  numLights: '',
  totalWattage: '',
  fanType: '',
  fanControl: '',
  acTvControl: '',
  smartLighting: '',
  smartSwitch: false,
  switchboardHeight: '',
  switchboardModule: '',
  controlsInSameBoard: false,
  notes: '',
  video: null,
  lightTypes: {
    strip: '',
    cob: '',
    accent: '',
    cylinder: ''
  },
  sections: [] as any[]
};

const RequirementSheet2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectData, setProjectData] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  // Initialize each room's requirements separately
  const [roomRequirements, setRoomRequirements] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<{ roomIndex: number; sectionId: string; sectionName: string } | null>(null);
  const [duplicateRoomIndex, setDuplicateRoomIndex] = useState<number | null>(null);
  const [duplicateRoomName, setDuplicateRoomName] = useState('');
  const [showProjectDetails, setShowProjectDetails] = useState(false);

  useEffect(() => {
    const loadProject = async () => {
      try {
        // Get project ID from navigation state or localStorage
        const stateProjectId = (location.state as any)?.projectId;
        const storedProjectId = localStorage.getItem('currentProjectId');
        const id = stateProjectId || storedProjectId;

        if (!id) {
          console.warn('⚠️ No project ID found, redirecting to project planning');
          navigate('/project-planning');
          return;
        }

        setProjectId(id);
        console.log('✅ Project ID loaded in RequirementsForm:', id);

        // Fetch project data from Supabase
        const project = await projectService.getProject(id);
        if (project) {
          setProjectData(project);

          // Initialize rooms from project
          if (project.rooms && project.rooms.length > 0) {
            setRooms(project.rooms);
            // Initialize requirements for each room
            const initialReqs = project.rooms.map((room: any) => ({
              ...defaultRoomReq,
              ...(room.requirements || {})
            }));
            setRoomRequirements(initialReqs);
          }
        }
      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project data',
          variant: 'destructive'
        });
      }
    };

    loadProject();
  }, [navigate, location, toast]);

  const handleReqChange = (roomIndex: number, field: string, value: any, isLightType = false) => {
    setRoomRequirements(prev => {
      const newReqs = [...prev];
      const updatedRoom = { ...newReqs[roomIndex] };

      if (isLightType) {
        updatedRoom.lightTypes = {
          ...updatedRoom.lightTypes,
          [field]: value
        };
      } else {
        updatedRoom[field] = value;
      }

      newReqs[roomIndex] = updatedRoom;
      return newReqs;
    });
  };

  const handleVideo = (roomIndex: number, file: File | null) => {
    setRoomRequirements(prev => {
      const newReqs = [...prev];
      newReqs[roomIndex] = {
        ...newReqs[roomIndex],
        video: file
      };
      return newReqs;
    });
  };

  // Section helpers
  const addSection = (roomIndex: number) => {
    setRoomRequirements(prev => {
      const newReqs = [...prev];
      const newSection = {
        id: Date.now().toString(),
        name: '',
        items: [] as SectionItem[]
      };
      const updatedRoom = { ...newReqs[roomIndex], sections: [...(newReqs[roomIndex].sections || []), newSection] };
      newReqs[roomIndex] = updatedRoom;
      return newReqs;
    });
  };

  const updateSectionField = (roomIndex: number, sectionId: string, field: string, value: any) => {
    setRoomRequirements(prev => {
      const newReqs = [...prev];
      const sections = (newReqs[roomIndex].sections || []).map((s: any) => s.id === sectionId ? { ...s, [field]: value } : s);
      newReqs[roomIndex] = { ...newReqs[roomIndex], sections };
      return newReqs;
    });
  };

  const removeSection = (roomIndex: number, sectionId: string) => {
    setRoomRequirements(prev => {
      const newReqs = [...prev];
      const sections = (newReqs[roomIndex].sections || []).filter((s: any) => s.id !== sectionId);
      newReqs[roomIndex] = { ...newReqs[roomIndex], sections };
      return newReqs;
    });
  };

  const saveSectionItems = (roomIndex: number, sectionId: string, items: SectionItem[]) => {
    setRoomRequirements(prev => {
      const newReqs = [...prev];
      const sections = (newReqs[roomIndex].sections || []).map((s: any) => s.id === sectionId ? { ...s, items } : s);
      newReqs[roomIndex] = { ...newReqs[roomIndex], sections };
      return newReqs;
    });
  };

  const duplicateRoom = (roomIndex: number, newName: string) => {
    // Duplicate the room in rooms array
    const roomToDuplicate = rooms[roomIndex];
    const newRoom = {
      ...roomToDuplicate,
      id: Date.now().toString(),
      name: newName
    };
    setRooms(prev => [...prev, newRoom]);

    // Duplicate the requirements for this room
    const reqsToDuplicate = roomRequirements[roomIndex];
    const newReqs = { ...reqsToDuplicate };
    setRoomRequirements(prev => [...prev, newReqs]);
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveRequirementProject = async () => {
    try {
      setIsSaving(true);

      // Use projectId from state
      if (!projectId) {
        toast({
          title: 'Error',
          description: 'Project ID not found. Please start from project planning.',
          variant: 'destructive'
        });
        navigate('/project-planning');
        return;
      }

      // Update rooms with their requirements
      const updatedRooms = rooms.map((room, index) => ({
        ...room,
        requirements: roomRequirements[index]
      }));

      // Create abort controller for 30-second timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('⏱️ Requirements save timeout after 30s');
      }, 30000);

      try {
        console.log('💾 Saving requirements and rooms to Supabase...');
        // Save to Supabase
        await projectService.updateProject(projectId, {
          rooms: updatedRooms,
          last_saved_page: 'requirements'
        });
        clearTimeout(timeoutId);
        console.log('✅ Requirements saved successfully');

        // Keep project ID for next page
        localStorage.setItem('currentProjectId', projectId);

        toast({
          title: 'Success',
          description: 'Requirements saved successfully'
        });

        // Show ProjectDetails modal for verification
        setShowProjectDetails(true);
      } catch (saveError: any) {
        clearTimeout(timeoutId);
        console.error('❌ Requirements save failed:', {
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
            description: `Failed to save requirements: ${saveError.message || 'Unknown error'}.`,
            variant: 'destructive'
          });
        }

        // Navigate after showing error
      }
    } catch (error: any) {
      console.error('❌ Unexpected error in saveRequirementProject:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!projectData || rooms.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-white">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Requirement Sheet</h1>
              <p className="text-sm text-slate-300">{projectData?.client_info?.name || 'Project'}</p>
            </div>
            <Button
              onClick={saveRequirementProject}
              className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save & Continue'}
            </Button>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {rooms.map((room, roomIndex) => (
          <Card key={room.id} className="border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-lg text-white">{room.name} ({room.type})</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDuplicateRoomIndex(roomIndex);
                    setDuplicateRoomName(`${room.name} - Copy`);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
              </div>
              
              {/* Automation Type Selector */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-300">Automation Type</Label>
                <div className="flex gap-2">
                  <Button
                    variant={room.automationType === 'wireless' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const updatedRooms = [...rooms];
                      updatedRooms[roomIndex] = { ...room, automationType: 'wireless', panels: room.panels || [] };
                      setRooms(updatedRooms);
                    }}
                    className={room.automationType === 'wireless' ? 'bg-teal-600' : 'border-white/20 text-white hover:bg-white/10'}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Wireless
                  </Button>
                  <Button
                    variant={room.automationType === 'wired' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const updatedRooms = [...rooms];
                      updatedRooms[roomIndex] = { ...room, automationType: 'wired', panels: [] };
                      setRooms(updatedRooms);
                    }}
                    className={room.automationType === 'wired' ? 'bg-teal-600' : 'border-white/20 text-white hover:bg-white/10'}
                  >
                    Wired
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Panels Section - Only for Wireless */}
              {room.automationType === 'wireless' && (
                <div className="border-t border-white/10 pt-4">
                  <PanelConfigUI 
                    roomName={room.name}
                    selectedPanels={room.panels || []}
                    onAddPanel={(panel) => {
                      const updatedRooms = [...rooms];
                      const updatedRoom = { ...room, panels: [...(room.panels || []), panel] };
                      updatedRooms[roomIndex] = updatedRoom;
                      setRooms(updatedRooms);
                    }}
                    onRemovePanel={(panelId) => {
                      const updatedRooms = [...rooms];
                      const updatedRoom = { 
                        ...room, 
                        panels: (room.panels || []).filter(p => p.id !== panelId) 
                      };
                      updatedRooms[roomIndex] = updatedRoom;
                      setRooms(updatedRooms);
                    }}
                  />
                </div>
              )}
              
              {/* Sections per room */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-200">Switch Panels / Points</div>
                  <Button variant="outline" onClick={() => addSection(roomIndex)} className="bg-teal/5 text-teal-600">Add Section</Button>
                </div>
                {(roomRequirements[roomIndex]?.sections || []).length === 0 && (
                  <div className="text-xs text-slate-500">No sections added. Use "Add Section" to describe each switch panel or point group.</div>
                )}
                <div className="space-y-3">
                  {(roomRequirements[roomIndex]?.sections || []).map((section: any) => (
                    <Card key={section.id} className="border-white/10">
                      <CardContent className="pt-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-white">Section Name</label>
                            <Input value={section.name || ''} onChange={e => updateSectionField(roomIndex, section.id, 'name', e.target.value)} placeholder="e.g., Main Door Panel" />
                          </div>
                          <div className="md:col-span-2 flex items-end justify-end gap-2">
                            <Button variant="outline" onClick={() => setActiveSection({ roomIndex, sectionId: section.id, sectionName: section.name || 'Section' })} className="text-white">Add Items</Button>
                            <Button variant="outline" onClick={() => removeSection(roomIndex, section.id)} className="text-red-600 border-red-200 hover:bg-red-50">Remove Section</Button>
                          </div>
                        </div>
                        {(section.items && section.items.length > 0) && (
                          <div className="space-y-2">
                            {section.items.map((it: SectionItem, i: number) => (
                              <div key={i} className="flex items-center justify-between text-sm text-slate-200 bg-white/5 border border-white/10 rounded p-2">
                                <div>
                                  {it.category} — {(it.type === 'Other' ? it.customType : it.type) || '-'} • Qty: {it.quantity} {it.voltage ? `• ${it.voltage === 'Custom' ? it.customVoltage : it.voltage}` : ''}
                                  {it.notes && <span className="ml-2 text-slate-500">({it.notes})</span>}
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setActiveSection({ roomIndex, sectionId: section.id, sectionName: section.name || 'Section' })}>Edit</Button>
                                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                                    const filtered = (section.items || []).filter((_, idx) => idx !== i);
                                    saveSectionItems(roomIndex, section.id, filtered);
                                  }}>Remove</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              {/* Removed previous single-room fields to keep only sections */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Duplicate Room Dialog */}
      {duplicateRoomIndex !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="bg-white/95 w-full max-w-md">
            <CardHeader>
              <CardTitle>Duplicate Room</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">New Room Name</label>
                <Input
                  value={duplicateRoomName}
                  onChange={(e) => setDuplicateRoomName(e.target.value)}
                  className="mt-1"
                  placeholder="Enter room name"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setDuplicateRoomIndex(null)}
                  className="text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (duplicateRoomName.trim()) {
                      duplicateRoom(duplicateRoomIndex, duplicateRoomName);
                      setDuplicateRoomIndex(null);
                      setDuplicateRoomName('');
                    }
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Duplicate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <SectionItemsDialog
        open={!!activeSection}
        onClose={() => setActiveSection(null)}
        onSave={(items) => {
          if (!activeSection) return;
          saveSectionItems(activeSection.roomIndex, activeSection.sectionId, items);
        }}
        sectionName={activeSection?.sectionName || ''}
        initialItems={activeSection ? (roomRequirements[activeSection.roomIndex]?.sections || []).find((s: any) => s.id === activeSection.sectionId)?.items || [] : []}
      />

      {/* Project Summary Modal */}
      <ProjectDetailsModal
        open={showProjectDetails}
        onClose={() => {
          setShowProjectDetails(false);
          // Clear project ID and redirect to home
          localStorage.removeItem('currentProjectId');
          navigate('/');
        }}
        projectData={projectData}
      />
    </div>
  );
};

export default RequirementSheet2;

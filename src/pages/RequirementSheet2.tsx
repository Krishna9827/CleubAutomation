import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { projectService } from '@/supabase/projectService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ChevronDown } from 'lucide-react';
import SectionItemsDialog, { type SectionItem } from '@/components/SectionItemsDialog';

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
  const [projectData, setProjectData] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  // Initialize each room's requirements separately
  const [roomRequirements, setRoomRequirements] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<{ roomIndex: number; sectionId: string; sectionName: string } | null>(null);
  const [duplicateRoomIndex, setDuplicateRoomIndex] = useState<number | null>(null);
  const [duplicateRoomName, setDuplicateRoomName] = useState('');

  useEffect(() => {
    const loadProject = async () => {
      try {
        // Try to get project from Supabase first
        const projectId = localStorage.getItem('projectId');
        if (projectId) {
          const project = await projectService.getProject(projectId);
          if (project) {
            setProjectData({
              projectName: project.property_details.type,
              clientName: project.client_info.name,
              ...project
            });
            setRooms(project.rooms || []);
            // Initialize requirements from saved data or defaults
            setRoomRequirements(
              project.rooms.map(room => ({
                ...JSON.parse(JSON.stringify(defaultRoomReq)),
                // Note: requirements might not exist on room type
              }))
            );
            return;
          }
        }

        // Fallback to localStorage if no Firebase data
        const savedProject = localStorage.getItem('projectData');
        if (savedProject) {
          setProjectData(JSON.parse(savedProject));
        } else {
          navigate('/');
          return;
        }

        const savedRooms = localStorage.getItem('projectRooms');
        if (savedRooms) {
          const loadedRooms = JSON.parse(savedRooms);
          setRooms(loadedRooms);
          // Initialize separate requirements for each room
          setRoomRequirements(
            loadedRooms.map(() => ({
              ...JSON.parse(JSON.stringify(defaultRoomReq))
            }))
          );
        }
      } catch (error) {
        console.error('Error loading project:', error);
        // Fallback to localStorage or show error message
      }
    };

    loadProject();
  }, [navigate]);

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
      
      // Get projectId from localStorage or create a new project
      let projectId = localStorage.getItem('projectId');
      
      if (!projectId) {
        // Create a new project
        projectId = await projectService.createProject({
          client_info: {
            name: projectData.clientName,
            email: projectData.clientEmail || '',
            phone: projectData.clientPhone || '',
            address: projectData.clientAddress || '',
          },
          property_details: {
            type: projectData.propertyType || '',
            size: projectData.propertySize || 0,
            budget: projectData.budget || 0,
          }
        });
        localStorage.setItem('projectId', projectId);
      }

      // Update rooms with their requirements
      const updatedRooms = rooms.map((room, index) => ({
        ...room,
        requirements: roomRequirements[index]
      }));

      // Save to Supabase
      await projectService.updateProject(projectId, {
        rooms: updatedRooms,
        last_saved_page: 'requirements'
      });

      // Keep localStorage in sync for backward compatibility
      localStorage.setItem('projectRooms', JSON.stringify(updatedRooms));
      const requirementsObj = updatedRooms.reduce((acc: any, room: any, index: number) => {
        acc[room.id] = roomRequirements[index];
        return acc;
      }, {});
      localStorage.setItem('requirements', JSON.stringify(requirementsObj));

      // Navigate to final review page
      navigate('/final-review');
    } catch (error) {
      console.error('Error saving project:', error);
      // Try to save to localStorage as fallback
      try {
        const updatedRooms = rooms.map((room: any, index: number) => ({
          ...room,
          requirements: roomRequirements[index]
        }));
        localStorage.setItem('projectRooms', JSON.stringify(updatedRooms));
        const requirementsObj = updatedRooms.reduce((acc: any, room: any, index: number) => {
          acc[room.id] = roomRequirements[index];
          return acc;
        }, {});
        localStorage.setItem('requirements', JSON.stringify(requirementsObj));
        navigate('/final-review');
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        alert('Failed to save project. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!projectData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Requirement Sheet</h1>
              <p className="text-sm text-slate-300">{projectData.projectName} - {projectData.clientName}</p>
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
              <div className="flex items-center justify-between">
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
            </CardHeader>
            <CardContent className="space-y-4">
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
    </div>
  );
};

export default RequirementSheet2;

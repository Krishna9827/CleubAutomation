import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

  useEffect(() => {
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

  const saveRequirementProject = () => {
    // Create an object mapping room IDs to their requirements
    const requirementsObj = rooms.reduce((acc, room, index) => {
      acc[room.id] = roomRequirements[index];
      return acc;
    }, {});
    
    localStorage.setItem('requirements', JSON.stringify(requirementsObj));
    navigate('/final-review');
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
            <Button onClick={saveRequirementProject} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
              Save
            </Button>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {rooms.map((room, roomIndex) => (
          <Card key={room.id} className="border-white/10">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 text-white">{room.name} ({room.type})</CardTitle>
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
};

const RequirementSheet = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [requirements, setRequirements] = useState({});


  // Load project and rooms, then initialize requirements for each room
  useEffect(() => {
    const savedProject = localStorage.getItem('projectData');
    if (savedProject) setProjectData(JSON.parse(savedProject));
    else navigate('/');
    const savedRooms = localStorage.getItem('projectRooms');
    if (savedRooms) {
      const loadedRooms = JSON.parse(savedRooms);
      setRooms(loadedRooms);
      // Initialize requirements for each room only once after loading rooms
      setRequirements(prev => {
        const updated = { ...prev };
        loadedRooms.forEach(room => {
          if (!updated[room.id]) {
            // Deep clone defaultRoomReq and lightTypes
            updated[room.id] = JSON.parse(JSON.stringify({
              ...defaultRoomReq,
              lightTypes: { strip: '', cob: '', accent: '', cylinder: '' },
            }));
          } else if (!updated[room.id].lightTypes) {
            updated[room.id].lightTypes = { strip: '', cob: '', accent: '', cylinder: '' };
          }
        });
        return updated;
      });
    }
  }, [navigate]);

  const handleReqChange = (roomId, field, value, isLightType = false) => {
    setRequirements(prev => {
      const updatedRoom = JSON.parse(JSON.stringify(prev[roomId])); // Deep clone the room
      if (isLightType) {
        updatedRoom.lightTypes[field] = value;
      } else {
        updatedRoom[field] = value;
      }
      return {
        ...prev,
        [roomId]: updatedRoom,
      };
    });
  };

  const handleVideo = (roomId, file) => {
    setRequirements(prev => {
      const updatedRoom = JSON.parse(JSON.stringify(prev[roomId])); // Deep clone the room
      updatedRoom.video = file;
      return {
        ...prev,
        [roomId]: updatedRoom,
      };
    });
  };

  const saveRequirementProject = () => {
    // Save requirements to localStorage and go to final review
    localStorage.setItem('requirements', JSON.stringify(requirements));
    navigate('/final-review');
  };

  if (!projectData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Requirement Sheet</h1>
              <p className="text-sm text-slate-600">{projectData.projectName} - {projectData.clientName}</p>
            </div>
            <Button onClick={saveRequirementProject} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">Save</Button>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {rooms.map(room => (
          <Card key={room.id} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">{room.name} ({room.type})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Checkbox checked={requirements[room.id]?.curtains || false} onCheckedChange={v => handleReqChange(room.id, 'curtains', v)} /> Curtains
                </div>
                <div>
                  <Checkbox checked={requirements[room.id]?.ethernet || false} onCheckedChange={v => handleReqChange(room.id, 'ethernet', v)} /> Ethernet Connection
                </div>
                <div>
                  <Checkbox checked={requirements[room.id]?.curtainMotor || false} onCheckedChange={v => handleReqChange(room.id, 'curtainMotor', v)} /> Curtain Motor Power in Pelmet
                </div>
                <div>
                  <Checkbox checked={requirements[room.id]?.panelChange || false} onCheckedChange={v => handleReqChange(room.id, 'panelChange', v)} /> Panel Change Required
                </div>
                <div>
                  <label>No. of Lights</label>
                  <Input type="number" value={requirements[room.id]?.numLights || ''} onChange={e => handleReqChange(room.id, 'numLights', e.target.value)} />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">Strip</label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={requirements[room.id]?.lightTypes?.strip || ''} 
                        onChange={e => handleReqChange(room.id, 'strip', e.target.value, true)} 
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="text-xs">COB</label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={requirements[room.id]?.lightTypes?.cob || ''} 
                        onChange={e => handleReqChange(room.id, 'cob', e.target.value, true)} 
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="text-xs">Accent</label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={requirements[room.id]?.lightTypes?.accent || ''} 
                        onChange={e => handleReqChange(room.id, 'accent', e.target.value, true)} 
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="text-xs">Cylinder</label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={requirements[room.id]?.lightTypes?.cylinder || ''} 
                        onChange={e => handleReqChange(room.id, 'cylinder', e.target.value, true)} 
                        placeholder="0" 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label>Total Wattage</label>
                  <Input type="number" value={requirements[room.id]?.totalWattage || ''} onChange={e => handleReqChange(room.id, 'totalWattage', e.target.value)} />
                </div>
                <div>
                  <label>Fan Type</label>
                  <Select value={requirements[room.id]?.fanType || ''} onValueChange={v => handleReqChange(room.id, 'fanType', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DLDC">DLDC</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>Fan Control</label>
                  <Select value={requirements[room.id]?.fanControl || ''} onValueChange={v => handleReqChange(room.id, 'fanControl', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On/Off">On/Off</SelectItem>
                      <SelectItem value="Speed">Speed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>AC/TV Control</label>
                  <Select value={requirements[room.id]?.acTvControl || ''} onValueChange={v => handleReqChange(room.id, 'acTvControl', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On/Off Only">On/Off Only</SelectItem>
                      <SelectItem value="App/Voice">App/Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>Smart Lighting</label>
                  <Select value={requirements[room.id]?.smartLighting || ''} onValueChange={v => handleReqChange(room.id, 'smartLighting', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RGB">RGB</SelectItem>
                      <SelectItem value="CCT">CCT</SelectItem>
                      <SelectItem value="RGB+CCT">RGB+CCT</SelectItem>
                      <SelectItem value="On/Off Only">On/Off Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Checkbox checked={requirements[room.id]?.smartSwitch || false} onCheckedChange={v => handleReqChange(room.id, 'smartSwitch', v)} /> Smart Switch Required
                </div>
                <div>
                  <label>Switchboard Height</label>
                  <Input type="number" value={requirements[room.id]?.switchboardHeight || ''} onChange={e => handleReqChange(room.id, 'switchboardHeight', e.target.value)} />
                </div>
                <div>
                  <label>Switchboard Module/Size</label>
                  <Input value={requirements[room.id]?.switchboardModule || ''} onChange={e => handleReqChange(room.id, 'switchboardModule', e.target.value)} />
                </div>
                <div>
                  <Checkbox checked={requirements[room.id]?.controlsInSameBoard || false} onCheckedChange={v => handleReqChange(room.id, 'controlsInSameBoard', v)} /> Controls in Same Board
                </div>
                <div className="col-span-2">
                  <label>Notes</label>
                  <Textarea value={requirements[room.id]?.notes || ''} onChange={e => handleReqChange(room.id, 'notes', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label>Room Video (optional)</label>
                  <Input type="file" accept="video/*" onChange={e => handleVideo(room.id, e.target.files?.[0] || null)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RequirementSheet;

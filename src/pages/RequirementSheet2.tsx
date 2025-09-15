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
  lightTypes: {
    strip: '',
    cob: '',
    accent: '',
    cylinder: ''
  }
};

const RequirementSheet2 = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  // Initialize each room's requirements separately
  const [roomRequirements, setRoomRequirements] = useState<any[]>([]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Requirement Sheet v2</h1>
              <p className="text-sm text-slate-600">{projectData.projectName} - {projectData.clientName}</p>
            </div>
            <Button onClick={saveRequirementProject} className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
              Save
            </Button>
          </div>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {rooms.map((room, roomIndex) => (
          <Card key={room.id} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800">{room.name} ({room.type})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Checkbox 
                    checked={roomRequirements[roomIndex]?.curtains || false} 
                    onCheckedChange={v => handleReqChange(roomIndex, 'curtains', v)} 
                  /> Curtains
                </div>
                <div>
                  <Checkbox 
                    checked={roomRequirements[roomIndex]?.ethernet || false} 
                    onCheckedChange={v => handleReqChange(roomIndex, 'ethernet', v)} 
                  /> Ethernet Connection
                </div>
                <div>
                  <Checkbox 
                    checked={roomRequirements[roomIndex]?.curtainMotor || false} 
                    onCheckedChange={v => handleReqChange(roomIndex, 'curtainMotor', v)} 
                  /> Curtain Motor Power in Pelmet
                </div>
                <div>
                  <Checkbox 
                    checked={roomRequirements[roomIndex]?.panelChange || false} 
                    onCheckedChange={v => handleReqChange(roomIndex, 'panelChange', v)} 
                  /> Panel Change Required
                </div>
                <div>
                  <label>No. of Lights</label>
                  <Input 
                    type="number" 
                    value={roomRequirements[roomIndex]?.numLights || ''} 
                    onChange={e => handleReqChange(roomIndex, 'numLights', e.target.value)} 
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs">Strip</label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={roomRequirements[roomIndex]?.lightTypes?.strip || ''} 
                        onChange={e => handleReqChange(roomIndex, 'strip', e.target.value, true)} 
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="text-xs">COB</label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={roomRequirements[roomIndex]?.lightTypes?.cob || ''} 
                        onChange={e => handleReqChange(roomIndex, 'cob', e.target.value, true)} 
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="text-xs">Accent</label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={roomRequirements[roomIndex]?.lightTypes?.accent || ''} 
                        onChange={e => handleReqChange(roomIndex, 'accent', e.target.value, true)} 
                        placeholder="0" 
                      />
                    </div>
                    <div>
                      <label className="text-xs">Cylinder</label>
                      <Input 
                        type="number" 
                        min="0" 
                        value={roomRequirements[roomIndex]?.lightTypes?.cylinder || ''} 
                        onChange={e => handleReqChange(roomIndex, 'cylinder', e.target.value, true)} 
                        placeholder="0" 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label>Total Wattage</label>
                  <Input 
                    type="number" 
                    value={roomRequirements[roomIndex]?.totalWattage || ''} 
                    onChange={e => handleReqChange(roomIndex, 'totalWattage', e.target.value)} 
                  />
                </div>
                <div>
                  <label>Fan Type</label>
                  <Select 
                    value={roomRequirements[roomIndex]?.fanType || ''} 
                    onValueChange={v => handleReqChange(roomIndex, 'fanType', v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DLDC">DLDC</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>Fan Control</label>
                  <Select 
                    value={roomRequirements[roomIndex]?.fanControl || ''} 
                    onValueChange={v => handleReqChange(roomIndex, 'fanControl', v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On/Off">On/Off</SelectItem>
                      <SelectItem value="Speed">Speed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>AC/TV Control</label>
                  <Select 
                    value={roomRequirements[roomIndex]?.acTvControl || ''} 
                    onValueChange={v => handleReqChange(roomIndex, 'acTvControl', v)}
                  >
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On/Off Only">On/Off Only</SelectItem>
                      <SelectItem value="App/Voice">App/Voice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label>Smart Lighting</label>
                  <Select 
                    value={roomRequirements[roomIndex]?.smartLighting || ''} 
                    onValueChange={v => handleReqChange(roomIndex, 'smartLighting', v)}
                  >
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
                  <Checkbox 
                    checked={roomRequirements[roomIndex]?.smartSwitch || false} 
                    onCheckedChange={v => handleReqChange(roomIndex, 'smartSwitch', v)} 
                  /> Smart Switch Required
                </div>
                <div>
                  <label>Switchboard Height</label>
                  <Input 
                    type="number" 
                    value={roomRequirements[roomIndex]?.switchboardHeight || ''} 
                    onChange={e => handleReqChange(roomIndex, 'switchboardHeight', e.target.value)} 
                  />
                </div>
                <div>
                  <label>Switchboard Module/Size</label>
                  <Input 
                    value={roomRequirements[roomIndex]?.switchboardModule || ''} 
                    onChange={e => handleReqChange(roomIndex, 'switchboardModule', e.target.value)} 
                  />
                </div>
                <div>
                  <Checkbox 
                    checked={roomRequirements[roomIndex]?.controlsInSameBoard || false} 
                    onCheckedChange={v => handleReqChange(roomIndex, 'controlsInSameBoard', v)} 
                  /> Controls in Same Board
                </div>
                <div className="col-span-2">
                  <label>Notes</label>
                  <Textarea 
                    value={roomRequirements[roomIndex]?.notes || ''} 
                    onChange={e => handleReqChange(roomIndex, 'notes', e.target.value)} 
                  />
                </div>
                <div className="col-span-2">
                  <label>Room Video (optional)</label>
                  <Input 
                    type="file" 
                    accept="video/*" 
                    onChange={e => handleVideo(roomIndex, e.target.files?.[0] || null)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RequirementSheet2;

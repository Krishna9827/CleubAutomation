import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

const FinalReview = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [requirements, setRequirements] = useState({});

  useEffect(() => {
    const pd = localStorage.getItem('projectData');
    const pr = localStorage.getItem('projectRooms');
    const req = localStorage.getItem('requirements');
    if (pd) setProjectData(JSON.parse(pd));
    if (pr) setRooms(JSON.parse(pr));
    if (req) setRequirements(JSON.parse(req));
  }, []);

  const handleEdit = () => {
    navigate('/requirements');
  };

  const handleFinalSave = () => {
    const projectHistory = JSON.parse(localStorage.getItem('projectHistory') || '[]');
    // Serial code logic (same as before)
    const generateSerialCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
      return code;
    };
    let serialCode = '';
    let unique = false;
    while (!unique) {
      serialCode = generateSerialCode();
      unique = !projectHistory.some((p) => p.serialCode === serialCode);
    }
    const savedProject = {
      id: Date.now().toString(),
      serialCode,
      ...projectData,
      rooms,
      requirements,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'requirement',
    };
    projectHistory.unshift(savedProject);
    localStorage.setItem('projectHistory', JSON.stringify(projectHistory));
    navigate('/');
  };

  if (!projectData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Review & Finalize</h1>
          <Button variant="ghost" onClick={() => navigate('/')}> <Home className="w-5 h-5 mr-1" /> Go to Home </Button>
        </div>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div><b>Project Name:</b> {projectData.projectName}</div>
            <div><b>Client Name:</b> {projectData.clientName}</div>
            {projectData.architectName && <div><b>Architect:</b> {projectData.architectName}</div>}
            {projectData.designerName && <div><b>Designer:</b> {projectData.designerName}</div>}
            {projectData.notes && <div><b>Notes:</b> {projectData.notes}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {rooms.map((room, idx) => (
                <li key={idx}>{room.name} ({room.type})</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Room Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.map((room, idx) => (
              <div key={idx} className="mb-4">
                <div className="font-semibold">{room.name} ({room.type})</div>
                <pre className="bg-slate-100 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(requirements[room.id] || {}, null, 2)}</pre>
              </div>
            ))}
          </CardContent>
        </Card>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleEdit}>Edit Requirements</Button>
          <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700" onClick={handleFinalSave}>Final Save to History</Button>
        </div>
      </div>
    </div>
  );
};

export default FinalReview;

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Download, Share2 } from 'lucide-react';

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
    // optional webhook auto-send
    const webhookUrl = localStorage.getItem('sheetsWebhookUrl');
    if (webhookUrl) {
      try {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectData, rooms, requirements, event: 'final_save', timestamp: new Date().toISOString() })
        });
      } catch (e) { /* ignore */ }
    }
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

  const exportCsv = () => {
    if (!rooms || rooms.length === 0) return;
    const rows: string[] = [];
    rows.push(['Room Name','Room Type','Section Name','Lights Count','Light Type','Light Function','Fans Count','Fan Type','Fan Control','Curtains','Pelmet Power','Ceiling Strong','TV/AC Control','Switchboard Module','Appliances Summary'].join(','));
    rooms.forEach((room: any) => {
      const req = (requirements as any)[room.id] || {};
      const sections = req.sections || [];
      if (sections.length === 0) {
        rows.push([room.name, room.type].concat(Array(13).fill('')).join(','));
      } else {
        sections.forEach((s: any) => {
          rows.push([
            room.name,
            room.type,
            s.name || '',
            s.lightsCount || '',
            s.lightType || '',
            s.lightFunction || '',
            s.fansCount || '',
            s.fanType || '',
            s.fanControl || '',
            s.curtains ? 'Yes' : 'No',
            s.pelmetPower ? 'Yes' : 'No',
            s.ceilingStrong ? 'Yes' : 'No',
            s.tvAcControl || '',
            s.switchboardModule || '',
            (s.appliancesSummary || '').replace(/\n/g,' ').replace(/,/g,';')
          ].join(','));
        });
      }
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectData as any).projectName || 'requirements'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendToWebhook = async () => {
    const webhookUrl = localStorage.getItem('sheetsWebhookUrl');
    if (!webhookUrl) return;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectData, rooms, requirements, timestamp: new Date().toISOString() })
      });
    } catch (e) {
      // ignore
    }
  };

  if (!projectData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Review & Finalize</h1>
          <Button variant="ghost" onClick={() => navigate('/')}> <Home className="w-5 h-5 mr-1" /> Go to Home </Button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 text-white">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 text-white">Project Name</div>
              <div className="font-semibold text-white">{(projectData as any).projectName}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 text-white">Client</div>
              <div className="font-semibold text-white">{(projectData as any).clientName}</div>
            </div>
            {(projectData as any).architectName && (
              <div>
                <div className="text-xs text-slate-500 text-white">Architect</div>
                <div className="font-semibold text-white">{(projectData as any).architectName}</div>
              </div>
            )}
            {(projectData as any).designerName && (
              <div>
                <div className="text-xs text-slate-500 text-white">Designer</div>
                <div className="font-semibold text-white">{(projectData as any).designerName}</div>
              </div>
            )}
            {(projectData as any).notes && (
              <div className="md:col-span-2">
                <div className="text-xs text-slate-500 text-white">Notes</div>
                <div className="text-slate-800">{(projectData as any).notes}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 text-white">Rooms</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rooms.map((room: any, idx) => (
              <div key={idx} className="p-3 rounded border border-white/10 bg-white/5">
                <div className="font-semibold text-white">{room.name}</div>
                <div className="text-xs text-slate-300">{room.type}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-slate-800 text-white">Sections Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.map((room: any, idx) => {
              const req = (requirements as any)[room.id] || {};
              const sections = req.sections || [];
              return (
                <div key={idx} className="mb-6">
                  <div className="font-semibold text-white mb-2">{room.name} ({room.type})</div>
                  {sections.length === 0 ? (
                    <div className="text-sm text-slate-500">No sections added.</div>
                  ) : (
                    <div className="space-y-2">
                      {sections.map((s: any) => (
                        <div key={s.id} className="p-3 bg-white/5 border border-white/10 rounded">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-slate-800">{s.name || 'Section'}</div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                            <div>Lights: {s.lightsCount || '-'} ({s.lightType || '-'})</div>
                            <div>Function: {s.lightFunction || '-'}</div>
                            <div>Fans: {s.fansCount || '-'} ({s.fanType || '-'}, {s.fanControl || '-'})</div>
                            <div>Curtains: {s.curtains ? 'Yes' : 'No'}</div>
                            <div>Pelmet Power: {s.pelmetPower ? 'Yes' : 'No'}</div>
                            <div>Ceiling Strong: {s.ceilingStrong ? 'Yes' : 'No'}</div>
                            <div>TV/AC Control: {s.tvAcControl || '-'}</div>
                            <div>Switchboard: {s.switchboardModule || '-'}</div>
                          </div>
                          {s.appliancesSummary && (
                            <div className="mt-2 text-xs text-slate-700">Appliances: {s.appliancesSummary}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleEdit} className="text-white">Edit Requirements</Button>
          <Button variant="outline" onClick={exportCsv} className="text-white"><Download className="w-4 h-4 mr-2" />Export CSV</Button>
          <Button variant="outline" onClick={sendToWebhook} className="text-white"><Share2 className="w-4 h-4 mr-2" />Send to Sheets/Webhook</Button>
          <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700" onClick={handleFinalSave}>Final Save to History</Button>
        </div>
      </div>
    </div>
  );
};

export default FinalReview;

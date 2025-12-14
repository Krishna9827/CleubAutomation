'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Download, Share2 } from 'lucide-react';

export default function FinalReviewClient() {
  const router = useRouter();
  const [projectData, setProjectData] = useState<any>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<Record<string, any>>({});

  useEffect(() => {
    // Project data should be fetched from Supabase or passed via navigation state
    // For now, redirect if no data available
    if (!projectData) {
      router.push('/');
    }
  }, [router, projectData]);

  const handleEdit = () => {
    router.push('/requirements');
  };

  const handleFinalSave = () => {
    router.push('/');
  };

  const exportCsv = () => {
    if (!rooms || rooms.length === 0) return;
    const rows: string[] = [];
    rows.push(['Room Name','Room Type','Section Name','Lights Count','Light Type','Light Function','Fans Count','Fan Type','Fan Control','Curtains','Pelmet Power','Ceiling Strong','TV/AC Control','Switchboard Module','Appliances Summary'].join(','));
    rooms.forEach((room: any) => {
      const req = requirements[room.id] || {};
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
    a.download = `${projectData?.projectName || 'requirements'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!projectData) return <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex flex-col">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Review & Finalize</h1>
          <Button variant="ghost" onClick={() => router.push('/')}> <Home className="w-5 h-5 mr-1" /> Go to Home </Button>
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500">Project Name</div>
              <div className="font-semibold text-white">{projectData?.projectName}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500">Client</div>
              <div className="font-semibold text-white">{projectData?.clientName}</div>
            </div>
            {projectData?.architectName && (
              <div>
                <div className="text-xs text-slate-500">Architect</div>
                <div className="font-semibold text-white">{projectData.architectName}</div>
              </div>
            )}
            {projectData?.designerName && (
              <div>
                <div className="text-xs text-slate-500">Designer</div>
                <div className="font-semibold text-white">{projectData.designerName}</div>
              </div>
            )}
            {projectData?.notes && (
              <div className="md:col-span-2">
                <div className="text-xs text-slate-500">Notes</div>
                <div className="text-slate-300">{projectData.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-white">Rooms</CardTitle>
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
            <CardTitle className="text-lg text-white">Sections Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {rooms.map((room: any, idx) => {
              const req = requirements[room.id] || {};
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
                            <div className="font-medium text-white">{s.name || 'Section'}</div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-300">
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
                            <div className="mt-2 text-xs text-slate-300">Appliances: {s.appliancesSummary}</div>
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
          <Button className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700" onClick={handleFinalSave}>Final Save to History</Button>
        </div>
      </div>
    </div>
  );
}

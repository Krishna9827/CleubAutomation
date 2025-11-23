import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, Calendar, Lightbulb, Fan, Thermometer, Settings, Download, CheckCircle, Zap, Package } from 'lucide-react';
import { generatePDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ProjectData {
  projectName: string;
  clientName: string;
  architectName: string;
  designerName: string;
  notes: string;
}

interface Appliance {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  wattage?: number;
  specifications: Record<string, any>;
  panelType?: string;
  moduleChannels?: number;
  channelConfig?: any[];
}

interface Room {
  id: string;
  name: string;
  type: string;
  appliances: Appliance[];
  requirements?: any;
}

interface ProjectSummaryProps {
  open: boolean;
  onClose: () => void;
  projectData: ProjectData;
  rooms: Room[];
}

const ProjectSummary = ({ open, onClose, projectData, rooms }: ProjectSummaryProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lights':
        return <Lightbulb className="w-5 h-5" />;
      case 'Fans':
        return <Fan className="w-5 h-5" />;
      case 'HVAC':
        return <Thermometer className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'Lights':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700/30';
      case 'Fans':
        return 'bg-blue-900/20 text-blue-400 border-blue-700/30';
      case 'HVAC':
        return 'bg-red-900/20 text-red-400 border-red-700/30';
      case 'Smart Devices':
        return 'bg-purple-900/20 text-purple-400 border-purple-700/30';
      case 'Curtain & Blinds':
        return 'bg-green-900/20 text-green-400 border-green-700/30';
      case 'Security':
        return 'bg-orange-900/20 text-orange-400 border-orange-700/30';
      case 'Touch Panels':
        return 'bg-indigo-900/20 text-indigo-400 border-indigo-700/30';
      case 'Retrofit Relays':
        return 'bg-cyan-900/20 text-cyan-400 border-cyan-700/30';
      default:
        return 'bg-slate-900/20 text-slate-400 border-slate-700/30';
    }
  };

  // Calculate totals from actual appliances
  const totalsByCategory = rooms.reduce((acc, room) => {
    if (room.appliances && Array.isArray(room.appliances)) {
      room.appliances.forEach(appliance => {
        if (!acc[appliance.category]) {
          acc[appliance.category] = { count: 0, totalWattage: 0, items: [] };
        }
        acc[appliance.category].count += appliance.quantity || 0;
        acc[appliance.category].totalWattage += ((appliance.wattage || 0) * (appliance.quantity || 0));
        acc[appliance.category].items.push(appliance);
      });
    }
    return acc;
  }, {} as Record<string, { count: number; totalWattage: number; items: Appliance[] }>);

  const totalAppliances = Object.values(totalsByCategory).reduce((sum, cat) => sum + cat.count, 0);
  const totalWattage = Object.values(totalsByCategory).reduce((sum, cat) => sum + cat.totalWattage, 0);
  const totalRooms = rooms.length;

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await generatePDF(projectData, rooms);
      toast({
        title: '✅ Success',
        description: 'Project summary exported as PDF successfully'
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: '❌ Export Failed',
        description: 'Failed to export PDF. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl bg-gradient-to-br from-slate-950 via-slate-900 to-black border-white/10 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-teal-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white">
                Project Summary
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                disabled={isExporting}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Project Header Info */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-teal-400">
                <Building2 className="w-5 h-5" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Project Name</p>
                  <p className="text-lg font-semibold text-white mt-1">{projectData.projectName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Client Name</p>
                  <p className="text-lg font-semibold text-white mt-1">{projectData.clientName}</p>
                </div>
                {projectData.architectName && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Architect</p>
                    <p className="text-lg font-semibold text-white mt-1">{projectData.architectName}</p>
                  </div>
                )}
                {projectData.designerName && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide">Interior Designer</p>
                    <p className="text-lg font-semibold text-white mt-1">{projectData.designerName}</p>
                  </div>
                )}
              </div>
              <Separator className="my-4 bg-white/10" />
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-teal-400" />
                Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-white/10 bg-gradient-to-br from-teal-900/20 to-teal-900/10 backdrop-blur-sm hover:border-teal-500/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-300">Total Rooms</p>
                    <p className="text-3xl font-bold text-teal-400 mt-2">{totalRooms}</p>
                  </div>
                  <Building2 className="w-12 h-12 text-teal-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-blue-900/20 to-blue-900/10 backdrop-blur-sm hover:border-blue-500/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300">Total Appliances</p>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{totalAppliances}</p>
                  </div>
                  <Package className="w-12 h-12 text-blue-500/20" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-gradient-to-br from-purple-900/20 to-purple-900/10 backdrop-blur-sm hover:border-purple-500/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300">Total Power</p>
                    <p className="text-3xl font-bold text-purple-400 mt-2">{totalWattage.toLocaleString()}W</p>
                  </div>
                  <Zap className="w-12 h-12 text-purple-500/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          {Object.keys(totalsByCategory).length > 0 && (
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-teal-400">Appliances by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(totalsByCategory).map(([category, data]) => (
                    <div
                      key={category}
                      className={`flex items-center justify-between p-4 rounded-lg border ${getCategoryColor(category)} bg-black/50`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                          {getCategoryIcon(category)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{category}</p>
                          <p className="text-xs text-slate-400">{data.items.length} type(s)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{data.count}</p>
                        {data.totalWattage > 0 && (
                          <p className="text-xs text-slate-400">{data.totalWattage}W total</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Room-wise Breakdown */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-teal-400">Room-wise Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rooms.map((room, roomIndex) => (
                  <div key={room.id}>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div>
                        <h4 className="text-lg font-bold text-white">{room.name}</h4>
                        <p className="text-sm text-slate-400 mt-1">{room.type} • {room.appliances?.length || 0} appliances</p>
                      </div>
                      <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                        {room.appliances?.length || 0} items
                      </Badge>
                    </div>

                    {room.appliances && room.appliances.length > 0 ? (
                      <div className="space-y-2 ml-2">
                        {room.appliances.map((appliance) => (
                          <div
                            key={appliance.id}
                            className="flex items-start justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={`p-1.5 rounded ${getCategoryColor(appliance.category)}`}>
                                  {getCategoryIcon(appliance.category)}
                                </div>
                                <div>
                                  <p className="font-semibold text-white">{appliance.name}</p>
                                  {appliance.subcategory && (
                                    <p className="text-xs text-slate-400">{appliance.subcategory}</p>
                                  )}
                                </div>
                              </div>
                              {appliance.specifications?.notes && (
                                <p className="text-xs text-slate-400 ml-10">{appliance.specifications.notes}</p>
                              )}
                              {appliance.panelType && (
                                <p className="text-xs text-slate-400 ml-10">Panel: {appliance.panelType} • {appliance.moduleChannels} channels</p>
                              )}
                            </div>
                            <div className="text-right ml-4 flex-shrink-0">
                              <Badge variant="outline" className="bg-teal-900/30 text-teal-300 border-teal-700/30 mb-2">
                                {appliance.category}
                              </Badge>
                              <p className="text-sm font-semibold text-white">Qty: {appliance.quantity}</p>
                              {appliance.wattage && (
                                <p className="text-xs text-slate-400">{appliance.wattage}W each</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic ml-2">No appliances added to this room</p>
                    )}

                    {roomIndex < rooms.length - 1 && <Separator className="mt-6 bg-white/10" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Project Notes */}
          {projectData.notes && (
            <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-teal-400">Project Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{projectData.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons Footer */}
          <div className="flex gap-3 pt-4 border-t border-white/10 sticky bottom-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
            <Button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting PDF...' : 'Export as PDF'}
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-semibold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirm & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSummary;

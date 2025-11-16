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
import { Building2, Calendar, User, Lightbulb, Fan, Thermometer, Settings, Download, Share } from 'lucide-react';
import { generatePDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';

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
}

interface Room {
  id: string;
  name: string;
  type: string;
  appliances: Appliance[];
}

interface ProjectSummaryProps {
  open: boolean;
  onClose: () => void;
  projectData: ProjectData;
  rooms: Room[];
}

const ProjectSummary = ({ open, onClose, projectData, rooms }: ProjectSummaryProps) => {
  const { toast } = useToast();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lights':
        return <Lightbulb className="w-4 h-4" />;
      case 'Fans':
        return <Fan className="w-4 h-4" />;
      case 'HVAC':
        return <Thermometer className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Lights':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Fans':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HVAC':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Smart Devices':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Curtain & Blinds':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Security':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Calculate totals
  const totalsByCategory = rooms.reduce((acc, room) => {
    room.appliances.forEach(appliance => {
      if (!acc[appliance.category]) {
        acc[appliance.category] = { count: 0, totalWattage: 0, items: [] };
      }
      acc[appliance.category].count += appliance.quantity;
      acc[appliance.category].totalWattage += (appliance.wattage || 0) * appliance.quantity;
      acc[appliance.category].items.push({
        ...appliance,
        roomName: room.name
      });
    });
    return acc;
  }, {} as Record<string, { count: number; totalWattage: number; items: any[] }>);

  const totalAppliances = Object.values(totalsByCategory).reduce((sum, cat) => sum + cat.count, 0);
  const totalWattage = Object.values(totalsByCategory).reduce((sum, cat) => sum + cat.totalWattage, 0);

  const handlePrint = () => {
    generatePDF(projectData, rooms);
    toast({
      title: "Export Started",
      description: "Your project summary is being prepared for download."
    });
  };

  const handleExport = () => {
    // Project data is automatically saved to Supabase in the planner
    // Generate PDF
    generatePDF(projectData, rooms);
    
    toast({
      title: "Project Exported",
      description: "Project summary PDF has been generated successfully."
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl bg-white border-slate-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-slate-900">
              Project Summary
            </DialogTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="border-slate-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="border-slate-300"
              >
                <Share className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Info */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg text-slate-800">
                <Building2 className="w-5 h-5 mr-2 text-teal-600" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Project Name</p>
                  <p className="font-semibold text-slate-900">{projectData.projectName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Client</p>
                  <p className="font-semibold text-slate-900">{projectData.clientName}</p>
                </div>
                {projectData.architectName && (
                  <div>
                    <p className="text-sm text-slate-600">Architect</p>
                    <p className="font-semibold text-slate-900">{projectData.architectName}</p>
                  </div>
                )}
                {projectData.designerName && (
                  <div>
                    <p className="text-sm text-slate-600">Interior Designer</p>
                    <p className="font-semibold text-slate-900">{projectData.designerName}</p>
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-slate-600 mt-4">
                <Calendar className="w-4 h-4 mr-2" />
                Generated on {new Date().toLocaleDateString()}
              </div>
            </CardContent>
          </Card>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-slate-200 bg-gradient-to-br from-teal-50 to-teal-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-teal-700">{rooms.length}</div>
                <div className="text-sm text-teal-600">Total Rooms</div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{totalAppliances}</div>
                <div className="text-sm text-blue-600">Total Appliances</div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-700">{totalWattage}W</div>
                <div className="text-sm text-purple-600">Total Power</div>
              </CardContent>
            </Card>
          </div>

          {/* Category Summary */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-800">Summary by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(totalsByCategory).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className={`${getCategoryColor(category)}`}>
                        {getCategoryIcon(category)}
                        <span className="ml-1">{category}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-slate-900">{data.count} items</div>
                      {data.totalWattage > 0 && (
                        <div className="text-sm text-slate-600">{data.totalWattage}W</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Room-wise Breakdown */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-800">Room-wise Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rooms.map((room, index) => (
                  <div key={room.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900">{room.name}</h4>
                        <p className="text-sm text-slate-600">{room.type}</p>
                      </div>
                      <Badge variant="outline" className="bg-white">
                        {room.appliances.length} items
                      </Badge>
                    </div>
                    
                    {room.appliances.length > 0 ? (
                      <div className="space-y-2">
                        {room.appliances.map((appliance) => (
                          <div key={appliance.id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-slate-900">{appliance.name}</span>
                                <Badge variant="outline" className={`text-xs ${getCategoryColor(appliance.category)}`}>
                                  {appliance.category}
                                </Badge>
                              </div>
                              {appliance.subcategory && (
                                <p className="text-xs text-slate-600 mt-1">{appliance.subcategory}</p>
                              )}
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-medium text-slate-900">Qty: {appliance.quantity}</div>
                              {appliance.wattage && (
                                <div className="text-slate-600">{appliance.wattage}W each</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No appliances added</p>
                    )}
                    
                    {index < rooms.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {projectData.notes && (
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-800">Project Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 whitespace-pre-wrap">{projectData.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectSummary;

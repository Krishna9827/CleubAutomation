import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Download, CheckCircle, MessageSquare } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { generatePDF } from '@/utils/pdfExport';
import { useToast } from '@/hooks/use-toast';
import { projectService } from '@/supabase/projectService';
import { editHistoryService } from '@/supabase/editHistoryService';
import { useAuth } from '@/contexts/AuthContext';
import { extractAppliancesFromRoom } from '@/utils/appliance-transformer';

interface ProjectData {
  id?: string;
  client_info?: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  rooms?: any[];
  status?: string;
  timeline?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProjectDetailsModalProps {
  open: boolean;
  onClose: () => void;
  projectData: ProjectData;
  isEditable?: boolean;
  onUpdate?: (data: any) => void;
}

const ProjectDetailsModal = ({
  open,
  onClose,
  projectData,
  isEditable = false,
  onUpdate
}: ProjectDetailsModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [editedStatus, setEditedStatus] = useState(projectData.status || 'draft');
  const [editedTimeline, setEditedTimeline] = useState(projectData.timeline || '');
  const [editedNotes, setEditedNotes] = useState(projectData.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleExportPDF = async () => {
    if (!projectData.rooms) return;

    try {
      const projectInfo = {
        projectName: projectData.client_info?.name || 'Project',
        clientName: projectData.client_info?.name || '',
        architectName: '',
        designerName: '',
        notes: projectData.notes || '',
      };

      await generatePDF(projectInfo, projectData.rooms);
      toast({
        title: '✅ Success',
        description: 'Project exported as PDF successfully'
      });
    } catch (error) {
      console.error('❌ Export failed:', error);
      toast({
        title: '❌ Export Failed',
        description: 'Failed to export PDF',
        variant: 'destructive'
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!projectData.id) {
      toast({
        title: 'Error',
        description: 'Project ID not found',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsUpdating(true);
      console.log('💾 Saving project details:', {
        status: editedStatus,
        timeline: editedTimeline,
        notes: editedNotes
      });

      const updateData = {
        status: editedStatus as 'draft' | 'in-progress' | 'completed',
        timeline: editedTimeline,
        notes: editedNotes,
      };

      await projectService.updateProject(projectData.id, updateData);

      console.log('✅ Project details saved successfully');

      // Save edit history snapshot if user is logged in
      if (user?.id) {
        const updatedProject = await projectService.getProject(projectData.id);
        if (updatedProject) {
          await editHistoryService.saveEditHistory(
            projectData.id,
            user.id,
            updatedProject,
            'other',
            `Project details updated - Status: ${editedStatus}, Timeline: ${editedTimeline || 'N/A'}`,
            ['status', 'timeline', 'notes']
          );
          console.log('✅ Edit history saved');
        }
      }

      toast({
        title: '✅ Success',
        description: 'Project details saved to Supabase',
        variant: 'default'
      });

      if (onUpdate) {
        onUpdate(updateData);
      }
    } catch (error) {
      console.error('❌ Save failed:', error);
      toast({
        title: '❌ Save Failed',
        description: `Failed to save project details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculate total appliances from both direct appliances and requirements
  const totalAppliances = projectData.rooms?.reduce((sum: number, room: any) => {
    // Count direct appliances
    const directCount = room.appliances?.reduce((roomSum: number, appliance: any) => 
      roomSum + (appliance.quantity || 1), 0) || 0;
    
    // Count requirement items (they are appliances too)
    const requirementsCount = room.requirements?.sections?.reduce((sectionSum: number, section: any) => 
      sectionSum + (section.items?.reduce((itemSum: number, item: any) => 
        itemSum + (item.quantity || 1), 0) || 0), 0) || 0;
    
    return sum + directCount + requirementsCount;
  }, 0) || 0;
  
  const totalRooms = projectData.rooms?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-950 via-slate-900 to-black border-white/10 max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-white text-2xl">Project Details</DialogTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export PDF
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

        <div className="space-y-6 text-white pt-4">
          {/* Project Name and Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Project Name</p>
              <p className="text-lg font-semibold text-white">{projectData.client_info?.name || 'Untitled'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Client Name</p>
              <p className="text-lg font-semibold text-white">{projectData.client_info?.name || 'N/A'}</p>
            </div>
          </div>

          {/* Stats Section - Total Rooms & Total Appliances */}
          {totalRooms > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-white/10 bg-gradient-to-br from-teal-900/20 to-teal-900/10 backdrop-blur-sm">
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

              <Card className="border-white/10 bg-gradient-to-br from-blue-900/20 to-blue-900/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-300">Total Appliances</p>
                      <p className="text-3xl font-bold text-blue-400 mt-2">{totalAppliances}</p>
                    </div>
                    <Building2 className="w-12 h-12 text-blue-500/20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Project Status & Timeline - Always Editable */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-teal-400">Project Status & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide block mb-2">Status</label>
                  <Select value={editedStatus} onValueChange={setEditedStatus}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wide block mb-2">Timeline (Months)</label>
                  <Select value={editedTimeline} onValueChange={setEditedTimeline}>
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="1">1 Month</SelectItem>
                      <SelectItem value="2">2 Months</SelectItem>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                      <SelectItem value="18">18 Months</SelectItem>
                      <SelectItem value="24">24 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Notes & Stage Reference - Always Editable */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-teal-400">
                  <MessageSquare className="w-5 h-5" />
                  Project Notes & Stage Reference
                </CardTitle>
                {editedNotes && (
                  <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                    Notes Added
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Add project notes, site stage references, or any additional information..."
                className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 p-3 focus:border-teal-500 focus:outline-none resize-none"
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSaveChanges}
            disabled={isUpdating}
            className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold"
          >
            {isUpdating ? 'Saving...' : '💾 Save Project Details'}
          </Button>

          {/* Client Information */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-teal-400">Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-slate-500">Name</div>
                  <div className="text-white font-semibold mt-1">{projectData.client_info?.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Email</div>
                  <div className="text-white font-semibold mt-1 break-all">{projectData.client_info?.email || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Phone</div>
                  <div className="text-white font-semibold mt-1">{projectData.client_info?.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-slate-500">Address</div>
                  <div className="text-white font-semibold mt-1">{projectData.client_info?.address || 'N/A'}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rooms Details */}
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-teal-400">Rooms Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {projectData.rooms?.length ? (
                  projectData.rooms.map((room: any, idx: number) => (
                    <div key={idx} className="bg-slate-800/30 p-4 rounded-lg border border-white/10">
                      <div className="font-semibold text-white mb-3">{room.name} <span className="text-xs text-slate-400">({room.type})</span></div>

                      {/* Appliances from direct appliances */}
                      {room.appliances && room.appliances.length > 0 && (
                        <div className="ml-2 text-xs space-y-2">
                          <div className="text-slate-400 font-medium">Direct Appliances:</div>
                          {room.appliances.map((app: any, aIdx: number) => (
                            <div key={aIdx} className="text-slate-300">
                              • {app.name} ({app.category}{app.subcategory ? ` - ${app.subcategory}` : ''}) × {app.quantity}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Appliances from Requirements Sections */}
                      {room.requirements?.sections && room.requirements.sections.length > 0 && (
                        <div className="ml-2 text-xs mt-3 space-y-2">
                          <div className="text-slate-400 font-medium">Switch Panels & Items:</div>
                          {room.requirements.sections.map((section: any, sIdx: number) => (
                            <div key={sIdx} className="ml-2 space-y-1">
                              <div className="text-teal-300 font-medium">{section.name}</div>
                              {section.items?.map((item: any, iIdx: number) => (
                                <div key={iIdx} className="text-slate-300">
                                  • {item.type} ({item.category}) × {item.quantity} {item.voltage ? `@ ${item.voltage}` : ''}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Other Requirements */}
                      {room.requirements && (
                        <div className="ml-2 text-xs mt-3 space-y-1">
                          <div className="text-slate-400 font-medium">Other Requirements:</div>
                          <div className="text-slate-300 space-y-1">
                            {room.requirements.numLights && <div>• Lights: {room.requirements.numLights}</div>}
                            {room.requirements.totalWattage && <div>• Total Wattage: {room.requirements.totalWattage}</div>}
                            {room.requirements.fanType && <div>• Fan: {room.requirements.fanType}</div>}
                            {room.requirements.acTvControl && <div>• AC/TV Control: {room.requirements.acTvControl}</div>}
                            {room.requirements.smartLighting && <div>• Smart Lighting: {room.requirements.smartLighting}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-sm">No rooms added yet</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;

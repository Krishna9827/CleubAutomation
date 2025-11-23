import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, Eye, Trash2, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { editHistoryService, EditHistoryEntry } from '@/supabase/editHistoryService';
import { projectService } from '@/supabase/projectService';

const AdminProjectTimeline = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [history, setHistory] = useState<EditHistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<EditHistoryEntry | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selectedCompare, setSelectedCompare] = useState<EditHistoryEntry | null>(null);

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin-login');
    }
  }, [user, loading, navigate]);

  // Load project and history
  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      try {
        setLoadingHistory(true);

        // Load current project
        const proj = await projectService.getProject(projectId);
        setProject(proj);

        // Load edit history
        const hist = await editHistoryService.getProjectHistory(projectId);
        setHistory(hist);

        console.log('✅ Loaded project and history:', hist.length, 'entries');
      } catch (error) {
        console.error('❌ Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project history',
          variant: 'destructive',
        });
      } finally {
        setLoadingHistory(false);
      }
    };

    loadData();
  }, [projectId, toast]);

  const handleRestore = async (entry: EditHistoryEntry) => {
    if (!projectId || !user?.id) return;

    if (!confirm(`Restore project to version from ${new Date(entry.created_at!).toLocaleString()}?`)) {
      return;
    }

    setIsRestoring(true);
    try {
      const success = await editHistoryService.restoreFromHistory(
        projectId,
        entry.id!,
        user.id,
        true
      );

      if (success) {
        toast({
          title: 'Success',
          description: 'Project restored successfully',
        });

        // Reload history
        const hist = await editHistoryService.getProjectHistory(projectId);
        setHistory(hist);
        setSelectedEntry(null);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to restore project',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error restoring:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while restoring',
        variant: 'destructive',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const getChangeIcon = (changeType?: string) => {
    switch (changeType) {
      case 'appliance_added':
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'appliance_removed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'status_changed':
        return <Badge className="text-xs bg-teal-600 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getApplianceCount = (rooms: any[] = []) => {
    return rooms.reduce((sum, room) => sum + (room.appliances?.length || 0), 0);
  };

  if (loading || loadingHistory) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Clock className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/projects')}
            className="border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Project Timeline</h1>
            <p className="text-slate-400 mt-1">
              {project?.client_info?.name || 'Untitled'} - {history.length} edits
            </p>
          </div>
        </div>

        {/* Current Project Info */}
        {project && (
          <Card className="border-teal-500/20 bg-teal-900/10">
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-slate-400">Rooms</div>
                  <div className="text-2xl font-bold text-white">{project.rooms?.length || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Appliances</div>
                  <div className="text-2xl font-bold text-teal-400">{getApplianceCount(project.rooms)}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Total Cost</div>
                  <div className="text-2xl font-bold text-white">
                    ₹{project.total_cost?.toLocaleString() || '0'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">Status</div>
                  <Badge
                    className={`${
                      project.status === 'completed'
                        ? 'bg-green-900/30 border-green-600 text-green-400'
                        : project.status === 'in-progress'
                        ? 'bg-blue-900/30 border-blue-600 text-blue-400'
                        : 'bg-slate-800/30 border-slate-600 text-slate-400'
                    }`}
                    variant="outline"
                  >
                    {project.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline and Details */}
        <div className="grid grid-cols-3 gap-6">
          {/* Timeline */}
          <div className="col-span-2">
            <Card className="border-white/10 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Edit History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {history.length === 0 ? (
                    <div className="text-slate-400 text-center py-8">No edit history available</div>
                  ) : (
                    history.map((entry, idx) => (
                      <div
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedEntry?.id === entry.id
                            ? 'border-teal-600 bg-teal-900/20'
                            : 'border-white/10 bg-slate-800/30 hover:border-teal-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getChangeIcon(entry.change_type)}
                              <div className="text-sm text-slate-300">
                                {entry.change_summary || `Edit #${history.length - idx}`}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatDate(entry.created_at!)}
                            </div>
                            {entry.edited_by_admin && (
                              <Badge className="mt-2 bg-orange-900/30 border-orange-600 text-orange-400 text-xs" variant="outline">
                                Admin Edit
                              </Badge>
                            )}
                          </div>
                          <Badge className="bg-slate-700 text-slate-300">#{history.length - idx}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details and Actions */}
          <div className="space-y-4">
            {selectedEntry && (
              <>
                {/* Entry Details */}
                <Card className="border-white/10 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Version Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <div className="text-slate-500">Date</div>
                      <div className="text-white mt-1">{formatDate(selectedEntry.created_at!)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Change Type</div>
                      <div className="text-white mt-1 capitalize">{selectedEntry.change_type || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Rooms</div>
                      <div className="text-white mt-1">{selectedEntry.rooms?.length || 0}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Appliances</div>
                      <div className="text-teal-400 font-semibold mt-1">{getApplianceCount(selectedEntry.rooms)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Total Cost</div>
                      <div className="text-white mt-1">₹{selectedEntry.total_cost?.toLocaleString() || '0'}</div>
                    </div>
                    {selectedEntry.change_summary && (
                      <div>
                        <div className="text-slate-500">Summary</div>
                        <div className="text-white mt-1 text-xs">{selectedEntry.change_summary}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Details
                  </Button>
                  <Button
                    onClick={() => handleRestore(selectedEntry)}
                    disabled={isRestoring}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    {isRestoring ? 'Restoring...' : 'Restore This Version'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && selectedEntry && (
          <Card className="border-white/10 bg-slate-900/50">
            <CardHeader>
              <CardTitle className="text-white">Version Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-96 overflow-y-auto">
              {/* Client Info */}
              <div>
                <h4 className="font-semibold text-teal-400 mb-2">Client Information</h4>
                <div className="bg-black/40 p-3 rounded text-sm text-slate-300 space-y-1">
                  <div>Name: {selectedEntry.client_info?.name || 'N/A'}</div>
                  <div>Email: {selectedEntry.client_info?.email || 'N/A'}</div>
                  <div>Phone: {selectedEntry.client_info?.phone || 'N/A'}</div>
                </div>
              </div>

              {/* Rooms */}
              <div>
                <h4 className="font-semibold text-teal-400 mb-2">
                  Rooms ({selectedEntry.rooms?.length || 0})
                </h4>
                <div className="space-y-2">
                  {selectedEntry.rooms?.slice(0, 5).map((room: any, idx: number) => (
                    <div key={idx} className="bg-black/40 p-2 rounded text-xs text-slate-300">
                      <div className="font-semibold">{room.name}</div>
                      <div className="text-slate-500">
                        {room.appliances?.length || 0} appliances, Type: {room.type}
                      </div>
                    </div>
                  ))}
                  {selectedEntry.rooms && selectedEntry.rooms.length > 5 && (
                    <div className="text-slate-500 text-xs">
                      +{selectedEntry.rooms.length - 5} more rooms
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProjectTimeline;

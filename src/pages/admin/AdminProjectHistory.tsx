import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Trash2, Eye, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AdminTable, ColumnDef, ActionButton } from '@/components/admin/AdminTable';
import { projectService, ProjectData } from '@/supabase/projectService';
import { userService, UserProfile } from '@/supabase/userService';

interface ProjectWithUser extends ProjectData {
  user_email?: string;
  user_name?: string;
}

const AdminProjectHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithUser | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Check if user is logged in, if not redirect to admin login
  useEffect(() => {
    if (!loading && !user) {
      console.log('⚠️ User not logged in, redirecting to admin login');
      navigate('/admin-login');
    }
  }, [user, loading, navigate]);

  // Load all projects from Supabase
  useEffect(() => {
    if (!user) {
      console.log('⏳ Waiting for user authentication...');
      return;
    }

    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        
        console.log('✅ Current user:', user.email);
        
        // Fetch all projects from Supabase
        const allProjects = await projectService.getAllProjects();
        console.log('✅ Loaded projects from Supabase:', allProjects.length);
        
        // Fetch user profiles for each project to enrich data
        const projectsWithUsers = await Promise.all(
          allProjects.map(async (project) => {
            if (project.user_id) {
              const userProfile = await userService.getUserProfile(project.user_id);
              return {
                ...project,
                user_email: userProfile?.email,
                user_name: userProfile ? `${userProfile.first_name} ${userProfile.last_name}`.trim() : undefined,
              };
            }
            return project;
          })
        );
        
        setProjects(projectsWithUsers);
      } catch (error) {
        console.error('❌ Error loading projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects from Supabase',
          variant: 'destructive'
        });
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [user, toast]);

  const deleteProject = async (project: ProjectWithUser) => {
    if (!confirm(`Are you sure you want to delete project for "${project.client_info.name}"?`)) return;

    try {
      await projectService.deleteProject(project.id);
      const updated = projects.filter(p => p.id !== project.id);
      setProjects(updated);
      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
    }
  };

  const updateProjectStatus = async (project: ProjectWithUser, newStatus: 'draft' | 'in-progress' | 'completed') => {
    try {
      await projectService.updateProject(project.id, { status: newStatus });
      const updated = projects.map(p => p.id === project.id ? { ...p, status: newStatus } : p);
      setProjects(updated);
      toast({
        title: 'Success',
        description: 'Project status updated'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const handleViewDetails = (project: ProjectWithUser) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  // Define table columns
  const columns: ColumnDef<ProjectWithUser>[] = [
    {
      header: 'Client Name',
      accessor: 'client_info',
      cell: (row) => (
        <div>
          <div className="font-semibold">{row.client_info.name || 'N/A'}</div>
          <div className="text-xs text-slate-400">{row.client_info.email}</div>
        </div>
      ),
      sortable: true,
      searchable: true,
    },
    {
      header: 'Property Type',
      accessor: 'property_details',
      cell: (row) => (
        <div>
          <div className="font-semibold capitalize">{row.property_details.type || 'N/A'}</div>
          <div className="text-xs text-slate-400">{row.property_details.size} sq ft</div>
        </div>
      ),
    },
    {
      header: 'Created By',
      accessor: 'user_name',
      cell: (row) => (
        <div>
          <div className="font-semibold">{row.user_name || 'Unknown'}</div>
          <div className="text-xs text-slate-400">{row.user_email}</div>
        </div>
      ),
      searchable: true,
    },
    {
      header: 'Rooms',
      accessor: 'rooms',
      cell: (row) => (
        <Badge variant="outline" className="bg-slate-800/30 border-slate-700">
          {row.rooms.length} rooms
        </Badge>
      ),
    },
    {
      header: 'Total Cost',
      accessor: 'total_cost',
      cell: (row) => (
        <div className="font-semibold text-teal-400">
          ₹{row.total_cost.toLocaleString('en-IN')}
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <select
          value={row.status}
          onChange={(e) => updateProjectStatus(row, e.target.value as 'draft' | 'in-progress' | 'completed')}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-2 py-1 cursor-pointer hover:border-teal-600"
        >
          <option value="draft">Draft</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      ),
      sortable: true,
    },
    {
      header: 'Created',
      accessor: 'created_at',
      cell: (row) => (
        <div className="text-sm">
          {new Date(row.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      ),
      sortable: true,
    },
  ];

  // Define table actions
  const actions: ActionButton<ProjectWithUser>[] = [
    {
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleViewDetails,
      variant: 'ghost',
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: deleteProject,
      variant: 'ghost',
      className: 'text-red-500 hover:text-red-400 hover:bg-red-500/10',
    },
  ];

  // Search keys for the table
  const searchKeys: (keyof ProjectWithUser)[] = ['user_email', 'user_name'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h1 className="text-xl font-bold text-white">Project History</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {loading ? (
          <div className="text-center text-slate-400 py-12">Checking authentication...</div>
        ) : (
          <>
            {/* Projects Table */}
            <AdminTable<ProjectWithUser>
              data={projects}
              columns={columns}
              actions={actions}
              searchKeys={searchKeys}
              searchPlaceholder="Search by client name, email, or user..."
              loading={loadingProjects}
              emptyMessage="No projects found"
              itemsPerPage={15}
            />

            {/* Project Details Modal */}
            {selectedProject && (
              <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-950 border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white text-2xl">Project Details</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-white">
                    {/* Project Overview */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-lg">
                      <div>
                        <div className="text-sm text-slate-500 mb-1">Status</div>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${selectedProject.status === 'completed' ? 'bg-green-900/30 border-green-600 text-green-400' : ''}
                            ${selectedProject.status === 'in-progress' ? 'bg-blue-900/30 border-blue-600 text-blue-400' : ''}
                            ${selectedProject.status === 'draft' ? 'bg-slate-800/30 border-slate-600 text-slate-400' : ''}
                          `}
                        >
                          {selectedProject.status}
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500 mb-1">Total Cost</div>
                        <div className="font-bold text-xl text-teal-400">
                          ₹{selectedProject.total_cost.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    {/* Client Information */}
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Client Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 mb-1">Name</div>
                          <div className="font-medium">{selectedProject.client_info.name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Email</div>
                          <div className="font-medium break-all">{selectedProject.client_info.email || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Phone</div>
                          <div className="font-medium">{selectedProject.client_info.phone || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Address</div>
                          <div className="font-medium">{selectedProject.client_info.address || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Property Details */}
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="font-semibold text-lg mb-3">Property Details</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 mb-1">Type</div>
                          <div className="font-medium capitalize">{selectedProject.property_details.type || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Size</div>
                          <div className="font-medium">{selectedProject.property_details.size} sq ft</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Budget</div>
                          <div className="font-medium">₹{selectedProject.property_details.budget.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    </div>

                    {/* Created By */}
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="font-semibold text-lg mb-3">Created By</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-slate-500 mb-1">User Name</div>
                          <div className="font-medium">{selectedProject.user_name || 'Unknown'}</div>
                        </div>
                        <div>
                          <div className="text-slate-500 mb-1">Email</div>
                          <div className="font-medium">{selectedProject.user_email || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Rooms */}
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="font-semibold text-lg mb-3">
                        Rooms ({selectedProject.rooms.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedProject.rooms.length > 0 ? (
                          selectedProject.rooms.map((room: any, idx: number) => (
                            <div key={idx} className="text-sm bg-slate-800/30 p-3 rounded border border-white/5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-semibold">{room.name}</div>
                                  <div className="text-slate-400 text-xs mt-1">
                                    Type: {room.type || 'N/A'}
                                  </div>
                                </div>
                                <Badge variant="outline" className="bg-slate-900/50 border-slate-700">
                                  {room.appliances?.length || 0} appliances
                                </Badge>
                              </div>
                              {room.appliances && room.appliances.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-white/10">
                                  <div className="text-xs text-slate-500 mb-1">Appliances:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {room.appliances.slice(0, 5).map((app: any, i: number) => (
                                      <span key={i} className="text-xs bg-slate-900/50 px-2 py-0.5 rounded">
                                        {app.name}
                                      </span>
                                    ))}
                                    {room.appliances.length > 5 && (
                                      <span className="text-xs text-slate-400">
                                        +{room.appliances.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-400 text-sm text-center py-4">No rooms added yet</div>
                        )}
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="border-t border-white/10 pt-4 text-sm text-slate-400">
                      <div className="flex justify-between">
                        <div>
                          <span className="text-slate-500">Created:</span>{' '}
                          {new Date(selectedProject.created_at).toLocaleString('en-IN')}
                        </div>
                        <div>
                          <span className="text-slate-500">Updated:</span>{' '}
                          {new Date(selectedProject.updated_at).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminProjectHistory;

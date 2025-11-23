import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Eye, FileText, Edit, Copy, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminTable, ColumnDef, ActionButton } from '@/components/admin/AdminTable';
import { projectService, ProjectData } from '@/supabase/projectService';
import { userService, UserProfile } from '@/supabase/userService';
import { ProjectDetailsModal } from '@/components/features';
import { editHistoryService } from '@/supabase/editHistoryService';

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
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

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

  const handleEditProject = (project: ProjectWithUser) => {
    // Navigate to edit form
    navigate(`/admin/projects/${project.id}/edit`);
  };

  const handleDuplicateProject = async (project: ProjectWithUser) => {
    if (!user?.id) return;

    setDuplicatingId(project.id);
    try {
      const duplicated = await editHistoryService.duplicateProject(project.id, user.id);

      if (duplicated) {
        toast({
          title: 'Success',
          description: 'Project duplicated successfully. Reloading...',
        });

        // Reload projects
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to duplicate project',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error duplicating:', error);
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleViewTimeline = (project: ProjectWithUser) => {
    navigate(`/admin/projects/${project.id}/timeline`);
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
      label: 'Edit Project',
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEditProject,
      variant: 'ghost',
      className: 'text-teal-500 hover:text-teal-400 hover:bg-teal-500/10',
    },
    {
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      onClick: handleDuplicateProject,
      variant: 'ghost',
      className: 'text-blue-500 hover:text-blue-400 hover:bg-blue-500/10',
    },
    {
      label: 'Timeline',
      icon: <Clock className="w-4 h-4" />,
      onClick: handleViewTimeline,
      variant: 'ghost',
      className: 'text-purple-500 hover:text-purple-400 hover:bg-purple-500/10',
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
    <AdminLayout>
      <div>
        {/* Loading State */}
        {loading ? (
          <div className="text-center text-slate-400 py-12">Checking authentication...</div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-6">Project History</h2>

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
              <ProjectDetailsModal
                open={showDetails}
                onClose={() => setShowDetails(false)}
                projectData={selectedProject}
                onUpdate={(data) => {
                  // Update local state with new data
                  const updated = projects.map(p =>
                    p.id === selectedProject.id
                      ? { ...p, ...data }
                      : p
                  );
                  setProjects(updated);
                }}
              />
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProjectHistory;

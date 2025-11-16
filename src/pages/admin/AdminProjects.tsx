import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/admin/AdminLayout';
import { AdminTable, ColumnDef, ActionButton } from '@/components/admin/AdminTable';
import { projectService, ProjectData } from '@/supabase/projectService';
import { userService } from '@/supabase/userService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/supabase/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProjectWithUser extends ProjectData {
  user_email?: string;
  user_name?: string;
}

const AdminProjects = () => {
  const [projects, setProjects] = useState<ProjectWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithUser | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const realtimeChannelRef = useRef<any>(null);

  // Load projects with realtime
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const data = await projectService.getAllProjects();
        console.log('✅ Loaded projects:', data.length);

        // Fetch user emails for each project
        const projectsWithUsers = await Promise.all(
          data.map(async (project) => {
            try {
              const user = await userService.getUserProfile(project.user_id);
              return {
                ...project,
                user_email: user?.email,
                user_name: `${user?.first_name} ${user?.last_name}`.trim(),
              };
            } catch {
              return project;
            }
          })
        );

        setProjects(projectsWithUsers);
      } catch (error) {
        console.error('❌ Error loading projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProjects();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('projects-admin')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        (payload: any) => {
          console.log('📁 Project change detected:', payload.eventType);
          if (payload.eventType === 'DELETE') {
            setProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
  }, [toast]);

  const handleDelete = async (project: ProjectWithUser) => {
    if (!confirm('Are you sure? This cannot be undone.')) return;
    try {
      await projectService.deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast({ title: 'Success', description: 'Project deleted' });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
    }
  };

  const columns: ColumnDef<ProjectWithUser>[] = [
    {
      header: 'Client Name',
      accessor: (row) => row.client_info?.name || 'N/A',
      searchable: true,
    },
    {
      header: 'Email',
      accessor: (row) => row.client_info?.email || 'N/A',
      searchable: true,
    },
    {
      header: 'Property Type',
      accessor: (row) => row.property_details?.type || 'N/A',
    },
    {
      header: 'Rooms',
      accessor: (row) => (row.rooms?.length || 0),
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge
          className={
            row.status === 'completed'
              ? 'bg-emerald-600'
              : row.status === 'in-progress'
              ? 'bg-blue-600'
              : 'bg-slate-600'
          }
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Created',
      accessor: 'created_at',
      cell: (row) => new Date(row.created_at).toLocaleDateString(),
    },
  ];

  const actions: ActionButton<ProjectWithUser>[] = [
    {
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: (project) => {
        setSelectedProject(project);
        setShowDetails(true);
      },
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'destructive',
    },
  ];

  const searchKeys: (keyof ProjectWithUser)[] = ['user_email', 'status'];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-teal-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Projects</h1>
            <p className="text-slate-400">Manage home automation projects</p>
          </div>
        </div>

        <AdminTable<ProjectWithUser>
          data={projects}
          columns={columns}
          actions={actions}
          searchKeys={searchKeys}
          searchPlaceholder="Search by client email or status..."
          loading={loading}
          emptyMessage="No projects yet"
          itemsPerPage={15}
        />

        {selectedProject && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-950 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white text-2xl">Project Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 text-sm">Client</p>
                    <p className="font-semibold">{selectedProject.client_info?.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Email</p>
                    <p className="font-semibold">{selectedProject.client_info?.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Status</p>
                    <Badge className="mt-1">{selectedProject.status}</Badge>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Rooms</p>
                    <p className="font-semibold">{selectedProject.rooms?.length || 0}</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProjects;

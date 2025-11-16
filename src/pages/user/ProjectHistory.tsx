import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, ArrowLeft, Calendar, Home, Trash2, Eye, Search, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { projectService, ProjectData } from '@/supabase/projectService';

interface LocalProjectData {
  id: string;
  user_id: string;
  client_info: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  rooms?: any[];
  total_cost?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

const UserHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [projects, setProjects] = useState<LocalProjectData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<LocalProjectData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load user's projects from Supabase
  useEffect(() => {
    const loadUserProjects = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const projectsList = await projectService.getUserProjects(user.id);
        const formattedProjects = projectsList as LocalProjectData[];
        setProjects(formattedProjects);
        setFilteredProjects(formattedProjects);
      } catch (error) {
        console.error('❌ Error loading projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your projects',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProjects();
  }, [user?.id, toast]);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProjects(projects.filter(p =>
        p.client_info?.name?.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, projects]);

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await projectService.deleteProject(projectId);
      const updated = projects.filter(p => p.id !== projectId);
      setProjects(updated);
      setFilteredProjects(updated);
      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('❌ Delete failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
    }
  };

  const continueProject = (project: LocalProjectData) => {
    // Save project data to localStorage for editing
    localStorage.setItem('projectId', project.id);
    localStorage.setItem('projectData', JSON.stringify({
      projectName: project.client_info?.name || 'Untitled',
      clientName: project.client_info?.name || '',
      clientEmail: project.client_info?.email || '',
      clientPhone: project.client_info?.phone || '',
      clientAddress: project.client_info?.address || '',
    }));
    navigate('/room-selection');
  };

  const handleViewDetails = (project: LocalProjectData) => {
    setSelectedProject(project as any);
    setShowDetails(true);
  };

  const getRoomCount = (rooms: any[]) => rooms?.length || 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h1 className="text-xl font-bold text-white">My Projects</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300">{user.email}</span>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/30 text-red-500 hover:bg-red-500/10"
              onClick={async () => {
                await logout();
                navigate('/');
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Create New */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Search your projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
          <Button 
            onClick={() => navigate('/project-planning')}
            className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          >
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="text-slate-500 text-sm">Total Projects</div>
              <div className="text-3xl font-bold text-white">{projects.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="text-slate-500 text-sm">Active Projects</div>
              <div className="text-3xl font-bold text-teal-400">{projects.filter(p => p.status !== 'completed' && p.status !== 'archived').length}</div>
            </CardContent>
          </Card>
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="text-slate-500 text-sm">Total Investment</div>
              <div className="text-3xl font-bold text-white">₹{projects.reduce((sum, p) => sum + (p.total_cost || 0), 0).toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading your projects...</div>
        ) : filteredProjects.length === 0 ? (
          <Card className="bg-black/40 backdrop-blur-sm border-white/10">
            <CardContent className="p-12 text-center">
              <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <div className="text-slate-400">No projects yet</div>
              <Button 
                onClick={() => navigate('/project-planning')}
                className="mt-4 bg-teal-600 hover:bg-teal-700"
              >
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredProjects.map(project => (
              <Card key={project.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-teal-600/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{project.client_info?.name || 'Untitled Project'}</h3>
                      <p className="text-sm text-slate-400">Client: {project.client_info?.name || 'N/A'}</p>
                    </div>
                    <Badge variant="outline" className={`${
                      project.status === 'completed' ? 'bg-green-900/30 border-green-600 text-green-400' :
                      project.status === 'in-progress' ? 'bg-teal-900/30 border-teal-600 text-teal-400' :
                      'bg-slate-700/30 border-slate-600 text-slate-400'
                    }`}>
                      {project.status || 'draft'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-500">Rooms</div>
                      <div className="text-white font-semibold">{getRoomCount(project.rooms)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Total Cost</div>
                      <div className="text-white font-semibold">₹{project.total_cost?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Created</div>
                      <div className="text-white text-xs">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Updated</div>
                      <div className="text-white text-xs">{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => continueProject(project)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      Continue Project
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(project)}
                      className="border-slate-600 text-slate-300 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-600/30 text-red-500 hover:bg-red-500/10"
                      onClick={() => deleteProject(project.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogContent className="max-w-2xl bg-slate-950 border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Project Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-slate-500">Project Name</div>
                    <div className="font-semibold">{selectedProject.client_info?.name || 'Untitled'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Status</div>
                    <Badge variant="outline">{selectedProject.status || 'draft'}</Badge>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-semibold mb-2">Client Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Name</div>
                      <div>{selectedProject.client_info?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Email</div>
                      <div className="break-all">{selectedProject.client_info?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Phone</div>
                      <div>{selectedProject.client_info?.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Address</div>
                      <div>{selectedProject.client_info?.address || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-semibold mb-2">Rooms ({getRoomCount(selectedProject.rooms)})</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedProject.rooms?.length ? (
                      selectedProject.rooms.map((room: any, idx: number) => (
                        <div key={idx} className="text-sm bg-slate-800/30 p-2 rounded">
                          <div className="font-semibold">{room.name}</div>
                          <div className="text-slate-400">{room.appliances?.length || 0} appliances</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 text-sm">No rooms added yet</div>
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default UserHistory;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, ArrowLeft, Calendar, User, Home, Trash2, Eye, Edit, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '@/firebase/config';

interface ProjectData {
  id: string;
  userId: string;
  projectName: string;
  clientInfo?: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  rooms?: any[];
  totalCost?: number;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface UserData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  state: string;
}

const AdminProjectHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [userMap, setUserMap] = useState<Record<string, UserData>>({});
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Check if user is logged in, if not redirect to admin login
  useEffect(() => {
    if (!loading && !user) {
      console.log('⚠️ User not logged in, redirecting to admin login');
      navigate('/admin-login');
    }
  }, [user, loading, navigate]);

  // Load all projects from Firebase
  useEffect(() => {
    if (!user) {
      console.log('⏳ Waiting for user authentication...');
      return;
    }

    const loadProjects = async () => {
      try {
        setLoadingProjects(true);
        
        // Debug: Check current user auth state
        console.log('✅ Current user:', user.email);
        console.log('✅ User UID:', user.uid);
        const tokenResult = await user.getIdTokenResult();
        console.log('✅ User token claims:', tokenResult.claims);
        
        const projectsCol = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsCol);
        const projectsList = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as ProjectData));
        
        console.log('✅ Loaded projects from Firebase:', projectsList.length);
        setProjects(projectsList);
        setFilteredProjects(projectsList);

        // Load user data for all projects
        const usersCol = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCol);
        const users: Record<string, UserData> = {};
        usersSnapshot.docs.forEach(doc => {
          users[doc.id] = { uid: doc.id, ...doc.data() } as UserData;
        });
        setUserMap(users);
      } catch (error) {
        console.error('❌ Error loading projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load projects from Firebase',
          variant: 'destructive'
        });
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, [user, toast]);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProjects(projects);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProjects(projects.filter(p =>
        p.projectName?.toLowerCase().includes(term) ||
        p.clientInfo?.name?.toLowerCase().includes(term) ||
        p.clientInfo?.email?.toLowerCase().includes(term) ||
        userMap[p.userId]?.email?.toLowerCase().includes(term)
      ));
    }
  }, [searchTerm, projects, userMap]);

  const deleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await deleteDoc(doc(db, 'projects', projectId));
      const updated = projects.filter(p => p.id !== projectId);
      setProjects(updated);
      setFilteredProjects(updated);
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

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), { status: newStatus });
      const updated = projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p);
      setProjects(updated);
      setFilteredProjects(updated);
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

  const handleViewDetails = (project: ProjectData) => {
    setSelectedProject(project);
    setShowDetails(true);
  };

  const getUserDisplayName = (userId: string) => {
    const user = userMap[userId];
    if (!user) return 'Unknown User';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  const getRoomCount = (rooms: any[]) => rooms?.length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-800 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
            <h1 className="text-xl font-bold text-white">Project History</h1>
          </div>
          <Badge variant="outline" className="bg-teal-900/30 border-teal-600 text-teal-400">
            {filteredProjects.length} Projects
          </Badge>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6 flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <Input
              placeholder="Search by project name, client name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        </div>

        {/* Projects Table */}
        {loading ? (
          <div className="text-center text-slate-400 py-12">Checking authentication...</div>
        ) : loadingProjects ? (
          <div className="text-center text-slate-400 py-12">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center text-slate-400 py-12">No projects found</div>
        ) : (
          <div className="grid gap-6">
            {filteredProjects.map(project => (
              <Card key={project.id} className="bg-black/40 backdrop-blur-sm border-white/10 hover:border-teal-600/30 transition-all">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Project Info */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1">PROJECT NAME</div>
                      <div className="text-white font-semibold truncate">{project.projectName}</div>
                    </div>

                    {/* Client Info */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1">CLIENT</div>
                      <div className="text-white font-semibold truncate">{project.clientInfo?.name || 'N/A'}</div>
                      <div className="text-xs text-slate-400 truncate">{project.clientInfo?.email}</div>
                    </div>

                    {/* Created By (User) */}
                    <div>
                      <div className="text-xs text-slate-500 mb-1">CREATED BY</div>
                      <div className="text-white font-semibold truncate">{getUserDisplayName(project.userId)}</div>
                      <div className="text-xs text-slate-400 truncate">{userMap[project.userId]?.email}</div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">STATUS</div>
                        <select
                          value={project.status || 'active'}
                          onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                          className="bg-slate-800 border border-slate-700 text-white text-sm rounded px-2 py-1 cursor-pointer"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="on-hold">On Hold</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="flex gap-2 mt-2">
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
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Rooms</div>
                      <div className="text-white font-semibold">{getRoomCount(project.rooms)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Total Cost</div>
                      <div className="text-white font-semibold">₹{project.totalCost?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Created</div>
                      <div className="text-white text-xs">{project.createdAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Updated</div>
                      <div className="text-white text-xs">{project.updatedAt?.toDate?.()?.toLocaleDateString?.() || 'N/A'}</div>
                    </div>
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
                    <div className="font-semibold">{selectedProject.projectName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500">Status</div>
                    <Badge variant="outline">{selectedProject.status || 'Active'}</Badge>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-semibold mb-2">Client Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">Name</div>
                      <div>{selectedProject.clientInfo?.name || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Email</div>
                      <div className="break-all">{selectedProject.clientInfo?.email || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Phone</div>
                      <div>{selectedProject.clientInfo?.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Address</div>
                      <div>{selectedProject.clientInfo?.address || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-semibold mb-2">Created By</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500">User Name</div>
                      <div>{getUserDisplayName(selectedProject.userId)}</div>
                    </div>
                    <div>
                      <div className="text-slate-500">Email</div>
                      <div>{userMap[selectedProject.userId]?.email || 'N/A'}</div>
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

export default AdminProjectHistory;

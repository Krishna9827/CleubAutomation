
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, ArrowLeft, Calendar, User, Home, Trash2, Eye, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SavedProject {
  id: string;
  projectName: string;
  clientName: string;
  architectName: string;
  designerName: string;
  notes: string;
  rooms: any[];
  createdAt: string;
  updatedAt: string;
}

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    const savedProjects = localStorage.getItem('projectHistory');
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projectHistory', JSON.stringify(updatedProjects));
    toast({
      title: "Project Deleted",
      description: "Project has been removed from history."
    });
  };

  const loadProject = (project: SavedProject) => {
    localStorage.setItem('projectData', JSON.stringify({
      projectName: project.projectName,
      clientName: project.clientName,
      architectName: project.architectName,
      designerName: project.designerName,
      notes: project.notes
    }));
    localStorage.setItem('projectRooms', JSON.stringify(project.rooms));
    navigate('/planner');
  };

  const getTotalAppliances = (rooms: any[]) => {
    return rooms.reduce((total, room) => total + room.appliances.length, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Header */}
      <header className="border-b border-white/10 bg-black sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="p-2 text-white hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-teal-600" />
                <h1 className="text-xl font-bold text-white">Project History</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <Card className="border-white/10 bg-black/40 backdrop-blur-sm shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                Your saved projects will appear here once you start creating them.
              </p>
              <Button
                onClick={() => navigate('/')}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="border-white/10 bg-black/40 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white mb-1">
                        {project.projectName}
                      </CardTitle>
                      <div className="flex items-center text-sm text-slate-300 mb-2">
                        <User className="w-3 h-3 mr-1" />
                        {project.clientName}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                      className="text-red-400 hover:bg-red-950/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-white border-white/50">
                      <Home className="w-3 h-3 mr-1" />
                      {project.rooms.length} Rooms
                    </Badge>
                    <Badge variant="outline" className="text-white border-white/50">
                      {getTotalAppliances(project.rooms)} Items
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-slate-300">
                    <div>Created: {new Date(project.createdAt).toLocaleDateString()}</div>
                    <div>Updated: {new Date(project.updatedAt).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadProject(project)}
                      className="flex-1 text-white border-white/50 hover:bg-white/10"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

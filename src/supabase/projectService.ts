import { supabase } from './config';

export interface ProjectData {
  id: string;
  user_id?: string | null;
  client_info: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  property_details: {
    type: string;
    size: number;
    budget: number;
  };
  requirements: string[];
  rooms: {
    id: string;
    name: string;
    type: string;
    features: string[];
    appliances: {
      id: string;
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
  sections: {
    id: string;
    name: string;
    items: {
      id: string;
      name: string;
      quantity: number;
      price: number;
    }[];
  }[];
  total_cost: number;
  status: 'draft' | 'in-progress' | 'completed';
  created_at: string;
  updated_at: string;
  last_saved_page: string;
}

export const projectService = {
  /**
   * Create a new project
   */
  async createProject(initialData: Partial<ProjectData>, userId?: string): Promise<string> {
    try {
      const projectData = {
        user_id: userId || null,
        client_info: initialData.client_info || {
          name: '',
          email: '',
          phone: '',
          address: '',
        },
        property_details: initialData.property_details || {
          type: '',
          size: 0,
          budget: 0,
        },
        requirements: initialData.requirements || [],
        rooms: initialData.rooms || [],
        sections: initialData.sections || [],
        total_cost: initialData.total_cost || 0,
        status: (initialData.status as 'draft' | 'in-progress' | 'completed') || 'draft',
        last_saved_page: initialData.last_saved_page || 'index',
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(projectData)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      console.error('Error creating project:', error);
      throw new Error(error.message || 'Failed to create project');
    }
  },

  /**
   * Update project data
   */
  async updateProject(projectId: string, updates: Partial<ProjectData>): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating project:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Save current page progress
   */
  async saveProgress(projectId: string, pageName: string, pageData: any): Promise<void> {
    try {
      const updates = {
        last_saved_page: pageName,
        ...pageData,
      };

      await this.updateProject(projectId, updates);
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Get project by ID
   */
  async getProject(projectId: string): Promise<ProjectData | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      return data as ProjectData;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

  /**
   * Get all projects for a client by email
   */
  async getClientProjects(clientEmail: string): Promise<ProjectData[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .contains('client_info', { email: clientEmail })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectData[];
    } catch (error: any) {
      console.error('Error fetching client projects:', error);
      return [];
    }
  },

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string): Promise<ProjectData[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectData[];
    } catch (error: any) {
      console.error('Error fetching user projects:', error);
      return [];
    }
  },

  /**
   * Get all projects (admin only)
   */
  async getAllProjects(): Promise<ProjectData[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ProjectData[];
    } catch (error: any) {
      console.error('Error fetching all projects:', error);
      return [];
    }
  },

  /**
   * Delete project
   */
  async deleteProject(projectId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Save room selection
   */
  async saveRoomSelection(projectId: string, rooms: ProjectData['rooms']): Promise<void> {
    await this.updateProject(projectId, { rooms });
  },

  /**
   * Save requirements
   */
  async saveRequirements(
    projectId: string,
    requirements: string[],
    propertyDetails: ProjectData['property_details']
  ): Promise<void> {
    await this.updateProject(projectId, {
      requirements,
      property_details: propertyDetails,
      last_saved_page: 'requirements',
    });
  },

  /**
   * Save appliances for a room
   */
  async saveRoomAppliances(
    projectId: string,
    roomId: string,
    appliances: ProjectData['rooms'][0]['appliances']
  ): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const updatedRooms = project.rooms.map((room) =>
      room.id === roomId ? { ...room, appliances } : room
    );

    await this.updateProject(projectId, { rooms: updatedRooms });
  },

  /**
   * Calculate and update total cost
   */
  async updateTotalCost(projectId: string): Promise<void> {
    const project = await this.getProject(projectId);
    if (!project) return;

    const roomCosts = project.rooms.reduce(
      (total, room) =>
        total +
        room.appliances.reduce(
          (roomTotal, appliance) => roomTotal + appliance.price * appliance.quantity,
          0
        ),
      0
    );

    const sectionCosts = project.sections.reduce(
      (total, section) =>
        total +
        section.items.reduce(
          (sectionTotal, item) => sectionTotal + item.price * item.quantity,
          0
        ),
      0
    );

    const totalCost = roomCosts + sectionCosts;
    await this.updateProject(projectId, { total_cost: totalCost });
  },
};

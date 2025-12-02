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
    automationType?: 'wired' | 'wireless';
    panels?: any[];
    features: string[];
    appliances: {
      id: string;
      name: string;
      category?: string;
      subcategory?: string;
      quantity: number;
      price: number;
      wattage?: number;
      linkedInventoryId?: string;
      specifications?: Record<string, any>;
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
      if (!userId) {
        throw new Error('❌ User ID is required to create a project');
      }

      console.log('✅ Step 1: User ID received:', userId);

      const projectData = {
        user_id: userId,
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

      console.log('✅ Step 2: Project data prepared:', projectData);

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('✅ Step 3: Session check - User ID:', session?.user?.id);
      console.log('✅ Step 3: Session valid:', !!session);
      console.log('✅ Step 3: IDs match:', session?.user?.id === userId);
      
      if (!session) {
        throw new Error('❌ No active session. Please log in again.');
      }

      if (session.user.id !== userId) {
        throw new Error(`❌ User ID mismatch! Session: ${session.user.id}, Provided: ${userId}`);
      }

      console.log('✅ Step 4: Verifying user profile exists in database...');
      
      // Check if user profile exists before inserting project
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('❌ Error checking user profile:', userError);
        throw new Error(`❌ User profile not found! Error: ${userError.message}`);
      }

      if (!userProfile) {
        throw new Error('❌ User profile does not exist in database. Please complete your profile first.');
      }

      console.log('✅ Step 4.5: User profile verified:', userProfile);
      // Use insert without .single() first to see what happens
      const { data, error, status } = await supabase
        .from('projects')
        .insert([projectData] as any)
        .select('id');

      console.log('✅ Step 6: Supabase response received');
      console.log('📊 Status:', status);
      console.log('📊 Data:', data);
      console.log('📊 Error:', error);

      if (error) {
        console.error('❌ Supabase Insert Error Details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Supabase Error [${error.code}]: ${error.message} - ${error.details || error.hint || ''}`);
      }

      if (!data || data.length === 0) {
        throw new Error('❌ No data returned from insert. RLS policy may be blocking.');
      }

      const projectId = data[0].id;
      console.log('✅ Step 7: Project created with ID:', projectId);
      return projectId;
    } catch (error: any) {
      console.error('❌ CRITICAL ERROR in createProject:', error);
      console.error('❌ Error stack:', error.stack);
      throw new Error(error.message || 'Failed to create project');
    }
  },

  /**
   * Update project data
   */
  async updateProject(projectId: string, updates: Partial<ProjectData>): Promise<void> {
    try {
      console.log('📝 Updating project:', projectId);
      console.log('📝 Updates:', JSON.stringify(updates, null, 2));

      // Ensure we have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session. Please log in again.');
      }

      const { data, error } = await (supabase
        .from('projects') as any)
        .update(updates)
        .eq('id', projectId)
        .select();

      if (error) {
        console.error('❌ Update Error Details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Update failed: ${error.message || 'Unknown error'}`);
      }

      if (!data || data.length === 0) {
        throw new Error('Update failed: No data returned. Check RLS policies.');
      }

      console.log('✅ Project updated successfully:', data);
    } catch (error: any) {
      console.error('❌ Error updating project:', error);
      throw new Error(error.message || 'Failed to update project');
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
    try {
      console.log('🏠 Saving room selection:', rooms.length, 'rooms');
      await this.updateProject(projectId, { rooms });
      console.log('✅ Room selection saved');
    } catch (error: any) {
      console.error('❌ Error saving room selection:', error);
      throw error;
    }
  },

  /**
   * Save requirements
   */
  async saveRequirements(
    projectId: string,
    requirements: string[],
    propertyDetails: ProjectData['property_details']
  ): Promise<void> {
    try {
      console.log('📋 Saving requirements:', requirements);
      await this.updateProject(projectId, {
        requirements,
        property_details: propertyDetails,
        last_saved_page: 'requirements',
      });
      console.log('✅ Requirements saved');
    } catch (error: any) {
      console.error('❌ Error saving requirements:', error);
      throw error;
    }
  },

  /**
   * Save appliances for a room
   */
  async saveRoomAppliances(
    projectId: string,
    roomId: string,
    appliances: ProjectData['rooms'][0]['appliances']
  ): Promise<void> {
    try {
      console.log('🔌 Saving appliances for room:', roomId);
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const updatedRooms = project.rooms.map((room) =>
        room.id === roomId ? { ...room, appliances } : room
      );

      await this.updateProject(projectId, { rooms: updatedRooms });
      console.log('✅ Appliances saved');
    } catch (error: any) {
      console.error('❌ Error saving appliances:', error);
      throw error;
    }
  },

  /**
   * Calculate and update total cost
   */
  async updateTotalCost(projectId: string): Promise<void> {
    try {
      console.log('💰 Calculating and updating total cost');
      const project = await this.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

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
      console.log('💰 New total cost:', totalCost);
      await this.updateProject(projectId, { total_cost: totalCost });
      console.log('✅ Total cost updated');
    } catch (error: any) {
      console.error('❌ Error updating total cost:', error);
      throw error;
    }
  },
};

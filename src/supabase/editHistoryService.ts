import { supabase } from './config';
import { ProjectData } from './projectService';

export interface EditHistoryEntry {
  id?: string;
  project_id: string;
  user_id: string;
  edited_by_admin?: boolean;
  admin_id?: string | null;
  client_info: Record<string, any>;
  property_details: Record<string, any>;
  rooms: any[];
  total_cost: number;
  status: 'draft' | 'in-progress' | 'completed';
  change_summary?: string;
  change_type?: 'created' | 'appliance_added' | 'appliance_removed' | 'appliance_updated' | 'client_info_updated' | 'status_changed' | 'room_added' | 'room_removed' | 'other';
  changed_fields?: string[];
  timeline?: string | null;
  notes?: string | null;
  created_at?: string;
  ip_address?: string;
  user_agent?: string;
}

export const editHistoryService = {
  /**
   * Save a new edit history entry (snapshot of project state)
   */
  async saveEditHistory(
    projectId: string,
    userId: string,
    projectData: ProjectData,
    changeType: EditHistoryEntry['change_type'] = 'other',
    changeSummary?: string,
    changedFields?: string[],
    editedByAdmin?: boolean,
    adminId?: string
  ): Promise<EditHistoryEntry | null> {
    try {
      const entry: EditHistoryEntry = {
        project_id: projectId,
        user_id: userId,
        edited_by_admin: editedByAdmin || false,
        admin_id: adminId || null,
        client_info: projectData.client_info || {},
        property_details: projectData.property_details || {},
        rooms: projectData.rooms || [],
        total_cost: projectData.total_cost || 0,
        status: projectData.status || 'draft',
        change_summary: changeSummary || 'Project updated',
        change_type: changeType,
        changed_fields: changedFields || [],
        timeline: (projectData as any).timeline || null,
        notes: (projectData as any).notes || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      };

      const { data, error } = (await (supabase as any)
        .from('project_edit_history')
        .insert([entry])
        .select()
        .single()) as { data: EditHistoryEntry | null; error: any };

      if (error) {
        console.error('❌ Error saving edit history:', error);
        return null;
      }

      if (data) {
        console.log('✅ Edit history saved for project:', projectId);
        return data as EditHistoryEntry;
      }
      return null;
    } catch (error) {
      console.error('❌ Exception saving edit history:', error);
      return null;
    }
  },

  /**
   * Get all edit history entries for a project
   */
  async getProjectHistory(projectId: string): Promise<EditHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('project_edit_history')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching project history:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} history entries for project`);
      return (data || []) as EditHistoryEntry[];
    } catch (error) {
      console.error('❌ Exception fetching project history:', error);
      return [];
    }
  },

  /**
   * Get a specific history entry
   */
  async getHistoryEntry(entryId: string): Promise<EditHistoryEntry | null> {
    try {
      const { data, error } = await supabase
        .from('project_edit_history')
        .select('*')
        .eq('id', entryId)
        .single();

      if (error) {
        console.error('❌ Error fetching history entry:', error);
        return null;
      }

      if (data) {
        console.log('✅ History entry retrieved');
        return data as EditHistoryEntry;
      }
      return null;
    } catch (error) {
      console.error('❌ Exception fetching history entry:', error);
      return null;
    }
  },

  /**
   * Restore a project to a previous version from history
   * This creates a new history entry with the restored data
   */
  async restoreFromHistory(
    projectId: string,
    historyEntryId: string,
    userId: string,
    restoredByAdmin?: boolean,
    adminId?: string
  ): Promise<boolean> {
    try {
      // Get the history entry to restore
      const historyEntry = await this.getHistoryEntry(historyEntryId);
      if (!historyEntry) {
        console.error('❌ History entry not found');
        return false;
      }

      // Check that it belongs to this project
      if (historyEntry.project_id !== projectId) {
        console.error('❌ History entry does not belong to this project');
        return false;
      }

      // Create the restored project data
      const restoredProjectData: Partial<ProjectData> = {
        id: projectId,
        user_id: historyEntry.user_id,
        client_info: historyEntry.client_info as any,
        property_details: historyEntry.property_details as any,
        rooms: historyEntry.rooms,
        total_cost: historyEntry.total_cost,
        status: historyEntry.status,
        created_at: '',
        updated_at: new Date().toISOString(),
      };

      // Import projectService dynamically to avoid circular dependency
      const { projectService } = await import('./projectService');

      // Update the project with restored data
      await projectService.updateProject(projectId, restoredProjectData);

      // Save a history entry for this restore action
      await this.saveEditHistory(
        projectId,
        userId,
        restoredProjectData,
        'other',
        `Restored from version dated ${new Date(historyEntry.created_at!).toLocaleDateString()}`,
        ['all'],
        restoredByAdmin,
        adminId
      );

      console.log('✅ Project restored from history');
      return true;
    } catch (error) {
      console.error('❌ Exception restoring from history:', error);
      return false;
    }
  },

  /**
   * Get recent history entries (last N entries)
   */
  async getRecentHistory(projectId: string, limit: number = 10): Promise<EditHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .from('project_edit_history')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching recent history:', error);
        return [];
      }

      return (data || []) as EditHistoryEntry[];
    } catch (error) {
      console.error('❌ Exception fetching recent history:', error);
      return [];
    }
  },

  /**
   * Compare two history entries to show what changed
   */
  async compareVersions(
    oldEntryId: string,
    newEntryId: string
  ): Promise<{ changed: string[]; oldData: any; newData: any } | null> {
    try {
      const oldEntry = await this.getHistoryEntry(oldEntryId);
      const newEntry = await this.getHistoryEntry(newEntryId);

      if (!oldEntry || !newEntry) {
        console.error('❌ One or both history entries not found');
        return null;
      }

      const changed: string[] = [];
      const oldData: any = {};
      const newData: any = {};

      // Compare client info
      if (JSON.stringify(oldEntry.client_info) !== JSON.stringify(newEntry.client_info)) {
        changed.push('client_info');
        oldData.client_info = oldEntry.client_info;
        newData.client_info = newEntry.client_info;
      }

      // Compare property details
      if (JSON.stringify(oldEntry.property_details) !== JSON.stringify(newEntry.property_details)) {
        changed.push('property_details');
        oldData.property_details = oldEntry.property_details;
        newData.property_details = newEntry.property_details;
      }

      // Compare rooms
      if (JSON.stringify(oldEntry.rooms) !== JSON.stringify(newEntry.rooms)) {
        changed.push('rooms');
        oldData.rooms = oldEntry.rooms;
        newData.rooms = newEntry.rooms;
      }

      // Compare total cost
      if (oldEntry.total_cost !== newEntry.total_cost) {
        changed.push('total_cost');
        oldData.total_cost = oldEntry.total_cost;
        newData.total_cost = newEntry.total_cost;
      }

      // Compare status
      if (oldEntry.status !== newEntry.status) {
        changed.push('status');
        oldData.status = oldEntry.status;
        newData.status = newEntry.status;
      }

      console.log('✅ Versions compared:', changed);
      return { changed, oldData, newData };
    } catch (error) {
      console.error('❌ Exception comparing versions:', error);
      return null;
    }
  },

  /**
   * Duplicate a project from a history entry or current state
   */
  async duplicateProject(
    sourceProjectId: string,
    userId: string,
    fromHistoryId?: string
  ): Promise<ProjectData | null> {
    try {
      // Get the source data
      let sourceData: EditHistoryEntry | null;

      if (fromHistoryId) {
        sourceData = await this.getHistoryEntry(fromHistoryId);
      } else {
        // Get the most recent history entry
        const recent = await this.getRecentHistory(sourceProjectId, 1);
        sourceData = recent[0] || null;
      }

      if (!sourceData) {
        console.error('❌ Source project data not found');
        return null;
      }

      // Import projectService dynamically
      const { projectService } = await import('./projectService');

      // Create new project with duplicated data
      const duplicatedProjectId = await projectService.createProject(
        {
          client_info: { ...sourceData.client_info } as any,
          property_details: { ...sourceData.property_details } as any,
          rooms: JSON.parse(JSON.stringify(sourceData.rooms)), // Deep copy
          total_cost: sourceData.total_cost,
          status: 'draft', // New duplicates start as draft
        },
        userId
      );

      if (duplicatedProjectId) {
        // Save history entry for the new project
        const newProject = await projectService.getProject(duplicatedProjectId);
        if (newProject) {
          await this.saveEditHistory(
            duplicatedProjectId,
            userId,
            newProject,
            'created',
            `Duplicated from project ${sourceProjectId}`
          );
        }

        console.log('✅ Project duplicated:', duplicatedProjectId);
        return newProject || null;
      }

      return null;
    } catch (error) {
      console.error('❌ Exception duplicating project:', error);
      return null;
    }
  },
};

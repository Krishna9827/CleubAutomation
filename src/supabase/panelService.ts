import { supabase as supabaseClient } from './config'
import { PanelPreset, PanelComponentConfig } from '@/types/project'

// Cast supabase to any to avoid strict type inference issues
const supabase = supabaseClient as any;

export const panelService = {
  /**
   * Fetch all panel presets from panel_presets table
   * Each preset represents an admin-configured panel option
   */
  async getAllPanelPresets(): Promise<PanelPreset[]> {
    try {
      console.log('📋 Fetching panel presets from panel_presets table...')
      
      const { data, error } = await supabase
        .from('panel_presets')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Error fetching panel presets:', error)
        return []
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No panel presets found in panel_presets table')
        return []
      }

      // Transform panel_presets rows to PanelPreset objects
      const presets = (data as any[]).map(item => ({
        id: item.id,
        name: item.name,
        moduleSize: item.module_size,
        totalModulesUsed: item.total_modules_used,
        isFull: item.is_full,
        components: item.components as PanelComponentConfig[],
        notes: item.notes,
      }))
      console.log('✅ Loaded', presets.length, 'panel presets')
      
      return presets
    } catch (error) {
      console.error('❌ Exception fetching panel presets:', error)
      return []
    }
  },

  /**
   * Fetch panel presets by module size
   */
  async getPanelPresetsBySize(moduleSize: number): Promise<PanelPreset[]> {
    try {
      const allPresets = await this.getAllPanelPresets()
      return allPresets.filter(p => p.moduleSize === moduleSize)
    } catch (error) {
      console.error('❌ Error filtering panel presets by size:', error)
      return []
    }
  },

  /**
   * Fetch a single panel preset by ID
   */
  async getPanelPresetById(presetId: string): Promise<PanelPreset | null> {
    try {
      const { data, error } = await supabase
        .from('panel_presets')
        .select('*')
        .eq('id', presetId)
        .single()

      if (error || !data) {
        console.error('❌ Panel preset not found:', error)
        return null
      }

      const item = data as any
      return {
        id: item.id,
        name: item.name,
        moduleSize: item.module_size,
        totalModulesUsed: item.total_modules_used,
        isFull: item.is_full,
        components: item.components as PanelComponentConfig[],
        notes: item.notes,
      }
    } catch (error) {
      console.error('❌ Exception fetching panel preset:', error)
      return null
    }
  },

  /**
   * Search panel presets by name pattern
   * Useful for finding specific configurations like "6M-4S-1ST-1F"
   */
  async searchPanelPresets(namePattern: string): Promise<PanelPreset[]> {
    try {
      const { data, error } = await supabase
        .from('panel_presets')
        .select('*')
        .ilike('name', `%${namePattern}%`)

      if (error) {
        console.error('❌ Error searching panel presets:', error)
        return []
      }

      if (!data || data.length === 0) {
        console.warn(`⚠️ No panel presets found matching: ${namePattern}`)
        return []
      }

      return (data as any[]).map(item => ({
        id: item.id,
        name: item.name,
        moduleSize: item.module_size,
        totalModulesUsed: item.total_modules_used,
        isFull: item.is_full,
        components: item.components as PanelComponentConfig[],
        notes: item.notes,
      }))
    } catch (error) {
      console.error('❌ Exception searching panel presets:', error)
      return []
    }
  },

  /**
   * Delete a panel preset by ID
   * Also deletes the linked inventory item if it exists
   */
  async deletePanelPreset(presetId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting panel preset:', presetId);

      // First, get the preset to find linked inventory ID
      const { data: preset, error: fetchError } = await supabase
        .from('panel_presets')
        .select('linked_inventory_id')
        .eq('id', presetId)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching preset for delete:', fetchError);
      }

      // Delete the panel preset
      const { error: deleteError } = await supabase
        .from('panel_presets')
        .delete()
        .eq('id', presetId);

      if (deleteError) {
        console.error('❌ Error deleting panel preset:', deleteError);
        throw new Error(deleteError.message);
      }

      // Also delete linked inventory item if exists
      if (preset?.linked_inventory_id) {
        const { error: invError } = await supabase
          .from('inventory')
          .delete()
          .eq('id', preset.linked_inventory_id);

        if (invError) {
          console.warn('⚠️ Could not delete linked inventory item:', invError.message);
        } else {
          console.log('✅ Linked inventory item deleted');
        }
      }

      console.log('✅ Panel preset deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ Exception deleting panel preset:', error);
      throw error;
    }
  }
}

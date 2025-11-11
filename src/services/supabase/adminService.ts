import { supabase } from './config'

export interface Inquiry {
  id: string
  name: string
  email: string
  phone: string
  message: string
  status: string
  created_at: string
}

export interface AdminSettings {
  id: string
  setting_key: string
  setting_value: any
  updated_at: string
}

export interface Testimonial {
  id: string
  client_name: string
  property_type: string
  location: string
  date: string
  quote: string
  project_details: string
  features: string[]
  results: string[]
  video_url: string | null
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  category: string
  subcategory: string | null
  wattage: number | null
  price_per_unit: number
  notes: string | null
  created_at: string
  updated_at: string
}

export const adminService = {
  // ============================================
  // INQUIRIES
  // ============================================

  /**
   * Get all inquiries
   */
  async getAllInquiries(): Promise<Inquiry[]> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching inquiries:', error)
      return []
    }
  },

  /**
   * Create inquiry
   */
  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .insert(inquiry)
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /**
   * Update inquiry status
   */
  async updateInquiryStatus(inquiryId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('inquiries')
        .update({ status })
        .eq('id', inquiryId)

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /**
   * Delete inquiry
   */
  async deleteInquiry(inquiryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('inquiries')
        .delete()
        .eq('id', inquiryId)

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // ============================================
  // ADMIN SETTINGS
  // ============================================

  /**
   * Get admin settings by key
   */
  async getSettings(key: string = 'general'): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', key)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return empty object
          return {}
        }
        throw error
      }
      return data?.setting_value || {}
    } catch (error: any) {
      console.error('Error fetching settings:', error)
      return {}
    }
  },

  /**
   * Update admin settings
   */
  async updateSettings(key: string, settings: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: key,
          setting_value: settings,
        }, {
          onConflict: 'setting_key'
        })

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // ============================================
  // TESTIMONIALS
  // ============================================

  /**
   * Get all testimonials
   */
  async getAllTestimonials(): Promise<Testimonial[]> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching testimonials:', error)
      return []
    }
  },

  /**
   * Create testimonial
   */
  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /**
   * Update testimonial
   */
  async updateTestimonial(testimonialId: string, updates: Partial<Testimonial>): Promise<void> {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', testimonialId)

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /**
   * Delete testimonial
   */
  async deleteTestimonial(testimonialId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId)

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  // ============================================
  // INVENTORY
  // ============================================

  /**
   * Get all inventory items
   */
  async getAllInventory(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('category', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching inventory:', error)
      return []
    }
  },

  /**
   * Get inventory by category
   */
  async getInventoryByCategory(category: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .eq('category', category)
        .order('subcategory', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error('Error fetching inventory by category:', error)
      return []
    }
  },

  /**
   * Create inventory item
   */
  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert(item)
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /**
   * Update inventory item
   */
  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory')
        .update(updates)
        .eq('id', itemId)

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /**
   * Delete inventory item
   */
  async deleteInventoryItem(itemId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', itemId)

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },

  /**
   * Bulk import inventory items
   */
  async bulkImportInventory(items: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory')
        .insert(items)

      if (error) throw error
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
}

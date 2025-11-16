import { supabase } from './config';
import { InventoryItem } from '@/types/inventory';

// Database types (snake_case - matches Supabase schema)
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  property_type?: string | null;
  property_size?: string | null;
  location?: string | null;
  budget?: string | null;
  requirements?: string | null;
  timeline?: string | null;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminSettings {
  id: string;
  setting_key: string;
  setting_value: any;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  client_name: string;
  property_type: string;
  location: string;
  date: string;
  quote: string;
  project_details: string;
  features: string[];
  results: string[];
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export const adminService = {
  // ============================================
  // ADMIN MANAGEMENT
  // ============================================

  /**
   * Check if user is admin by email
   * This is the primary method for verifying admin access
   */
  async getAdminByEmail(email: string): Promise<Admin | null> {
    try {
      if (!email) {
        console.log('⚠️ No email provided to getAdminByEmail');
        return null;
      }

      console.log(`🔍 Checking admin status for email: ${email}`);

      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found - user is not an admin
          console.log(`ℹ️ User ${email} is not an admin`);
          return null;
        }
        console.error('❌ Error querying admin status:', error);
        return null;
      }

      console.log(`✅ Verified admin access for: ${data.full_name} (${data.email})`);
      return data as Admin;
    } catch (error: any) {
      console.error('❌ Error in getAdminByEmail:', error.message);
      return null;
    }
  },

  /**
   * Get all admin users (admin-only)
   */
  async getAllAdmins(): Promise<Admin[]> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('is_active', true)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching admins:', error);
      return [];
    }
  },

  /**
   * Add new admin user (admin-only)
   */
  async createAdmin(email: string, fullName: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('admins')
        .insert({
          email: email.toLowerCase().trim(),
          full_name: fullName,
          is_active: true,
        } as any)
        .select('id')
        .single();

      if (error) throw error;
      console.log(`✅ Admin created: ${fullName} (${email})`);
      return data.id;
    } catch (error: any) {
      console.error('❌ Error creating admin:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Deactivate admin (admin-only)
   */
  async deactivateAdmin(adminId: string): Promise<void> {
    try {
      const { error } = await (supabase
        .from('admins') as any)
        .update({ is_active: false })
        .eq('id', adminId);

      if (error) throw error;
      console.log(`✅ Admin deactivated`);
    } catch (error: any) {
      console.error('❌ Error deactivating admin:', error);
      throw new Error(error.message);
    }
  },

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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching inquiries:', error);
      return [];
    }
  },

  /**
   * Create inquiry
   */
  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'created_at'>): Promise<string> {
    try {
      console.log('📝 Creating inquiry with data:', inquiry);
      
      // Set a timeout for the operation
      const insertPromise = supabase
        .from('inquiries')
        .insert(inquiry as any)
        .select('id')
        .single();
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Supabase insert timeout - no response after 15 seconds')), 15000)
      );
      
      const { data, error } = await Promise.race([insertPromise, timeoutPromise]) as any;

      if (error) {
        console.error('❌ Supabase error inserting inquiry:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          status: (error as any).status
        });
        
        // If error is due to unknown columns (42703 = undefined column), retry with core fields only
        if (error.code === '42703' || error.message?.includes('column')) {
          console.log('⚠️ Detected missing columns. Retrying with core fields only...');
          const coreInquiry = {
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            message: inquiry.message,
            status: inquiry.status
          };
          
          const { data: retryData, error: retryError } = await supabase
            .from('inquiries')
            .insert(coreInquiry as any)
            .select('id')
            .single();
          
          if (retryError) throw retryError;
          if (!retryData) throw new Error('No data returned from fallback insert');
          
          console.log('✅ Inquiry created successfully (fallback mode) with ID:', (retryData as any).id);
          return (retryData as any).id;
        }
        
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      console.log('✅ Inquiry created successfully with ID:', (data as any).id);
      return (data as any).id;
    } catch (error: any) {
      const errorMsg = error?.message || JSON.stringify(error);
      console.error('❌ Error in createInquiry:', errorMsg);
      console.error('❌ Full error object:', error);
      throw new Error(`Failed to save inquiry: ${errorMsg}`);
    }
  },

  /**
   * Update inquiry status
   */
  async updateInquiryStatus(inquiryId: string, status: string): Promise<void> {
    try {
      const { error } = await (supabase
        .from('inquiries') as any)
        .update({ status })
        .eq('id', inquiryId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
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
        .eq('id', inquiryId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
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
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return empty object
          return {};
        }
        throw error;
      }
      return data?.setting_value || {};
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      return {};
    }
  },

  /**
   * Update admin settings
   */
  async updateSettings(key: string, settings: any): Promise<void> {
    try {
      const { error } = await (supabase
        .from('admin_settings') as any)
        .upsert({
          setting_key: key,
          setting_value: settings,
        }, {
          onConflict: 'setting_key'
        });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  },

  /**
   * Create testimonial
   */
  async createTestimonial(testimonial: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial as any)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Update testimonial
   */
  async updateTestimonial(testimonialId: string, updates: Partial<Testimonial>): Promise<void> {
    try {
      const { error } = await (supabase
        .from('testimonials') as any)
        .update(updates)
        .eq('id', testimonialId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
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
        .eq('id', testimonialId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
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
        .order('category', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      return [];
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
        .order('subcategory', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching inventory by category:', error);
      return [];
    }
  },

  /**
   * Create inventory item
   */
  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert(item as any)
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Update inventory item
   */
  async updateInventoryItem(itemId: string, updates: Partial<InventoryItem>): Promise<void> {
    try {
      const { error } = await (supabase
        .from('inventory') as any)
        .update(updates)
        .eq('id', itemId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
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
        .eq('id', itemId);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Bulk import inventory items
   */
  async bulkImportInventory(items: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('inventory')
        .insert(items as any);

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
};

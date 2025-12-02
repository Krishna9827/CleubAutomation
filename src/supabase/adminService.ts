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
  clientName: string;
  propertyType: string;
  location: string;
  date: string;
  quote: string;
  projectDetails: string;
  features: string[];
  results: string[];
  videoUrl: string | null;
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
        // Other errors (RLS, network) are suppressed to reduce console noise
        console.log(`ℹ️ Admin check returned error (not necessarily a problem):`, error.code);
        return null;
      }

      if (!data) {
        console.log(`ℹ️ No admin record found for ${email}`);
        return null;
      }

      const adminData = data as Admin;
      console.log(`✅ Verified admin access for: ${adminData.full_name} (${adminData.email})`);
      return adminData;
    } catch (error: any) {
      console.log('ℹ️ Admin verification check encountered an issue (expected if user is not admin)');
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
      return (data as any)?.id || '';
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
          console.log(`ℹ️ No admin settings found for key: ${key}`);
          return {};
        }
        throw error;
      }
      console.log(`✅ Loaded admin settings for key: ${key}`);
      return (data as any)?.setting_value || {};
    } catch (error: any) {
      console.error('❌ Error fetching settings:', error.message);
      return {};
    }
  },

  /**
   * Update admin settings
   * Note: Requires INSERT permission on admin_settings table for upsert
   */
  async updateSettings(key: string, settings: any): Promise<void> {
    try {
      // Use insert instead of upsert to avoid RLS issues
      // First try to get existing record
      const { data: existing } = await supabase
        .from('admin_settings')
        .select('id')
        .eq('setting_key', key)
        .single();

      if (existing) {
        // Update existing record
        console.log(`📝 Updating admin settings for key: ${key}`);
        const { error } = await (supabase as any)
          .from('admin_settings')
          .update({
            setting_value: settings,
            updated_at: new Date().toISOString(),
          })
          .eq('setting_key', key);

        if (error) {
          console.error('❌ Error updating settings:', error.message);
          throw new Error(`Failed to update settings: ${error.message}`);
        }
        console.log(`✅ Settings updated for key: ${key}`);
      } else {
        // Insert new record
        console.log(`📝 Creating new admin settings for key: ${key}`);
        const { error } = await (supabase as any)
          .from('admin_settings')
          .insert({
            setting_key: key,
            setting_value: settings,
          });

        if (error) {
          console.error('❌ Error creating settings:', error.message);
          throw new Error(`Failed to create settings: ${error.message}`);
        }
        console.log(`✅ Settings created for key: ${key}`);
      }
    } catch (error: any) {
      console.error('❌ Error in updateSettings:', error.message);
      throw error;
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
      
      // Convert snake_case from database to camelCase for UI
      return (data || []).map((item: any) => ({
        id: item.id,
        clientName: item.client_name,
        propertyType: item.property_type,
        location: item.location,
        date: item.date,
        quote: item.quote,
        projectDetails: item.project_details,
        features: item.features,
        results: item.results,
        videoUrl: item.video_url,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
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
      // Convert camelCase to snake_case for database
      const dbTestimonial = {
        client_name: testimonial.clientName,
        property_type: testimonial.propertyType,
        location: testimonial.location,
        date: testimonial.date,
        quote: testimonial.quote,
        project_details: testimonial.projectDetails,
        features: testimonial.features,
        results: testimonial.results,
        video_url: testimonial.videoUrl
      };

      const { data, error } = await supabase
        .from('testimonials')
        .insert(dbTestimonial as any)
        .select('id')
        .single();

      if (error) throw error;
      return (data as any)?.id || '';
    } catch (error: any) {
      throw new Error(error.message);
    }
  },

  /**
   * Update testimonial
   */
  async updateTestimonial(testimonialId: string, updates: Partial<Testimonial>): Promise<void> {
    try {
      // Convert camelCase to snake_case for database
      const dbUpdates: any = {};
      if (updates.clientName) dbUpdates.client_name = updates.clientName;
      if (updates.propertyType) dbUpdates.property_type = updates.propertyType;
      if (updates.location) dbUpdates.location = updates.location;
      if (updates.date) dbUpdates.date = updates.date;
      if (updates.quote) dbUpdates.quote = updates.quote;
      if (updates.projectDetails) dbUpdates.project_details = updates.projectDetails;
      if (updates.features) dbUpdates.features = updates.features;
      if (updates.results) dbUpdates.results = updates.results;
      if (updates.videoUrl) dbUpdates.video_url = updates.videoUrl;

      const { error } = await (supabase
        .from('testimonials') as any)
        .update(dbUpdates)
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
      return (data as any)?.id || '';
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
   * Bulk import inventory items from CSV/Excel
   */
  async bulkImportInventory(items: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    try {
      console.log('📦 Bulk importing', items.length, 'items...');
      
      const { error } = await supabase
        .from('inventory')
        .insert(items as any);

      if (error) throw error;
      
      console.log('✅ Bulk import successful');
    } catch (error: any) {
      console.error('❌ Bulk import error:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Bulk insert inventory items (alias for bulkImportInventory)
   * Properly handles data transformation and error reporting
   */
  async bulkInsertInventory(items: any[]): Promise<boolean> {
    try {
      if (!items || items.length === 0) {
        console.error('❌ No items to insert');
        return false;
      }

      console.log('💾 Bulk inserting', items.length, 'inventory items...');

      // Transform items to match database schema EXACTLY
      const transformedItems = items.map((item, idx) => {
        // Validate required fields
        if (!item.product_name && !item.category) {
          console.warn(`⚠️ Row ${idx + 1}: Missing product_name and category, skipping`);
          return null;
        }

        return {
          product_name: (item.product_name || item.name || '').trim(),
          category: (item.category || 'General').trim(),
          subcategory: (item.subcategory || item.sub_category || '').trim() || null,
          price_per_unit: parseFloat(item.price_per_unit || item.price || 0),
          wattage: item.wattage ? parseInt(item.wattage) : null,
          notes: (item.notes || '').trim() || null,
          vendor: (item.vendor || '').trim() || null,
          protocol: (item.protocol || '').trim() || null,
        };
      }).filter(item => item !== null);

      if (transformedItems.length === 0) {
        console.error('❌ No valid items after transformation');
        return false;
      }

      console.log('📝 Transformed items sample:', JSON.stringify(transformedItems[0], null, 2));

      // Insert with detailed error handling
      const { data, error, status } = await supabase
        .from('inventory')
        .insert(transformedItems)
        .select();

      if (error) {
        console.error('❌ Bulk insert error details:', {
          status,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ Successfully inserted', transformedItems.length, 'items');
      if (data) {
        console.log('📊 First inserted item:', JSON.stringify(data[0], null, 2));
      }
      return true;
    } catch (error: any) {
      console.error('❌ Bulk insert exception:', {
        message: error.message,
        stack: error.stack,
      });
      return false;
    }
  },
};

import { supabase as supabaseClient } from './config';
import { InventoryItem } from '@/types/inventory';

// Cast supabase to any to avoid strict type inference issues
const supabase = supabaseClient as any;

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
        .from('users')
        .select('id, email, first_name, last_name, is_admin')
        .eq('email', email.toLowerCase().trim())
        .eq('is_admin', true)
        .single() as { data: { id: string; email: string; first_name: string; last_name: string; is_admin: boolean } | null; error: any };

      if (error) {
        if (error.code === 'PGRST116') {
          // No record found - user is not an admin
          console.log(`ℹ️ User ${email} is not an admin`);
          return null;
        }
        console.log(`ℹ️ Admin check returned error (not necessarily a problem):`, error.code);
        return null;
      }

      if (!data) {
        console.log(`ℹ️ No admin record found for ${email}`);
        return null;
      }

      const adminData: Admin = {
        id: data.id,
        email: data.email,
        full_name: `${data.first_name} ${data.last_name}`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
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
        .from('users')
        .select('id, email, first_name, last_name, is_admin')
        .eq('is_admin', true)
        .order('first_name', { ascending: true }) as { data: any[] | null; error: any };

      if (error) throw error;
      
      return (data || []).map((user: any) => ({
        id: user.id,
        email: user.email,
        full_name: `${user.first_name} ${user.last_name}`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    } catch (error: any) {
      console.error('❌ Error fetching admins:', error);
      return [];
    }
  },

  /**
   * Add/update admin status for a user by email
   */
  async addAdmin(email: string): Promise<Admin | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('email', email.toLowerCase().trim())
        .select('id, email, first_name, last_name, is_admin')
        .single();

      if (error) {
        console.error('❌ Error adding admin:', error);
        return null;
      }

      const admin: Admin = {
        id: data.id,
        email: data.email,
        full_name: `${data.first_name} ${data.last_name}`,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log(`✅ Admin added: ${admin.full_name} (${admin.email})`);
      return admin;
    } catch (error: any) {
      console.error('❌ Error in addAdmin:', error);
      return null;
    }
  },

  /**
   * Remove admin status from a user by email
   */
  async removeAdmin(email: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: false })
        .eq('email', email.toLowerCase().trim());

      if (error) {
        console.error('❌ Error removing admin:', error);
        return false;
      }

      console.log(`✅ Admin removed: ${email}`);
      return true;
    } catch (error: any) {
      console.error('❌ Error in removeAdmin:', error);
      return false;
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
   * NOTE: Requires DELETE policy on testimonials table in Supabase
   */
  async deleteTestimonial(testimonialId: string): Promise<void> {
    try {
      console.log('🗑️ Deleting testimonial:', testimonialId);
      
      const { error, count } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', testimonialId);

      if (error) {
        console.error('❌ Supabase delete error:', error);
        throw new Error(`Delete failed: ${error.message}. You may need to add a DELETE policy in Supabase.`);
      }
      
      console.log('✅ Testimonial deleted successfully');
    } catch (error: any) {
      console.error('❌ Delete testimonial error:', error);
      throw new Error(error.message || 'Failed to delete testimonial');
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
          product_name: String(item.product_name || item.name || '').trim(),
          category: String(item.category || 'General').trim(),
          subcategory: String(item.subcategory || item.sub_category || '').trim() || null,
          price_per_unit: parseFloat(String(item.price_per_unit || item.price || 0)) || 0,
          wattage: item.wattage ? parseInt(String(item.wattage), 10) : null,
          notes: String(item.notes || '').trim() || null,
          vendor: String(item.vendor || '').trim() || null,
          protocol: String(item.protocol || '').trim() || null,
        };
      }).filter(item => item !== null);

      if (transformedItems.length === 0) {
        console.error('❌ No valid items after transformation');
        return false;
      }

      console.log('📝 Transformed items sample:', JSON.stringify(transformedItems[0], null, 2));

      // Insert in batches to avoid timeout issues
      const batchSize = 50;
      for (let i = 0; i < transformedItems.length; i += batchSize) {
        const batch = transformedItems.slice(i, i + batchSize);
        
        const { data, error, status } = await supabase
          .from('inventory')
          .insert(batch)
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

        console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(transformedItems.length / batchSize)}`);
      }

      console.log('✅ Successfully inserted', transformedItems.length, 'items');
      return true;
    } catch (error: any) {
      console.error('❌ Bulk insert exception:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      // Re-throw with more context
      throw new Error(`Failed to create inventory entry: ${error.message}`);
    }
  },

  // ============================================
  // BLOGS
  // ============================================

  /**
   * Get all blogs (admin view - includes drafts)
   */
  async getAllBlogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching blogs:', error);
      return [];
    }
  },

  /**
   * Get published blogs only (public view)
   */
  async getPublishedBlogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching published blogs:', error);
      return [];
    }
  },

  /**
   * Get single blog by slug
   */
  async getBlogBySlug(slug: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('❌ Error fetching blog by slug:', error);
      return null;
    }
  },

  /**
   * Get single blog by ID
   */
  async getBlogById(id: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('❌ Error fetching blog by ID:', error);
      return null;
    }
  },

  /**
   * Create blog post
   */
  async createBlog(blog: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert(blog)
        .select('id')
        .single();

      if (error) throw error;
      console.log('✅ Blog created:', data?.id);
      return data?.id || '';
    } catch (error: any) {
      console.error('❌ Error creating blog:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Update blog post
   */
  async updateBlog(blogId: string, updates: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('blogs')
        .update(updates)
        .eq('id', blogId);

      if (error) throw error;
      console.log('✅ Blog updated:', blogId);
    } catch (error: any) {
      console.error('❌ Error updating blog:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Delete blog post
   */
  async deleteBlog(blogId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) throw error;
      console.log('✅ Blog deleted:', blogId);
    } catch (error: any) {
      console.error('❌ Error deleting blog:', error);
      throw new Error(error.message);
    }
  },

  // ============================================
  // FAQs
  // ============================================

  /**
   * Get all FAQs (admin view)
   */
  async getAllFaqs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching FAQs:', error);
      return [];
    }
  },

  /**
   * Get published FAQs (public view)
   */
  async getPublishedFaqs(blogId?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (blogId) {
        query = query.eq('blog_id', blogId);
      } else {
        query = query.is('blog_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching published FAQs:', error);
      return [];
    }
  },

  /**
   * Get FAQs for a specific blog
   */
  async getFaqsByBlogId(blogId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('blog_id', blogId)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('❌ Error fetching blog FAQs:', error);
      return [];
    }
  },

  /**
   * Create FAQ
   */
  async createFaq(faq: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .insert(faq)
        .select('id')
        .single();

      if (error) throw error;
      console.log('✅ FAQ created:', data?.id);
      return data?.id || '';
    } catch (error: any) {
      console.error('❌ Error creating FAQ:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Update FAQ
   */
  async updateFaq(faqId: string, updates: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('faqs')
        .update(updates)
        .eq('id', faqId);

      if (error) throw error;
      console.log('✅ FAQ updated:', faqId);
    } catch (error: any) {
      console.error('❌ Error updating FAQ:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Delete FAQ
   */
  async deleteFaq(faqId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', faqId);

      if (error) throw error;
      console.log('✅ FAQ deleted:', faqId);
    } catch (error: any) {
      console.error('❌ Error deleting FAQ:', error);
      throw new Error(error.message);
    }
  },

  /**
   * Reorder FAQs
   */
  async reorderFaqs(orderedIds: string[]): Promise<void> {
    try {
      const updates = orderedIds.map((id, index) => ({
        id,
        order_index: index
      }));

      for (const update of updates) {
        await supabase
          .from('faqs')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      console.log('✅ FAQs reordered');
    } catch (error: any) {
      console.error('❌ Error reordering FAQs:', error);
      throw new Error(error.message);
    }
  },
};


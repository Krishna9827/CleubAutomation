import { supabase } from './config';
import { ProjectData } from './projectService';

export interface BOQItem {
  id: string;
  roomName: string;
  roomId?: string;
  applianceName?: string;
  panelName?: string;
  panelId?: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  specifications?: Record<string, any>;
  itemType?: 'appliance' | 'panel';
  vendorTag?: string;
  availableVendors?: any[];
  panelKey?: string;
  [key: string]: any; // Allow additional fields
}

export interface BOQSummary {
  total_items: number;
  total_quantity: number;
  total_cost: number;
}

export interface ProformaInvoice {
  id?: string;
  project_id: string;
  user_id: string;
  pi_number?: string;
  boq_items: BOQItem[];
  boq_summary: BOQSummary;
  project_name?: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  automation_type: 'wired' | 'wireless';
  total_amount: number;
  gst_amount: number;
  grand_total: number;
  notes?: string;
  validity_days?: number;
  terms_conditions?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

// Helper function to generate PI number
const generatePINumber = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PI-${year}${month}${day}-${random}`;
};

export const proformaInvoiceService = {
  /**
   * Create a new Proforma Invoice from project data
   */
  async createProformaInvoice(
    projectId: string,
    userId: string,
    projectData: ProjectData,
    boqItems: BOQItem[],
    automationType: 'wired' | 'wireless',
    gstPercentage: number = 18
  ): Promise<ProformaInvoice | null> {
    try {
      console.log('🔄 createProformaInvoice called with:', {
        projectId,
        userId,
        boqItemsCount: boqItems.length,
        automationType,
      });

      // Get current user's email from Supabase auth
      console.log('📍 Step 1: Getting authenticated user...');
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      console.log('📍 Step 1 Result:', {
        hasError: !!authError,
        errorMsg: authError?.message,
        hasUser: !!authUser,
        email: authUser?.email,
      });

      if (authError || !authUser?.email) {
        console.error('❌ STEP 1 FAILED: Could not get authenticated user:', {
          error: authError?.message,
          hasEmail: !!authUser?.email,
        });
        return null;
      }

      const userEmail = authUser.email;
      console.log('✅ STEP 1 PASSED: User email obtained:', userEmail);

      // Check if user is admin by email
      console.log('📍 Step 2: Checking admin status by email...');
      const { data: adminCheck, error: adminError } = await supabase
        .from('admins')
        .select('id, email, is_active')
        .eq('email', userEmail)
        .maybeSingle();

      console.log('📍 Step 2 Result:', {
        hasError: !!adminError,
        errorMsg: adminError?.message,
        hasData: !!adminCheck,
        adminData: adminCheck,
      });

      if (adminError) {
        console.error('❌ STEP 2 FAILED: Error querying admins table:', {
          error: adminError.message,
          code: adminError.code,
          details: adminError.details,
        });
        return null;
      }

      if (!adminCheck) {
        console.error('❌ STEP 2 FAILED: User is not in admins table. Email:', userEmail);
        console.warn('⚠️ You need to be added as an admin. Contact your administrator.');
        return null;
      }

      const adminData = adminCheck as any;
      console.log('✅ STEP 2 PASSED: Found admin record:', { id: adminData.id, email: adminData.email });

      if (!adminData.is_active) {
        console.error('❌ STEP 2b FAILED: Admin account is inactive');
        return null;
      }

      console.log('✅ STEP 2b PASSED: Admin is active');

      if (!boqItems || boqItems.length === 0) {
        console.error('❌ STEP 3 FAILED: No BOQ items provided');
        return null;
      }

      console.log('📍 Step 3: Calculating BOQ summary...');
      // Calculate BOQ summary
      const totalQuantity = boqItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      const totalCost = boqItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
      
      console.log('✅ STEP 3 PASSED: BOQ Summary:', { totalQuantity, totalCost, itemCount: boqItems.length });

      const boqSummary: BOQSummary = {
        total_items: boqItems.length,
        total_quantity: totalQuantity,
        total_cost: totalCost,
      };

      // Calculate GST and grand total
      const gstAmount = (totalCost * gstPercentage) / 100;
      const grandTotal = totalCost + gstAmount;

      console.log('📍 Step 4: Sanitizing BOQ items...');
      // Prepare BOQ items - ensure all fields are serializable
      const sanitizedBoqItems = boqItems.map(item => ({
        id: item.id || '',
        roomName: item.roomName || '',
        applianceName: (item.applianceName || item.panelName || ''),
        category: item.category || '',
        subcategory: item.subcategory || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,
        description: item.description || '',
        specifications: item.specifications || {},
      }));
      console.log('✅ STEP 4 PASSED: BOQ items sanitized, count:', sanitizedBoqItems.length);

      const piData = {
        project_id: projectId,
        user_id: userId,
        pi_number: generatePINumber(),
        boq_items: sanitizedBoqItems,
        boq_summary: boqSummary,
        project_name: projectData.client_info?.name || 'Untitled Project',
        client_name: projectData.client_info?.name || '',
        client_email: projectData.client_info?.email || '',
        client_phone: projectData.client_info?.phone || '',
        automation_type: automationType,
        total_amount: totalCost,
        gst_amount: gstAmount,
        grand_total: grandTotal,
        validity_days: 30,
        status: 'draft',
      };

      console.log('📍 Step 5: Inserting PI data into database...');
      console.log('PI Data to insert:', {
        pi_number: piData.pi_number,
        project_id: piData.project_id,
        user_id: piData.user_id,
        boq_items_count: sanitizedBoqItems.length,
        automation_type: piData.automation_type,
        grand_total: piData.grand_total,
      });

      const { data, error } = await supabase
        .from('proforma_invoices')
        .insert([piData] as any)
        .select('id, pi_number, status, created_at, project_id, user_id, client_name, client_email, client_phone, project_name, automation_type, total_amount, gst_amount, grand_total, boq_items, boq_summary, validity_days');

      console.log('📍 Step 5 Result:', {
        hasError: !!error,
        errorMsg: error?.message,
        errorCode: error?.code,
        errorDetails: error?.details,
        hasData: !!data,
        dataLength: data?.length,
      });

      if (error) {
        console.error('❌ STEP 5 FAILED: Error inserting PI:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return null;
      }

      if (data && data.length > 0) {
        const createdPI = data[0] as ProformaInvoice;
        console.log('✅ STEP 5 PASSED: PI created successfully:', {
          id: createdPI.id,
          pi_number: createdPI.pi_number,
          grand_total: createdPI.grand_total,
        });
        return createdPI;
      } else {
        console.error('❌ STEP 5 FAILED: Insert succeeded but no data returned');
        return null;
      }
    } catch (error) {
      console.error('❌ EXCEPTION: Unhandled error in createProformaInvoice:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  },

  /**
   * Get all PIs for a project (admin only)
   */
  async getProjectProformaInvoices(projectId: string): Promise<ProformaInvoice[]> {
    try {
      const { data, error } = await supabase
        .from('proforma_invoices')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching PIs:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} PIs for project`);
      return data || [];
    } catch (error) {
      console.error('❌ Exception fetching PIs:', error);
      return [];
    }
  },

  /**
   * Get a specific PI by ID
   */
  async getProformaInvoice(piId: string): Promise<ProformaInvoice | null> {
    try {
      const { data, error } = await supabase
        .from('proforma_invoices')
        .select('*')
        .eq('id', piId)
        .single();

      if (error) {
        console.error('❌ Error fetching PI:', error);
        return null;
      }

      if (data) {
        console.log('✅ PI retrieved:', (data as any).pi_number);
        return data as ProformaInvoice;
      }
      return null;
    } catch (error) {
      console.error('❌ Exception fetching PI:', error);
      return null;
    }
  },

  /**
   * Update PI status
   */
  async updateProformaInvoiceStatus(
    piId: string,
    status: 'draft' | 'sent' | 'accepted' | 'rejected',
    notes?: string
  ): Promise<ProformaInvoice | null> {
    try {
      console.log('📍 updateProformaInvoiceStatus called:', { piId, status, hasNotes: !!notes });

      const updateData: any = { status };

      if (status === 'sent') {
        updateData.sent_at = new Date().toISOString();
        console.log('📧 Setting sent_at to:', updateData.sent_at);
      }
      if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
        console.log('✅ Setting accepted_at to:', updateData.accepted_at);
      }
      if (notes) {
        updateData.notes = notes;
        console.log('📝 Adding notes:', notes.substring(0, 50) + '...');
      }

      console.log('💾 Sending update to database:', updateData);

      const { data, error } = await (supabase as any)
        .from('proforma_invoices')
        .update(updateData)
        .eq('id', piId)
        .select('id, pi_number, status, sent_at, accepted_at, notes, updated_at');

      console.log('📍 Update result:', {
        hasError: !!error,
        errorMsg: error?.message,
        hasData: !!data,
        dataLength: (data as any[])?.length,
      });

      if (error) {
        console.error('❌ Error updating PI status:', {
          message: error.message,
          code: error.code,
          details: error.details,
        });
        return null;
      }

      if (data && (data as any[]).length > 0) {
        const updatedPI = (data as any[])[0] as ProformaInvoice;
        console.log('✅ PI status updated successfully:', {
          pi_number: updatedPI.pi_number,
          status: updatedPI.status,
        });
        return updatedPI;
      } else {
        console.error('❌ Update succeeded but no data returned');
        return null;
      }
    } catch (error) {
      console.error('❌ Exception updating PI status:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return null;
    }
  },

  /**
   * Delete a PI
   */
  async deleteProformaInvoice(piId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('proforma_invoices')
        .delete()
        .eq('id', piId);

      if (error) {
        console.error('❌ Error deleting PI:', error);
        return false;
      }

      console.log('✅ PI deleted');
      return true;
    } catch (error) {
      console.error('❌ Exception deleting PI:', error);
      return false;
    }
  },

  /**
   * Generate PI from project data and BOQ calculation
   * This is typically called after the user completes the automation billing section
   */
  async generateBOQFromProject(
    projectId: string,
    userId: string,
    projectData: ProjectData,
    rooms: any[],
    automationType: 'wired' | 'wireless',
    priceData: any[]
  ): Promise<ProformaInvoice | null> {
    try {
      // Extract BOQ items from rooms and appliances
      const boqItems: BOQItem[] = [];

      rooms.forEach((room) => {
        if (room.appliances && Array.isArray(room.appliances)) {
          room.appliances.forEach((appliance: any) => {
            // Find price for this appliance
            const priceEntry = priceData.find(
              (p) =>
                p.category === appliance.category &&
                (p.subcategory === appliance.subcategory || !p.subcategory) &&
                (p.wattage === appliance.wattage || !p.wattage)
            );

            const unitPrice = priceEntry?.pricePerUnit || 500;
            const totalPrice = unitPrice * (appliance.quantity || 1);

            boqItems.push({
              id: appliance.id || `${room.id}-${appliance.name}`,
              roomName: room.name,
              applianceName: appliance.name,
              category: appliance.category,
              subcategory: appliance.subcategory,
              quantity: appliance.quantity || 1,
              unitPrice,
              totalPrice,
              description: appliance.name,
              specifications: appliance.specifications,
            });
          });
        }
      });

      if (boqItems.length === 0) {
        console.warn('⚠️ No BOQ items found in project');
        return null;
      }

      // Create PI with generated BOQ
      return this.createProformaInvoice(
        projectId,
        userId,
        projectData,
        boqItems,
        automationType
      );
    } catch (error) {
      console.error('❌ Exception generating BOQ:', error);
      return null;
    }
  },

  /**
   * Get PIs for current user (both own projects and admin-generated ones)
   */
  async getUserProformaInvoices(userId: string): Promise<ProformaInvoice[]> {
    try {
      const { data, error } = await supabase
        .from('proforma_invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching user PIs:', error);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} PIs for user`);
      return data || [];
    } catch (error) {
      console.error('❌ Exception fetching user PIs:', error);
      return [];
    }
  },

  /**
   * Update BOQ items in an existing PI
   */
  async updateProformaInvoiceItems(
    piId: string,
    boqItems: BOQItem[],
    gstPercentage: number = 18
  ): Promise<ProformaInvoice | null> {
    try {
      const totalCost = boqItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const gstAmount = (totalCost * gstPercentage) / 100;
      const grandTotal = totalCost + gstAmount;

      const { data, error } = (await (supabase as any)
        .from('proforma_invoices')
        .update({
          boq_items: boqItems,
          total_amount: totalCost,
          gst_amount: gstAmount,
          grand_total: grandTotal,
          boq_summary: {
            total_items: boqItems.length,
            total_quantity: boqItems.reduce((sum, item) => sum + item.quantity, 0),
            total_cost: totalCost,
          },
        })
        .eq('id', piId)
        .select()
        .single()) as { data: ProformaInvoice | null; error: any };

      if (error) {
        console.error('❌ Error updating PI items:', error);
        return null;
      }

      console.log('✅ PI items updated');
      return data;
    } catch (error) {
      console.error('❌ Exception updating PI items:', error);
      return null;
    }
  },
};

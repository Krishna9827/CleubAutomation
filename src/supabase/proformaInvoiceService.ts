import { supabase } from './config';
import { ProjectData } from './projectService';

export interface BOQItem {
  id: string;
  roomName: string;
  applianceName: string;
  category: string;
  subcategory?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
  specifications?: Record<string, any>;
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
      // Calculate BOQ summary
      const totalQuantity = boqItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalCost = boqItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const boqSummary: BOQSummary = {
        total_items: boqItems.length,
        total_quantity: totalQuantity,
        total_cost: totalCost,
      };

      // Calculate GST and grand total
      const gstAmount = (totalCost * gstPercentage) / 100;
      const grandTotal = totalCost + gstAmount;

      const piData: ProformaInvoice = {
        project_id: projectId,
        user_id: userId,
        pi_number: generatePINumber(),
        boq_items: boqItems,
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

      const { data, error } = await supabase
        .from('proforma_invoices')
        .insert([piData] as any)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating PI:', error);
        return null;
      }

      if (data) {
        console.log('✅ PI created:', (data as any).pi_number);
        return data as ProformaInvoice;
      }
      return null;
    } catch (error) {
      console.error('❌ Exception creating PI:', error);
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
      const updateData: any = { status };

      if (status === 'sent' && !notes) {
        updateData.sent_at = new Date().toISOString();
      }
      if (status === 'accepted') {
        updateData.accepted_at = new Date().toISOString();
      }
      if (notes) {
        updateData.notes = notes;
      }

      const { data, error } = (await (supabase as any)
        .from('proforma_invoices')
        .update(updateData)
        .eq('id', piId)
        .select()
        .single()) as { data: ProformaInvoice | null; error: any };

      if (error) {
        console.error('❌ Error updating PI status:', error);
        return null;
      }

      console.log('✅ PI status updated to:', status);
      return data;
    } catch (error) {
      console.error('❌ Exception updating PI status:', error);
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

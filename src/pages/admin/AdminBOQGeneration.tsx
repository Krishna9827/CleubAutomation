import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Send, Download, Loader2, Edit, Clock, Copy, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { projectService } from '@/supabase/projectService';
import { proformaInvoiceService } from '@/supabase/proformaInvoiceService';
import { editHistoryService } from '@/supabase/editHistoryService';
import { panelService } from '@/supabase/panelService';
import { DEFAULT_INVENTORY_PRICES } from '@/constants/inventory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { extractAppliancesFromRoom } from '@/utils/appliance-transformer';
import { supabase } from '@/supabase/config';
import type { PanelPreset } from '@/types/project';

interface Appliance {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  wattage?: number;
  specifications: Record<string, any>;
}

interface Room {
  id: string;
  name: string;
  type: string;
  automationType?: 'wireless' | 'wired';
  panels?: PanelPreset[];
  appliances: Appliance[];
}

const AdminBOQGeneration = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [projectData, setProjectData] = useState<any>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [boqItems, setBoqItems] = useState<any[]>([]);
  const [automationType, setAutomationType] = useState<'wired' | 'wireless'>('wireless');
  const [gstPercentage, setGstPercentage] = useState(18);
  const [notes, setNotes] = useState('');
  const [validityDays, setValidityDays] = useState(30);
  const [knxWireLength, setKnxWireLength] = useState<number>(0);
  const [additionalOnOffPoints, setAdditionalOnOffPoints] = useState<number>(0);
  const [loadingPI, setLoadingPI] = useState(false);
  const [piGenerated, setPiGenerated] = useState<any>(null);
  const [priceData, setPriceData] = useState<any[]>([]);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState<any>(null);
  const [editingRoom, setEditingRoom] = useState<number | null>(null);
  const [panelVendorSelection, setPanelVendorSelection] = useState<Record<string, { panelId: string; vendorTag: string; price: number }>>({});
  const [availablePanelVendors, setAvailablePanelVendors] = useState<Record<string, any[]>>({});
  const [showPIPreview, setShowPIPreview] = useState(false);
  const piCardRef = useRef<HTMLDivElement>(null);

  // Wired automation modules
  const wiredModules = {
    onOffActuator8: { name: 'ON/OFF Actuator 8 Channel', capacity: 8, price: 25500, notes: '8 points' },
    onOffActuator16: { name: 'ON/OFF Actuator 16 Channel', capacity: 16, price: 38000, notes: '16 points' },
    lightingModule64: { name: 'Lighting Module 64 Channel', capacity: 64, price: 28000, notes: '64 Ch' },
    lightingModule128: { name: 'Lighting Module 128 Channel', capacity: 128, price: 49000, notes: '128 Ch' },
    ipToKnx: { name: 'IP to KNX Interface', capacity: 1, price: 44000, notes: 'Always required' },
    powerSupply: { name: 'Auxiliary Power Supply', capacity: 1, price: 5500, notes: 'Always required' },
    mainProcessor: { name: 'Main Processor (Voice, Interface)', capacity: 1, price: 59000, notes: 'Always required' },
    knxWiring: { name: 'KNX Wiring', capacity: 1, price: 80, notes: 'Per meter' }
  };

  // Check auth and load project
  useEffect(() => {
    if (!loading && !user) {
      navigate('/admin-login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    try {
      const savedPrices = localStorage.getItem('inventoryPrices');
      setPriceData(
        savedPrices && Array.isArray(JSON.parse(savedPrices)) && JSON.parse(savedPrices).length > 0
          ? JSON.parse(savedPrices)
          : DEFAULT_INVENTORY_PRICES
      );
    } catch (error) {
      console.error('Error loading price data:', error);
      setPriceData(DEFAULT_INVENTORY_PRICES);
    }

    // Load prices from inventory table
    loadInventoryPrices();
  }, []);

  // Fetch prices from inventory table
  const loadInventoryPrices = async () => {
    try {
      console.log('💾 Loading inventory prices from Supabase...');
      
      const { data, error } = await supabase
        .from('inventory')
        .select('product_name, category, subcategory, wattage, price_per_unit, vendor_tags');

      if (error) {
        console.error('❌ Error fetching inventory prices:', error);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No inventory items found');
        return;
      }

      // Transform inventory data to match our price data format
      const inventoryPrices = (data as any[]).map(item => ({
        category: item.category,
        subcategory: item.subcategory || undefined,
        wattage: item.wattage,
        productName: item.product_name,
        pricePerUnit: parseFloat(item.price_per_unit || '0'),
        vendor_tags: item.vendor_tags || [],  // Include vendor_tags for panel pricing
      }));

      console.log('💰 Loaded', inventoryPrices.length, 'inventory prices from database');
      
      // Store in state for use in BOQ calculation
      setPriceData(inventoryPrices);
    } catch (error) {
      console.error('❌ Exception loading inventory prices:', error);
      // Fall back to defaults
    }
  };

  // Monitor showPIPreview state changes
  useEffect(() => {
    console.log('🎯 [STATE] showPIPreview changed to:', showPIPreview);
  }, [showPIPreview]);

  // Monitor piGenerated state changes
  useEffect(() => {
    console.log('🎯 [STATE] piGenerated changed:', { hasValue: !!piGenerated, pi_number: piGenerated?.pi_number });
  }, [piGenerated]);

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        console.log('📂 Loading project:', projectId);
        const project = await projectService.getProject(projectId);
        if (project) {
          // Extract appliances from requirements if direct appliances are empty
          const enrichedRooms = (project.rooms || []).map((room: any) => {
            // If room has appliances, use them; otherwise extract from requirements
            if (!room.appliances || room.appliances.length === 0) {
              const extractedAppliances = extractAppliancesFromRoom(room);
              return {
                ...room,
                appliances: extractedAppliances
              };
            }
            return room;
          });

          const totalAppliances = enrichedRooms.reduce((sum: number, r: any) => 
            sum + (r.appliances?.length || 0), 0);

          console.log('✅ Project loaded:', {
            client: project.client_info?.name,
            rooms: enrichedRooms.length,
            appliances: totalAppliances
          });
          
          setProjectData(project);
          setRooms(enrichedRooms);
          generateBOQItems(enrichedRooms);
        } else {
          console.error('❌ Project not found');
        }
      } catch (error) {
        console.error('❌ Error loading project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project data',
          variant: 'destructive',
        });
      }
    };

    loadProject();
  }, [projectId, toast]);

  // Generate BOQ items from rooms
  const generateBOQItems = (projectRooms: Room[]) => {
    const items: any[] = [];
    const panelBrands: Record<string, any[]> = {};

    projectRooms.forEach((room) => {
      // Add appliances to BOQ
      if (room.appliances && Array.isArray(room.appliances) && room.appliances.length > 0) {
        room.appliances.forEach((appliance) => {
          // Ensure appliance has required fields
          if (!appliance.name || !appliance.category) {
            console.warn('⚠️ Skipping appliance with missing required fields:', appliance);
            return;
          }

          const priceEntry = priceData.find(
            (p) =>
              p.category === appliance.category &&
              (p.subcategory === appliance.subcategory || !p.subcategory) &&
              (p.wattage === appliance.wattage || !p.wattage)
          );

          const unitPrice = priceEntry?.pricePerUnit || 500;
          const totalPrice = unitPrice * (appliance.quantity || 1);

          items.push({
            id: appliance.id || `${room.id}-${appliance.name}`,
            roomName: room.name,
            roomId: room.id,
            itemType: 'appliance',
            applianceName: appliance.name,
            category: appliance.category,
            subcategory: appliance.subcategory || '-',
            quantity: appliance.quantity || 1,
            unitPrice,
            totalPrice,
            specifications: appliance.specifications,
          });
        });
      }

      // Add panels to BOQ for wireless rooms only
      if (room.automationType === 'wireless' && room.panels && Array.isArray(room.panels) && room.panels.length > 0) {
        room.panels.forEach((panel) => {
          if (!panel.name) {
            console.warn('⚠️ Skipping panel with missing name:', panel);
            return;
          }

          const panelKey = `${room.id}-${panel.id}`;
          
          // Get inventory items that match this panel's brand_vendor (from panel_presets metadata)
          // Look for items with vendor_tags matching the panel's brand
          const panelInventoryItems = priceData.filter(p => 
            p.category === 'Touch Panels' && 
            p.vendor_tags && 
            Array.isArray(p.vendor_tags)
          );
          
          // Extract unique vendor tags from all panel items
          const vendorTagMap = new Map<string, { vendorTag: string; price: number; productName: string }[]>();
          
          panelInventoryItems.forEach(item => {
            if (item.vendor_tags && Array.isArray(item.vendor_tags)) {
              item.vendor_tags.forEach((tag: string) => {
                if (!vendorTagMap.has(tag)) {
                  vendorTagMap.set(tag, []);
                }
                vendorTagMap.get(tag)!.push({
                  vendorTag: tag,
                  price: item.pricePerUnit,
                  productName: item.productName
                });
              });
            }
          });
          
          // Convert map to array for display
          const availableVendors = Array.from(vendorTagMap.entries()).map(([tag, items]) => ({
            vendorTag: tag,
            price: items[0]?.price || 5000,
            productName: items[0]?.productName || tag
          }));
          
          if (!panelBrands[panelKey]) {
            panelBrands[panelKey] = availableVendors;
          }

          // Get default vendor price (first available or default)
          const defaultVendor = panelBrands[panelKey]?.[0];
          const unitPrice = defaultVendor?.price || 5000;
          const totalPrice = unitPrice * 1; // Panels are typically qty 1

          items.push({
            id: panel.id || `${room.id}-${panel.name}`,
            roomName: room.name,
            roomId: room.id,
            panelId: panel.id,
            panelKey,
            itemType: 'panel',
            panelName: panel.name,
            category: 'Touch Panels',
            subcategory: panel.moduleSize + 'M Panel',
            quantity: 1,
            unitPrice,
            totalPrice,
            vendorTag: defaultVendor?.vendorTag || 'Unspecified',
            availableVendors: panelBrands[panelKey] || [],
          });
        });
      }
    });

    console.log('📊 BOQ items generated:', items.length, 'items (appliances + panels)');
    setBoqItems(items);
    setAvailablePanelVendors(panelBrands);
  };

  // Get device price helper
  const getDevicePrice = (category: string, subcategory: string): number => {
    const priceEntry = priceData.find(price => 
      price.category === category && price.subcategory === subcategory
    );
    return priceEntry?.pricePerUnit || 1000;
  };

  // Optimize actuators for wired
  const optimizeActuators = (totalChannels: number) => {
    if (totalChannels === 0) return { modules: [], totalCost: 0, recommendation: '', calculation: '' };

    const modules16Only = Math.ceil(totalChannels / 16);
    const cost16Only = modules16Only * wiredModules.onOffActuator16.price;

    const modules16Mixed = Math.floor(totalChannels / 16);
    const remaining8 = totalChannels % 16;
    const modules8Mixed = remaining8 > 0 ? Math.ceil(remaining8 / 8) : 0;
    const costMixed = (modules16Mixed * wiredModules.onOffActuator16.price) + (modules8Mixed * wiredModules.onOffActuator8.price);

    const modules8Only = Math.ceil(totalChannels / 8);
    const cost8Only = modules8Only * wiredModules.onOffActuator8.price;

    let modules = [];
    let totalCost = 0;
    let recommendation = '';
    let calculation = '';
    
    if (cost16Only <= costMixed && cost16Only <= cost8Only) {
      modules.push({ ...wiredModules.onOffActuator16, quantity: modules16Only });
      totalCost = cost16Only;
      recommendation = `Optimized: ${modules16Only} × 16Ch modules for best value`;
      calculation = `${totalChannels} channels ÷ 16 = ${modules16Only} modules @ ₹${wiredModules.onOffActuator16.price.toLocaleString()}`;
    } else if (costMixed <= cost8Only) {
      if (modules16Mixed > 0) modules.push({ ...wiredModules.onOffActuator16, quantity: modules16Mixed });
      if (modules8Mixed > 0) modules.push({ ...wiredModules.onOffActuator8, quantity: modules8Mixed });
      totalCost = costMixed;
      recommendation = `Optimized: ${modules16Mixed} × 16Ch + ${modules8Mixed} × 8Ch`;
      calculation = `${totalChannels} channels = ${modules16Mixed * 16} (16Ch) + ${remaining8} (8Ch)`;
    } else {
      modules.push({ ...wiredModules.onOffActuator8, quantity: modules8Only });
      totalCost = cost8Only;
      recommendation = `Optimized: ${modules8Only} × 8Ch modules`;
      calculation = `${totalChannels} channels ÷ 8 = ${modules8Only} modules @ ₹${wiredModules.onOffActuator8.price.toLocaleString()}`;
    }

    return { modules, totalCost, recommendation, calculation };
  };

  // Optimize lighting modules
  const optimizeLightingModules = (totalChannels: number) => {
    if (totalChannels === 0) return { modules: [], totalCost: 0, recommendation: '' };

    const modules128Only = Math.ceil(totalChannels / 128);
    const cost128Only = modules128Only * wiredModules.lightingModule128.price;

    const modules128Mixed = Math.floor(totalChannels / 128);
    const remaining64 = totalChannels % 128;
    const modules64Mixed = remaining64 > 0 ? Math.ceil(remaining64 / 64) : 0;
    const costMixed = (modules128Mixed * wiredModules.lightingModule128.price) + (modules64Mixed * wiredModules.lightingModule64.price);

    let modules = [];
    let totalCost = 0;
    let recommendation = '';
    
    if (cost128Only <= costMixed) {
      modules.push({ ...wiredModules.lightingModule128, quantity: modules128Only });
      totalCost = cost128Only;
      recommendation = `Optimized: ${modules128Only} × 128Ch modules`;
    } else {
      if (modules128Mixed > 0) modules.push({ ...wiredModules.lightingModule128, quantity: modules128Mixed });
      if (modules64Mixed > 0) modules.push({ ...wiredModules.lightingModule64, quantity: modules64Mixed });
      totalCost = costMixed;
      recommendation = `Optimized: ${modules128Mixed} × 128Ch + ${modules64Mixed} × 64Ch`;
    }

    return { modules, totalCost, recommendation };
  };

  // Calculate wired cost with full logic
  const calculateWiredCost = () => {
    let totalOnOffLights = 0;
    let totalLightingChannels = 0;
    let totalCurtains = 0;

    rooms.forEach(room => {
      room.appliances.forEach(appliance => {
        if (appliance.category === 'Lights') {
          const isBasicOnOff = appliance.subcategory === 'ON/OFF' || 
                              !appliance.subcategory || 
                              appliance.subcategory.toLowerCase().includes('on/off');
          
          if (isBasicOnOff) {
            totalOnOffLights += appliance.quantity;
          } else {
            totalLightingChannels += appliance.quantity;
          }
        } else if (appliance.category === 'Curtain & Blinds') {
          totalCurtains += appliance.quantity;
        }
      });
    });

    const curtainChannels = totalCurtains * 2;
    const totalActuatorChannels = totalOnOffLights + curtainChannels + additionalOnOffPoints;

    const actuatorOptimization = optimizeActuators(totalActuatorChannels);
    const lightingOptimization = optimizeLightingModules(totalLightingChannels);

    const mandatoryComponents = [
      { ...wiredModules.ipToKnx, quantity: 1 },
      { ...wiredModules.powerSupply, quantity: 1 },
      { ...wiredModules.mainProcessor, quantity: 1 }
    ];

    const wiringCost = knxWireLength * wiredModules.knxWiring.price;

    const totalCost = 
      actuatorOptimization.totalCost + 
      lightingOptimization.totalCost + 
      mandatoryComponents.reduce((sum, comp) => sum + (comp.price * comp.quantity), 0) +
      wiringCost;

    return {
      totalCost,
      actuatorOptimization,
      lightingOptimization,
      mandatoryComponents,
      wiringCost,
      totalActuatorChannels,
      totalLightingChannels,
      breakdown: {
        onOffLights: totalOnOffLights,
        curtains: totalCurtains,
        curtainChannels,
        additionalOnOffPoints
      }
    };
  };

  // Calculate wireless cost
  const calculateWirelessCost = () => {
    let totalCost = 0;
    const breakdown: any[] = [];

    boqItems.forEach(item => {
      totalCost += item.totalPrice;
      breakdown.push(item);
    });

    return { totalCost, breakdown };
  };

  // Calculate totals
  const calculateTotals = () => {
    const automationCost = automationType === 'wired' 
      ? calculateWiredCost().totalCost 
      : calculateWirelessCost().totalCost;
    
    // Calculate items cost, accounting for selected panel vendor tags
    const itemsCost = boqItems.reduce((sum, item) => {
      if (item.itemType === 'panel' && panelVendorSelection[item.panelKey]) {
        return sum + (panelVendorSelection[item.panelKey].price * item.quantity);
      }
      return sum + item.totalPrice;
    }, 0);
    
    const subtotal = automationCost + itemsCost;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const grandTotal = subtotal + gstAmount;

    return { subtotal, gstAmount, grandTotal, automationCost, itemsCost };
  };

  // Generate PI
  const handleGeneratePI = async () => {
    console.log('🔄 Starting PI generation...');
    
    if (!projectData || !projectId) {
      console.error('❌ Project data missing:', { projectData, projectId });
      toast({ title: 'Error', description: 'Project data not loaded', variant: 'destructive' });
      return;
    }

    if (boqItems.length === 0) {
      console.error('❌ No BOQ items found');
      toast({ title: 'Error', description: 'No appliances found', variant: 'destructive' });
      return;
    }

    if (!user?.id) {
      console.error('❌ User ID not available');
      toast({ title: 'Error', description: 'User not authenticated', variant: 'destructive' });
      return;
    }

    console.log('✅ All validations passed. Creating PI with:', {
      projectId,
      userId: user.id,
      boqItemsCount: boqItems.length,
      automationType,
      gstPercentage
    });

    setLoadingPI(true);
    try {
      const pi = await proformaInvoiceService.createProformaInvoice(
        projectId,
        user.id,
        projectData,
        boqItems,
        automationType,
        gstPercentage
      );

      if (pi) {
        console.log('✅ PI created successfully:', pi);
        console.log('📋 PI object keys:', Object.keys(pi));
        console.log('📋 PI pi_number:', pi.pi_number);
        console.log('📋 PI status:', pi.status);
        console.log('📋 PI created_at:', pi.created_at);
        console.log('📋 PI boq_items type:', typeof pi.boq_items);
        console.log('📋 Full PI object:', JSON.stringify(pi, null, 2));
        
        // Set piGenerated FIRST
        setPiGenerated(pi);
        console.log('🔄 setPiGenerated called with:', pi);
        
        // THEN show the modal in next render cycle
        setTimeout(() => {
          console.log('📱 Opening PI preview modal - calling setShowPIPreview(true)');
          console.log('📱 Current piGenerated:', piGenerated ? 'exists' : 'null');
          setShowPIPreview(true);
          console.log('📱 Modal state updated. Dialog should render now.');
          console.log('📱 Check: piGenerated && showPIPreview =', !!(piGenerated && showPIPreview));
        }, 100);
        
        toast({ title: 'Success', description: `Proforma Invoice ${pi.pi_number} generated - Opening preview...` });
      } else {
        console.error('❌ PI creation returned null');
        toast({ 
          title: 'Error', 
          description: 'PI creation failed. Check console logs for details (admin check or RLS policy issue).', 
          variant: 'destructive' 
        });
      }
    } catch (error) {
      console.error('❌ Error generating PI:', error);
      toast({ title: 'Error', description: `Failed to generate PI: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: 'destructive' });
    } finally {
      setLoadingPI(false);
    }
  };

  const handleSendPI = async () => {
    if (!piGenerated?.id) {
      console.error('❌ No PI to send');
      return;
    }

    try {
      console.log('📧 Sending PI to client:', piGenerated.id);
      await proformaInvoiceService.updateProformaInvoiceStatus(piGenerated.id, 'sent', notes);
      setPiGenerated({ ...piGenerated, status: 'sent' });
      console.log('✅ PI sent successfully');
      toast({ title: 'Success', description: 'PI sent to client' });
    } catch (error) {
      console.error('❌ Error sending PI:', error);
      toast({ title: 'Error', description: 'Failed to send PI', variant: 'destructive' });
    }
  };

  const handleDownloadPDF = () => {
    if (!piGenerated) {
      console.error('❌ No PI to download as PDF');
      return;
    }

    try {
      console.log('📄 Generating PDF for PI:', piGenerated.pi_number);
      
      // Extract BOQ items safely
      let boqItems = [];
      if (piGenerated.boq_items) {
        if (Array.isArray(piGenerated.boq_items)) {
          boqItems = piGenerated.boq_items;
        } else if (typeof piGenerated.boq_items === 'string') {
          boqItems = JSON.parse(piGenerated.boq_items);
        } else if (typeof piGenerated.boq_items === 'object') {
          boqItems = Object.values(piGenerated.boq_items);
        }
      }

      // Create a print-optimized HTML document
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({ title: 'Error', description: 'Please allow pop-ups to download PDF', variant: 'destructive' });
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${piGenerated.pi_number}</title>
          <style>
            @page {
              size: A4;
              margin: 15mm;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #1e293b;
              font-size: 12pt;
            }
            .container {
              max-width: 100%;
              margin: 0 auto;
            }
            .header {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
              color: white;
              padding: 30px;
              margin-bottom: 30px;
              border-radius: 8px;
            }
            .header h1 {
              font-size: 32px;
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            .header .pi-number {
              color: #14b8a6;
              font-size: 16px;
              font-weight: 600;
            }
            .header .status {
              display: inline-block;
              background: rgba(20, 184, 166, 0.2);
              border: 2px solid #14b8a6;
              padding: 8px 16px;
              border-radius: 6px;
              margin-top: 15px;
              font-size: 14px;
              font-weight: bold;
              text-transform: uppercase;
              color: #14b8a6;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 25px;
              padding-bottom: 25px;
              border-bottom: 2px solid #e2e8f0;
            }
            .info-item label {
              display: block;
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              font-weight: 600;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .info-item value {
              display: block;
              font-size: 13px;
              color: #0f172a;
              font-weight: 500;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 14px;
              font-weight: bold;
              color: #0f172a;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 2px solid #cbd5e1;
            }
            .client-info {
              background: #f8fafc;
              padding: 20px;
              border-radius: 6px;
              border-left: 4px solid #14b8a6;
            }
            .client-info .info-row {
              display: flex;
              margin-bottom: 8px;
            }
            .client-info .info-row:last-child {
              margin-bottom: 0;
            }
            .client-info .label {
              font-weight: 600;
              color: #475569;
              min-width: 100px;
            }
            .client-info .value {
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 11pt;
            }
            thead {
              background: #f1f5f9;
            }
            th {
              padding: 12px 10px;
              text-align: left;
              font-weight: 600;
              color: #475569;
              border-bottom: 2px solid #cbd5e1;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #e2e8f0;
              color: #334155;
            }
            tbody tr:hover {
              background: #f8fafc;
            }
            .text-right {
              text-align: right;
            }
            .summary-box {
              float: right;
              width: 350px;
              background: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              overflow: hidden;
              margin-top: 20px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 20px;
              font-size: 13px;
            }
            .summary-row.subtotal {
              border-bottom: 1px solid #e2e8f0;
            }
            .summary-row.gst {
              border-bottom: 2px solid #14b8a6;
            }
            .summary-row.total {
              background: #14b8a6;
              color: white;
              font-weight: bold;
              font-size: 16px;
              padding: 15px 20px;
            }
            .summary-row .label {
              color: #475569;
            }
            .summary-row .value {
              font-weight: 600;
              color: #0f172a;
            }
            .summary-row.total .label,
            .summary-row.total .value {
              color: white;
            }
            .terms {
              clear: both;
              background: #f8fafc;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #e2e8f0;
              margin-top: 30px;
              font-size: 10px;
              color: #64748b;
              line-height: 1.5;
            }
            .terms strong {
              color: #475569;
              display: block;
              margin-bottom: 8px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              text-align: center;
              font-size: 10px;
              color: #94a3b8;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .header {
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%) !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h1>PROFORMA INVOICE</h1>
                  <div class="pi-number">${piGenerated.pi_number}</div>
                </div>
                <div class="status">${piGenerated.status}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <label>Invoice Date</label>
                <value>${new Date(piGenerated.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</value>
              </div>
              <div class="info-item">
                <label>Automation Type</label>
                <value>${piGenerated.automation_type === 'wireless' ? 'Wireless' : 'Wired (KNX)'}</value>
              </div>
              <div class="info-item">
                <label>Validity Period</label>
                <value>${piGenerated.validity_days || 30} days</value>
              </div>
              <div class="info-item">
                <label>Project Name</label>
                <value>${piGenerated.project_name || 'N/A'}</value>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Bill To</div>
              <div class="client-info">
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">${piGenerated.client_name || 'Not provided'}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">${piGenerated.client_email || 'Not provided'}</span>
                </div>
                ${piGenerated.client_phone ? `
                <div class="info-row">
                  <span class="label">Phone:</span>
                  <span class="value">${piGenerated.client_phone}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div class="section">
              <div class="section-title">Bill of Quantities</div>
              <table>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Item Description</th>
                    <th>Category</th>
                    <th style="text-align: center; width: 60px;">Qty</th>
                    <th class="text-right" style="width: 120px;">Unit Price</th>
                    <th class="text-right" style="width: 120px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${boqItems.length > 0 ? boqItems.map((item: any) => `
                    <tr>
                      <td>${item.roomName || '-'}</td>
                      <td style="font-weight: 500;">${item.applianceName || item.panelName || '-'}</td>
                      <td style="color: #64748b;">${item.category || '-'}</td>
                      <td style="text-align: center;">${item.quantity || 1}</td>
                      <td class="text-right" style="font-weight: 500;">₹${(item.unitPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td class="text-right" style="font-weight: 600; color: #14b8a6;">₹${(item.totalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  `).join('') : '<tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">No items found</td></tr>'}
                </tbody>
              </table>
            </div>

            <div class="summary-box">
              <div class="summary-row subtotal">
                <span class="label">Subtotal</span>
                <span class="value">₹${(piGenerated.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div class="summary-row gst">
                <span class="label">GST (18%)</span>
                <span class="value">₹${(piGenerated.gst_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div class="summary-row total">
                <span class="label">GRAND TOTAL</span>
                <span class="value">₹${(piGenerated.grand_total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div class="terms">
              <strong>Terms & Conditions:</strong>
              This is a proforma invoice valid for ${piGenerated.validity_days || 30} days from the date of issue. 
              Prices are subject to change based on final project requirements and specifications. 
              All prices are in Indian Rupees (INR) and include GST as applicable.
            </div>

            <div class="footer">
              <p>Generated on ${new Date(piGenerated.created_at).toLocaleDateString('en-IN')} | Status: ${piGenerated.status.toUpperCase()}</p>
              <p style="margin-top: 5px;">This is a system-generated document. For inquiries, please contact your administrator.</p>
            </div>
          </div>
        </body>
        </html>
      `);

      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          console.log('✅ Print dialog opened - User can save as PDF');
          toast({ 
            title: 'Print Dialog Opened', 
            description: 'Choose "Save as PDF" in the print dialog to download the invoice as PDF',
            duration: 5000
          });
        }, 250);
      };

    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      toast({ title: 'Error', description: 'Failed to generate PDF', variant: 'destructive' });
    }
  };

  const handleDownloadHTML = () => {
    if (!piGenerated) {
      console.error('❌ No PI to download');
      return;
    }

    try {
      console.log('📥 Downloading PI:', piGenerated.pi_number);
      
      // Safely extract boq_items - handle various formats from Supabase JSONB
      let boqItems = [];
      if (piGenerated.boq_items) {
        if (Array.isArray(piGenerated.boq_items)) {
          boqItems = piGenerated.boq_items;
          console.log('✅ BOQ items is already an array:', boqItems.length, 'items');
        } else if (typeof piGenerated.boq_items === 'string') {
          boqItems = JSON.parse(piGenerated.boq_items);
          console.log('✅ BOQ items was stringified, parsed:', boqItems.length, 'items');
        } else if (typeof piGenerated.boq_items === 'object') {
          boqItems = Object.values(piGenerated.boq_items);
          console.log('✅ BOQ items was object, converted:', boqItems.length, 'items');
        }
      }

      if (boqItems.length === 0) {
        console.warn('⚠️  Warning: No BOQ items found, proceeding with empty table');
      }

      console.log('📋 Sample BOQ items (first 2):', boqItems.slice(0, 2));

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${piGenerated.pi_number}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 900px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #0891b2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #0891b2;
              margin: 0;
              font-size: 28px;
            }
            .pi-number {
              color: #666;
              font-size: 14px;
              margin-top: 5px;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #0891b2;
              margin-bottom: 15px;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e2e8f0;
            }
            th {
              background-color: #f1f5f9;
              color: #0891b2;
              font-weight: bold;
            }
            .amount {
              text-align: right;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 16px;
            }
            .summary-row.total {
              font-weight: bold;
              font-size: 18px;
              color: #0891b2;
              border-top: 2px solid #0891b2;
              margin-top: 20px;
              padding-top: 20px;
            }
            .client-info {
              background: #f8fafc;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e2e8f0;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Proforma Invoice</h1>
            <div class="pi-number">${piGenerated.pi_number}</div>
          </div>

          <div class="section">
            <div class="section-title">Client Information</div>
            <div class="client-info">
              <p><strong>Name:</strong> ${piGenerated.client_name || 'N/A'}</p>
              <p><strong>Email:</strong> ${piGenerated.client_email || 'N/A'}</p>
              <p><strong>Phone:</strong> ${piGenerated.client_phone || 'N/A'}</p>
              <p><strong>Project:</strong> ${piGenerated.project_name || 'N/A'}</p>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Bill of Quantities (${boqItems.length} items)</div>
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th class="amount">Unit Price</th>
                  <th class="amount">Total</th>
                </tr>
              </thead>
              <tbody>
                ${boqItems.map((item: any) => `
                  <tr>
                    <td>${item.roomName || '-'}</td>
                    <td>${item.applianceName || item.panelName || '-'}</td>
                    <td>${item.category || '-'}</td>
                    <td>${item.quantity || 1}</td>
                    <td class="amount">₹${((item.unitPrice || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td class="amount">₹${((item.totalPrice || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Summary</div>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>₹${(piGenerated.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row">
              <span>GST (18%):</span>
              <span>₹${(piGenerated.gst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row total">
              <span>Grand Total:</span>
              <span>₹${(piGenerated.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f1f5f9; border-radius: 5px;">
              <p><strong>Automation Type:</strong> ${piGenerated.automation_type === 'wireless' ? 'Wireless (Normal)' : 'Wired (KNX)'}</p>
              <p><strong>Validity:</strong> ${piGenerated.validity_days || 30} days</p>
            </div>
          </div>

          <div class="footer">
            <p>Generated on ${new Date(piGenerated.created_at).toLocaleDateString()} | Status: ${piGenerated.status}</p>
            <p>This is an automated quote. For inquiries, contact your administrator.</p>
          </div>
        </body>
        </html>
      `;

      console.log('📄 HTML content generated, length:', htmlContent.length);

      const blob = new Blob([htmlContent], { type: 'text/html' });
      console.log('💾 Blob created, size:', blob.size, 'bytes');

      const url = window.URL.createObjectURL(blob);
      console.log('🔗 Object URL created');

      const link = document.createElement('a');
      link.href = url;
      link.download = `${piGenerated.pi_number}.html`;
      document.body.appendChild(link);

      console.log('⬇️  Triggering download for:', link.download);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ PI download completed successfully');
      toast({ title: 'Success', description: `PI ${piGenerated.pi_number} downloaded` });
    } catch (error) {
      console.error('❌ Error downloading PI:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        if (error.stack) console.error('Stack trace:', error.stack);
      }
      toast({ title: 'Error', description: `Failed to download PI: ${error instanceof Error ? error.message : String(error)}`, variant: 'destructive' });
    }
  };

  const handleEditAppliance = (roomIdx: number, appIdx: number) => {
    setEditingRoom(roomIdx);
    setEditingAppliance({ ...rooms[roomIdx].appliances[appIdx], appIdx });
    setShowEditDialog(true);
  };

  const handleSaveAppliance = async () => {
    if (editingRoom === null || !editingAppliance || !projectId) return;

    try {
      const newRooms = [...rooms];
      newRooms[editingRoom].appliances[editingAppliance.appIdx] = {
        ...editingAppliance,
        appIdx: undefined
      };
      
      console.log('💾 Saving appliance tweaks to database...', newRooms[editingRoom].appliances[editingAppliance.appIdx]);
      
      // Save to database
      await projectService.updateProject(projectId, { rooms: newRooms as any });
      
      console.log('✅ Appliance tweaks saved successfully');
      
      // Re-fetch from database to ensure sync
      const updatedProject = await projectService.getProject(projectId);
      if (updatedProject) {
        setProjectData(updatedProject);
        const roomsData = (updatedProject.rooms || []) as Room[];
        setRooms(roomsData);
        generateBOQItems(roomsData);
      }
      
      setShowEditDialog(false);
      setEditingAppliance(null);
      setEditingRoom(null);
      toast({ title: 'Success', description: 'Appliance details updated' });
    } catch (error) {
      console.error('❌ Error saving appliance:', error);
      toast({ title: 'Error', description: 'Failed to save appliance', variant: 'destructive' });
    }
  };

  const handleDeleteAppliance = async (roomIdx: number, appIdx: number) => {
    if (!confirm('Delete this appliance?')) return;
    
    try {
      const newRooms = [...rooms];
      newRooms[roomIdx].appliances.splice(appIdx, 1);
      
      console.log('🗑️  Deleting appliance from room:', newRooms[roomIdx].name);
      
      // Save to database
      if (projectId) {
        await projectService.updateProject(projectId, { rooms: newRooms as any });
        
        console.log('✅ Appliance deleted successfully');
        
        // Re-fetch from database to ensure sync
        const updatedProject = await projectService.getProject(projectId);
        if (updatedProject) {
          setProjectData(updatedProject);
          const roomsData = (updatedProject.rooms || []) as Room[];
          setRooms(roomsData);
          generateBOQItems(roomsData);
        }
      }
      
      toast({ title: 'Success', description: 'Appliance removed and saved' });
    } catch (error) {
      console.error('❌ Error deleting appliance:', error);
      toast({ title: 'Error', description: 'Failed to delete appliance', variant: 'destructive' });
    }
  };

  const { subtotal, gstAmount, grandTotal, automationCost, itemsCost } = calculateTotals();
  const wiredResult = automationType === 'wired' ? calculateWiredCost() : null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/projects')} className="border-slate-700 text-white hover:bg-teal-500 hover:text-black hover:border-teal-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">BOQ & Project Details</h1>
              <p className="text-slate-400 mt-1">{projectData?.client_info?.name || 'Untitled'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/admin/projects/${projectId}/timeline`)} variant="outline" className="border-slate-700 text-white hover:bg-teal-500 hover:text-black hover:border-teal-500">
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </Button>
            <Button onClick={handleGeneratePI} disabled={loadingPI || boqItems.length === 0} className="bg-gradient-to-r from-teal-500 to-teal-600">
              <FileText className="w-4 h-4 mr-2" />
              {loadingPI ? 'Generating...' : 'Generate PI'}
            </Button>
          </div>
        </div>

        {/* Project Info Summary */}
        <Card className="border-teal-500/20 bg-teal-900/10">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-slate-400">Rooms</p>
                <p className="text-2xl font-bold text-white">{rooms.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Appliances</p>
                <p className="text-2xl font-bold text-teal-400">{boqItems.length}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Items Cost</p>
                <p className="text-lg font-bold text-white">₹{itemsCost.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Automation</p>
                <p className="text-lg font-bold text-teal-400">₹{automationCost.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Total (with GST)</p>
                <p className="text-lg font-bold text-white">₹{grandTotal.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PI Generated Card - Top Level for Maximum Visibility */}
        {piGenerated && (
          <Card ref={piCardRef} className="border-teal-500/30 bg-gradient-to-r from-teal-900/40 to-cyan-900/40 shadow-lg shadow-teal-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-teal-400 text-xl">
                <FileText className="w-6 h-6" />
                Proforma Invoice Generated
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-3 rounded">
                  <p className="text-xs text-slate-400 mb-1">PI Number</p>
                  <p className="text-lg font-bold text-teal-300">{piGenerated.pi_number}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <Badge className={piGenerated.status === 'sent' ? 'bg-blue-900/50 border-blue-600 text-blue-300' : 'bg-slate-800 border-slate-600 text-slate-300'}>
                    {piGenerated.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="bg-slate-800/50 p-3 rounded">
                  <p className="text-xs text-slate-400 mb-1">Grand Total</p>
                  <p className="text-lg font-bold text-teal-300">₹{(piGenerated.grand_total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="bg-slate-800/50 p-3 rounded">
                  <p className="text-xs text-slate-400 mb-1">Created</p>
                  <p className="text-sm text-white">{new Date(piGenerated.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button 
                  onClick={handleDownloadPDF} 
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button 
                  onClick={handleSendPI}
                  disabled={piGenerated.status === 'sent'}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {piGenerated.status === 'sent' ? 'Sent' : 'Send to Client'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Appliances by Room */}
          <div className="col-span-2 space-y-4">
            <Card className="border-white/10 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Appliances by Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rooms.map((room, roomIdx) => {
                  const totalItems = (room.appliances?.length || 0) + (room.panels?.length || 0);
                  return (
                    <div key={room.id} className="border border-slate-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                        className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition"
                      >
                        <div className="flex items-center gap-2">
                          {expandedRoom === room.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          <span className="font-semibold text-white">{room.name}</span>
                          <Badge className="bg-slate-700">{totalItems} items</Badge>
                        </div>
                      </button>

                      {expandedRoom === room.id && (
                        <div className="p-4 space-y-4">
                          {/* Appliances Section */}
                          {(room.appliances?.length || 0) > 0 && (
                            <div>
                              <p className="font-semibold text-white mb-2">Appliances ({room.appliances.length})</p>
                              <div className="space-y-2">
                                {room.appliances.map((app, appIdx) => (
                                  <div key={appIdx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded">
                                    <div className="flex-1">
                                      <p className="font-semibold text-white">{app.name}</p>
                                      <p className="text-xs text-slate-400">{app.category} • Qty: {app.quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="ghost" onClick={() => handleEditAppliance(roomIdx, appIdx)} className="text-blue-500 hover:text-blue-400">
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="ghost" onClick={() => handleDeleteAppliance(roomIdx, appIdx)} className="text-red-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Panels Section */}
                          {(room.panels?.length || 0) > 0 && (
                            <div>
                              <p className="font-semibold text-white mb-2">Panels ({room.panels.length})</p>
                              <div className="space-y-2">
                                {room.panels.map((panel, panelIdx) => (
                                  <div key={panelIdx} className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-teal-500/30">
                                    <div className="flex-1">
                                      <p className="font-semibold text-white">{panel.name}</p>
                                      <p className="text-xs text-slate-400">Panel • Modules: {panel.totalModulesUsed}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button size="sm" variant="ghost" onClick={() => {
                                        const newRooms = [...rooms];
                                        newRooms[roomIdx].panels = newRooms[roomIdx].panels?.filter((_, i) => i !== panelIdx);
                                        setRooms(newRooms);
                                      }} className="text-red-500 hover:text-red-400">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {totalItems === 0 && (
                            <div className="p-4 text-center bg-slate-800/30 rounded text-slate-400">
                              <p className="text-sm mb-3">No appliances or panels added yet</p>
                              <Button size="sm" onClick={() => navigate('/planner')} className="bg-teal-600 hover:bg-teal-700">
                                + Add in Planner
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* BOQ Table */}
            <Card className="border-white/10 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Bill of Quantities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHead>
                      <TableRow className="border-white/10">
                        <TableHead className="text-slate-300">Room</TableHead>
                        <TableHead className="text-slate-300">Item</TableHead>
                        <TableHead className="text-slate-300">Category</TableHead>
                        <TableHead className="text-slate-300 text-right">Qty</TableHead>
                        <TableHead className="text-slate-300">Brand/Vendor</TableHead>
                        <TableHead className="text-slate-300 text-right">Unit Price</TableHead>
                        <TableHead className="text-slate-300 text-right">Total</TableHead>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {boqItems.map((item, idx) => (
                        <TableRow key={idx} className="border-white/10">
                          <TableCell className="text-white text-sm">{item.roomName}</TableCell>
                          <TableCell className="text-slate-300 text-sm font-medium">
                            {item.itemType === 'panel' ? `${item.panelName} (${item.subcategory})` : item.applianceName}
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm">{item.category}</TableCell>
                          <TableCell className="text-right text-white text-sm">{item.quantity}</TableCell>
                          
                          {/* Vendor tag selector for panels */}
                          {item.itemType === 'panel' ? (
                            <TableCell className="text-sm">
                              <Select 
                                value={panelVendorSelection[item.panelKey]?.vendorTag || item.vendorTag || ''} 
                                onValueChange={(vendorTag) => {
                                  const vendorData = item.availableVendors?.find((v: any) => v.vendorTag === vendorTag);
                                  setPanelVendorSelection(prev => ({
                                    ...prev,
                                    [item.panelKey]: {
                                      panelId: item.panelId,
                                      vendorTag,
                                      price: vendorData?.price || item.unitPrice
                                    }
                                  }));
                                }}
                              >
                                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-slate-700">
                                  {item.availableVendors?.map((vendor: any, i: number) => (
                                    <SelectItem key={i} value={vendor.vendorTag || 'Unspecified'}>
                                      {vendor.vendorTag} - ₹{vendor.price.toLocaleString('en-IN')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          ) : (
                            <TableCell className="text-slate-400 text-sm">-</TableCell>
                          )}
                          
                          <TableCell className="text-right text-teal-400 text-sm">
                            ₹{(panelVendorSelection[item.panelKey]?.price || item.unitPrice).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="text-right text-white font-semibold text-sm">
                            ₹{((panelVendorSelection[item.panelKey]?.price || item.unitPrice) * item.quantity).toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Automation Details - Wired */}
            {automationType === 'wired' && wiredResult && (
              <div className="space-y-4">
                <Card className="border-blue-500/20 bg-blue-900/10">
                  <CardHeader>
                    <CardTitle className="text-blue-400">Wired Automation (KNX) Calculation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Actuators */}
                    {wiredResult.actuatorOptimization.modules.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white mb-2">ON/OFF Actuators</h4>
                        <p className="text-sm text-slate-400 mb-2">{wiredResult.actuatorOptimization.calculation}</p>
                        <div className="space-y-2">
                          {wiredResult.actuatorOptimization.modules.map((mod: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                              <span className="text-white">{mod.name}</span>
                              <div className="flex gap-4">
                                <span className="text-slate-400">Qty: {mod.quantity}</span>
                                <span className="text-teal-400 font-semibold">₹{(mod.price * mod.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lighting Modules */}
                    {wiredResult.lightingOptimization.modules.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-white mb-2">Lighting Modules</h4>
                        <p className="text-sm text-slate-400 mb-2">{wiredResult.lightingOptimization.recommendation}</p>
                        <div className="space-y-2">
                          {wiredResult.lightingOptimization.modules.map((mod: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                              <span className="text-white">{mod.name}</span>
                              <div className="flex gap-4">
                                <span className="text-slate-400">Qty: {mod.quantity}</span>
                                <span className="text-teal-400 font-semibold">₹{(mod.price * mod.quantity).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mandatory */}
                    <div>
                      <h4 className="font-semibold text-white mb-2">Mandatory Components</h4>
                      <div className="space-y-2">
                        {wiredResult.mandatoryComponents.map((comp: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                            <span className="text-white">{comp.name}</span>
                            <span className="text-teal-400 font-semibold">₹{(comp.price * comp.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Wiring */}
                    {wiredResult.wiringCost > 0 && (
                      <div className="flex justify-between items-center p-3 bg-slate-800/50 rounded">
                        <div>
                          <p className="text-white font-semibold">KNX Wiring</p>
                          <p className="text-xs text-slate-400">{knxWireLength}m @ ₹{wiredModules.knxWiring.price}/m</p>
                        </div>
                        <span className="text-teal-400 font-bold">₹{wiredResult.wiringCost.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Right: Configuration & Summary */}
          <div className="space-y-4">
            {/* Automation Type */}
            <Card className="border-white/10 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-sm">Automation Type</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={automationType} onValueChange={(v: any) => setAutomationType(v)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="wireless">Wireless (Normal)</SelectItem>
                    <SelectItem value="wired">Wired (KNX)</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Wired Settings */}
            {automationType === 'wired' && (
              <>
                <Card className="border-white/10 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">KNX Wire Length (m)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="number"
                      value={knxWireLength}
                      onChange={(e) => setKnxWireLength(parseFloat(e.target.value) || 0)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-slate-900/50">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Additional ON/OFF Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      type="number"
                      value={additionalOnOffPoints}
                      onChange={(e) => setAdditionalOnOffPoints(parseInt(e.target.value) || 0)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  </CardContent>
                </Card>
              </>
            )}

            {/* GST & Validity */}
            <Card className="border-white/10 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-sm">GST %</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={gstPercentage}
                  onChange={(e) => setGstPercentage(parseFloat(e.target.value) || 0)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  min="0"
                  max="100"
                />
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-sm">Validity (Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="number"
                  value={validityDays}
                  onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  min="1"
                />
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card className="border-teal-500/20 bg-teal-900/10">
              <CardHeader>
                <CardTitle className="text-teal-400 text-sm">Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Items</span>
                  <span className="text-white">₹{itemsCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Automation</span>
                  <span className="text-white">₹{automationCost.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-teal-500/20 pt-2">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">GST ({gstPercentage}%)</span>
                  <span className="text-white">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-teal-500/20 pt-2">
                  <span className="text-teal-300 font-semibold">Grand Total</span>
                  <span className="text-teal-400 font-bold text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="border-white/10 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white text-sm">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="bg-slate-800/50 border-slate-700 text-white text-sm resize-none"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PI Preview Modal - Professional Invoice Template */}
      {piGenerated && showPIPreview && (
        <Dialog open={true} onOpenChange={(open) => {
          console.log('📱 Dialog onOpenChange called with:', open);
          if (!open) {
            setShowPIPreview(false);
          }
        }}>
          <DialogContent className="w-full max-w-5xl max-h-[95vh] bg-white border-slate-300 p-0 overflow-hidden flex flex-col">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 print:hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">PROFORMA INVOICE</h1>
                  <p className="text-teal-400 font-semibold">{piGenerated.pi_number}</p>
                </div>
                <div className="text-right">
                  <div className="inline-block px-4 py-2 rounded-lg bg-teal-500/20 border border-teal-500">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Status</p>
                    <p className="text-lg font-bold text-teal-400 uppercase">{piGenerated.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto bg-white px-8 py-6">
              <div className="space-y-6">
                
                {/* Invoice Details Grid */}
                <div className="grid grid-cols-4 gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Invoice Date</p>
                    <p className="text-sm font-medium text-slate-900">{new Date(piGenerated.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Automation Type</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">{piGenerated.automation_type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Validity</p>
                    <p className="text-sm font-medium text-slate-900">{piGenerated.validity_days || 30} days</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Project</p>
                    <p className="text-sm font-medium text-slate-900">{piGenerated.project_name || 'N/A'}</p>
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">Bill To</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-600">Name:</span>
                      <span className="text-slate-900">{piGenerated.client_name || 'Not provided'}</span>
                    </div>
                    <div className="flex">
                      <span className="w-32 font-semibold text-slate-600">Email:</span>
                      <span className="text-slate-900">{piGenerated.client_email || 'Not provided'}</span>
                    </div>
                    {piGenerated.client_phone && (
                      <div className="flex">
                        <span className="w-32 font-semibold text-slate-600">Phone:</span>
                        <span className="text-slate-900">{piGenerated.client_phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOQ Items Table */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-300">Bill of Quantities</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-300">
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Room</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Item Description</th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">Category</th>
                          <th className="px-4 py-3 text-center font-semibold text-slate-700 w-12">Qty</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-700 w-28">Unit Price</th>
                          <th className="px-4 py-3 text-right font-semibold text-slate-700 w-28">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {piGenerated.boq_items && Array.isArray(piGenerated.boq_items) && piGenerated.boq_items.length > 0 ? (
                          piGenerated.boq_items.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                              <td className="px-4 py-3 text-slate-700">{item.roomName || '-'}</td>
                              <td className="px-4 py-3 text-slate-900 font-medium">{item.applianceName || item.panelName || '-'}</td>
                              <td className="px-4 py-3 text-slate-600">{item.category || '-'}</td>
                              <td className="px-4 py-3 text-center text-slate-700">{item.quantity || 1}</td>
                              <td className="px-4 py-3 text-right font-medium text-slate-900">₹{(item.unitPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                              <td className="px-4 py-3 text-right font-semibold text-teal-600">₹{(item.totalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No items found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cost Summary - Right Aligned */}
                <div className="flex justify-end">
                  <div className="w-full max-w-sm">
                    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                      <div className="px-6 py-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Subtotal</span>
                          <span className="font-medium text-slate-900">₹{(piGenerated.total_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t pt-3">
                          <span className="text-slate-600">GST (18%)</span>
                          <span className="font-medium text-slate-900">₹{(piGenerated.gst_amount || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="flex justify-between border-t-2 border-teal-500 pt-3">
                          <span className="font-bold text-slate-900 uppercase">Grand Total</span>
                          <span className="text-2xl font-bold text-teal-600">₹{(piGenerated.grand_total || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms Section */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700 mb-2">Terms & Conditions:</p>
                  <p>This is a proforma invoice valid for {piGenerated.validity_days || 30} days from the date of issue. Prices are subject to change based on final project requirements and specifications.</p>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="bg-slate-50 border-t border-slate-200 px-8 py-4 flex gap-3 justify-end print:hidden">
              <Button 
                onClick={() => setShowPIPreview(false)}
                variant="outline"
                className="border-slate-300 hover:bg-slate-100"
              >
                Close
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button 
                onClick={handleDownloadHTML}
                variant="outline"
                className="border-teal-600 text-teal-600 hover:bg-teal-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Save HTML
              </Button>
              <Button 
                onClick={handleSendPI}
                disabled={piGenerated.status === 'sent'}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                {piGenerated.status === 'sent' ? 'Sent' : 'Send to Client'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Appliance Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-slate-950 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">
              ✏️ Adjust Appliance Details
            </DialogTitle>
          </DialogHeader>
          {editingAppliance && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Name (read-only)</label>
                <Input
                  value={editingAppliance.name}
                  disabled
                  className="bg-slate-800/30 border-slate-700 text-slate-500 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Category (read-only)</label>
                <Input
                  value={editingAppliance.category}
                  disabled
                  className="bg-slate-800/30 border-slate-700 text-slate-500 mt-1"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Quantity</label>
                <Input
                  type="number"
                  value={editingAppliance.quantity}
                  onChange={(e) => setEditingAppliance({ ...editingAppliance, quantity: parseInt(e.target.value) || 1 })}
                  className="bg-slate-800/50 border-slate-700 text-white mt-1"
                />
              </div>
              <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded text-sm text-blue-300">
                💡 To add more appliances, go to the Planner page and use the room editor.
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditDialog(false)} className="border-slate-700">
                  Cancel
                </Button>
                <Button onClick={handleSaveAppliance} className="bg-teal-600">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBOQGeneration;

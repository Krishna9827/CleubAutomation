'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, FileText, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { projectService } from '@/supabase/projectService';
import { DEFAULT_INVENTORY_PRICES } from '@/constants/inventory';
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
  specifications: Record<string, unknown>;
}

interface Room {
  id: string;
  name: string;
  type: string;
  automationType?: 'wireless' | 'wired';
  panels?: PanelPreset[];
  appliances: Appliance[];
}

interface PriceEntry {
  id: string;
  category: string;
  subcategory?: string;
  wattage?: number;
  productName?: string;
  pricePerUnit: number;
  vendor_tags?: string[];
}

interface BOQItem {
  id: string;
  roomName: string;
  roomId: string;
  itemType: 'appliance' | 'panel';
  applianceName?: string;
  panelName?: string;
  category: string;
  subcategory: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  panelKey?: string;
  vendorTag?: string;
  availableVendors?: { vendorTag: string; price: number; productName: string }[];
}

export default function AdminBOQGenerationPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const [projectData, setProjectData] = useState<unknown>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [boqItems, setBoqItems] = useState<BOQItem[]>([]);
  const [automationType, setAutomationType] = useState<'wired' | 'wireless'>('wireless');
  const [gstPercentage, setGstPercentage] = useState(18);
  const [loadingData, setLoadingData] = useState(true);
  const [priceData, setPriceData] = useState<PriceEntry[]>([]);

  // Check auth
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin-login');
    }
  }, [user, loading, router]);

  // Load prices from inventory table
  useEffect(() => {
    const loadInventoryPrices = async () => {
      try {
        console.log('💾 Loading inventory prices from Supabase...');
        
        const { data, error } = await supabase
          .from('inventory')
          .select('id, product_name, category, subcategory, wattage, price_per_unit, vendor_tags');

        if (error) {
          console.error('❌ Error fetching inventory prices:', error);
          return;
        }

        if (!data || data.length === 0) {
          console.warn('⚠️ No inventory items found, using defaults');
          setPriceData(DEFAULT_INVENTORY_PRICES as PriceEntry[]);
          return;
        }

        // Transform inventory data
        const inventoryPrices: PriceEntry[] = (data as { 
          id: string;
          product_name: string; 
          category: string; 
          subcategory: string | null; 
          wattage: number | null; 
          price_per_unit: number | null; 
          vendor_tags: string[] | null;
        }[]).map((item) => ({
          id: item.id,
          category: item.category,
          subcategory: item.subcategory || undefined,
          wattage: item.wattage || undefined,
          productName: item.product_name,
          pricePerUnit: parseFloat(String(item.price_per_unit) || '0'),
          vendor_tags: item.vendor_tags || [],
        }));

        console.log('💰 Loaded', inventoryPrices.length, 'inventory prices from database');
        setPriceData(inventoryPrices);
      } catch (error) {
        console.error('❌ Exception loading inventory prices:', error);
        setPriceData(DEFAULT_INVENTORY_PRICES as PriceEntry[]);
      }
    };

    loadInventoryPrices();
  }, []);

  // Load project
  useEffect(() => {
    if (!projectId || priceData.length === 0) return;

    const loadProject = async () => {
      try {
        setLoadingData(true);
        console.log('📂 Loading project:', projectId);
        const project = await projectService.getProject(projectId);
        
        if (project) {
          // Extract appliances from requirements if direct appliances are empty
          const enrichedRooms = ((project as { rooms?: Room[] }).rooms || []).map((room: Room) => {
            if (!room.appliances || room.appliances.length === 0) {
              const extractedAppliances = extractAppliancesFromRoom(room);
              return {
                ...room,
                appliances: extractedAppliances
              };
            }
            return room;
          });

          console.log('✅ Project loaded:', {
            client: (project as { client_info?: { name?: string } }).client_info?.name,
            rooms: enrichedRooms.length,
          });
          
          setProjectData(project);
          setRooms(enrichedRooms);
          generateBOQItems(enrichedRooms);
        } else {
          console.error('❌ Project not found');
          toast({
            title: 'Error',
            description: 'Project not found',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('❌ Error loading project:', error);
        toast({
          title: 'Error',
          description: 'Failed to load project data',
          variant: 'destructive',
        });
      } finally {
        setLoadingData(false);
      }
    };

    loadProject();
  }, [projectId, priceData, toast]);

  // Generate BOQ items from rooms
  const generateBOQItems = (projectRooms: Room[]) => {
    const items: BOQItem[] = [];

    projectRooms.forEach((room) => {
      // Add appliances to BOQ
      if (room.appliances && Array.isArray(room.appliances) && room.appliances.length > 0) {
        room.appliances.forEach((appliance) => {
          if (!appliance.name || !appliance.category) {
            console.warn('⚠️ Skipping appliance with missing required fields:', appliance);
            return;
          }

          let unitPrice = 500; // Default fallback price

          // Try to find exact match by linkedInventoryId first
          if ((appliance as { linkedInventoryId?: string }).linkedInventoryId) {
            const linkedItem = priceData.find((p) => p.id === (appliance as { linkedInventoryId?: string }).linkedInventoryId);
            if (linkedItem) {
              unitPrice = linkedItem.pricePerUnit;
              console.log('💰 Found appliance price via linkedInventoryId:', appliance.name, '→ ₹' + unitPrice);
            } else {
              console.warn('⚠️ LinkedInventoryId not found in priceData:', (appliance as { linkedInventoryId?: string }).linkedInventoryId);
            }
          }

          // If no linked ID or not found, try matching by category, subcategory, and wattage
          if (unitPrice === 500) {
            // First try: exact match (category + subcategory + wattage)
            let priceEntry = priceData.find(
              (p) =>
                p.category.toLowerCase() === appliance.category.toLowerCase() &&
                p.subcategory?.toLowerCase() === appliance.subcategory?.toLowerCase() &&
                p.wattage === appliance.wattage
            );

            // Second try: match category + subcategory (ignore wattage)
            if (!priceEntry) {
              priceEntry = priceData.find(
                (p) =>
                  p.category.toLowerCase() === appliance.category.toLowerCase() &&
                  p.subcategory?.toLowerCase() === appliance.subcategory?.toLowerCase()
              );
            }

            // Third try: match category only
            if (!priceEntry) {
              priceEntry = priceData.find(
                (p) => p.category.toLowerCase() === appliance.category.toLowerCase()
              );
            }

            if (priceEntry) {
              unitPrice = priceEntry.pricePerUnit;
              console.log('💰 Found price for:', appliance.name, '→', unitPrice);
            } else {
              console.warn('⚠️ No price found for appliance:', appliance.name, '- using default 500');
            }
          }

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
          });
        });
      }

      // Add panels to BOQ for wireless rooms
      if (room.automationType === 'wireless' && room.panels && Array.isArray(room.panels) && room.panels.length > 0) {
        room.panels.forEach((panel) => {
          if (!panel.name) return;

          const panelKey = `${room.id}-${panel.id}`;
          let unitPrice = 5000; // Default fallback price

          // Try to find panel price from inventory using linkedInventoryId
          if ((panel as { linkedInventoryId?: string }).linkedInventoryId) {
            const linkedItem = priceData.find((p) => p.id === (panel as { linkedInventoryId?: string }).linkedInventoryId);
            if (linkedItem) {
              unitPrice = linkedItem.pricePerUnit;
              console.log('💰 Found panel price via linkedInventoryId:', panel.name, '→ ₹' + unitPrice, '(', linkedItem.productName, ')');
            } else {
              console.warn('⚠️ Panel linkedInventoryId not found in priceData:', (panel as { linkedInventoryId?: string }).linkedInventoryId);
            }
          }

          // If no linked ID, try matching by category and subcategory
          if (unitPrice === 5000) {
            const panelSubcategory = `${panel.moduleSize}M Panel`;
            const priceEntry = priceData.find(
              (p) =>
                p.category.toLowerCase() === 'touch panels' &&
                p.subcategory?.toLowerCase() === panelSubcategory.toLowerCase()
            );

            if (priceEntry) {
              unitPrice = priceEntry.pricePerUnit;
              console.log('💰 Found panel price by category:', panel.name, '→', unitPrice);
            } else {
              console.warn('⚠️ No price found for panel:', panel.name, '- using default 5000');
            }
          }

          const totalPrice = unitPrice * 1;

          items.push({
            id: panel.id || `${room.id}-${panel.name}`,
            roomName: room.name,
            roomId: room.id,
            itemType: 'panel',
            panelName: panel.name,
            category: 'Touch Panels',
            subcategory: panel.moduleSize + 'M Panel',
            quantity: 1,
            unitPrice,
            totalPrice,
            panelKey,
          });
        });
      }
    });

    console.log('📊 BOQ items generated:', items.length, 'items');
    setBoqItems(items);
  };

  // Calculate totals
  const calculateTotals = () => {
    const itemsCost = boqItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const subtotal = itemsCost;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const grandTotal = subtotal + gstAmount;

    return { subtotal, gstAmount, grandTotal, itemsCost };
  };

  const totals = calculateTotals();

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/projects')}
            className="border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-teal-400" />
              BOQ Generation
            </h1>
            <p className="text-slate-400">
              {(projectData as { client_info?: { name?: string } } | null)?.client_info?.name || 'Untitled Project'}
            </p>
          </div>
        </div>
        <Button
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Project Info */}
      <Card className="border-white/10 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Project Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-slate-400">Rooms</div>
            <div className="text-xl font-bold text-white">{rooms.length}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Items</div>
            <div className="text-xl font-bold text-teal-400">{boqItems.length}</div>
          </div>
          <div>
            <div className="text-sm text-slate-400">Type</div>
            <Select value={automationType} onValueChange={(v) => setAutomationType(v as 'wired' | 'wireless')}>
              <SelectTrigger className="w-32 bg-slate-800 border-slate-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                <SelectItem value="wireless">Wireless</SelectItem>
                <SelectItem value="wired">Wired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-sm text-slate-400">GST %</div>
            <Input
              type="number"
              value={gstPercentage}
              onChange={(e) => setGstPercentage(Number(e.target.value))}
              className="w-20 bg-slate-800 border-slate-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* BOQ Table */}
      <Card className="border-white/10 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Bill of Quantities</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-400">Room</TableHead>
                <TableHead className="text-slate-400">Item</TableHead>
                <TableHead className="text-slate-400">Category</TableHead>
                <TableHead className="text-slate-400">Sub-category</TableHead>
                <TableHead className="text-slate-400 text-right">Qty</TableHead>
                <TableHead className="text-slate-400 text-right">Unit Price</TableHead>
                <TableHead className="text-slate-400 text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boqItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-400 py-8">
                    No items in BOQ. Add appliances to rooms first.
                  </TableCell>
                </TableRow>
              ) : (
                boqItems.map((item) => (
                  <TableRow key={item.id} className="border-slate-700">
                    <TableCell className="text-white">{item.roomName}</TableCell>
                    <TableCell className="text-white">
                      {item.itemType === 'panel' ? (
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {item.panelName}
                        </Badge>
                      ) : (
                        item.applianceName
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">{item.category}</TableCell>
                    <TableCell className="text-slate-300">{item.subcategory}</TableCell>
                    <TableCell className="text-right text-white">{item.quantity}</TableCell>
                    <TableCell className="text-right text-white">₹{item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-teal-400 font-semibold">₹{item.totalPrice.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-teal-500/20 bg-teal-900/10">
        <CardContent className="p-6">
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-semibold text-white">₹{totals.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>GST ({gstPercentage}%)</span>
                <span className="font-semibold text-white">₹{totals.gstAmount.toLocaleString()}</span>
              </div>
              <div className="h-px bg-teal-500/30" />
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-white">Grand Total</span>
                <span className="font-bold text-teal-400">₹{totals.grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

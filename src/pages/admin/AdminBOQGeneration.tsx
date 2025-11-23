import { useState, useEffect } from 'react';
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
import { DEFAULT_INVENTORY_PRICES } from '@/constants/inventory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { extractAppliancesFromRoom } from '@/utils/appliance-transformer';

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
  }, []);

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

    projectRooms.forEach((room) => {
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
    });

    console.log('📊 BOQ items generated:', items.length, 'items');
    setBoqItems(items);
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
    
    const itemsCost = boqItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const subtotal = automationCost + itemsCost;
    const gstAmount = (subtotal * gstPercentage) / 100;
    const grandTotal = subtotal + gstAmount;

    return { subtotal, gstAmount, grandTotal, automationCost, itemsCost };
  };

  // Generate PI
  const handleGeneratePI = async () => {
    if (!projectData || !projectId) {
      toast({ title: 'Error', description: 'Project data not loaded', variant: 'destructive' });
      return;
    }

    if (boqItems.length === 0) {
      toast({ title: 'Error', description: 'No appliances found', variant: 'destructive' });
      return;
    }

    if (!user?.id) return;

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
        setPiGenerated(pi);
        toast({ title: 'Success', description: `Proforma Invoice ${pi.pi_number} generated` });
      }
    } catch (error) {
      console.error('❌ Error generating PI:', error);
      toast({ title: 'Error', description: 'Failed to generate PI', variant: 'destructive' });
    } finally {
      setLoadingPI(false);
    }
  };

  const handleSendPI = async () => {
    if (!piGenerated?.id) return;

    try {
      await proformaInvoiceService.updateProformaInvoiceStatus(piGenerated.id, 'sent', notes);
      setPiGenerated({ ...piGenerated, status: 'sent' });
      toast({ title: 'Success', description: 'PI sent to client' });
    } catch (error) {
      console.error('❌ Error:', error);
      toast({ title: 'Error', description: 'Failed to send PI', variant: 'destructive' });
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
      await projectService.updateProject(projectId, { rooms: newRooms });
      
      console.log('✅ Appliance tweaks saved successfully');
      
      // Re-fetch from database to ensure sync
      const updatedProject = await projectService.getProject(projectId);
      if (updatedProject) {
        setProjectData(updatedProject);
        setRooms(updatedProject.rooms || []);
        generateBOQItems(updatedProject.rooms || []);
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
        await projectService.updateProject(projectId, { rooms: newRooms });
        
        console.log('✅ Appliance deleted successfully');
        
        // Re-fetch from database to ensure sync
        const updatedProject = await projectService.getProject(projectId);
        if (updatedProject) {
          setProjectData(updatedProject);
          setRooms(updatedProject.rooms || []);
          generateBOQItems(updatedProject.rooms || []);
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
            <Button variant="outline" onClick={() => navigate('/admin/projects')} className="border-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">BOQ & Project Details</h1>
              <p className="text-slate-400 mt-1">{projectData?.client_info?.name || 'Untitled'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/admin/projects/${projectId}/timeline`)} variant="outline" className="border-slate-700">
              <Clock className="w-4 h-4 mr-2" />
              Timeline
            </Button>
            <Button onClick={handleGeneratePI} disabled={loadingPI || boqItems.length === 0} className="bg-gradient-to-r from-teal-500 to-teal-600">
              <FileText className="w-4 h-4 mr-2" />
              Generate PI
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Appliances by Room */}
          <div className="col-span-2 space-y-4">
            <Card className="border-white/10 bg-slate-900/50">
              <CardHeader>
                <CardTitle className="text-white">Appliances by Room</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {rooms.map((room, roomIdx) => (
                  <div key={room.id} className="border border-slate-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedRoom(expandedRoom === room.id ? null : room.id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition"
                    >
                      <div className="flex items-center gap-2">
                        {expandedRoom === room.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span className="font-semibold text-white">{room.name}</span>
                        <Badge className="bg-slate-700">{room.appliances.length} items</Badge>
                      </div>
                    </button>

                    {expandedRoom === room.id && (
                      <div className="p-4 space-y-2">
                        {room.appliances.length === 0 ? (
                          <div className="p-4 text-center bg-slate-800/30 rounded text-slate-400">
                            <p className="text-sm mb-3">No appliances added yet</p>
                            <Button size="sm" onClick={() => navigate('/planner')} className="bg-teal-600 hover:bg-teal-700">
                              + Add in Planner
                            </Button>
                          </div>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
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
                        <TableHead className="text-slate-300">Appliance</TableHead>
                        <TableHead className="text-slate-300">Category</TableHead>
                        <TableHead className="text-slate-300 text-right">Qty</TableHead>
                        <TableHead className="text-slate-300 text-right">Unit Price</TableHead>
                        <TableHead className="text-slate-300 text-right">Total</TableHead>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {boqItems.map((item, idx) => (
                        <TableRow key={idx} className="border-white/10">
                          <TableCell className="text-white text-sm">{item.roomName}</TableCell>
                          <TableCell className="text-slate-300 text-sm">{item.applianceName}</TableCell>
                          <TableCell className="text-slate-300 text-sm">{item.category}</TableCell>
                          <TableCell className="text-right text-white text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-right text-teal-400 text-sm">₹{item.unitPrice.toLocaleString('en-IN')}</TableCell>
                          <TableCell className="text-right text-white font-semibold text-sm">₹{item.totalPrice.toLocaleString('en-IN')}</TableCell>
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

            {/* PI Generated */}
            {piGenerated && (
              <Card className="border-teal-500/20 bg-teal-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-teal-400">
                    <FileText className="w-5 h-5" />
                    Proforma Invoice Generated
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">PI Number</p>
                      <p className="text-lg font-bold text-white">{piGenerated.pi_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Status</p>
                      <Badge className={piGenerated.status === 'sent' ? 'bg-blue-900/30 border-blue-600 text-blue-400' : 'bg-slate-800/30'}>
                        {piGenerated.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Created</p>
                      <p className="text-white text-sm">{new Date(piGenerated.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
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

            {/* Actions */}
            {piGenerated && (
              <div className="space-y-2">
                <Button
                  onClick={handleSendPI}
                  disabled={piGenerated.status === 'sent'}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {piGenerated.status === 'sent' ? 'Sent' : 'Send to Client'}
                </Button>
                <Button variant="outline" className="w-full border-slate-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

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

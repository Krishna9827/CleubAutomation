
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, Calculator, AlertTriangle } from 'lucide-react';
import { generateCostPDF } from '@/utils/costPdfExport';
import { useToast } from '@/hooks/use-toast';

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

interface ProjectData {
  projectName: string;
  clientName: string;
  architectName: string;
  designerName: string;
  notes: string;
}

interface PriceData {
  category: string;
  subcategory?: string;
  wattage?: number;
  pricePerUnit: number;
  notes?: string;
}

interface EstimatedCostProps {
  projectData: ProjectData;
  rooms: Room[];
  onClose: () => void;
}

const EstimatedCost = ({ projectData, rooms, onClose }: EstimatedCostProps) => {
  const { toast } = useToast();
  const [priceData, setPriceData] = useState<PriceData[]>([]);

  useEffect(() => {
    const savedPrices = localStorage.getItem('inventoryPrices');
    if (savedPrices) {
      setPriceData(JSON.parse(savedPrices));
    } else {
      // Default pricing data
      const DEFAULT_INVENTORY_PRICES: PriceData[] = [
        { category: 'Lights', subcategory: 'Basic ON/OFF', wattage: 6, pricePerUnit: 150 },
        { category: 'Lights', subcategory: 'Tunable', wattage: 9, pricePerUnit: 250 },
        { category: 'Lights', subcategory: 'RGB', wattage: 12, pricePerUnit: 350 },
        { category: 'Lights', subcategory: 'RGBW', wattage: 15, pricePerUnit: 450 },
        { category: 'Fans', pricePerUnit: 2000, notes: 'Ceiling fan' },
        { category: 'HVAC', pricePerUnit: 35000, notes: 'Standard AC unit' },
        { category: 'Curtain & Blinds', pricePerUnit: 7000, notes: 'Smart Wi-Fi motor' },
        { category: 'Smart Devices', pricePerUnit: 1500, notes: 'Smart switch/sensor' },
        { category: 'Security', pricePerUnit: 3000, notes: 'Security device' }
      ];
      setPriceData(DEFAULT_INVENTORY_PRICES);
    }
  }, []);

  const getAppliancePrice = (appliance: Appliance): number => {
    const priceEntry = priceData.find(price => 
      price.category === appliance.category &&
      (price.subcategory === appliance.subcategory || !price.subcategory) &&
      (price.wattage === appliance.wattage || !price.wattage)
    );
    
    return priceEntry?.pricePerUnit || 500; // Default fallback price
  };

  const calculateRoomCost = (room: Room) => {
    return room.appliances.reduce((total, appliance) => {
      const unitPrice = getAppliancePrice(appliance);
      return total + (unitPrice * appliance.quantity);
    }, 0);
  };

  const calculateCategoryTotals = () => {
    const categoryTotals: Record<string, number> = {};
    
    rooms.forEach(room => {
      room.appliances.forEach(appliance => {
        const unitPrice = getAppliancePrice(appliance);
        const totalPrice = unitPrice * appliance.quantity;
        
        if (!categoryTotals[appliance.category]) {
          categoryTotals[appliance.category] = 0;
        }
        categoryTotals[appliance.category] += totalPrice;
      });
    });
    
    return categoryTotals;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Lights':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Fans':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'HVAC':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Smart Devices':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Curtain & Blinds':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Security':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const categoryTotals = calculateCategoryTotals();
  const grandTotal = Object.values(categoryTotals).reduce((sum, total) => sum + total, 0);

  const handleDownloadPDF = () => {
    generateCostPDF(projectData, rooms, categoryTotals, grandTotal);
    toast({
      title: "Cost Estimate Downloaded",
      description: "Your project cost estimate has been generated successfully."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calculator className="w-6 h-6 text-teal-600" />
          <h2 className="text-2xl font-bold text-slate-900">Cost Estimate</h2>
        </div>
        <Button
          onClick={handleDownloadPDF}
          className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
        >
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Grand Total */}
      <Card className="border-slate-200 bg-gradient-to-br from-teal-50 to-teal-100">
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-teal-700">₹{grandTotal.toLocaleString()}</div>
          <div className="text-teal-600 mt-2">Total Estimated Cost</div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Category-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <Badge variant="outline" className={getCategoryColor(category)}>
                  {category}
                </Badge>
                <div className="font-semibold text-slate-900">₹{total.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Room-wise Breakdown */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800">Room-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rooms.map((room, index) => (
              <div key={room.id}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{room.name}</h4>
                    <p className="text-sm text-slate-600">{room.type}</p>
                  </div>
                  <div className="font-semibold text-slate-900">
                    ₹{calculateRoomCost(room).toLocaleString()}
                  </div>
                </div>
                
                {room.appliances.length > 0 && (
                  <div className="space-y-2 ml-4">
                    {room.appliances.map((appliance) => {
                      const unitPrice = getAppliancePrice(appliance);
                      const totalPrice = unitPrice * appliance.quantity;
                      
                      return (
                        <div key={appliance.id} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded">
                          <div className="flex-1">
                            <span className="text-sm text-slate-900">{appliance.name}</span>
                            <span className="text-xs text-slate-600 ml-2">Qty: {appliance.quantity}</span>
                          </div>
                          <div className="text-right text-sm">
                            <div className="text-slate-900">₹{totalPrice.toLocaleString()}</div>
                            <div className="text-slate-600">₹{unitPrice}/unit</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {index < rooms.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm text-orange-800 font-medium">Important Disclaimer</p>
              <p className="text-sm text-orange-700 mt-1">
                This is a preliminary estimate. Final quotation may vary based on site conditions, 
                customization requirements, and current market rates.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstimatedCost;

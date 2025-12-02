
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Settings, Lightbulb, Fan, Thermometer, MoreHorizontal, Zap } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddApplianceDialog from './AddApplianceDialog';
import PanelConfigUI from './PanelConfigUI';
import { PanelPreset } from '@/types/project';

interface Appliance {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  wattage?: number;
  specifications: Record<string, any>;
  linkedInventoryId?: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
  automationType?: 'wired' | 'wireless';
  panels?: PanelPreset[];
  appliances: Appliance[];
}

interface RoomCardProps {
  room: Room;
  onUpdate: (roomId: string, room: Room) => void;
  onDelete: (roomId: string) => void;
}

const RoomCard = ({ room, onUpdate, onDelete }: RoomCardProps) => {
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [automationType, setAutomationType] = useState<'wired' | 'wireless'>(room.automationType || 'wireless');

  const addAppliance = (appliance: Omit<Appliance, 'id'>) => {
    const newAppliance: Appliance = {
      ...appliance,
      id: Date.now().toString(),
    };
    
    const updatedRoom = {
      ...room,
      appliances: [...room.appliances, newAppliance]
    };
    
    onUpdate(room.id, updatedRoom);
    setShowAddAppliance(false);
  };

  const removeAppliance = (applianceId: string) => {
    const updatedRoom = {
      ...room,
      appliances: room.appliances.filter(app => app.id !== applianceId)
    };
    onUpdate(room.id, updatedRoom);
  };

  const handleAutomationTypeChange = (type: 'wired' | 'wireless') => {
    setAutomationType(type);
    const updatedRoom = {
      ...room,
      automationType: type,
      panels: type === 'wireless' ? (room.panels || []) : []  // Clear panels if switching to wired
    };
    onUpdate(room.id, updatedRoom);
  };

  const addPanel = (panel: PanelPreset) => {
    const updatedRoom = {
      ...room,
      panels: [...(room.panels || []), panel]
    };
    onUpdate(room.id, updatedRoom);
  };

  const removePanel = (panelId: string) => {
    const updatedRoom = {
      ...room,
      panels: (room.panels || []).filter(p => p.id !== panelId)
    };
    onUpdate(room.id, updatedRoom);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Lights':
        return <Lightbulb className="w-4 h-4" />;
      case 'Fans':
        return <Fan className="w-4 h-4" />;
      case 'HVAC':
        return <Thermometer className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
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
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const appliancesByCategory = room.appliances.reduce((acc, appliance) => {
    if (!acc[appliance.category]) {
      acc[appliance.category] = [];
    }
    acc[appliance.category].push(appliance);
    return acc;
  }, {} as Record<string, Appliance[]>);

  return (
    <>
      <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                {room.name}
              </CardTitle>
              <p className="text-sm text-slate-600 mt-1">{room.type}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-slate-200">
                <DropdownMenuItem
                  onClick={() => onDelete(room.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Delete Room
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-4">
          {/* Automation Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Automation Type:</label>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAutomationTypeChange('wireless')}
                variant={automationType === 'wireless' ? 'default' : 'outline'}
                size="sm"
                className={
                  automationType === 'wireless'
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'border-slate-300 hover:border-teal-400'
                }
              >
                <Zap className="w-4 h-4 mr-2" />
                Wireless
              </Button>
              <Button
                onClick={() => handleAutomationTypeChange('wired')}
                variant={automationType === 'wired' ? 'default' : 'outline'}
                size="sm"
                className={
                  automationType === 'wired'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'border-slate-300 hover:border-blue-400'
                }
              >
                <Zap className="w-4 h-4 mr-2" />
                Wired (KNX)
              </Button>
            </div>
          </div>

          {/* Panels Section - Only for Wireless */}
          {automationType === 'wireless' && (
            <div className="border-t pt-4">
              <PanelConfigUI
                roomName={room.name}
                selectedPanels={room.panels || []}
                onAddPanel={addPanel}
                onRemovePanel={removePanel}
              />
            </div>
          )}

          {/* Room Appliances Section */}
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">Room Appliances:</h4>
            {Object.keys(appliancesByCategory).length === 0 ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 mb-3">No appliances added yet</p>
                <Button
                  onClick={() => setShowAddAppliance(true)}
                  size="sm"
                  variant="outline"
                  className="border-dashed border-slate-300 hover:border-teal-400 hover:text-teal-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Appliance
                </Button>
              </div>
            ) : (
              <>
                {Object.entries(appliancesByCategory).map(([category, appliances]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getCategoryColor(category)}`}>
                        {getCategoryIcon(category)}
                        <span className="ml-1">{category}</span>
                      </Badge>
                      <span className="text-xs text-slate-500">({appliances.length})</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {appliances.map((appliance) => (
                        <div
                          key={appliance.id}
                          className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors group/appliance"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {appliance.name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                              <span>Qty: {appliance.quantity}</span>
                              {appliance.wattage && <span>{appliance.wattage}W</span>}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAppliance(appliance.id)}
                            className="h-6 w-6 p-0 opacity-0 group-hover/appliance:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <Button
                  onClick={() => setShowAddAppliance(true)}
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed border-slate-300 hover:border-teal-400 hover:text-teal-600 mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Appliance
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <AddApplianceDialog
        open={showAddAppliance}
        onClose={() => setShowAddAppliance(false)}
        onAdd={addAppliance}
        roomName={room.name}
      />
    </>
  );
};

export default RoomCard;

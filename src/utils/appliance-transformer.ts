/**
 * Appliance Transformer Utility
 * Converts requirements.sections.items into appliances format
 * and provides utilities for working with both formats
 */

export interface ApplianceItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  quantity: number;
  wattage?: number;
  specifications: Record<string, any>;
}

export interface RequirementsItem {
  type: string;
  category: string;
  quantity: number;
  module?: string;
  voltage?: string;
  notes?: string;
  [key: string]: any;
}

export interface Section {
  id: string;
  name: string;
  items: RequirementsItem[];
}

export interface Room {
  id: string;
  name: string;
  type: string;
  appliances?: ApplianceItem[];
  requirements?: {
    sections?: Section[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Convert a requirements item to appliance format
 */
export const convertRequirementItemToAppliance = (
  item: RequirementsItem,
  roomId: string,
  sectionName: string
): ApplianceItem => {
  return {
    id: `${roomId}-${sectionName}-${item.category}-${Date.now()}`,
    name: `${item.type} (${sectionName})`,
    category: item.category,
    subcategory: item.type,
    quantity: item.quantity || 1,
    wattage: item.voltage ? parseInt(item.voltage) : undefined,
    specifications: {
      module: item.module,
      voltage: item.voltage,
      notes: item.notes,
      section: sectionName,
      source: 'requirements'
    }
  };
};

/**
 * Extract all appliances from a room (from both direct appliances and requirements)
 */
export const extractAppliancesFromRoom = (room: Room): ApplianceItem[] => {
  const appliances: ApplianceItem[] = [];

  // 1. Add direct appliances (if they exist)
  if (room.appliances && Array.isArray(room.appliances)) {
    appliances.push(...room.appliances);
  }

  // 2. Convert requirements.sections.items to appliances
  if (room.requirements?.sections && Array.isArray(room.requirements.sections)) {
    room.requirements.sections.forEach((section: Section) => {
      if (section.items && Array.isArray(section.items)) {
        section.items.forEach((item: RequirementsItem) => {
          const converted = convertRequirementItemToAppliance(item, room.id, section.name);
          appliances.push(converted);
        });
      }
    });
  }

  return appliances;
};

/**
 * Extract all appliances from all rooms
 */
export const extractAllAppliancesFromRooms = (rooms: Room[]): ApplianceItem[] => {
  return rooms.flatMap(room => extractAppliancesFromRoom(room));
};

/**
 * Get total appliance count from rooms (combining both sources)
 */
export const getTotalApplianceCount = (rooms: Room[]): number => {
  return rooms.reduce((total, room) => {
    const directCount = room.appliances?.length || 0;
    const requirementsCount = room.requirements?.sections?.reduce((sum: number, section: Section) => 
      sum + (section.items?.length || 0), 0) || 0;
    return total + directCount + requirementsCount;
  }, 0);
};

/**
 * Get appliance count for a specific room
 */
export const getRoomApplianceCount = (room: Room): number => {
  const directCount = room.appliances?.length || 0;
  const requirementsCount = room.requirements?.sections?.reduce((sum: number, section: Section) => 
    sum + (section.items?.length || 0), 0) || 0;
  return directCount + requirementsCount;
};

// Project and room management types
export interface ClientInfo {
  name: string
  email?: string
  phone?: string
  address?: string
  architectName?: string
  designerName?: string
}

export interface PropertyDetails {
  type: string
  size: number
  budget: number
  [key: string]: any
}

export interface RoomRequirements {
  curtains?: boolean
  ethernet?: boolean
  curtainMotor?: boolean
  panelChange?: boolean
  numLights?: string
  totalWattage?: string
  fanType?: string
  fanControl?: string
  acTvControl?: string
  smartLighting?: string
  smartSwitch?: boolean
  switchboardHeight?: string
  switchboardModule?: string
  controlsInSameBoard?: boolean
  notes?: string
  video?: File | null
  lightTypes?: {
    strip?: string
    cob?: string
    accent?: string
    cylinder?: string
  }
  sections?: Section[]
  [key: string]: any
}

export interface Room {
  id: string
  name: string
  type: string
  automationType?: 'wired' | 'wireless'  // NEW: Automation type for this room
  panels?: PanelPreset[]                  // NEW: Panel presets (wireless only)
  appliances: Appliance[]
  requirements?: RoomRequirements
  [key: string]: any
}

export interface PanelComponentConfig {
  type: 'on_off' | 'socket' | 'fan_speed' | 'scene_controller' | 'dimmer'
  quantity: number                      // In pairs: 1 pair = 2M
  modulesPerPair: number                // Fixed: 2M per pair
  totalModulesUsed: number              // quantity × modulesPerPair
}

export interface PanelPreset {
  id: string
  name: string                          // e.g., "6M-4S-1ST-1F"
  moduleSize: 2 | 4 | 6 | 8 | 12
  components: PanelComponentConfig[]
  totalModulesUsed: number              // Sum of all components
  isFull: boolean                       // totalModulesUsed === moduleSize
  linkedInventoryId?: string            // Reference to inventory table
  notes?: string
}

export interface Appliance {
  id: string
  name: string
  category: string
  subcategory?: string
  wattage?: number
  quantity: number
  price?: number
  specifications?: Record<string, any>
  linkedInventoryId?: string            // Link to inventory table
  [key: string]: any
}

export interface Section {
  id: string
  name: string
  items: SectionItem[]
  [key: string]: any
}

export interface SectionItem {
  id: string
  name: string
  quantity: number
  price: number
  [key: string]: any
}

export interface Project {
  id: string
  user_id?: string
  client_info: ClientInfo
  property_details: PropertyDetails
  rooms: Room[]
  sections: Section[]
  total_cost: number
  status: 'draft' | 'in-progress' | 'completed'
  last_saved_page: string
  created_at: string
  updated_at: string
}

export interface ProjectCreateData {
  client_info: ClientInfo
  property_details: PropertyDetails
  requirements?: string[]
  rooms?: Room[]
  sections?: Section[]
  total_cost?: number
  status?: 'draft' | 'in-progress' | 'completed'
  last_saved_page?: string
}

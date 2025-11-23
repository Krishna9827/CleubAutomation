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
  appliances: Appliance[]
  requirements?: RoomRequirements
  [key: string]: any
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
  panelType?: string
  moduleChannels?: number
  channelConfig?: Array<{
    channelNumber: number
    label: string
    details: string
  }>
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

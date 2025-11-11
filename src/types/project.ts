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

export interface Room {
  id: string
  name: string
  type: string
  appliances: Appliance[]
  [key: string]: any
}

export interface Appliance {
  id: string
  name: string
  category: string
  wattage?: number
  quantity: number
  price: number
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

// Inventory and product types
export interface TouchPanelChannelConfig {
  channelNumber: number
  label: string // e.g., "Light", "Fan", "TV"
  details?: string // e.g., "12W LED", "Ceiling Fan"
}

export interface PriceData {
  id: string
  category: string
  subcategory?: string
  wattage?: number
  pricePerUnit: number
  notes?: string
  // For touch panels only:
  panelType?: 'Glass' | 'Acrylic' | 'Plastic'
  moduleChannels?: number // e.g., 6, 12
  channelConfig?: TouchPanelChannelConfig[]
}

export interface NewItemForm {
  category: string
  subcategory: string
  wattage: string
  pricePerUnit: string
  notes: string
}

export interface InventoryItem {
  id: string
  category: string
  subcategory?: string
  wattage?: number
  price_per_unit: number
  notes?: string
  created_at: string
  updated_at: string
}

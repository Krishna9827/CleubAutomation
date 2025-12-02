// Panel module system constants
// Each component type occupies a fixed number of MODULE PAIRS
// 1 Pair = 2 Module space on panel

export const PANEL_SIZES = [2, 4, 6, 8, 12] as const

export const PANEL_COMPONENT_TYPES = {
  on_off: {
    id: 'on_off',
    name: 'On/Off Switch',
    modulesPerPair: 2,           // Each pair takes 2M space
    description: 'Single position switch control'
  },
  socket: {
    id: 'socket',
    name: 'Socket',
    modulesPerPair: 2,           // Each pair takes 2M space
    description: 'Power socket outlet'
  },
  fan_speed: {
    id: 'fan_speed',
    name: 'Fan Speed Control',
    modulesPerPair: 2,           // Each pair takes 2M space
    description: 'Variable speed fan controller'
  },
  scene_controller: {
    id: 'scene_controller',
    name: 'Scene Controller',
    modulesPerPair: 2,           // 4 buttons (1 pair) = 2M space
    description: '4 programmable scene buttons'
  },
  dimmer: {
    id: 'dimmer',
    name: 'Dimmer (Phase Cut)',
    modulesPerPair: 2,           // Each pair takes 2M space
    description: 'Brightness/phase cut dimmer'
  }
} as const

/**
 * Calculate total modules used for panel components
 * Each component is paired (2M per pair)
 * @param components Array of component configs
 * @returns Total modules used
 */
export const calculatePanelModulesUsed = (components: Array<{quantity: number, modulesPerPair: number}>): number => {
  return components.reduce((sum, comp) => sum + (comp.quantity * comp.modulesPerPair), 0)
}

/**
 * Check if panel configuration is valid
 * @param moduleSize Panel size (2, 4, 6, 8, 12)
 * @param totalModulesUsed Total modules used by components
 * @returns true if valid (must be even and <= moduleSize)
 */
export const isPanelConfigValid = (moduleSize: number, totalModulesUsed: number): boolean => {
  return totalModulesUsed % 2 === 0 && totalModulesUsed <= moduleSize
}

/**
 * Check if panel is at full capacity
 * @param moduleSize Panel size
 * @param totalModulesUsed Total modules used
 * @returns true if panel is completely full
 */
export const isPanelFull = (moduleSize: number, totalModulesUsed: number): boolean => {
  return totalModulesUsed === moduleSize
}

/**
 * Generate panel preset name from configuration
 * Format: [Size]M-[Components]
 * Example: "6M-4S-1ST-1F" (6 Module, 4 Switches, 1 Socket, 1 Fan)
 * @param moduleSize Panel size
 * @param components Component configs with types and quantities
 * @returns Generated panel name
 */
export const generatePanelName = (
  moduleSize: number,
  components: Array<{type: string, quantity: number}>
): string => {
  const sizeStr = `${moduleSize}M`
  const compStr = components
    .filter(c => c.quantity > 0)
    .map(c => {
      const abbrev = getPanelComponentAbbreviation(c.type)
      return c.quantity > 1 ? `${c.quantity}${abbrev}` : abbrev
    })
    .join('-')
  
  return compStr ? `${sizeStr}-${compStr}` : sizeStr
}

/**
 * Get abbreviation for component type
 * Used in panel naming convention
 */
export const getPanelComponentAbbreviation = (type: string): string => {
  const abbreviations: Record<string, string> = {
    on_off: 'S',              // Switch
    socket: 'ST',             // Socket
    fan_speed: 'F',           // Fan
    scene_controller: 'SC',   // Scene Controller
    dimmer: 'D'               // Dimmer
  }
  return abbreviations[type] || ''
}

/**
 * Get component type from abbreviation
 * Reverse lookup for panel name parsing
 */
export const getComponentTypeFromAbbreviation = (abbrev: string): string | null => {
  const typeMap: Record<string, string> = {
    'S': 'on_off',
    'ST': 'socket',
    'F': 'fan_speed',
    'SC': 'scene_controller',
    'D': 'dimmer'
  }
  return typeMap[abbrev] || null
}

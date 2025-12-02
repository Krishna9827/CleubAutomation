import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertCircle, Check, X } from 'lucide-react'
import { panelService } from '@/supabase/panelService'
import { PanelPreset } from '@/types/project'

interface PanelConfigUIProps {
  roomName: string
  selectedPanels: PanelPreset[]
  onAddPanel: (panel: PanelPreset) => void
  onRemovePanel: (panelId: string) => void
}

const PanelConfigUI = ({ roomName, selectedPanels, onAddPanel, onRemovePanel }: PanelConfigUIProps) => {
  const [availablePanels, setAvailablePanels] = useState<PanelPreset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPanels = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('📋 Loading panel presets for room:', roomName)
        
        const panels = await panelService.getAllPanelPresets()
        
        if (panels.length === 0) {
          setError('No panel presets available. Please create presets in Admin Panel.')
          setAvailablePanels([])
        } else {
          setAvailablePanels(panels)
          console.log('✅ Loaded', panels.length, 'panel presets')
        }
      } catch (err: any) {
        console.error('❌ Error loading panel presets:', err)
        setError('Failed to load panel presets')
      } finally {
        setLoading(false)
      }
    }

    loadPanels()
  }, [roomName])

  const isAlreadySelected = (panelId: string): boolean => {
    return selectedPanels.some(p => p.id === panelId)
  }

  const renderComponentSummary = (panel: PanelPreset): string => {
    return panel.components
      .filter(c => c.quantity > 0)
      .map(c => {
        // Component module logic:
        // 1-2 units = 2 modules
        // 3-4 units = 4 modules
        // 5-6 units = 6 modules
        // 7-8 units = 8 modules
        // Formula: modulesUsed = 2 * ceil(quantity / 2)
        const modulesUsed = 2 * Math.ceil(c.quantity / 2);
        
        const names: Record<string, string> = {
          on_off: 'Switch',
          socket: 'Socket',
          fan_speed: 'Fan',
          scene_controller: 'Scene',
          dimmer: 'Dimmer'
        };
        const name = names[c.type] || c.type;
        
        // Display as "X units (YM)" format
        const unitLabel = c.quantity > 1 ? `${c.quantity} ${name}s` : `1 ${name}`;
        return `${unitLabel} (${modulesUsed}M)`;
      })
      .join(' • ');
  };

  if (loading) {
    return (
      <Card className="border-slate-700 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-teal-400">Panel Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
            <span className="ml-3 text-slate-400">Loading panel presets...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-700 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-teal-400">Panel Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-700/30 rounded text-red-300">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Selected Panels */}
        {selectedPanels.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-white">Selected Panels:</h4>
            <div className="space-y-2">
              {selectedPanels.map(panel => (
                <div
                  key={panel.id}
                  className="flex items-center justify-between p-3 bg-teal-900/20 border border-teal-700/30 rounded"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-white">{panel.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{renderComponentSummary(panel)}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="border-teal-600 bg-teal-900/30">
                        {panel.moduleSize}M
                      </Badge>
                      {panel.isFull && (
                        <Badge className="bg-green-900/30 border-green-600 text-green-400">
                          <Check className="w-3 h-3 mr-1" />
                          Full
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRemovePanel(panel.id)}
                    className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Presets */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-white">Available Presets:</h4>
          <ScrollArea className="h-auto max-h-64 rounded border border-slate-700 bg-slate-800/30 p-3 space-y-2">
            {availablePanels.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-sm">No panel presets available</p>
              </div>
            ) : (
              availablePanels.map(panel => (
                <div
                  key={panel.id}
                  className="flex items-center justify-between p-2 bg-slate-700/50 rounded hover:bg-slate-700 transition"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{panel.name}</p>
                    <p className="text-xs text-slate-400 truncate">{renderComponentSummary(panel)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <Badge variant="outline" className="border-slate-600 text-xs">
                      {panel.moduleSize}M
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAddPanel(panel)}
                      disabled={isAlreadySelected(panel.id)}
                      className={
                        isAlreadySelected(panel.id)
                          ? 'text-slate-500 cursor-not-allowed'
                          : 'text-teal-400 hover:text-teal-300 hover:bg-teal-900/20'
                      }
                    >
                      {isAlreadySelected(panel.id) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">+ Add</span>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Info */}
        <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded text-xs text-blue-300">
          <p>
            💡 <strong>Tip:</strong> Panel presets are created by admins. Each preset shows the module size and configured components.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PanelConfigUI

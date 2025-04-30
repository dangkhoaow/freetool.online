'use client'

import React, { useState, useEffect } from 'react'
import { 
  History, 
  RotateCcw, 
  Clock, 
  Calendar, 
  Check, 
  XIcon,
  Info,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card'
import { format, formatDistance } from 'date-fns'
import { useDesignStudio } from '@/lib/services/browser-design-studio/store-provider'
import { useVectorStore } from '@/lib/services/browser-design-studio/stores/vector-store'
import { useRasterStore } from '@/lib/services/browser-design-studio/stores/raster-store'
import { useTextStore } from '@/lib/services/browser-design-studio/stores/text-store'

interface VersionHistoryEntry {
  id: string
  name: string
  description: string
  timestamp: Date
  thumbnail?: string
  isAutosave: boolean
  metadata: {
    vectorPathCount: number
    rasterLayerCount: number
    textNodeCount: number
    dimensions: {
      width: number
      height: number
    }
  }
}

export default function VersionHistoryPanel() {
  const { documentName } = useDesignStudio()
  const [versions, setVersions] = useState<VersionHistoryEntry[]>([])
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false)
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [versionName, setVersionName] = useState('')
  const [versionDescription, setVersionDescription] = useState('')
  const [isSaveVersionDialogOpen, setIsSaveVersionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load version history
  useEffect(() => {
    loadVersionHistory()
  }, [])

  // Load version history from IndexedDB
  const loadVersionHistory = async () => {
    try {
      setIsLoading(true)
      
      // Simulate loading with a timeout
      setTimeout(() => {
        // Mock data for demo
        const mockVersions: VersionHistoryEntry[] = [
          {
            id: 'version1',
            name: 'Initial Design',
            description: 'First version with basic layout',
            timestamp: new Date(Date.now() - 172800000), // 2 days ago
            isAutosave: false,
            metadata: {
              vectorPathCount: 12,
              rasterLayerCount: 3,
              textNodeCount: 4,
              dimensions: { width: 1200, height: 800 }
            }
          },
          {
            id: 'version2',
            name: 'Auto-save',
            description: 'Automatic save',
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            isAutosave: true,
            metadata: {
              vectorPathCount: 15,
              rasterLayerCount: 4,
              textNodeCount: 6,
              dimensions: { width: 1200, height: 800 }
            }
          },
          {
            id: 'version3',
            name: 'Color Adjustments',
            description: 'Updated color scheme and added new elements',
            timestamp: new Date(Date.now() - 43200000), // 12 hours ago
            isAutosave: false,
            metadata: {
              vectorPathCount: 18,
              rasterLayerCount: 5,
              textNodeCount: 7,
              dimensions: { width: 1200, height: 800 }
            }
          },
          {
            id: 'version4',
            name: 'Current Version',
            description: 'Current state of the design',
            timestamp: new Date(),
            isAutosave: false,
            metadata: {
              vectorPathCount: 22,
              rasterLayerCount: 6,
              textNodeCount: 8,
              dimensions: { width: 1200, height: 800 }
            }
          }
        ]
        
        setVersions(mockVersions)
        setActiveVersionId('version4') // Set the current version as active
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error loading version history:', error)
      setIsLoading(false)
    }
  }

  // Save a new version
  const saveVersion = async () => {
    try {
      setIsLoading(true)
      
      // Simulate saving with a timeout
      setTimeout(() => {
        // Mock saving a new version
        const newVersion: VersionHistoryEntry = {
          id: `version${Date.now()}`,
          name: versionName,
          description: versionDescription,
          timestamp: new Date(),
          isAutosave: false,
          metadata: {
            vectorPathCount: 25,
            rasterLayerCount: 7,
            textNodeCount: 8,
            dimensions: { width: 1200, height: 800 }
          }
        }
        
        setVersions(prev => [newVersion, ...prev])
        setActiveVersionId(newVersion.id)
        setVersionName('')
        setVersionDescription('')
        setIsSaveVersionDialogOpen(false)
        setIsLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error saving version:', error)
      setIsLoading(false)
    }
  }

  // Restore a version
  const restoreVersion = async () => {
    if (!selectedVersionId) return
    
    try {
      setIsLoading(true)
      
      // Simulate restoration with a timeout
      setTimeout(() => {
        // In a real implementation, you would load the stored state from IndexedDB
        // and update the stores with the historical data
        
        // For now, we'll just update the active version ID
        setActiveVersionId(selectedVersionId)
        setIsRestoreDialogOpen(false)
        setSelectedVersionId(null)
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error restoring version:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <History className="h-5 w-5 mr-2 text-rose-600" />
          Version History
        </h3>
        
        <div className="flex items-center space-x-2">
          <Dialog open={isSaveVersionDialogOpen} onOpenChange={setIsSaveVersionDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Save Current Version</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Version</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="version-name">Version Name</Label>
                  <Input
                    id="version-name"
                    placeholder="e.g., Final Draft"
                    value={versionName}
                    onChange={(e) => setVersionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version-description">Description (optional)</Label>
                  <Input
                    id="version-description"
                    placeholder="Describe what changed in this version"
                    value={versionDescription}
                    onChange={(e) => setVersionDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsSaveVersionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveVersion}
                  disabled={!versionName.trim() || isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Version'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading && versions.length === 0 ? (
        <div className="flex justify-center py-8">
          <div className="text-center">
            <Clock className="h-10 w-10 mb-2 text-gray-400 mx-auto animate-pulse" />
            <p className="text-gray-500">Loading version history...</p>
          </div>
        </div>
      ) : versions.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-6 text-center">
          <History className="h-10 w-10 mb-2 text-gray-400 mx-auto" />
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">No versions yet</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Save your first version to keep track of changes and restore previous states if needed.
          </p>
          <Button
            onClick={() => setIsSaveVersionDialogOpen(true)}
          >
            Save Current State
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {versions.map((version) => (
              <Card 
                key={version.id} 
                className={`transition-all ${
                  activeVersionId === version.id 
                    ? 'border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20' 
                    : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base flex items-center">
                        {version.name}
                        {version.isAutosave && (
                          <Badge variant="outline" className="ml-2 text-xs">Auto-save</Badge>
                        )}
                        {activeVersionId === version.id && (
                          <Badge className="ml-2 text-xs bg-rose-500">Current</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(version.timestamp, 'MMM d, yyyy h:mm a')}
                          <span className="mx-1">•</span>
                          {formatDistance(version.timestamp, new Date(), { addSuffix: true })}
                        </div>
                      </CardDescription>
                    </div>
                    
                    {activeVersionId !== version.id && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedVersionId(version.id)
                          setIsRestoreDialogOpen(true)
                        }}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Restore
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="py-2">
                  {version.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {version.description}
                    </p>
                  )}
                  
                  <div className="flex space-x-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <span className="font-medium">{version.metadata.vectorPathCount}</span>
                      <span className="ml-1">vectors</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{version.metadata.rasterLayerCount}</span>
                      <span className="ml-1">layers</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">{version.metadata.textNodeCount}</span>
                      <span className="ml-1">texts</span>
                    </div>
                  </div>
                </CardContent>
                
                {version.thumbnail && (
                  <div className="px-6 pb-4">
                    <div 
                      className="aspect-video bg-white rounded-md overflow-hidden border"
                      style={{ backgroundImage: `url(${version.thumbnail})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {/* Restore confirmation dialog */}
      <Dialog 
        open={isRestoreDialogOpen} 
        onOpenChange={setIsRestoreDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4">
              <div className="flex">
                <Info className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Restoring a previous version will replace your current design. Consider saving your current state before proceeding.
                </p>
              </div>
            </div>
            
            {selectedVersionId && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Version to restore:</h4>
                    <p className="text-sm text-gray-500">
                      {versions.find(v => v.id === selectedVersionId)?.name || 'Selected Version'}
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium">Current version:</h4>
                    <p className="text-sm text-gray-500">
                      {versions.find(v => v.id === activeVersionId)?.name || 'Current Version'}
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Are you sure you want to restore this version? Your current design will be replaced with the selected version.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsRestoreDialogOpen(false)
                setSelectedVersionId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={restoreVersion}
              disabled={!selectedVersionId || isLoading}
            >
              {isLoading ? 'Restoring...' : 'Restore Version'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
